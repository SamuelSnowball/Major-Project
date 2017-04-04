

var waterHeight = -5;

function WaterSystem(){
	
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

		'void main(void){',
			'vec4 worldPostion = model * vec4(waterPosition.x, 0.0, waterPosition.y, 1.0);', //needed for light and instancing
			'vec4 positionRelativeToCamera = viewMatrix * worldPostion;',
			// Output the clipSpace coordinates of current vertex
			'clipSpace = projectionMatrix * positionRelativeToCamera;',
			
			'gl_Position = clipSpace;',
			
			'textureCoords = vec2(waterPosition.x/2.0 + 0.5, waterPosition.y/2.0 + 0.5) * tilingValue;',
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
		'uniform sampler2D reflectionTexture;',
		'uniform sampler2D refractionTexture;',
		'uniform sampler2D dudvMap;',
		
		// Water moving effect, offset for sampling dudv map
		// Change the offset over time
		'uniform float moveFactor;',
		
		'float waveStrength = 0.2;',
		
		'void main(void){',
			
			// Need to convert clipSpace to NDC, using perspective division
			// Divide by 2.0. then add 0.5 to get into texture coord systemLanguage
			'vec2 ndc = (clipSpace.xy / clipSpace.w) / 2.0 + 0.5;',
			
			'vec2 refractTextureCoords = vec2(ndc.x, ndc.y);',
			'vec2 reflectTextureCoords = vec2(ndc.x, -ndc.y);', // negative because reflection
			
			// Sample dudv map
			'vec2 distortion1 = (texture2D(dudvMap, vec2(textureCoords.x + moveFactor, textureCoords.y)).rg * 2.0 - 1.0) * waveStrength;',
			// Sample it again, and move it in completely different direction, realistic
			'vec2 distortion2 = (texture2D(dudvMap, vec2(-textureCoords.x + moveFactor, textureCoords.y + moveFactor)).rg * 2.0 - 1.0) * waveStrength;',
			// Add together
			'vec2 totalDistortion = distortion1 + distortion2;',
			
			'refractTextureCoords += totalDistortion;',
			'refractTextureCoords = clamp(refractTextureCoords, 0.001, 0.999);',
			
			'reflectTextureCoords += totalDistortion;',
			'reflectTextureCoords.x = clamp(reflectTextureCoords.x, 0.001, 0.999);',
			'reflectTextureCoords.y = clamp(reflectTextureCoords.y, -0.999, -0.001);', // flipped because reflection
			
			'vec4 reflectColour = texture2D(reflectionTexture, vec2(reflectTextureCoords.s, reflectTextureCoords.t));',
			'vec4 refractColour = texture2D(refractionTexture, vec2(refractTextureCoords.s, refractTextureCoords.t));',
			
			// Mix factor 0.5, mix them equally
			'gl_FragColor = mix(reflectColour, refractColour, 0.5);',
			// Add blue tint to water colour, add 0.2 of it
			'gl_FragColor = mix(gl_FragColor, vec4(0.0, 0.3, 0.7, 1.0), 0.2);',
			
			
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
		var waterReflectionTextureLocation = gl.getUniformLocation(waterProgram, "reflectionTexture");
		var waterRefractionTextureLocation = gl.getUniformLocation(waterProgram, "refractionTexture");
		gl.enableVertexAttribArray(waterReflectionTextureLocation);
		gl.enableVertexAttribArray(waterRefractionTextureLocation);
		
		var waterPositionAttribLocation = gl.getAttribLocation(waterProgram, 'waterPosition');
		gl.enableVertexAttribArray(waterPositionAttribLocation);
		
		var waterViewMatrixLocation = gl.getUniformLocation(waterProgram, 'viewMatrix');
		gl.uniformMatrix4fv(waterViewMatrixLocation, false, new Float32Array(viewMatrix));
		
		var waterProjectionLocation = gl.getUniformLocation(waterProgram, 'projectionMatrix');
		gl.uniformMatrix4fv(waterProjectionLocation, false, new Float32Array(projectionMatrix));
		
		var waterModelLocation = gl.getUniformLocation(waterProgram, 'model');
		gl.uniformMatrix4fv(waterModelLocation, false, new Float32Array(fullTransforms));
		
		var waterDUDVmapLocation = gl.getUniformLocation(waterProgram, 'dudvMap');
		
		var waterMoveFactorLocation = gl.getUniformLocation(waterProgram, 'moveFactor');
	gl.useProgram(program);
	
	/*
	I think projection contains model matrix as well, so not needed in shader
	*/
	function updateWaterAttributesAndUniforms(viewMatrix, projectionMatrix){
		moveFactor += Date.now() * 0.000000000000003;
		moveFactor %= 1; // loops when reaches 0
		gl.uniform1f(waterMoveFactorLocation, moveFactor);
	
		// Dont know if needed
		fullTransforms = m4.multiply(position, rotateZ);
		fullTransforms = m4.multiply(fullTransforms, rotateY);
		fullTransforms = m4.multiply(fullTransforms, rotateX);
		fullTransforms = m4.multiply(fullTransforms, scale);
	
		gl.uniformMatrix4fv(waterModelLocation, false, new Float32Array(fullTransforms));
		gl.uniformMatrix4fv(waterViewMatrixLocation, false, new Float32Array(viewMatrix));
		gl.uniformMatrix4fv(waterProjectionLocation, false, new Float32Array(projectionMatrix));
	}
	
	

	var waterVertexPositionBuffer;
	var waterVertices = [];
	var moveFactor = 0;

	gl.useProgram(waterProgram);
	setup();
	gl.useProgram(program);
	
	function setup(){
		waterVertexPositionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, waterVertexPositionBuffer);
		// Setting x and z positions, y is set to 0 in vertex shader
		waterVertices = [
			-1, -1, 
			-1, 1, 
			1, -1, 
			1, -1, 
			-1, 1, 
			1, 1
		];
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(waterVertices), gl.STATIC_DRAW);
		gl.vertexAttribPointer(waterPositionAttribLocation, 2, gl.FLOAT, false, 0, 0);
		
	}
	
	
	
	
	this.render = function(viewMatrix, projectionMatrix){
		gl.useProgram(waterProgram);
		
		scale = m4.scaling(75, 75, 75);
		rotateX = m4.xRotation(0);
		rotateY = m4.yRotation(0);
		rotateZ = m4.zRotation(0);
		position = m4.translation(225, waterHeight, 225);
		
		
		// Reflection texture sampled from unit 0
		gl.activeTexture(gl.TEXTURE0);
		gl.uniform1i(gl.getUniformLocation(waterProgram, "reflectionTexture"), 0);
		gl.bindTexture(gl.TEXTURE_2D, reflectionTexture);
		
		// Refraction texture sampled from unit 1
		gl.activeTexture(gl.TEXTURE1); 
		gl.uniform1i(gl.getUniformLocation(waterProgram, "refractionTexture"), 1);
		gl.bindTexture(gl.TEXTURE_2D, refractionTexture);		
		
		// dudvMap texture sampled from unit 2
		gl.activeTexture(gl.TEXTURE2); 
		gl.uniform1i(gl.getUniformLocation(waterProgram, "waterDUDVmapLocation"), 2);
		gl.bindTexture(gl.TEXTURE_2D, WATER_DUDV_MAP_TEXTURE.getTextureAttribute.texture);	// CHANGE THIS TO DUDV TEXTURE		
		
		
		
		updateWaterAttributesAndUniforms(viewMatrix, projectionMatrix);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, waterVertexPositionBuffer);
		gl.vertexAttribPointer(waterPositionAttribLocation, 2, gl.FLOAT, false, 0, 0);
		
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 6);
		//gl.drawArrays(gl.POINTS, 0, 4);

		gl.useProgram(program);
	}
	
	
}