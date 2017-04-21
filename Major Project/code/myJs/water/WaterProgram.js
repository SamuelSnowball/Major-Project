
/**


*/
function WaterProgram(waterVertexShader, waterFragmentShader){
	
	var waterProgram = gl.createProgram();
	gl.attachShader(waterProgram, waterVertexShader);
	gl.attachShader(waterProgram, waterFragmentShader);
	gl.linkProgram(waterProgram);
	console.log("waterProgram status: " + gl.getProgramInfoLog(waterProgram));
	gl.useProgram(waterProgram);
	
	/*
	Get location of variables in shaders, so we can send data to shaders
	Enable them if needed
	*/	
	
	var waterPositionAttribLocation = gl.getAttribLocation(waterProgram, 'waterPosition');
	gl.enableVertexAttribArray(waterPositionAttribLocation);
	
	var waterCameraPositionLocation = gl.getUniformLocation(waterProgram, 'cameraPosition');
	
	var waterViewMatrixLocation = gl.getUniformLocation(waterProgram, 'viewMatrix');

	var waterProjectionLocation = gl.getUniformLocation(waterProgram, 'projectionMatrix');

	var waterModelLocation = gl.getUniformLocation(waterProgram, 'model');
	
	var lightPositionUniformLocation = gl.getUniformLocation(waterProgram, 'lightPosition');

	var lightColourUniformLocation = gl.getUniformLocation(waterProgram, 'lightColour');
	
	var waterMoveFactorLocation = gl.getUniformLocation(waterProgram, 'moveFactor');
	
	var waterReflectivityLocation = gl.getUniformLocation(waterProgram, 'reflectivity');
	
	var waterWaveStrengthLocation = gl.getUniformLocation(waterProgram, 'waveStrength');
	
	// @Test
	if(useTests) test_waterShaderLocationVariables();
	
	this.get = {
		/**
		@method get.program
		@return {WebGLProgram} the water program
		*/
		get program(){
			return waterProgram;
		},
	
		/**
		@method get.waterPositionAttribLocation
		@public
		@return {int} the waters vertex position location in the shader
		*/
		get waterPositionAttribLocation(){
			return waterPositionAttribLocation;
		},
		
		/**
		@method get.waterCameraPositionLocation
		@public
		@return {WebGLUniformLocation} the camera position location in the shader
		*/
		get waterCameraPositionLocation(){
			return waterCameraPositionLocation;
		},

		/**
		@method get.waterViewMatrixLocation
		@public
		@return {WebGLUniformLocation} the view matrix location in the shader
		*/
		get waterViewMatrixLocation(){
			return waterViewMatrixLocation;
		},

		/**
		@method get.waterProjectionLocation
		@public
		@return {WebGLUniformLocation} the projection matrix location in the shader
		*/
		get waterProjectionLocation(){
			return waterProjectionLocation;
		},

		/**
		@method get.waterModelLocation
		@public
		@return {WebGLUniformLocation} the models location in the shader
		*/
		get waterModelLocation(){
			return waterModelLocation;
		},

		/**
		@method get.lightPositionUniformLocation
		@public
		@return {WebGLUniformLocation} the light position location in the shader
		*/
		get lightPositionUniformLocation(){
			return lightPositionUniformLocation;
		},

		/**
		@method get.lightColourUniformLocation
		@public
		@return {WebGLUniformLocation} the light colour location in the shader
		*/
		get lightColourUniformLocation(){
			return lightColourUniformLocation;
		},

		/**
		@method get.waterMoveFactorLocation
		@public
		@return {WebGLUniformLocation} the water move factor location in the shader
		*/
		get waterMoveFactorLocation(){
			return waterMoveFactorLocation;
		},

		/**
		@method get.waterReflectivityLocation
		@public
		@return {WebGLUniformLocation} the water reflectivity location in the shader
		*/
		get waterReflectivityLocation(){
			return waterReflectivityLocation;
		},

		/**
		@method get.waterWaveStrengthLocation
		@public
		@return {WebGLUniformLocation} the water wave strength location in the shader
		*/
		get waterWaveStrengthLocation(){
			return waterWaveStrengthLocation;
		},		
	};
	
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
	@public
	*/
	this.updateWaterAttributesAndUniforms = function(){
	
		// Pass in camera position
		gl.uniform3fv(waterCameraPositionLocation, camera.get.position);
		
		// Pass in lighting colour
		gl.uniform3fv(lightColourUniformLocation, lightColour);
		
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
		gl.uniform3fv(lightPositionUniformLocation, [finalSunPosition[0], finalSunPosition[1], finalSunPosition[2]] );
	
		// Pass in how much the water should move
		waterSystem.set.waterMoveFactor = waterSystem.get.waterMoveFactor + Date.now() * 0.0000000000000009; // dont ask....
		waterSystem.set.waterMoveFactor = waterSystem.get.waterMoveFactor % 1;
		gl.uniform1f(waterMoveFactorLocation, waterSystem.get.waterMoveFactor);
		
		// Pass in waterReflectivity to shader
		gl.uniform1f(waterReflectivityLocation, waterSystem.get.waterReflectivity);
		
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
		test_isWebGLUniformLocation("lightPositionUniformLocation", lightPositionUniformLocation);
		test_isWebGLUniformLocation("lightColourUniformLocation", lightColourUniformLocation);
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