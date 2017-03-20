 

function Lander(){
	
	var landerMesh;
	
	var x = 325;
	var z = 325;
		terrain.heightMapValueAtIndex.setTemporaryHeightMapX = z;
		terrain.heightMapValueAtIndex.setTemporaryHeightMapZ = x;
	var y = terrain.heightMapValueAtIndex.getTemporaryHeightMapValue - 0.5;

	var landerModelText = utility.httpGet("resources/shop/satellite.txt");

	setupLanderData();
	
	function setupLanderData(){
		landerMesh = new OBJ.Mesh(landerModelText);
		OBJ.initMeshBuffers(gl, landerMesh);
	}
	
	this.render = function(){
	
		lightColour = [1, 1, 1];
		currentTexture = shopTexture;
		
		scale = m4.scaling(2, 2, 2);
		rotateX = m4.xRotation(0);
		rotateY = m4.yRotation(0);
		rotateZ = m4.zRotation(-Math.PI / 2);
		
		position = m4.translation(x, y, z);
		
		//Times matrices together
		updateAttributesAndUniforms();
		
		gl.bindBuffer(gl.ARRAY_BUFFER, landerMesh.vertexBuffer);
		gl.vertexAttribPointer(positionAttribLocation, landerMesh.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

		gl.enableVertexAttribArray(textureCoordLocation);
		gl.bindBuffer(gl.ARRAY_BUFFER, landerMesh.textureBuffer);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, currentTexture.getTextureAttribute.texture);
		gl.uniform1i(gl.getUniformLocation(program, "uSampler"), 0);
		gl.vertexAttribPointer(textureCoordLocation, landerMesh.textureBuffer.itemSize, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, landerMesh.normalBuffer);
		gl.vertexAttribPointer(normalAttribLocation, landerMesh.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, landerMesh.indexBuffer);
		gl.drawElements(gl.TRIANGLES, landerMesh.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
	}
	
	/*
	Show shop GUI when in range, later on when press a key open it
	*/
	this.depositPlayerOre = function(){
	
		// Calculate distance from player to shop, if in range, display shop
		var distance = Math.sqrt( 
			Math.pow( (x - player.get.x), 2) +
			Math.pow( (y - player.get.y), 2) +
			Math.pow( (z - player.get.z), 2) 
		);
		
		if(distance < 10){
			// If player has any rock in inventory, deposit it
			
			var emptyInventory = true;
			
			var playerInv = player.get.inventory;
	
			for(var i=0; i<player.get.inventorySize; i++){
				if(playerInv[i] === -1){
				}
				else{
					emptyInventory = false;
				}
			}
			
			// Then they are carrying a rock, deposit it
			if(emptyInventory === false){
				document.getElementById("depositOreID").style.visibility = "visible";	
				$( "#depositOreID" ).progressbar();
				player.set.inventory = [-1, -1, -1, -1, -1, -1, -1, -1];
				// Update inventory GUI to remove rock images
				gui.renderInventory();
			}
			else{
				// Inventory is empty, can't deposit anything
			}

		}
		else{
			document.getElementById("depositOreID").style.visibility = "hidden";	
		}
		
	}
	
	
	
}