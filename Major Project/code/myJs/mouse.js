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

var globalRotateX = 0;
var currentRotateY = 0;
var rotateSpeed = 0.3;

canvas.addEventListener('mousemove', function(e){
	if(pointerLocked === true){
		//console.log("moved!");
		
		//rotateX = MDN.rotateXMatrix(e * 0.5);
		//updateAtt
		//console.log("Client y is: " + e.); //works more if unlocked

		
		/*
		X and Y are kinda reversed here, because you move mouse on the X, to rotate terrain in Y
		*/
		currentRotateY -= e.movementX;
		//console.log("CurrentRotateY is: " + currentRotateY);
		
		/*
		Updates rotation matrix
		
		Defined in matrices.js
		*/
		playerYRotation = currentRotateY * rotateSpeed;
		

		/*
		THIS DOESNT DRAW THE TERRAIN IT JUST UPDATES THE ROTATE VALUES
		THE DRAW TERRAIN FUNCTION DRAWS IT
		*/
		
		
		/*
		Right now, its rotating around the origin
		Instead you want to rotate around the player position or something
		*/
		
	}
});
							
