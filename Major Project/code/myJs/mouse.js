/*
Not sure why one needs to be canvas, and the other document. 
But it fails if they're both document
*/
canvas.requestPointerLock = canvas.requestPointerLock ||
                            canvas.mozRequestPointerLock;
							
document.exitPointerLock = document.exitPointerLock    ||
							document.mozExitPointerLock;

var pointerLocked = false;

							
canvas.addEventListener('mousedown', function(){
	
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




var currentRotateY = 0;
var currentRotateX = 0;
var rotateSpeed = 0.3;

var prevX = 0;
var prevY = 0;

canvas.addEventListener('mousemove', function(e){
	if(pointerLocked === true){
		/*
		X and Y are kinda reversed here, because you move mouse on the X, to rotate terrain in Y
		*/
		//Horizontal
		var currentXMovement = e.movementX;
		currentRotateY += currentXMovement + prevX;//e.movementX;
		prevX = currentXMovement;
		playerYRotation = currentRotateY * rotateSpeed;
		
		//Vertical
		var currentYMovement = e.movementY;
		currentRotateX += currentYMovement + prevY;
		prevY = currentYMovement;
		playerXRotation = currentRotateX * rotateSpeed;
	}
});
							
