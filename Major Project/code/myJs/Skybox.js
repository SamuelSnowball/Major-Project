
function Skybox(){
	
	var rotationSpeed = 1; // 1 degree per frame
	var currentRotation = 0;
	var blendFactor = 0; // for blending of the 2 skybox textures
	var time = 0; // time of day
	var timeIncrement = 0.001;
	
	var skyColourIncrement = 0.001; // how quickly the fog increases/decreases based on time of day
	
	this.get = {
		get currentRotation(){
			return currentRotation;
		},
		get currentTime(){
			return time;
		}
	};
	
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
		'uniform samplerCube cubeMap2;', // for night
		'uniform float blendFactor;', // how much of each skybox texture to render
		// 0 = just render first texture, 1 = just second 

		'vec3 texture(samplerCube sampler, vec3 c){',
			'return textureCube(sampler, c).rgb;',
		'}',
		
		// blends skybox with fog colour
		'uniform vec4 skyColour;',
		'float lowerLimit = 0.0;',
		'float upperLimit = 20.0;',
		
		'void main(void){',
			'vec3 sample = texture(cubeMap, skyboxTextureCoords);',
			'vec3 sample2 = texture(cubeMap2, skyboxTextureCoords);',
			'vec3 finalSkyboxMixColour = mix(sample, sample2, blendFactor);',
			
			'float factor = (skyboxTextureCoords.y - lowerLimit) / (upperLimit - lowerLimit);',
			'factor = clamp(factor, 0.0, 1.0);',
			
			'gl_FragColor = mix(skyColour, vec4(finalSkyboxMixColour, 1.0), factor);',
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

	/*
	Attribute locations in new shaders
	*/
	gl.useProgram(skyboxProgram);
		var skyboxPositionAttribLocation = gl.getAttribLocation(skyboxProgram, 'skyboxPosition');
		gl.enableVertexAttribArray(skyboxPositionAttribLocation);
		
		var skyboxViewMatrixLocation = gl.getUniformLocation(skyboxProgram, 'viewMatrix');
		gl.uniformMatrix4fv(skyboxViewMatrixLocation, false, new Float32Array(viewMatrix));
		
		var skyboxProjectionLocation = gl.getUniformLocation(skyboxProgram, 'projectionMatrix');
		gl.uniformMatrix4fv(skyboxProjectionLocation, false, new Float32Array(projectionMatrix));
		
		var skyboxFogColourLocation = gl.getUniformLocation(skyboxProgram, 'skyColour');
		gl.enableVertexAttribArray(skyboxFogColourLocation);
		
		// Skybox blending uniforms
		var skyboxBlendFactorLocation = gl.getUniformLocation(skyboxProgram, 'blendFactor');
		
	gl.useProgram(program);
	
	function updateDay(){
		
		
		// 0.00000000000003 bit slow
		// 0.0000000000003 bit fast
		time += Date.now()*0.0000000000001; // 4 is too fast
		
		if(time > 2400){
			time = 0;
		}
		
		/*
		Base the blend factor on time of day
			blendFactor = 1, fully night
			blendFactor = 0, fully day
	
		Fog/Sky colours:
			White [1, 1, 1, 1]
			Black [0, 0, 0, 1]

		Set waterReflectivity based on time of day
		*/
		var waterReflectivityIncrement = waterSystem.get.waterReflectivityIncrement;
		
		if(time > 1800 && time < 2400){
			// Start blending to night (1)
			blendFactor += timeIncrement;
			if(blendFactor > 1){
				blendFactor = 1;
			}
			// Make fog darker
			skyColour[0] -= skyColourIncrement;
			skyColour[1] -= skyColourIncrement;
			skyColour[2] -= skyColourIncrement;
			
			if(skyColour[0] < 0 || skyColour[1] < 0 || skyColour[2] < 0){
				skyColour[0] = 0;
				skyColour[1] = 0;
				skyColour[2] = 0;
			}
			
			// Decrease waterReflectivity, then stop it going below 0
			waterSystem.set.waterReflectivity = waterSystem.get.waterReflectivity - waterReflectivityIncrement;
			if(waterSystem.get.waterReflectivity < 0){
				waterSystem.set.waterReflectivity = 0;
			}
		}
		else if(time > 0 && time < 0600){
			// Keep at night (1)
			blendFactor = 1;
			// Keep fog black
			skyColour[0] = 0;
			skyColour[1] = 0;
			skyColour[2] = 0;
			
			waterSystem.set.waterReflectivity = 0;
		}
		else if(time > 0600 && time < 1200){
			// Start blending to day (0)
			blendFactor -= timeIncrement;
			if(blendFactor < 0){
				blendFactor = 0;
			}
			// Blend fog to white
			skyColour[0] += skyColourIncrement;
			skyColour[1] += skyColourIncrement;
			skyColour[2] += skyColourIncrement;
			
			if(skyColour[0] > 1 || skyColour[1] > 1 || skyColour[2] > 1){
				skyColour[0] = 1;
				skyColour[1] = 1;
				skyColour[2] = 1;
			}
			
			// Increase waterReflectivity, stop it going over 1
			waterSystem.set.waterReflectivity = waterSystem.get.waterReflectivity + waterReflectivityIncrement;
			if(waterSystem.get.waterReflectivity > 1){
				waterSystem.set.waterReflectivity = 1;
			}
		}
		else if(time > 1200 && time < 1800){
			// Keep at day (0) 
			blendFactor = 0;
			// Keep fog white
			skyColour[0] = 1;
			skyColour[1] = 1;
			skyColour[2] = 1;
			
			// Keep waterReflectivity at its maximum value
			waterSystem.set.waterReflectivity = 1;
		}
	}
	
	var SIZE = 256;
	
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
	
	/*
	
	*/
	function updateSkyboxAttributesAndUniforms( ){
		// Remove the translation from the view matrix
		// So the skybox doesn't move in relation to the camera
		// Stays at max clip space coordinates
		viewMatrix[12] = 0;
		viewMatrix[13] = 0;
		viewMatrix[14] = 0;

		// Increase skybox rotation
		currentRotation += rotationSpeed * Date.now() * 0.00000000000000009;
		
		// Rotate viewMatrix by angle, and store in viewMatrix
		m4.yRotate(viewMatrix, currentRotation, viewMatrix);
		
		// Load blend factor, waterReflectivity, skyColour
		updateDay();
		
		gl.uniform1f(skyboxBlendFactorLocation, blendFactor);
		
		gl.uniform4fv(skyboxFogColourLocation, skyColour);
		gl.uniformMatrix4fv(skyboxViewMatrixLocation, false, new Float32Array(viewMatrix));
		gl.uniformMatrix4fv(skyboxProjectionLocation, false, new Float32Array(projectionMatrix));
	}
	
	this.render = function(viewMatrix, projectionMatrix){
		gl.useProgram(skyboxProgram);
		
		// Reset matrices
		scale = m4.scaling(1, 1, 1);
		rotateX = m4.xRotation(0);
		rotateY = m4.yRotation(0);
		rotateZ = m4.zRotation(0);
		position = m4.translation(0, 0, 0);

		// Times matrices together
		updateSkyboxAttributesAndUniforms();

		// CubeMap1 Sample from unit 0
		gl.activeTexture(gl.TEXTURE0);
		gl.uniform1i(gl.getUniformLocation(skyboxProgram, "cubeMap"), 0);
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, skybox_texture);
		
		// CubeMap2 Sample from unit 1
		gl.activeTexture(gl.TEXTURE1);
		gl.uniform1i(gl.getUniformLocation(skyboxProgram, "cubeMap2"), 1);
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, skybox_night_texture);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, skybox_vertices_buffer);
		gl.vertexAttribPointer(skyboxPositionAttribLocation, 3, gl.FLOAT, false, 0, 0);
		
		gl.drawArrays(gl.TRIANGLES, 0, skybox_vertices.length/3);
		
		gl.useProgram(program);
	}
	
}