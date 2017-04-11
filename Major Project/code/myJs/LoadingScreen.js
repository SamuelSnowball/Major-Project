/*
This file animates the initial background image before the game has started.
*/
function LoadingScreen(){
	
	var numImages = 12; // 0 -> 12 images
	var count = 0;
	
	/*
	Loops the background images before the game has started
	*/
	this.animateBackground = setInterval(function(){ 	
	
		if(count <= numImages){
			document.body.style.backgroundImage = "url('screenshots/evolution of the project/" + count + ".png')";
			document.body.style.backgroundRepeat = "no-repeat";
			count++;
		}
		else{
			count = 0;
		}
		
	}, 1000);
}

