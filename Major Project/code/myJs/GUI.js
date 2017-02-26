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
	
	this.update = function(){
		// set the nodes
		//guiPlayerPositionNode.nodeValue = "";  // no decimal place
		guiXNode.nodeValue = Math.floor(player.x);   // 2 decimal places
		guiYNode.nodeValue = Math.floor(player.y);
		guiZNode.nodeValue = Math.floor(player.z);	
		
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
	
}
 


 
