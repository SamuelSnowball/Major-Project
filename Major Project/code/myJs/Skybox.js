
function Skybox(){

	var skybox_texture = loadCubeMap();
	
	/*
	#############
	Shaders below
	#############
	*/
	
	var skyboxVertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(skyboxVertexShader, [
		'attribute vec3 skyboxPosition;',
		'varying vec3 skyboxTextureCoords;',

		'uniform mat4 projectionMatrix;',
		'uniform mat4 viewMatrix;',
		
		// Don't want to apply translation to the skybox,
		// Keep it at the max clip space coordinates
		// But want to keep the rotation
		'void main(void){',
			'gl_Position = projectionMatrix * viewMatrix * vec4(skyboxPosition, 1.0); ',
			'skyboxTextureCoords = skyboxPosition;',
		'}'
		
	].join('\n'));
	gl.compileShader(skyboxVertexShader);
	console.log("Skybox vertex shader compliation status: " + gl.getShaderInfoLog(skyboxVertexShader));
	
	var skyboxFragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(skyboxFragmentShader, [
		'precision highp float;',
		
		'varying vec3 skyboxTextureCoords;',

		'uniform samplerCube cubeMap;',

		'vec3 texture(samplerCube sampler, vec3 c){',
			'return textureCube(sampler, c).rgb;',
		'}',
		
		'void main(void){',
			'vec3 sample = texture(cubeMap, skyboxTextureCoords);',
			'gl_FragColor = vec4(sample, 1.0);',
		'}'
		
	].join('\n'));
	gl.compileShader(skyboxFragmentShader);
	console.log("Skybox fragment shader compliation status: " + gl.getShaderInfoLog(skyboxFragmentShader));
	
	var skyboxProgram = gl.createProgram();
	gl.attachShader(skyboxProgram, skyboxVertexShader);
	gl.attachShader(skyboxProgram, skyboxFragmentShader);
	gl.linkProgram(skyboxProgram);
	console.log("skyboxProgram status: " + gl.getProgramInfoLog(skyboxProgram));
	gl.useProgram(skyboxProgram); //allowed to be here? or at bottom
	
	// Taken
	function loadCubeMap() {
		var texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
		
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		
		var faces = [
			["resources/skybox/right.png", gl.TEXTURE_CUBE_MAP_POSITIVE_X],
			["resources/skybox/left.png", gl.TEXTURE_CUBE_MAP_NEGATIVE_X],
			["resources/skybox/top.png", gl.TEXTURE_CUBE_MAP_POSITIVE_Y],
			["resources/skybox/bottom.png", gl.TEXTURE_CUBE_MAP_NEGATIVE_Y],
			["resources/skybox/back.png", gl.TEXTURE_CUBE_MAP_POSITIVE_Z],
			["resources/skybox/front.png", gl.TEXTURE_CUBE_MAP_NEGATIVE_Z]
		];
		
		for (var i = 0; i < faces.length; i++) {
			var face = faces[i][1];
			var image = new Image();
			image.onload = function(texture, face, image) {
				return function() {
					gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
					//gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
					gl.texImage2D(face, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
				}
			} (texture, face, image);
			image.src = faces[i][0];
		}

		return texture;
	}

	/*
	#############
	Shaders above
	#############
	*/

	/*
	Attribute locations in new shaders
	
	Need texture coordinates as well?
	*/
	gl.useProgram(skyboxProgram);
		var skyboxPositionAttribLocation = gl.getAttribLocation(skyboxProgram, 'skyboxPosition');
		var skyboxViewMatrixLocation = gl.getUniformLocation(skyboxProgram, 'viewMatrix');
		gl.uniformMatrix4fv(skyboxViewMatrixLocation, false, new Float32Array(viewMatrix));
		var skyboxProjectionLocation = gl.getUniformLocation(skyboxProgram, 'projectionMatrix');
		gl.uniformMatrix4fv(skyboxProjectionLocation, false, new Float32Array(projectionMatrix));
	gl.useProgram(program);
	
	var SIZE = 256; // same as zFar
	
	var skybox_vertices_buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, skybox_vertices_buffer);
	var skybox_vertices = [        
	    -SIZE,  SIZE, -SIZE,
	    -SIZE, -SIZE, -SIZE,
	    SIZE, -SIZE, -SIZE,
	     SIZE, -SIZE, -SIZE,
	     SIZE,  SIZE, -SIZE,
	    -SIZE,  SIZE, -SIZE,

	    -SIZE, -SIZE,  SIZE,
	    -SIZE, -SIZE, -SIZE,
	    -SIZE,  SIZE, -SIZE,
	    -SIZE,  SIZE, -SIZE,
	    -SIZE,  SIZE,  SIZE,
	    -SIZE, -SIZE,  SIZE,

	     SIZE, -SIZE, -SIZE,
	     SIZE, -SIZE,  SIZE,
	     SIZE,  SIZE,  SIZE,
	     SIZE,  SIZE,  SIZE,
	     SIZE,  SIZE, -SIZE,
	     SIZE, -SIZE, -SIZE,

	    -SIZE, -SIZE,  SIZE,
	    -SIZE,  SIZE,  SIZE,
	     SIZE,  SIZE,  SIZE,
	     SIZE,  SIZE,  SIZE,
	     SIZE, -SIZE,  SIZE,
	    -SIZE, -SIZE,  SIZE,

	    -SIZE,  SIZE, -SIZE,
	     SIZE,  SIZE, -SIZE,
	     SIZE,  SIZE,  SIZE,
	     SIZE,  SIZE,  SIZE,
	    -SIZE,  SIZE,  SIZE,
	    -SIZE,  SIZE, -SIZE,

	    -SIZE, -SIZE, -SIZE,
	    -SIZE, -SIZE,  SIZE,
	     SIZE, -SIZE, -SIZE,
	     SIZE, -SIZE, -SIZE,
	    -SIZE, -SIZE,  SIZE,
	     SIZE, -SIZE,  SIZE
	];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(skybox_vertices), gl.STATIC_DRAW);
	gl.vertexAttribPointer(skyboxPositionAttribLocation, 3, gl.FLOAT, false, 0, 0);
	
	function updateSkyboxAttributesAndUniforms(viewMatrix, projectionMatrix){
		// Remove the translation from the view matrix
		// So the skybox doesn't move in relation to the camera
		viewMatrix[12] = 0;
		viewMatrix[13] = 0;
		viewMatrix[14] = 0;
		
		gl.uniformMatrix4fv(skyboxViewMatrixLocation, false, new Float32Array(viewMatrix));
		gl.uniformMatrix4fv(skyboxProjectionLocation, false, new Float32Array(projectionMatrix));
	}
	
	// takes in matrix, which calls updateSkyboxAttributesAndUniforms
	// might not need parameters, the matrices are global anyway
	this.render = function(viewMatrix, projectionMatrix){
		gl.useProgram(skyboxProgram);
		gl.enableVertexAttribArray(skyboxPositionAttribLocation);
		updateSkyboxAttributesAndUniforms(viewMatrix, projectionMatrix);
	
		//currentTexture = skybox_texture;
		gl.activeTexture(gl.TEXTURE0);
		gl.uniform1i(gl.getUniformLocation(skyboxProgram, "skyboxTextureCoords"), 0);
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, skybox_texture);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, skybox_vertices_buffer);
		gl.vertexAttribPointer(skyboxPositionAttribLocation, 3, gl.FLOAT, false, 0, 0);
		
		gl.drawArrays(gl.TRIANGLES, 0, skybox_vertices.length/3);
		
		
		gl.disableVertexAttribArray(skyboxPositionAttribLocation);
		gl.useProgram(program);
	}
	
}