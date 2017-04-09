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
	var tempPlayerX = 0;
	var tempPlayerZ = 0;
	
	// The positions of the map boundary corners, need to stop player going outside of them
	var mapTopLeftCornerVector = [quadrantRowSize, 0, quadrantRowSize];
	var mapTopRightCornerVector = [terrainRows-quadrantRowSize, 0, quadrantRowSize];
	var mapBottomLeftCornerVector = [quadrantRowSize, 0, terrainRows-quadrantRowSize];
	var mapBottomRightCornerVector = [terrainRows-quadrantRowSize, 0, terrainRows-quadrantRowSize];
	
	/*
	Called from render(), tests all collision
	*/
	this.testAllCollision = function(){
		setPlayerHeight();
		//testPlayerMapBoundaries();
	}
	
	/*
	Moves the player when traversing over terrain.

	Uses the players current X and Z position to find what terrain vertex they're nearest to.
	The players height then gets assigned to the nearest terrain vertex.
	*/
	function setPlayerHeight(){
		if(useFog === false){
			// Player is viewing minimap, don't set their height
			return;
		}
		
		// Retrieve the players current x and z position, 
		// Use these values to find the height we should set for them
		tempPlayerX = cameraPosition[0];
		tempPlayerZ = cameraPosition[2];
		
		floorTemporaryPlayerCoordinates();
		var nearestHeight = findNearestTerrainVertex();
		
		/*
		If player is beneath the floor, push them back up
		*/
		if(cameraPosition[1] < nearestHeight){
			cameraPosition[1] = nearestHeight;
		}
		
		
	}

	/*
	Player coordinates are sometimes decimals, 
	So get floored so they don't mess up the array indexing,
	as array indexes must be a integer.
	*/
	function floorTemporaryPlayerCoordinates(){
		if(tempPlayerX / terrain.scale < 0.5){
			tempPlayerX = Math.floor(tempPlayerX);
		}else{
			tempPlayerX = Math.ceil(tempPlayerX);
		}
		
		if(tempPlayerZ / terrain.scale < 0.5){
			tempPlayerZ = Math.floor(tempPlayerZ);
		}else{
			tempPlayerZ = Math.ceil(tempPlayerZ);
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
		
		if(tempPlayerX > 0){ 
			terrain.heightMapValueAtIndex.setTemporaryHeightMapX = tempPlayerZ; 
			terrain.heightMapValueAtIndex.setTemporaryHeightMapZ = tempPlayerX;
			nearestHeight = terrain.heightMapValueAtIndex.getTemporaryHeightMapValue;
		}
		else{
			nearestHeight = 0;
		}

		// Return the nearest vertex height, +1, otherwise the player would be in the floor
		// We want the player hovering and moving just over the terrain, not inside of it.
		return nearestHeight + 1;
	}
	
	/*
	Moves the player forwards/backwards depending on the direction they where moving when they collided

	If direction === 1
		Then player has collided moving forwards, so move the player backwards
	If direction === -1
		Then player has collided moving backward, so move the player forwards
	*/
	function pushPlayer(direction){
		cameraPosition[0] += direction * (cameraPosition[0] - cameraTarget[0]) * 5;
		cameraPosition[2] += direction * (cameraPosition[2] - cameraTarget[2]) * 5;
		terrain.heightMapValueAtIndex.setTemporaryHeightMapX = Math.floor(cameraPosition[2]); 
		terrain.heightMapValueAtIndex.setTemporaryHeightMapZ = Math.floor(cameraPosition[0]);
		cameraPosition[1] += terrain.heightMapValueAtIndex.getTemporaryHeightMapValue + 0.4;
	}
	
	/*
	Check if they're going forwards or backwards
	Push them different ways based on movement direction
	
	If parameter is true, they collided with a rock, decrement player HP
	else, they collided with edge of map, keep HP same
	*/	
	function movePlayerForwardOrBackward(rockCollision, cornerX, cornerZ){
	
		// If they collided whilst moving forward, push them back etc
		if(player.get.movingForward === true){	
			pushPlayer(1);
		}
		else if(player.get.movingBackward === true){
			pushPlayer(-1);
		}
		else{
		
		}	
		
	}
	
	/*
	Tests if player is going out of map boundaries, moves them back if so
	*/
	function testPlayerMapBoundaries(){

		// Test if player at corners, move them back if so
		testPlayerCornerCollision(mapBottomLeftCornerVector);
		testPlayerCornerCollision(mapBottomRightCornerVector);
		testPlayerCornerCollision(mapTopLeftCornerVector);
		testPlayerCornerCollision(mapTopRightCornerVector);
		
		// Test if nearly at collision boundary and show gui if they are
		if(player.get.x < terrainRows/numberQuadrantRows + 10 && player.get.z < terrainRows - 10){
			gui.showMapCollision();
		}
		else if(player.get.x > terrainRows-quadrantRowSize - 10 && player.get.z < terrainRows - 10){
			gui.showMapCollision();
		}
		else if(player.get.z < terrainRows/numberQuadrantRows + 10 && player.get.x < terrainRows - 10){
			gui.showMapCollision();
		}
		else if(player.get.z > terrainRows-quadrantRowSize - 10 && player.get.x < terrainRows - 10){
			gui.showMapCollision();
		}
		else{
			gui.hideMapCollision();
		}
		
		/*
		Stop them going out of section
		*/
		if(player.get.x < terrainRows/numberQuadrantRows && player.get.z < terrainRows){
			movePlayerForwardOrBackward(false);
		}
		else if(player.get.x > terrainRows-quadrantRowSize && player.get.z < terrainRows){
			movePlayerForwardOrBackward(false);
		}
		else if(player.get.z < terrainRows/numberQuadrantRows && player.get.x < terrainRows){
			movePlayerForwardOrBackward(false);
		}
		else if(player.get.z > terrainRows-quadrantRowSize && player.get.x < terrainRows){
			movePlayerForwardOrBackward(false);
		}
		else{

		}

	}
	
	/*
	Test if player is near a corner, and move them back if so
	
	Parameter cornerVector, the corner vector to test player vector against
	*/
	function testPlayerCornerCollision(cornerVector){
		var playerVector = [player.get.x, player.get.y, player.get.z];
		
		var distanceToCorner = Math.sqrt( 
			Math.pow( (playerVector[0] - cornerVector[0]), 2) +
			Math.pow( (playerVector[1] - cornerVector[1]), 2) +
			Math.pow( (playerVector[2] - cornerVector[2]), 2) 
		);

		if(distanceToCorner < 10){	
			// Move the player different direction based on the corner they hit
			if(cornerVector[0] === 128 && cornerVector[2] === 128){
				player.set.x = player.get.x + 5;
				player.set.z = player.get.z + 5;
			}
			else if(cornerVector[0] === 896 && cornerVector[2] === 128){
				console.log("corner1");
				player.set.x = player.get.x - 5;
				player.set.z = player.get.z + 5;
			}
			else if(cornerVector[0] === 128 && cornerVector[2] === 896){
				console.log("corner2");
				player.set.x = player.get.x + 5;
				player.set.z = player.get.z - 5;
			}
			else if(cornerVector[0] === 896 && cornerVector[2] === 896){
				player.set.x = player.get.x - 5;
				player.set.z = player.get.z - 5;
			}
		}		
	}

}


