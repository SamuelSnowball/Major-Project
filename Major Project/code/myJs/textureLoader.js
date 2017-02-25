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
var marsTerrainTexture;

var rockTexture = new Texture('resources/rocks/rock.png', 1000, 0);
var rockTexture2 = new Texture('resources/rocks/rock2.png', 1000, 0);
var sandstoneTexture = new Texture('resources/rocks/sandstone.png', 1000, 0);
var depletedTexture = new Texture('resources/rocks/depleted.png', 1000, 0);

var waterTexture = new Texture('resources/water/water.png', 0.01, 1);


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
		
		/*
		Load terrain texture
		*/
		myPerlinTexture = new Texture("", 0, 0);
		gl.bindTexture(gl.TEXTURE_2D, myPerlinTexture.getTextureAttribute.texture);
		
		var mapSize = 512;
		var textureSize = mapSize * mapSize; //512 rows and columns
		var pixels = new Uint8Array(4 * textureSize);
		var perlin = new ImprovedNoise();
		
		for(var y=0; y<mapSize; y++){ 
			for(var x=0; x<mapSize; x++){
				var index = (x + y * mapSize) * 4;
				var r = stackNoise(x, y, 8);
				//Value returned between 0 and 1 or something
				//Times it to get color, 255 is ok, 512 more intense
				r *= 512; 

				//sometimes r is negative here, make it positive
				if(r < 0){
					r *= -1;
				}
		
				pixels[index+0] = r;
				pixels[index+1] = 0;
				pixels[index+2] = 0;
				pixels[index+3] = 255;			
			}
		}

		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, mapSize, mapSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels); 
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.generateMipmap(gl.TEXTURE_2D);
		gl.bindTexture(gl.TEXTURE_2D, null);
	}

	/*
	Max value (amplitude) decreases every iteration
	Also the numbers get chosen more frequently (frequency)

	1st iteration (octave)
		Max value = 100,
		Pick values every 10.

	2nd iteration
		Max value = 50
		Pick values every 5
		
	Half the time that passes before picking a value (frequency)
	And half the amplitude, max value

	Then add values together (Add graphs together)

	Returns noise value between 0 and 1, for a single pixel
	*/
	function stackNoise(x, y, numOctaves){
		var v = 0;
		var amplitude = 1;
		var frequency = 1;
		var noiseTotal = 0;
		
		for(var i=0; i<numOctaves; i++){
			v += perlin.noise(x * amplitude, y * amplitude, x * amplitude) * frequency;
			noiseTotal += frequency;
			amplitude *= 0.5;
			frequency *= 2.0;
		}
		
		return v / noiseTotal;
	}
}

//add reflectivity and shineDamper in constructor
//also, only works for non procedural textures, could make a comepletely new proceduralTexture object maybe...
function Texture(path, shineDamperParam, reflectivityParam){
	console.log("A texture was created!");
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
