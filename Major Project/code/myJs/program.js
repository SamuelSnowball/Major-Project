/*
This file currently handles:
	Linking shaders into program
	
	Getting and enabling shader variables
	
	Global definition of matrices and camera matrix info
	
	The updateAttributesAndUniforms to pull values from global matrices, and update the shader values
*/
var program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
console.log("Link status: " + gl.getProgramInfoLog(program));
gl.useProgram(program); 

// Global variables to change and load into shaders
var clipPlane = [0, 0, 0, 0];
var skyColour = [0.8, 0.5, 0.5, 0.7];
var lightColour = [1, 1, 1];
var useFog = true;
var useInstancing = false;

/*
Get location of variables in shaders
Enable them so can use them
*/

// Vertices
var positionAttribLocation = gl.getAttribLocation(program, 'position');
gl.enableVertexAttribArray(positionAttribLocation);

// Uvs
var textureCoordLocation = gl.getAttribLocation(program, "aTextureCoord");
gl.enableVertexAttribArray(textureCoordLocation);

// Normals
var normalAttribLocation = gl.getAttribLocation(program, 'normal');
gl.enableVertexAttribArray(normalAttribLocation);

// Light position, can remove this?
var lightPositionAttribLocation = gl.getUniformLocation(program, 'lightPosition');
gl.enableVertexAttribArray(lightPositionAttribLocation);

// Light color
var lightColourAttribLocation = gl.getUniformLocation(program, 'lightColour');
gl.enableVertexAttribArray(lightColourAttribLocation);

// Specular lighting, for use on textures
var shineDamperAttribLocation = gl.getUniformLocation(program, 'shineDamper');
gl.enableVertexAttribArray(shineDamperAttribLocation);

var reflectivityAttribLocation = gl.getUniformLocation(program, 'reflectivity');
gl.enableVertexAttribArray(reflectivityAttribLocation);

// Directional lighting
var reverseLightDirectionLocation = gl.getUniformLocation(program, 'reverseLightDirection');
gl.enableVertexAttribArray(reverseLightDirectionLocation);

// Specular
var lightDirectionLocation = gl.getUniformLocation(program, 'lightDirection');
gl.enableVertexAttribArray(lightDirectionLocation);

// Sky colour for fog
var skyColourLocation = gl.getUniformLocation(program, 'skyColour');
gl.enableVertexAttribArray(skyColourLocation);

// Fog
var useFogLocation = gl.getUniformLocation(program, 'useFog');
gl.enableVertexAttribArray(useFogLocation);

// Instancing location for rocks
var useInstancingLocation = gl.getUniformLocation(program, 'useInstancing');
gl.enableVertexAttribArray(useInstancingLocation);	

var instancingLocation0 = gl.getAttribLocation(program, "instanceMatrixRow0");
var instancingLocation1 = gl.getAttribLocation(program, "instanceMatrixRow1");
var instancingLocation2 = gl.getAttribLocation(program, "instanceMatrixRow2");
var instancingLocation3 = gl.getAttribLocation(program, "instanceMatrixRow3");

var clipPlaneLocation = gl.getUniformLocation(program, 'clipPlane');
gl.enableVertexAttribArray(clipPlaneLocation);	

/*
#################
	Matrices
#################
*/
var scale = m4.scaling(0, 0, 0);
var rotateX = m4.xRotation(0);
var rotateY = m4.yRotation(0);
var rotateZ = m4.zRotation(0);
var position = m4.translation(0, 0, 0);

var fullTransforms = m4.multiply(position, rotateZ);
	fullTransforms = m4.multiply(fullTransforms, rotateY);
	fullTransforms = m4.multiply(fullTransforms, rotateX);
	fullTransforms = m4.multiply(fullTransforms, scale);

var modelLocation = gl.getUniformLocation(program, 'model');
gl.uniformMatrix4fv(modelLocation, false, new Float32Array(fullTransforms));

/*
### Camera ###
*/
var yaw = -90;
var pitch = 0;
var lastX = window.innerWidth/2;
var lastY = window.innerHeight/2;
var sensitivity = 0.005;

	var cameraSpeed = 0.003;

	//Matrix for camera, move the camera in the world
	var cameraMatrix = m4.yRotation(0);

	//Cameras position from matrix
	var cameraPosition = [
		cameraMatrix[12],
		cameraMatrix[13],
		cameraMatrix[14]
	];

	//Actual usage in index file, but definition needed here
	var cameraTarget = [
		0,
		0,
		0,
	];

	var UP_VECTOR = [0, 1, 0];

	//Compute camera matrix
	var cameraMatrix = m4.lookAt(cameraPosition, cameraTarget, UP_VECTOR);

	//View matrix for camera, inverse everything, so that the camera is the origin
	var viewMatrix = m4.inverse(cameraMatrix);

	var viewMatrixLocation = gl.getUniformLocation(program, 'viewMatrix');
	gl.uniformMatrix4fv(viewMatrixLocation, false, new Float32Array(viewMatrix));

	//Inverse view matrix
	var inverseViewMatrixLocation = gl.getUniformLocation(program, 'inverseViewMatrix');
	gl.uniformMatrix4fv(inverseViewMatrixLocation, false, new Float32Array(m4.inverse(viewMatrix)));
/*
### End camera ###
*/

/*
Loads global variables and matrices into shader every frame
*/
function updateAttributesAndUniforms(){

	fullTransforms = m4.multiply(position, rotateZ);
	fullTransforms = m4.multiply(fullTransforms, rotateY);
	fullTransforms = m4.multiply(fullTransforms, rotateX);
	fullTransforms = m4.multiply(fullTransforms, scale);
	
	gl.uniformMatrix4fv(modelLocation, false, new Float32Array(fullTransforms));
	gl.uniformMatrix4fv(viewMatrixLocation, false, new Float32Array(viewMatrix));
	gl.uniformMatrix4fv(inverseViewMatrixLocation, false, new Float32Array(m4.inverse(viewMatrix)));
	gl.uniformMatrix4fv(projectionLocation, false, new Float32Array(projectionMatrix));
	
	gl.uniform3fv(lightColourAttribLocation, lightColour);
	gl.uniform1f(shineDamperAttribLocation, currentTexture.getTextureAttribute.shineDamper);
	gl.uniform1f(reflectivityAttribLocation, currentTexture.getTextureAttribute.reflectivity);
	
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
#################
	Projection
#################
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

var projectionLocation = gl.getUniformLocation(program, 'projection');
var gl = this.gl;
gl.uniformMatrix4fv(projectionLocation, false, new Float32Array(projectionMatrix));

