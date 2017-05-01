
/*
	Old terrain rendering code:

		// Vertices
		gl.bindBuffer(gl.ARRAY_BUFFER, terrainVertexBuffer);
		gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, false, 0, 0);

		// Uvs
		gl.bindBuffer(gl.ARRAY_BUFFER, terrainTextureCoordinateBuffer);
		gl.vertexAttribPointer(textureCoordLocation, 2, gl.FLOAT, false, 0, 0);
		
		// Set active texture
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, currentTexture.getTextureAttribute.texture); //myPerlinTexture
		gl.uniform1i(gl.getUniformLocation(program, "uSampler"), 0);

		// Normals
		gl.bindBuffer(gl.ARRAY_BUFFER, terrainNormalBuffer);
		gl.vertexAttribPointer(normalAttribLocation, 3, gl.FLOAT, false, 0, 0);
		
		// Indices/Elements
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementsBuffer);
		
		drawCall();
		
*/