
/**
 * The water program that gets used for rendering water, other programs include:
 * 	Skybox program
 *  main program
 * 
 *  This file currently handles:
 * 		Linking water vertex/fragment shaders into program
 * 	
 * 		Getting and enabling shader variables
 * 	
 * 		The updateWaterAttributesAndUniforms function to pull values from global matrices and values,
 * 		to update the shader values
 *
 * @class WaterProgram
 * @constructor
 * @param waterVertexShader {string} the string containing the waterVertexShader source
 * @param waterFragmentShader {string} the string containing the waterFragmentShader source
*/
function WaterProgram(waterVertexShader, waterFragmentShader){
	
	// Create program from shaders
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
	var waterCameraPositionLocation = gl.getUniformLocation(waterProgram, 'cameraPosition');
	var waterViewMatrixLocation = gl.getUniformLocation(waterProgram, 'viewMatrix');
	var waterProjectionLocation = gl.getUniformLocation(waterProgram, 'projectionMatrix');
	var waterModelLocation = gl.getUniformLocation(waterProgram, 'model');
	var lightPositionUniformLocation = gl.getUniformLocation(waterProgram, 'lightPosition');
	var lightColourUniformLocation = gl.getUniformLocation(waterProgram, 'lightColour');
	var waterMoveFactorLocation = gl.getUniformLocation(waterProgram, 'moveFactor');
	var waterReflectivityLocation = gl.getUniformLocation(waterProgram, 'reflectivity');
	var waterWaveStrengthLocation = gl.getUniformLocation(waterProgram, 'waveStrength');
	
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
		
		// Pass in the final sun position
		gl.uniform3fv(lightPositionUniformLocation, [skybox.get.finalSunPositionX, skybox.get.finalSunPositionY, skybox.get.finalSunPositionZ] );
	
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
	Tests getters as well
	Check the attribute locations are ints,
	And check the uniform locations are WebGLUniformLocation objects
	
	@method test_waterShaderLocationVariables
	@public
	*/
	this.test_waterShaderLocationVariables_and_getters = function(){
		testerObject.test_isNaN_orInt("waterPositionAttribLocation", this.get.waterPositionAttribLocation);
		testerObject.test_isWebGLUniformLocation("waterCameraPositionLocation", this.get.waterCameraPositionLocation);
		testerObject.test_isWebGLUniformLocation("waterViewMatrixLocation", this.get.waterViewMatrixLocation);
		testerObject.test_isWebGLUniformLocation("waterProjectionLocation", this.get.waterProjectionLocation);
		testerObject.test_isWebGLUniformLocation("waterModelLocation", this.get.waterModelLocation);
		testerObject.test_isWebGLUniformLocation("lightPositionUniformLocation", this.get.lightPositionUniformLocation);
		testerObject.test_isWebGLUniformLocation("lightColourUniformLocation", this.get.lightColourUniformLocation);
		testerObject.test_isWebGLUniformLocation("waterMoveFactorLocation", this.get.waterMoveFactorLocation);
		testerObject.test_isWebGLUniformLocation("waterReflectivityLocation", this.get.waterReflectivityLocation);
		testerObject.test_isWebGLUniformLocation("waterWaveStrengthLocation", this.get.waterWaveStrengthLocation);
	}
	
}