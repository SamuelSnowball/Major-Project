/*
Fragment
want shader to use high precision on floats
have to use medium for some browsers
*/
var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, [
	'precision highp float;',
	'varying vec3 vertexColor;',
	'void main(){',
		'gl_FragColor = vec4(vertexColor, 1);',
	'}'
].join('\n'));
gl.compileShader(fragmentShader);
console.log("Fragment shader compliation status: " + gl.getShaderInfoLog(fragmentShader));