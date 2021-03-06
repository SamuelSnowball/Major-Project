
/**
 * The texture class, this holds the actual WebGLTexture
 * 
 * @class Texture
 * @constructor
 * @param path {string} path to the texture file/image
 * @param shineDamperParam (float) its shine damper value
 * @param reflectivityParam (float) how reflective it is
*/
function Texture(path, shineDamperParam, reflectivityParam){

	var shineDamper = shineDamperParam; 
	var reflectivity = reflectivityParam; 
	var texture = gl.createTexture();
	
	// Getters
	this.getTextureAttribute = {
		/**
		@method get.texture
		@public
		@return {WebGLTexture} the texture
		*/
		get texture(){
			return texture;
		},
		
		/**
		@method get.shineDamper
		@public
		@return {float} the textures shine damper value
		*/		
		get shineDamper(){
			return shineDamper; 
		},

		/**
		@method get.reflectivity
		@public
		@return {float} the textures reflectivity
		*/		
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
	
	/**
	This gets run after image is done loading
	
	@method handleTextureLoaded
	@private
	@param image {image} the JavaScript image object to use
	@param texture {WebGLTexture} the WebGLTexture to load
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
	
	/*
	TESTING FUNCTIONS BELOW
	*/
	
	/**
	@method test_getters
	@public
	*/
	this.test_getters = function(textureParam){
		if(testerObject.test_is_texture("tempTexture", textureParam.getTextureAttribute.texture)){
			console.error("Failed to get texture in texture class!");
		}
		
		if(textureParam.getTextureAttribute.shineDamper !== 10){
			console.error("Failed to set/get shineDamper in texture class!");
		}

		if(textureParam.getTextureAttribute.reflectivity !== 00){
			console.error("Failed to set/get reflectivity in texture class!");
		}
	}
	
}
