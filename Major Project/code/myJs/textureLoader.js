/*
This file includes the TextureLoader and Texture classes

Texture knowledge gained from:
	http://stackoverflow.com/questions/19722247/webgl-wait-for-texture-to-load/19748905#19748905
	https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL
	https://github.com/mdn/webgl-examples/blob/gh-pages/tutorial/sample6/webgl-demo.js
*/

// This texture gets set to other textures whilst rendering
var currentTexture;
var myPerlinTexture;
var myParticleTexture;
var mapTexture;

var sandTexture;

var playerTexture;

var shopTexture;

/*
Rock textures
*/
var depletedTexture;
var rockTexture0;
var rockTexture1;
var rockTexture2;
var rockTexture3;
var rockTexture4;
var rockTexture5;

var testTexture1;
var testTexture2;
var testTexture3;
var testTexture4;

/*
Other textures
*/
var waterTexture;
var lavaTexture;

function TextureLoader(){

	loadTextures();
	
	function loadTextures(){
	
		// Player texture has no image, just red its pixels to red
		playerTexture = new Texture("", 0, 0);
		gl.bindTexture(gl.TEXTURE_2D, playerTexture.getTextureAttribute.texture);		
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
				  new Uint8Array([255, 0, 0, 255]));
				  
		myParticleTexture = new Texture("", 0, 0);
		gl.bindTexture(gl.TEXTURE_2D, myParticleTexture.getTextureAttribute.texture);		
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
				  new Uint8Array([0, 0, 0, 255]));
				  
		// Map texture
		mapTexture = new Texture("resources/terrain/floor/sand.png", 10, 0, true);
		
		
		// http://www.textures.com/download/soilbeach0131/106132
		sandTexture = new Texture("resources/terrain/floor/sand.png", 10, 0);
		
		/*
		Rock textures
		*/
		depletedTexture = new Texture('resources/rocks/depleted.png', 10, 0);
		
		rockTexture0 = new Texture('resources/rocks/0.png', 10, 0);
		rockTexture1 = new Texture('resources/rocks/1.png', 10, 0);
		rockTexture2 = new Texture('resources/rocks/2.png', 10, 0);
		// from same resource/reference
		rockTexture3 = new Texture('resources/rocks/3.png', 10, 0);
		rockTexture4 = new Texture('resources/rocks/4.png', 10, 0);
		rockTexture5 = new Texture('resources/rocks/5.png', 10, 0);
		
		/*
		http://www.textures.com/download/rocksarid0035/68071?&secure=login
		https://www.textures.com/download/rocksarid0048/42217?&secure=login
		https://www.textures.com/download/rocksarid0049/42220?&secure=login
		*/
		rockTexture6 = new Texture('resources/rocks/6.png', 10, 0);
		rockTexture7 = new Texture('resources/rocks/7.png', 10, 0);
		rockTexture8 = new Texture('resources/rocks/8.png', 10, 0);

		/*
		Other textures
		*/
		waterTexture = new Texture('resources/water/water.png', 10, 5);
		lavaTexture = new Texture('resources/lava.png', 1, 1);
		
		shopTexture = new Texture('resources/shop/shopImage.png', 10, 0);
	}
	
}

function Texture(path, shineDamperParam, reflectivityParam, repeat){

	var shineDamper = shineDamperParam; 
	var reflectivity = reflectivityParam; 
	var texture = gl.createTexture();
	
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
	image.onload = function (){handleTextureLoaded(image, texture, repeat);}	
	
	/*
	This gets run after image is done loading
	*/
	function handleTextureLoaded(image, texture, repeat){
	
		if(repeat){
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
			gl.generateMipmap(gl.TEXTURE_2D);
			gl.bindTexture(gl.TEXTURE_2D, null);
		}
		else{
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
	
}
