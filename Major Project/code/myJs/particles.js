

var particle_vertices = [];
var particle_uvs = [];

var particle_positions_buffer;
var particle_uvs_buffer;

var particleCount = 100;
function buildParticles(){
	/*
	Generate points at random position within like -100 -> 100?
	*/
	for(var i=0; i<particleCount; i++){
		particle_vertices.push(Math.random() * 5);
		particle_vertices.push(Math.random() * 5);
		particle_vertices.push(Math.random() * 5);
		
		//For every particle create a uv as well
		particle_uvs.push(0.0);
		particle_uvs.push(1.0);
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
	
	
	
	
	
	//gldrawPoints?
}

/*
Particles get bigger if u move away
-or they get smaller, and look bigger because they're grouped?

Shouldn't matter, as particles will be temporary
*/
function drawParticles(){
	for(var i=0; i<particle_vertices.length; i+=3){
	
		scale = m4.scaling(10, 10, 10);
		xRotation = m4.xRotation(0);
		yRotation = m4.yRotation(0);
		zRotation = m4.zRotation(0);
		
		particle_vertices[i] += 0.05;
		particle_vertices[i+1] += 0.04;
		particle_vertices[i+2] += 0.03;
		//console.log(particle_vertices[i]);
		position = m4.translation(particle_vertices[i], particle_vertices[i+1], particle_vertices[i+2]); //change
		
		//Times matrices together
		updateAttributesAndUniforms();

		//Vertices
		gl.bindBuffer(gl.ARRAY_BUFFER, particle_positions_buffer);
		gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, false, 0, 0);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, particle_uvs_buffer);
		gl.vertexAttribPointer(textureCoordLocation, 2, gl.FLOAT, false, 0, 0);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, marsTerrainTexture);
		gl.uniform1i(gl.getUniformLocation(program, "uSampler"), 0);
		
		//Elements
		//gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cube_elements_buffer);
		

		gl.drawArrays(
			gl.POINTS, 
			i/3, //first
			1//1 point per loop, count
		); 
		
	}
}