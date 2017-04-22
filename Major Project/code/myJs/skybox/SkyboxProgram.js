
/**
 * The Skybox program that gets used for rendering the skybox, other programs include:
 * 	water program
 *  main program
 * 
 *  This Skybox program currently handles:
 * 		Linking Skybox vertex/fragment shaders into program
 * 	
 * 		Getting and enabling shader variables
 * 	
 * 		The updateSkyboxAttributesAndUniforms function to pull values from global matrices and values,
 * 		to update the shader values
 *
 * @class SkyboxProgram
 * @constructor
 * @param vertexShader {string} the vertex shader source to use
 * @param fragmentShader {string} the fragment shader source to use
 */
function SkyboxProgram(skyboxVertexShader, skyboxFragmentShader){

	// Create program from shaders
	var skyboxProgram = gl.createProgram();
	gl.attachShader(skyboxProgram, skyboxVertexShader);
	gl.attachShader(skyboxProgram, skyboxFragmentShader);
	gl.linkProgram(skyboxProgram);
	console.log("skyboxProgram status: " + gl.getProgramInfoLog(skyboxProgram));
	gl.useProgram(skyboxProgram); 
	
	/*
	Get location of variables in shaders, so we can send data to shaders
	*/
	var skyboxPositionAttribLocation = gl.getAttribLocation(skyboxProgram, 'skyboxPosition');
	var skyboxViewMatrixLocation = gl.getUniformLocation(skyboxProgram, 'viewMatrix');
	var skyboxProjectionLocation = gl.getUniformLocation(skyboxProgram, 'projectionMatrix');
	var skyboxFogColourLocation = gl.getUniformLocation(skyboxProgram, 'skyColour');
	var skyboxBlendFactorLocation = gl.getUniformLocation(skyboxProgram, 'blendFactor');	
	
	// @Test
	if(useTests) test_skyboxShaderLocationVariables();
	
	this.get = {
		/**
		@method get.program
		@return {WebGLProgram} the skybox program
		*/
		get program(){
			return skyboxProgram;
		},	
		
		/**
		@method get.skyboxPositionAttribLocation
		@return {WebGLProgram} the skyboxPositionAttribLocation
		*/
		get skyboxPositionAttribLocation(){
			return skyboxPositionAttribLocation;
		},	

		/**
		@method get.skyboxViewMatrixLocation
		@return {WebGLProgram} the skyboxViewMatrixLocation
		*/
		get skyboxViewMatrixLocation(){
			return skyboxViewMatrixLocation;
		},	

		/**
		@method get.skyboxProjectionLocation
		@return {WebGLProgram} the skyboxProjectionLocation
		*/
		get skyboxProjectionLocation(){
			return skyboxProjectionLocation;
		},	

		/**
		@method get.skyboxFogColourLocation
		@return {WebGLProgram} the skyboxFogColourLocation
		*/
		get skyboxFogColourLocation(){
			return skyboxFogColourLocation;
		},	

		/**
		@method get.skyboxBlendFactorLocation
		@return {WebGLProgram} the skyboxBlendFactorLocation
		*/
		get skyboxBlendFactorLocation(){
			return skyboxBlendFactorLocation;
		}	
	};
	
	/**
	This function loads the skybox variables into the shader
	It also rotates the skybox
	
	@method updateSkyboxAttributesAndUniforms
	@private
	*/
	this.updateSkyboxAttributesAndUniforms = function(){
		// Remove the translation from the view matrix
		// So the skybox doesn't move in relation to the camera
		// Stays at max clip space coordinates
		viewMatrix[12] = 0;
		viewMatrix[13] = 0;
		viewMatrix[14] = 0;

		// Increase skybox rotation
		skybox.set.currentRotation = skybox.get.currentRotation + skybox.get.rotationSpeed * Date.now() * 0.00000000000000009;
		
		// Rotate viewMatrix by angle, and store in viewMatrix
		m4.yRotate(viewMatrix, skybox.get.currentRotation, viewMatrix);
		
		// Load blend factor, waterReflectivity, skyColour
		skybox.updateDay();
		
		gl.uniform1f(skyboxBlendFactorLocation, skybox.get.blendFactor);
		
		gl.uniform4fv(skyboxFogColourLocation, skyColour);
		gl.uniformMatrix4fv(skyboxViewMatrixLocation, false, new Float32Array(viewMatrix));
		gl.uniformMatrix4fv(skyboxProjectionLocation, false, new Float32Array(projectionMatrix));
	}	
	
	/*
	TESTINF FUNCTIONS BELOW
	*/
	function test_skyboxShaderLocationVariables(){
		
	}
}