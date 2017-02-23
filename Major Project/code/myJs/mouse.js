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
	
	//Show GUI elements
	document.getElementById("overlay").style.visibility = "visible";
	document.getElementById("missionOverlay").style.visibility = "visible";
	
	document.getElementById("topLeftOverlay").style.visibility = "visible";
	document.getElementById("topMiddleOverlay").style.visibility = "visible";
	
	document.getElementById("xpOverlay").style.visibility = "visible";
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
		player.yRotation = currentRotateY * rotateSpeed;
		
		//Vertical
		var currentYMovement = e.movementY;
		currentRotateX += currentYMovement + prevY;
		prevY = currentYMovement;
		player.xRotation = currentRotateX * rotateSpeed;
	}
});
							
