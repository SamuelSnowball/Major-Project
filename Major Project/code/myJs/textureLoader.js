/*
Texture knowledge gained from:
	http://stackoverflow.com/questions/19722247/webgl-wait-for-texture-to-load/19748905#19748905
	https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL
	https://github.com/mdn/webgl-examples/blob/gh-pages/tutorial/sample6/webgl-demo.js
*/
var currentTexture;
var myPerlinTexture;
var myParticleTexture;

//Textures to do
var marsRedTerrainTexture;

var rockTexture = new Texture('resources/rocks/rock.png', 1, 1);
var rockTexture2 = new Texture('resources/rocks/rock2.png', 1, 1);
var depletedTexture = new Texture('resources/rocks/depleted.png', 1, 1);
var blueOreTexture = new Texture('resources/rocks/blueOre.png', 1, 1);
var lavaRockTexture =  new Texture('resources/lava.png', 1, 1);
var emeraldTexture =  new Texture('resources/rocks/emerald.png', 1, 1);

//1st parameter lower number = less shine damper, so more bright
var waterTexture = new Texture('resources/water/water.png', 10, 5);
var lavaTexture = new Texture('resources/lava.png', 1, 1);

/*
Loads procedurals, doesn't load regular ones because they need to done asap
*/
function TextureLoader(){

	loadProceduralTextures();
	
	/*
	Stacking noise, and multiplying to get a colour value
	*/
	function loadProceduralTextures(){
		/*
		Load particle texture
		*/
		myParticleTexture = new Texture("", 1, 1);
		gl.bindTexture(gl.TEXTURE_2D, myParticleTexture.getTextureAttribute.texture);		
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
				  new Uint8Array([0, 0, 0, 255])); //this line fixes a bug of texture not showing	

		myPerlinTexture = new Texture("resources/nice2.png", 0, 0);
		gl.bindTexture(gl.TEXTURE_2D, myPerlinTexture.getTextureAttribute.texture);		
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
				  new Uint8Array([0, 0, 0, 255])); //this line fixes a bug of texture not showing	

	}
	
}
	
//add reflectivity and shineDamper in constructor
//also, only works for non procedural textures, could make a comepletely new proceduralTexture object maybe...
function Texture(path, shineDamperParam, reflectivityParam){
	var shineDamper = shineDamperParam; 
	var reflectivity = reflectivityParam; 
	
	//Needs getTexture method, using this.texture doesn't work :(
	var texture = gl.createTexture();
	
	this.getTextureAttribute = {
		get texture(){
			return texture; //this works..
		},
		get shineDamper(){
			return shineDamper; //and this doesn't??
		},
		get reflectivity(){
			return reflectivity;
		}
	}
	
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
				  new Uint8Array([255, 0, 0, 255])); //this line fixes a bug of texture not showing

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
