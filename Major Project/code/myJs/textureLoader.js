
var marsTerrainTexture;

var rockTexture;
var sandstoneTexture;

/*
Knowledge gained from:
http://stackoverflow.com/questions/19722247/webgl-wait-for-texture-to-load/19748905#19748905
https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL
https://github.com/mdn/webgl-examples/blob/gh-pages/tutorial/sample6/webgl-demo.js
*/
function loadAllTextures(){
	
	loadTerrainTextures();
	loadRockTextures();
	
}


function loadTerrainTextures(){
	marsTerrainTexture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, marsTerrainTexture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
				  new Uint8Array([255, 0, 0, 255])); //this line fixes a bug of texture not showing

	marsTerrainImage = new Image();
	marsTerrainImage.src = 'resources/terrain/marsTerrainTexture.png';
	marsTerrainImage.onload = function (){handleTextureLoaded(marsTerrainImage, marsTerrainTexture);}
}


function loadRockTextures(){
	rockTexture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, rockTexture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
				  new Uint8Array([255, 0, 0, 255])); 

	rockImage = new Image();
	rockImage.src = 'resources/rocks/perlin.png';
	rockImage.onload = function (){handleTextureLoaded(rockImage, rockTexture);}
	
	sandstoneTexture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, sandstoneTexture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
				  new Uint8Array([255, 251, 208, 255])); 

	sandstoneImage = new Image();
	sandstoneImage.src = 'resources/rocks/sandstone.png';
	sandstoneImage.onload = function (){handleTextureLoaded(sandstoneImage, sandstoneTexture);}
}

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
