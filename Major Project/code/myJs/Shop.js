 

function Shop(){
	
	var shopMesh;
	
	var x = 415;
	var z = 415;
		terrain.heightMapValueAtIndex.setTemporaryHeightMapX = z;
		terrain.heightMapValueAtIndex.setTemporaryHeightMapZ = x;
	var y = terrain.heightMapValueAtIndex.getTemporaryHeightMapValue - 0.5;

	var shopModelText = utility.httpGet("resources/shop/satellite.txt");

	setupShopData();
	
	function setupShopData(){
		shopMesh = new OBJ.Mesh(shopModelText);
		OBJ.initMeshBuffers(gl, shopMesh);
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
		
		gl.bindBuffer(gl.ARRAY_BUFFER, shopMesh.vertexBuffer);
		gl.vertexAttribPointer(positionAttribLocation, shopMesh.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

		gl.enableVertexAttribArray(textureCoordLocation);
		gl.bindBuffer(gl.ARRAY_BUFFER, shopMesh.textureBuffer);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, currentTexture.getTextureAttribute.texture);
		gl.uniform1i(gl.getUniformLocation(program, "uSampler"), 0);
		gl.vertexAttribPointer(textureCoordLocation, shopMesh.textureBuffer.itemSize, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, shopMesh.normalBuffer);
		gl.vertexAttribPointer(normalAttribLocation, shopMesh.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, shopMesh.indexBuffer);
		gl.drawElements(gl.TRIANGLES, shopMesh.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
	}
	
	/*
	Show shop GUI when in range, later on when press a key open it
	*/
	this.displayShopInterface = function(){
	
		// Calculate distance from player to shop, if in range, display shop
		var distance = Math.sqrt( 
			Math.pow( (x - player.get.x), 2) +
			Math.pow( (y - player.get.y), 2) +
			Math.pow( (z - player.get.z), 2) 
		);
		
		if(distance > 5){
		
		}
		
	}
	
}