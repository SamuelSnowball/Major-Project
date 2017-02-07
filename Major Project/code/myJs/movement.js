/*
This file just handles user input:

4 Arrow keys:
	Forward (up key)
	Back (down key)
	Left
	Right
W Key:
	Moves camera up
S Key:
	Moves camera down
	
*/

var moveUp = false, //W
	moveDown = false, //S	
	moveLeft = false,
	moveRight = false,
	moveForward = false,
	moveBack = false;
		
	function setupMovement(){
		document.addEventListener('keydown', function(event){
			if(event.keyCode == 37){
				moveLeft = true;
			}

			if(event.keyCode == 38){
				moveForward = true;
			}

			if(event.keyCode == 39){
				moveRight = true;
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
		});
		
		document.addEventListener('keyup', function(event){
			if(event.keyCode == 37){
				moveLeft = false;
			}
			if(event.keyCode == 38){
				moveForward = false;
			}
			if(event.keyCode == 39){
				moveRight = false;
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
		});
		
	}