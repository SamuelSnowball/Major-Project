/*
This file handles user input and changes the 4 movement variables
The movement variables are used in the player class

2 Arrow keys:
	Forward (up key)
	Back (down key)
W Key:
	Moves camera up
S Key:
	Moves camera down
*/

var moveUp = false, 
	moveDown = false, 
	moveForward = false, 
	moveBack = false;

// P key
var prospecting = false; //Are they prospecting a rock?		
		
function setupMovement(){
	document.addEventListener('keydown', function(event){
		if(event.keyCode == 38){
			moveForward = true;
		}
		if(event.keyCode == 40){
			moveBack = true;
		}
		if(event.keyCode == 87){
			moveUp = true;
		}
		if(event.keyCode == 83){
			moveDown = true;
		}
		if(event.keyCode === 80){
			prospecting = true;
		}
	});
	
	document.addEventListener('keyup', function(event){
		if(event.keyCode == 38){
			moveForward = false;
		}
		if(event.keyCode == 40){
			moveBack = false;
		}
		if(event.keyCode == 87){
			moveUp = false;
		}
		if(event.keyCode == 83){
			moveDown = false;
		}
		if(event.keyCode === 80){
			prospecting = false;
		}
	});
}
