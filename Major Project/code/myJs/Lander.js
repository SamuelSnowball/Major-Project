 /*
This is the file for the rover lander

Uses the obj loader library: webgl-obj-loader from frenchtoast747 on GitHub
	https://github.com/frenchtoast747/webgl-obj-loader
*/
function Lander(){
	
	var landerMesh;
	
	// Position of the lander
	var x = 325;
	var z = 325;
		terrain.heightMapValueAtIndex.setTemporaryHeightMapX = z;
		terrain.heightMapValueAtIndex.setTemporaryHeightMapZ = x;
	var y = terrain.heightMapValueAtIndex.getTemporaryHeightMapValue - 0.5;
	
	// Obj model of lander
	var landerModelText = utility.httpGet("resources/lander/satellite.txt");

	// Constructor
	setupLanderData();
	
	function setupLanderData(){
		landerMesh = new OBJ.Mesh(landerModelText);
		OBJ.initMeshBuffers(gl, landerMesh);
	}
	
	/*
	Renders the lander 
	*/
	this.render = function(){
	
		lightColour = [1, 1, 1];
		currentTexture = landerTexture;
		
		scale = m4.scaling(2, 2, 2);
		rotateX = m4.xRotation(0);
		rotateY = m4.yRotation(0);
		rotateZ = m4.zRotation(-Math.PI / 2);
		
		position = m4.translation(x, y, z);
		
		// Times matrices together
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

}