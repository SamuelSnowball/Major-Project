
/**
 * The file includes code for:
 * 
 * Creation of reflection frame buffer and its texture 
 * Creation of refraction frame buffer and its texture
 * 
 * WaterVertexShader
 * WaterFragmentShader
 * Creating and linking shaders into the water program
 * 
 * Rendering the scene to the reflection and refraction textures and applying those textures to a water quad
 * 
 * And finally rendering the water quad
 * 
 * @class WaterSystem
*/
function WaterSystem(){

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
	
	var waterVertexPositionBuffer;
	var waterVertices = [];
	var moveFactor = 0;
	
	var waterHeight = 0;
	var waterReflectivity = 0.0;
	var waterReflectivityIncrement = 0.001; // how fast to increment/decrement the waterReflectivity based on time of day
	
	/**
	@constructor
	*/
	setupReflectionFrameBuffer();
	setupRefractionFrameBuffer();
	setupWaterQuad();
	
	this.get = {
		/**
		@method get.waterReflectivity
		@public
		@return {float} the waters reflectivity
		*/
		get waterReflectivity(){
			return waterReflectivity;
		},
		
		/**
		@method get.waterReflectivityIncrement
		@public
		@return {float} how fast the waterReflectivity changes from day/night
		*/
		get waterReflectivityIncrement(){
			return waterReflectivityIncrement;
		}
	};
	
	this.set = {
		/**
		@method set.waterReflectivity
		@public
		@param x {float} the reflectivity to set
		*/
		set waterReflectivity(x){
			waterReflectivity = x;
		}
	};
	
	/**
	Sets up the reflectionFrameBuffer
	Creates the reflectionTexture
	Creates the reflectionDepthBuffer
	
	@method setupReflectionFrameBuffer
	@private
	*/
	function setupReflectionFrameBuffer(){
		reflectionFrameBuffer = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, reflectionFrameBuffer);

		reflectionTexture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, reflectionTexture);
		// null at the end of this means, we don't have any data to copy yet
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
		
		// @Test
		if(useTests) test_setupReflectionFrameBuffer();
	}

	/**
	Sets up the refractionFrameBuffer.
	Creates the refractionTexture
	Creates the refractionDepthBuffer
	
	@method setupRefractionFrameBuffer
	@private
	*/
	function setupRefractionFrameBuffer(){
		refractionFrameBuffer = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, refractionFrameBuffer);
		
		refractionTexture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, refractionTexture);
		// null at the end of this means, we don't have any data to copy yet
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
		
		// @Test
		if(useTests) test_setupRefractionFrameBuffer();		
	}
	
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

		var lightPositionAttribLocation = gl.getUniformLocation(waterProgram, 'lightPosition');
		gl.enableVertexAttribArray(lightPositionAttribLocation);
		
		var lightColourAttribLocation = gl.getUniformLocation(waterProgram, 'lightColour');
		gl.enableVertexAttribArray(lightColourAttribLocation);
		
		var waterMoveFactorLocation = gl.getUniformLocation(waterProgram, 'moveFactor');
		
		var waterReflectivityLocation = gl.getUniformLocation(waterProgram, 'reflectivity');
		
		var waterWaveStrengthLocation = gl.getUniformLocation(waterProgram, 'waveStrength');
		
		// @Test
		if(useTests) test_waterShaderLocationVariables();
		
	gl.useProgram(mainProgram.get.program);
	
	/**
	Renders everything under the water height to the refractionFrameBuffer
	
	@method renderToRefractionBuffer
	@public
	*/
	this.renderToRefractionBuffer = function(){
		gl.bindFramebuffer(gl.FRAMEBUFFER, refractionFrameBuffer);
			// Want to render everything under the water, normal is pointing down
			clipPlane = [0, -1, 0, -waterHeight]; // last param is water height
			gl.clearColor(0.8, 0.8, 0.8, 0.7);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
			gl.viewport(0, 0, 512, 512);
				terrain.render(); 
				rockGenerator.renderInstancedRocks();
				skybox.render(viewMatrix, projectionMatrix);
		// Unbinds, reset viewport
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.viewport(0, 0, window.innerWidth, window.innerHeight);
	}

	/**
	Renders the scene to the reflectionFrameBuffer
	
	To create illusion of reflection texture
	Need to move camera under the water, before rendering the reflection texture

	The camera should move down by:
		its original distance above the water * 2
	The pitch of the camera also needs to be inverted
	
	Want to render scene to a texture (frame buffer), so bind it
	Clear it
	Render to the texture (frame buffer)
	Then unbind it
		
	Then later on, we can render a square with that texture
		
	Make sure this gets rendered to something that the original scene doesn't render
	
	@method renderToReflectionBuffer
	@public
	*/
	this.renderToReflectionBuffer = function(){
		gl.bindFramebuffer(gl.FRAMEBUFFER, reflectionFrameBuffer);
			// Calculate distance we want to move camera down by
			// And invert pitch
			var distance = 2 * (camera.get.y + waterHeight); // + ing, because water is negative, so --5 and breaks
			camera.set.y = camera.get.y - distance;
			camera.set.targetY = -camera.get.targetY;
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
				skybox.render(viewMatrix, projectionMatrix);
				
			// Reset camera
			camera.set.targetY = -camera.get.targetY;
			camera.updateCamera();			
			camera.set.y = camera.get.y + distance;
			camera.updateCamera();
			
		// Unbinds 
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.viewport(0, 0, window.innerWidth, window.innerHeight);
	}
	
	/**
	Builds the water quad
	
	@method setupWaterQuad
	@private
	*/
	function setupWaterQuad(){
		gl.useProgram(waterProgram);
		
		waterVertexPositionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, waterVertexPositionBuffer);
		
		// Setting x and z positions of water only
		// The y position is set to 0 in vertex shader
		waterVertices = [
			-1, -1,
			-1,  1, 
			 1, -1, 
			 1, -1, 
			-1,  1, 
			 1,  1   
		];
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(waterVertices), gl.DYNAMIC_DRAW);
		gl.vertexAttribPointer(waterPositionAttribLocation, 2, gl.FLOAT, false, 0, 0);

		gl.useProgram(mainProgram.get.program);
	}

	/**
	Loads in variables into the water shader:
		cameraPosition
		lightColour
		lightPosition
		moveFactor
		waterReflectivity
		waterWaveStrength
		fullTransforms,
		view & projectionMatrix
		
	This method also calculates and moves the sun position, to match the rotating skybox
	
	@method updateWaterAttributesAndUniforms
	@private
	*/
	function updateWaterAttributesAndUniforms(){
	
		// Pass in camera position
		gl.uniform3fv(waterCameraPositionLocation, camera.get.position);
		
		// Pass in lighting colour
		gl.uniform3fv(lightColourAttribLocation, lightColour);
		
		// The rotation matrix to apply to the suns position
		var rotationMatrix = [];
		m4.yRotation(-skybox.get.currentRotation + (-Math.PI /4 - Math.PI / 4), rotationMatrix);
		
		// The original position of the sun
		var lightPosition = [
			camera.get.x + 512, 
			camera.get.y + 25, 
			camera.get.z + 512,
			0
		];
		
		var finalSunPosition = [0, 0, 0, 0];
		
		// Times the lightPosition vector by rotation matrix,
		// to reposition the sun as the skybox rotates
		finalSunPosition[0] = rotationMatrix[0] * lightPosition[0] +
							  rotationMatrix[1] * lightPosition[1] + 
							  rotationMatrix[2] * lightPosition[2] +
							  rotationMatrix[3] * lightPosition[3];
						
		finalSunPosition[1] = rotationMatrix[4] * lightPosition[0] +
							  rotationMatrix[5] * lightPosition[1] + 
							  rotationMatrix[6] * lightPosition[2] + 
							  rotationMatrix[7] * lightPosition[3];

		finalSunPosition[2] = rotationMatrix[8] * lightPosition[0] +
							  rotationMatrix[9] * lightPosition[1] + 
							  rotationMatrix[10] * lightPosition[2] +	
							  rotationMatrix[11] * lightPosition[3];

		finalSunPosition[3] = rotationMatrix[12] * lightPosition[0] +
							  rotationMatrix[13] * lightPosition[1] + 
							  rotationMatrix[14] * lightPosition[2] +	
							  rotationMatrix[15] * lightPosition[3];						
		
		// Pass in the final sun position
		gl.uniform3fv(lightPositionAttribLocation, [finalSunPosition[0], finalSunPosition[1], finalSunPosition[2]] );
	
		// Pass in how much the water should move
		moveFactor += Date.now() * 0.0000000000000009; // dont ask....
		moveFactor %= 1; // loops when reaches 0
		gl.uniform1f(waterMoveFactorLocation, moveFactor);
		
		// Pass in waterReflectivity to shader
		gl.uniform1f(waterReflectivityLocation, waterReflectivity);
		
		// Pass in wave strength, get it from the GUI
		gl.uniform1f(waterWaveStrengthLocation, myGUI.get.ui_water_strength);
		
		fullTransforms = m4.multiply(position, rotateZ);
		fullTransforms = m4.multiply(fullTransforms, rotateY);
		fullTransforms = m4.multiply(fullTransforms, rotateX);
		fullTransforms = m4.multiply(fullTransforms, scale);

		gl.uniformMatrix4fv(waterModelLocation, false, new Float32Array(fullTransforms));
		gl.uniformMatrix4fv(waterViewMatrixLocation, false, new Float32Array(viewMatrix));
		gl.uniformMatrix4fv(waterProjectionLocation, false, new Float32Array(projectionMatrix));
	}
	
	/**
	Renders the water quad with the textures sampled from the:
		reflectionFrameBuffer, 
		refractionFrameBuffer,
		waterDudvMap
		waterNormalMap
		
	@method render
	@public
	*/
	this.render = function(){
		gl.useProgram(waterProgram);
		gl.enableVertexAttribArray(waterPositionAttribLocation);

		// Base water size off the map size
		var xScale = terrain.get.getNumberQuadrantRows * terrain.get.getQuadrantRowSize;
		var zScale = terrain.get.getNumberQuadrantColumns * terrain.get.getQuadrantRowSize;
		
		// Keep scale at 384 max,
		// Position the water around the player, 
		
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

		gl.useProgram(mainProgram.get.program);
	}
	
	/*
	TESTING FUNCTIONS BELOW
	*/
	
	/**
	Test the water reflection frame buffer is an WebGLFrameBuffer object
	
	@method test_setupReflectionFrameBuffer
	@private
	*/
	function test_setupReflectionFrameBuffer(){
		if(gl.isFramebuffer(reflectionFrameBuffer)){
			 // It's a valid frame buffer object
		}else{
			console.error("Testing water reflection frame buffer, its not a FBO!: " + reflectionFrameBuffer);
		}
	}
	
	/**
	Test the water refraction frame buffer is an WebGLFrameBuffer object
	
	@method test_setupRefractionFrameBuffer
	@private
	*/
	function test_setupRefractionFrameBuffer(){
		if(gl.isFramebuffer(refractionFrameBuffer)){
			 // It's a valid frame buffer object
		}else{
			console.error("Testing water refraction frame buffer, its not a FBO!: " + refractionFrameBuffer);
		}
	}
	
	/**
	Checks the location variables from the shaders are valid
	Check the attribute locations are ints,
	And check the uniform locations are WebGLUniformLocation objects
	
	@method test_waterShaderLocationVariables
	@private
	*/
	function test_waterShaderLocationVariables(){
		test_isNaN("waterPositionAttribLocation", waterPositionAttribLocation);
		test_isWebGLUniformLocation("waterCameraPositionLocation", waterCameraPositionLocation);
		test_isWebGLUniformLocation("waterViewMatrixLocation", waterViewMatrixLocation);
		test_isWebGLUniformLocation("waterProjectionLocation", waterProjectionLocation);
		test_isWebGLUniformLocation("waterModelLocation", waterModelLocation);
		test_isWebGLUniformLocation("lightPositionAttribLocation", lightPositionAttribLocation);
		test_isWebGLUniformLocation("lightColourAttribLocation", lightColourAttribLocation);
		test_isWebGLUniformLocation("waterMoveFactorLocation", waterMoveFactorLocation);
		test_isWebGLUniformLocation("waterReflectivityLocation", waterReflectivityLocation);
		test_isWebGLUniformLocation("waterWaveStrengthLocation", waterWaveStrengthLocation);
	}
	
	/**
	Tests if passed in value is NaN
	
	@method test_isNaN
	@private
	@param name {string} the name of the attribute to test, so we can print an error
	@param value {int} the value to test
	*/
	function test_isNaN(name, value){
		if(isNaN(value)){
			console.error("In test_waterShaderLocationVariables, " + name + " was NaN!");
		}
	}
	
	/**
	Tests if location is a WebGLUniformLocation
	
	@method test_isWebGLUniformLocation
	@private
	@param name {string} the name of the attribute to test, so we can print an error
	@param location {buffer} the location value to test
	*/
	function test_isWebGLUniformLocation(name, location){
		if(!location instanceof WebGLUniformLocation){
			console.error("In test_isWebGLUniformLocation: " + name + ", is not a WebGLUniformLocation");
		}
	}
	
}