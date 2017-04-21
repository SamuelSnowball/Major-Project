
/**
 * This file adds the event listener for pointerlock,
 * 
 * @class PointerLockControls
*/
function PointerLockControls(){
	canvas.requestPointerLock = canvas.requestPointerLock ||
								canvas.mozRequestPointerLock;
								
	document.exitPointerLock =  document.exitPointerLock ||
							    document.mozExitPointerLock;
	
	/**
	Constructor
	
	@constructor
	*/
	setupPointerLock();
	
	/**
	Adds pointer lock to the canvas
	
	@method setupPointerLock
	*/
	function setupPointerLock(){
		canvas.addEventListener('mousedown', function(){
			canvas.requestPointerLock();
			pointerLocked = true;	
		}); 
	}
	
}