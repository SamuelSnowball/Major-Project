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

var modelLocation = gl.getUniformLocation(program, 'model');
gl.uniformMatrix4fv(modelLocation, false, new Float32Array(fullTransforms));


function computeModelMatrix(paramRotateX, paramRotateY, rotateZ, xPos, yPos, zPos, scaleAll ){
  scale = MDN.scaleMatrix(scaleAll, scaleAll, scaleAll);
  rotateX = m4.xRotation( paramRotateX * 0.003 );
  rotateY = m4.yRotation( paramRotateY * 0.003 );
  position = m4.translation(xPos, yPos, zPos);
}


function updateAttributesAndUniforms(){
	fullTransforms = m4.multiply(position, rotateZ);
	fullTransforms = m4.multiply(fullTransforms, rotateY);
	fullTransforms = m4.multiply(fullTransforms, rotateX);
	fullTransforms = m4.multiply(fullTransforms, scale);

	gl.uniformMatrix4fv(modelLocation, false, new Float32Array(fullTransforms));
	gl.uniformMatrix4fv(projectionLocation, false, new Float32Array(viewProjectionMatrix));
	
	gl.uniform3fv(lightPositionAttribLocation, [10, 1, 10]);
	gl.uniform3fv(lightColourAttribLocation, [1, 0.6, 0.6]); //red light
}

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

//Combine view and projection matrices
var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);
