/*
This file contains code for pointerlock,

Also holds the global rotation parameters that get used in matrices

When user clicks, GUI elements display
*/
canvas.requestPointerLock = canvas.requestPointerLock ||
                            canvas.mozRequestPointerLock;
							
document.exitPointerLock = document.exitPointerLock    ||
							document.mozExitPointerLock;

var pointerLocked = false;

var prospectingBarValue = 0;
			
canvas.addEventListener('mousedown', function(){
	
	$(document).ready(function() {
		if(gameRunning === false){
			setup();
		}
		else{
			//Game already running, dont run setup again
		}

		//Remove background image and text when game starts
		var banner = document.getElementById('banner');
		if(banner !== null){
			banner.parentNode.removeChild(banner);
		}
		document.body.style.backgroundImage = ""; 
		
		/*
		The boolean pointerLocked might screw up if they exit via escape
		*/
		if(pointerLocked === false){
			canvas.requestPointerLock();
			console.log("Pointer locked!");
			pointerLocked = true;
		}
		else{
			// They clicked again, attempt to unlock
			pointerLocked = false;
			console.log("Pointer unlocked!");
			document.exitPointerLock();
		}		
	});
	
	
	

}); //end mouse down


var currentRotateY = 0;
var currentRotateX = 0;
var rotateSpeed = 0.3;

var prevX = 0;
var prevY = 0;

function toRadians (angle) {
  return angle * (Math.PI / 180);
}

var front = new Object();

canvas.addEventListener('mousemove', function(e){

	/*
	X and Y are kinda reversed here, because you move mouse on the X, to rotate terrain in Y
	*/
	if(pointerLocked === true){
		//Horizontal
		
		/*
		var currentXMovement = e.movementX;
		currentRotateY += currentXMovement + prevX;//e.movementX;
		prevX = currentXMovement;
		player.set.yRotation = currentRotateY * rotateSpeed;
		
		//Vertical
		var currentYMovement = e.movementY;
		currentRotateX += currentYMovement + prevY;
		prevY = currentYMovement;
		player.set.xRotation = currentRotateX * rotateSpeed;
		*/

		var currentXMovement = e.movementX;
		currentRotateY += currentXMovement + prevX;//e.movementX;
		prevX = currentXMovement;
		yaw = currentRotateY * rotateSpeed;
		
		//Vertical
		var currentYMovement = e.movementY;
		currentRotateX += currentYMovement + prevY;
		prevY = currentYMovement;
		pitch = currentRotateX * rotateSpeed;
		
		/*
		var xoff = e.movementX - prevX;
		var yoff = prevY - e.movementY;
		prevX = e.movementX;
		prevY = e.movementY;
		
		xoff *= sensitivity;
		yoff *= sensitivity;
		
		yaw += xoff;
		pitch += yoff;
		// roll?
		
		// Dont go over max or min
		if(pitch > 89){
			pitch = 89;
		}
		if(pitch < -89){
			pitch = -89;
		}
		*/
		
		// Should be in radians first
		var pitchInRadians = toRadians(pitch);
		var yawInRadians = toRadians(yaw);
		
		cameraTarget[0] = Math.cos(pitchInRadians) * Math.cos(yawInRadians);
		cameraTarget[1] = Math.sin(pitchInRadians);
		cameraTarget[2] = Math.cos(pitchInRadians) * Math.sin(yawInRadians);
		
		m4.normalize(cameraTarget);
		
		cameraTarget[0] += cameraPosition[0];
		cameraTarget[1] += cameraPosition[1];
		cameraTarget[2] += cameraPosition[2];
		
		console.log(cameraTarget);

		
		//Need to normalize
		
		
	//	Unit vector = original vector
		//					/
	//				its magnitude (length)
		/*
		var magnitude = (front.x * front.x) + 
						(front.y * front.y) + 
						(front.z * front.z);
		
		magnitude = Math.sqrt(magnitude);
		
		cameraTarget[0] = (front.x / magnitude) + cameraMatrix[12];
		cameraTarget[1] = (front.y / magnitude) + cameraMatrix[13];
		cameraTarget[2] = (front.z / magnitude) + cameraMatrix[14];
		console.log(cameraTarget);
		*/
	}
	
	
});
							
