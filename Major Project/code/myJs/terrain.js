
var terrainVertices = []; // Contains all of the terrains x,y,z vertices

var terrainX = 0,
	terrainY = 0,
	terrainZ = 0;

/*
Works with 2048, probably way more
Max values are now 2.147BILLION?	
*/
var terrainRows = 512; 
var terrainColumns = 512;

var terrainSize = terrainRows * terrainColumns;
var terrainScale = 1;

var heightMap; 

/*
Create the 2D heightMap array:
	heightMap[terrainRows][terrainColumns];
*/
function createHeightMap(){
	heightMap = new Array(terrainRows); 
	
	for(var i=0; i<terrainRows; i++){
		heightMap[i] = new Array(terrainColumns);
	}
}

/*
Fills the 2D HeightMap with initial values
*/
function fillHeightMap(){
	
	/*
	Bumpy terrain
	offsetX = 3.01
	offsetY = 5.01
	offsetZ = 7.01
	*/
	
	var xOff = 0;
	var yOff = 0;
	
	var perlin = new ImprovedNoise();
	var offsetX = 0;
	var offsetY = 0;
	var offsetZ = 0;
	var offsetXIncrement = 0.1; //How it moves along the graph
	var offsetYIncrement = 0.1; //How it moves along the graph
	var offsetZIncrement = 0.1; //How it moves along the graph
	var scale = 3;
	
	var slopeHeight = 1;
	var offsetIncrement = 0.05;
	
	
	//For each row, do all the columns
	for(var x=0; x<terrainRows; x++){
		for(var y=0; y<terrainColumns; y++){
		
			var height = perlin.noise(xOff, yOff, xOff) * scale;
			//var height = noise.simplex2(xOff, yOff) * scale;
			//console.log("v is: " + height);

			/*
			//Messing about with random cliffs, remove these to get a flat plane
			if(y > 32 && y < 64){
				height += 15;
			}
			if(y > 128){
				height += 5;
			}
			if(x > 128){
				height += 5;
			}
			*/
			
			heightMap[x][y] = height;
			xOff+=offsetIncrement;
			
			/*
			Previous code below, useful for really bumpy flat areas
			*/
			//var height = perlin.noise(offsetX, offsetY, offsetZ) * scale;
			//heightMap[x][y] = height; 
			//offsetX += offsetXIncrement;
			//offsetY += offsetYIncrement;
			//offsetZ += offsetZIncrement;		
				
		}
		xOff = 0;
		yOff += offsetIncrement;
	}
}


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
function createHills(){
	
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
	
}

/*
Read comment above createHills
*/
function createCraters(){
	
}

/*
I have a 2D heightMap

Now create the terrain vertices using x, y, z values 
Where y is the value from the heightMap we made.
*/
function createTerrainVertices(){

	for(var x=0; x<terrainRows; x++){
		for(var y=0; y<terrainColumns; y++){
			terrainVertices.push(terrainX); 
			terrainVertices.push(heightMap[x][y]);
			terrainVertices.push(terrainZ); 
			
			//Move along in the row
			terrainX++;
		}
		//New row, reset X, and increment Z
		terrainX = 0;
		terrainZ++;
	}
	
	//Reset all values as above loop changed them
	terrainX = 0; terrainY = 0; terrainZ = 0; 

	console.log("Terrain vertices: " + terrainSize);
	console.log("Individual terrain x,y,z values: " + terrainVertices.length);
}



var positions;
var positionAttribLocation;
var elements;
var terrainColors = [];

function setupTerrainBuffers(){
	setupTerrainVertexBuffer();
	setupTerrainIndiciesBuffer();
	//setupTerrainColorBuffer();
	setupTerrainTextureBuffer();
}

function setupTerrainVertexBuffer(){
	positions = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positions);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(terrainVertices), gl.STATIC_DRAW);
	positionAttribLocation = gl.getAttribLocation(program, 'position');
	gl.enableVertexAttribArray(positionAttribLocation);
	gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, false, 0, 0);	
}


/*
Code from: http://stackoverflow.com/questions/5915753/generate-a-plane-with-triangle-strips
Answer with 11 upvotes
*/
function setupTerrainIndiciesBuffer(){
	//make the *2 stuff, overallRows and overallColumsn and remove x2
	// * 2 orginaly then *4 cos double, make this non bad eventually, base off varaible
    var indices = new Array(terrainSize * 2 ); // i think 64 verts = 124 indicies

    // Set up indices
    var i = 0;
    for (var r = 0; r < terrainRows - 1; ++r) {
        indices[i++] = r * terrainColumns ;
        for (var c = 0; c < terrainColumns ; ++c) {
            indices[i++] = r * terrainColumns + c;
            indices[i++] = (r + 1) * terrainColumns  + c;
        }
        indices[i++] = (r + 1) * terrainColumns  + (terrainColumns- 1);
    }
	
	//console.log(indices);
	
	console.log("Length of indices: " + indices.length);
	
	elements = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elements);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(indices), gl.STATIC_DRAW);
}



/*
Every texture goes from 0 -> 1, regardless of dimensions

GL has 32 texture registers, we're using TEXTURE0
Bind the previously loaded texture to that register
Set the sampler in the shader to use that texture
*/
var terrainTextureCoordinateBuffer;
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
	*/
	var xUV = 0;
	var yUV = 0;
	for(var x=0; x<terrainRows; x++){
		for(var y=0; y<terrainColumns; y++){
			textureCoordinates.push(xUV);  
			textureCoordinates.push(yUV); 
			xUV += 0.00390625;
		}
		xUV = 0;
		yUV += 0.00390625;
	}
	
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);
	//gl.vertexAttribPointer(textureCoordLocation, 2, gl.FLOAT, false, 0, 0);
}







/*
Apply matrices, then draw the terrain.
*/
function drawTerrain(){
	scale = m4.scaling(terrainScale, terrainScale, terrainScale)
	xRotation = m4.xRotation(0);
	yRotation = m4.yRotation(0);
	zRotation = m4.zRotation(0);
	position = m4.translation(terrainX, terrainY, terrainZ);
	
	//Times matrices together
	updateAttributesAndUniforms();

	//Vertices
	gl.bindBuffer(gl.ARRAY_BUFFER, positions);
	gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, false, 0, 0);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, terrainTextureCoordinateBuffer);
	gl.vertexAttribPointer(textureCoordLocation, 2, gl.FLOAT, false, 0, 0);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, myTexture);
	gl.uniform1i(gl.getUniformLocation(program, "uSampler"), 0);
	
	
	//Elements
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elements);
	
	/*
	Mode
	Number of indices ( divide by 3 because 3 vertices per vertex ) then * 2 to get number of indices
	Type
	The indices
	*/
	gl.drawElements(
		gl.TRIANGLE_STRIP, 
		terrainVertices.length / 3 * 2,
		gl.UNSIGNED_INT, //gl.UNSIGNED_SHORT,
		elements
	); 
	
}




var myTexture;
function initTextures(){
	//http://stackoverflow.com/questions/19722247/webgl-wait-for-texture-to-load/19748905#19748905
	//https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL
	//https://github.com/mdn/webgl-examples/blob/gh-pages/tutorial/sample6/webgl-demo.js
	myTexture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, myTexture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
				  new Uint8Array([255, 0, 0, 255])); // red

	myImage = new Image();
	//myImage.src = 'resources/PerlinNoiseFractal.png';
	myImage.src = 'resources/new1.png';
	myImage.onload = function (){handleTextureLoaded(myImage, myTexture);}
	
}

/*
This gets run after image is done loading
*/
function handleTextureLoaded(image, texture){

	gl.bindTexture(gl.TEXTURE_2D, texture);
	
	// Writes image data to the texture
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
	
	/*
	Setup filtering, controls how image is filtered when scaling
	Using linear filtering when scaling up
	Using mipmap when scaling down
	*/
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
	
	gl.generateMipmap(gl.TEXTURE_2D);
	
	// Ok, we're done manipulating the texture, bind null to gl.TEXTURE_2D
	gl.bindTexture(gl.TEXTURE_2D, null);
}





