/**
 * Vertex shader 
 * 
 * @module Engine
*/
var vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, [

	 // Vertex position
	'attribute vec3 position;',
	
	// Get texture coordinate
	'attribute vec2 aTextureCoord;',
	// And then pass to fragment shader
	'varying highp vec2 vTextureCoord;',
	
	// Out the position to fragment shader, for water
	'varying vec4 fragPosition;',
	
	// Standard matrices
	'uniform mat4 viewMatrix;',
	'uniform mat4 inverseViewMatrix;', // GLSL inverse function doesn't work, so pass in this
	'uniform mat4 model;',
	'uniform mat4 projection;',
	
	// Instancing
	'uniform bool useInstancing;',
	'attribute vec4 instanceMatrixRow0;',
	'attribute vec4 instanceMatrixRow1;',
	'attribute vec4 instanceMatrixRow2;',
	'attribute vec4 instanceMatrixRow3;',
	
	// Lighting
	'uniform vec3 lightPosition;',
	'attribute vec3 normal;', //attribute = in
	'varying vec3 surfaceNormal;', //varying = out
	'varying vec3 surfaceToLightVector;',
	
	// For specular
	'varying vec3 toCameraVector;',
	
	// Fog, pass to fragment shader
	'varying float visibility;',
	'const float density = 0.01;', 
	'const float gradient = 10.5;', //3.5
	
	'void main(){',
	
		// If using instanced rendering (for rocks only)
		// Form the full matrix from the rows, cols then rows its weird!!
		'mat4 fullInstanceTransform;',
		'if(useInstancing){',
			'fullInstanceTransform = mat4(instanceMatrixRow0, instanceMatrixRow1, instanceMatrixRow2, instanceMatrixRow3);',
		'}',
		'else{',
			'fullInstanceTransform = mat4(  1,0,0,0 , 0,1,0,0, 0,0,1,0, 0,0,0,1);',
		'}',
	
		// Transform and rotate the vertex position, so we can use it
		'vec4 worldPostion = model * vec4(position, 1.0) * fullInstanceTransform;', 
		
		// Fog
		'vec4 positionRelativeToCamera = viewMatrix * worldPostion;',
		
		// Particles
		'gl_PointSize = 25.0;',
		
		// Set the final output vertex position
		'gl_Position = projection * positionRelativeToCamera;',

		// Pass the texture coordinate to the fragment shader
		'vTextureCoord = aTextureCoord;',
		
		// Calculate the surface normal
		'surfaceNormal = (model * vec4(normal, 0.0)).xyz;', 
		'surfaceToLightVector = lightPosition - worldPostion.xyz;',
		
		// Don't have camera position in the shader, so can't just subtract to get the toCameraVector
		// Do have the viewMatrix though, contains the negative camera position, so just inverse it
		'toCameraVector = (inverseViewMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz - worldPostion.xyz;', 
		
		
		// Fog
		// We have vector of vertex from the camera, so get distance from length of the vector
		'float distance = length(positionRelativeToCamera.xyz);',
		// Use that to calculate visibility
		'visibility = exp(-pow((distance*density), gradient));',
		// Ensure stays between 0 and 1
		'visibility = clamp(visibility, 0.0, 1.0);',
		
		// Pass position to fragment shader
		'fragPosition = worldPostion;',
	'}'
].join('\n'));
gl.compileShader(vertexShader);
console.log("Vertex shader compliation status: " + gl.getShaderInfoLog(vertexShader));