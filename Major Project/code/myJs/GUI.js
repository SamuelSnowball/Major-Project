var guiPlayerPositionNode;
var guiXNode;
var guiYNode;
var guiZNode;

var currentMissionNode;

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
		var currentMissionElement = document.getElementById("currentMission");
		currentMissionNode = document.createTextNode("");
		currentMissionElement.appendChild(currentMissionNode);
		
		var topLeftElement = document.getElementById("topLeftOverlay");
		topLeftNode = document.createTextNode("");
		topLeftElement.appendChild(topLeftNode);
	}
	
	this.update = function(){
		// set the nodes
		//guiPlayerPositionNode.nodeValue = "";  // no decimal place
		guiXNode.nodeValue = Math.floor(player.x);   // 2 decimal places
		guiYNode.nodeValue = Math.floor(player.y);
		guiZNode.nodeValue = Math.floor(player.z);	
	}
	
}
 


 
