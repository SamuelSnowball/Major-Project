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
var prevX = 0;
	var prevY = 0;	
	
		var currentRotateY = 0;
	var currentRotateX = 0;
	var rotateSpeed = 0.3;
function Camera(){

	var moveForward = false, 
		moveBack = false,
		moveLeft = false,
		moveRight = false,
		moveUp = false, 
		moveDown = false;
	
	
	var cameraSpeed = 0.5;
	var quadrant; // Current section of the map they're in
	this.get = {
		get quadrant(){
			return quadrant;
		},
	}
		
	var numberQuadrantRows = 4;//terrain.get.getNumberQuadrantRows;
	var numberQuadrantColumns = 4;//terrain.get.getNumberQuadrantColumns;
	
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
				
				console.log("current y mov: " + currentYMovement);
				console.log("currentrotatex: " + currentRotateX);
				console.log("prevy: " + prevY);
				

				//kEEP PITCH AT -8?
			
				//console.log("yaw: " + yaw);
				
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
				
				console.log("New y target: " + cameraTarget[1]);
				
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
			var cross = m4.cross(cameraTarget, [0, 1, 0]);
			var normalized = m4.normalize(cross);
			
			cameraPosition[0] -= normalized[0] * cameraSpeed;
			cameraPosition[1] -= normalized[1] * cameraSpeed;
			cameraPosition[2] -= normalized[2] * cameraSpeed;
		}
		else if(moveRight){
			var cross = m4.cross(cameraTarget, [0, 1, 0]);
			var normalized = m4.normalize(cross);
			
			cameraPosition[0] += normalized[0] * cameraSpeed;
			cameraPosition[1] += normalized[1] * cameraSpeed;
			cameraPosition[2] += normalized[2] * cameraSpeed;
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