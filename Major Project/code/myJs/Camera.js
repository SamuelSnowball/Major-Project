
/**
 * Handles user input and changes the 4 movement variables
 * 	
 * W Key:
 * 	Moves camera up
 * S Key:
 * 	Moves camera down	
 * 
 * R Key:
 * 	Moves camera up
 * F Key:
 * 	Moves camera down	
 * 
 * @class Camera
*/		
function Camera(){

	var yaw = -90;
	var pitch = -90;
	
	var lastX = window.innerWidth/2;
	var lastY = window.innerHeight/2;

	// Camera position, initialize to centre of map
	// the + 1 fixes a bug of only 1 quadrant rendering to begin with
	var cameraPosition = [
		(terrain.get.getTerrainRows / 2) + 1,
		15,
		(terrain.get.getTerrainRows / 2) + 1
	];

	// Where the camera is looking
	var cameraTarget = [
		0.1,
		0.1,
		0.1,
	];

	var moveForward = false, 
		moveBack = false,
		moveUp = false, 
		moveDown = false;
		
	var prevX = 0.1;
	var prevY = 0.1;	
	
	var currentRotateY = 0.1;
	var currentRotateX = 0.1;
	var rotateSpeed = 0.08;
	var cameraSpeed = 0.5;
	
	var quadrant = 0; // Current section of the map they're in
	
	var numberQuadrantRows = terrain.get.getNumberQuadrantRows;
	var numberQuadrantColumns = terrain.get.getNumberQuadrantColumns;
	
	this.get = {
		/**
		@method get.quadrant
		@public
		@return {int} the cameras current quadrant
		*/
		get quadrant(){
			return quadrant;
		},
		
		/**
		@method get.position
		@public
		@return {vec3} the cameras current position
		*/		
		get position(){
			return cameraPosition;
		},
		
		/**
		@method get.x
		@public
		@return {float} the cameras current x position
		*/
		get x(){
			return cameraPosition[0];
		},

		/**
		@method get.y
		@public
		@return {float} the cameras current y position
		*/		
		get y(){
			return cameraPosition[1];
		},
		
		/**
		@method get.z
		@public
		@return {float} the cameras current z position
		*/		
		get z(){
			return cameraPosition[2];
		},		
		
		/**
		@method get.targetX
		@public
		@return {float} the cameras current x viewing target
		*/
		get targetX(){
			return cameraTarget[0];
		},
		
		/**
		@method get.targetY
		@public
		@return {float} the cameras current y viewing target
		*/
		get targetY(){
			return cameraTarget[1];
		},
		
		/**
		@method get.targetZ
		@public
		@return {float} the cameras current z viewing target
		*/
		get targetZ(){
			return cameraTarget[2];
		},		
		
		/**
		@method get.cameraTarget
		@public
		@return {vec3} the cameras current viewing target
		*/
		get cameraTarget(){
			return cameraTarget;
		},
		
		/**
		@method get.movingForward
		@public
		@return {bool} is the player moving forward? true/false
		*/
		get movingForward(){
			return moveForward;
		},
		
		/**
		@method get.movingBackward
		@public
		@return {bool} is the player moving backward? true/false
		*/
		get movingBackward(){
			return moveBack;
		},
		
		/**
		@method get.movingUp
		@public
		@return {bool} is the player moving up? true/false
		*/
		get movingUp(){
			return moveUp;
		},
		
		/**
		@method get.movingDown
		@public
		@return {bool} is the player moving down? true/false
		*/
		get movingDown(){
			return moveDown;
		}
	}
	
	this.set = {
		/**
		@method set.x
		@public
		@param xParam {float} the x position to set the camera at
		*/
		set x(xParam){
			cameraPosition[0] = xParam;
		},
		
		/**
		@method set.y
		@public
		@param yParam {float} the y position to set the camera at
		*/		
		set y(yParam){
			cameraPosition[1] = yParam;
		},
		
		/**
		@method set.z
		@public
		@param zParam {float} the z position to set the camera at
		*/		
		set z(zParam){
			cameraPosition[2] = zParam;
		},		

		/**
		@method set.targetX
		@public
		@param x {float} the x position to set the camera target at
		*/		
		set targetX(x){
			cameraTarget[0] = x;
		},
		
		/**
		@method set.targetY
		@public
		@param y {float} the y position to set the camera target at
		*/		
		set targetY(y){
			cameraTarget[1] = y;
		},
		
		/**
		@method set.targetZ
		@public
		@param z {float} the z position to set the camera target at
		*/		
		set targetZ(z){
			cameraTarget[2] = z;
		},		
	}
		
	/**
	@constructor
	*/
	setupMouseMove();
	setupUserMovement();
		
	/**
	Adds mouse moved event listener, 
	Changes cameraTarget based on user rotation
	
	@method setupMouseMove
	@private
	*/
	function setupMouseMove(){
		canvas.addEventListener('mousemove', function(e){
				document.body.style.backgroundImage = "url('')";
				
				var currentXMovement = e.movementX;
				currentRotateY += currentXMovement + prevX;
				prevX = currentXMovement;
				yaw = currentRotateY * rotateSpeed;
				
				var currentYMovement = e.movementY;
				currentRotateX += currentYMovement + prevY;
				prevY = currentYMovement;
				pitch = -currentRotateX * rotateSpeed;
				
				// Stops the camera sticking to the bottom/top of scene
				if(pitch > 70){
					pitch = 70;
					currentRotateX = -850;
				}
				if(pitch < -70){
					pitch = -70;
					currentRotateX = 850;
				}
				
				// Should be in radians first
				var pitchInRadians = utility.toRadians(pitch);
				var yawInRadians = utility.toRadians(yaw);

				cameraTarget[0] = Math.cos(pitchInRadians) * Math.cos(yawInRadians);
				cameraTarget[1] = Math.sin(pitchInRadians);
				cameraTarget[2] = Math.cos(pitchInRadians) * Math.sin(yawInRadians);

				m4.normalize(cameraTarget);
		});		
	}
		
	/**
	Adds event listeners for the user movement
	Not actually updating camera here, because jerky movement..
	
	@method setupUserMovement
	@private
	*/
	function setupUserMovement(){
		document.addEventListener('keydown', function(event){
			if(event.keyCode == 87){
				moveForward = true;
			}
			if(event.keyCode == 83){
				moveBack = true;
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
			
			if(event.keyCode == 82){
				moveUp = false;
			}
			if(event.keyCode == 70){
				moveDown = false; 
			}
		});
	
	}	
	
	/**
	Updates the camera position and view direction, in the camera matrix
	
	@method updateCamera
	@public
	*/
	this.updateCamera = function(){

		if(moveForward){
			cameraPosition[0] += cameraTarget[0] * cameraSpeed;
			cameraPosition[2] += cameraTarget[2] * cameraSpeed;
		}
		else if(moveBack){
			cameraPosition[0] -= cameraTarget[0] * cameraSpeed;
			cameraPosition[2] -= cameraTarget[2] * cameraSpeed;
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
		
		mainProgram.updateAttributesAndUniforms();
	}
	
	/**
	Work out what quadrant the user is in
	So can process and render what's in view of the player
	
	@method assignCameraQuadrant
	@public
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