
/**
 * This file currently isn't being used as I didn't have time.
 * 
 * The particle system uses instance rendering, so there is one square only,
 * and then matrices are generated to move the particle instance to new positions.
 * 
 * Currently no function exists to update the particles, they're just remade every loop
 *
 * @class ParticleSystem
*/
function ParticleSystem(){
	
	var particle_vertices = [];
	var particle_uvs = [];
	var particle_normals = [];
	
	var particle_positions_buffer;
	var particle_uvs_buffer;
	var particle_normals_buffer;
	
	var particleCount = 100;
	
	/*
	The matrix that is going to be updated and stored.
	*/
	var testTransform = m4.translation(0, 0, 0);
	
	createParticles();
	
	var squareVertexPositionBuffer2;
	var	squareUVBuffer2;

	x = 1;
	y = 1;
	z = 1;
	this.velocity = Math.random() * 5;
	
	// 2D square, then texture coordinate are easy!
	// Remember to bind these buffers in render method
	particle_vertices.push(x, y, z);
	particle_uvs.push(0, 1);
	particle_normals.push(0, 1, 0);
	
	squareVertexPositionBuffer2 = gl.createBuffer();;
	gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer2);
	var vertices2 = [
		1.0,  1.0,  0.0,
		-1.0,  1.0,  0.0,
		 1.0, -1.0,  0.0,
		-1.0, -1.0,  0.0
	];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices2), gl.STATIC_DRAW);
	gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, false, 0, 0);
	squareUVBuffer2 = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, squareUVBuffer2);
	var	uvs2 = [
		0,0,
		0,1,
		1,0,
		1,1
	];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs2), gl.STATIC_DRAW);
	gl.vertexAttribPointer(textureCoordLocation, 2, gl.FLOAT, false, 0, 0);
	
	var particle_normals = [
		1.0, 1.0, 1.0,
		1.0, 1.0, 1.0,
		1.0, 1.0, 1.0,
		1.0, 1.0, 1.0
	];
	
	particle_normals_buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, particle_normals_buffer);	
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(particle_normals), gl.DYNAMIC_DRAW);		
	gl.vertexAttribPointer(normalAttribLocation, 3, gl.FLOAT, false, 0, 0);	
	
	/**
	Builds the matrices to apply to the particle instances,
	Allowing them to be at different world positions.
	
	Uses same idea as rock generation, need to build mat4 by using 4 vec4s.
	
	@method createParticles 
	*/
	function createParticles(){
		
		buffers = twgl.createBuffersFromArrays(gl, {
			position: [],
			indices: [],
			fullTransformsRow0: [],
			fullTransformsRow1: [],
			fullTransformsRow2: [],
			fullTransformsRow3: []
		});
		
		/*
		These loops create different translations for the rock instance.
		Wouldn't want to render 10,000 rocks in the same place, 
		Need to apply different matrices per rock instance
		
		Cant pass in a mat4 attribute into shader, 
		Instead need to pass in 4 vec4's (16 floats, 4x4 matrix)
		Then build the matrix in the shader from those 16 passed in floats
		
		yRotation rotates around the UP vector, so rotate rocks by yRotation matrix
		*/
		var data = [];
		
		// Need to find and set the height of the rock, at the generated X,Z position
		// So need to save all generated X and Z positions


		// Bind buffer, create all data, then buffer data
		// Then do the next row
		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.fullTransformsRow0);
		for(var i=0; i<particleCount; i++){	

			// Need to add positionX here, or use particle vertices[u], if not, remove them
			positionX = Math.floor(Math.random() * 16);

			data.push(
				testTransform[0], //Scale X first	
				testTransform[4], 
				testTransform[8], 
				positionX //testTransform[12] //positionX // x translation
			); 
		}
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.DYNAMIC_DRAW);
		gl.vertexAttribPointer(instancingLocation0, 4, gl.FLOAT, false, 0, 0);
		
		/*
		Z
		*/
		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.fullTransformsRow2);
		data = [];
		for(var i=0; i<particleCount; i++){

			positionZ = Math.floor(Math.random() * 16);

			data.push(
				testTransform[2], 
				testTransform[6], 
				testTransform[10], // Scale Z first
				positionZ// testTransform[14]//positionZ   // z translation
			); 
		}
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.DYNAMIC_DRAW);
		gl.vertexAttribPointer(instancingLocation2, 4, gl.FLOAT, false, 0, 0);
		
		/*
		Y
		*/
		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.fullTransformsRow1);
		data = [];
		for(var i=0; i<particleCount; i++){
			var particleHeight = Math.random() * 25;

			data.push(
				testTransform[1], 
				testTransform[5], // Scale Y first
				testTransform[9], 
				particleHeight //testTransform[13]//particleHeight  // y translation
			); 
		}
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.DYNAMIC_DRAW);	
		gl.vertexAttribPointer(instancingLocation1, 4, gl.FLOAT, false, 0, 0);
		
		
		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.fullTransformsRow3);
		data = [];
		for(var i=0; i<particleCount; i++){
			data.push(
				testTransform[3], 
				testTransform[7], 
				testTransform[11], 
				testTransform[15]
			);
		}
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.DYNAMIC_DRAW);
		gl.vertexAttribPointer(instancingLocation3, 4, gl.FLOAT, false, 0, 0);
		
	}
	
	
	/**
	Currently just creates new particles every time, rather than updating them like it should
	
	@method render
	*/
	this.render = function(){
	
		createParticles();

		currentTexture = myParticleTexture;
		gl.activeTexture(gl.TEXTURE0);
		gl.uniform1i(gl.getUniformLocation(program, "uSampler"), 0);
		gl.bindTexture(gl.TEXTURE_2D, currentTexture.getTextureAttribute.texture);
		
		scale = m4.scaling(3, 3, 3);
		rotateX = m4.xRotation(0);
		rotateY = m4.yRotation(0);
		rotateZ = m4.zRotation(0);
		
		position = m4.translation(250, 5, 250);
		
		// Times matrices together
		updateAttributesAndUniforms();
			
		useInstancing = true;
		gl.uniform1i(useInstancingLocation, useInstancing);
		
		gl.enableVertexAttribArray(instancingLocation0);
		gl.enableVertexAttribArray(instancingLocation1);
		gl.enableVertexAttribArray(instancingLocation2);
		gl.enableVertexAttribArray(instancingLocation3);

		gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer2);
		gl.vertexAttribPointer(positionAttribLocation,3, gl.FLOAT, false, 0, 0);
	 
		gl.bindBuffer(gl.ARRAY_BUFFER, squareUVBuffer2);
		gl.vertexAttribPointer(textureCoordLocation, 2, gl.FLOAT, false, 0, 0);		

		gl.bindBuffer(gl.ARRAY_BUFFER, particle_normals_buffer);
		gl.enableVertexAttribArray(normalAttribLocation);
		gl.vertexAttribPointer(normalAttribLocation, 3, gl.FLOAT, false, 0, 0);
		  
		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.fullTransformsRow0);
		gl.enableVertexAttribArray(instancingLocation0);
		gl.vertexAttribPointer(instancingLocation0, 4, gl.FLOAT, false, 0, 0);
		  
		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.fullTransformsRow1);
		gl.enableVertexAttribArray(instancingLocation1);
		gl.vertexAttribPointer(instancingLocation1, 4, gl.FLOAT, false, 0, 0);
			
		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.fullTransformsRow2);
		gl.enableVertexAttribArray(instancingLocation2);
		gl.vertexAttribPointer(instancingLocation2, 4, gl.FLOAT, false, 0, 0);
			 
		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.fullTransformsRow3);
		gl.enableVertexAttribArray(instancingLocation3);
		gl.vertexAttribPointer(instancingLocation3, 4, gl.FLOAT, false, 0, 0);

		extension.vertexAttribDivisorANGLE(positionAttribLocation, 0);
		extension.vertexAttribDivisorANGLE(textureCoordLocation, 0); 
		extension.vertexAttribDivisorANGLE(normalAttribLocation, 0);
		extension.vertexAttribDivisorANGLE(instancingLocation0, 1);
		extension.vertexAttribDivisorANGLE(instancingLocation1, 1);
		extension.vertexAttribDivisorANGLE(instancingLocation2, 1);
		extension.vertexAttribDivisorANGLE(instancingLocation3, 1);

		extension.drawArraysInstancedANGLE(gl.TRIANGLE_STRIP, 0, 4, particleCount);

		useInstancing = false;
		gl.uniform1i(useInstancingLocation, useInstancing);
		
		gl.disableVertexAttribArray(instancingLocation0);
		gl.disableVertexAttribArray(instancingLocation1);
		gl.disableVertexAttribArray(instancingLocation2);
		gl.disableVertexAttribArray(instancingLocation3);
		
	}

}

