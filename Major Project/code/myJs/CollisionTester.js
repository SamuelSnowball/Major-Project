
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
	DEFINE
	*/
	    triangleVertexPositionBuffer = gl.createBuffer();
 gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
	/*
	END DEIFNE
	*/
	    var vertices = [
         0.0,  1.0,  0.0,
        -1.0, -1.0,  0.0,
         1.0, -1.0,  0.0
    ];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	   triangleVertexPositionBuffer.itemSize = 3;
    triangleVertexPositionBuffer.numItems = 3;
	
	terrainTextureCoordinateBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, terrainTextureCoordinateBuffer);
		var textureCoordinates = [];
		textureCoordinates.push(0.0, 1.0);
	textureCoordinates.push(0.0, 1.0);
	textureCoordinates.push(0.0, 1.0);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);
	/*
	Loop through all collision boxes, stop playing moving through rocks

	Eventually just check collision of the rocks in the quadrant that the player is in
	*/
	this.testPlayerRockCollision = function(){

		//Retrieve rocks array from the rockGenerator class
		var rocks = rockGenerator.getRocksArray.getRocks;
		for(var i=0; i<rocks.length; i++){
		
			/*
			Draw 2d square at rocks[i].x etc
			*/
					scale = m4.scaling(5, 5, 5);
		xRotation = m4.xRotation(0);
		yRotation = m4.yRotation(0);
		zRotation = m4.zRotation(0);
		
		var hitboxFactor;
		if(rocks[i].scale <= 0.2){
			hitboxFactor = 45;
		}else{
			hitboxFactor = 30;
		}
		/*
		Between:
		rocks[i].x - (rocks[i].scale*hitboxFactor)
		rocks[i].x + (rocks[i].scale*hitboxFactor)
		
		rocks[i].z - (rocks[i].scale*25)
		rocks[i].z + (rocks[i].scale*25)
		*/
		position = m4.translation(rocks[i].x + (rocks[i].scale*hitboxFactor) , 0, rocks[i].z);
		
		//Times matrices together
		updateAttributesAndUniforms();
			
			 gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
    gl.vertexAttribPointer(positionAttribLocation, triangleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, terrainTextureCoordinateBuffer);
		gl.vertexAttribPointer(textureCoordLocation, 2, gl.FLOAT, false, 0, 0);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, marsTerrainTexture);
		gl.uniform1i(gl.getUniformLocation(program, "uSampler"), 0);
		

gl.drawArrays(gl.TRIANGLES, 0,  triangleVertexPositionBuffer.numItems);
			
			
			
			
			/*
			
			End code
			*/
			
			if(	
				player.x > rocks[i].x - (rocks[i].scale*25) &&
				player.x < rocks[i].x + (rocks[i].scale*25) &&
				
				player.z > rocks[i].z - (rocks[i].scale*25)  && 
				player.z <	rocks[i].z + (rocks[i].scale*25) 
			
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


