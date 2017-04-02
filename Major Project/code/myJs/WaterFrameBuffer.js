
var reflectionTexture;
var reflectionFrameBuffer;	
var reflectionDepthBuffer;
	
function WaterFrameBuffer(){

	var REFLECTION_WIDTH = 2048;
	var REFLECTION_HEIGHT = 2048;
	
	//var REFRACTION_WIDTH = 512;
	//var REFRACTION_HEIGHT = 512;
	
	//var refractionFrameBuffer;
	//var refractionTexture;
	//var refractionDepthTexture;
	
	setupReflectionFrameBuffer();
	//setupRefractionFrameBuffer();
	

	function setupReflectionFrameBuffer(){
		reflectionFrameBuffer = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, reflectionFrameBuffer);
		//draw_ext.drawBuffersWEBGL([draw_ext.COLOR_ATTACHMENT0_WEBGL]);
		
		
		reflectionTexture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, reflectionTexture);
		// null at the end of this means, we don't have any data to copy yeet
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, REFLECTION_WIDTH, REFLECTION_HEIGHT, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, reflectionTexture, 0);
		
		
		reflectionDepthBuffer = gl.createRenderbuffer();
		gl.bindRenderbuffer(gl.RENDERBUFFER, reflectionDepthBuffer);
		gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, REFLECTION_WIDTH, REFLECTION_HEIGHT);
		gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, reflectionDepthBuffer);	

		
		
		// Reset buffers to default
		//gl.bindTexture(gl.TEXTURE_2D, null);
		//gl.bindRenderbuffer(gl.RENDERBUFFER, null);
		//gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		//gl.viewport(0, 0, window.innerWidth, window.innerHeight);
	}
	
	/*
	function setupRefractionFrameBuffer(){
		refractionFrameBuffer = createMyFrameBuffer();
		refractionTexture = createTextureAttachment(REFRACTION_WIDTH, REFRACTION_HEIGHT);
		refractionDepthBuffer = createDepthTextureAttachment(REFRACTION_WIDTH, REFRACTION_HEIGHT);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.viewport(0, 0, window.innerWidth, window.innerHeight);
	}
	*/

	
	function createTextureAttachment(width, height){
		var tex = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, tex);
		// null at the end of this means, we don't have any data to copy yeet
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
		return tex;
	}

	function createDepthTextureAttachment(width, height){
		var tex = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, tex);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT16, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, tex, 0);
		return tex;
		
	}
	
	
	//Isn't a texture attachment, is a renderBuffer
	//Perhaps need to rebind texture here?
	function createDepthBufferAttachment(texture, width, height){
		var depthBuffer = gl.createRenderbuffer();
		gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
		gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
		
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
		gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);		
		
		// Reset buffers to default
		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.bindRenderbuffer(gl.RENDERBUFFER, null);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		return depthBuffer;
	}

	
}