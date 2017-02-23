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
	'uniform float shineDamper;',
	'uniform float reflectivity;',
	
	
	'varying vec3 surfaceNormal;', //varying is in for frag shader
	'varying vec3 toLightVector;', //in
	
	//Specular, take in toCameraVector
	'varying vec3 toCameraVector;',
	
	'void main(){',
		//Normalize vectors to ensure size 1, so vector size doesnt affect .product
		'vec3 unitNormal = normalize(surfaceNormal);',
		'vec3 unitLightVector = normalize(toLightVector);',
		'float uncheckedBrightness = dot(unitNormal, unitLightVector);',
		
		//ensure .product result is between 0 and 1, sometimes returns negative, dont care
		//adding 0.1 as minimum makes ambient light
		'float brightness = max(uncheckedBrightness, 0.5);', //should be 0.0, will take whatever is higher
		'vec3 diffuse = brightness * lightColour * vec3(1,1,1);', //10,10,10 for extra intensity
		
		'vec3 unitVectorToCamera = normalize(toCameraVector);', //need to normalie italics
		'vec3 lightDirection = -unitLightVector;', //opposite of unitLightVector
		
		//now need to work out reflection vector
		//glsl has reflect function for us :)
		//takes in incoming vector and normal, outputs reflected light direction
		'vec3 reflectedLightDirection = reflect(lightDirection, unitNormal);',
		
		//Now have the 2 vectors needed for dot product, to see how much of the reflected light is going into camera
		//also make sure its greater than 0
		'float specularFactor = dot(reflectedLightDirection, unitVectorToCamera);',
		'specularFactor = max(specularFactor, 0.0);',
		//Apply damping factor
		'float dampedFactor = pow(specularFactor, shineDamper);',
		
		//Now to get final specular light value, multiply by specular light by the light colour
		'vec3 finalSpecular = dampedFactor *  reflectivity * lightColour;',
		//make specular into 4d vector, so rgba rather than rgb
		
		'gl_FragColor = vec4(diffuse, 1.0) * texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t)) + vec4(finalSpecular, 1.0);',
	'}'
].join('\n'));
gl.compileShader(fragmentShader);
console.log("Fragment shader compliation status: " + gl.getShaderInfoLog(fragmentShader));