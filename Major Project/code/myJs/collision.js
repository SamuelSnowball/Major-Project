/*
Causes the bumpy effect when moving over terrain.

Uses the players current X and Z position to find what terrain vertex they're nearest to.
The players height then gets assigned to the nearest terrain vertex.
*/
function setPlayerHeight(){
	
	/*
	Use playerX and Z to find value its height in 1d heightMap array
	
	player X += 1 value into the 1d array
	player Z += 64 values into the 1d array
	
	playerX,Y,Z can be negative, so turn positive first
	
	If it isn't negative, keep it the same and assign it
	*/
	var tempPlayerX = 0;
	var tempPlayerZ = 0;
	if(playerX < 0){
		tempPlayerX = playerX * -1;
	}else{
		tempPlayerX = playerX;
	}
	if(playerZ < 0){
		tempPlayerZ = playerZ * -1;
	}else{
		tempPlayerZ = playerZ;
	}
		
	//console.log("temp x: " + tempPlayerX);
	//console.log("temp z: " + tempPlayerZ);
	
	/*
	Coordinates get floored so they dont screw up the array indexing, must be a integer.
	*/
	if(tempPlayerX / terrainScale < 0.5){
		tempPlayerX = Math.floor(tempPlayerX / terrainScale);
	}else{
		tempPlayerX = Math.ceil(tempPlayerX / terrainScale);
	}
	
	if(tempPlayerZ / terrainScale < 0.5){
		tempPlayerZ = Math.floor(tempPlayerZ / terrainScale);
	}else{
		tempPlayerZ = Math.ceil(tempPlayerZ / terrainScale);
	}
	
	//console.log("rounded x: " + tempPlayerX);
	//console.log("rounded z: " + tempPlayerZ);

	var nearestHeight = heightMap[tempPlayerX][tempPlayerZ];
	//console.log("Nearest height: " + heightMap[tempPlayerX][tempPlayerZ]);

	/*
	See which quadrant they're in, increase height based on it
	*/
	var heightIncrement = 0.01;

	if(playerZ > 0 && playerZ < 256 && playerX > 0 && playerX < 256){
		
		//Not great if nearestHeight is like -1 or -0.8, so the below if statement
		if(nearestHeight < -0.5){
			nearestHeight += 0.3;
		}
		
		playerY = nearestHeight + 2;
		
		var shouldBePlayerHeight;
		if(nearestHeight > 0.4){
			shouldBePlayerHeight = -nearestHeight + 3;
			//console.log("Decent hill");
		}
		if(nearestHeight > 1.4){
			shouldBePlayerHeight = -nearestHeight + 3.5;
			//console.log("Decent hill");
		}
		if(nearestHeight > 1.8){
			shouldBePlayerHeight = -nearestHeight + 4;
			//console.log("Decent hill");
		}
		
		/*
		Slowly increment height to the nearest terrain vertex,
		Stop when that height is reached
		*/
		if(playerY > shouldBePlayerHeight){
		
		}
		else{
			playerY += heightIncrement;
		}
	}
	else{
		//In different section
	}
	
}

/*
Loop through all collision boxes, stop playing moving through rocks

Eventually just check collision of the rocks in the quadrant that the player is in
*/
function testPlayerRockCollision(){
	/*
	Rock hit boxes also contain the scale of the rock
	
	rockHitboxes[i] = x
	rockHitboxes[i] = z
	rockHitboxes[i] = x + width
	rockHitboxes[i] = z + width
	rockHitboxes[i+4] = current rocks scale
	*/
	for(var i=0; i<rockHitboxes.length; i+=5){
		if(	
			//Between x and x+width
			(playerX > rockHitboxes[i] - (rockHitboxes[i+4] * 20) ) && 
			(playerX < rockHitboxes[i+2] + (rockHitboxes[i+4] * 20) ) && 
			//AND Between z and z+width
			(playerZ > rockHitboxes[i+1] - (rockHitboxes[i+4] * 20) ) && 
			(playerZ < rockHitboxes[i+3] + (rockHitboxes[i+4] * 20) )
		){
			/*
			Check if they're going forwards or backwards
			Push them different ways based on movement direction
			*/
			if(moveForward === true){	
				playerX += (cameraPosition[0] - cameraTarget[0])*movementSpeed;
				playerZ += (cameraPosition[2] - cameraTarget[2])*movementSpeed;
			}
			else if(moveBack == true){
				playerX -= (cameraPosition[0] - cameraTarget[0])*movementSpeed;
				playerZ -= (cameraPosition[2] - cameraTarget[2])*movementSpeed;
			}
			else{
			
			}

		}
	}
	
}





var cube_vertices = [];
var cube_uvs = [];
var cube_elements = [];

var cube_positions_buffer;
var cube_elements_buffer;
var cube_uvs_buffer;
function setupCubeColliders(){
	cube_vertices = [
    // front
    -1.0, -1.0,  1.0,
     1.0, -1.0,  1.0,
     1.0,  1.0,  1.0,
    -1.0,  1.0,  1.0,
    // back
    -1.0, -1.0, -1.0,
     1.0, -1.0, -1.0,
     1.0,  1.0, -1.0,
    -1.0,  1.0, -1.0,
  ];
  	cube_positions_buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cube_positions_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cube_vertices), gl.STATIC_DRAW);
	positionAttribLocation = gl.getAttribLocation(program, 'position');
	gl.enableVertexAttribArray(positionAttribLocation);
	gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, false, 0, 0);	
  
  
  
  //For every 3 vertices, create a texture coord
  for(var i=0; i<cube_vertices.length; i+=3){
	cube_uvs.push(0.0)
	cube_uvs.push(1.0);
  }

	cube_uvs_buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cube_uvs_buffer);	
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cube_uvs), gl.STATIC_DRAW);

	
	
  cube_elements = [
  		// front
		0, 1, 2,
		2, 3, 0,
		// top
		1, 5, 6,
		6, 2, 1,
		// back
		7, 6, 5,
		5, 4, 7,
		// bottom
		4, 0, 3,
		3, 7, 4,
		// left
		4, 5, 1,
		1, 0, 4,
		// right
		3, 2, 6,
		6, 7, 3,
	];
		cube_elements_buffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cube_elements_buffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cube_elements), gl.STATIC_DRAW);
}

function drawCubeColliders(){
	scale = m4.scaling(10, 10, 10)
	xRotation = m4.xRotation(0);
	yRotation = m4.yRotation(0);
	zRotation = m4.zRotation(0);
	

	position = m4.translation(1, 1, 1); //change
	
	//Times matrices together
	updateAttributesAndUniforms();

	//Vertices
	gl.bindBuffer(gl.ARRAY_BUFFER, cube_positions_buffer);
	gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, false, 0, 0);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, cube_uvs_buffer);
	gl.vertexAttribPointer(textureCoordLocation, 2, gl.FLOAT, false, 0, 0);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, marsTerrainTexture);
	gl.uniform1i(gl.getUniformLocation(program, "uSampler"), 0);
	
	//Elements
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cube_elements_buffer);
	
	/*
	Mode
	Number of indices ( divide by 3 because 3 vertices per vertex ) then * 2 to get number of indices
	Type
	The indices
	*/
	gl.drawElements(
		gl.TRIANGLE_STRIP, 
		cube_elements.length,
		gl.UNSIGNED_SHORT,
		cube_elements_buffer
	); 
}