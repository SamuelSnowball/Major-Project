
/**
 * A class containing generic testing functions, that are needed throughout the project files.
 * This class calls nearly all of the testing methods, some are called within their own class (for good reason)
 *
 * Specific testing functions are kept within their own class.
 * (otherwise horrible amounts of getters/setters are needed to test)
 * 
 * @class TesterClass
*/
function TesterClass(){

	/**
	Tests if passed in value is NaN, and checks its an int
	Used for testing attribute locations are valid (as they should be ints)
	
	@method test_isNaN_orInt
	@public
	@param name {string} the name of the attribute to test, so we can print an error
	@param value {int} the value to test
	*/
	this.test_isNaN_orInt = function(name, value){
		if(isNaN(value) && value !== parseInt(value, 10)){
			console.error("In: " + name + " was NaN or not an int!");
		}
	}

	/**
	Tests if location is a WebGLUniformLocation
	
	@method test_isWebGLUniformLocation
	@public
	@param name {string} the name of the attribute to test, so we can print an error
	@param location {buffer} the location value to test
	*/
	this.test_isWebGLUniformLocation = function(name, location){
		if(!location instanceof WebGLUniformLocation){
			console.error("In test_isWebGLUniformLocation: " + name + ", is not a WebGLUniformLocation");
		}
	}
	
	/**
	Tests if the parameter is a valid WebGLTexture object
	
	@method test_is_texture
	@param name {string} the name of the texture to test
	@param texture {WebGLTexture} the texture object to test
	*/
	this.test_is_texture = function(name, texture){
		if(!gl.isTexture(texture)){
			console.error(name + ", was not a valid WebGLTexture object!");
		}
	}
	
	/**
	Tests if the parameter is a valid Framebuffer object
	
	@method test_is_frameBufferObject
	@param name {string} the name of the buffer that's being tested
	@param buffer {WebGLFramebuffer} the object to test if is a frame buffer 
	*/
	this.test_is_frameBufferObject = function(name, buffer){
		if(!gl.isFramebuffer(buffer)){
			console.error(name + ", was not a valid Framebuffer object!");
		}
	}
	
	/**
	Tests if passed buffe is vaid WebGLBuffer
	
	@method is_buffer
	@param name {string} the name of the buffer to test
	@param buffer {WebGLBuffer} the buffer to test
	*/
	this.is_buffer = function(name, buffer){
		if(!gl.isBuffer(buffer)){
			console.error(name + ", was not a valid buffer object!");
		}	
	}
	
	
	/**
	Calls methods to test everything, that is testable
	
	Public, to call public methods
	Otherwise private calling a public, have to change everything
	
	Some terrain tests are in the actual file, because data
	is being created and reset, need to test inbetween.
	
	@method test_scene
	@public
	*/
	this.test_scene = function(){
			
		// Texture @Tests
		// Creates a temporary texture object to test getters on
		var tempTexture = new Texture('resources/rocks/0.png', 10, 0);		
		tempTexture.test_getters(tempTexture);
		
		// Program @Tests
		mainProgram.test_allUniformLocations_and_getters();
		mainProgram.test_allAttribLocations_and_getters();
		
		// Terrain @Tests
		terrain.test_createHeightMap();
		terrain.test_fillHeightMap();
		terrain.test_setters_and_getters();
		terrain.test_terrainVAOs();
		
		// RockGenerator @Tests
		rockGenerator.test_matricesForTransformRow(1);
		rockGenerator.test_matricesForTransformRow(3);
		rockGenerator.test_matricesForTransformRow(2);
		rockGenerator.test_matricesForTransformRow(4);
		
		// SkyboxProgram @Tests
		skyboxProgram.test_allSkyboxAttributeLocationVariables_and_getters();
		skyboxProgram.test_allSkyboxUniformLocationVariables_and_getters();
	
		// Skybox @Tests
		skybox.test_skybox_variables_setters_and_getters();
		
		// WaterFramebuffers @Tests
		waterFramebuffers.test_setupReflectionFrameBuffer();
		waterFramebuffers.test_setupRefractionFrameBuffer();		
		waterFramebuffers.test_all_getters();
		
		// Water program @Tests
		waterProgram.test_waterShaderLocationVariables_and_getters();
		
		// Water system @Tests
		waterSystem.test_water_variables();
		waterSystem.test_water_buffers();
		waterSystem.test_water_textures();
		
	}

}