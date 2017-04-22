
/**
 * This file includes code for:
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
	
	var WATER_DUDV_MAP_TEXTURE = new Texture('resources/water/waterDUDV.png', 10, 5);
	var WATER_NORMAL_MAP_TEXTURE = new Texture('resources/water/waterNormalMap.png', 10, 5);
		
	var waterVertexPositionBuffer;
	var waterVertices = [];
	var moveFactor = 0;
	
	var waterHeight = 0;
	var waterReflectivity = 0.0;
	var waterReflectivityIncrement = 0.001; // how fast to increment/decrement the waterReflectivity based on time of day
	
	/**
	@constructor
	*/
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
		},
		
		/**
		@method get.waterMoveFactor
		@public
		@return {float} the water move factor speed
		*/
		get waterMoveFactor(){
			return moveFactor;
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
		},
		
		/**
		@method set.waterMoveFactor
		@public
		@param x {float} the water move factor to set
		*/
		set waterMoveFactor(x){
			moveFactor = x;
		}
	};
	
	
	/**
	Renders everything under the water height to the refractionFrameBuffer
	
	@method renderToRefractionBuffer
	@public
	*/
	this.renderToRefractionBuffer = function(){
		gl.bindFramebuffer(gl.FRAMEBUFFER, waterFramebuffers.get.refractionFrameBuffer);
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
		gl.bindFramebuffer(gl.FRAMEBUFFER, waterFramebuffers.get.reflectionFrameBuffer);
			// Calculate distance we want to move camera down by
			// And invert pitch
			var distance = 2 * (camera.get.y + waterHeight); // + ing, because water is negative, so --5 and breaks
			camera.set.y = camera.get.y - distance;
			camera.set.targetY = -camera.get.targetY;
			currentTexture = WATER_DUDV_MAP_TEXTURE;
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
		gl.useProgram(waterProgram.get.program);
		
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
		gl.vertexAttribPointer(waterProgram.get.waterPositionAttribLocation, 2, gl.FLOAT, false, 0, 0);

		gl.useProgram(mainProgram.get.program);
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
		gl.useProgram(waterProgram.get.program);
		gl.enableVertexAttribArray(waterProgram.get.waterPositionAttribLocation);

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
		
		waterProgram.updateWaterAttributesAndUniforms();
		
		// Reflection texture sampled from unit 0
		gl.activeTexture(gl.TEXTURE0);
		gl.uniform1i(gl.getUniformLocation(waterProgram.get.program, "reflectionTextureSampler"), 0);
		gl.bindTexture(gl.TEXTURE_2D, waterFramebuffers.get.reflectionTexture);
		
		// Refraction texture sampled from unit 1
		gl.activeTexture(gl.TEXTURE1); 
		gl.uniform1i(gl.getUniformLocation(waterProgram.get.program, "refractionTextureSampler"), 1);
		gl.bindTexture(gl.TEXTURE_2D, waterFramebuffers.get.refractionTexture);		
		
		// dudvMap texture sampled from unit 2
		gl.activeTexture(gl.TEXTURE2); 
		gl.uniform1i(gl.getUniformLocation(waterProgram.get.program, "dudvMapSampler"), 2);
		gl.bindTexture(gl.TEXTURE_2D, WATER_DUDV_MAP_TEXTURE.getTextureAttribute.texture);			

		// normal map sampled from unit 3
		gl.activeTexture(gl.TEXTURE3);
		gl.uniform1i(gl.getUniformLocation(waterProgram.get.program, "normalMapSampler"), 3);
		gl.bindTexture(gl.TEXTURE_2D, WATER_NORMAL_MAP_TEXTURE.getTextureAttribute.texture);			

		gl.bindBuffer(gl.ARRAY_BUFFER, waterVertexPositionBuffer);
		gl.vertexAttribPointer(waterProgram.get.waterPositionAttribLocation, 2, gl.FLOAT, false, 0, 0);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 6);

		gl.useProgram(mainProgram.get.program);
	}
	
}