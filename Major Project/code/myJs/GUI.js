var guiPlayerPositionNode;
var guiXNode;
var guiYNode;
var guiZNode;

var currentMissionNode;
var currentMissionElement;

var nearestRockNode;
var nearestRockElement;

function GUI(){
	
	/*
	Gets elements that need changing

	SET BACkground image of div thing

	Knowledge gained from:
	https://webglfundamentals.org/webgl/lessons/webgl-text-html.html
	*/
	this.setup = function(){	
		var playerPositionElement = document.getElementById("playerPosition");
		var playerXElement = document.getElementById("playerX");
		var playerYElement = document.getElementById("playerY");
		var playerZElement = document.getElementById("playerZ");
		
		// From globals
		// Create text nodes to save some time for the browser.
		guiPlayerPositionNode = document.createTextNode("");
		guiXNode = document.createTextNode("");
		guiYNode = document.createTextNode("");
		guiZNode = document.createTextNode("");	
		 
		// Add those text nodes where they need to go
		playerPositionElement.appendChild(guiPlayerPositionNode);
		playerXElement.appendChild(guiXNode);
		playerYElement.appendChild(guiYNode);
		playerZElement.appendChild(guiZNode);
		
		/*
		Mission GUI
		*/
		currentMissionElement = document.getElementById("currentMission");
		currentMissionNode = document.createTextNode("");
		currentMissionElement.appendChild(currentMissionNode);
		
		
		/*
		XP GUI
		xpOverlayValue
		*/
		var xpElement = document.getElementById("xpOverlay");
		xpNode = document.createTextNode("");
		xpElement.appendChild(xpNode);
		
		/*
		current rock 
		*/
		nearestRockElement = document.getElementById("nearestRockOverlay");
		nearestRockNode = document.createTextNode("");
		nearestRockElement.appendChild(currentMissionNode);		
		
	}
	
	this.updateMission = function(mission){
		currentMissionNode = document.createTextNode(mission);
		currentMissionElement.appendChild(currentMissionNode);	
	}
	
	this.clearMission = function(){
		currentMissionNode = document.createTextNode("");
		currentMissionElement.innerHTML = "";
	}
	
	this.update = function(){
		
		//If player is viewing minimap, hide game GUIs
		if(useFog === false){
		/*
			document.getElementById("xpOverlay").style.visibility = "hidden";
			
			document.getElementById("minimapOverlay").style.visibility = "hidden";
			document.getElementById("missionOverlay").style.visibility = "hidden";
			document.getElementById("nearestRockOverlay").style.visibility = "hidden";
			
			document.getElementById("inventoryOverlay").style.visibility = "hidden";
			*/
		}else{
			//Show GUI elements
			/*
			document.getElementById("xpOverlay").style.visibility = "visible";
			
			document.getElementById("minimapOverlay").style.visibility = "visible";
			document.getElementById("missionOverlay").style.visibility = "visible";
			document.getElementById("nearestRockOverlay").style.visibility = "visible";
			
			document.getElementById("inventoryOverlay").style.visibility = "visible";
			*/
		}
	
	
		// set the nodes
		//guiPlayerPositionNode.nodeValue = "";  // no decimal place
		guiXNode.nodeValue = Math.floor(player.get.x);   // 2 decimal places
		guiYNode.nodeValue = Math.floor(player.get.y);
		guiZNode.nodeValue = Math.floor(player.get.z);	
		
		xpNode.nodeValue = Math.floor(player.get.xp);
	}
	
	this.displayCurrentRock = function(){
		//Check if player is near a rock,
		//eventually get its texture and find its 2d version
		if(player.get.inProspectingRange === true){
			nearestRockElement.style.backgroundImage = "url('resources/rocks/guiRock.png')";
		}
		else{
			nearestRockElement.style.backgroundImage = "none";
		}
		
		//Could just display image of the rock
		//How to rotate it, need to define vertices again?
		//or somehow copy existing vertices, rotate those, so dont alter original?
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
		var playerInventory = player.get.inventory;
		
		for(var i=0; i<8; i++){
			if(playerInventory[i] === -1){
				//Render empty slot
				inventorySlotIDs[i].style.backgroundImage = "url('resources/rocks/empty.png')";
			}
			else{
				inventorySlotIDs[i].style.backgroundImage = "url(resources/rocks/" + playerInventory[i] + ".png)";
			}
		}
	}
	
	
}
 


 
