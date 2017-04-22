
/**
 * Holds sound files
 * Contains public methods to start/stop them, via user input in UI
 * 
 * @class Sound
*/
function SoundPlayer(){
	
	// The water mp3
	var water_audio = new Audio('resources/sound/new_water.mp3');
	
	/**
	@method play_water_sound
	@public
	*/
	this.play_water_sound = function(){
		water_audio.play();
		console.log("play called");
	}
	
	/**
	@method stop_water_sound
	@public
	*/
	this.stop_water_sound = function(){
		water_audio.pause();
	}

}