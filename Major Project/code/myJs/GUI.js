/*
This file creates and displays the GUI elements of the game
*/
function GUI(){

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
	
	this.showElements = function(){
		document.getElementById("menu").style.visibility = "visible";
		// Shows the minimap, don't remove
		var theDialog = $("#minimapID").dialog();
		theDialog.dialog("open");
	}


	
	this.showMapCollision = function(){
		document.getElementById("outOfBoundsID").style.visibility = "visible";	
		$( "#outOfBoundsID" ).progressbar({
			
		})		
	}
	
	this.hideMapCollision = function(){
		document.getElementById("outOfBoundsID").style.visibility = "hidden";		
	}
	
}
 
