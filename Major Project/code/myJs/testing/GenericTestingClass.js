
/**
 * A class containing generic testing functions, that are used throughout the project.
 *
 * Specific testing functions are kept within their own class.
 * (otherwise horrible amounts of getters/setters are needed to test)
 * 
 * @class GenericTestingClass
*/
function GenericTestingClass(){

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

}