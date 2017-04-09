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

/*
Other textures
*/
var waterTexture;
var lavaTexture;

function TextureLoader(){

	loadTextures();
	
	function loadTextures(){
				  
		myParticleTexture = new Texture("", 0, 0);
		gl.bindTexture(gl.TEXTURE_2D, myParticleTexture.getTextureAttribute.texture);		
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
				  new Uint8Array([0, 0, 0, 255]));
				  
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

function Texture(path, shineDamperParam, reflectivityParam){

	var shineDamper = shineDamperParam; 
	var reflectivity = reflectivityParam; 
	var texture = gl.createTexture();
	
	// Getters
	this.getTextureAttribute = {
		get texture(){
			return texture;
		},
		get shineDamper(){
			return shineDamper; 
		},
		get reflectivity(){
			return reflectivity;
		}
	}
	
	// The below lines 2/3 fix bug of texture not showing
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
				  new Uint8Array([0, 0, 0, 255])); 

	var image = new Image();
	image.src = path;
	image.onload = function (){handleTextureLoaded(image, texture);}	
	
	/*
	This gets run after image is done loading
	*/
	function handleTextureLoaded(image, texture){
	
		gl.bindTexture(gl.TEXTURE_2D, texture);
		
		// Writes image data to the texture
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
		
		/*
		Setup filtering, controls how image is filtered when scaling
		Using linear filtering when scaling up
		Using mipmap when scaling down
		*/
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
		
		gl.generateMipmap(gl.TEXTURE_2D);
		
		// Ok, we're done manipulating the texture, bind null to gl.TEXTURE_2D
		gl.bindTexture(gl.TEXTURE_2D, null);
		
	}
	
}
