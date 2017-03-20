/*
This file animates the initial background image before the game has started.

Once the game starts, the animating background stops animating and gets removed.
*/

//Set the loading screen image
document.body.style.backgroundImage = "url('resources/homeImage.png')";
document.body.style.backgroundRepeat = "no-repeat";

function LoadingScreen(){

	var backgroundXPos = 0;
	var backgroundYPos = 0;

	/*
	Animates the background image before the game has started
	*/
	this.animateBackground = setInterval(function(){ 	
		backgroundXPos+=0.1;
		backgroundYPos+=0.1;
		document.body.style.backgroundPosition = backgroundXPos + "%" + ' ' + backgroundYPos + "%";
	}, 0);
}

