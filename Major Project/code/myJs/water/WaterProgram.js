
function WaterProgram(waterVertexShader, waterFragmentShader){
	
	var waterProgram = gl.createProgram();
	gl.attachShader(waterProgram, waterVertexShader);
	gl.attachShader(waterProgram, waterFragmentShader);
	gl.linkProgram(waterProgram);
	console.log("waterProgram status: " + gl.getProgramInfoLog(waterProgram));
	gl.useProgram(waterProgram);
	
	var waterPositionAttribLocation = gl.getAttribLocation(waterProgram, 'waterPosition');
	gl.enableVertexAttribArray(waterPositionAttribLocation);
	
	var waterCameraPositionLocation = gl.getUniformLocation(waterProgram, 'cameraPosition');
	
	var waterViewMatrixLocation = gl.getUniformLocation(waterProgram, 'viewMatrix');
	gl.uniformMatrix4fv(waterViewMatrixLocation, false, new Float32Array(viewMatrix));
	
	var waterProjectionLocation = gl.getUniformLocation(waterProgram, 'projectionMatrix');
	gl.uniformMatrix4fv(waterProjectionLocation, false, new Float32Array(projectionMatrix));
	
	var waterModelLocation = gl.getUniformLocation(waterProgram, 'model');
	gl.uniformMatrix4fv(waterModelLocation, false, new Float32Array(fullTransforms));

	var lightPositionAttribLocation = gl.getUniformLocation(waterProgram, 'lightPosition');
	gl.enableVertexAttribArray(lightPositionAttribLocation);
	
	var lightColourAttribLocation = gl.getUniformLocation(waterProgram, 'lightColour');
	gl.enableVertexAttribArray(lightColourAttribLocation);
	
	var waterMoveFactorLocation = gl.getUniformLocation(waterProgram, 'moveFactor');
	
	var waterReflectivityLocation = gl.getUniformLocation(waterProgram, 'reflectivity');
	
	var waterWaveStrengthLocation = gl.getUniformLocation(waterProgram, 'waveStrength');
	
	// @Test
	if(useTests) test_waterShaderLocationVariables();
	
	/**
	Loads in variables into the water shader:
		cameraPosition
		lightColour
		lightPosition
		moveFactor
		waterReflectivity
		waterWaveStrength
		fullTransforms,
		view & projectionMatrix
		
	This method also calculates and moves the sun position, to match the rotating skybox
	
	@method updateWaterAttributesAndUniforms
	@private
	*/
	function updateWaterAttributesAndUniforms(){
	
		// Pass in camera position
		gl.uniform3fv(waterCameraPositionLocation, camera.get.position);
		
		// Pass in lighting colour
		gl.uniform3fv(lightColourAttribLocation, lightColour);
		
		// The rotation matrix to apply to the suns position
		var rotationMatrix = [];
		m4.yRotation(-skybox.get.currentRotation + (-Math.PI /4 - Math.PI / 4), rotationMatrix);
		
		// The original position of the sun
		var lightPosition = [
			camera.get.x + 512, 
			camera.get.y + 25, 
			camera.get.z + 512,
			0
		];
		
		var finalSunPosition = [0, 0, 0, 0];
		
		// Times the lightPosition vector by rotation matrix,
		// to reposition the sun as the skybox rotates
		finalSunPosition[0] = rotationMatrix[0] * lightPosition[0] +
							  rotationMatrix[1] * lightPosition[1] + 
							  rotationMatrix[2] * lightPosition[2] +
							  rotationMatrix[3] * lightPosition[3];
						
		finalSunPosition[1] = rotationMatrix[4] * lightPosition[0] +
							  rotationMatrix[5] * lightPosition[1] + 
							  rotationMatrix[6] * lightPosition[2] + 
							  rotationMatrix[7] * lightPosition[3];

		finalSunPosition[2] = rotationMatrix[8] * lightPosition[0] +
							  rotationMatrix[9] * lightPosition[1] + 
							  rotationMatrix[10] * lightPosition[2] +	
							  rotationMatrix[11] * lightPosition[3];

		finalSunPosition[3] = rotationMatrix[12] * lightPosition[0] +
							  rotationMatrix[13] * lightPosition[1] + 
							  rotationMatrix[14] * lightPosition[2] +	
							  rotationMatrix[15] * lightPosition[3];						
		
		// Pass in the final sun position
		gl.uniform3fv(lightPositionAttribLocation, [finalSunPosition[0], finalSunPosition[1], finalSunPosition[2]] );
	
		// Pass in how much the water should move
		moveFactor += Date.now() * 0.0000000000000009; // dont ask....
		moveFactor %= 1; // loops when reaches 0
		gl.uniform1f(waterMoveFactorLocation, moveFactor);
		
		// Pass in waterReflectivity to shader
		gl.uniform1f(waterReflectivityLocation, waterReflectivity);
		
		// Pass in wave strength, get it from the GUI
		gl.uniform1f(waterWaveStrengthLocation, myGUI.get.ui_water_strength);
		
		fullTransforms = m4.multiply(position, rotateZ);
		fullTransforms = m4.multiply(fullTransforms, rotateY);
		fullTransforms = m4.multiply(fullTransforms, rotateX);
		fullTransforms = m4.multiply(fullTransforms, scale);

		gl.uniformMatrix4fv(waterModelLocation, false, new Float32Array(fullTransforms));
		gl.uniformMatrix4fv(waterViewMatrixLocation, false, new Float32Array(viewMatrix));
		gl.uniformMatrix4fv(waterProjectionLocation, false, new Float32Array(projectionMatrix));
	}

	/*
	TESTING FUNCTIONS BELOW
	*/
	
	/**
	Checks the location variables from the shaders are valid
	Check the attribute locations are ints,
	And check the uniform locations are WebGLUniformLocation objects
	
	@method test_waterShaderLocationVariables
	@private
	*/
	function test_waterShaderLocationVariables(){
		test_isNaN("waterPositionAttribLocation", waterPositionAttribLocation);
		test_isWebGLUniformLocation("waterCameraPositionLocation", waterCameraPositionLocation);
		test_isWebGLUniformLocation("waterViewMatrixLocation", waterViewMatrixLocation);
		test_isWebGLUniformLocation("waterProjectionLocation", waterProjectionLocation);
		test_isWebGLUniformLocation("waterModelLocation", waterModelLocation);
		test_isWebGLUniformLocation("lightPositionAttribLocation", lightPositionAttribLocation);
		test_isWebGLUniformLocation("lightColourAttribLocation", lightColourAttribLocation);
		test_isWebGLUniformLocation("waterMoveFactorLocation", waterMoveFactorLocation);
		test_isWebGLUniformLocation("waterReflectivityLocation", waterReflectivityLocation);
		test_isWebGLUniformLocation("waterWaveStrengthLocation", waterWaveStrengthLocation);
	}
	
	/**
	Tests if passed in value is NaN
	
	@method test_isNaN
	@private
	@param name {string} the name of the attribute to test, so we can print an error
	@param value {int} the value to test
	*/
	function test_isNaN(name, value){
		if(isNaN(value)){
			console.error("In test_waterShaderLocationVariables, " + name + " was NaN!");
		}
	}
	
	/**
	Tests if location is a WebGLUniformLocation
	
	@method test_isWebGLUniformLocation
	@private
	@param name {string} the name of the attribute to test, so we can print an error
	@param location {buffer} the location value to test
	*/
	function test_isWebGLUniformLocation(name, location){
		if(!location instanceof WebGLUniformLocation){
			console.error("In test_isWebGLUniformLocation: " + name + ", is not a WebGLUniformLocation");
		}
	}	
	
}