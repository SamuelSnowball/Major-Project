/*
This file creates and displays the GUI elements of the game
*/
function GUI(){

	$(function(){
		$("#menu").menu();
		
		$("#minimapID").dialog({
			height: window.innerHeight/2.5,
			width: window.innerWidth/3,
			resizable: false,
			position: {  at: "left bottom-10%" },
			closeOnEscape: false,
			open: function(event, ui) { $(".ui-dialog-titlebar-close").hide(); },
			draggable: false,
			autoOpen: false,
		});
		
		$( "#depositOreID" ).progressbar({
			closeOnEscape: false,
			draggable: false
		})
		$( "#outOfBoundsID" ).progressbar({
			closeOnEscape: false,
			draggable: false
		})
		$( "#xpBarID" ).progressbar({
			value: 100,
			closeOnEscape: false,
			draggable: false
		})
		$( "#healthBarID" ).progressbar({
			value: 100,
			closeOnEscape: false,
			draggable: false
		})
		$( "#prospectingBarID" ).progressbar({
			value: prospectingBarValue,
			closeOnEscape: false,
			draggable: false
		})
		$( "#inventoryBarID" ).progressbar({
			value: prospectingBarValue,
			closeOnEscape: false,
			draggable: false
		})

		$( "#mainOverlay" ).tabs();

	}); //end jquery func
	
	this.showElements = function(){
		document.getElementById("minimapID").style.visibility = "visible";
		document.getElementById("menu").style.visibility = "visible";
		document.getElementById("xpBarID").style.visibility = "visible";	
		document.getElementById("healthBarID").style.visibility = "visible";	
		document.getElementById("mainOverlay").style.visibility = "visible";	
		
		// Shows the minimap, don't remove
		var theDialog = $("#minimapID").dialog();
		theDialog.dialog("open");
	}

	this.showRockInformation = function(){
		$("#mainOverlay").tabs("option", "active", 0);
		$("#tabs-1").text("your text herasde");		
	}
	
	this.showInventory = function(){
		$("#mainOverlay").tabs("option", "active", 1);
	}
	
	this.showMission = function(){
		$("#mainOverlay").tabs("option", "active", 2);
	}
	
	this.showFullInventory = function(){
		document.getElementById("inventoryBarID").style.visibility = "visible";	
		$( "#inventoryBarID" ).progressbar({
				
		})	
	}
	
	this.hideFullInventory = function(){
		document.getElementById("inventoryBarID").style.visibility = "hidden";	
	}
	
	this.showHealthBar = function(){
		document.getElementById("healthBarID").style.visibility = "visible";	
		$( "#healthBarID" ).progressbar({
			value: player.get.health,
		})
	}
	
	this.showMapCollision = function(){
		document.getElementById("outOfBoundsID").style.visibility = "visible";	
		$( "#outOfBoundsID" ).progressbar({
			
		})		
	}
	
	this.hideMapCollision = function(){
		document.getElementById("outOfBoundsID").style.visibility = "hidden";		
	}
	
	this.hideProspectingBar = function(){
		document.getElementById("prospectingBarID").style.visibility = "hidden";		
	}
	
	this.showProspectingBar = function(){
		document.getElementById("prospectingBarID").style.visibility = "visible";	
		$( "#prospectingBarID" ).progressbar({
			value: prospectingBarValue,
		})
	}
	
	this.updateMission = function(missionText){
		document.getElementById("missionTextID").innerHTML = missionText;	
	}
	
	this.clearMission = function(){
		document.getElementById("missionTextID").innerHTML = "";	
	}
	
}
 
