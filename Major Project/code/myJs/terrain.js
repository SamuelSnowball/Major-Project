
function Terrain(){
	
	// A 2D array storing stacked perlin noise height values, later assigned to quadrantVertices height coordinate.
	var heightMap;
	
	// The row and column size (number of vertices) of each quadrant
	var quadrantRowSize = 128;
	var quadrantColumnSize = 128;
	
	// How many map quadrants, each having 128*128 vertices each, get from the UI
	var numberQuadrantRows = myGUI.get.ui_terrain_size; 
	var numberQuadrantColumns = myGUI.get.ui_terrain_size; 
	
	// Contains entire map size, not individual quadrant size, needed for heightMap
	var terrainRows = numberQuadrantRows * quadrantRowSize;
	var terrainColumns = numberQuadrantColumns * quadrantColumnSize;
	
	// Contains all quadrant VAO objects, each VAO contains a quadrants: vertices, normals, uvs and indices
	var terrainVAOs = [];
	
	// VBOs for each quadrant, they get stored in the main terrain VAO, just above
	var quadrantVertexBuffer;
	var quadrantIndicesBuffer;
	var quadrantUvBuffer;
	var quadrantNormalBuffer;
	
	// Data for the current quadrant, this data gets stored in the quadrants VBOs
	var quadrantVertices = []; 
	var quadrantNormals = [];
	var quadrantUvs = [];
	var quadrantIndices = [];
	
	// New
	var quadrantFloorVerticesLength = 0;

	// Contains corner indices of the VAO array
	var cornerIndices = []; 
	
	// Contains edge indices of the VAO array
	var leftEdgeIndices = []; 
	var rightEdgeIndices = []; 
	var topEdgeIndices = []; 
	var bottomEdgeIndices = []; 
	
	// Final set of indices to render
	var renderIndices = []; 
	
	//Needed in rockGenerator, careful might be quadrantRows
	this.get = {
		get getTerrainRows(){
			return terrainRows;
		},
		get getNumberQuadrantRows(){
			return numberQuadrantRows;
		},
		get getNumberQuadrantColumns(){
			return numberQuadrantColumns;
		},
		get getQuadrantRowSize(){
			return quadrantRowSize;
		},
		get getRenderIndices(){
			return renderIndices; // rocks needs these
		}
	};

	/*
	The collision class needs to find a heightMap value, given a X and Z,
	so it can move the camera to the nearest vertex height.
	
	But heightMap is private, so create a getter and setter method to do this.
	This will not actually change any heightMap values, just finds the value at a index.
	*/
	var temporaryHeightMapX;
	var temporaryHeightMapZ;
	this.heightMapValueAtIndex = {
		set setTemporaryHeightMapX(name){
			temporaryHeightMapX = name;
		},
		set setTemporaryHeightMapZ(name){
			temporaryHeightMapZ = name;
		},
		get getTemporaryHeightMapValue(){
			if(temporaryHeightMapZ > 0 && temporaryHeightMapZ < terrainRows
			&& temporaryHeightMapX > 0 && temporaryHeightMapX < terrainRows){
				return heightMap[temporaryHeightMapZ][temporaryHeightMapX];
			}
			else{
				return 0;
			}
		}
	}
	
	/*
	#################
	Constructor below
	#################
	*/
		// Create, fill and edit heightMap data
		createHeightMap();
		fillHeightMap();
		// Use that heightMap data to create vertices 
		buildAllTerrainData();
		setupVaoIndices();
		
		setupMapBoundariesData();
	/*
	#################
	Constructor above
	#################
	*/
	
	
	/*
	Loops over each quadrant
	
	For each map quadrant, create its data, and a VAO, store that VAO in the terrainVAOs array.
	*/
	function buildAllTerrainData(){
		
		for(var x=0; x<numberQuadrantRows; x++){
			for(var z=0; z<numberQuadrantColumns; z++){	
				// Create and bind a VAO, for holding our VBO data
				var tempVAO = vao_ext.createVertexArrayOES();  
				vao_ext.bindVertexArrayOES(tempVAO); 
				
				// When a VAO is created all attrib locations are disabled by default
				// So need to enable them for each VAO
				gl.enableVertexAttribArray(positionAttribLocation);
				gl.enableVertexAttribArray(textureCoordLocation);
				gl.enableVertexAttribArray(normalAttribLocation);
						
				// Reset current quadrant data (if any), and create new quadrant data
				createQuadrantVertices(x, z);
				createQuadrantIndices();
				createQuadrantUvs(x, z);
				createQuadrantNormals();
				
				// @Test
				if(useTests) test_createQuadrantVertices();
				if(useTests) test_createQuadrantIndices();
				if(useTests) test_createQuadrantUvs();
				if(useTests) test_createQuadrantNormals();
				
				// Then put data in VBOs, and bind those VBOs to VAO
				setupQuadrantVertexBuffer();
				setupQuadrantIndiciesBuffer();
				setupQuadrantUvBuffer();
				setupQuadrantNormalBuffer();
				
				// @Test
				if(useTests) test_setupQuadrantBuffers();
				
				// Add current VAO to terrainVAOs array, this saves our data in the VAO
				terrainVAOs.push(tempVAO);
				vao_ext.bindVertexArrayOES(null); 
			}
		}
		// @Test
		if(useTests) test_terrainVAOs();
	}

	/*
	####################################
	heightMap creation and filling below
	####################################
	*/
	
		/*
		Private
		
		Create the 2D heightMap array:
			heightMap[terrainRows][terrainColumns];
		*/
		function createHeightMap(){
			heightMap = new Array(terrainRows).fill(0); 
			for(var i=0; i<terrainRows; i++){
				heightMap[i] = new Array(terrainColumns).fill(0);
			}
			
			// @Test
			if(useTests) test_createHeightMap();
		}
		
		/*
		Private
		
		Takes in a coordinate in 2D heightMap array, loops over specified number of octaves,
		adds noise octaves onto each other, returns final the height value for the vertex
		*/
		function stackNoise(x, y, numOctaves){
			var v = 0;
			var amplitude = 1;
			var frequency = 1;
			var noiseTotal = 0;
			
			for(var i=0; i<numOctaves; i++){
				v += perlin.noise(x * amplitude, y * amplitude, x * amplitude) * frequency;
				noiseTotal += frequency;
				amplitude *= 0.5;
				frequency *= 2.0;
			}
			
			return v / noiseTotal;
		}
		
		/*
		Private
		
		Fills the 2D HeightMap with initial values
		*/
		function fillHeightMap(){
			var error = false;
			var xOff = 0;
			var yOff = 0;
			var offsetIncrement;
			var scale;
			
			//Does for entire map
			for(var x=0; x<terrainRows; x++){
				for(var y=0; y<terrainRows; y++){
				
					// Retrieve octaves and scale values from GUI
					var stacked = stackNoise(x, y, myGUI.get.ui_noise_octaves);
					heightMap[x][y] = stacked * myGUI.get.ui_noise_scale;

					// Set terrain outside map boundaries as high
					if(x < terrainRows/numberQuadrantRows && y < terrainRows){
						var stacked = stackNoise(x,y,8);
						heightMap[x][y] = stacked * 50;					
					}
					// Right row out of bounds section
					else if(x > terrainRows-quadrantRowSize && y < terrainRows){
						var stacked = stackNoise(x,y,8);
						heightMap[x][y] = stacked * 50;	
					}
					else if(y < terrainRows/numberQuadrantRows && x < terrainRows){
						var stacked = stackNoise(x,y,8);
						heightMap[x][y] = stacked * 50;						
					}
					else if(y > terrainRows-quadrantRowSize && x < terrainRows){
						var stacked = stackNoise(x,y,8);
						heightMap[x][y] = stacked * 50;						
					}					
					
					// @Test
					if(useTests) test_fillHeightMap(heightMap[x][y]);
				}
				xOff = 0;
				yOff += offsetIncrement;
			}
			xOff = 0;
			yOff = 0;
		}
	
	/*
	####################################
	heightMap creation and filling above
	####################################
	*/
	
	
	/*
	#######################
	Quadrant:
		vertices, indices,
		uvs, normals below
	#######################
	*/
	
		/*
		Private
		
		I have a 2D heightMap

		Now create the terrain vertices having x, y, z values 
		Where y is the value from the heightMap we made.
		*/
		function createQuadrantVertices(vaoXPosition, vaoZPosition){
		
		
			// Clear old quadrantVertices, need to generate a new set
			quadrantVertices = [];

			/*
			Work out what position we should start from (quadrant start boundaries)
			
			Transform from current quadrant index, to start position for vertex generation
				Example: 
					vaoXPosition = 3, vaoZPosition = 0;
					3 * 128 (quadrant size) = X vertex generate start position (then -1)
					0 * 128 (quadrant size) = Z vertex generate start position (then -1)
				
				Example: vaoXPosition = 1, vaoZPosition = 1;
					Start at 127, 127
			
			Need to - 1, as it returns multiple of 128, but we're starting from 0.
			
			If vaoXPosition/vaoZPosition is 0, then don't -1, as it will become [-1][-1]
			*/
			var terrainX = vaoXPosition * (quadrantRowSize-1);
			var terrainZ = vaoZPosition * (quadrantColumnSize-1);
			var startX = terrainX; // To reset the terrainX

			// Always make quadrantRowSize * quadColumnSize (128*128) number of vertices
			for(var x = 0; x < quadrantRowSize; x++){
				for(var z = 0; z < quadrantColumnSize; z++){
					quadrantVertices.push(terrainX); 
					quadrantVertices.push(heightMap[terrainX][terrainZ]);
					quadrantVertices.push(terrainZ); 
					//Move along in the row
					terrainX += 1;
				}
				terrainX = startX; // Reset the terrainX to what it started on
				terrainZ += 1; // Increment Z
			}
			
			// Need to save the length of the vertices for rendering, because the actual vertices get reset
			quadrantFloorVerticesLength = quadrantVertices.length;
		}
		

		/*
		Private
		
		Creates the quadrantIndices from the vertices
		
		Code from: http://stackoverflow.com/questions/5915753/generate-a-plane-with-triangle-strips
		Answer with 11 upvotes
		*/
		function createQuadrantIndices(){
			// Reset current indices
			quadrantIndices = new Array( (quadrantVertices.length/3) * 2 ); // i think 64 verts = 124 indices
			
			var i = 0;
			for (var r = 0; r < quadrantRowSize - 1; ++r) {
				quadrantIndices[i++] = r * quadrantColumnSize ;
				for (var c = 0; c < quadrantColumnSize ; ++c) {
					quadrantIndices[i++] = r * quadrantColumnSize + c;
					quadrantIndices[i++] = (r + 1) * quadrantColumnSize  + c;
				}
				quadrantIndices[i++] = (r + 1) * quadrantColumnSize  + (quadrantColumnSize- 1);
			}
		}

		/*
		Private
		
		Creates the quadrants UV coordinates
		*/
		function createQuadrantUvs(x, z){
		
			// Reset current UVs
			quadrantUvs = [];
			
			// Set the start position for the UV coordinates
			var xUV = 0;
			var yUV = 0;
			
			// 0 -> 1 UV each quadrant ?
			// means all quadrants have same texture?
			// or, base the texture on camera quadrant
			// requires if check in render loop

			// How much to increment UV coordinates by each loop
			var incrementSize = 1 / quadrantRowSize; 
		
			// These should loop, quadRowSize * quadColumnSize (128*128) number of times
			for(var x=0; x<quadrantRowSize; x++){
				for(var y=0; y<quadrantRowSize; y++){
					quadrantUvs.push(xUV);  
					quadrantUvs.push(yUV); 
					xUV += incrementSize;
				}
				xUV = 0;
				yUV += incrementSize;
			}
		}
		
		/*
		Private
		
		Calculate the normals for every vertex, using surrounding vertices to do this
		It calculates it from a 1D array of vertices, so the indexing is slightly confusing
		
		Could have this in an existing loop for efficiency, but only worked out once, so its ok
		*/
		function createQuadrantNormals(){
			
			//Reset current normals
			quadrantNormals = [];
			
			/*
			This loop can start from 0, because our vertices also get reset.
			*/
			for(var i=0; i<quadrantVertices.length; i+=3){
				quadrantNormals.push(1); // x
				quadrantNormals.push(1); // y
				quadrantNormals.push(1); // z
			}
		}
	
	/*
	#######################
	Quadrant:
		vertices, indices,
		uvs, normals above
	#######################
	*/
		
		
	/*
	#################
	Buffer code below
	#################
	*/
	
		/*
		Private, called from setupTerrainBuffers
		*/
		function setupQuadrantVertexBuffer(){
			quadrantVertexBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, quadrantVertexBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(quadrantVertices), gl.DYNAMIC_DRAW);
			gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, false, 0, 0);	
		}
		
		/*
		Private
		
		Adds the current quadrant indices to the quadrantIndices VBO
		*/
		function setupQuadrantIndiciesBuffer(){
			quadrantIndicesBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, quadrantIndicesBuffer);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(quadrantIndices), gl.DYNAMIC_DRAW);		
		}
		
		/*
		Private, called from setupTerrainBuffers
		
		Every texture goes from 0 -> 1, regardless of dimensions

		GL has 32 texture registers, we're using TEXTURE0
		Bind the previously loaded texture to that register
		Set the sampler in the shader to use that texture
		*/
		function setupQuadrantUvBuffer(){
			quadrantUvBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, quadrantUvBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(quadrantUvs), gl.DYNAMIC_DRAW);
			gl.vertexAttribPointer(textureCoordLocation, 2, gl.FLOAT, false, 0, 0);	
		}
		
		/*
		Private, called from setupTerrainBuffers
		*/
		function setupQuadrantNormalBuffer(){
			quadrantNormalBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, quadrantNormalBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(quadrantNormals), gl.DYNAMIC_DRAW);
			gl.vertexAttribPointer(normalAttribLocation, 3, gl.FLOAT, false, 0, 0);				
		}
		
	/*
	#################
	Buffer code above
	#################
	*/
	
	
	/*
	##########################
	VAO index processing below 
	##########################
	*/
		
		/*
		Private
		
		Find out what indices the corner and edge quadrants are at
		Add theses indices to cornerIndices and all edgeIndices arrays
			
		If camera in corner we have 4 indices to process and render
		If camera in edge we have 6 indices to process and render
		If camera in regular cell we have 9 indices to process and render
		
		How to calculate if on edge cell, corner cell or normal cell?
			Base it off numberQuadrantRows * numberQuadrantColumns
		
		Take 4x4 cells (0->15 index) for example:
		
			[0, 4,  8, 12]
			[1, 5,  9, 13]
			[2, 6, 10, 14]
			[3, 7, 11, 15]
		
			Need to work out the corners
				take (4-4) // 0 index of 1st corner
				take (4x4) - 1 // 15 index of 2nd corner
				take (4) - 1 // 3 index of 3rd corner
				take (4) * 3 // 12 index of 4th corner
			
			First 2 Edges of map
				any multiple of 4 is an edge element // 0, 4, 8, 12
				any number up to 4 is an edge element // 0, 1, 2, 3
				add these values to 'edges' array, IF it isn't in corners array, else its a corner
			
			2 opposite edges 
				take the last multiple of 4, and add (4-1) values onto it, they're all edges // 12, 13, 14, 15
				take number up to (4-1), add the number (4) and then -1 from it. // 3, 7, 11, 15
				add these values to 'edges' array, IF it isn't in corners array, else its a corner
			
			Else, they're in a centre cell, so render a 3x3 grid
		*/
		function setupVaoIndices(){
			//Corners
			cornerIndices.push( numberQuadrantRows - numberQuadrantColumns );
			cornerIndices.push( (numberQuadrantRows * numberQuadrantColumns) - 1);
			cornerIndices.push( numberQuadrantRows - 1 );
			cornerIndices.push( numberQuadrantRows * (numberQuadrantColumns-1) );
		
			// Top edge
			for(var e=0; e<numberQuadrantRows*numberQuadrantColumns; e+=numberQuadrantRows){
				// If value is corner, don't add to edges
				if(!cornerIndices.includes(e)){
					topEdgeIndices.push(e);
				}
			}
			// Left edge
			for(var e=0; e<numberQuadrantRows; e++){
				// If value is corner, don't add to edges
				if(!cornerIndices.includes(e)){
					leftEdgeIndices.push(e);
				}
			}	
			// Bottom edge
			for(var e = numberQuadrantRows-1; e<(numberQuadrantRows*numberQuadrantColumns)-1; e+=numberQuadrantRows){
				// If value is corner, don't add to edges
				if(!cornerIndices.includes(e)){
					bottomEdgeIndices.push(e);
				}
			}	
			// Right edge
			for(var e = (numberQuadrantRows*numberQuadrantColumns)-numberQuadrantRows; e<(numberQuadrantRows*numberQuadrantColumns)-1; e++){
				// If value is corner, don't add to edges
				if(!cornerIndices.includes(e)){
					rightEdgeIndices.push(e);
				}
			}		
		}
		
		/*
		Private
		
		camera is in a corner, create indices appropriately
		
		Need to check what corner they're in to calculate renderIndices properly
		4 different indices orders, depending on what corner they're in!	
		*/
		function setupIndicesCornerCells(){
			if(camera.get.quadrant === cornerIndices[0]){
				// Top left
				renderIndices.push(
					camera.get.quadrant, camera.get.quadrant+numberQuadrantRows, 
					camera.get.quadrant+1, camera.get.quadrant+numberQuadrantRows+1
				);
			}
			else if(camera.get.quadrant === cornerIndices[1]){
				// Bottom right
				renderIndices.push(
					camera.get.quadrant-numberQuadrantRows-1, camera.get.quadrant-1, 
					camera.get.quadrant-numberQuadrantRows, camera.get.quadrant 				
				);			
			}
			else if(camera.get.quadrant === cornerIndices[2]){
				// Bottom left
				renderIndices.push(
					camera.get.quadrant-1, camera.get.quadrant+numberQuadrantRows-1, 
					camera.get.quadrant, camera.get.quadrant+numberQuadrantRows					
				);			
			}
			else if(camera.get.quadrant === cornerIndices[3]){
				// Top right
				renderIndices.push(
					camera.get.quadrant-numberQuadrantRows, camera.get.quadrant, 
					camera.get.quadrant-numberQuadrantRows+1, camera.get.quadrant+1				
				);			
			}
			else{
				
			}
		}
		
		/*
		All private
		
		camera is on the map edges (boundaries), render correct cells
		*/
		function setupIndicesTopEdgeCells(){
			if(topEdgeIndices.includes(camera.get.quadrant)){
				// camera on top row
				renderIndices.push(
					camera.get.quadrant-numberQuadrantRows, camera.get.quadrant, camera.get.quadrant+numberQuadrantRows,	
					camera.get.quadrant-numberQuadrantRows+1, camera.get.quadrant+1, camera.get.quadrant+numberQuadrantRows+1
				);	
			}
		}
		function setupIndicesBottomEdgeCells(){
			if(bottomEdgeIndices.includes(camera.get.quadrant)){
				// camera on bottom row
				renderIndices.push(
					camera.get.quadrant-numberQuadrantRows-1, camera.get.quadrant-1, camera.get.quadrant+numberQuadrantRows-1,
					camera.get.quadrant-numberQuadrantRows, camera.get.quadrant, camera.get.quadrant+numberQuadrantRows
				);	
			}		
		}
		function setupIndicesLeftEdgeCells(){
			if(leftEdgeIndices.includes(camera.get.quadrant)){
				// camera on left row
				renderIndices.push(
					camera.get.quadrant-1, camera.get.quadrant+numberQuadrantRows-1, 
					camera.get.quadrant,  camera.get.quadrant+numberQuadrantRows,
					camera.get.quadrant+1, camera.get.quadrant+numberQuadrantRows+1
				);	
			}
		}
		function setupIndicesRightEdgeCells(){
			if(rightEdgeIndices.includes(camera.get.quadrant)){
				// camera on right row
				renderIndices.push(
					camera.get.quadrant-numberQuadrantRows-1, camera.get.quadrant-1, 
					camera.get.quadrant-numberQuadrantRows, camera.get.quadrant, 
					camera.get.quadrant-numberQuadrantRows+1, camera.get.quadrant+1
				);	
			}
		}
		
		/*
		Private
		
		Create indices of the standard 3x3 pattern
		*/
		function setupIndices3x3Cells(){
			renderIndices.push(
				// Top left quadrant 							Top centre quadrant			Top right quadrant
				camera.get.quadrant-(numberQuadrantRows)-1, 	camera.get.quadrant-1, 		camera.get.quadrant+(numberQuadrantRows)-1, 
				
				// Centre left quadrant							camera quadrant				Centre right quadrant
				camera.get.quadrant-(numberQuadrantRows), 		camera.get.quadrant, 		camera.get.quadrant+(numberQuadrantRows),
				
				// Bottom left quadrant							Bottom centre quadrant		Bottom right quadrant
				camera.get.quadrant-(numberQuadrantRows)+1, 	camera.get.quadrant+1, 		camera.get.quadrant+(numberQuadrantRows)+1
			);
		}
		
	/*
	##########################
	VAO index processing above 
	##########################
	*/
	
	
	/*
	Public
	
	Apply matrices, bind the terrain VAO, 
	Work out what indices to process and render,
	Then draw the terrain.
	*/
	this.render = function(){	
		lightColour = [1, 1, 1];
		currentTexture = mapTexture;

		useInstancing = false;
		gl.uniform1i(useInstancingLocation, useInstancing);
		gl.disableVertexAttribArray(instancingLocation0);
		gl.disableVertexAttribArray(instancingLocation1);
		gl.disableVertexAttribArray(instancingLocation2);
		gl.disableVertexAttribArray(instancingLocation3);
		
		scale = m4.scaling(1, 1, 1);
		rotateX = m4.xRotation(0);
		rotateY = m4.yRotation(0);
		rotateZ = m4.zRotation(0);
		
		position = m4.translation(0, 0, 0);
		
		// Times matrices together
		updateAttributesAndUniforms();

		gl.activeTexture(gl.TEXTURE0);
		gl.uniform1i(gl.getUniformLocation(program, "uSampler"), 0);
		gl.bindTexture(gl.TEXTURE_2D, currentTexture.getTextureAttribute.texture);
		
		// Reset VAO indices to process and render
		renderIndices = [];
		
		// Get the cell they're in (for example 0)
		// 		if currentCell.isIn(cornersArray), renderCorner(), // renderCorner just sets the 4 indices
		// 		if currentCell.isIn(edgesArray), renderEdge(); // renderEdge just sets the 6 indices
		//		else render 3x3 // just sets the standard 9 indices
		
		// Work out what data we should process and render
		if(cornerIndices.includes(camera.get.quadrant)){
			setupIndicesCornerCells();
		}
		else if(topEdgeIndices.includes(camera.get.quadrant)){
			setupIndicesTopEdgeCells();
		}
		else if(bottomEdgeIndices.includes(camera.get.quadrant)){
			setupIndicesBottomEdgeCells();
		}
		else if(leftEdgeIndices.includes(camera.get.quadrant)){
			setupIndicesLeftEdgeCells();
		}
		else if(rightEdgeIndices.includes(camera.get.quadrant)){
			setupIndicesRightEdgeCells();
		}
		else{
			setupIndices3x3Cells();
		}

		/*
		4 (corner) -> 9 (regular cell) draw calls, one for each quadrant
		
		Process and render the current camera quadrant and the surrounding cells (3x3 total)
		*/
		for(var i=0; i<renderIndices.length; i++){
			
			/*
			Render indices[i] contains the VBO's, of everything
			
			Have number of terrain vertices per quadrant
			Then number of rock vertices per quadrant
			*/
			vao_ext.bindVertexArrayOES(terrainVAOs[ renderIndices[i] ]); 
			
			// Terrain, use quadrantTerrainVertices.length / 3
			gl.drawElements(
				gl.TRIANGLE_STRIP, 
				quadrantFloorVerticesLength / 3 * 2, // vertices * 2 is the number of indices
				gl.UNSIGNED_INT, // can probably use GLU_SHORT once fixed, remove extension
				0 // start from the start of the current quadrant
			); 
			vao_ext.bindVertexArrayOES(null); 
		}
	}
	
	var mapBoundaryVertices = [];
	var mapBoundaryPositionBuffer;
	
	var mapBoundaryIndices = [];
	var mapBoundaryIndiceBuffer;
	
	var mapBoundaryUvs = [];
	var mapBoundaryUvBuffer;
	
	/*
	Builds the quads for the map boundaries
	*/
	function setupMapBoundariesData(){
		// Vertices
		mapBoundaryVertices = [
		   -1, 1, 0, // top left, 
		   -1, -1, 0, // bottom left 
		   1, -1, 0, // bottom right
		   1, 1, 0 // top right
		];
		mapBoundaryPositionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, mapBoundaryPositionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mapBoundaryVertices), gl.STATIC_DRAW);
		gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, false, 0, 0);		
		
		// Indices
		mapBoundaryIndices = [3,2,1,3,1,0]; 
		mapBoundaryIndiceBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mapBoundaryIndiceBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(mapBoundaryIndices), gl.STATIC_DRAW);
		
		// UVs
		mapBoundaryUvs = [
			0.0, 0.0,
			0.0, 1.0,
			1.0, 1.0,
			1.0, 0.0
		];
		mapBoundaryUvBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, mapBoundaryUvBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mapBoundaryUvs), gl.DYNAMIC_DRAW);
		gl.vertexAttribPointer(textureCoordLocation, 2, gl.FLOAT, false, 0, 0);	
	}
	
	/*
	If we're in day time, then render the transparent boundaries,
	If we're in night time, render black squares, alpha didn't work in night :(
	*/
	function actuallyRenderMapBoundaries(useAlpha){
		if(useAlpha){
			gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
			gl.enable(gl.BLEND);
			gl.uniform1f(alphaLocation, 0.4);
			gl.uniform1i(useAlphaLocation, true);		
		}

		// Render different map boundaries
		for(var i=0; i<4; i++){
			var spawnX = 0, spawnZ = 0;
			
			if(i === 0){
				// Top boundary
				spawnX = 0;
				spawnZ = 128-4;
				scale = m4.scaling(terrainRows, 10, 1);
			}
			else if(i === 1){
				// Bottom boundary
				spawnX = 0;
				spawnZ = terrainRows - 128+4;
				scale = m4.scaling(terrainRows, 10, 1);
			}
			else if(i === 2){
				// Left boundary
				spawnZ = 0;
				spawnX = 128-4;
				rotateY = m4.yRotation(Math.PI / 2);
				scale = m4.scaling(terrainRows, 10, 1); 
			}
			else if(i === 3){
				// Right boundary
				spawnZ = 0;
				spawnX = terrainRows - 128+4;
				rotateY = m4.yRotation(Math.PI / 2);
				scale = m4.scaling(terrainRows, 10, 1); 
			}
		
			position = m4.translation(spawnX, 0, spawnZ);	
			rotateX = m4.xRotation(0);
			rotateZ = m4.zRotation(0);	
		
			updateAttributesAndUniforms();

			currentTexture = borderTexture;
			gl.activeTexture(gl.TEXTURE0);
			gl.uniform1i(gl.getUniformLocation(program, "uSampler"), 0);
			gl.bindTexture(gl.TEXTURE_2D, currentTexture.getTextureAttribute.texture);

			gl.bindBuffer(gl.ARRAY_BUFFER, mapBoundaryPositionBuffer);
			gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, false, 0, 0);
			
			gl.bindBuffer(gl.ARRAY_BUFFER, mapBoundaryUvBuffer);
			gl.vertexAttribPointer(textureCoordLocation, 2, gl.FLOAT, false, 0, 0);

			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mapBoundaryIndiceBuffer);
			
			gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);	
		}		
		
		if(useAlpha){
			gl.disable(gl.BLEND);
			gl.uniform1i(useAlphaLocation, false);	
		}
	}
	
	/*
	Doesn't render the map boundaries, but calls a function which does
	Calculates which boundaries to render:
		Transparent boundaries for day,
		Black boundaries for night
	*/
	this.renderMapBoundaries = function(){
		if(skybox.get.currentTime < 0600 || skybox.get.currentTime > 2000){
			actuallyRenderMapBoundaries(false); // don't use alpha
		}
		else{
			actuallyRenderMapBoundaries(true); // use alpha
		}
	}
	
	/*
	TESTING FUNCTIONS BELOW
	*/
	
	/*
	Test 2D heightMap array is of correct size
	*/
	function test_createHeightMap(){
		if(heightMap.length === quadrantRowSize * numberQuadrantRows && 
			heightMap[0].length === quadrantColumnSize * numberQuadrantColumns){
			// It's correct size
		}
		else{
			console.error("In createHeightMap: HeightMap was not of the correct size.");
			console.error("Expected row size: " + quadrantRowSize * numberQuadrantRows + ", column size: " + quadrantColumnSize * numberQuadrantColumns);
			console.error("Actual row size: " + heightMap.length + ", column size: " + heightMap[0].length);
		}
	}
	
	/*
	Test if the current heightMap value is a number
	*/
	function test_fillHeightMap(value){
		if(isNaN(value)){
			console.error("In fillHeightMap function: One or more of the heightMap values wasn't a number");
		}
		else{
			// Value is ok
		}
	}
	
	/*
	Testing buildAllTerrainData
	*/
	
	/*
	Test the correct amount of quadrant vertices where created
		quadrantRowSize = number of vertices per row (128)
		quadrantColumnSize = number of vertices per column (128)
	Times these by 3, because each vertex has x, y, z
		
	quadrantVertices.length = number of x, y, z values in current section
	*/
	function test_createQuadrantVertices(){
		var expected_number_vertices = 3 * (quadrantRowSize * quadrantColumnSize);
		var actual_number_vertices = quadrantVertices.length
		test_quadrantData("vertices", expected_number_vertices, actual_number_vertices);
	}
	
	/*
	Test the correct amount of quadrant indices where created
	
	Each quadrant should have double the number of indices to vertices
		Divide quadrantVertices by 3 to get the amount of vertices, not x, y, z values
	*/
	function test_createQuadrantIndices(){
		var expected_indices_length = (quadrantVertices.length/3) * 2;
		var actual_indices_length = quadrantIndices.length;
		test_quadrantData("indices", expected_indices_length, actual_indices_length);
	}
	
	/*
	Test correct amount of UV coordinates
	
	For each vertex, there should be 2 UV coordinates
		Divide quadrantVertices by 3 to get the amount of vertices, not x, y, z values
	*/
	function test_createQuadrantUvs(){
		var expected_uvs_length = (quadrantVertices.length/3) * 2;
		var actual_uvs_length = quadrantUvs.length;
		test_quadrantData("uvs", expected_uvs_length, actual_uvs_length);
	}
	
	/*
	Test correct amount of quadrant normals
	Normals should be equal to number of quadrantVertices
	*/
	function test_createQuadrantNormals(){
		var expected_normals_length = quadrantVertices.length;
		var actual_normals_length = quadrantNormals.length;
		test_quadrantData("normals", expected_normals_length, actual_normals_length);
	}
	
	/*
	Tests length of the quadrants (vertices/normals/UVs/indices)
	
	Parameters:
		attribute: which of the quadrants (vertices/normals/UVs/indices) are being tested
		expectedLength
		actualLength
	*/
	function test_quadrantData(attribute, expectedLength, actualLength){

		if(expectedLength === actualLength){
			// correct number of (vertices/normals/UVs/indices)
		}
		else{
			console.error("In " + attribute + " length didn't match");
			console.error("Expected length: " + expectedLength);
			console.error("Actual length: " + actualLength);
		}		
	}
	
	/*
	Test the quadrantVertexBuffer is a WebGL buffer object (VBO)
	*/
	function test_setupQuadrantBuffers(){
		test_isWebGLBuffer("vertex buffer", quadrantVertexBuffer);
		test_isWebGLBuffer("indices buffer", quadrantIndicesBuffer);
		test_isWebGLBuffer("UV buffer", quadrantUvBuffer);
		test_isWebGLBuffer("normal buffer", quadrantNormalBuffer);
	}
	
	function test_isWebGLBuffer(bufferName, buffer){
		if(!buffer instanceof WebGLBuffer){
			console.error("In isWebGLBuffer, quadrant: " + bufferName + ", is not a WebGLBuffer object");
		}
	}
	
	/*
	Make sure the terrainVAOs array was filled with WebGLVertexArrayObjectOES objects properly
	*/
	function test_terrainVAOs(){
		for(var i=0; i<numberQuadrantRows * numberQuadrantColumns; i++){
			if(vao_ext.isVertexArrayOES(terrainVAOs[i])){
				// Its ok
			}
			else{
				console.error("In buildAllTerrainData: terrainVAOs not created properly");
			}
		}		
	} 
	
	/*
	Don't have unit tests for terrain section rendering,
	Because I took screen shots when building the algorithm, showing that it works
	*/

}