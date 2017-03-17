
function CollisionTester(){
	
	var playerHeightIncrement = 0.01;
	
	// Needed to test player map boundaries
	var terrainRows = terrain.get.getTerrainRows;
	var numberQuadrantRows = terrain.get.getNumberQuadrantRows;
	var quadrantRowSize = terrain.get.getQuadrantRowSize;
					
	var tempPlayerX = 0;
	var tempPlayerZ = 0;
	
	var mapTopLeftCornerVector = [128, 0, 128];
	var mapTopRightCornerVector = [896, 0, 128];
	var mapBottomLeftCornerVector = [128, 0, 896];
	var mapBottomRightCornerVector = [896, 0, 896];
	
	this.testAllCollision = function(){
		setPlayerHeight();
		testPlayerRockCollision();
		testPlayerMapBoundaries();
	}
	
	/*
	Moves the player when traversing over terrain.

	Uses the players current X and Z position to find what terrain vertex they're nearest to.
	The players height then gets assigned to the nearest terrain vertex.
	*/
	function setPlayerHeight(){
		if(useFog === false){
			// Player is viewing minimap, dont set their height
			return;
		}
		
		// Retrieve the players current x and z position
		tempPlayerX = player.get.x;
		tempPlayerZ = player.get.z;
		
		floorTemporaryPlayerCoordinates();
		var nearestHeight = findNearestTerrainVertex();
		
		player.set.y = nearestHeight;
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
	If they're in prospecting range, allow them to prospect
	If they're too close to the rock, move them back
	
	Have to have 2 different ranges here, otherwise as soon as they're colliding,
	and they try to prospect,
	They get moved back, out of prospect range
	*/
	function testPlayerRockCollision(){
		
		/*
		Say they're not in any prospecting range, then when we check if they are, edit this variable
		
		If you put it in an else, block, 
			It breaks because they're in range of one rock
			And it gets set to true
			Then it tests for the next rock, and it goes false!
		*/
		player.set.inProspectingRange = false;
		
		var playerInRangeOfAnyRock = false;
		
		//Retrieve rocks array from the rockGenerator class
		var objRocks = rockGenerator.getObjRocksArray.getRocks;
		for(var i=0; i<objRocks.length; i++){
			
			/*
			Check if user is in prospecting range
			*/
			var distance = Math.sqrt( 
				Math.pow( (objRocks[i].x - player.get.x), 2) +
				Math.pow( (objRocks[i].y - player.get.y), 2) +
				Math.pow( (objRocks[i].z - player.get.z), 2) 
			);
				
			if(distance > objRocks[i].scale * 5){
				// Player too far away from rock to prospect
				// Hide inventory full interface
				
			}
			else{
				playerInRangeOfAnyRock = true;
				// If they're in range of rock and have no space, tell them inventory is full
				if(playerInRangeOfAnyRock === true && !player.get.inventory.includes(-1)){
					console.log("this happened");
					document.getElementById("inventoryBarID").style.visibility = "visible";	
					$( "#inventoryBarID" ).progressbar({
							
					})
				}
			
				// They're in range prospecting, update GUI with current rock
				player.set.inProspectingRange = true; 
				isProspecting(objRocks[i]);

				/*
				Check if they're too close, move them back
				*/
				if(distance < objRocks[i].scale * 1.5 ){
					movePlayerForwardOrBackward(true);
				}
				
			}
			
			// If player not in range of rock, hide inventory full message
			if(playerInRangeOfAnyRock === false){
				document.getElementById("inventoryBarID").style.visibility = "hidden";	
			}
			
		}	
		/*
		var triRocks = rockGenerator.getTriRocksArray.getRocks;
		for(var i=0; i<triRocks.length; i++){
			//If in prospect range
			if(	player.get.x > triRocks[i].x  - (triRocks[i].width*3) &&
				player.get.x < triRocks[i].x + (triRocks[i].width*3) &&
				
				player.get.z > triRocks[i].z - (triRocks[i].width*3) && 
				player.get.z < triRocks[i].z + (triRocks[i].width*3) 
			){	
				player.set.inProspectingRange = true;
				isProspecting(triRocks[i]);
				
				//Triangle rocks collision testing
				
				if(	player.get.x > triRocks[i].x  - (triRocks[i].width*2) &&
					player.get.x < triRocks[i].x + (triRocks[i].width*2) &&
					
					player.get.z > triRocks[i].z - (triRocks[i].width*2) && 
					player.get.z < triRocks[i].z + (triRocks[i].width*2) 
				){	
					player.moveForwardOrBackward();
				}
			}
		}
		*/
	}
	
	/*
	Moves the player forwards/backwards depending on the direction they where moving when they collided

	If direction === 1
		Then player has collided moving forwards, so move the player backwards
	If direction === -1
		Then player has collided moving backward, so move the player forwards
	*/
	function pushPlayer(direction){
		player.add.x = direction * (cameraPosition[0] - cameraTarget[0]) * 5;
		player.add.z = direction * (cameraPosition[2] - cameraTarget[2]) * 5;
		terrain.heightMapValueAtIndex.setTemporaryHeightMapX = Math.floor(player.get.z); 
		terrain.heightMapValueAtIndex.setTemporaryHeightMapZ = Math.floor(player.get.x);
		player.add.y = terrain.heightMapValueAtIndex.getTemporaryHeightMapValue + 0.2;
	}
	

	
	/*
	Check if they're going forwards or backwards
	Push them different ways based on movement direction
	
	If parameter is true, they collided with a rock, decrement player HP
	else, they collided with edge of map, keep HP same
	*/	
	function movePlayerForwardOrBackward(rockCollision, cornerX, cornerZ){
	
		// Only do this if they didn't collide with a corner
		if(player.get.movingForward === true){	
			pushPlayer(1);
		}
		else if(player.get.movingBackward === true){
			pushPlayer(-1);
		}
		else{
		
		}	
		
		// If they collided with a rock, make them lose HP
		if(rockCollision){
			player.add.health = -10;
			document.getElementById("healthBarID").style.visibility = "visible";	
			$( "#healthBarID" ).progressbar({
				value: player.get.health,
			})
		}
		
	}

	function testPlayerMapBoundaries(){
	
		var colliding = false;
		
		testPlayerCornerCollision(mapBottomLeftCornerVector);
		testPlayerCornerCollision(mapBottomRightCornerVector);
		testPlayerCornerCollision(mapTopLeftCornerVector);
		testPlayerCornerCollision(mapTopRightCornerVector);

		/*
		Stop them going out of section
		
		x < 128 && 
		*/
		console.log("tr: " + terrainRows);
		console.log("nqr: " + numberQuadrantRows);
		console.log("x must be greater than: " + terrainRows-numberQuadrantRows);
		if(player.get.x < terrainRows/numberQuadrantRows && player.get.z < terrainRows){
			movePlayerForwardOrBackward(false);
			colliding = true;
			console.log("1"); 
		}
		else if(player.get.x > terrainRows-quadrantRowSize && player.get.z < terrainRows){
			movePlayerForwardOrBackward(false);
			colliding = true;
		}
		else if(player.get.z < terrainRows/numberQuadrantRows && player.get.x < terrainRows){
			movePlayerForwardOrBackward(false);
			colliding = true;
				console.log("3"); 
		}
		else if(player.get.z > terrainRows-quadrantRowSize && player.get.x < terrainRows){
			movePlayerForwardOrBackward(false);
			colliding = true;
			console.log("4");
		}
		else{
			colliding = false;
		}
		
		// Show GUI element
		if(colliding){
			document.getElementById("outOfBoundsID").style.visibility = "visible";	
			$( "#outOfBoundsID" ).progressbar({
				
			})
		}
		else{
			document.getElementById("outOfBoundsID").style.visibility = "hidden";	
		}
		
	}
	
	/*
	Test if player is near a corner, and move them back if so
	*/
	function testPlayerCornerCollision(cornerVector){
		var playerVector = [player.get.x, player.get.y, player.get.z];
		
		var distanceToCorner = Math.sqrt( 
			Math.pow( (playerVector[0] - cornerVector[0]), 2) +
			Math.pow( (playerVector[1] - cornerVector[1]), 2) +
			Math.pow( (playerVector[2] - cornerVector[2]), 2) 
		);
		//console.log(distanceToCorner);
		if(distanceToCorner < 10){	
			//movePlayerForwardOrBackward(false);
			//move the player different direction based on the corner they hit
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
	
	/*
	If the user is colliding with a rock, and they're holding down P,
	Then they're prospecting the rock, so increment the prospecting bar.
	
	Once the prospecting bar reaches 100, first check the player has inventory space, 
	then prospect the rock, and finally change the rocks texture to depleted
	*/
	function isProspecting(rock){
		/*
		Check if rock is already depleted, if so, they cant prospect it again!
		*/
		if(rock.texture === depletedTexture){
			// Already depleted!
			document.getElementById("prospectingBarID").style.visibility = "hidden";	
		}
		else{
			// Rock hasn't been depleted, see if the player is prospecting it
			if(player.get.prospecting === true){
			
				// Slowly increment the players prospecting bar, and show the GUI for it
				prospectingBarValue += 10;//player.get.prospectingSpeed;
				document.getElementById("prospectingBarID").style.visibility = "visible";	
				$( "#prospectingBarID" ).progressbar({
					value: prospectingBarValue,
				})
				
				/*
				// If they're prospecting and have no space, tell them inventory is full
				if(!player.get.inventory.includes(-1)){
					document.getElementById("inventoryBarID").style.visibility = "visible";	
					$( "#inventoryBarID" ).progressbar({
							
					})
				}
				*/
				
				// Check if prospect bar is 100% && Check if there's a free space in player inventory
				if(prospectingBarValue >= 100 && player.get.inventory.includes(-1)){
					// Bar has reached 100%
					rock.texture = depletedTexture;
					player.add.xp = 1;
					player.addToInventory(rock);	
					// Reset the value
					prospectingBarValue = 0;
				}
				else{
					// Prospecting bar hasn't reached 100% yet, so just do nothing
				}
				
			}
			else{
				// Player is not prospecting 
				// Reset the value
				prospectingBarValue = 0;
				// Hide the prospecting bar
				document.getElementById("prospectingBarID").style.visibility = "hidden";	
			}
			
			
			
		}
	}	

}


