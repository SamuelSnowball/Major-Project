
/*
Code for water fragment shader
*/
var waterFragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(waterFragmentShader, [
	'precision highp float;',
	
	'varying vec2 textureCoords;',
	'varying vec4 clipSpace;',
	
	// Want to sample the: reflectionTexture, refractionTexture, dudvMap, normalMap
	'uniform sampler2D reflectionTextureSampler;',
	'uniform sampler2D refractionTextureSampler;',
	'uniform sampler2D dudvMapSampler;',
	'uniform sampler2D normalMapSampler;',
	
	// Water moving effect, offset for sampling dudv map
	// Change the offset over time
	'uniform float waveStrength;',
	'uniform float moveFactor;',
	
	// In from vertex
	'varying vec3 toCameraVector;',
	
	// Lighting info
	'uniform vec3 lightColour;',
	'varying vec3 fromLightToWaterVector;',
	'float shineDamper = 20.0;', 
	'uniform float reflectivity;',

	'void main(void){',
		
		// Need to convert clipSpace to NDC, using perspective division
		// Divide by 2.0. then add 0.5 to get into texture coord systemLanguage
		'vec2 ndc = (clipSpace.xy / clipSpace.w) / 2.0 + 0.5;',
		
		'vec2 refractTextureCoords = vec2(ndc.x, ndc.y);',
		'vec2 reflectTextureCoords = vec2(ndc.x, -ndc.y);', // negative because reflection
		
		// Samples dudv map once, then uses then as distortedTexCoords, which is used to sample dudv map again
		// can also use to sample the normal map
		'vec2 distortedTexCoords = texture2D(dudvMapSampler, vec2(textureCoords.x + moveFactor, textureCoords.y)).rg*0.1;',
		'distortedTexCoords = textureCoords + vec2(distortedTexCoords.x, distortedTexCoords.y+moveFactor);',
		'vec2 totalDistortion = (texture2D(dudvMapSampler, distortedTexCoords).rg * 2.0 - 1.0) * waveStrength;',
		
		// Add distortion onto the texture coordinates
		'refractTextureCoords += totalDistortion;',
		'refractTextureCoords = clamp(refractTextureCoords, 0.001, 0.999);',
		
		'reflectTextureCoords += totalDistortion;',
		'reflectTextureCoords.x = clamp(reflectTextureCoords.x, 0.001, 0.999);', 
		'reflectTextureCoords.y = clamp(reflectTextureCoords.y, -0.999, -0.001);', // flipped because reflection
		
		'vec4 reflectColour = texture2D(reflectionTextureSampler, reflectTextureCoords);',
		'vec4 refractColour = texture2D(refractionTextureSampler, refractTextureCoords);',
		
		// First normalize toCameraVector, as dot product requires it to be unit
		'vec3 viewVector = normalize(toCameraVector);',
		'float refractiveFactor = dot(viewVector, vec3(0.0, 1.0, 0.0));',
		// Use this refractiveFactor to mix the colours, rather than 0.5
		// Change how reflective the water is, raise the refractiveFactor to a number
		// Higher the number = the more reflective
		'refractiveFactor = pow(refractiveFactor, 1.0);',
		
		// Sample normal map, sampling at distortedTexCoords, as used for dudv
		'vec4 normalMapCoords = texture2D(normalMapSampler, distortedTexCoords);',
		// Extract the normal, from the normal map colour
		'vec3 normal = vec3(normalMapCoords.r * 2.0 - 1.0, normalMapCoords.b, normalMapCoords.g * 2.0 - 1.0);',
		// normalize to make unit vector
		'normal = normalize(normal);',
		
		'vec3 reflectedLight = reflect(normalize(fromLightToWaterVector), normal);',
		'float specular = max(dot(reflectedLight, viewVector), 0.0);',
		'specular = pow(specular, shineDamper);',
		'vec3 specularHighlights = lightColour * specular * reflectivity;',
		
		'gl_FragColor = mix(reflectColour, refractColour, refractiveFactor);',
		'gl_FragColor = mix(gl_FragColor, vec4(0.0, 0.3, 0.7, 1.0), 0.2) + vec4(specularHighlights, 0.0);',
	'}'
].join('\n'));
gl.compileShader(waterFragmentShader);
console.log("Water fragment shader compliation status: " + gl.getShaderInfoLog(waterFragmentShader));