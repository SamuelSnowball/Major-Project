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
	
	'varying vec3 surfaceNormal;', //varying is in for frag shader
	//Specular, take in toCameraVector
	'varying vec3 toCameraVector;',
	
	'uniform vec3 lightColour;',
	'uniform float shineDamper;',
	'uniform float reflectivity;',
	 //For directional
	'uniform vec3 reverseLightDirection;',
	'uniform vec3 lightDirection;',
	
	// Clip plane for water
	'uniform vec4 clipPlane;',
	'varying vec4 fragPosition;',
	
	//Fog
	'varying float visibility;',
	'uniform vec4 skyColour;',
	'uniform bool useFog;',
	
	'void main(){',
		//Normalize vectors to ensure size 1, so vector size doesnt affect .product
		//Directional
		'vec3 unitNormal = normalize(surfaceNormal);',
		'float uncheckedBrightness = dot(unitNormal, reverseLightDirection);',
		'float brightness = max(uncheckedBrightness, 0.5);', //gives ambient light and not below 0.5
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
		
		// Clip plane equation test, discard fragment if fails
		
		/*
		Cant use lessThan passing in 2 floats,
		Have to use vec2's at least
		
		So just use the float returned from dot, and add a 0, to make vec2
		*/
		
		'vec2 temp = vec2(dot(fragPosition, clipPlane), 0);',
		'vec2 zero = vec2(0, 0);',
		'bvec2 result = bvec2(lessThan(temp, zero));',
		
		// Don't care about result 1, thats just comparing 0 to 0
		'if( result[0] == true ){',
			'discard;',
		'}',
		
		'gl_FragColor = vec4(diffuse, 1.0) * texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));',
		
		//Add lighting 
		//'gl_FragColor.rgb *= light;',
		//'gl_FragColor.rgb += finalSpecular;',

		//Fog, mix the skyColour and colour of the object
		//min takes in 2 colours, 
		//make skyColour 4d first
		//2nd is the gl_FragColor (current fragment)
		
		'if(useFog){', //Check to see if we should use fog or not
			'gl_FragColor = mix(skyColour, gl_FragColor, visibility);',
		'}',
		'else{',
			'',
		'}',
	'}'
].join('\n'));
gl.compileShader(fragmentShader);
console.log("Fragment shader compliation status: " + gl.getShaderInfoLog(fragmentShader));