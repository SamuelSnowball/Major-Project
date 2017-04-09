
/*
This file adds the event listener for pointerlock,
*/
function PointerLockControls(){
	canvas.requestPointerLock = canvas.requestPointerLock ||
								canvas.mozRequestPointerLock;
								
	document.exitPointerLock =  document.exitPointerLock ||
							    document.mozExitPointerLock;

	var pointerLocked = false;
	
	this.get = {
		get isLocked(){
			return pointerLocked;
		}
	}

	// Constructor
	setupPointerLock();
	
	function setupPointerLock(){
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
	}
}