/*
have these in glsetup?
*/
/*
Global variables to change and load into shaders
*/
var clipPlane = [0, 0, 0, 0];
var skyColour = [0.0, 0.0, 0.0, 1.0]; //0.8, 0.5, 0.5, 0.7
var lightColour = [1, 1, 1];
var useFog = true;
var useInstancing = false;

/*
Camera matrices
*/
var UP_VECTOR = [0, 1, 0];
// Matrix for camera, move the camera in the world, then inverse and move world around camera
var cameraMatrix = m4.lookAt( [5,5,5], [0.5, 0.5, 0.5], UP_VECTOR );
// View matrix for camera, inverse everything, so that the camera is the origin
var viewMatrix = m4.inverse(cameraMatrix);

/*
Translation matrices and fullTransforms
*/
var scale = m4.scaling(0, 0, 0);
var rotateX = m4.xRotation(0);
var rotateY = m4.yRotation(0);
var rotateZ = m4.zRotation(0);
var position = m4.translation(0, 0, 0);

var fullTransforms = m4.identity();

/*
Projection variables and the matrix
*/
var fovInRadians = Math.PI * 0.3;	
var aspectRatio = window.innerWidth / window.innerHeight;
var zNear = 0.1;
var zFar = 512;

//Projection matrix turns world coordinates to clipspace
var projectionMatrix = 	m4.perspective(
	fovInRadians,
	aspectRatio,
	zNear,
	zFar
);



/**
 *
 * The main program that gets used for rendering, other programs include:
 * 	Skybox program
 *  Water program
 * 
 *  This main program currently handles:
 * 		Linking shaders into program
 * 	
 * 		Getting and enabling shader variables
 * 	
 * 		The updateAttributesAndUniforms function to pull values from global matrices and values,
 * 		to update the shader values
 * 
 * @class MainProgram
 * @constructor
 * @param vertexShader {string} the vertex shader source to use
 * @param fragmentShader {string} the fragment shader source to use
*/
function MainProgram(vertexShader, fragmentShader){
	
	// create program from shaders
	var theProgram = gl.createProgram();
	gl.attachShader(theProgram, vertexShader);
	gl.attachShader(theProgram, fragmentShader);
	gl.linkProgram(theProgram);
	console.log("Link status: " + gl.getProgramInfoLog(theProgram));
	gl.useProgram(theProgram); 

	/*
	Get location of variables in shaders, so we can send data to shaders
	Enable them if needed
	*/
	var modelLocation = gl.getUniformLocation(theProgram, 'model');
	var viewMatrixLocation = gl.getUniformLocation(theProgram, 'viewMatrix');
	var inverseViewMatrixLocation = gl.getUniformLocation(theProgram, 'inverseViewMatrix');
	var projectionLocation = gl.getUniformLocation(theProgram, 'projection');
	var positionAttribLocation = gl.getAttribLocation(theProgram, 'position');
	var textureCoordLocation = gl.getAttribLocation(theProgram, "aTextureCoord");
	var normalAttribLocation = gl.getAttribLocation(theProgram, 'normal');
	var lightPositionUniformLocation = gl.getUniformLocation(theProgram, 'lightPosition');
	var lightColourUniformLocation = gl.getUniformLocation(theProgram, 'lightColour');
	var shineDamperUniformLocation = gl.getUniformLocation(theProgram, 'shineDamper');
	var reflectivityUniformLocation = gl.getUniformLocation(theProgram, 'reflectivity');
	var reverseLightDirectionLocation = gl.getUniformLocation(theProgram, 'reverseLightDirection');
	var lightDirectionLocation = gl.getUniformLocation(theProgram, 'lightDirection');
	var skyColourLocation = gl.getUniformLocation(theProgram, 'skyColour');
	var useFogLocation = gl.getUniformLocation(theProgram, 'useFog');
	var useInstancingLocation = gl.getUniformLocation(theProgram, 'useInstancing');
	
	// The 4 vec4s which are combined in the shader to give a matrix4
	var instancingLocation0 = gl.getAttribLocation(theProgram, "instanceMatrixRow0");
	var instancingLocation1 = gl.getAttribLocation(theProgram, "instanceMatrixRow1");
	var instancingLocation2 = gl.getAttribLocation(theProgram, "instanceMatrixRow2");
	var instancingLocation3 = gl.getAttribLocation(theProgram, "instanceMatrixRow3");
	// Clipping planes for water rendering
	var clipPlaneLocation = gl.getUniformLocation(theProgram, 'clipPlane');
	// For blending of the map boundaries
	var alphaLocation = gl.getUniformLocation(theProgram, 'alpha');
	var useAlphaLocation = gl.getUniformLocation(theProgram, 'useAlpha');
	
	// @Test
	if(useTests) test_allUniformLocations();
	if(useTests) test_allAttribLocations();
	
	/*
	Getters
	*/
	this.get = {
		/**
		@method get.program
		@public 
		@return {WebGLProgram} the program being used
		*/
		get program(){
			return theProgram;
		},
		
		/**
		@method get.modelLocation
		@public 
		@return {WebGLUniformLocation} the models location in the shader
		*/
		get modelLocation(){
			return modelLocation;
		},

		/**
		@method get.viewMatrixLocation
		@public 
		@return {WebGLUniformLocation} the viwe matrix location in the shader
		*/		
		get viewMatrixLocation(){
			return viewMatrixLocation;
		},		

		/**
		@method get.inverseViewMatrixLocation
		@public 
		@return {WebGLUniformLocation} the inverse view matrix location in the shader
		*/		
		get inverseViewMatrixLocation(){
			return inverseViewMatrixLocation;
		},

		/**
		@method get.projectionLocation
		@public 
		@return {WebGLUniformLocation} the projection location in the shader
		*/		
		get projectionLocation(){
			return projectionLocation;
		},

		/**
		@method get.positionAttribLocation
		@public 
		@return {int} the position location in the shader
		*/		
		get positionAttribLocation(){
			return positionAttribLocation;
		},

		/**
		@method get.textureCoordLocation
		@public 
		@return {int} the texture coordinate location in the shader
		*/		
		get textureCoordLocation(){
			return textureCoordLocation;
		},

		/**
		@method get.normalAttribLocation
		@public 
		@return {int} the notmal location in the shader
		*/		
		get normalAttribLocation(){
			return normalAttribLocation;
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
		@method get.shineDamperUniformLocation
		@public 
		@return {WebGLUniformLocation} the shiner damper location in the shader
		*/		
		get shineDamperUniformLocation(){
			return shineDamperUniformLocation;
		},

		/**
		@method get.reflectivityUniformLocation
		@public 
		@return {WebGLUniformLocation} the reflectivity location in the shader
		*/		
		get reflectivityUniformLocation(){
			return reflectivityUniformLocation;
		},

		/**
		@method get.reverseLightDirectionLocation
		@public 
		@return {WebGLUniformLocation} the reverse light direction location in the shader
		*/		
		get reverseLightDirectionLocation(){
			return reverseLightDirectionLocation;
		},

		/**
		@method get.lightDirectionLocation
		@public 
		@return {WebGLUniformLocation} the light direction location in the shader
		*/		
		get lightDirectionLocation(){
			return lightDirectionLocation;
		},

		/**
		@method get.skyColourLocation
		@public 
		@return {WebGLUniformLocation} the sky colour location in the shader
		*/		
		get skyColourLocation(){
			return skyColourLocation;
		},

		/**
		@method get.useFogLocation
		@public 
		@return {WebGLUniformLocation} the use fog location in the shader
		*/		
		get useFogLocation(){
			return useFogLocation;
		},

		/**
		@method get.useInstancingLocation
		@public 
		@return {WebGLUniformLocation} the use instancing location in the shader
		*/		
		get useInstancingLocation(){
			return useInstancingLocation;
		},

		/**
		@method get.instancingLocation0
		@public 
		@return {int} the instancingLocation0 in the shader
		*/		
		get instancingLocation0(){
			return instancingLocation0;
		},

		/**
		@method get.instancingLocation1
		@public 
		@return {int} the instancingLocation1 in the shader
		*/		
		get instancingLocation1(){
			return instancingLocation1;
		},

		/**
		@method get.instancingLocation2
		@public 
		@return {int} the instancingLocation2 in the shader
		*/		
		get instancingLocation2(){
			return instancingLocation2;
		},

		/**
		@method get.instancingLocation3
		@public 
		@return {int} the instancingLocation3 in the shader
		*/		
		get instancingLocation3(){
			return instancingLocation3;
		},

		/**
		@method get.clipPlaneLocation
		@public 
		@return {WebGLUniformLocation} the clip plane location in the shader
		*/		
		get clipPlaneLocation(){
			return clipPlaneLocation;
		},

		/**
		@method get.alphaLocation
		@public 
		@return {WebGLUniformLocation} the alpha location in the shader
		*/		
		get alphaLocation(){
			return alphaLocation;
		},

		/**
		@method get.useAlphaLocation
		@public 
		@return {WebGLUniformLocation} the use alpha location in the shader
		*/		
		get useAlphaLocation(){
			return useAlphaLocation;
		},
	};


	/**
	Loads variables and matrices into shaders every frame
	
	@method updateAttributesAndUniforms 
	@public 
	*/
	this.updateAttributesAndUniforms = function(){

		fullTransforms = m4.multiply(position, rotateZ);
		fullTransforms = m4.multiply(fullTransforms, rotateY);
		fullTransforms = m4.multiply(fullTransforms, rotateX);
		fullTransforms = m4.multiply(fullTransforms, scale);
		
		gl.uniformMatrix4fv(modelLocation, false, new Float32Array(fullTransforms));
		gl.uniformMatrix4fv(viewMatrixLocation, false, new Float32Array(viewMatrix));
		gl.uniformMatrix4fv(inverseViewMatrixLocation, false, new Float32Array(m4.inverse(viewMatrix)));
		gl.uniformMatrix4fv(projectionLocation, false, new Float32Array(projectionMatrix));
		
		gl.uniform3fv(lightColourUniformLocation, lightColour);
		gl.uniform1f(shineDamperUniformLocation, currentTexture.getTextureAttribute.shineDamper);
		gl.uniform1f(reflectivityUniformLocation, currentTexture.getTextureAttribute.reflectivity);
		
		// Directional lighting, coming straight down
		gl.uniform3fv(reverseLightDirectionLocation, m4.normalize([0, -1, 0]));
		// For specular lighting, its the same as above...
		// This is the surfaceToLightVector, so yeah, it goes up!
		gl.uniform3fv(lightDirectionLocation, m4.normalize([0, 1, 0]));
		
		// Fog
		gl.uniform4fv(skyColourLocation, skyColour);
		
		// Enable/disable fog
		gl.uniform1i(useFogLocation, useFog);
		
		// Clip plane
		gl.uniform4fv(clipPlaneLocation, clipPlane);
	}
	
	/*
	TESTING FUNCTIONS BELOW
	*/
	
	/**
	Tests uniform locations to see if they're valid
	
	@method test_allUniformLocations
	@private
	*/
	function test_allUniformLocations(){
		genericTestingObject.test_isWebGLUniformLocation("modelLocation", modelLocation);
		genericTestingObject.test_isWebGLUniformLocation("viewMatrixLocation", viewMatrixLocation);
		genericTestingObject.test_isWebGLUniformLocation("inverseViewMatrixLocation", inverseViewMatrixLocation);
		genericTestingObject.test_isWebGLUniformLocation("projectionLocation", projectionLocation);
		genericTestingObject.test_isWebGLUniformLocation("lightPositionUniformLocation", lightPositionUniformLocation);
		genericTestingObject.test_isWebGLUniformLocation("lightColourUniformLocation", lightColourUniformLocation);
		genericTestingObject.test_isWebGLUniformLocation("shineDamperUniformLocation", shineDamperUniformLocation);
		genericTestingObject.test_isWebGLUniformLocation("reflectivityUniformLocation", reflectivityUniformLocation);
		genericTestingObject.test_isWebGLUniformLocation("reverseLightDirectionLocation", reverseLightDirectionLocation);
		genericTestingObject.test_isWebGLUniformLocation("lightDirectionLocation", lightDirectionLocation);
		genericTestingObject.test_isWebGLUniformLocation("skyColourLocation", skyColourLocation);
		genericTestingObject.test_isWebGLUniformLocation("useFogLocation", useFogLocation);
		genericTestingObject.test_isWebGLUniformLocation("useInstancingLocation", useInstancingLocation);
		genericTestingObject.test_isWebGLUniformLocation("clipPlaneLocation", clipPlaneLocation);
		genericTestingObject.test_isWebGLUniformLocation("alphaLocation", alphaLocation);
		genericTestingObject.test_isWebGLUniformLocation("useAlphaLocation", useAlphaLocation);
	}
		
	/**
	Tests attribute locations to see if they're valid
	
	@method test_allAttribLocations
	@private
	*/
	function test_allAttribLocations(){
		genericTestingObject.test_isNaN_orInt("positionAttribLocation", positionAttribLocation);
		genericTestingObject.test_isNaN_orInt("textureCoordLocation", textureCoordLocation);
		genericTestingObject.test_isNaN_orInt("normalAttribLocation", normalAttribLocation);
		genericTestingObject.test_isNaN_orInt("instancingLocation0", instancingLocation0);
		genericTestingObject.test_isNaN_orInt("instancingLocation1", instancingLocation1);
		genericTestingObject.test_isNaN_orInt("instancingLocation2", instancingLocation2);
		genericTestingObject.test_isNaN_orInt("instancingLocation3", instancingLocation3);
	}
	
}