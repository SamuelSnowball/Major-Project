
/*
This file creates and displays the GUI elements of the game, using the library:
https://github.com/dataarts/dat.gui
*/

function MyGUI(){

	/*
	UI values
	*/
	var ui_noise_scale = 50;
	var ui_noise_octaves = 8;
	var ui_min_rocks = 512;
	var ui_max_rocks = 1024;
	var ui_water_strength = $("#water_horizontal_spinner").val();

	this.get = {
		get ui_noise_scale(){
			return ui_noise_scale;
		},
		get ui_noise_octaves(){
			return ui_noise_octaves;
		},
		get ui_min_rocks(){
			return ui_min_rocks;
		},
		get ui_max_rocks(){
			return ui_max_rocks;
		},		
	}

	var systemGUI = new dat.GUI();
	systemGUI.width = 420;
	systemGUI.domElement.id = 'systemGUI';
	

	/*
	Values on left are values on the left of the GUI
	*/
	var systemOptions = {
		Title: "Mars Scene Interaction",
		Terrain_noise_scale: 50,
		Terrain_noise_octaves: 8,
		Min_rocks_per_section: 512,
		Max_rocks_per_section: 1024,
		Water_strength: 0
	};
	
	// Constructor
	setupSystemGUI();
	
	function setupSystemGUI(){
		// Add items on the left of the systemOptions
		systemGUI.add(systemOptions, "Title");
		
		systemGUI.add(systemOptions, "Terrain_noise_scale", 0, 150).onFinishChange(function(){
			// on change stopAnimationFrame, terrain = new Terrain, start it again
			window.cancelAnimationFrame(animationFrameID);
			requestId = undefined;
			ui_noise_scale = systemOptions['Terrain_noise_scale'];
			terrain = new Terrain();
			// Also need to remake rocks
			ui_min_rocks = systemOptions['Min_rocks_per_section'];
			ui_max_rocks = systemOptions['Max_rocks_per_section'];
			rockGenerator = new RockGenerator();
			render();
		});
		systemGUI.add(systemOptions, "Terrain_noise_octaves", 4, 12).onFinishChange(function(){
			// on change stopAnimationFrame, terrain = new Terrain, start it again
			window.cancelAnimationFrame(animationFrameID);
			requestId = undefined;
			ui_noise_octaves = systemOptions['Terrain_noise_octaves'];
			terrain = new Terrain();
			// Also need to remake rocks
			ui_min_rocks = systemOptions['Min_rocks_per_section'];
			ui_max_rocks = systemOptions['Max_rocks_per_section'];
			rockGenerator = new RockGenerator();
			render();
		});
			
		systemGUI.add(systemOptions, "Min_rocks_per_section", 0, 2048).onFinishChange(function(){
			// on change stopAnimationFrame, terrain = new Terrain, start it again
			window.cancelAnimationFrame(animationFrameID);
			requestId = undefined;
			ui_min_rocks = systemOptions['Min_rocks_per_section'];
			rockGenerator = new RockGenerator();
			render();
		});
		systemGUI.add(systemOptions, "Max_rocks_per_section", 0, 2048).onFinishChange(function(){
			// on change stopAnimationFrame, terrain = new Terrain, start it again
			window.cancelAnimationFrame(animationFrameID);
			requestId = undefined;
			ui_max_rocks = systemOptions['Max_rocks_per_section'];
			rockGenerator = new RockGenerator();
			render();
		});
		systemGUI.add(systemOptions, "Water_strength");
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
 
