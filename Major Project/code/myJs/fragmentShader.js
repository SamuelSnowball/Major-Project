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
	'uniform vec3 lightColour;',
	'varying vec3 surfaceNormal;', //varying is in for frag shader
	'varying vec3 toLightVector;', //in
	'void main(){',
		//Normalize vectors to ensure size 1, so vector size doesnt affect .product
		'vec3 unitNormal = normalize(surfaceNormal);',
		'vec3 unitLightVector = normalize(toLightVector);',
		'float uncheckedBrightness = dot(unitNormal, unitLightVector);',
		//ensure .product result is between 0 and 1, sometimes returns negative, dont care
		'float brightness = max(uncheckedBrightness, 0.0);', //should be 0.0, will take whatever is higher
		
		'vec3 diffuse = brightness * lightColour * vec3(10,10,10);', //10,10,10 for extra intensity
		'gl_FragColor = vec4(diffuse, 1.0) * texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));',
	'}'
].join('\n'));
gl.compileShader(fragmentShader);
console.log("Fragment shader compliation status: " + gl.getShaderInfoLog(fragmentShader));