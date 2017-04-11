/*
	Handles user input and changes the 4 movement variables
		
	W Key:
		Moves camera up
	A Key:
		Moves camera left		
	S Key:
		Moves camera down	
	D Key:
		Moves camera right
	
	R Key:
		Moves camera up
	F Key:
		Moves camera down		
*/
function Camera(){

	var yaw = -90;
	var pitch = -90;
	
	var lastX = window.innerWidth/2;
	var lastY = window.innerHeight/2;
	
	var sensitivity = 0.005;
	var cameraSpeed = 0.003;
	
	// Cameras spawn position
	var cameraPosition = [
		250,
		5,
		250
	];

	//Actual usage in index file, but definition needed here
	var cameraTarget = [
		0,
		0,
		0,
	];

	var moveForward = false, 
		moveBack = false,
		moveLeft = false,
		moveRight = false,
		moveUp = false, 
		moveDown = false;
		
	var prevX = 0;
	var prevY = 0;	
	
	var currentRotateY = 0;
	var currentRotateX = 0;
	var rotateSpeed = 0.3;
	var cameraSpeed = 0.5;
	
	var quadrant = 0; // Current section of the map they're in
	
	var numberQuadrantRows = terrain.get.getNumberQuadrantRows;
	var numberQuadrantColumns = terrain.get.getNumberQuadrantColumns;
	
	this.get = {
		get quadrant(){
			return quadrant;
		},
		
		get position(){
			return cameraPosition;
		},
		get x(){
			return cameraPosition[0];
		},
		get y(){
			return cameraPosition[1];
		},
		get z(){
			return cameraPosition[2];
		},		
		
		get targetX(){
			return cameraTarget[0];
		},
		get targetY(){
			return cameraTarget[1];
		},
		get targetZ(){
			return cameraTarget[2];
		},		
		get cameraTarget(){
			return cameraTarget;
		},
		
		get movingForward(){
			return moveForward;
		},
		get movingBackward(){
			return moveBack;
		}
	}
	
	this.set = {
		set x(xParam){
			cameraPosition[0] = xParam;
		},
		set y(yParam){
			cameraPosition[1] = yParam;
		},
		set z(zParam){
			cameraPosition[2] = zParam;
		},		
		
		set targetX(x){
			cameraTarget[0] = x;
		},
		set targetY(y){
			cameraTarget[1] = y;
		},
		set targetZ(z){
			cameraTarget[2] = z;
		},		
	}
		
	// Constructor
	setupMouseMove();
	setupUserMovement();
		
	/*
	Adds mouse moved event listener, 
	Changes cameraTarget based on user rotation
	*/
	function setupMouseMove(){
		canvas.addEventListener('mousemove', function(e){
			if(controls.get.isLocked === true){
				var currentXMovement = e.movementX;
				currentRotateY += currentXMovement + prevX;//e.movementX;
				prevX = currentXMovement;
				yaw = currentRotateY * rotateSpeed;
				
				var currentYMovement = e.movementY;
				currentRotateX += currentYMovement + prevY;
				prevY = currentYMovement;
				pitch = -currentRotateX * rotateSpeed;
				
				// Dont go over max or min
				if(pitch > 85){
					pitch = 85;
				}
				if(pitch < -85){
					pitch = -85;
				}
				
				// Should be in radians first
				var pitchInRadians = utility.toRadians(pitch);
				var yawInRadians = utility.toRadians(yaw);

				cameraTarget[0] = Math.cos(pitchInRadians) * Math.cos(yawInRadians);
				cameraTarget[1] = Math.sin(pitchInRadians);
				cameraTarget[2] = Math.cos(pitchInRadians) * Math.sin(yawInRadians);

				m4.normalize(cameraTarget);
			}		
		});		
	}
		
	/*
	Not actually updating camera here, because jerky movement..
	*/
	function setupUserMovement(){
		document.addEventListener('keydown', function(event){
			if(event.keyCode == 87){
				moveForward = true;
			}
			if(event.keyCode == 83){
				moveBack = true;
			}

			if(event.keyCode == 65){
				moveLeft = true;
			}
			if(event.keyCode == 68){
				moveRight = true;
			}
			
			if(event.keyCode == 82){
				moveUp = true; 
			}			
			if(event.keyCode == 70){
				moveDown = true; 
			}
		});
		
		document.addEventListener('keyup', function(event){
			if(event.keyCode == 87){
				moveForward = false;
			}
			if(event.keyCode == 83){
				moveBack = false;
			}

			if(event.keyCode == 65){
				moveLeft = false;
			}
			if(event.keyCode == 68){
				moveRight = false;
			}
			
			if(event.keyCode == 82){
				moveUp = false;
			}
			if(event.keyCode == 70){
				moveDown = false; 
			}
		});
	
	}	
	
	this.updateCamera = function(){

		if(moveForward){
			cameraPosition[0] += cameraTarget[0] * cameraSpeed;
			cameraPosition[2] += cameraTarget[2] * cameraSpeed;
		}
		else if(moveBack){
			cameraPosition[0] -= cameraTarget[0] * cameraSpeed;
			cameraPosition[2] -= cameraTarget[2] * cameraSpeed;
		}
		else if(moveLeft){
		/*
			var cross = m4.cross(cameraTarget, [0, 1, 0]);
			var normalized = m4.normalize(cross);
			
			cameraPosition[0] -= normalized[0] * cameraSpeed;
			cameraPosition[1] -= normalized[1] * cameraSpeed;
			cameraPosition[2] -= normalized[2] * cameraSpeed;
			*/
		}
		else if(moveRight){
		/*
			var cross = m4.cross(cameraTarget, [0, 1, 0]);
			var normalized = m4.normalize(cross);
			
			cameraPosition[0] += normalized[0] * cameraSpeed;
			cameraPosition[1] += normalized[1] * cameraSpeed;
			cameraPosition[2] += normalized[2] * cameraSpeed;
			*/
		}
		else if(moveUp){
			cameraPosition[1] += cameraSpeed;
		}
		else if(moveDown === true){
			cameraPosition[1] -= cameraSpeed;
		}
		else{
			// Don't care
		}	

		cameraMatrix = m4.translate(cameraMatrix, cameraPosition[0], cameraPosition[1], cameraPosition[2]);

		var cameraPositionPlusTarget = [];
		cameraPositionPlusTarget[0] = cameraPosition[0] + cameraTarget[0];
		cameraPositionPlusTarget[1] = cameraPosition[1] + cameraTarget[1];
		cameraPositionPlusTarget[2] = cameraPosition[2] + cameraTarget[2];
		
		// with view matrix, inverse everything, so that the camera is the origin
		cameraMatrix = m4.lookAt(cameraPosition, cameraPositionPlusTarget, UP_VECTOR);
		viewMatrix = m4.inverse(cameraMatrix);
		viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);
		
		updateAttributesAndUniforms();
	}
	
	/*
	Work out what quadrant the user is in
	So can process and render what's in view of the player
	*/
	this.assignCameraQuadrant = function(){
	
		// Need count variable because quadrant is a single number, cant work it out with the 2 loops properly
		var count = 0;

		var z = cameraPosition[2];
		var x = cameraPosition[0];
		
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