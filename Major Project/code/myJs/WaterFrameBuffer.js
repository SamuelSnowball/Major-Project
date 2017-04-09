
var reflectionFrameBuffer;	
var reflectionTexture;
var reflectionDepthBuffer;
	
var refractionFrameBuffer;
var refractionTexture;
var refractionDepthBuffer;
	
function WaterFrameBuffer(){

	var REFLECTION_WIDTH = 512;
	var REFLECTION_HEIGHT = 512;
	
	var REFRACTION_WIDTH = 512;
	var REFRACTION_HEIGHT = 512;
	
	
	setupReflectionFrameBuffer();
	setupRefractionFrameBuffer();
	

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
		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.bindRenderbuffer(gl.RENDERBUFFER, null);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.viewport(0, 0, window.innerWidth, window.innerHeight);
	}

	function setupRefractionFrameBuffer(){
		refractionFrameBuffer = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, refractionFrameBuffer);
		
		refractionTexture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, refractionTexture);
		// null at the end of this means, we don't have any data to copy yeet
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
	}
	
}