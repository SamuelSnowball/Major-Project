

function WaterSystem(){

	var waterVertexPositionBuffer;
	var waterVertices = [];
	var waterUVsBuffer;
	var waterUVs = [];
	
	setup();
	
	function setup(){
		waterVertexPositionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, waterVertexPositionBuffer);
		waterVertices = [
			 1.0,  1.0,  0.0,
			-1.0,  1.0,  0.0,
			 1.0, -1.0,  0.0,
			-1.0, -1.0,  0.0
		];
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(waterVertices), gl.STATIC_DRAW);
		gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, false, 0, 0);
			
		waterUVsBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, waterUVsBuffer);
		waterUVs = [
			0,0,
			0,1,
			1,0,
			1,1
		];
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(waterUVs), gl.STATIC_DRAW);
		gl.vertexAttribPointer(textureCoordLocation, 2, gl.FLOAT, false, 0, 0);
	}
	
	
	this.render = function(){
		gl.enableVertexAttribArray(positionAttribLocation);
		gl.enableVertexAttribArray(textureCoordLocation);
		
		scale = m4.scaling(35, 35, 35);
		rotateX = m4.xRotation(Math.PI / 2);
		rotateY = m4.yRotation(0);
		rotateZ = m4.zRotation(0);
		position = m4.translation(250, 0, 250);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, playerTexture.getTextureAttribute.texture);
		gl.uniform1i(gl.getUniformLocation(program, "uSampler"), 0);
		
		updateAttributesAndUniforms();
		
		gl.bindBuffer(gl.ARRAY_BUFFER, waterVertexPositionBuffer);
		gl.vertexAttribPointer(positionAttribLocation,3, gl.FLOAT, false, 0, 0);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, waterUVsBuffer);
		gl.vertexAttribPointer(textureCoordLocation, 2, gl.FLOAT, false, 0, 0);
		
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		
		gl.disableVertexAttribArray(positionAttribLocation);
		gl.disableVertexAttribArray(textureCoordLocation);			
	}
	
	
}