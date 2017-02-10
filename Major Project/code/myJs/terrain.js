/*
To add more terrain or split current terrain

Check i value in addTerrainVertices function

Maybe try each (i % 8 === 0) {noise += 5}, and see what happens
See if u can change it both ways rather than just lengthwards?
*/

var terrainRows = 256;
var terrainColumns = 256;
var terrainSize = terrainRows * terrainColumns; //terrainRows * terrainCols * area2Rows * area2Cols
var heightMap = new Array(terrainRows); 
for(var i=0; i<terrainRows; i++){
	heightMap[i] = new Array(terrainColumns);
}
//Now have array heightMap[256][256];


var terrainScale = 1;

/*
The values are the height of the vertex
*/
fillHeightMap();
function fillHeightMap(){
	
	var perlin = new ImprovedNoise();
	var offsetX = 0;
	var offsetY = 0;
	var offsetZ = 0;
	var offsetXIncrement = 0.05; //How it moves along the graph? //5
	var offsetYIncrement = 0.03; //How it moves along the graph? //3
	var offsetZIncrement = 0.08; //How it moves along the graph? //8
	var scale = 1;
	
	//For each row, do all the columns
	for(var x=0; x<terrainRows; x++){
		for(var y=0; y<terrainColumns; y++){
			
			var height = perlin.noise(offsetX, offsetY, offsetZ) * scale;
				heightMap[x][y] = height; 
				offsetX += offsetXIncrement;
				offsetY += offsetYIncrement;
				offsetZ += offsetZIncrement;	
				
			
			/*
			if(i < terrainSize/8 ){
				var height = perlin.noise(offsetX, offsetY, offsetZ) * scale;
				heightMap.push(height); 
				offsetX += offsetXIncrement;
				offsetY += offsetYIncrement;
				offsetZ += offsetZIncrement;	

				//random stuff to get smoother terrain
				if(offsetX > 0.3){
					offsetX = 0;
				}
				
				if(offsetY > 0.5){
					offsetY = 0;
				}
				
				if(offsetZ > 0.8){
					offsetZ = 0;
				}
			}
			else if(i < terrainSize/6){
				//Area 2
				//offsetX = 0;
				//offsetY = 0;
				//offsetZ = 0;
				scale = 3; //important
				
				var height = perlin.noise(offsetX, offsetY, offsetZ) * scale;
				heightMap.push(height); 
				offsetX += offsetXIncrement;
				offsetY += offsetYIncrement;
				offsetZ += offsetZIncrement;	

					//random stuff to get smoother terrain
					if(offsetX > 0.3){
						offsetX = 0;
					}
					
					if(offsetY > 0.5){
						offsetY = 0;
					}
					
					if(offsetZ > 0.8){
						offsetZ = 0;
					}
			}
			else if(i < terrainSize/4){
				scale = 1; //important
				
				offsetXIncrement = 0.1;
				offsetYIncrement = 0.1;
				offsetZIncrement = 0.1;
				
				var height = perlin.noise(offsetX, offsetY, offsetZ) * scale;
				heightMap.push(height + 5); 
				offsetX += offsetXIncrement;
				offsetY += offsetYIncrement;
				offsetZ += offsetZIncrement;	

					//random stuff to get smoother terrain
					
					if(offsetX > 22.5){
						offsetX = 0;
					}
					
					if(offsetY > 17.5){
						offsetY = 0;
					}
					
					if(offsetZ > 28.8){
						offsetZ = 0;
					}
					
				
				
			}else{
				scale = 1; //important
				
				offsetXIncrement = 0.1;
				offsetYIncrement = 0.1;
				offsetZIncrement = 0.1;
				
				var height = perlin.noise(offsetX, offsetY, offsetZ) * scale;
				heightMap.push(height - 10); 
				offsetX += offsetXIncrement;
				offsetY += offsetYIncrement;
				offsetZ += offsetZIncrement;
			}//end if				
			*/
				
			
			
		} //end for
	}

//	console.log(heightMap);

}


/*
Need a function to fill this direction numbers with elements
So can create small and large hills/craters
Have a function that takes in how large the hill/crater should be
This will determine how many element rings it creates.

Perhaps set the height of the original vertex to low/high, for crater/hill

Also have a variable to change size of slope increment +/- in other function

1 Ring = 3x3 grid
2 Ring = 5x5 grid
3 Ring = 7x7 grid
*/
function createElementRings(numberOfRings){
	
	var previousTotalNumberOfElements = 0;
	
	if(numberOfRings === 0){
		console.log("Why would you enter 0 rings?");
	}
	
	/*
	Each iteration this loop creates element ring
	3x3 then,
	5x5 then,
	7x7 etc
	
	Might have to replace all occurrences on numberOfRings with i :/
	*/
	for(var currentRingNumber=1; currentRingNumber<=numberOfRings; currentRingNumber++){
		
		//Top    row element loop (t)
		//Side   row element loop (s) 
		//Bottom row element loop (b)
		
		/*
		Each new element loop has 2 more top row elements than the last
		
		1 ring = (1 * 2) + 1 = 3 top row elements
		2 ring = (2 * 2) + 1 = 5 top row elements
		3 ring = (3 * 2) + 1 = 7 top row elements
		*/
		var topElements = (currentRingNumber * 2) + 1;
		for(var t=0; t<topElements; t++){
			directionNumbers.push(t - currentRingNumber); //top row x, should increment
			directionNumbers.push(-currentRingNumber); //top row y, it shouldn't increment
		}
		
		console.log("Top elements: " + directionNumbers);
		
		/*
		If currentRingNumber is 1, then its a weird case. Just assign sideElements to be 1.
		
		Side elements is the number of elements TO EACH SIDE of the centre point.
		So 1 side element, means 1 element on left, and 1 element on right of centre point.
		*/
		var sideElements;
		if(currentRingNumber === 1){
			sideElements = 1;
		}else{
			//Side elements is actually how many x,y values.
			//1 side element = 1 x and 1 y?
			sideElements = (currentRingNumber * 2) - 1;
		}
		
		/*
		New method
		
		Below is getting previous elements and using them
		
		*/
		
		//previousTotalNumberOfElements = directionNumbers.length - 1; //-1 because array starts at 0 
		
		/*
		Side elements has to do left and right side of centre point.
		
		Use existing top left/top right coordinates as a start point,
		but make sure to decrement them before using them.
		
		topLeftElementX and topLeftElementY are always first 2 values in directionNumbers.
		If we're on 2nd iteration, add the total number of elements,
		to get the new start topLeftElementX and topLeftElementY
		*/
		var topLeftElementX = directionNumbers[previousTotalNumberOfElements]; //top left x position in grid
		var topLeftElementY = directionNumbers[previousTotalNumberOfElements + 1]; //top left y position in grid
		
		/*
		2nd iteration length = 13
		*/
		var topRightElementX = directionNumbers[previousTotalNumberOfElements + (topElements * 2) - 2]; //top right x position in grid
		var topRightElementY = directionNumbers[previousTotalNumberOfElements + (topElements * 2) - 1]; //top right y position in grid
		
		/*
		Left side, going down
		topLeftElementY - 1 to shift it onto the element that hasn't been chosen yet
		*/
		for(var l=0; l<sideElements; l++){
			directionNumbers.push(topLeftElementX); //x, shouldn't increment
			directionNumbers.push(topLeftElementY + 1 + l); //y, should increment to do down row
			//directionNumbers.push(previousTotalNumberOfElements); //x, shouldn't increment
			//directionNumbers.push(previousTotalNumberOfElements + 1); //y, should decrement
		}
		
		/*
		Right side, going down
		
		Basically, I invert the values as a quick hack to fix them, otherwise they'd be on left side :/
		Nope, still screwing up
		
		For 7x7 grid, getting: -2,4, -2,5, -2,6, -2,7, -2,8
		
		Once fixed, check the 5x5 grid again
		
		Fix the 5x5 first, then check 7x7
		*/
		for(var r=0; r<sideElements; r++){
			directionNumbers.push(topRightElementX); //x, shouldn't increment
			directionNumbers.push(topRightElementY + 1 + r); //y, should increment to do down row
			//directionNumbers.push(previousTotalNumberOfElements + sideElements); //x, shouldn't increment
			//directionNumbers.push(previousTotalNumberOfElements + sideElements + 1); //y, should decrement
		}
		
		console.log("Top elements + side elements: " + directionNumbers);
		
		//Always same number of top and bottom elements
		var bottomElements = (currentRingNumber * 2) + 1;
		for(var b=0; b<bottomElements; b++){
			directionNumbers.push(b - currentRingNumber); //bottom row x, should increment
			directionNumbers.push(currentRingNumber); //bottom row y, it shouldn't increment
		}
		
		console.log("Top elements + side elements + bottom elements: " + directionNumbers);
		
		previousTotalNumberOfElements = directionNumbers.length;
		
		/*
		Increment height? no, in other function
		*/
	}
	
	console.log("Just finished creating element rings they are: " + directionNumbers);
	
	
}

//What values should be added onto the original element, to obtain surrounding element rings
var directionNumbers = [
	/*
	
	// 3X3 GRID BELOW
	
	-1, 0, //left
	+1, 0, //right
	
	0, +1, //bottom middle
	0, -1, //top middle
	
	-1, -1, //top left
	+1, -1, //top right
	
	-1, +1, //bottom left
	+1, +1  //bottom right
	
	
	// Outer 5X5 GRID
	// Top 5 values
	// Left 3 values
	// Right 3 values
	// Bottom 5 values
	
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
1 = 1 element ring, so 3x3 grid
2 = 2 element ring, so 5x5 grid
3 = 3 element ring, so 7x7 grid
*/
createElementRings(3); 
getSurroundingElements(directionNumbers, 30, 30); //max index values 256, 256

/*
Take the surrounding cells (8) and -1,
So 5x5 grid = 25 cells = 24 surrounding cells -1 = 23
*/
var LOOP_SIZE_ONE_ELEMENTS = 7; 	
var LOOP_SIZE_TWO_ELEMENTS = 23; 
var LOOP_SIZE_THREE_ELEMENTS = 47;

/*
Could pass in whether to make a hill or crater, and the max height values it should have

Adds direction numbers to coordinate (at xIndex, yIndex)

Could be used for hills and craters

Call this function AFTER the original heightMap has been generated,
otherwise the values would get overwritten.
*/
function getSurroundingElements(directions, xIndex, yIndex){
	
	console.log("Original middle element value: " + heightMap[xIndex][yIndex]);
	
	//Reset the original value, don't want to retain its original value
	heightMap[xIndex][yIndex] = -15; //or 15 if want to create hill etc
	
	//Go through directions array in pairs, +=2
	for(var i=0; i<directions.length; i+=2){
		console.log("Directions length: " + directions.length);
	
		//Want the +=2 for this bit
		var newXIndex = xIndex + directions[i]; 
		var newYIndex = yIndex + directions[i+1];
		
		console.log("Output element value: " + heightMap[newXIndex][newYIndex]);
		
		//Set the heightMap value outrageously high to see if its working
		//Set values differently based on what 'ring' its on
		if(i <= 7 * 2){
			//Inner loop
			//console.log("Set height within element ring size 1");
			heightMap[newXIndex][newYIndex] = -15;
		}
		else if(i <= 23 * 2){ // it wants 48, them added together
			//Outer loop
			//console.log("Set height within element ring size 2");
			heightMap[newXIndex][newYIndex] = -10;
		}
		else if(i <= 47 * 2){
			//console.log("Set height within element ring size 3");
			heightMap[newXIndex][newYIndex] = -5;
		}
		else{
			//heightMap[newXIndex][newYIndex] = 15;
			//console.log("I was: " + i);
		}
		//Out of bounds check here
	}
	
}


/*
U have height values, now assign x and z values to make x,y,z point

Terrain Vertices is a 1D array
*/
var terrainVertices = [];
var terrainX = 0;
var terrainY = 0; //? or heightMap[0]
var terrainZ = 0;

for(var x=0; x<terrainRows; x++){
	for(var y=0; y<terrainColumns; y++){
		terrainVertices.push(terrainX); //x
		terrainVertices.push(heightMap[x][y]); //y for now 0,was heightMap[i]
		terrainVertices.push(terrainZ); //z
	
		terrainX++;
	}
	//Reset
	terrainX = 0;
	terrainZ++;
}

terrainX = 0; terrainY = 0; terrainZ = 0; //reset cos above loop changed 

console.log("Terrain vertices: " + terrainSize);
console.log("Individual terrain x,y,z values: " + terrainVertices.length);





var positions = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positions);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(terrainVertices), gl.STATIC_DRAW);
var positionAttribLocation = gl.getAttribLocation(program, 'position');
gl.enableVertexAttribArray(positionAttribLocation);
gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, false, 0, 0);


/*
Code from: http://stackoverflow.com/questions/5915753/generate-a-plane-with-triangle-strips
Answer with 11 upvotes
*/
getIndices();
var indices;
function getIndices(){
//make the *2 stuff, overallRows and overallColumsn and remove x2
// * 2 orginaly then *4 cos double, make this non bad eventually, base off varaible
    indices = new Array(terrainSize * 2 ); // i think 64 verts = 124 indicies

    // Set up indices
    var i = 0;
	//terrainColumns++;
    for (var r = 0; r < terrainRows - 1; ++r) {
	
        indices[i++] = r * terrainColumns ;
        for (var c = 0; c < terrainColumns ; ++c) {
            indices[i++] = r * terrainColumns + c;
            indices[i++] = (r + 1) * terrainColumns  + c;
        }
        indices[i++] = (r + 1) * terrainColumns  + (terrainColumns- 1);
    }
	
	console.log("Length of indices: " + indices.length);
	//console.log(indices);
}

var elements = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elements);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);



//Colors
var terrainColors = [];
for(var a=0; a < terrainVertices.length / 3; a++){
	terrainColors.push(Math.random()); //r
	terrainColors.push(Math.random()); //g
	terrainColors.push(Math.random()); //b
}
/*
192 is fine, because a colour is made up of 3 different values
So 1 vertex does actually have 1 color (from 3 values)
*/
console.log("Color array LENGTH: " + terrainColors.length);

var colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(terrainColors), gl.STATIC_DRAW);
var colorAttribLocation = gl.getAttribLocation(program, 'color');
gl.enableVertexAttribArray(colorAttribLocation);
gl.vertexAttribPointer(colorAttribLocation, 3, gl.FLOAT, false, 0, 0);

/*
Draw the terrain
*/
function drawTerrain(){

	var now = Date.now(); //For rotating stuff
	
	scale = m4.scaling(terrainScale, terrainScale, terrainScale)
	xRotation = m4.xRotation(0);
	yRotation = m4.yRotation(0);
	zRotation = m4.zRotation(0);
	//'works' with playerX, Y, Z, but it shouldnt need to
	position = m4.translation(terrainX, terrainY, terrainZ); //0, -2, -5 to see it
	//console.log("Terrain X: " + terrainX);
	//console.log("Terrain Y: " + terrainY);
	//console.log("Terrain Z: " + terrainZ);
	//terrainX, terrainY, terrainZ
	//playerX, playerY, playerZ
	
	//console.log("Player X: " + playerX);
	//console.log("Player Y: " + playerY);
	//console.log("Player Z: " + playerZ);
	
	//Times matrices together
	updateAttributesAndUniforms();

	
	//Vertices
	gl.bindBuffer(gl.ARRAY_BUFFER, positions);
	gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, false, 0, 0);
	//Color
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	gl.vertexAttribPointer(colorAttribLocation, 3, gl.FLOAT, false, 0, 0);
	//Elements
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elements);
	
	/*
	Mode
	Number of vertices ( divide by 3 because 3 vertices per vertex )
	Type
	The indices
	*/
	gl.drawElements(
		gl.TRIANGLE_STRIP, 
		terrainVertices.length / 3 * 2, //no idea why this x2 is needed but IT IS!
										//MAYBE ITS THE NUMBER OF INDICES!!! MAKES SENSE 128!
		gl.UNSIGNED_SHORT, 
		elements //indices or elements? its working with both
	); 
	
	
}