/*
Matrices
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

	//projection should be here..
var modelLocation = gl.getUniformLocation(program, 'model');
gl.uniformMatrix4fv(modelLocation, false, new Float32Array(fullTransforms));

//camera stuff

var cameraSpeed = 0.003;

//Matrix for camera, move the camera in the world
var cameraMatrix = m4.yRotation(0);
//cameraMatrix = m4.translate(cameraMatrix, playerX, playerY, playerZ);

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

function computeModelMatrix(paramRotateX, paramRotateY, rotateZ, xPos, yPos, zPos, scaleAll ){
  scale = MDN.scaleMatrix(scaleAll, scaleAll, scaleAll);
  rotateX = m4.xRotation( paramRotateX * 0.003 );
  rotateY = m4.yRotation( paramRotateY * 0.003 );
  position = m4.translation(xPos, yPos, zPos);
}


var skyColour = [0.8, 0.8, 0.8, 0.7];
var lightColour = [1, 1, 1];
var useFog = true;

function updateAttributesAndUniforms(){

	//Have to remake this every frame? shouldn't be awful
	projectionMatrix = 	m4.perspective(
		fovInRadians,
		aspectRatio,
		zNear,
		zFar
	);

	//why is rotate z has position?
	fullTransforms = m4.multiply(position, rotateZ);
	fullTransforms = m4.multiply(fullTransforms, rotateY);
	fullTransforms = m4.multiply(fullTransforms, rotateX);
	fullTransforms = m4.multiply(fullTransforms, scale);
	
	gl.uniformMatrix4fv(modelLocation, false, new Float32Array(fullTransforms));
	gl.uniformMatrix4fv(viewMatrixLocation, false, new Float32Array(viewMatrix));
	gl.uniformMatrix4fv(inverseViewMatrixLocation, false, new Float32Array(m4.inverse(viewMatrix)));
	gl.uniformMatrix4fv(projectionLocation, false, new Float32Array(projectionMatrix));
	
	//Load these values from globals which u change!
	//gl.uniform3fv(lightPositionAttribLocation, [20, 2, 20]);
	gl.uniform3fv(lightColourAttribLocation, lightColour);
	
	//Load up shine variables into shader
	//Float so uniform1f
	gl.uniform1f(shineDamperAttribLocation, currentTexture.getTextureAttribute.shineDamper);
	gl.uniform1f(reflectivityAttribLocation, currentTexture.getTextureAttribute.reflectivity);

	//Directional lighting, coming straight down?
	gl.uniform3fv(reverseLightDirectionLocation, m4.normalize([0, -1, 0]));
	
	//For specular lighting, its the same as above...
	//This is the surfaceToLightVector, so yeah, it goes up!
	gl.uniform3fv(lightDirectionLocation, m4.normalize([0, 1, 0]));
	
	//Fog
	gl.uniform4fv(skyColourLocation, skyColour);
	
	//Enable/disable fog
	gl.uniform1i(useFogLocation, useFog);
}
