/*
To add more terrain or split current terrain

Check i value in addTerrainVertices function

Maybe try each (i % 8 === 0) {noise += 5}, and see what happens
See if u can change it both ways rather than just lengthwards?
*/

var terrainRows = 256;
var terrainColumns = 256;
var terrainSize = terrainRows * terrainColumns; //terrainRows * terrainCols * area2Rows * area2Cols
var heightMap = []; //A 1D Array

var terrainScale = 1;

/*
The values are the height of the vertex
*/
addTerrainVertices();
function addTerrainVertices(){
	
	var perlin = new ImprovedNoise();
	var offsetX = 0;
	var offsetY = 0;
	var offsetZ = 0;
	var offsetXIncrement = 0.05; //How it moves along the graph? //5
	var offsetYIncrement = 0.03; //How it moves along the graph? //3
	var offsetZIncrement = 0.08; //How it moves along the graph? //8
	var scale = 1;
	
	for(var i=0; i<terrainSize; i++){
		if(i < terrainSize/4 ){
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
		else if(i < terrainSize/2){
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
		else{
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
				/*
				if(offsetX > 22.5){
					offsetX = 0;
				}
				
				if(offsetY > 17.5){
					offsetY = 0;
				}
				
				if(offsetZ > 28.8){
					offsetZ = 0;
				}
				*/
			
			
		}//end if
	} //end for

//	console.log(heightMap);

}


/*
U have height values, now assign x and z values to make x,y,z point
*/
var terrainVertices = [];
var terrainX = 0;
var terrainY = 0; //? or heightMap[0]
var terrainZ = 0;


//For each vertex, give x,y,z position
for(var i=0; i<terrainSize; i++){
	
	//	console.log("x: " + terrainX + ", z: " + terrainZ);
	terrainVertices.push(terrainX); //x
	terrainVertices.push(heightMap[i]); //y for now 0,was heightMap[i]
	terrainVertices.push(terrainZ); //z
	
	//console.log("my x: " + terrainX);
	//console.log("my z: " + terrainZ);
	
	if(terrainX === terrainRows-1){
		terrainX = 0; //reset
		terrainZ++;
		
	}else{
		terrainX++;
	}
}

terrainX = 0; terrainY = 0; terrainZ = 0; //reset cos above loop changed 

console.log("Terrain vertices: " + terrainSize);
console.log("Individual terrain x,y,z values: " + terrainVertices.length);


//Terrain vertices contains all sectors/areas

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