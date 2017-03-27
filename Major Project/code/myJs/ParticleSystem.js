
function ParticleSystem(){
	
	var particle_vertices = [];
	var particle_uvs = [];
	var particle_normals = [];
	
	var particle_positions_buffer;
	var particle_uvs_buffer;
	var particle_normals_buffer;
	
	var particleCount = 1000;
	
	/*
	The matrix that is going to be updated and stored.
	*/
	var testTransform = m4.translation(310,0,310);
	var testYRotation = m4.yRotation(Math.random());
	m4.multiply(testYRotation, testTransform, testTransform); // a, b, destination
	
	
	createParticles();
	
	function Particle(){
		this.x = utility.randomIntBetween(0, 10);
		this.y = utility.randomIntBetween(0, 20);
		this.z = utility.randomIntBetween(0, 10);
		this.velocity = Math.random() * 5;
		
		particle_vertices.push(this.x, this.y, this.z);
		particle_uvs.push(0, 1);
		particle_normals.push(0, 1, 0);
	}

	function createParticles(){
			/*
		Generate points at random position within like -100 -> 100?
		*/
		for(var i=0; i<particleCount; i++){
			var p = new Particle();
		}

		particle_positions_buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, particle_positions_buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(particle_vertices), gl.DYNAMIC_DRAW);
		positionAttribLocation = gl.getAttribLocation(program, 'position');
		gl.enableVertexAttribArray(positionAttribLocation);
		gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, false, 0, 0);	
		
		particle_uvs_buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, particle_uvs_buffer);	
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(particle_uvs), gl.DYNAMIC_DRAW);
		gl.vertexAttribPointer(textureCoordLocation, 2, gl.FLOAT, false, 0, 0);	
		
		particle_normals_buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, particle_normals_buffer);	
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(particle_normals), gl.DYNAMIC_DRAW);		
		gl.vertexAttribPointer(normalAttribLocation, 3, gl.FLOAT, false, 0, 0);	
		
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
			var testYRotation = m4.yRotation(Math.random(Math.PI * 2) + 0); // 0 -> Math.PI/2 (360 degrees)
			m4.multiply(testYRotation, testTransform, testTransform); // a, b, destination
			
			var scaleX = (Math.random() * 50) + 5;
			
			//positionX = Math.floor(Math.random() * 128);

			data.push(
				scaleX * testTransform[0], //Scale X first	
				testTransform[4], 
				testTransform[8], 
				testTransform[12] //positionX // x translation
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

			var testYRotation = m4.yRotation(Math.random(Math.PI * 2) + 0); // 0 -> Math.PI/2 (360 degrees)
			m4.multiply(testYRotation, testTransform, testTransform); // a, b, destination
			
			var scaleZ = (Math.random() * 50) + 5;
			
			positionZ = Math.floor(Math.random() * 128);

			data.push(
				testTransform[2], 
				testTransform[6], 
				scaleZ * testTransform[10], // Scale Z first
				testTransform[14]//positionZ   // z translation
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
			var testYRotation = m4.yRotation(Math.random(Math.PI * 2) + 0); // 0 -> Math.PI/2 (360 degrees)
			m4.multiply(testYRotation, testTransform, testTransform); // a, b, destination
			
			var scaleY = (Math.random() * 25) + 5;
			
			var particleHeight = Math.random() * 25;

			data.push(
				testTransform[1], 
				scaleY * testTransform[5], // Scale Y first
				testTransform[9], 
				testTransform[13]//particleHeight  // y translation
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
	
	
	/*
	Particles get bigger if u move away
	-or they get smaller, and look bigger because they're grouped?

	Shouldn't matter, as particles will be temporary
	*/
	this.render = function(){

		currentTexture = myParticleTexture;
		gl.activeTexture(gl.TEXTURE0);
		gl.uniform1i(gl.getUniformLocation(program, "uSampler"), 0);
		gl.bindTexture(gl.TEXTURE_2D, currentTexture.getTextureAttribute.texture);
			
		useInstancing = true;
		gl.uniform1i(useInstancingLocation, useInstancing);
		
		gl.enableVertexAttribArray(instancingLocation0);
		gl.enableVertexAttribArray(instancingLocation1);
		gl.enableVertexAttribArray(instancingLocation2);
		gl.enableVertexAttribArray(instancingLocation3);

		gl.bindBuffer(gl.ARRAY_BUFFER, particle_positions_buffer);
		gl.enableVertexAttribArray(positionAttribLocation);
		gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, false, 0, 0);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, particle_uvs_buffer);
		gl.enableVertexAttribArray(textureCoordLocation);
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

		//gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, meshArray.indexBuffer);
		  
		extension.vertexAttribDivisorANGLE(positionAttribLocation, 0);
		extension.vertexAttribDivisorANGLE(textureCoordLocation, 0); 
		extension.vertexAttribDivisorANGLE(normalAttribLocation, 0);
		extension.vertexAttribDivisorANGLE(instancingLocation0, 1);
		extension.vertexAttribDivisorANGLE(instancingLocation1, 1);
		extension.vertexAttribDivisorANGLE(instancingLocation2, 1);
		extension.vertexAttribDivisorANGLE(instancingLocation3, 1);

		extension.drawArraysInstancedANGLE(gl.POINTS, 0, 1, particleCount);
				
		useInstancing = false;
		gl.uniform1i(useInstancingLocation, useInstancing);
		
		gl.disableVertexAttribArray(instancingLocation0);
		gl.disableVertexAttribArray(instancingLocation1);
		gl.disableVertexAttribArray(instancingLocation2);
		gl.disableVertexAttribArray(instancingLocation3);
		
	}

}

