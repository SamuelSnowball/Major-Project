/*
Fragment
want shader to use high precision on floats
have to use medium for some browsers

No longer assigning color values to fragments color
The fragment color is computed by getting the texel,
(pixel within texture) that sampler says maps to fragments position
*/
var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, [
	'precision highp float;',
	'varying highp vec2 vTextureCoord;',
	'uniform sampler2D uSampler;',
	'void main(){',
		'gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));',
	'}'
].join('\n'));
gl.compileShader(fragmentShader);
console.log("Fragment shader compliation status: " + gl.getShaderInfoLog(fragmentShader));