
function Player(x, y, z){

	var x = x; 
	var y = y;
	var z = z;
	
	var movementSpeed = 0.5;
	
	var xRotation = 0;
	var yRotation = 0;

	var quadrant; // Current section of the map they're in
	
	var numberQuadrantRows = terrain.get.getNumberQuadrantRows;
	var numberQuadrantColumns = terrain.get.getNumberQuadrantColumns;
	
	var playerVertices = [];
	var playerUvs = [];
	var playerNormals = [];
	var playerIndices = [];
	
	var playerVertexBuffer;
	var playerUvsBuffer;
	var playerIndicesBuffer;
	var playerNormalsBuffer;	
	
	/*
	Handles user input and changes the 4 movement variables
	The movement variables are used in the player class

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
		get quadrant(){
			return quadrant;
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
	
	// Constructor
	setupPlayerMovement();
		
	function setupPlayerMovement(){
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
			x -= (cameraPosition[0] - cameraTarget[0]) * movementSpeed;
			z -= (cameraPosition[2] - cameraTarget[2]) * movementSpeed;
		}
		else if(moveBack === true){
			x += (cameraPosition[0] - cameraTarget[0]) * movementSpeed;
			z += (cameraPosition[2] - cameraTarget[2]) * movementSpeed;
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
		cameraTarget = [
			cameraMatrix[12] + Math.sin(yRotation * cameraSpeed), 
			cameraMatrix[13] + Math.sin(xRotation * cameraSpeed),
			cameraMatrix[14] + Math.cos(yRotation * cameraSpeed),
		];
		
		// Retrieve position from camera matrix
		cameraPosition = [
			cameraMatrix[12], //x
			cameraMatrix[13], //y
			cameraMatrix[14]  //z
		];
			
		cameraMatrix = m4.lookAt(cameraPosition, cameraTarget, UP_VECTOR);
		viewMatrix = m4.inverse(cameraMatrix);
		viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);
		
		// Stops it breaking....
		currentTexture = mapTexture;
		updateAttributesAndUniforms();
	}	
	
	/*
	Work out what quadrant the player is in
	So can process and render what's in view of the player
	*/
	this.assignPlayerQuadrant = function(){
	
		// Need count variable because quadrant is a single number, cant work it out with the 2 loops properly
		var count = 0;
		
		// r and c to avoid messing with player x and y
		for(var r=0; r<numberQuadrantRows; r++){
		
			for(var c=0; c<numberQuadrantColumns; c++){
				
				if(z > (c * 128) && z < (c + 1) * 128 && 
					x > (r * 128) && x < (r+1) * 128 ){
					
					quadrant = count;
				}			
				count ++;
			}
		}
	}
	
}