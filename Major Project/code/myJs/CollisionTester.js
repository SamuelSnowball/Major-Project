
function CollisionTester(){
	
	/*
	Causes the bumpy effect when moving over terrain.

	Uses the players current X and Z position to find what terrain vertex they're nearest to.
	The players height then gets assigned to the nearest terrain vertex.
	*/
	this.setPlayerHeight = function(){
		/*
		Use playerX and Z to find value its height in 1d heightMap array
		
		player X += 1 value into the 1d array
		player Z += 64 values into the 1d array
		
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
		
		//console.log("temp x: " + tempPlayerX);
		//console.log("temp z: " + tempPlayerZ);
		
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
		
		//console.log("rounded x: " + tempPlayerX);
		//console.log("rounded z: " + tempPlayerZ);
		
		
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
		//console.log("Nearest height: " + heightMap[tempPlayerX][tempPlayerZ]);

		/*
		See which quadrant they're in, increase height based on it
		*/
		var heightIncrement = 0.01;

		if(player.z > 0 && player.z < 256 && player.x > 0 && player.x < 256){
			
			//Not great if nearestHeight is like -1 or -0.8, so the below if statement
			if(nearestHeight < -0.5){
				nearestHeight += 0.3;
			}
			
			player.y = nearestHeight + 2;
			
			var correctPlayerHeight;
			if(nearestHeight > 0.4){
				correctPlayerHeight = -nearestHeight + 3;
				//console.log("Decent hill");
			}
			if(nearestHeight > 1.4){
				correctPlayerHeight = -nearestHeight + 3.5;
				//console.log("Decent hill");
			}
			if(nearestHeight > 1.8){
				correctPlayerHeight = -nearestHeight + 4;
				//console.log("Decent hill");
			}
			
			slowlyIncrementPlayerHeight(correctPlayerHeight, heightIncrement);

		}
		else{
			//In different section
		}	
	}
	
	/*
	Slowly increment height to the nearest terrain vertex,
	stop when that height is reached
	*/
	function slowlyIncrementPlayerHeight(correctPlayerHeight, heightIncrement){
		if(player.y > correctPlayerHeight){
		
		}
		else{
			player.y += heightIncrement;
		}
	}
	
	/*
	Loop through all collision boxes, stop playing moving through rocks

	Eventually just check collision of the rocks in the quadrant that the player is in
	*/
	this.testPlayerRockCollision = function(){

		//Retrieve rocks array from the rockGenerator class
		var rocks = rockGenerator.getRocksArray.getRocks;
		for(var i=0; i<rocks.length; i++){
			if(	
				(player.x > rocks[i].x)  &&
				(player.x < rocks[i].x)  + (rocks[i].width) &&
				
				(player.z > rocks[i].z)  && 
				(player.z < rocks[i].z)  + (rocks[i].width) 
			
			){
				console.log("colliding");
				/*
				Check if they're going forwards or backwards
				Push them different ways based on movement direction
				*/
				if(moveForward === true){	
					player.x += (cameraPosition[0] - cameraTarget[0]) * player.movementSpeed;
					player.z += (cameraPosition[2] - cameraTarget[2]) * player.movementSpeed;
				}
				else if(moveBack == true){
					player.x -= (cameraPosition[0] - cameraTarget[0]) * player.movementSpeed;
					player.z -= (cameraPosition[2] - cameraTarget[2]) * player.movementSpeed;
				}
				else{
				
				}
			}
		}	
	}
	
}


