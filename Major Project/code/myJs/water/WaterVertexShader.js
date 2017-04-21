
/*
Code for water vertex shader 
*/
var waterVertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(waterVertexShader, [
	'attribute vec2 waterPosition;',
	
	// Out the texture coordinates from vertex shader
	'varying vec2 textureCoords;',
	'float tilingValue = 10.0;',
	
	'varying vec4 clipSpace;', // Take in clip space in frag

	'uniform mat4 projectionMatrix;',
	'uniform mat4 viewMatrix;',
	'uniform mat4 model;',
	
	// To calculate vector pointing from water, to camera
	'uniform vec3 cameraPosition;',
	// Output the vector to the camera position
	'varying vec3 toCameraVector;',
	
	// Lighting stuff
	'uniform vec3 lightPosition;',
	'varying vec3 fromLightToWaterVector;',

	'void main(void){',
		'vec4 worldPostion = model * vec4(waterPosition.x, 0.0, waterPosition.y, 1.0);',
		// Output the clipSpace coordinates of current vertex
		'clipSpace = projectionMatrix * viewMatrix * worldPostion;',
		'gl_Position = clipSpace;',
		'textureCoords = vec2(   (waterPosition.x/2.0)  + 0.5,   (waterPosition.y/2.0)  + 0.5) * tilingValue;',
		'toCameraVector = cameraPosition - worldPostion.xyz;',
		'fromLightToWaterVector = worldPostion.xyz - lightPosition;',
	'}'
	
].join('\n'));
gl.compileShader(waterVertexShader);
console.log("Water vertex shader compliation status: " + gl.getShaderInfoLog(waterVertexShader));