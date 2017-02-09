/*
This file just handles user input and updates camera matrix

2 Arrow keys:
	Forward (up key)
	Back (down key)
W Key:
	Moves camera up
S Key:
	Moves camera down
*/

var moveUp = false, 
	moveDown = false, 
	moveForward = false, 
	moveBack = false;
		
function setupMovement(){
	document.addEventListener('keydown', function(event){
		if(event.keyCode == 38){
			moveForward = true;
		}
		if(event.keyCode == 40){
			moveBack = true;
		}
		if(event.keyCode == 87){
			moveUp = true;
		}
		if(event.keyCode == 83){
			moveDown = true;
		}
	});
	
	document.addEventListener('keyup', function(event){
		if(event.keyCode == 38){
			moveForward = false;
		}
		if(event.keyCode == 40){
			moveBack = false;
		}
		if(event.keyCode == 87){
			moveUp = false;
		}
		if(event.keyCode == 83){
			moveDown = false;
		}
	});
}
	
/*
Checks what key the player is holding down,
and moves camera matrix accordingly.
*/
function movePlayer(){

	/*
	Don't let the player move in the Y axis, otherwise they would fly.
	*/
	if(moveUp === true){
		playerY += movementSpeed;
	}
	else if(moveDown === true){
		playerY -= movementSpeed;
	}
	else if(moveForward === true){
		playerX -= (cameraPosition[0] - cameraTarget[0])*movementSpeed;
		//playerY += (cameraPosition[1] + cameraTarget[1])*movementSpeed;
		playerZ -= (cameraPosition[2] - cameraTarget[2])*movementSpeed;
		
	}
	else if(moveBack === true){
		playerX += (cameraPosition[0] - cameraTarget[0])*movementSpeed;
		//playerY += (cameraPosition[1] + cameraTarget[1])*movementSpeed;
		playerZ += (cameraPosition[2] - cameraTarget[2])*movementSpeed;
	}
	else{
	
	}
	
	cameraMatrix = m4.yRotation(0); //stops it wildy spinning at least
	cameraMatrix = m4.translate(cameraMatrix, playerX, playerY, playerZ);
	
	/*
	xPos = sin(y rotation in radians)
	yPos = sin(x rotation in radians)
	zPos = cos(y rotation in radians)
	
	playerYRotation is the angle I rotated
	
	I think camera target is too small,
	Its always in range 0->1, therefore camera always looks there :/
	
	I've added the camera position on to fix it
	*/
	cameraTarget = [
		cameraMatrix[12] + Math.sin(playerYRotation * cameraSpeed), 
		cameraMatrix[13] + Math.sin(playerXRotation * cameraSpeed),
		cameraMatrix[14] + Math.cos(playerYRotation * cameraSpeed),
	];
	
	//Retrieve position from camera matrix
	cameraPosition = [
		cameraMatrix[12], //x
		cameraMatrix[13], //y
		cameraMatrix[14]  //z
	];
		
	cameraMatrix = m4.lookAt(cameraPosition, cameraTarget, UP_VECTOR);
	viewMatrix = m4.inverse(cameraMatrix);
	viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);
	
	//Times matrices together
	updateAttributesAndUniforms();
}	