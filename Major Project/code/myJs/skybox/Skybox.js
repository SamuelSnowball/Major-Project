
/**
 * Has the skybox render method
 * Also creates the day/night cycle
 * 
 * @class Skybox
*/
function Skybox(){
	
	var skybox_texture = loadCubeMap(false);
	var skybox_night_texture = loadCubeMap(true);
		
	var rotationSpeed = 1; // 1 degree per frame
	var currentRotation = 0;
	var blendFactor = 0; // for blending of the 2 skybox textures
	var time = 0; // time of day
	var timeIncrement = 0.001;
	var skyColourIncrement = 0.001; // how quickly the fog increases/decreases based on time of day

	var SIZE = 256; // How far skybox stays away from the player
	var skybox_vertices_buffer;
	var skybox_vertices;

	this.set = {
		/**
		@method set.currentRotation
		@public
		@param x {float} the skyboxes current rotation
		*/
		set currentRotation(x){
			currentRotation = x;
		},		
	};
	
	this.get = {
		/**
		@method get.currentRotation
		@public
		@return {float} the skyboxes current rotation
		*/
		get currentRotation(){
			return currentRotation;
		},

		/**
		@method get.rotationSpeed
		@public
		@return {float} the skyboxes rotation speed
		*/
		get rotationSpeed(){
			return rotationSpeed;
		},
		
		/**
		@method get.currentTime
		@public
		@return {float} the current time of the world (0000 -> 2400)
		*/		
		get currentTime(){
			return time;
		},
		
		/**
		@method get.blendFactor
		@public
		@return {float} the blendFactor of the 2 skyboxes
		*/		
		get blendFactor(){
			return blendFactor;
		}		
	};
	
	/**
	@constructor
	*/
	createSkyboxVertices();
	
	/**
	@method createSkyboxVertices
	@private
	*/
	function createSkyboxVertices(){
		gl.useProgram(skyboxProgram.get.program); 
		skybox_vertices_buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, skybox_vertices_buffer);

		skybox_vertices = [        
			-SIZE,  SIZE, -SIZE,
			-SIZE, -SIZE, -SIZE,
			SIZE, -SIZE, -SIZE,
			 SIZE, -SIZE, -SIZE,
			 SIZE,  SIZE, -SIZE,
			-SIZE,  SIZE, -SIZE,

			-SIZE, -SIZE,  SIZE,
			-SIZE, -SIZE, -SIZE,
			-SIZE,  SIZE, -SIZE,
			-SIZE,  SIZE, -SIZE,
			-SIZE,  SIZE,  SIZE,
			-SIZE, -SIZE,  SIZE,

			 SIZE, -SIZE, -SIZE,
			 SIZE, -SIZE,  SIZE,
			 SIZE,  SIZE,  SIZE,
			 SIZE,  SIZE,  SIZE,
			 SIZE,  SIZE, -SIZE,
			 SIZE, -SIZE, -SIZE,

			-SIZE, -SIZE,  SIZE,
			-SIZE,  SIZE,  SIZE,
			 SIZE,  SIZE,  SIZE,
			 SIZE,  SIZE,  SIZE,
			 SIZE, -SIZE,  SIZE,
			-SIZE, -SIZE,  SIZE,

			-SIZE,  SIZE, -SIZE,
			 SIZE,  SIZE, -SIZE,
			 SIZE,  SIZE,  SIZE,
			 SIZE,  SIZE,  SIZE,
			-SIZE,  SIZE,  SIZE,
			-SIZE,  SIZE, -SIZE,

			-SIZE, -SIZE, -SIZE,
			-SIZE, -SIZE,  SIZE,
			 SIZE, -SIZE, -SIZE,
			 SIZE, -SIZE, -SIZE,
			-SIZE, -SIZE,  SIZE,
			 SIZE, -SIZE,  SIZE
		];
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(skybox_vertices), gl.STATIC_DRAW);
		gl.vertexAttribPointer(skyboxProgram.get.skyboxPositionAttribLocation, 3, gl.FLOAT, false, 0, 0);
		gl.useProgram(mainProgram.get.program); 
	}

	/**
	@method loadCubeMap
	@private
	@param loadNightSkybox {bool} if we should load the night skybox, or the day skybox, true/false
	*/
	function loadCubeMap(loadNightSkybox) {
		var texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
		
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		
		var faces = [];
		
		if(loadNightSkybox === false){
			faces = [
				["resources/skybox/right.png", gl.TEXTURE_CUBE_MAP_POSITIVE_X],
				["resources/skybox/left.png", gl.TEXTURE_CUBE_MAP_NEGATIVE_X],
				["resources/skybox/top.png", gl.TEXTURE_CUBE_MAP_POSITIVE_Y],
				["resources/skybox/bottom.png", gl.TEXTURE_CUBE_MAP_NEGATIVE_Y],
				["resources/skybox/back.png", gl.TEXTURE_CUBE_MAP_POSITIVE_Z],
				["resources/skybox/front.png", gl.TEXTURE_CUBE_MAP_NEGATIVE_Z]
			];
		}
		else{
			faces = [
				["resources/skybox/nightRight.png", gl.TEXTURE_CUBE_MAP_POSITIVE_X],
				["resources/skybox/nightLeft.png", gl.TEXTURE_CUBE_MAP_NEGATIVE_X],
				["resources/skybox/nightTop.png", gl.TEXTURE_CUBE_MAP_POSITIVE_Y],
				["resources/skybox/nightBottom.png", gl.TEXTURE_CUBE_MAP_NEGATIVE_Y],
				["resources/skybox/nightBack.png", gl.TEXTURE_CUBE_MAP_POSITIVE_Z],
				["resources/skybox/nightFront.png", gl.TEXTURE_CUBE_MAP_NEGATIVE_Z]
			];			
		}
		
		for (var i = 0; i < faces.length; i++) {
			var face = faces[i][1];
			var image = new Image();
			image.onload = function(texture, face, image) {
				return function() {
					gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
					gl.texImage2D(face, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
				}
			} (texture, face, image);
			image.src = faces[i][0];
		}

		return texture;
	}
	
	/**
	This function:
		Updates the time of day,
		Updates the skybox from night to day etc
		Changes fog colour based on time of day
		Sets the water reflectivity based on time of day (at night, no specular highlights)
	
	@method updateDay
	@public
	*/
	this.updateDay = function(){
		
		// 0.00000000000003 bit slow
		// 0.0000000000003 bit fast
		time += Date.now()*0.0000000000001; // 4 is too fast
		
		if(time > 2400){
			time = 0;
		}
		
		/*
		Base the blend factor on time of day
			blendFactor = 1, fully night
			blendFactor = 0, fully day
	
		Fog/Sky colours:
			White [1, 1, 1, 1]
			Black [0, 0, 0, 1]

		Set waterReflectivity based on time of day
		*/
		var waterReflectivityIncrement = waterSystem.get.waterReflectivityIncrement;
		
		if(time > 1800 && time < 2400){
			// Start blending to night (1)
			blendFactor += timeIncrement;
			if(blendFactor > 1){
				blendFactor = 1;
			}
			// Make fog darker
			skyColour[0] -= skyColourIncrement;
			skyColour[1] -= skyColourIncrement;
			skyColour[2] -= skyColourIncrement;
			
			if(skyColour[0] < 0 || skyColour[1] < 0 || skyColour[2] < 0){
				skyColour[0] = 0;
				skyColour[1] = 0;
				skyColour[2] = 0;
			}
			
			// Decrease waterReflectivity, then stop it going below 0
			waterSystem.set.waterReflectivity = waterSystem.get.waterReflectivity - waterReflectivityIncrement;
			if(waterSystem.get.waterReflectivity < 0){
				waterSystem.set.waterReflectivity = 0;
			}
		}
		else if(time > 0 && time < 0600){
			// Keep at night (1)
			blendFactor = 1;
			// Keep fog black
			skyColour[0] = 0;
			skyColour[1] = 0;
			skyColour[2] = 0;
			
			waterSystem.set.waterReflectivity = 0;
		}
		else if(time > 0600 && time < 1200){
			// Start blending to day (0)
			blendFactor -= timeIncrement;
			if(blendFactor < 0){
				blendFactor = 0;
			}
			// Blend fog to white
			skyColour[0] += skyColourIncrement;
			skyColour[1] += skyColourIncrement;
			skyColour[2] += skyColourIncrement;
			
			if(skyColour[0] > 1 || skyColour[1] > 1 || skyColour[2] > 1){
				skyColour[0] = 1;
				skyColour[1] = 1;
				skyColour[2] = 1;
			}
			
			// Increase waterReflectivity, stop it going over 1
			waterSystem.set.waterReflectivity = waterSystem.get.waterReflectivity + waterReflectivityIncrement;
			if(waterSystem.get.waterReflectivity > 1){
				waterSystem.set.waterReflectivity = 1;
			}
		}
		else if(time > 1200 && time < 1800){
			// Keep at day (0) 
			blendFactor = 0;
			// Keep fog white
			skyColour[0] = 1;
			skyColour[1] = 1;
			skyColour[2] = 1;
			
			// Keep waterReflectivity at its maximum value
			waterSystem.set.waterReflectivity = 1;
		}
	}
	
	/**
	Renders the skybox
	
	@method render
	@public
	*/
	this.render = function(){
		var program = skyboxProgram.get.program;
		gl.useProgram(program);
		
		// Reset matrices
		scale = m4.scaling(1, 1, 1);
		rotateX = m4.xRotation(0);
		rotateY = m4.yRotation(0);
		rotateZ = m4.zRotation(0);
		position = m4.translation(0, 0, 0);

		// Times matrices together
		skyboxProgram.updateSkyboxAttributesAndUniforms();

		// CubeMap1 Sample from unit 0
		gl.activeTexture(gl.TEXTURE0);
		gl.uniform1i(gl.getUniformLocation(program, "cubeMap"), 0);
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, skybox_texture);
		
		// CubeMap2 Sample from unit 1
		gl.activeTexture(gl.TEXTURE1);
		gl.uniform1i(gl.getUniformLocation(program, "cubeMap2"), 1);
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, skybox_night_texture);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, skybox_vertices_buffer);
		gl.vertexAttribPointer(skyboxProgram.get.skyboxPositionAttribLocation, 3, gl.FLOAT, false, 0, 0);
		
		gl.drawArrays(gl.TRIANGLES, 0, skybox_vertices.length/3);
		
		gl.useProgram(mainProgram.get.program);
	}
	
}