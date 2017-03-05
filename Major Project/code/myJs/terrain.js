
function Terrain(){
	/*
	Private variables
	*/
	var rows = 1024; //1024
	var columns = 1024;
	var size = rows * columns;
	var heightMap = [];

	var terrainVertices = [];
	var terrainNormals = [];
	
	var terrainVertexBuffer;
	var terrainElementsBuffer;
	var terrainTextureCoordinateBuffer;
	var terrainNormalBuffer;
	
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
	
	createHeightMap();
	fillHeightMap();
	createCraters();
	createTerrainVertices();
	createTerrainNormals();//could use existing loop
	setupTerrainBuffers();
	
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
			return heightMap[temporaryHeightMapZ][temporaryHeightMapX];
		}
	}
	//Needed in rockGenerator
	this.get = {
		get getTerrainRows(){
			return rows;
		}
	};
	
	/*
	Private
	
	Create the 2D heightMap array:
		heightMap[terrainRows][terrainColumns];
	*/
	function createHeightMap(){
		heightMap = new Array(rows); 
		for(var i=0; i<rows; i++){
			heightMap[i] = new Array(columns);
		}
	}
	
	/*
	Private
	
	Fills the 2D HeightMap with initial values
	
	Very wide
		var offsetIncrement = 0.001;
		scale = 300;
	Regular
		var offsetIncrement = 0.05;
		scale = 3;
	*/
	function fillHeightMap(){
		var xOff = 0;
		var yOff = 0;
		var offsetIncrement;
		var scale;
		
		//Brown section
		for(var x=0; x<1024; x++){
			for(var y=0; y<1024; y++){
				offsetIncrement = 0.005;
				scale = 15;
				height = perlin.noise(xOff, yOff, xOff) * scale;
				heightMap[x][y] = height;
				xOff+=offsetIncrement;
			}
			xOff = 0;
			yOff += offsetIncrement;
		}
		xOff = 0;
		yOff = 0;
		
		//Sand section
		for(var x=0; x<512; x++){
			for(var y=512; y<1024; y++){
				offsetIncrement = 0.05;
				scale = 2;
				height = perlin.noise(xOff, yOff, xOff) * scale;
				heightMap[x][y] = height;
				xOff+=offsetIncrement;
			}
			xOff = 0;
			yOff += offsetIncrement;
		}
		xOff = 0;
		yOff = 0;		
		
		//Red section
		for(var x=512; x<1024; x++){
			for(var y=0; y<1024; y++){
				offsetIncrement = 0.005;
				scale = 50;
				height = perlin.noise(xOff, yOff, xOff) * scale;
				heightMap[x][y] = height;
				xOff+=offsetIncrement;
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
	function createTerrainVertices(){
		var terrainX = 0,
			terrainY = 0,
			terrainZ = 0;
			
		var previousX, previousY, previousZ; //
		for(var x=0; x<rows; x++){
			for(var y=0; y<columns; y++){
				
				terrainVertices.push(terrainX); 
				terrainVertices.push(heightMap[x][y]);
				terrainVertices.push(terrainZ); 
				
				//Move along in the row
				terrainX+=1;
				
				//Set all to 1... bad but should work temporaryHeightMapX
				//terrainNormals.push(0);//x
				//terrainNormals.push(1);//y
			//	terrainNormals.push(0);//z
				
				
				
				//if y>1 or something
				//var vector0 = [terrainX, heightMap[x][y], terrainZ];
				//var vector1 = [];
				
				
				
				
			}
			//New row, reset X, and increment Z
			terrainX = 0;
			terrainZ+=1;
		}
		
		//Reset all values as above loop changed them
		x = 0; y = 0; z = 0; 
		
		console.log("Terrain vertices: " + size);
		console.log("Individual terrain x,y,z values: " + terrainVertices.length);		
	}
	
	/*
	Could have this in another loop for efficiency, but only worked out once, so its ok
	Not sure about what order the normals are supposed to go in
	*/
	function createTerrainNormals(){
		for(var i=0; i<terrainVertices.length; i+=3){
			//Get 1st point (3 vertices), 2nd point(3 vertices), 3rd (3 vertices)(under) point
			
			//Top left vertex
			var vertex0x = terrainVertices[i];
			var vertex0y = terrainVertices[i+1];
			var vertex0z = terrainVertices[i+2];
			
			//Top right vertex
			var vertex1x = terrainVertices[i+3];
			var vertex1y = terrainVertices[i+4];
			var vertex1z = terrainVertices[i+5];
			
			//Under top left vertex
			//Its the current row times the current column!
			//They both dont exist, just add a single value
			//i + value 
			//i + 1 + value
			//try value as 1024, would push current value exactly 1 row down
			// times 3, because 3 vertices, rows isnt 100% correct, as its a 1d array, with an x,y,z each
			var vertex2x = terrainVertices[i + (rows*3)];
			var vertex2y = terrainVertices[(i + 1) + (rows*3)];
			var vertex2z = terrainVertices[(i + 2) + (rows*3)];
			
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
			
			terrainNormals.push(-normal[0]); //x
			terrainNormals.push(-normal[1]); //y
			terrainNormals.push(-normal[2]); //z
			
			//console.log("A terrain normal is, x: " + -normal[0] + ", y: " + -normal[1] + ", z:" + -normal[2]);
		}
		
		/*
		Should have same number of normals to individual x,y,z points
		Because each x,y,z has a normal x,y,z
		
		TerrainVertices length / 3 = 104k vertices, each with a normal vector, of 3 components
		*/
		console.log("Normals length: " + terrainNormals.length);
	}
	
	
	/*
	Private
	*/
	function setupTerrainBuffers(){
		setupTerrainVertexBuffer();
		setupTerrainIndiciesBuffer();
		setupTerrainTextureBuffer();
		setupTerrainNormalBuffer();
		console.log("Setup terrain buffers");
	}
	
	/*
	Private
	*/
	function setupTerrainVertexBuffer(){
		terrainVertexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, terrainVertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(terrainVertices), gl.DYNAMIC_DRAW);
		gl.enableVertexAttribArray(positionAttribLocation);
		gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, false, 0, 0);	
	}
	
	/*
	Private
	
	Code from: http://stackoverflow.com/questions/5915753/generate-a-plane-with-triangle-strips
	Answer with 11 upvotes
	*/
	function setupTerrainIndiciesBuffer(){
		//make the *2 stuff, overallRows and overallColumsn and remove x2
		// * 2 orginaly then *4 cos double, make this non bad eventually, base off varaible
		var indices = new Array(size * 2 ); // i think 64 verts = 124 indicies

		// Set up indices
		var i = 0;
		for (var r = 0; r < rows - 1; ++r) {
			indices[i++] = r * columns ;
			for (var c = 0; c < columns ; ++c) {
				indices[i++] = r * columns + c;
				indices[i++] = (r + 1) * columns  + c;
			}
			indices[i++] = (r + 1) * columns  + (columns- 1);
		}
		
		//console.log(indices);
		
		console.log("Length of indices: " + indices.length);
		
		elementsBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementsBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(indices), gl.DYNAMIC_DRAW);		
	}
	
	/*
	Every texture goes from 0 -> 1, regardless of dimensions

	GL has 32 texture registers, we're using TEXTURE0
	Bind the previously loaded texture to that register
	Set the sampler in the shader to use that texture
	*/
	function setupTerrainTextureBuffer(){
		/*
		Create the buffer,
		Bind to it,
		Buffer the data
		*/
		terrainTextureCoordinateBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, terrainTextureCoordinateBuffer);

		/*
		Store texture coordinates for each face
		Texture coordinates range 0 -> 1
		*/
		var textureCoordinates = [];
		
		/*
		Need a double for loop to set accurately
		1/256 for max row increment?
			=0.00390625 * 265 = 1. so increment by that
		1/512 = 0.001953125
		1/1024 = 0.0009765625
		1/2048 = 0.00048828125
		*/
		var xUV = 0;
		var yUV = 0;
		for(var x=0; x<rows; x++){
			for(var y=0; y<columns; y++){
				textureCoordinates.push(xUV);  
				textureCoordinates.push(yUV); 
				xUV += 0.00048828125;
			}
			xUV = 0;
			yUV += 0.00048828125;
		}
		
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.DYNAMIC_DRAW);
		//gl.vertexAttribPointer(textureCoordLocation, 2, gl.FLOAT, false, 0, 0);	
	}
	
	function setupTerrainNormalBuffer(){
		terrainNormalBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, terrainNormalBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(terrainNormals), gl.DYNAMIC_DRAW);
		gl.enableVertexAttribArray(normalAttribLocation);
		gl.vertexAttribPointer(normalAttribLocation, 3, gl.FLOAT, false, 0, 0);			
	}
	
	/*
	Public
	
	Apply matrices, then draw the terrain.
	*/
	this.render = function(){	
		/*
		Set the current texture, so updateAttributesAndUniforms gets updated
		For specular light
		*/
		lightColour = [1, 1, 1];
		currentTexture = myPerlinTexture;
		//currentTexture = depletedTexture;
		
		/*
		Weird names, in matrcies u have global matrixs as rotatX, rotateY,
		but here u have xRotation..... ??????
		*/
		scale = m4.scaling(1, 1, 1);
		rotateX = m4.xRotation(0);
		rotateY = m4.yRotation(0);
		rotateZ = m4.zRotation(0);
		position = m4.translation(0, 0, 0);
		
		//Times matrices together
		updateAttributesAndUniforms();

		//Vertices
		gl.bindBuffer(gl.ARRAY_BUFFER, terrainVertexBuffer);
		gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, terrainTextureCoordinateBuffer);
		gl.vertexAttribPointer(textureCoordLocation, 2, gl.FLOAT, false, 0, 0);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, currentTexture.getTextureAttribute.texture); //myPerlinTexture
		gl.uniform1i(gl.getUniformLocation(program, "uSampler"), 0);

		//Normals
		gl.enableVertexAttribArray(normalAttribLocation);
		gl.bindBuffer(gl.ARRAY_BUFFER, terrainNormalBuffer);
		gl.vertexAttribPointer(normalAttribLocation, 3, gl.FLOAT, false, 0, 0);
		
		
		//Elements
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementsBuffer);
		
		//Cant draw from 0, as it makes shader process everything
		/*
		Mode
		Number of indices ( divide by 3 because 3 vertices per vertex ) then * 2 to get number of indices
		Type
		The indices
		*/
		gl.drawElements(
			gl.TRIANGLE_STRIP, 
			terrainVertices.length / 3 * 2, //draw only like 100 see how far u get
			
			gl.UNSIGNED_INT, 
			0 //start from like player position
			
			
		); 	
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














