/*
(Check what attribution u have to give on the website)
Current sound clips from:
http://soundbible.com/2156-Text-Message-Alert-3.html
http://soundbible.com/2154-Text-Message-Alert-1.html
*/

function Sound(){
	
	var mission1Sound = new Audio("resources/sound/newMission1.mp3");
	var mission3Sound = new Audio("resources/sound/newMission3.mp3");
	
	this.playNewMissionSound = function(){
		mission1Sound.play();
	}
	
	
}