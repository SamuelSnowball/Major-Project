
/**
 * A class containing generic testing functions, that are used throughout the project.
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
	Public to call public methods
	Otherwise private calling a public, have to change everything
	
	Some terrain tests are in the actual file, because data
	is being created and reset, need to test inbetween.
	
	@method test_scene
	@constructor
	@public
	*/
	this.test_scene = function(){
			
		// Program @Test 
		mainProgram.test_allUniformLocations_and_getters();
		mainProgram.test_allAttribLocations_and_getters();
		
		// Terrain @Test
		terrain.test_createHeightMap();
		terrain.test_fillHeightMap();
		terrain.test_setters_and_getters();
		terrain.test_terrainVAOs();
		
		// RockGenerator @Test
		rockGenerator.test_matricesForTransformRow(1);
		rockGenerator.test_matricesForTransformRow(3);
		rockGenerator.test_matricesForTransformRow(2);
		rockGenerator.test_matricesForTransformRow(4);
		
		// SkyboxProgram @Test
		skyboxProgram.test_allSkyboxAttributeLocationVariables();
		skyboxProgram.test_allSkyboxUniformLocationVariables();
	
		// Skybox @Test
		skybox.test_skybox_setters_and_getters();
		
		// Water program
		waterProgram.test_waterShaderLocationVariables_and_getters();
		
	}

}