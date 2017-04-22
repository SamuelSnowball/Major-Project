
/**
 * This class builds the terrain of the scene.
 * 
 * It creates a 2D heightMap using stacked perlin noise,
 * It then builds 3D vertices from that heightMap and stores them in "quadrants" (sections of the map)
 * 
 * The render method, calls methods to clips off any quadrants, 
 * apart from the 3x3 surrounding quadrants of the camera
 * 
 * This file also creates and renders the terrain boundaries
 * 
 * @class Terrain
*/
function Terrain(){
	
	// Textures for floor + map boundaries
	var mapTexture = new Texture("resources/terrain/floor/sand.png", 10, 0);
	var borderTexture = new Texture("", 10, 0);
	gl.bindTexture(gl.TEXTURE_2D, borderTexture.getTextureAttribute.texture);		
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 0, 255]));
	
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
	
	this.get = {
		/**
		@method get.getTerrainRows
		@public
		@return {int} the width/height of the entire map
		*/
		get getTerrainRows(){
			return terrainRows;
		},
		
		/**
		@method get.getNumberQuadrantRows
		@public
		@return {int} the number of quadrant rows (default 8 rows)
		*/		
		get getNumberQuadrantRows(){
			return numberQuadrantRows;
		},
		
		/**
		@method get.getNumberQuadrantColumns
		@public
		@return {int} the number of quadrant columns (default 8 columns)
		*/		
		get getNumberQuadrantColumns(){
			return numberQuadrantColumns;
		},
		
		/**
		@method get.getQuadrantRowSize
		@public
		@return {int} how many vertices per each quadrant row (always 128)
		*/		
		get getQuadrantRowSize(){
			return quadrantRowSize;
		},
		
		/**
		@method get.getRenderIndices
		@public
		@return {int[]} the final set of terrain map indices to render
		*/		
		get getRenderIndices(){
			return renderIndices; // roxkGenerator class needs these
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
		/**
		@method heightMapValueAtIndex.setTemporaryHeightMapX
		@public
		@param value {int} the Z index to set in the 2D heightMap (it's reversed)
		*/
		set setTemporaryHeightMapX(value){
			temporaryHeightMapX = value;
		},
		
		/**
		@method heightMapValueAtIndex.setTemporaryHeightMapZ
		@public
		@param value {int} the X index to set in the 2D heightMap (it's reversed)
		*/		
		set setTemporaryHeightMapZ(value){
			temporaryHeightMapZ = value;
		},
		
		/**
		Use the previous 2 methods to set temporary heightMap indexes,
		Then use this method to get height value, at the given indexes
		
		@method heightMapValueAtIndex.getTemporaryHeightMapValue
		@public
		@return {float} the height value retrieved from the 2D heightMap, used to set rocks position and player height
		*/		
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
		/**
		Create, fill and edit heightMap data
		Use that heightMap data to create vertices 
		
		@constructor
		*/
		createHeightMap();
		fillHeightMap();
		buildAllTerrainData();
		setupVaoIndices();
		setupMapBoundariesData();
	/*
	#################
	Constructor above
	#################
	*/
	
	
	/**
	Loops over each quadrant
	
	For each map quadrant, create its data, and a VAO, store that VAO in the terrainVAOs array.
	
	@method buildAllTerrainData
	@private
	*/
	function buildAllTerrainData(){
		
		for(var x=0; x<numberQuadrantRows; x++){
			for(var z=0; z<numberQuadrantColumns; z++){	
				// Create and bind a VAO, for holding our VBO data
				var tempVAO = vao_ext.createVertexArrayOES();  
				vao_ext.bindVertexArrayOES(tempVAO); 
				
				// When a VAO is created all attrib locations are disabled by default
				// So need to enable them for each VAO
				gl.enableVertexAttribArray(mainProgram.get.positionAttribLocation);
				gl.enableVertexAttribArray(mainProgram.get.textureCoordLocation);
				gl.enableVertexAttribArray(mainProgram.get.normalAttribLocation);
						
				// Reset current quadrant data (if any), and create new quadrant data
				createQuadrantVertices(x, z);
				createQuadrantIndices();
				createQuadrantUvs();
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
	
		/**
		Private
		
		Create the 2D heightMap array:
			heightMap[terrainRows][terrainColumns];
			
		@method createHeightMap
		@private
		*/
		function createHeightMap(){
			heightMap = new Array(terrainRows).fill(0); 
			for(var i=0; i<terrainRows; i++){
				heightMap[i] = new Array(terrainColumns).fill(0);
			}
			
			// @Test
			if(useTests) test_createHeightMap();
		}
		
		/**
		Private
		
		Takes in a coordinate in 2D heightMap array, loops over specified number of octaves,
		adds noise octaves onto each other, returns final the height value for the vertex
		
		@method stackNoise
		@private
		@param x {int} the x offset 
		@param y {int} the y offset
		@param numOctaves {int} how many octaves to loop over and stack together, default is 8
		@return {float} the perlin noise height value for a 3D point
		*/
		function stackNoise(x, y, numOctaves){
			var v = 0;
			var amplitude = 1;
			var frequency = 1;
			var noiseTotal = 0;
			
			for(var i=0; i<numOctaves; i++){
				// https://github.com/josephg/noisejs
				v += noise.perlin2(x * amplitude, y * amplitude, x * amplitude) * frequency;
				noiseTotal += frequency;
				amplitude *= 0.5;
				frequency *= 2.0;
			}
			
			return v / noiseTotal;
		}
		
		/**
		Fills the 2D HeightMap with stacked perlin noise values,
		These height values are then assigned to 3D vertices later on,
		This in turn creates the smooth terrain
		
		@method fillHeightMap
		@private
		*/
		function fillHeightMap(){
			var error = false;
			var xOff = 0;
			var yOff = 0;
			var offsetIncrement;
			var scale;
			
			// https://github.com/josephg/noisejs
			noise.seed(Math.random());
			
			//Does for entire map
			for(var x=0; x<terrainRows; x++){
				for(var y=0; y<terrainRows; y++){
				
					// Retrieve octaves and scale values from GUI
					var stacked = stackNoise(x, y, myGUI.get.ui_noise_octaves);
					heightMap[x][y] = stacked * (myGUI.get.ui_noise_scale);

					// Set terrain outside map boundaries as high
					if(x < terrainRows/numberQuadrantRows && y < terrainRows){
						var stacked = stackNoise(x, y ,8);
						heightMap[x][y] = stacked * 50;					
					}
					// Right row out of bounds section
					else if(x > terrainRows-quadrantRowSize && y < terrainRows){
						var stacked = stackNoise(x, y ,8);
						heightMap[x][y] = stacked * 50;	
					}
					else if(y < terrainRows/numberQuadrantRows && x < terrainRows){
						var stacked = stackNoise(x, y ,8);
						heightMap[x][y] = stacked * 50;						
					}
					else if(y > terrainRows-quadrantRowSize && x < terrainRows){
						var stacked = stackNoise(x, y ,8);
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
	
		/**
		I have a 2D heightMap

		Now create the terrain vertices having x, y, z values 
		Where y is the value from the heightMap we made.
		
		This function creates data for one quadrant at a time
		
		@method createQuadrantVertices
		@private
		@param vaoXPosition {int} the x index to start generating vertices at, the x position is calculate from this
		@param vaoZPosition {int} the z index to start generating vertices at, the z position is calculate from this
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
		

		/**
		Creates the quadrantIndices from the vertices
		
		Code from: http://stackoverflow.com/questions/5915753/generate-a-plane-with-triangle-strips
		Answer with 11 upvotes
		
		@method createQuadrantIndices
		@private
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

		/**
		Creates the quadrants UV coordinates
		
		@method createQuadrantUvs
		@private
		*/
		function createQuadrantUvs(){
		
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
		
		/**
		Sets all of the terrain normals to [1, 1, 1], this stops a bug with the lighting.
		
		Due to the terrain sections being split, there was a bug as the current point needed information
		from the previous row. But the previous row was in a different section, and therefore wasn't
		available. This caused black lines on the terrain boundaries.
		
		Setting the normals to [1,1,1] fixes this.
		You can't even notice the lighting on the terrain anyway,
		
		@method createQuadrantNormals
		@private
		*/
		function createQuadrantNormals(){
			
			// Reset current normals
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
	
		/**
		@method setupQuadrantVertexBuffer
		@private
		*/
		function setupQuadrantVertexBuffer(){
			quadrantVertexBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, quadrantVertexBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(quadrantVertices), gl.DYNAMIC_DRAW);
			gl.vertexAttribPointer(mainProgram.get.positionAttribLocation, 3, gl.FLOAT, false, 0, 0);	
		}
		
		/**
		Adds the current quadrant indices to the quadrantIndices VBO
		
		@method setupQuadrantIndiciesBuffer
		@private
		*/
		function setupQuadrantIndiciesBuffer(){
			quadrantIndicesBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, quadrantIndicesBuffer);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(quadrantIndices), gl.DYNAMIC_DRAW);		
		}
		
		/**
		Every texture goes from 0 -> 1, regardless of dimensions

		GL has 16/32 texture registers, we're using TEXTURE0
		Bind the previously loaded texture to that register
		Set the sampler in the shader to use that texture
		
		@method setupQuadrantUvBuffer
		@private
		*/
		function setupQuadrantUvBuffer(){
			quadrantUvBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, quadrantUvBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(quadrantUvs), gl.DYNAMIC_DRAW);
			gl.vertexAttribPointer(mainProgram.get.textureCoordLocation, 2, gl.FLOAT, false, 0, 0);	
		}
		
		/**
		@method setupQuadrantNormalBuffer
		@private
		*/
		function setupQuadrantNormalBuffer(){
			quadrantNormalBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, quadrantNormalBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(quadrantNormals), gl.DYNAMIC_DRAW);
			gl.vertexAttribPointer(mainProgram.get.normalAttribLocation, 3, gl.FLOAT, false, 0, 0);				
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
		
		/**
		Find out what indices the corner and edge quadrants are at
		Add theses indices to cornerIndices and all edgeIndices arrays
			
		If camera in corner we have 4 indices to process and render
		If camera in edge we have 6 indices to process and render
		If camera in regular cell we have 9 indices to process and render
		
		How to calculate if on edge cell, corner cell or normal cell?
			Base it off numberQuadrantRows * numberQuadrantColumns
		
		@example
		
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
			
		@method setupVaoIndices
		@private
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
		
		/**
		Private
		
		Camera is in a corner, create indices appropriately
		
		Need to check what corner they're in to calculate renderIndices properly
		4 different indices orders, depending on what corner they're in!	
		
		@method setupIndicesCornerCells
		@private
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
		
		/**
		Camera is on the map edges (boundaries), render correct cells
		
		@method setupIndicesTopEdgeCells
		@private
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
		/**
		@method setupIndicesBottomEdgeCells
		@private
		*/
		function setupIndicesBottomEdgeCells(){
			if(bottomEdgeIndices.includes(camera.get.quadrant)){
				// camera on bottom row
				renderIndices.push(
					camera.get.quadrant-numberQuadrantRows-1, camera.get.quadrant-1, camera.get.quadrant+numberQuadrantRows-1,
					camera.get.quadrant-numberQuadrantRows, camera.get.quadrant, camera.get.quadrant+numberQuadrantRows
				);	
			}		
		}
		/**
		@method setupIndicesLeftEdgeCells
		@private
		*/
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
		/**
		@method setupIndicesRightEdgeCells
		@private
		*/
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
		
		/**	
		Create indices of the standard 3x3 pattern
		
		@method setupIndices3x3Cells
		@private
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
	
	
	/**
	Public
	
	Apply matrices, bind the terrain VAO, 
	Work out what indices to process and render,
	Then draw the terrain.
	
	@method render
	@public
	*/
	this.render = function(){	
		lightColour = [1, 1, 1];
		currentTexture = mapTexture;

		useInstancing = false;
		gl.uniform1i(mainProgram.get.useInstancingLocation, useInstancing);
		gl.disableVertexAttribArray(mainProgram.get.instancingLocation0);
		gl.disableVertexAttribArray(mainProgram.get.instancingLocation1);
		gl.disableVertexAttribArray(mainProgram.get.instancingLocation2);
		gl.disableVertexAttribArray(mainProgram.get.instancingLocation3);
		
		scale = m4.scaling(1, 1, 1);
		rotateX = m4.xRotation(0);
		rotateY = m4.yRotation(0);
		rotateZ = m4.zRotation(0);
		
		position = m4.translation(0, 0, 0);
		
		// Times matrices together
		mainProgram.updateAttributesAndUniforms();

		gl.activeTexture(gl.TEXTURE0);
		gl.uniform1i(gl.getUniformLocation(mainProgram.get.program, "uSampler"), 0);
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
	
	/**
	Builds the quads for the map boundaries
	
	@method setupMapBoundariesData
	@private
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
		gl.vertexAttribPointer(mainProgram.get.positionAttribLocation, 3, gl.FLOAT, false, 0, 0);		
		
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
		gl.vertexAttribPointer(mainProgram.get.textureCoordLocation, 2, gl.FLOAT, false, 0, 0);	
	}
	
	/**
	If we're in day time, then render the transparent boundaries,
	If we're in night time, render black squares, alpha didn't work in night :(
	
	@method actuallyRenderMapBoundaries
	@private
	@param useAlpha {Bool} if true, we render the white transparent boundaries, if false, render black ones
	*/
	function actuallyRenderMapBoundaries(useAlpha){
		if(useAlpha){
			gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
			gl.enable(gl.BLEND);
			gl.uniform1f(mainProgram.get.alphaLocation, 0.4);
			gl.uniform1i(mainProgram.get.useAlphaLocation, true);		
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
		
			mainProgram.updateAttributesAndUniforms();

			currentTexture = borderTexture;
			gl.activeTexture(gl.TEXTURE0);
			gl.uniform1i(gl.getUniformLocation(mainProgram.get.program, "uSampler"), 0);
			gl.bindTexture(gl.TEXTURE_2D, currentTexture.getTextureAttribute.texture);

			gl.bindBuffer(gl.ARRAY_BUFFER, mapBoundaryPositionBuffer);
			gl.vertexAttribPointer(mainProgram.get.positionAttribLocation, 3, gl.FLOAT, false, 0, 0);
			
			gl.bindBuffer(gl.ARRAY_BUFFER, mapBoundaryUvBuffer);
			gl.vertexAttribPointer(mainProgram.get.textureCoordLocation, 2, gl.FLOAT, false, 0, 0);

			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mapBoundaryIndiceBuffer);
			
			gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);	
		}		
		
		if(useAlpha){
			gl.disable(gl.BLEND);
			gl.uniform1i(mainProgram.get.useAlphaLocation, false);	
		}
	}
	
	/**
	Doesn't render the map boundaries, but calls a function which does
	Calculates which boundaries to render:
		Transparent boundaries for day,
		Black boundaries for night
		
	@method renderMapBoundaries
	@private
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
	
	/**
	Test 2D heightMap array is of correct size
	
	@method test_createHeightMap
	@private
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
	
	/**
	Test if the current heightMap value is a number
	
	@method test_fillHeightMap
	@private
	@param value {int} the value to check 
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
	
	/**
	Test the correct amount of quadrant vertices where created
		quadrantRowSize = number of vertices per row (128)
		quadrantColumnSize = number of vertices per column (128)
	Times these by 3, because each vertex has x, y, z
		
	quadrantVertices.length = number of x, y, z values in current section
	
	@method test_createQuadrantVertices
	@private
	*/
	function test_createQuadrantVertices(){
		var expected_number_vertices = 3 * (quadrantRowSize * quadrantColumnSize);
		var actual_number_vertices = quadrantVertices.length
		test_quadrantData("vertices", expected_number_vertices, actual_number_vertices);
	}
	
	/**
	Test the correct amount of quadrant indices where created
	
	Each quadrant should have double the number of indices to vertices
		Divide quadrantVertices by 3 to get the amount of vertices, not x, y, z values
		
	@method test_createQuadrantIndices
	@private
	*/
	function test_createQuadrantIndices(){
		var expected_indices_length = (quadrantVertices.length/3) * 2;
		var actual_indices_length = quadrantIndices.length;
		test_quadrantData("indices", expected_indices_length, actual_indices_length);
	}
	
	/**
	Test correct amount of UV coordinates
	
	For each vertex, there should be 2 UV coordinates
		Divide quadrantVertices by 3 to get the amount of vertices, not x, y, z values
		
	@method test_createQuadrantUvs
	@private
	*/
	function test_createQuadrantUvs(){
		var expected_uvs_length = (quadrantVertices.length/3) * 2;
		var actual_uvs_length = quadrantUvs.length;
		test_quadrantData("uvs", expected_uvs_length, actual_uvs_length);
	}
	
	/**
	Test correct amount of quadrant normals
	Normals should be equal to number of quadrantVertices
	
	@method test_createQuadrantNormals
	@private
	*/
	function test_createQuadrantNormals(){
		var expected_normals_length = quadrantVertices.length;
		var actual_normals_length = quadrantNormals.length;
		test_quadrantData("normals", expected_normals_length, actual_normals_length);
	}
	
	/**
	Tests length of the quadrants (vertices/normals/UVs/indices)

	@method test_quadrantData
	@private
	@param attribute {string} name of the attribute that is being tested (vertices/normals/UVs/indices) 
	@param expectLemgth {int} the expectedLength of the attribute
	@param actualLength {int} the actualLength of the attribute
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
	
	/**
	Test the quadrant buffers if they're WebGL buffer objects (VBO)
	
	@method test_setupQuadrantBuffers
	@private
	*/
	function test_setupQuadrantBuffers(){
		test_isWebGLBuffer("vertex buffer", quadrantVertexBuffer);
		test_isWebGLBuffer("indices buffer", quadrantIndicesBuffer);
		test_isWebGLBuffer("UV buffer", quadrantUvBuffer);
		test_isWebGLBuffer("normal buffer", quadrantNormalBuffer);
	}
	
	/**
	@method test_isWebGLBuffer
	@private
	@param bufferName {string} the buffers name we're testing
	@param buffer {buffer} hopefully its an instance of WebGLBuffer!
	*/
	function test_isWebGLBuffer(bufferName, buffer){
		if(!buffer instanceof WebGLBuffer){
			console.error("In isWebGLBuffer, quadrant: " + bufferName + ", is not a WebGLBuffer object");
		}
	}
	
	/**
	Make sure the terrainVAOs array was filled with WebGLVertexArrayObjectOES objects properly
	
	@method test_terrainVAOs
	@private
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