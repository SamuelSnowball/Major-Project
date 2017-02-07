/*
Vertex
*/
var vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, [
	'attribute vec3 position;',
	'attribute vec3 color;', //why are there 2 colors? idk
	'varying vec3 vertexColor;',
	'uniform mat4 model;',
	'uniform mat4 projection;',
	'void main(){',
		'gl_Position = projection * model * vec4(position, 1.0);',
		//'gl_Position = vec4(position, 1);',
		'vertexColor = color;',
	'}'
].join('\n'));
gl.compileShader(vertexShader);
console.log("Vertex shader compliation status: " + gl.getShaderInfoLog(vertexShader));