
function CollisionTester(){
	
	var playerHeightIncrement = 0.01;
	
	// Needed to test player map boundaries
	var terrainRows = terrain.get.getTerrainRows;
	var numberQuadrantRows = terrain.get.getNumberQuadrantRows;
					
					
	
	/*
	Moves the player when traversing over terrain.

	Uses the players current X and Z position to find what terrain vertex they're nearest to.
	The players height then gets assigned to the nearest terrain vertex.
	*/
	this.setPlayerHeight = function(){
		if(useFog === false){
			//Player is viewing minimap, dont set their height
			return;
		}
	
		/*
		Use playerX and Z to find value its height in heightMap array
		
		playerX,Y,Z can be negative, so turn positive first
		
		If it isn't negative, keep it the same and assign it
		*/
		var tempPlayerX = 0;
		var tempPlayerZ = 0;
		if(player.x < 0){
			tempPlayerX = player.get.x * -1;
		}else{
			tempPlayerX = player.get.x;
		}
		if(player.z < 0){
			tempPlayerZ = player.get.z * -1;
		}else{
			tempPlayerZ = player.get.z;
		}

		/*
		Player coordinates get floored so they don't screw up the array indexing, must be a integer.
		*/
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
		
		/*
		Need to find what height to position the player at.
		So need to find what terrain vertex they're nearest to.
		
		Do this by passing in the player X and Z coordinates into the heightMap,
		to return the nearest terrain Y value.
		
		Get the nearest height from the heightMap, which is private,
		So call the getter method
		*/
		var nearestHeight;
		if(tempPlayerX > 0){ //if tempPlayerX isn't NaN
			terrain.heightMapValueAtIndex.setTemporaryHeightMapX = tempPlayerZ; //inversed after rebuilt terrain
			terrain.heightMapValueAtIndex.setTemporaryHeightMapZ = tempPlayerX; //inversed after rebuilt terrain
			
			nearestHeight = terrain.heightMapValueAtIndex.getTemporaryHeightMapValue;
		}else{
			nearestHeight = 0;
		}

		//Assign the nearest terrain height to the player height
		player.set.y = nearestHeight + 1;

	}
	
	
	
	/*
	If they're in prospecting range, allow them to prospect
	If they're too close to the rock, move them back
	
	Have to have 2 different ranges here, otherwise as soon as they're colliding,
	and they try to prospect,
	They get moved back, out of prospect range
	*/
	this.testPlayerRockCollision = function(){
		
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
		player.add.x = direction * (cameraPosition[0] - cameraTarget[0]) * 15;
		player.add.z = direction * (cameraPosition[2] - cameraTarget[2]) * 15;
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
	function movePlayerForwardOrBackward(rockCollision){
		
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

	this.testPlayerMapBoundaries = function(){
	
		var colliding = false;
		
		/*
		Stop them going out of section
		*/
		if(player.get.x < terrainRows/numberQuadrantRows && player.get.z < terrainRows){
			movePlayerForwardOrBackward(false);
			colliding = true;
		}
		else if(player.get.x > terrainRows-numberQuadrantRows && player.get.z < terrainRows){
			movePlayerForwardOrBackward(false);
			colliding = true;
		}
		else if(player.get.z < terrainRows/numberQuadrantRows && player.get.x < terrainRows){
			movePlayerForwardOrBackward(false);
			colliding = true;
		}
		else if(player.get.z > terrainRows-numberQuadrantRows && player.get.x < terrainRows){
			movePlayerForwardOrBackward(false);
			colliding = true;
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


