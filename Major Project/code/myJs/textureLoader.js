
var masterTerrainTexture;

//Put this on cliff, lava etc
var marsRedTerrainTexture;

var marsTerrainTexture;
var rockTexture;
var sandstoneTexture;
var waterTexture;
var depletedTexture;
var emeraldTexture;

var myPerlinTexture;

function TextureLoader(){

	//Need getters for these private textures
	/*
	this.getTexture = {
		get getMarsTerrainTexture(){
			return marsTerrainTexture;
		},
		get getRockTexture(){
			return rockTexture;
		},
		get getSandstoneTexture(){
			return sandstoneTexture;
		}
	}
	*/
	
	
	loadAllTextures();
	
	/*
	Knowledge gained from:
	http://stackoverflow.com/questions/19722247/webgl-wait-for-texture-to-load/19748905#19748905
	https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL
	https://github.com/mdn/webgl-examples/blob/gh-pages/tutorial/sample6/webgl-demo.js
	*/
	function loadAllTextures(){
		loadTerrainTextures();
		loadRockTextures();
		loadWaterTextures();
		loadProceduralTextures();
	}

	function loadTerrainTextures(){
		marsTerrainTexture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, marsTerrainTexture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
					  new Uint8Array([255, 0, 0, 255])); //this line fixes a bug of texture not showing

		marsTerrainImage = new Image();
		marsTerrainImage.src = 'resources/terrain/marsTerrainTexture.png';
		marsTerrainImage.onload = function (){handleTextureLoaded(marsTerrainImage, marsTerrainTexture);}
		
		marsRedTerrainTexture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, marsRedTerrainTexture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
					  new Uint8Array([255, 0, 0, 255])); //this line fixes a bug of texture not showing

		marsRedTerrainImage = new Image();
		marsRedTerrainImage.src = 'resources/terrain/marsRedTerrainTexture.png';
		marsRedTerrainImage.onload = function (){handleTextureLoaded(marsRedTerrainImage, marsRedTerrainTexture);}	

		
		
		masterTerrainTexture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, masterTerrainTexture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
					  new Uint8Array([255, 0, 0, 255])); //this line fixes a bug of texture not showing

		masterTerrainImage = new Image();
		masterTerrainImage.src = 'resources/terrain/master.png';
		masterTerrainImage.onload = function (){handleTextureLoaded(masterTerrainImage, masterTerrainTexture);}			
	}


	function loadRockTextures(){
		rockTexture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, rockTexture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
					  new Uint8Array([255, 0, 0, 255])); 

		rockImage = new Image();
		rockImage.src = 'resources/rocks/rock.png';
		rockImage.onload = function (){handleTextureLoaded(rockImage, rockTexture);}
		
		sandstoneTexture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, sandstoneTexture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
					  new Uint8Array([255, 251, 208, 255])); 

		sandstoneImage = new Image();
		sandstoneImage.src = 'resources/rocks/sandstone.png';
		sandstoneImage.onload = function (){handleTextureLoaded(sandstoneImage, sandstoneTexture);}
		
		
		depletedTexture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, depletedTexture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
					  new Uint8Array([0, 255, 0, 255])); 
					  
		depletedImage = new Image();
		depletedImage.src = 'resources/rocks/depleted.png';
		depletedImage.onload = function (){handleTextureLoaded(depletedImage, depletedTexture);}
		
			
		emeraldTexture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, emeraldTexture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
					  new Uint8Array([0, 255, 0, 255])); 
					  
		emeraldImage = new Image();
		emeraldImage.src = 'resources/rocks/emerald.png';
		emeraldImage.onload = function (){handleTextureLoaded(emeraldImage, emeraldTexture);}
		
			
					  
	}

	function loadWaterTextures(){
		waterTexture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, waterTexture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
					  new Uint8Array([255, 0, 0, 255])); //this line fixes a bug of texture not showing

		waterImage = new Image();
		waterImage.src = 'resources/water.png';
		waterImage.onload = function (){handleTextureLoaded(waterImage, waterTexture);}		
	}
	
	/*
	Stacking noise, and multiplying to get a colour value
	*/
	function loadProceduralTextures(){
	
		myPerlinTexture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, myPerlinTexture);
		
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
