
/**
 * The file includes code for:
 * 
 * Creation of reflection frame buffer and its texture 
 * Creation of refraction frame buffer and its texture
 * 
 * @class WaterFramebuffers
*/
function WaterFramebuffers(){
	
	var reflectionFrameBuffer;	
	var reflectionTexture;
	var reflectionDepthBuffer;
		
	var refractionFrameBuffer;
	var refractionTexture;
	var refractionDepthBuffer;

	// Detail/resolution of the reflection texture
	var REFLECTION_WIDTH = 512;
	var REFLECTION_HEIGHT = 512;
	
	// Detail/resolution of the refraction texture
	var REFRACTION_WIDTH = 512;
	var REFRACTION_HEIGHT = 512;

	this.get = {
		/**
		
		*/
		get reflectionTexture(){
			return reflectionTexture;
		},

		/**
		
		*/		
		get refractionTexture(){
			return refractionTexture;
		},
		
		/**
		
		*/		
		get reflectionFrameBuffer(){
			return reflectionFrameBuffer;
		},
		
		/**
		
		*/		
		get refractionFrameBuffer(){
			return refractionFrameBuffer;
		}
	};
	
	/**
	@constructor
	*/
	setupReflectionFrameBuffer();
	setupRefractionFrameBuffer();	
	
	/**
	Sets up the reflectionFrameBuffer
	Creates the reflectionTexture
	Creates the reflectionDepthBuffer
	
	@method setupReflectionFrameBuffer
	@private
	*/
	function setupReflectionFrameBuffer(){
		reflectionFrameBuffer = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, reflectionFrameBuffer);

		reflectionTexture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, reflectionTexture);
		// null at the end of this means, we don't have any data to copy yet
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, REFLECTION_WIDTH, REFLECTION_HEIGHT, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, reflectionTexture, 0);
		
		reflectionDepthBuffer = gl.createRenderbuffer();
		gl.bindRenderbuffer(gl.RENDERBUFFER, reflectionDepthBuffer);
		gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, REFLECTION_WIDTH, REFLECTION_HEIGHT);
		gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, reflectionDepthBuffer);	

		// Reset buffers to default
		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.bindRenderbuffer(gl.RENDERBUFFER, null);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.viewport(0, 0, window.innerWidth, window.innerHeight);
		
		// @Test
		if(useTests) test_setupReflectionFrameBuffer();
	}

	/**
	Sets up the refractionFrameBuffer.
	Creates the refractionTexture
	Creates the refractionDepthBuffer
	
	@method setupRefractionFrameBuffer
	@private
	*/
	function setupRefractionFrameBuffer(){
		refractionFrameBuffer = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, refractionFrameBuffer);
		
		refractionTexture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, refractionTexture);
		// null at the end of this means, we don't have any data to copy yet
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, REFRACTION_WIDTH, REFRACTION_HEIGHT, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, refractionTexture, 0);
		
		refractionDepthBuffer = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, refractionDepthBuffer);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, REFRACTION_WIDTH, REFRACTION_HEIGHT, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, refractionDepthBuffer, 0);
		
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.viewport(0, 0, window.innerWidth, window.innerHeight);
		
		// @Test
		if(useTests) test_setupRefractionFrameBuffer();		
	}
		
	/*
	TESTING FUNCTIONS BELOW
	*/
	
	/**
	Test the water reflection frame buffer is an WebGLFrameBuffer object
	
	@method test_setupReflectionFrameBuffer
	@private
	*/
	function test_setupReflectionFrameBuffer(){
		if(gl.isFramebuffer(reflectionFrameBuffer)){
			 // It's a valid frame buffer object
		}else{
			console.error("Testing water reflection frame buffer, its not a FBO!: " + reflectionFrameBuffer);
		}
	}
	
	/**
	Test the water refraction frame buffer is an WebGLFrameBuffer object
	
	@method test_setupRefractionFrameBuffer
	@private
	*/
	function test_setupRefractionFrameBuffer(){
		if(gl.isFramebuffer(refractionFrameBuffer)){
			 // It's a valid frame buffer object
		}else{
			console.error("Testing water refraction frame buffer, its not a FBO!: " + refractionFrameBuffer);
		}
	}	
	
}