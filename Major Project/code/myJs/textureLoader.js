/*
This file includes the TextureLoader and Texture classes

Texture knowledge gained from:
	http://stackoverflow.com/questions/19722247/webgl-wait-for-texture-to-load/19748905#19748905
	https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL
	https://github.com/mdn/webgl-examples/blob/gh-pages/tutorial/sample6/webgl-demo.js
	
Some rock resources from:
	http://www.textures.com/download/rocksarid0035/68071?&secure=login
	https://www.textures.com/download/rocksarid0048/42217?&secure=login
	https://www.textures.com/download/rocksarid0049/42220?&secure=login
	
Sand:
	http://www.textures.com/download/soilbeach0131/106132
*/

// This texture gets set to other textures whilst rendering
var currentTexture;

var myParticleTexture;
var mapTexture;
var WATER_DUDV_MAP_TEXTURE;
var WATER_NORMAL_MAP_TEXTURE;
var landerTexture;

/*
Rock textures
*/
var rockTexture0;
var rockTexture1;
var rockTexture2;
var rockTexture3;
var rockTexture4;
var rockTexture5;
var rockTextures = [];

function TextureLoader(){

	loadTextures();
	
	function loadTextures(){
				  
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

		// Lander texture
		landerTexture = new Texture('resources/lander/lander.png', 10, 0);
		
		// Water dudv + normal texture
		WATER_DUDV_MAP_TEXTURE = new Texture('resources/water/waterDUDV.png', 10, 5);
		WATER_NORMAL_MAP_TEXTURE = new Texture('resources/water/waterNormalMap.png', 10, 5);
	}
	
}
