
// This texture gets set to other textures whilst rendering
var currentTexture;

var myParticleTexture;
var mapTexture;
var WATER_DUDV_MAP_TEXTURE;
var WATER_NORMAL_MAP_TEXTURE;
var borderTexture;

// Rock textures
var rockTexture0;
var rockTexture1;
var rockTexture2;
var rockTexture3;
var rockTexture4;
var rockTexture5;
var rockTextures = [];

// Skybox textures
var skybox_texture = 0;
var skybox_night_texture = 0;

/**
 * This file loads the textures into their global variables
 * 
 * Texture knowledge gained from:
 * 	http://stackoverflow.com/questions/19722247/webgl-wait-for-texture-to-load/19748905#19748905
 * 	https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL
 * 	https://github.com/mdn/webgl-examples/blob/gh-pages/tutorial/sample6/webgl-demo.js
 * 	
 * Some rock resources from:
 * 	http://www.textures.com/download/rocksarid0035/68071?&secure=login
 * 	https://www.textures.com/download/rocksarid0048/42217?&secure=login
 * 	https://www.textures.com/download/rocksarid0049/42220?&secure=login
 * 	
 * Sand:
 * 	http://www.textures.com/download/soilbeach0131/106132
 * 	
 * 	@class TextureLoader
 * 	
*/
function TextureLoader(){

	/**
	@constructor
	*/
	loadTextures();
	
	/**
	Loads all textures into their global variables
	
	@method loadTextures
	@private
	*/
	function loadTextures(){
	
		borderTexture = new Texture("", 10, 0);
		gl.bindTexture(gl.TEXTURE_2D, borderTexture.getTextureAttribute.texture);		
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
				  new Uint8Array([255, 0, 0, 255]));
	
		skybox_texture = loadCubeMap(false);
		skybox_night_texture = loadCubeMap(true);
				  
		myParticleTexture = new Texture("resources/particles/smoke.png", 10, 0);
		
		// Map texture
		mapTexture = new Texture("resources/terrain/floor/sand.png", 10, 0);
		
		// Rock textures
		rockTexture0 = new Texture('resources/rocks/0.png', 10, 0);
		rockTexture1 = new Texture('resources/rocks/1.png', 10, 0);
		rockTexture2 = new Texture('resources/rocks/2.png', 10, 0);
		rockTexture3 = new Texture('resources/rocks/3.png', 10, 0);
		rockTexture4 = new Texture('resources/rocks/4.png', 10, 0);
		rockTexture5 = new Texture('resources/rocks/5.png', 10, 0);
		rockTextures.push(rockTexture0, rockTexture1, rockTexture2, rockTexture3, rockTexture4, rockTexture5);

		// Water dudv + normal texture
		WATER_DUDV_MAP_TEXTURE = new Texture('resources/water/waterDUDV.png', 10, 5);
		WATER_NORMAL_MAP_TEXTURE = new Texture('resources/water/waterNormalMap.png', 10, 5);
		
		allTexturesLoaded = true;
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
	
}
