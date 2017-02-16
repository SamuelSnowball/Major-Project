/*
Vertex
*/
var vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, [
	'attribute vec3 position;',
	'attribute vec2 aTextureCoord;',
	'varying highp vec2 vTextureCoord;',
	'uniform mat4 model;',
	'uniform mat4 projection;',
	'void main(){',
		'gl_Position = projection * model * vec4(position, 1.0);',
		'',
		'gl_PointSize = 5.0;',
		'',
		//'gl_Position = vec4(position, 1);',
		'vTextureCoord = aTextureCoord;',
	'}'
].join('\n'));
gl.compileShader(vertexShader);
console.log("Vertex shader compliation status: " + gl.getShaderInfoLog(vertexShader));