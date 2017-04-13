
/*
This file adds the event listener for pointerlock,
*/
function PointerLockControls(){
	canvas.requestPointerLock = canvas.requestPointerLock ||
								canvas.mozRequestPointerLock;
								
	document.exitPointerLock =  document.exitPointerLock ||
							    document.mozExitPointerLock;
	
	// Constructor
	setupPointerLock();
	
	function setupPointerLock(){
		canvas.addEventListener('mousedown', function(){
			canvas.requestPointerLock();
			pointerLocked = true;	
		}); 
	}
	
}