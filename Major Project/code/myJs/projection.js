/*
Projection matrix turns world coordinates to clipspace
*/
var fovInRadians = Math.PI * 0.3;	
var aspectRatio = window.innerWidth / window.innerHeight;
var zNear = 0.1;
var zFar = 1024;

var projectionMatrix = 	m4.perspective(
	fovInRadians,
	aspectRatio,
	zNear,
	zFar
);

var projectionLocation = gl.getUniformLocation(program, 'projection');
var gl = this.gl;
gl.uniformMatrix4fv(projectionLocation, false, new Float32Array(projectionMatrix));

