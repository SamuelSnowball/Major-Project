
function CollisionTester(){
	
	var playerHeightIncrement = 0.01;
	
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
			}
			else{
				// They're in range prospecting, update GUI with current rock
				player.set.inProspectingRange = true; 
				isProspecting(objRocks[i]);

				/*
				Check if they're too close, move them back
				*/
				if(distance < objRocks[i].scale * 3 ){
					player.moveForwardOrBackward();
				}
				
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
					
	this.testPlayerMapBoundaries = function(){
		
		/*
		Stop them going out of section 1, if < 5 xp.
		*/
		if(player.get.x <= 384 || player.get.x >= 640 || player.get.z <= 384 || player.get.z >= 640){
			if(player.get.xp < 5){
				player.moveForwardOrBackward();
			}
		}
		
		/*
		Level boundaries based on player level
		*/
	}
	
	/*
	If the user is colliding with a rock, and they're holding down P,
	Then they're prospecting the rock
	*/
	function isProspecting(rock){
		/*
		Check if rock is already depleted, if so, they cant prospect it again!
		*/
		if(rock.texture === depletedTexture){
			//Already depleted!
			document.getElementById("prospectingBarID").style.visibility = "hidden";	
		}
		else{
			if(player.get.prospecting === true){
				prospectingBarValue += 0.5;
				document.getElementById("prospectingBarID").style.visibility = "visible";	
				$( "#prospectingBarID" ).progressbar({
					value: prospectingBarValue,
				})
				
				// Check if prospect bar is 100%
				if(prospectingBarValue >= 100){
				
					// Check if theres a free space in player inventory
					if(player.get.inventory.includes(-1)){
						rock.texture = depletedTexture;
						player.add.xp = 1;
						player.addToInventory(rock);
					}
					else{
						// Display message saying inventory is full!
					}
					
					// Reset the value
					prospectingBarValue = 0;
				}
				
			}
			else{
				// Reset the value
				prospectingBarValue = 0;
				console.log("isnt prospecting");
				document.getElementById("prospectingBarID").style.visibility = "hidden";	
			}
		}
	}	

}


