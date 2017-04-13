/*
This file creates and displays the GUI elements of the game
*/

	/*
	UI values
	*/
	var ui_noise_scale = 0;
	var ui_min_rocks = $("#rocks_horizontal_spinner_min").val();
	var ui_max_rocks = $("#rocks_horizontal_spinner_max").val();
	var ui_water_strength = $("#water_horizontal_spinner").val();
	
function MyGui(){

	var gui = new dat.gui();
	gui.add(text, 'messsssage');

	$( "#explore_mars_button" ).fadeOut( 8000, function() {
		// Animation complete.
	});
	
	// Terrain scale spinner
	$("#noise_horizontal_spinner").spinner({ 
		min: 0, max: 100,
	}).val(50);
	
	// To pull values from UI and update globals
	$('.ui-spinner-button').click(function() {
		// Determine which was clicked, then update correct one
		console.log(this.id);
	});
	
	// Rock spinners
	$("#rocks_horizontal_spinner_min").spinner({ min: 0, max: 1024 }).val(128);
	$("#rocks_horizontal_spinner_max").spinner({ min: 0, max: 1024 }).val(128);
	
	// Water
	$("#water_horizontal_spinner").spinner({ min: 0, max: 1024 }).val(128);
	
	$( function() {
	
		$("#menu").menu();
		$( "#outOfBoundsID" ).progressbar({
			closeOnEscape: false,
			draggable: false
		})

	$( function() {
		$( ".controlgroup" ).controlgroup()
		$( ".controlgroup-vertical" ).controlgroup({
		  "direction": "vertical"
		});
	  } );
		
	}); //end jquery func

	
	this.showMapCollision = function(){
		document.getElementById("outOfBoundsID").style.visibility = "visible";	
		$( "#outOfBoundsID" ).progressbar({
			
		})		
	}
	
	this.hideMapCollision = function(){
		document.getElementById("outOfBoundsID").style.visibility = "hidden";		
	}
	
	this.get = {
		get getTerrainRows(){
			return terrainRows;
		},
	};
	
}
 
