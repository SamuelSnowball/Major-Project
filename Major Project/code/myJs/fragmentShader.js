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
	
	//For directional
	'uniform vec3 reverseLightDirection;',
	'uniform vec3 lightDirection;',
	
	//Specular, take in toCameraVector
	'varying vec3 toCameraVector;',
	
	'void main(){',
		//Normalize vectors to ensure size 1, so vector size doesnt affect .product
		//Directional
		'vec3 unitNormal = normalize(surfaceNormal);',
		'float uncheckedBrightness = dot(unitNormal, reverseLightDirection);',
		'float brightness = max(uncheckedBrightness, 0.5);', //gives ambient light and not below 0.2
		'vec3 diffuse = brightness * lightColour ;',
		
		//New specular, reverseLightDirection/unitLightVector might have to be re-reversed here
		//so passed in lightDirection
		'vec3 surfaceToLightDirection = normalize(lightDirection);', //don't need to normalize, its the direction not position
		'vec3 surfaceToCameraDirection = toCameraVector;',
		'vec3 halfVector = normalize(surfaceToLightDirection + surfaceToCameraDirection);',
		'float light = dot(surfaceNormal, surfaceToLightDirection);', //how close are they?
		'float specular = dot(surfaceNormal, halfVector);',
		
		//New code, from the old specular code, might break
		//Adds ability to change specular parameters
		//Now have the 2 vectors needed for dot product, to see how much of the reflected light is going into camera
		//also make sure its greater than 0
		'specular = max(specular, 0.0);',
		'float dampedFactor = pow(specular, shineDamper);',
		//Now to get final specular light value, multiply by specular light by the light colour
		'vec3 finalSpecular = dampedFactor *  reflectivity * lightColour;',
		
		'gl_FragColor = vec4(diffuse, 1.0) * texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));',// + vec4(finalSpecular, 1.0);',
		
		//Now add the specular light
		'gl_FragColor.rgb *= light;',
		'gl_FragColor.rgb += finalSpecular;', //was just specular
		
	'}'
].join('\n'));
gl.compileShader(fragmentShader);
console.log("Fragment shader compliation status: " + gl.getShaderInfoLog(fragmentShader));