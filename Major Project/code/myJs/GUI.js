 
var guiPlayerPositionNode;
var guiXNode;
var guiYNode;
var guiZNode;
/*
Gets elements that need changing

SET BACkground image of div thing

Knowledge gained from:
https://webglfundamentals.org/webgl/lessons/webgl-text-html.html
*/
function setupGUI(){

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

}
 
