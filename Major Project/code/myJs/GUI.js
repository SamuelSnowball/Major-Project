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
	
	var slot0 = document.getElementById("slot0");
	var slot1 = document.getElementById("slot1");
	var slot2 = document.getElementById("slot2");
	var slot3 = document.getElementById("slot3");
	var slot4 = document.getElementById("slot4");
	var slot5 = document.getElementById("slot5");
	var slot6 = document.getElementById("slot6");
	var slot7 = document.getElementById("slot7");
	
	var inventorySlotIDs = [];
	inventorySlotIDs.push(slot0, slot1, slot2, slot3, slot4, slot5, slot6, slot7);
	
	this.renderInventory = function(){
		
		var playerInv = player.get.inventory;
	
		for(var i=0; i<player.get.inventorySize; i++){
			if(playerInv[i] === -1){
				inventorySlotIDs[i].src = "resources/rocks/empty.png"
			}
			else{
				inventorySlotIDs[i].src = "resources/rocks/" + playerInv[i] + "_inv.png";
			}
		}

	}
	
}
 
