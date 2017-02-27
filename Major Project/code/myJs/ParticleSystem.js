
function ParticleSystem(){
	
	var particle_vertices = [];
	var particle_uvs = [];
	var particle_normals = [];
	
	var particle_positions_buffer;
	var particle_uvs_buffer;
	var particle_normals_buffer;
	var particleCount = 100;
	
	createParticles();
	
	function Particle(){
		this.x = Math.random() * 2;
		this.y = Math.random() * 2;
		this.z = Math.random() * 2;
		this.velocity = Math.random() * 5;
		
		this.u = 0.0;
		this.v = 1.0;
		
		particle_vertices.push(this.x, this.y, this.z);
		particle_uvs.push(this.u, this.v);
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
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(particle_vertices), gl.STATIC_DRAW);
		positionAttribLocation = gl.getAttribLocation(program, 'position');
		gl.enableVertexAttribArray(positionAttribLocation);
		gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, false, 0, 0);	
		
		particle_uvs_buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, particle_uvs_buffer);	
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(particle_uvs), gl.STATIC_DRAW);
		
		particle_normals_buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, particle_normals_buffer);	
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(particle_normals), gl.STATIC_DRAW);		
	}
	
	
	/*
	Particles get bigger if u move away
	-or they get smaller, and look bigger because they're grouped?

	Shouldn't matter, as particles will be temporary
	*/
	this.render = function(){
		currentTexture = myParticleTexture;
		for(var i=0; i<particle_vertices.length; i+=4){
		
			scale = m4.scaling(10, 10, 10);
			xRotation = m4.xRotation(0);
			yRotation = m4.yRotation(0);
			zRotation = m4.zRotation(0);

			var particleVelocity = particle_vertices[i+3];
			var maxHeight = 1;	//will go -5 to +5
			particle_vertices[i+1] += 4 * particleVelocity;//y
			if(particle_vertices[i+1] > 300){
				particle_vertices[i+1] = 0;
			}
			
			position = m4.translation(particle_vertices[i],
									particle_vertices[i+1], 
									particle_vertices[i+2]); 
			
			//Times matrices together
			updateAttributesAndUniforms();

			//Vertices
			gl.bindBuffer(gl.ARRAY_BUFFER, particle_positions_buffer);
			gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, false, 0, 0);
			
			gl.bindBuffer(gl.ARRAY_BUFFER, particle_uvs_buffer);
			gl.vertexAttribPointer(textureCoordLocation, 2, gl.FLOAT, false, 0, 0);
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, myParticleTexture.getTextureAttribute.texture);
			gl.uniform1i(gl.getUniformLocation(program, "uSampler"), 0);
			
			gl.enableVertexAttribArray(normalAttribLocation);
			gl.bindBuffer(gl.ARRAY_BUFFER, particle_normals_buffer);
			gl.vertexAttribPointer(normalAttribLocation, 3, gl.FLOAT, false, 0, 0);
			
			gl.drawArrays(
				gl.POINTS, 
				i/4, //first
				1//1 point per loop, count
			); 
		}
	}

}

