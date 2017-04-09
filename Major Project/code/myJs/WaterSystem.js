
/*
The file includes code for:
	Reflection frame buffer / texture
	Refraction frame buffer / texture
	
	WaterVertexShader
	WaterFragmentShader
	Creating and linking shaders into the water program
	
	Rendering the scene to the reflection and refraction textures
	Applying those textures to a water quad
	
	And finally rendering the water quad
*/
function WaterSystem(){

	var waterHeight = 0;

	/*
	Frame buffer code
	*/
	var reflectionFrameBuffer;	
	var reflectionTexture;
	var reflectionDepthBuffer;
		
	var refractionFrameBuffer;
	var refractionTexture;
	var refractionDepthBuffer;

	var REFLECTION_WIDTH = 512;
	var REFLECTION_HEIGHT = 512;
	
	var REFRACTION_WIDTH = 512;
	var REFRACTION_HEIGHT = 512;
	
	setupReflectionFrameBuffer();
	setupRefractionFrameBuffer();

	function setupReflectionFrameBuffer(){
		reflectionFrameBuffer = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, reflectionFrameBuffer);

		reflectionTexture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, reflectionTexture);
		// null at the end of this means, we don't have any data to copy yeet
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, REFLECTION_WIDTH, REFLECTION_HEIGHT, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, reflectionTexture, 0);
		
		reflectionDepthBuffer = gl.createRenderbuffer();
		gl.bindRenderbuffer(gl.RENDERBUFFER, reflectionDepthBuffer);
		gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, REFLECTION_WIDTH, REFLECTION_HEIGHT);
		gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, reflectionDepthBuffer);	

		// Reset buffers to default
		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.bindRenderbuffer(gl.RENDERBUFFER, null);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.viewport(0, 0, window.innerWidth, window.innerHeight);
	}

	function setupRefractionFrameBuffer(){
		refractionFrameBuffer = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, refractionFrameBuffer);
		
		refractionTexture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, refractionTexture);
		// null at the end of this means, we don't have any data to copy yeet
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, REFRACTION_WIDTH, REFRACTION_HEIGHT, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, refractionTexture, 0);
		
		refractionDepthBuffer = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, refractionDepthBuffer);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, REFRACTION_WIDTH, REFRACTION_HEIGHT, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, refractionDepthBuffer, 0);
		
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.viewport(0, 0, window.innerWidth, window.innerHeight);
	}
	
	
	
	// Need shaders as well
	var waterVertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(waterVertexShader, [
		'attribute vec2 waterPosition;',
		
		// Out the texture coordinates from vertex shader
		'varying vec2 textureCoords;',
		'float tilingValue = 10.0;',
		
		'varying vec4 clipSpace;', // Take in clip space in frag

		'uniform mat4 projectionMatrix;',
		'uniform mat4 viewMatrix;',
		'uniform mat4 model;',
		
		// To calculate vector pointing from water, to camera
		'uniform vec3 cameraPosition;',
		// Output the vector to the camera position
		'varying vec3 toCameraVector;',
		
		// Lighting stuff
		'uniform vec3 lightPosition;',
		'varying vec3 fromLightToWaterVector;',

		'void main(void){',
			'vec4 worldPostion = model * vec4(waterPosition.x, 0.0, waterPosition.y, 1.0);',
			//'vec4 positionRelativeToCamera = viewMatrix * worldPostion;',
			// Output the clipSpace coordinates of current vertex
			'clipSpace = projectionMatrix * viewMatrix * worldPostion;',
			'gl_Position = clipSpace;',
			'textureCoords = vec2(   (waterPosition.x/2.0)  + 0.5,   (waterPosition.y/2.0)  + 0.5) * tilingValue;',
			'toCameraVector = cameraPosition - worldPostion.xyz;',
			'fromLightToWaterVector = worldPostion.xyz - lightPosition;',
		'}'
		
	].join('\n'));
	gl.compileShader(waterVertexShader);
	console.log("Water vertex shader compliation status: " + gl.getShaderInfoLog(waterVertexShader));
	
	var waterFragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(waterFragmentShader, [
		'precision highp float;',
		
		'varying vec2 textureCoords;',
		'varying vec4 clipSpace;',
		
		// Want to sample the reflectionTexture and refractionTexture
		'uniform sampler2D reflectionTextureSampler;',
		'uniform sampler2D refractionTextureSampler;',
		'uniform sampler2D dudvMapSampler;',
		'uniform sampler2D normalMapSampler;',
		
		// Water moving effect, offset for sampling dudv map
		// Change the offset over time
		'float waveStrength = 0.01;',
		'uniform float moveFactor;',
		
		// In from vertex
		'varying vec3 toCameraVector;',
		
		// Lighting info
		'uniform vec3 lightColour;',
		'varying vec3 fromLightToWaterVector;',
		'float shineDamper = 20.0;', // Could load from shader, for user interaction, cba for now
		'float reflectivity = 0.6;',

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
			
			//'vec2 distortion1 = (texture2D(dudvMapSampler, vec2(textureCoords.x + moveFactor, textureCoords.y)).rg * 2.0 - 1.0) * waveStrength;',
			// Sample it again, and move it in completely different direction, realistic
			//'vec2 distortion2 = (texture2D(dudvMapSampler, vec2(-textureCoords.x + moveFactor, textureCoords.y + moveFactor)).rg * 2.0 - 1.0) * waveStrength;',
			// Add together
			//'vec2 totalDistortion = distortion1 + distortion2;',
			
			'refractTextureCoords += totalDistortion;',
			'refractTextureCoords = clamp(refractTextureCoords, 0.001, 0.999);',
			
			'reflectTextureCoords += totalDistortion;',
			'reflectTextureCoords.x = clamp(reflectTextureCoords.x, 0.001, 0.999);', // ??
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
			
			
			/*
			// Sample dudv map
			'vec2 distortion1 = (texture2D(dudvMapSampler, vec2(textureCoords.x + moveFactor, textureCoords.y)).rg * 2.0 - 1.0) * waveStrength;',
			// Sample it again, and move it in completely different direction, realistic
			'vec2 distortion2 = (texture2D(dudvMapSampler, vec2(-textureCoords.x + moveFactor, textureCoords.y + moveFactor)).rg * 2.0 - 1.0) * waveStrength;',
			// Add together
			'vec2 totalDistortion = distortion1 + distortion2;',
			
			'refractTextureCoords += totalDistortion;',
			'refractTextureCoords = clamp(refractTextureCoords, 0.001, 0.999);',
			
			'reflectTextureCoords += totalDistortion;',
			'reflectTextureCoords.x = clamp(reflectTextureCoords.x, 0.001, 0.999);', // ??
			'reflectTextureCoords.y = clamp(reflectTextureCoords.y, -0.999, -0.001);', // flipped because reflection
			
			'vec4 reflectColour = texture2D(reflectionTexture, vec2(reflectTextureCoords.s, reflectTextureCoords.t));',
			'vec4 refractColour = texture2D(refractionTexture, vec2(refractTextureCoords.s, refractTextureCoords.t));',
			
			// Mix factor 0.5, mix them equally
			'gl_FragColor = mix(reflectColour, refractColour, 0.5);',
			// Add blue tint to water colour, add 0.2 of it
			'gl_FragColor = mix(gl_FragColor, vec4(0.0, 0.3, 0.7, 1.0), 0.2);',
			*/
		'}'
	].join('\n'));
	gl.compileShader(waterFragmentShader);
	console.log("Water fragment shader compliation status: " + gl.getShaderInfoLog(waterFragmentShader));
	
	var waterProgram = gl.createProgram();
	gl.attachShader(waterProgram, waterVertexShader);
	gl.attachShader(waterProgram, waterFragmentShader);
	gl.linkProgram(waterProgram);
	console.log("waterProgram status: " + gl.getProgramInfoLog(waterProgram));

	gl.useProgram(waterProgram);

		var waterPositionAttribLocation = gl.getAttribLocation(waterProgram, 'waterPosition');
		gl.enableVertexAttribArray(waterPositionAttribLocation);
		
		var waterCameraPositionLocation = gl.getUniformLocation(waterProgram, 'cameraPosition');
		
		var waterViewMatrixLocation = gl.getUniformLocation(waterProgram, 'viewMatrix');
		gl.uniformMatrix4fv(waterViewMatrixLocation, false, new Float32Array(viewMatrix));
		
		var waterProjectionLocation = gl.getUniformLocation(waterProgram, 'projectionMatrix');
		gl.uniformMatrix4fv(waterProjectionLocation, false, new Float32Array(projectionMatrix));
		
		var waterModelLocation = gl.getUniformLocation(waterProgram, 'model');
		gl.uniformMatrix4fv(waterModelLocation, false, new Float32Array(fullTransforms));
		
		//lightPosition, lightColour
		var lightPositionAttribLocation = gl.getUniformLocation(waterProgram, 'lightPosition');
		gl.enableVertexAttribArray(lightPositionAttribLocation);
		
		var lightColourAttribLocation = gl.getUniformLocation(waterProgram, 'lightColour');
		gl.enableVertexAttribArray(lightColourAttribLocation);
		
		var waterMoveFactorLocation = gl.getUniformLocation(waterProgram, 'moveFactor');
	gl.useProgram(program);
	
	this.renderToRefractionBuffer = function(){

		gl.bindFramebuffer(gl.FRAMEBUFFER, refractionFrameBuffer);
			// Want to render everything under the water, normal is pointing down
			clipPlane = [0, -1, 0, -waterHeight]; // last param is water height
			gl.clearColor(0.8, 0.8, 0.8, 0.7);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
			gl.viewport(0, 0, 512, 512);
				terrain.render(); 
				rockGenerator.renderInstancedRocks();
				//particleSystem.render(); 
				lander.render();
				skybox.render(viewMatrix, projectionMatrix);
		// Unbinds 
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.viewport(0, 0, window.innerWidth, window.innerHeight);

	}

	/*
	To create illusion of reflection texture
	Need to move camera under the water, before rendering the reflection texture

	The camera should move down by:
		its original distance above the water * 2
	The pitch of the camera also needs to be inverted
	*/
	this.renderToReflectionBuffer = function(){
	
		/*
		Want to render scene to a texture (frame buffer), so bind it
		Clear it
		Render to the texture (frame buffer)
		Then unbind it
		
		Then later on, we can render a square with that texture
		
		Make sure this gets rendered to something that the original scene doesn't render
		*/
		gl.bindFramebuffer(gl.FRAMEBUFFER, reflectionFrameBuffer);

			// Calculate distance we want to move camera down by
			// And invert pitch
			var distance = 2 * (cameraPosition[1] + waterHeight); // + ing, because water is negative, so --5 and breaks
			cameraPosition[1] -= distance;
			cameraTarget[1] = -cameraTarget[1];
			currentTexture = mapTexture;
			camera.updateCamera();
			
			// Want to render everything above the waters surface, so normal as 0,1,0
			// Horizontal plane, pointing upwards 
			clipPlane = [0, 1, 0, -waterHeight]; // last param is water height
			gl.clearColor(0.8, 0.8, 0.8, 0.7);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
			gl.viewport(0, 0, 512, 512);
				terrain.render(); 
				rockGenerator.renderInstancedRocks();
				//particleSystem.render(); 
				lander.render();
				skybox.render(viewMatrix, projectionMatrix);
				
			// Reset camera
			cameraTarget[1] = -cameraTarget[1];
			camera.updateCamera();			
			cameraPosition[1] += distance;
			camera.updateCamera();
			
		// Unbinds 
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.viewport(0, 0, window.innerWidth, window.innerHeight);
	}

	var waterVertexPositionBuffer;
	var waterVertices = [];
	var moveFactor = 0;

	var waterUVBuffer;
	
	setup();
	
	function setup(){
		gl.useProgram(waterProgram);
		waterVertexPositionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, waterVertexPositionBuffer);
		// Setting x and z positions, y is set to 0 in vertex shader
		waterVertices = [
					// uv coordinates
					
			-1, -1, //0, 0
			-1, 1,  //0, 1
			1, -1,  //1, 0
			1, -1,  //1, 0
			-1, 1,  //0, 1
			1, 1    //1, 1
		];
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(waterVertices), gl.DYNAMIC_DRAW);
		gl.vertexAttribPointer(waterPositionAttribLocation, 2, gl.FLOAT, false, 0, 0);
		

		
		gl.useProgram(program);
	}

	function updateWaterAttributesAndUniforms(){
	
		// Load camera position
		gl.uniform3fv(waterCameraPositionLocation, cameraPosition);
		
		/*
		Remember u dont have a light position.. just a direction?
		Remove the position stuff
		
		But could add a sun, set that as position, effort
		*/
		// Load lighting info
		
		// Just position the light as if it matters
		gl.uniform3fv(lightColourAttribLocation, lightColour);
		
		//work out light position as hardcoded clipspace coordiantes, always the same
		//like the cube texture coordinates
		gl.uniform3fv(lightPositionAttribLocation, [4000, 500, 0]);
		
		//gl.uniform3fv(lightColourAttribLocation, lightColour);
		//gl.uniform1f(shineDamperAttribLocation, currentTexture.getTextureAttribute.shineDamper);
		//gl.uniform1f(reflectivityAttribLocation, currentTexture.getTextureAttribute.reflectivity);
	
	
	
	
		moveFactor += Date.now() * 0.0000000000000009; // dont ask....
		moveFactor %= 1; // loops when reaches 0
		gl.uniform1f(waterMoveFactorLocation, moveFactor);
		
		fullTransforms = m4.multiply(position, rotateZ);
		fullTransforms = m4.multiply(fullTransforms, rotateY);
		fullTransforms = m4.multiply(fullTransforms, rotateX);
		fullTransforms = m4.multiply(fullTransforms, scale);

		gl.uniformMatrix4fv(waterModelLocation, false, new Float32Array(fullTransforms));
		gl.uniformMatrix4fv(waterViewMatrixLocation, false, new Float32Array(viewMatrix));
		gl.uniformMatrix4fv(waterProjectionLocation, false, new Float32Array(projectionMatrix));
	}
	
	/*
	Maybe it needs its own set of matrices?
	*/
	this.render = function(){
		gl.useProgram(waterProgram);
		gl.enableVertexAttribArray(waterPositionAttribLocation);

		var xScale = 256;
		var zScale = 256;
		
		scale = m4.scaling(xScale, 1, zScale);
		rotateX = m4.xRotation(0);
		rotateY = m4.yRotation(0);
		rotateZ = m4.zRotation(0);
		position = m4.translation(xScale, waterHeight, zScale);
		
		updateWaterAttributesAndUniforms();
		
		
		// Reflection texture sampled from unit 0
		gl.activeTexture(gl.TEXTURE0);
		gl.uniform1i(gl.getUniformLocation(waterProgram, "reflectionTextureSampler"), 0);
		gl.bindTexture(gl.TEXTURE_2D, reflectionTexture);
		
		// Refraction texture sampled from unit 1
		gl.activeTexture(gl.TEXTURE1); 
		gl.uniform1i(gl.getUniformLocation(waterProgram, "refractionTextureSampler"), 1);
		gl.bindTexture(gl.TEXTURE_2D, refractionTexture);		
		
		// dudvMap texture sampled from unit 2
		gl.activeTexture(gl.TEXTURE2); 
		gl.uniform1i(gl.getUniformLocation(waterProgram, "dudvMapSampler"), 2);
		gl.bindTexture(gl.TEXTURE_2D, WATER_DUDV_MAP_TEXTURE.getTextureAttribute.texture);			

		// normal map sampled from unit 3
		gl.activeTexture(gl.TEXTURE3);
		gl.uniform1i(gl.getUniformLocation(waterProgram, "normalMapSampler"), 3);
		gl.bindTexture(gl.TEXTURE_2D, WATER_NORMAL_MAP_TEXTURE.getTextureAttribute.texture);			

		
		gl.bindBuffer(gl.ARRAY_BUFFER, waterVertexPositionBuffer);
		gl.vertexAttribPointer(waterPositionAttribLocation, 2, gl.FLOAT, false, 0, 0);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 6);
		
		
		
		gl.useProgram(program);
	}
	
}