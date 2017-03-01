
function Player(x, y, z){
	var x = x; 
	var y = y;
	var z = z;
	var movementSpeed = 0.5;
	this.xRotation = 0;
	this.yRotation = 0;
	var previousY = 0; //To remember Y pos when moving for fog
		
	/*
	P key, are they prospecting a rock?
	
	Prospecting getter needed in CollisonTester class
	*/
	var prospecting = false; 
	var inProspectingRange = false; //To know whether to update GUI or not
	var xp = 0;
	var hasMission = false;
	this.get = {
		get prospecting(){
			return prospecting;
		},
		get xp(){
			return xp;
		},
		get hasMission(){
			return hasMission;
		},
		get inProspectingRange(){
			return inProspectingRange;
		},
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
		}
	}	
	
	this.set = {
		set mission(missionParam){
			hasMission = missionParam;
		},
		set inProspectingRange(inRange){
			inProspectingRange = inRange;
		},
		set x(xParam){
			x = xParam; //careful
		},
		set y(yParam){
			y = yParam; //careful
		},
		set z(zParam){
			z = zParam; //careful
		}
	}
	
	this.add = {
		set xp(xpParam){
			xp += xpParam;
		}
	}
	
	
	
	
	setupPlayerMovement();
	
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
			if(event.keyCode === 80){
				prospecting = true;
			}
			//Holding down M key for map, disable fog so we can see properly
			if(event.keyCode === 77){
				useFog = false;
				zFar = 2048;
				/*
				Save their y position, so we can restore it when they stop pressing M
				
				If the M key gets held down, then previousY will get set to 64!, and all breaks
				This hacky if statement fixes it.
				Could eventually break if player goes above 50 y legit :/
				*/
				if(y > 490){
					
				}else{
					previousY = y;
				}
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
			if(event.keyCode === 80){
				prospecting = false;
			}
			//Released M key for map, enable fog, set the players position to what it was
			if(event.keyCode === 77){
				useFog = true;
				zFar = 128;
				y = previousY; //Set their position back to normal
			}
		});
	}
	
	/*
	Check if they're going forwards or backwards
	Push them different ways based on movement direction
	*/	
	this.moveForwardOrBackward = function(){
		if(moveForward === true){	
			x += (cameraPosition[0] - cameraTarget[0]);
			z += (cameraPosition[2] - cameraTarget[2]);
		}
		else if(moveBack == true){
			x -= (cameraPosition[0] - cameraTarget[0]);
			z -= (cameraPosition[2] - cameraTarget[2]);
		}
		else{
		
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
			cameraMatrix[12] + Math.sin(this.yRotation * cameraSpeed), 
			cameraMatrix[13] + Math.sin(this.xRotation * cameraSpeed),
			cameraMatrix[14] + Math.cos(this.yRotation * cameraSpeed),
		];
		
		//For minimap eventually
		if(useFog === false){
			y = 2000;
			cameraTarget = [
				cameraMatrix[12] , 
				cameraMatrix[13] -1,
				cameraMatrix[14] -0.0001
			];		
		}
		
		
		//Retrieve position from camera matrix
		cameraPosition = [
			cameraMatrix[12], //x
			cameraMatrix[13], //y
			cameraMatrix[14]  //z
		];
			
		cameraMatrix = m4.lookAt(cameraPosition, cameraTarget, UP_VECTOR);
		viewMatrix = m4.inverse(cameraMatrix);
		viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);
		
		//Stops it breaking....
		currentTexture = myPerlinTexture;
		
		//Do I even needs this here? probably...
		//Times matrices together
		updateAttributesAndUniforms();
	}	
	
};


	
