
function CollisionTester(){
	
	/*
	Moves the player when traversing over terrain.

	Uses the players current X and Z position to find what terrain vertex they're nearest to.
	The players height then gets assigned to the nearest terrain vertex.
	*/
	this.setPlayerHeight = function(){
		/*
		Use playerX and Z to find value its height in heightMap array
		
		playerX,Y,Z can be negative, so turn positive first
		
		If it isn't negative, keep it the same and assign it
		*/
		var tempPlayerX = 0;
		var tempPlayerZ = 0;
		if(player.x < 0){
			tempPlayerX = player.x * -1;
		}else{
			tempPlayerX = player.x;
		}
		if(player.z < 0){
			tempPlayerZ = player.z * -1;
		}else{
			tempPlayerZ = player.z;
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
			terrain.heightMapValueAtIndex.setTemporaryHeightMapX = tempPlayerX;
			terrain.heightMapValueAtIndex.setTemporaryHeightMapZ = tempPlayerZ;
			
			nearestHeight = terrain.heightMapValueAtIndex.getTemporaryHeightMapValue;
		}else{
			nearestHeight = 0;
		}

		//Assign the nearest terrain height to the player height
		player.y = nearestHeight + 1;
	}
	
	
	
	/*
	If they're in prospecting range, allow them to prospect
	If they're too close to the rock, move them back
	
	Have to have 2 different ranges here, otherwise as soon as they're colliding,
	and they try to prospect,
	They get moved back, out of prospect range
	
	Loop through all rock collision boxes, stop playing moving through rocks

	Eventually just check collision of the rocks in the quadrant that the player is in
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
		var rocks = rockGenerator.getRocksArray.getRocks;
		for(var i=0; i<rocks.length; i++){
			
			/*
			Check if user is in prospecting range
			*/
			if(	
				player.x > rocks[i].x - (rocks[i].scale*35) &&
				player.x < rocks[i].x + (rocks[i].scale*35) &&
				
				player.z > rocks[i].z - (rocks[i].scale*35)  && 
				player.z <	rocks[i].z + (rocks[i].scale*35) 
			
			){
				//They're in range, update GUI with current rock
				player.set.inProspectingRange = true; 
				isProspecting(rocks[i]);

				/*
				Regular sphere rock collision testing
				Check if they're too close, move them back
				*/
				if(	player.x > rocks[i].x - (rocks[i].scale*25) &&
					player.x < rocks[i].x + (rocks[i].scale*25) &&
					
					player.z > rocks[i].z - (rocks[i].scale*25)  && 
					player.z <	rocks[i].z + (rocks[i].scale*25) 
				){
					player.moveForwardOrBackward();
				}
				
			}
		}	
		
		var triRocks = rockGenerator.getTriRocksArray.getRocks;
		for(var i=0; i<triRocks.length; i++){
			//If in prospect range
			if(	player.x > triRocks[i].x  - (triRocks[i].width*3) &&
				player.x < triRocks[i].x + (triRocks[i].width*3) &&
				
				player.z > triRocks[i].z - (triRocks[i].width*3) && 
				player.z < triRocks[i].z + (triRocks[i].width*3) 
			){	
				isProspecting(triRocks[i]);
				/*
				Triangle rocks collision testing
				*/
				if(	player.x > triRocks[i].x  - (triRocks[i].width*2) &&
					player.x < triRocks[i].x + (triRocks[i].width*2) &&
					
					player.z > triRocks[i].z - (triRocks[i].width*2) && 
					player.z < triRocks[i].z + (triRocks[i].width*2) 
				){	
					player.moveForwardOrBackward();
				}
			}
		}
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
		}
		else{
			if(player.get.prospecting === true){
				rock.texture = depletedTexture;
				player.add.xp = 1;
				//Display progress bar, when hits 100%, change rocks texture
				//So pass in current rock to this function, 
			}
		}
	}	

}


