
/*
This file creates and displays the GUI elements of the game, using the library:
https://github.com/dataarts/dat.gui
*/

	/*
	UI values
	*/
	var ui_noise_scale = 0;
	var ui_min_rocks = $("#rocks_horizontal_spinner_min").val();
	var ui_max_rocks = $("#rocks_horizontal_spinner_max").val();
	var ui_water_strength = $("#water_horizontal_spinner").val();
	
function MyGUI(){

	var systemGUI = new dat.GUI();
	systemGUI.width = 420;
	systemGUI.domElement.id = 'systemGUI';
	

	
	var systemOptions = {
		Title: "System Interaction",
		
		SAVE_SCENE: 2,
		
		Camera: "Camera",
		CameraSpeed: 0.5,
	};
	
	// Constructor
	setupSystemGUI();
	
	function setupSystemGUI(){
		systemGUI.add(systemOptions, "Title");
		

		systemGUI.add(systemOptions, "Camera");
	}
	

	$( function() {
		$( "#outOfBoundsID" ).progressbar({
			closeOnEscape: false,
			draggable: false
		})
	}); //end jquery func

	
	this.showMapCollision = function(){
		document.getElementById("outOfBoundsID").style.visibility = "visible";	
		$( "#outOfBoundsID" ).progressbar({
			
		})		
	}
	
	this.hideMapCollision = function(){
		document.getElementById("outOfBoundsID").style.visibility = "hidden";		
	}
	
}
 
