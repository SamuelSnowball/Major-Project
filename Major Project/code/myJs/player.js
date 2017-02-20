
function Player(x, y, z){
	this.x = x; 
	this.y = y;
	this.z = z;
	
	this.movementSpeed = 0.1;
	
	this.xRotation = 0;
	this.yRotation = 0;
	
	
	/*
	Checks what key the player is holding down,
	Updates player position,
	Calls function to move camera matrix accordingly.
	*/
	this.movePlayer = function(){
		/*
		Don't let the player move in the Y axis, otherwise they would fly.
		*/
		if(moveUp === true){
			this.y += this.movementSpeed;
		}
		else if(moveDown === true){
			this.y -= this.movementSpeed;
		}
		else if(moveForward === true){
			this.x -= (cameraPosition[0] - cameraTarget[0]) * this.movementSpeed;
			this.z -= (cameraPosition[2] - cameraTarget[2]) * this.movementSpeed;
		}
		else if(moveBack === true){
			this.x += (cameraPosition[0] - cameraTarget[0]) * this.movementSpeed;
			this.z += (cameraPosition[2] - cameraTarget[2]) * this.movementSpeed;
		}
		else{
		
		}
		
		this.updatePlayerCamera();
	}
	
	/*
	Updates the camera matrix with the new player position
	*/
	this.updatePlayerCamera = function(){	
		cameraMatrix = m4.yRotation(0);
		cameraMatrix = m4.translate(cameraMatrix, this.x, this.y, this.z);
		
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
			cameraMatrix[12] + Math.sin(this.yRotation * cameraSpeed), 
			cameraMatrix[13] + Math.sin(this.xRotation * cameraSpeed),
			cameraMatrix[14] + Math.cos(this.yRotation * cameraSpeed),
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
	
};


	
