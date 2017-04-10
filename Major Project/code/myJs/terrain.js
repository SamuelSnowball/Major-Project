
function Terrain(){
	
	// A 2D array storing stacked perlin noise height values, later assigned to quadrantVertices height coordinate.
	var heightMap;
	
	// The row and column size (number of vertices) of each quadrant
	var quadrantRowSize = 128;
	var quadrantColumnSize = 128;
	
	// How many map quadrants, each having 128*128 vertices each
	// If you update these, make sure to update them in camera assign quadrant method
	var numberQuadrantRows = 4; 
	var numberQuadrantColumns = 4; 
	
	// Contains entire map size, not individual quadrant size, needed for heightMap
	var terrainRows = numberQuadrantRows * quadrantRowSize;
	var terrainColumns = numberQuadrantColumns * quadrantColumnSize;
	
	// Needed in createQuadrantVertices, what position to start generating quadrant vertices from
	var savedX = 0;
	var savedZ = 0;
	
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
		get renderIndices(){
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
				
				// Then put data in VBOs, and bind those VBOs to VAO
				setupQuadrantVertexBuffer();
				setupQuadrantIndiciesBuffer();
				setupQuadrantUvBuffer();
				setupQuadrantNormalBuffer();
				
				// Add current VAO to terrainVAOs array, this saves our data in the VAO
				terrainVAOs.push(tempVAO);
				vao_ext.bindVertexArrayOES(null); 
			}
		}
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
			var xOff = 0;
			var yOff = 0;
			var offsetIncrement;
			var scale;
			
			//Does for entire map
			for(var x=0; x<terrainRows; x++){
				for(var y=0; y<terrainRows; y++){
					// Left row out of bounds section
					
					// sand texture = single noise, no stacked
					// cliffs etc?
					
					// Map boundaries
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
					
					//Have 8 sections?
					// Currently, half and half
					if(x > terrainRows/numberQuadrantRows && 
						x < terrainRows/2 &&
						y < terrainRows){
						var stacked = stackNoise(x,y,8);
						heightMap[x][y] = stacked * 15;	
					}
					else{
						var stacked = stackNoise(x,y,8);
						heightMap[x][y] = stacked * 30;	
					}
				
					//var stacked = stackNoise(x,y,8);
					//heightMap[x][y] = stacked * 30;	
				//	heightMap[x][y] = - 5.5;
					

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
		var savedX = 0, savedZ = 0;
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
			
			/*
			These if statements fixes bug of vertices doing:
				0->127, then 128->256 (which also broke heightMap, as it went from 0->255)
			It now does
				0->127, then 127->254
			*/
			if(vaoXPosition > 0){
				//terrainX -=vaoXPosition;
				//startX -= vaoXPosition;
			}
			if(vaoZPosition > 0){
				//terrainZ -= vaoZPosition; 
			}
			
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
		//could get passed the start position of the creatVertices function
		//creatVertices could return the position it started at, pass into this one
		//use that start position / terrainSize to get?
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
				//Get 1st point (3 vertices), 2nd point(3 vertices), 3rd (3 vertices)(under) point
				
				//Top left vertex
				var vertex0x = quadrantVertices[i];
				var vertex0y = quadrantVertices[i+1];
				var vertex0z = quadrantVertices[i+2];
				
				//Top right vertex
				var vertex1x = quadrantVertices[i+3];
				var vertex1y = quadrantVertices[i+4];
				var vertex1z = quadrantVertices[i+5];
				
				/*
				Vertex under top left vertex
					Its the current row times the current column!
					They both dont exist, just add a single value
					i + value 
					i + 1 + value
					try value as 1024, would push current value exactly 1 row down
					times 3, because 3 vertices, rows isnt 100% correct, as its a 1d array, with an x,y,z each
				*/
				var vertex2x = quadrantVertices[i + (quadrantRowSize*3)];
				var vertex2y = quadrantVertices[(i + 1) + (quadrantRowSize*3)];
				var vertex2z = quadrantVertices[(i + 2) + (quadrantRowSize*3)];
				
				// Now work out vector0, might be wrong direction
				var vector0x = vertex1x - vertex0x;
				var vector0y = vertex1y - vertex0y;
				var vector0z = vertex1z - vertex0z;
				var vector0 = [vector0x, vector0y, vector0z];
				
				// Now work out vector1, might be wrong direction
				var vector1x = vertex2x - vertex0x;
				var vector1y = vertex2y - vertex0y;
				var vector1z = vertex2z - vertex0z;
				var vector1 = [vector1x, vector1y, vector1z];

				// Need to normalize vectors
				vector0 = m4.normalize(vector0);
				vector1 = m4.normalize(vector1);
				
				// Now cross product between vector0 and vector1
				// vector0 * vector1, might be wrong way around,
				// Also the vectors could've been calculated wrong way around
				var normal = m4.cross(vector1, vector0);
				
				/*
				Set all normals to 1,
				Can't notice a difference,
				Was causing the bug with black lines
				
				normals[0]
				normals[1]
				normals[2]
				*/
				quadrantNormals.push(1); //x
				quadrantNormals.push(1); //y
				quadrantNormals.push(1); //z
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
	
}