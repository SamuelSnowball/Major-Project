
/**
 * This file creates and displays the GUI elements of the scene, using the library (MIT):
 * https://github.com/dataarts/dat.gui
 * 
 * @class MyGUI
*/
function MyGUI(){

	var systemGUI = new dat.GUI();
	systemGUI.width = 420;
	systemGUI.domElement.id = 'systemGUI';
	
	/*
	UI values
	*/
	var ui_sound_enabled = true;
	var ui_terrain_size = 8;
	var ui_noise_scale = 25;
	var ui_noise_octaves = 8;
	var ui_min_rocks = 512;
	var ui_max_rocks = 1024;
	var ui_water_strength = 0.088;
	
	this.get = {
		/**
		@method get.ui_sound_enabled
		@public
		@return {Bool} if sound is on or off, chosen through the UI
		*/
		get ui_sound_enabled(){
			return ui_sound_enabled;
		},	
	
		/**
		@method get.ui_terrain_size
		@public
		@return {int} the value for the terrain size, chosen through the UI
		*/
		get ui_terrain_size(){
			return ui_terrain_size;
		},
		
		/**
		@method get.ui_noise_scale
		@public
		@return {int} the value for the terrain scale, chosen through the UI
		*/
		get ui_noise_scale(){
			return ui_noise_scale;
		},
		
		/**
		@method get.ui_noise_octaves
		@public
		@return {int} the value for the terrain octaves, chosen through the UI
		*/
		get ui_noise_octaves(){
			return ui_noise_octaves;
		},
		
		/**
		@method get.ui_min_rocks
		@public
		@return {int} the value for the minimum number of rocks, chosen through the UI
		*/
		get ui_min_rocks(){
			return ui_min_rocks;
		},
		
		/**
		@method get.ui_max_rocks
		@public
		@return {int} the value for the maximum number of rocks, chosen through the UI
		*/
		get ui_max_rocks(){
			return ui_max_rocks;
		},		
		
		/**
		@method get.ui_water_strength
		@public
		@return {int} the value for the water strength, chosen through the UI
		*/
		get ui_water_strength(){
			return ui_water_strength;
		}
	}

	/*
	Values on left are values on the left of the GUI
	*/
	var systemOptions = {
		Title: "Mars Scene Interaction",
		Sound: true,
		Terrain_size: 8,
		Terrain_noise_scale: 25,
		Terrain_noise_octaves: 8,
		Min_rocks_per_section: 512,
		Max_rocks_per_section: 1024,
		Water_strength: 0.088,
	};
	
	/**
	@constructor
	*/
	setupSystemGUI();
	
	/**
	Adds all of the options to the UI, so they can be changed
	
	@method setupSystemGUI
	@private
	*/
	function setupSystemGUI(){
	
		// Start water audio
		soundPlayer.play_water_sound();
	
		// Add items on the left of the systemOptions
		systemGUI.add(systemOptions, "Title");
		systemGUI.add(systemOptions, "Sound").onFinishChange(function(){
			ui_sound_enabled = systemOptions['Sound'];
			if(ui_sound_enabled === true){
				soundPlayer.play_water_sound();
			}
			else{
				soundPlayer.stop_water_sound();
			}
		});
		
		systemGUI.add(systemOptions, "Terrain_size", 4, 16).step(2).onFinishChange(function(){
			// on change stopAnimationFrame, terrain = new Terrain, start it again
			window.cancelAnimationFrame(animationFrameID);
			requestId = undefined;
			
			// Remake terrain
			ui_terrain_size = systemOptions['Terrain_size'];
			ui_noise_scale = systemOptions['Terrain_noise_scale'];
			terrain = new Terrain();
			
			camera = new Camera();
			
			// Also need to remake rocks
			ui_min_rocks = systemOptions['Min_rocks_per_section'];
			ui_max_rocks = systemOptions['Max_rocks_per_section'];
			rockGenerator = new RockGenerator();
			
			collisionTester = new CollisionTester();

			scene.start();
		});
		systemGUI.add(systemOptions, "Terrain_noise_scale", 1, 50).step(1).onFinishChange(function(){
			// on change stopAnimationFrame, terrain = new Terrain, start it again
			window.cancelAnimationFrame(animationFrameID);
			requestId = undefined;
			ui_noise_scale = systemOptions['Terrain_noise_scale'];
			terrain = new Terrain();
			// Also need to remake rocks
			ui_min_rocks = systemOptions['Min_rocks_per_section'];
			ui_max_rocks = systemOptions['Max_rocks_per_section'];
			rockGenerator = new RockGenerator();
			scene.start();
		});
		systemGUI.add(systemOptions, "Terrain_noise_octaves", 4, 12).step(1).onFinishChange(function(){
			// on change stopAnimationFrame, terrain = new Terrain, start it again
			window.cancelAnimationFrame(animationFrameID);
			requestId = undefined;
			ui_noise_octaves = systemOptions['Terrain_noise_octaves'];
			terrain = new Terrain();
			// Also need to remake rocks
			ui_min_rocks = systemOptions['Min_rocks_per_section'];
			ui_max_rocks = systemOptions['Max_rocks_per_section'];
			rockGenerator = new RockGenerator();
			scene.start();
		});
		systemGUI.add(systemOptions, "Min_rocks_per_section", 0, 2048).onFinishChange(function(){
			// on change stopAnimationFrame, terrain = new Terrain, start it again
			window.cancelAnimationFrame(animationFrameID);
			requestId = undefined;
			ui_min_rocks = systemOptions['Min_rocks_per_section'];
			rockGenerator = new RockGenerator();
			scene.start();
		});
		systemGUI.add(systemOptions, "Max_rocks_per_section", 0, 2048).onFinishChange(function(){
			// on change stopAnimationFrame, terrain = new Terrain, start it again
			window.cancelAnimationFrame(animationFrameID);
			requestId = undefined;
			ui_max_rocks = systemOptions['Max_rocks_per_section'];
			rockGenerator = new RockGenerator();
			scene.start();
		});
		systemGUI.add(systemOptions, "Water_strength", 0.001, 0.5).onFinishChange(function(){
			ui_water_strength = systemOptions['Water_strength'];
		});		
	}
	
	// Dialog for when use tries to go off map
	$( function() {
		$( "#outOfBoundsID" ).progressbar({
			closeOnEscape: false,
			draggable: false
		})
	});

	/**
	Displays message when use tries to go off map
	
	@method showMapCollision
	@public
	*/
	this.showMapCollision = function(){
		document.getElementById("outOfBoundsID").style.visibility = "visible";	
		$( "#outOfBoundsID" ).progressbar({
			
		})		
	}
	
	/**
	Hides message when use tries to go off map
	
	@method hideMapCollision
	@public
	*/
	this.hideMapCollision = function(){
		document.getElementById("outOfBoundsID").style.visibility = "hidden";		
	}
	
	/*
	TESTING FUNCTIONS BELOW
	*/
	
	/**
	@method test_getters
	@public
	*/
	this.test_getters = function(){
		if(this.get.ui_sound_enabled !== false && this.get.ui_sound_enabled !== true){
			console.error("Failed to set ui_sound_enabled, it wasn't true/false");
		}

		testerObject.test_isNaN_orInt("ui_tetrain_size", this.get.ui_terrain_size);
		testerObject.test_isNaN_orInt("ui_noise_scale", this.get.ui_noise_scale);
		testerObject.test_isNaN_orInt("ui_noise_octaves", this.get.ui_noise_octaves);
		testerObject.test_isNaN_orInt("ui_min_rocks", this.get.ui_min_rocks);
		testerObject.test_isNaN_orInt("ui_max_rocks", this.get.ui_max_rocks);
		
		if(this.get.ui_water_strength > 0 && this.get.ui_water_strength <= 0.5){
			// Valid
		}
		else{
			console.error("UI water strength exceeded max/min values, or setter/getter failed!");
		}
	}
	
}
 