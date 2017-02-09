/*
Causes the bumpy effect when moving over terrain.

Uses the players current X and Z position to find what terrain vertex they're nearest to.
The players height then gets assigned to the nearest terrain vertex.
*/
function getCurrentHeight(){
	
	/*
	Use playerX and Z to find value its height in 1d heightMap array
	
	player X += 1 value into the 1d array
	player Z += 64 values into the 1d array
	
	playerX,Y,Z can be negative, so turn positive first
	
	If it isn't negative, keep it the same and assign it
	*/
	var tempPlayerX = 0;
	var tempPlayerZ = 0;
	if(playerX < 0){
		tempPlayerX = playerX * -1;
	}else{
		tempPlayerX = playerX;
	}
	if(playerZ < 0){
		tempPlayerZ = playerZ * -1;
	}else{
		tempPlayerZ = playerZ;
	}
		
	//console.log("temp x: " + tempPlayerX);
	//console.log("temp z: " + tempPlayerZ);
	
	//Get player position and calculate what the index should be
	/*
	Coordinates MUST get divided because heightMap size doesnt change
	and is always 64x64, so when z = 65, fails etc
	
	Coordinates get floored so they dont screw up the array indexing, must be a integer.
	*/
	if(tempPlayerX / terrainScale < 0.5){
		tempPlayerX = Math.floor(tempPlayerX / terrainScale);
	}else{
		tempPlayerX = Math.ceil(tempPlayerX / terrainScale);
	}
	
	if(tempPlayerZ / terrainScale < 0.5){
		tempPlayerZ = Math.floor(tempPlayerZ / terrainScale);
	}else{
		tempPlayerZ = Math.ceil(tempPlayerZ / terrainScale);
	}
	
	//console.log("rounded x: " + tempPlayerX);
	//console.log("rounded z: " + tempPlayerZ);
	
	//1 Z increment means skip 64 values into the height map, because its 1d
	//1 X increment means just move along 1 into height map
	var index = (tempPlayerX ) + (tempPlayerZ * 64);
	//console.log("index: " + index);
	
	var previousHeight; //should probably initlaize this at top for first check
	
	var nearestHeight = heightMap[index];
	//console.log("Heightmap length: " + heightMap.length);
	//console.log("Nearest height: " + heightMap[index]);
	//console.log(playerHeight);
	
	/*
	Depending on the height of the vertex found, decrease the number more perhaps
	*/
	
	/*
	if(nearestHeight < -0.5){
		//do nothing
	}
	else if(nearestHeight > 1){
		playerY = nearestHeight - 3; //er, duno really
	}
	*/
	if(nearestHeight < 0 || nearestHeight > 1){
	
	}
	else{

		/*
		See which perlin scale they're in, increase height based on it
		*/
		var heightIncrement = 0.01;
		//Going up or down from last time?

		
		//Have a proper rectangle quadrant check here, rather than just Z
		if(playerZ > 0 && playerZ < 32){
			/*
			Increment height slowly, stop when target reached
			
			Old code:
			For > -32 if
				terrainY = nearestHeight - 1
			Other loop
				terrainY = nearestHeight - 2
			*/
			//playerY = nearestHeight + 0.5;
			//console.log("NH " + nearestHeight);
			//terrainY += heightIncrement;
			
			
			if(playerY > nearestHeight   + 0.5 ){
			//	console.log("max height reached");
			}
			else{
				playerY += heightIncrement;
				//console.log("changing player height");
			}
			
			if(playerY < nearestHeight   + 0.5){
			//	console.log("max height reached");
			}
			else{
				playerY -= heightIncrement;
				//console.log("changing player height");
			}
			
			
			
	
		}
		else{
			//Previous problem if heightMap returns value greater than 1
			
			//Increment height slowly, stop when target reached
			
						
			if(playerY > nearestHeight  -1){
			//	console.log("max height reached");
			}
			else{
				playerY += heightIncrement;
			//	console.log("changing player height");
			}
			
			if(playerY < nearestHeight  -1 ){
			//	console.log("max height reached");
			}
			else{
				playerY -= heightIncrement;
			//	console.log("changing player height");
			}
			
		}
		
		previousHeight = nearestHeight;
	}
	

	
	
	/*
	Fails with floats 
	
	Fails because need to divide by 100, as terrain scaled to 100?
	Or try with terrain scaled to 1
	*/
	
}