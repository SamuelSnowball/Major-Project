
function Terrain(){
	
	// Contains all quadrant VAO objects, each VAO contains a quadrants: vertices, normals, uvs and indices
	var terrainVAOs = [];
	
	// A 2D array storing stacked perlin noise height values, later assigned to quadrantVertices height coordinate.
	var heightMap;
	
	// The row and column size of each quadrant
	var quadrantRowSize = 128;
	var quadrantColumnSize = 128;
	
	// How many map quadrants, each having 128*128 vertices each
	// If you update these, make sure to update them in player assign quadrant method
	var numberQuadrantRows = 8; 
	var numberQuadrantColumns = 8; 
	
	this.get = {
		get numQuadrantRows(){
			return numberQuadrantRows;
		},
		get numQuadrantColumns(){
			return numberQuadrantColumns;
		}
	};
	
	// Contains entire map size, not individual quadrant size, needed for heightMap
	var terrainRows = numberQuadrantRows * quadrantRowSize;
	var terrainColumns = numberQuadrantColumns * quadrantColumnSize;
	
	// Data for the current quadrant, this data gets stored in the quadrants VBOs
	var quadrantVertices = []; 
	var quadrantNormals = [];
	var quadrantUvs = [];
	var quadrantIndices = [];
	
	// VBOs for each quadrant, they get stored in the quadrants VAO
	var quadrantVertexBuffer;
	var quadrantIndicesBuffer;
	var quadrantUvBuffer;
	var quadrantNormalBuffer;
	
	// Needed in createQuadrantVertices
	var savedX = 0;
	var savedZ = 0;

	var cornerIndices = []; // Contains corner indices
	
	var leftEdgeIndices = []; // Contains edge indices
	var rightEdgeIndices = []; 
	var topEdgeIndices = []; 
	var bottomEdgeIndices = []; 
	
	var renderIndices = []; // Final set of indices to render
	
	function buildAllTerrainData(){
		
		// For each map quadrant, create its data, and a VAO.
		for(var x=0; x<numberQuadrantRows; x++){
			for(var z=0; z<numberQuadrantColumns; z++){	
				
				//Create and bind a VAO, for holding our VBO data
				var tempVAO = vao_ext.createVertexArrayOES();  
				vao_ext.bindVertexArrayOES(tempVAO); 
				
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
	
	// Create, fill and edit heightMap data
	createHeightMap();
	fillHeightMap();
	//createCraters();
	
	// Use that heightMap data to create vertices 
	buildAllTerrainData();
	setupVaoIndices();
	
	
	
	
	/*
	This stores what values should be added onto the original centre element, 
	to obtain surrounding element rings.
	*/
	var directionNumbers = [
		/*
		Example 5x5:
		
		Outer 5X5 GRID
		Top 5 values
		Left 3 values
		Right 3 values
		Bottom 5 values
		
		// Top 5 values
		-2, -2, 
		-1, -2,
		 0, -2, 
		+1, -2,
		+2, -2, 
		
		// Left 3 values
		-2, -1, 
		-2,  0,
		-2, +1, 
		
		// Right 3 values
		+2, -1,
		+2,  0,
		+2, +1,
		
		// Bottom 5 values
		-2, +2,
		-1, +2,
		 0, +2,
		+1, +2,
		+2, +2
		
		*/
	];



	
	/*
	The collision class needs to find a heightMap value, given a X and Z,
	so it can move the player to the nearest vertex height.
	
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
			if(temporaryHeightMapZ > 0 && temporaryHeightMapZ < 1024
			&& temporaryHeightMapX > 0 && temporaryHeightMapX < 1024){
				return heightMap[temporaryHeightMapZ][temporaryHeightMapX];
			}
			else{
				return 0;
			}
		}
	}
	//Needed in rockGenerator, careful might be quadrantRows
	this.get = {
		get getTerrainRows(){
			return terrainRows;
		},
		get getNumberQuadrantRows(){
			return numberQuadrantRows;
		},
		get getQuadrantRowSize(){
			return quadrantRowSize;
		}
	};
	
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
	
	Takes in a coordinate, loops over specified number of octaves,
	adds noise octaves onto each other.
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
	
	8 x 8 quadrant map is 1024 rows by 1024 columns
	64 quadrants
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
				else{
					var stacked = stackNoise(x,y,8);
					heightMap[x][y] = stacked * 15;		
				}
				

			}
			xOff = 0;
			yOff += offsetIncrement;
		}
		xOff = 0;
		yOff = 0;
	}
	
	/*
	Private
	
	I have a 2D heightMap

	Now create the terrain vertices using x, y, z values 
	Where y is the value from the heightMap we made.
	*/
	function createQuadrantVertices(vaoXPosition, vaoZPosition){
	
		// Clear old quadrantVertices, need to generate a new set
		quadrantVertices = [];

		/*
		Work out what position we should start from (quadrant start boundaries)
		
		Transform from current quadrant index, to start position for vertex generation
			Example: 
				startX = 3, startZ = 0;
				3 * 128 (quadrant size) = X vertex generate start position (then -1)
				0 * 128 (quadrant size) = Z vertex generate start position (then -1)
			
			Example: startX = 1, startZ = 1;
				Start at 127, 127
		
		Need to - 1, as it returns multiple of 128, but we're starting from 0.
		
		If vaoXPosition/vaoZPosition is 0, then don't -1, as it will become [-1][-1]
		*/
		var terrainX = vaoXPosition * quadrantRowSize;
		var terrainZ = vaoZPosition * quadrantColumnSize;
		var startX = terrainX; // To reset the terrainX
		
		/*
		These if statements fixes bug of vertices doing:
			0->127, then 128->256 (which also broke heightMap, as it went from 0->255)
		It now does
			0->127, then 127->254
		*/
		if(vaoXPosition > 0){
			terrainX -=vaoXPosition;
			startX -= vaoXPosition;
		}
		if(vaoZPosition > 0){
			terrainZ -= vaoZPosition; 
		}

		// Always make quadrantRowSize * quadColumnSize number of vertices
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

		//console.log("Individual quadrant size: " + quadrantVertices.length/3);
		//console.log("Individual quadrant x,y,z values: " + quadrantVertices.length);		
	}
	
	/*
	Could have this in another loop for efficiency, but only worked out once, so its ok
	Not sure about what order the normals are supposed to go in
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
			
			//Under top left vertex
			//Its the current row times the current column!
			//They both dont exist, just add a single value
			//i + value 
			//i + 1 + value
			//try value as 1024, would push current value exactly 1 row down
			// times 3, because 3 vertices, rows isnt 100% correct, as its a 1d array, with an x,y,z each
			var vertex2x = quadrantVertices[i + (quadrantRowSize*3)];
			var vertex2y = quadrantVertices[(i + 1) + (quadrantRowSize*3)];
			var vertex2z = quadrantVertices[(i + 2) + (quadrantRowSize*3)];
			
			//Now work out vector0, might be wrong direction
			var vector0x = vertex1x - vertex0x;
			var vector0y = vertex1y - vertex0y;
			var vector0z = vertex1z - vertex0z;
			var vector0 = [vector0x, vector0y, vector0z];
			
			//Now work out vector1, might be wrong direction
			var vector1x = vertex2x - vertex0x;
			var vector1y = vertex2y - vertex0y;
			var vector1z = vertex2z - vertex0z;
			var vector1 = [vector1x, vector1y, vector1z];

			//Need to normalize vectors
			vector0 = m4.normalize(vector0);
			vector1 = m4.normalize(vector1);
			//console.log("vector 0: " + vector0);
			//console.log("vector 1: " + vector1);
			
			//Now cross product between vector0 and vector1
				//vector0 * vector1, might be wrong way around,
				//Also the vectors could've been calculated wrong way around
			var normal = m4.cross(vector0, vector1);
			
			quadrantNormals.push(-normal[0]); //x
			quadrantNormals.push(-normal[1]); //y
			quadrantNormals.push(-normal[2]); //z
			
			//console.log("A terrain normal is, x: " + -normal[0] + ", y: " + -normal[1] + ", z:" + -normal[2]);
		}
		
		/*
		Should have same number of normals to individual x,y,z points
		Because each x,y,z has a normal x,y,z
		
		TerrainVertices length / 3 = 104k vertices, each with a normal vector, of 3 components
		*/
		//console.log("Quadrant Normals length: " + quadrantNormals.length/3); 
		//console.log("Quadrant Normals individual values length: " + quadrantNormals.length); 
	}

	
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
	Code from: http://stackoverflow.com/questions/5915753/generate-a-plane-with-triangle-strips
	Answer with 11 upvotes
	*/
	function createQuadrantIndices(){
		//Reset current indices
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
		//console.log("Length of quadrant indices: " + quadrantIndices.length);
	}
	

	function setupQuadrantIndiciesBuffer(){
		quadrantIndicesBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, quadrantIndicesBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(quadrantIndices), gl.DYNAMIC_DRAW);		
	}

	function createQuadrantUvs(x, z){
	
		//Reset current UVs
		quadrantUvs = [];
		
		/*
		Set the start position for the UV coordinates
		*/
		var xUV;
		var yUV;
		if(x === 0){
			xUV = 0;
		}
		else{
			xUV = x * (1 / numberQuadrantRows);
		}
		if(z === 0){
			yUV = 0;
		}
		else{
			yUV = z * (1 / numberQuadrantColumns);
		}
		
		//Save the start position of xUV, need to reset to it in 2nd loop
		var startUVx = xUV;
		
		// How much to increment UV coordinates by each loop
		var incrementSize = 1 / quadrantRowSize / numberQuadrantRows;
		
		//These should loop, quadRowSize * quadColumnSize number of times
		for(var x=0; x<quadrantRowSize; x++){
			for(var y=0; y<quadrantColumnSize; y++){
				quadrantUvs.push(xUV);  
				quadrantUvs.push(yUV); 
				xUV += incrementSize;
			}
			xUV = startUVx;
			yUV += incrementSize;
		}
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
	
	
	function setupVaoIndices(){
		// Work out the below values, add to arrays
		// This can be done in setup !?
		
		// If in a normal cell, then have indices as they are below
		// If not, just have 4 (corner) or 6 (edge) indices and use those
		
		// How to calculate if on edge cell, or normal cell
		// Base it off numberQuadrantRows * numberQuadrantColumns
		
		// Take 4x4 for example
		
			// Need to work out if corner
			//		take (4-4) // 0
			// 		take (4x4) - 1 // 15
			//		take (4) - 1 // 3
			// 		take (4) * 3 // 12
			
			// Edges
			// 		any multiple of 4 is an edge element // 0, 4, 8, 12
			//  	any number up to 4 is an edge element // 0, 1, 2, 3
			// 		add these values to 'edges' array, IF it isn't in corners array, else its a corner
			
			// 2 opposite edges 
			// 		take the last multiple of 4, and add (4-1) values onto it, they're all edges // 12, 13, 14, 15
			// 		take number up to (4-1), add the number (4) and then -1 from it. // 3, 7, 11, 15
			// 		add these values to 'edges' array, IF it isn't in corners array, else its a corner
			
			// else, they're in a centre cell
		
		
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
	Player is in a corner, create indices appropriately
	
	Need to check what corner they're in to calculate renderIndices properly
	4 different indices orders, depending on what corner they're in!	
	*/
	function setupIndicesCornerCells(){

		if(player.get.quadrant === cornerIndices[0]){
			// Top left
			renderIndices.push(
				player.get.quadrant, player.get.quadrant+numberQuadrantRows, 
				player.get.quadrant+1, player.get.quadrant+numberQuadrantRows+1
			);
		}
		else if(player.get.quadrant === cornerIndices[1]){
			// Bottom right
			renderIndices.push(
				player.get.quadrant-numberQuadrantRows-1, player.get.quadrant-1, 
				player.get.quadrant-numberQuadrantRows, player.get.quadrant 				
			);			
		}
		else if(player.get.quadrant === cornerIndices[2]){
			// Bottom left
			renderIndices.push(
				player.get.quadrant-1, player.get.quadrant+numberQuadrantRows-1, 
				player.get.quadrant, player.get.quadrant+numberQuadrantRows					
			);			
		}
		else if(player.get.quadrant === cornerIndices[3]){
			// Top right
			renderIndices.push(
				player.get.quadrant-numberQuadrantRows, player.get.quadrant, 
				player.get.quadrant-numberQuadrantRows+1, player.get.quadrant+1				
			);			
		}
		else{
			
		}

	}
	
	/*
	Player is on the map edges (boundaries), render correct cells
	*/
	function setupIndicesTopEdgeCells(){
		if(topEdgeIndices.includes(player.get.quadrant)){
			// Player on top row
			renderIndices.push(
				player.get.quadrant-numberQuadrantRows, player.get.quadrant, player.get.quadrant+numberQuadrantRows,	
				player.get.quadrant-numberQuadrantRows+1, player.get.quadrant+1, player.get.quadrant+numberQuadrantRows+1
			);	
		}
	}
	function setupIndicesBottomEdgeCells(){
		if(bottomEdgeIndices.includes(player.get.quadrant)){
			// Player on bottom row
			renderIndices.push(
				player.get.quadrant-numberQuadrantRows-1, player.get.quadrant-1, player.get.quadrant+numberQuadrantRows-1,
				player.get.quadrant-numberQuadrantRows, player.get.quadrant, player.get.quadrant+numberQuadrantRows
			);	
		}		
	}
	function setupIndicesLeftEdgeCells(){
		if(leftEdgeIndices.includes(player.get.quadrant)){
			// Player on left row
			renderIndices.push(
				player.get.quadrant-1, player.get.quadrant+numberQuadrantRows-1, 
				player.get.quadrant,  player.get.quadrant+numberQuadrantRows,
				player.get.quadrant+1, player.get.quadrant+numberQuadrantRows+1
			);	
		}
	}
	function setupIndicesRightEdgeCells(){
		if(rightEdgeIndices.includes(player.get.quadrant)){
			// Player on right row
			renderIndices.push(
				player.get.quadrant-numberQuadrantRows-1, player.get.quadrant-1, 
				player.get.quadrant-numberQuadrantRows, player.get.quadrant, 
				player.get.quadrant-numberQuadrantRows+1, player.get.quadrant+1
			);	
		}
	}
	
	/*
	Create indices of the standard 3x3 pattern
	*/
	function setupIndices3x3Cells(){
		renderIndices.push(
			// Top left quadrant 							Top centre quadrant			Top right quadrant
			player.get.quadrant-(numberQuadrantRows)-1, 	player.get.quadrant-1, 		player.get.quadrant+(numberQuadrantRows)-1, 
			
			// Centre left quadrant							Player quadrant				Centre right quadrant
			player.get.quadrant-(numberQuadrantRows), 		player.get.quadrant, 		player.get.quadrant+(numberQuadrantRows),
			
			// Bottom left quadrant							Bottom centre quadrant		Bottom right quadrant
			player.get.quadrant-(numberQuadrantRows)+1, 	player.get.quadrant+1, 		player.get.quadrant+(numberQuadrantRows)+1
		);
	}
	
	/*
	Public
	
	Apply matrices, bind the terrain VAO, then draw the terrain.
	*/
	this.render = function(){	
		lightColour = [1, 1, 1];
		currentTexture = myPerlinTexture;

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
		//console.log("Current quadrant is: " + player.get.quadrant);
		
		// Reset indices to process and render
		renderIndices = [];
		
		// Get the cell they're in (for example 0)
		// 		if currentCell.isIn(cornersArray), renderCorner(), // renderCorner just sets the 4 indices
		// 		if currentCell.isIn(edgesArray), renderEdge(); // renderEdge just sets the 6 indices
		//		else render 3x3 // just sets the standard 9 indices
		
		// Work out what data we should process and render
		if(cornerIndices.includes(player.get.quadrant)){
			setupIndicesCornerCells();
			console.log("in corner");
		}
		else if(topEdgeIndices.includes(player.get.quadrant)){
			setupIndicesTopEdgeCells();
			console.log("In top edge cell");
		}
		else if(bottomEdgeIndices.includes(player.get.quadrant)){
			setupIndicesBottomEdgeCells();
			console.log("In bottom edge cell");
		}
		else if(leftEdgeIndices.includes(player.get.quadrant)){
			setupIndicesLeftEdgeCells();
			console.log("In left edge cell");
		}
		else if(rightEdgeIndices.includes(player.get.quadrant)){
			setupIndicesRightEdgeCells();
			console.log("In right edge cell");
		}
		else{
			setupIndices3x3Cells();
		}
		

		/*
		Process and render the current player quadrant and the surrounding cells (3x3 total)
		*/
		for(var i=0; i<renderIndices.length; i++){
			vao_ext.bindVertexArrayOES(terrainVAOs[ renderIndices[i] ]); //player.get.quadrant
			gl.drawElements(
				gl.TRIANGLE_STRIP, 
				quadrantVertices.length / 3 * 2, // vertices * 2 is the number of indices
				gl.UNSIGNED_INT, // can probably use GLU_SHORT once fixed, remove extension
				0 // start from the start of the current quadrant
			); 
			vao_ext.bindVertexArrayOES(null); 
		}
		
	}
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	/*
	Weird crater code below
	*/


	/*
	This function takes in how big the hill/crater should be.
	It works out the array elements that need to be changed.
	It stores those elements in directionNumbers array.

	1 Ring = 3x3 grid
	2 Ring = 5x5 grid
	3 Ring = 7x7 grid etc
	*/
	function createElementRings(numberOfRings){
		
		var previousTotalNumberOfElements = 0;
		
		/*
		With each iteration this loop creates a element ring bigger than the last
		
		3x3 then,
		5x5 then,
		7x7 etc
		*/
		for(var currentRingNumber=1; currentRingNumber<=numberOfRings; currentRingNumber++){
			
			//Top row element loop (t)
			//Side row element loop (s) 
			//Bottom row element loop (b)
			
			/*
			Each increment in loop size has 2 more top row elements than the last
			
			1 ring = (1 * 2) + 1 = 3 top row elements
			2 ring = (2 * 2) + 1 = 5 top row elements
			3 ring = (3 * 2) + 1 = 7 top row elements
			*/
			var topElements = (currentRingNumber * 2) + 1;
			for(var t=0; t<topElements; t++){
				directionNumbers.push(t - currentRingNumber); //top row x, should increment
				directionNumbers.push(-currentRingNumber); //top row y, it shouldn't increment
			}
			//console.log("Top elements: " + directionNumbers);
			
			/*
			If currentRingNumber is 1, then its a weird case. Just assign sideElements to be 1.
			
			Side elements is the number of elements TO EACH SIDE of the centre point.
			So 1 side element, means 1 element on left, AND 1 element on right of centre point.
			*/
			var sideElements;
			if(currentRingNumber === 1){
				sideElements = 1;
			}else{
				sideElements = (currentRingNumber * 2) - 1;
			}
			
			/*
			Below is getting previous elements in directionNumbers array and using them
				
			Side elements has to do left and right side of centre point.
			
			Use existing top left/top right coordinates as a start point,
			but make sure to decrement them before using them.
			
			topLeftElementX and topLeftElementY are always first 2 values in directionNumbers.
			If we're on 2nd iteration, add the total number of elements,
			to get the new start topLeftElementX and topLeftElementY
			*/
			var topLeftElementX = directionNumbers[previousTotalNumberOfElements]; 
			var topLeftElementY = directionNumbers[previousTotalNumberOfElements + 1]; 
			
			var topRightElementX = directionNumbers[previousTotalNumberOfElements + (topElements * 2) - 2];
			var topRightElementY = directionNumbers[previousTotalNumberOfElements + (topElements * 2) - 1];
			
			/*
			Left side, going down
			topLeftElementY - 1 to shift it onto the element that hasn't been chosen yet
			*/
			for(var l=0; l<sideElements; l++){
				directionNumbers.push(topLeftElementX); //x, shouldn't increment
				directionNumbers.push(topLeftElementY + 1 + l); //y, should increment to do down row
			}
			/*
			Right side, going down
			*/
			for(var r=0; r<sideElements; r++){
				directionNumbers.push(topRightElementX); //x, shouldn't increment
				directionNumbers.push(topRightElementY + 1 + r); //y, should increment to do down row
			}
			
			//console.log("Top elements + side elements: " + directionNumbers);
			
			//Always same number of top and bottom elements
			var bottomElements = (currentRingNumber * 2) + 1;
			for(var b=0; b<bottomElements; b++){
				directionNumbers.push(b - currentRingNumber); //bottom row x, should increment
				directionNumbers.push(currentRingNumber); //bottom row y, it shouldn't increment
			}
			
			//console.log("Top elements + side elements + bottom elements: " + directionNumbers);
			
			previousTotalNumberOfElements = directionNumbers.length;
		}
		
		//console.log("Just finished creating element rings they are: " + directionNumbers);
	}


	/*
	The idea of this function has been taken from: 
	http://stackoverflow.com/questions/12743748/find-elements-surrounding-an-element-in-an-array

	The idea is to pass in an array containing the directions 
	you want to navigate from the centre point to.

	And then I set the height on the elements I navigated to

	Could pass in whether to make a hill or crater, and the max height values it should have

	Adds direction numbers to centre coordinate at (xIndex, yIndex)

	Call this function AFTER the original heightMap has been generated,
	otherwise the values would get overwritten.
	*/
	function getSurroundingElements(directions, xIndex, yIndex, hill, steepness){
		
		var heightIncrement;
		
		if(hill === true){
			//Making crater
			heightIncrement = steepness * 5;
		}else{
			//Making crater
			heightIncrement = steepness * -5;
		}
		
		//This is the centre (highest point of hill, or lowest point of crater)
		heightMap[xIndex][yIndex] = -35; 
		
		//Go through directions array in pairs, +=2
		for(var i=0; i<directions.length; i+=2){

			//Want the +=2 for this bit
			var newXIndex = xIndex + directions[i]; 
			var newYIndex = yIndex + directions[i+1];
			
			/*
			Set values differently based on what 'ring' its on
			
			Take the surrounding cells for example 3x3, grid 
			Then -1 for no middle element, 
			Then -1 again because its an array index and starts at 0.

			So 3x3 grid =  9 cells - 1 = 8 surrounding cells - 1 = [0,1,2,...7]
			So 5x5 grid = 25 cells - 1 = 24 surrounding cells -1 = [0,1,2,...23]
			*/
			if(i <= 7 * 2){ 
				//Point lies within 3x3
				heightMap[newXIndex][newYIndex] = -35;
			}
			else if(i <= 23 * 2){
				//Point lies within 5x5
				heightMap[newXIndex][newYIndex] = -30;
			}
			else if(i <= 47 * 2){
				//Point lies within 7x7
				heightMap[newXIndex][newYIndex] = -25;
			}
			else if(i <= 79 * 2){
				//Point lies within 9x9
				heightMap[newXIndex][newYIndex] = -20;
			}
			else if(i <= 119 * 2){
				//Point lies within 11x11
				heightMap[newXIndex][newYIndex] = -15;
			}
			else if(i < 167 * 2){
				//Point lies within 13x13
				heightMap[newXIndex][newYIndex] = -10;
			}
			else if(i < 223 * 2){
				//Point lies within 15x15
				heightMap[newXIndex][newYIndex] = -5;
			}
		}
	}

	/*
	Be careful if creating different size hills/craters
		If I reset the directionNumbers, previous ones wont render?
		But if I don't reset, how can I change size of hill/crater
		
		Could maybe create a newDirections array for each size of hill
		And don't reset any of the existing direction arrays
	*/
	function createCraters(){
			/*
		1 = 1 element ring, so 3x3 grid, minimum spawn of (1, 1)
		2 = 2 element ring, so 5x5 grid, minimum spawn of (2, 2)
		3 = 3 element ring, so 7x7 grid, minimum spawn of (3, 3)
		4 = 4 element ring, so 9x9 grid, minimum spawn of (4, 4)
		5 = 5 element ring, so 11x11 grid, minimum spawn of (5, 5)
		6 = 6 element ring, so 13x13 grid, minimum spawn of (6, 6)
		7 = 7 element ring, so 15x15 grid, minimum spawn of (7, 7)
		*/
		createElementRings(7); 
		getSurroundingElements(directionNumbers, 47, 47); //max index values 256, 256
		getSurroundingElements(directionNumbers, 57, 47); //max index values 256, 256
	}

	
	
	
	
	
	
	
	
	
	
	
}























