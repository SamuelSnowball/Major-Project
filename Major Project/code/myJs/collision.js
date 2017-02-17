/*
Causes the bumpy effect when moving over terrain.

Uses the players current X and Z position to find what terrain vertex they're nearest to.
The players height then gets assigned to the nearest terrain vertex.
*/
function setPlayerHeight(){
	
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
	Coordinates get floored so they dont screw up the array indexing, must be a integer.
	*/
	if(tempPlayerX / terrain.scale < 0.5){
		tempPlayerX = Math.floor(tempPlayerX / terrain.scale);
	}else{
		tempPlayerX = Math.ceil(tempPlayerX / terrain.scale);
	}
	
	if(tempPlayerZ / terrain.scale < 0.5){
		tempPlayerZ = Math.floor(tempPlayerZ / terrain.scale);
	}else{
		tempPlayerZ = Math.ceil(tempPlayerZ / terrain.scale);
	}
	
	//console.log("rounded x: " + tempPlayerX);
	//console.log("rounded z: " + tempPlayerZ);

	var nearestHeight = heightMap[tempPlayerX][tempPlayerZ];
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
		
		var shouldBePlayerHeight;
		if(nearestHeight > 0.4){
			shouldBePlayerHeight = -nearestHeight + 3;
			//console.log("Decent hill");
		}
		if(nearestHeight > 1.4){
			shouldBePlayerHeight = -nearestHeight + 3.5;
			//console.log("Decent hill");
		}
		if(nearestHeight > 1.8){
			shouldBePlayerHeight = -nearestHeight + 4;
			//console.log("Decent hill");
		}
		
		/*
		Slowly increment height to the nearest terrain vertex,
		Stop when that height is reached
		*/
		if(player.y > shouldBePlayerHeight){
		
		}
		else{
			player.y += heightIncrement;
		}
	}
	else{
		//In different section
	}
	
}

/*
Loop through all collision boxes, stop playing moving through rocks

Eventually just check collision of the rocks in the quadrant that the player is in
*/
function testPlayerRockCollision(){
	/*
	Rock hit boxes also contain the scale of the rock
	
	rockHitboxes[i] = x
	rockHitboxes[i] = z
	rockHitboxes[i] = x + width
	rockHitboxes[i] = z + width
	rockHitboxes[i+4] = current rocks scale
	*/
	for(var i=0; i<rockHitboxes.length; i+=5){
		if(	
			//Between x and x+width
			(player.x > rockHitboxes[i] - (rockHitboxes[i+4] * 20) ) && 
			(player.x < rockHitboxes[i+2] + (rockHitboxes[i+4] * 20) ) && 
			//AND Between z and z+width
			(player.z > rockHitboxes[i+1] - (rockHitboxes[i+4] * 20) ) && 
			(player.z < rockHitboxes[i+3] + (rockHitboxes[i+4] * 20) )
		){
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




