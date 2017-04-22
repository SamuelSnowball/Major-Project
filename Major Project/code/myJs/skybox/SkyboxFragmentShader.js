
/*
Skybox fragment shader source 
*/
var skyboxFragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(skyboxFragmentShader, [
	'precision highp float;',
	
	'varying vec3 skyboxTextureCoords;',

	'uniform samplerCube cubeMap;',
	'uniform samplerCube cubeMap2;', // for night
	'uniform float blendFactor;', // how much of each skybox texture to render
	// 0 = just render first texture, 1 = just second 

	'vec3 texture(samplerCube sampler, vec3 c){',
		'return textureCube(sampler, c).rgb;',
	'}',
	
	// blends skybox with fog colour
	'uniform vec4 skyColour;',
	'float lowerLimit = 0.0;',
	'float upperLimit = 20.0;',
	
	'void main(void){',
		'vec3 sample = texture(cubeMap, skyboxTextureCoords);',
		'vec3 sample2 = texture(cubeMap2, skyboxTextureCoords);',
		'vec3 finalSkyboxMixColour = mix(sample, sample2, blendFactor);',
		
		'float factor = (skyboxTextureCoords.y - lowerLimit) / (upperLimit - lowerLimit);',
		'factor = clamp(factor, 0.0, 1.0);',
		
		'gl_FragColor = mix(skyColour, vec4(finalSkyboxMixColour, 1.0), factor);',
	'}'
	
].join('\n'));
gl.compileShader(skyboxFragmentShader);
console.log("Skybox fragment shader compliation status: " + gl.getShaderInfoLog(skyboxFragmentShader));