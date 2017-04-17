/*
Tests collision for the player against:
	Terrain
	Rocks
	Map boundaries
*/
function CollisionTester(){

	var terrainRows = terrain.get.getTerrainRows;
	var numberQuadrantRows = terrain.get.getNumberQuadrantRows;
	var quadrantRowSize = terrain.get.getQuadrantRowSize;
				
	// Used to find the nearest terrain vertex height to the player
	var tempCameraX = 0;
	var tempCameraZ = 0;
	
	// The positions of the map boundary corners, need to stop player going outside of them
	var mapTopLeftCornerVector = [quadrantRowSize, 0, quadrantRowSize];
	var mapTopRightCornerVector = [terrainRows-quadrantRowSize, 0, quadrantRowSize];
	var mapBottomLeftCornerVector = [quadrantRowSize, 0, terrainRows-quadrantRowSize];
	var mapBottomRightCornerVector = [terrainRows-quadrantRowSize, 0, terrainRows-quadrantRowSize];
	
	/*
	Called from render(), tests all collision
	*/
	this.testAllCollision = function(){
		setCameraHeight();
		testCameraMapBoundaries();
	}
	
	/*
	Moves the camera when traversing over terrain.

	Uses the camera current X and Z position to find what terrain vertex they're nearest to.
	The camera height then gets assigned to the nearest terrain vertex.
	*/
	function setCameraHeight(){
		
		// Retrieve the camera current x and z position, 
		// Use these values to find the height we should set for them
		tempCameraX = camera.get.x;
		tempCameraZ = camera.get.z;
		
		floorTemporaryPlayerCoordinates();
		var nearestHeight = findNearestTerrainVertex();
		
		/*
		If player is beneath the floor, push them back up
		*/
		if(camera.get.y < nearestHeight){
			camera.set.y = nearestHeight;
		}
		
		/*
		Don't allow player higher than 20
		*/
		if(camera.get.y > 20){
			camera.set.y = 20;
		}
	}

	/*
	Player coordinates are sometimes decimals, 
	So get floored so they don't mess up the array indexing,
	as array indexes must be a integer.
	*/
	function floorTemporaryPlayerCoordinates(){
		if(tempCameraX / terrain.scale < 0.5){
			tempCameraX = Math.floor(tempCameraX);
		}else{
			tempCameraX = Math.ceil(tempCameraX);
		}
		
		if(tempCameraZ / terrain.scale < 0.5){
			tempCameraZ = Math.floor(tempCameraZ);
		}else{
			tempCameraZ = Math.ceil(tempCameraZ);
		}	
	}

	/*
	Need to find what height to position the player at.
	So need to find what terrain vertex they're nearest to.
	
	Do this by passing in the player X and Z coordinates into the heightMap,
	to return the corresponding terrain vertex height value.
	
	Get the nearest height from the heightMap, which is private,
	So call the getter method
	*/	
	function findNearestTerrainVertex(){
		var nearestHeight;
		
		if(tempCameraX > 0){ 
			terrain.heightMapValueAtIndex.setTemporaryHeightMapX = tempCameraZ; 
			terrain.heightMapValueAtIndex.setTemporaryHeightMapZ = tempCameraX;
			nearestHeight = terrain.heightMapValueAtIndex.getTemporaryHeightMapValue;
		}
		else{
			nearestHeight = 0;
		}

		// Return the nearest vertex height, +4, otherwise the player would be in the floor
		// We want the player hovering and moving just over the terrain, not inside of it.
		return nearestHeight + 4;
	}
	
	/*
	Moves the player forwards/backwards depending on the direction they where moving when they collided

	If direction === 1
		Then player has collided moving forwards, so move the player backwards
	If direction === -1
		Then player has collided moving backward, so move the player forwards
	*/
	function pushPlayer(direction){
		camera.set.x = camera.get.x +  direction * ( - camera.get.targetX) * 5;
		camera.set.z = camera.get.z +  direction * ( - camera.get.targetZ) * 5;
	}
	
	/*
	Check if they're going forwards or backwards
	Push them different ways based on movement direction
	
	If parameter is true, they collided with a rock, decrement player HP
	else, they collided with edge of map, keep HP same
	*/	
	function movePlayerForwardOrBackward(rockCollision, cornerX, cornerZ){
	
		// If they collided whilst moving forward, push them back etc
		if(camera.get.movingForward === true){	
			pushPlayer(1);
		}
		else if(camera.get.movingBackward === true){
			pushPlayer(-1);
		}
		else{
		
		}	
		
	}
	
	/*
	Tests if player is going out of map boundaries, moves them back if so
	*/
	function testCameraMapBoundaries(){

		// Test if camera at corners, move them back if so
		testCameraCornerCollision(mapBottomLeftCornerVector);
		testCameraCornerCollision(mapBottomRightCornerVector);
		testCameraCornerCollision(mapTopLeftCornerVector);
		testCameraCornerCollision(mapTopRightCornerVector);
		
		// Test if nearly at collision boundary and show the collision gui if they are
		if(camera.get.x < terrainRows/numberQuadrantRows + 10 && camera.get.z < terrainRows - 10){
			myGUI.showMapCollision();
		}
		else if(camera.get.x > terrainRows-quadrantRowSize - 10 && camera.get.z < terrainRows - 10){
			myGUI.showMapCollision();
		}
		else if(camera.get.z < terrainRows/numberQuadrantRows + 10 && camera.get.x < terrainRows - 10){
			myGUI.showMapCollision();
		}
		else if(camera.get.z > terrainRows-quadrantRowSize - 10 && camera.get.x < terrainRows - 10){
			myGUI.showMapCollision();
		}
		else{
			myGUI.hideMapCollision();
		}
		
		/*
		Stop them going out of section
		*/
		if(camera.get.x < terrainRows/numberQuadrantRows && camera.get.z < terrainRows){
			movePlayerForwardOrBackward(false);
		}
		else if(camera.get.x > terrainRows-quadrantRowSize && camera.get.z < terrainRows){
			movePlayerForwardOrBackward(false);
		}
		else if(camera.get.z < terrainRows/numberQuadrantRows && camera.get.x < terrainRows){
			movePlayerForwardOrBackward(false);
		}
		else if(camera.get.z > terrainRows-quadrantRowSize && camera.get.x < terrainRows){
			movePlayerForwardOrBackward(false);
		}
		else{

		}

	}
	
	/*
	Test if camera is near a corner, and move them back if so
	
	Parameter cornerVector, the corner vector to test camera vector against
	*/
	function testCameraCornerCollision(cornerVector){
		var playerVector = [camera.get.x, camera.get.y, camera.get.z];
		
		var distanceToCorner = Math.sqrt( 
			Math.pow( (playerVector[0] - cornerVector[0]), 2) +
			Math.pow( (playerVector[1] - cornerVector[1]), 2) +
			Math.pow( (playerVector[2] - cornerVector[2]), 2) 
		);

		if(distanceToCorner < 10){	
			// Move the camera different direction based on the corner they hit
			if(cornerVector[0] === 128 && cornerVector[2] === 128){
				camera.set.x = camera.get.x + 5;
				camera.set.z = camera.get.z + 5;
			}
			else if(cornerVector[0] === 896 && cornerVector[2] === 128){
				camera.set.x = camera.get.x - 5;
				camera.set.z = camera.get.z + 5;
			}
			else if(cornerVector[0] === 128 && cornerVector[2] === 896){
				camera.set.x = camera.get.x + 5;
				camera.set.z = camera.get.z - 5;
			}
			else if(cornerVector[0] === 896 && cornerVector[2] === 896){
				camera.set.x = camera.get.x - 5;
				camera.set.z = camera.get.z - 5;
			}
		}		
	}

}


