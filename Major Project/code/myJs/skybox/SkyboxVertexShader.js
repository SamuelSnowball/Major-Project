 
/*
Skybox vertex shader source 
*/
var skyboxVertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(skyboxVertexShader, [
	'attribute vec3 skyboxPosition;',
	'varying vec3 skyboxTextureCoords;',

	'uniform mat4 projectionMatrix;',
	'uniform mat4 viewMatrix;',
	
	// Don't want to apply translation to the skybox,
	// Keep it at the max clip space coordinates
	// But want to keep the rotation
	'void main(void){',
		'gl_Position = projectionMatrix * viewMatrix * vec4(skyboxPosition, 1.0); ',
		'skyboxTextureCoords = skyboxPosition;',
	'}'
	
].join('\n'));
gl.compileShader(skyboxVertexShader);
console.log("Skybox vertex shader compliation status: " + gl.getShaderInfoLog(skyboxVertexShader));