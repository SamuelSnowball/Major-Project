
/**
 * Holds sound files
 * Contains public methods to start/stop them, via user input in UI
 * 
 * @class Sound
*/
function SoundPlayer(){
	
	// The water mp3
	var water_audio = new Audio('resources/sound/new_water.mp3');
	
	// Loop when finished
	water_audio.addEventListener('ended', function() {
		this.currentTime = 0;
		this.play();
	}, false);
	
	/**
	@method play_water_sound
	@public
	*/
	this.play_water_sound = function(){
		if(water_audio.paused === true){
			// Then it isnt playing, play it
			water_audio.play();
		}
		else{
			// Already playing
		}
		
		alreadyPlayed = true;
	}
	
	/**
	@method stop_water_sound
	@public
	*/
	this.stop_water_sound = function(){
		water_audio.pause();
	}

}