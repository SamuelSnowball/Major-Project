
function Player(x, y, z){

	var x = x; 
	var y = y;
	var z = z;
	
	var movementSpeed = 0.005;
	
	var xRotation = 0;
	var yRotation = 0;


	
	var playerVertices = [];
	var playerUvs = [];
	var playerNormals = [];
	var playerIndices = [];
	
	var playerVertexBuffer;
	var playerUvsBuffer;
	var playerIndicesBuffer;
	var playerNormalsBuffer;	
	
	// Getters
	this.get = {
		get x(){
			return x;
		},
		get y(){
			return y;
		},
		get z(){
			return z;
		},
		get speed(){
			return movementSpeed;
		},

		get movingForward(){
			return moveForward;
		},
		get movingBackward(){
			return moveBack;
		},
		get xRotation(){
			return xRotation;
		},
		get yRotation(){
			return yRotation;
		},
	}	
	
	// Setters
	this.set = {
		set x(xParam){
			x = xParam; //careful
		},
		set y(yParam){
			y = yParam; //careful
		},
		set z(zParam){
			z = zParam; //careful
		},
		set xRotation(x){
			xRotation = x;
		},
		set yRotation(y){
			yRotation = y;
		},
	}
	
	this.add = {
		set x(xParam){
			x += xParam;
		},
		set y(yParam){
			y += yParam;
		},
		set z(zParam){
			z += zParam;
		}
	}
	

	
	
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
			y += movementSpeed;
		}
		else if(moveDown === true){
			y -= movementSpeed;
		}
		else if(moveForward === true){
		
			var thing = cameraPosition;
			cameraPosition[0] += movementSpeed * cameraTarget[0]; 
			cameraPosition[1] += movementSpeed * cameraTarget[1]; 
			cameraPosition[2] += movementSpeed * cameraTarget[2]; 
			var thing2 = cameraPosition;
			
			//x -= (cameraPosition[0] - cameraTarget[0]) * movementSpeed;
			//z -= (cameraPosition[2] - cameraTarget[2]) * movementSpeed;
		}
		else if(moveBack === true){
			cameraPosition -= movementSpeed * cameraTarget; 
		/*
			x += (cameraPosition[0] - cameraTarget[0]) * movementSpeed;
			z += (cameraPosition[2] - cameraTarget[2]) * movementSpeed;
			*/
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
		cameraMatrix = m4.translate(cameraMatrix, x, y, z);
		
		/*
		xPos = sin(y rotation in radians)
		yPos = sin(x rotation in radians)
		zPos = cos(y rotation in radians)
		
		playerYRotation is the angle I rotated
		
		I think camera target is too small,
		Its always in range 0->1, therefore camera always looks there :/
		I've added the camera position on to fix it
		*/
		/*
		cameraTarget = [
			cameraMatrix[12] + Math.sin(yRotation * cameraSpeed), 
			cameraMatrix[13] + Math.sin(xRotation * cameraSpeed),
			cameraMatrix[14] + Math.cos(yRotation * cameraSpeed),
		];
		*/
		
		// Retrieve position from camera matrix
		/*
		cameraPosition = [
			cameraMatrix[12], //x
			cameraMatrix[13], //y
			cameraMatrix[14]  //z
		];
		*/
		cameraPosition = [310, 5, 315];
		cameraPosition 
			
		cameraTarget = [0, 0, -1];
		cameraMatrix = m4.lookAt(cameraPosition, cameraTarget, UP_VECTOR);
		viewMatrix = m4.inverse(cameraMatrix);
		viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);
		
		// Stops it breaking....
		currentTexture = mapTexture;
		updateAttributesAndUniforms();
	}	
	
	
}