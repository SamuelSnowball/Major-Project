/*
Vertex shader 
*/
var vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, [
	'attribute vec3 position;',
	'attribute vec2 aTextureCoord;',
	'varying highp vec2 vTextureCoord;',
	
	'uniform mat4 viewMatrix;',
	'uniform mat4 inverseViewMatrix;', //glsl inverse doesn't work, so pass in this
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
	
	//For specular
	'varying vec3 toCameraVector;',
	
	//Fog, pass to frag
	'varying float visibility;',
	'const float density = 0.01;', //play with these
	'const float gradient = 1.5;',
	
	'void main(){',
		// Form the full matrix from the rows, cols then rows its weird!!
		'mat4 fullInstanceTransform;',
		'if(useInstancing){',
			'fullInstanceTransform = mat4(instanceMatrixRow0, instanceMatrixRow1, instanceMatrixRow2, instanceMatrixRow3);',
		'}',
		'else{',
			'fullInstanceTransform = mat4(  1,0,0,0 , 0,1,0,0, 0,0,1,0, 0,0,0,1);',
		'}',
	
		'vec4 worldPostion = model * vec4(position, 1.0) * fullInstanceTransform;', //needed for light and instancing
		//after its been transformed, rotated in world, we can use it
		
		//Fog
		'vec4 positionRelativeToCamera = viewMatrix * worldPostion;',
		
		// Particles
		'gl_PointSize = 5.0;',
		
		'gl_Position = projection * positionRelativeToCamera;',
		'',
		'',
		'vTextureCoord = aTextureCoord;',
		'surfaceNormal = (model * vec4(normal, 0.0)).xyz;', //will return 4d vector, so need to get xyz
		'surfaceToLightVector = lightPosition - worldPostion.xyz;', //4d vec, need 3d, so get xyz
		
		//Don't have camera position in the shader, so cant just subtract to get the toCameraVector
		//Do have the viewMatrix though, contains the negative camera position, so just inverse it
		'toCameraVector = (inverseViewMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz - worldPostion.xyz;', //cameraPosition - worldPostion
		
		//We have vec of vertex from the camera, so get distance from length of the vector
		'float distance = length(positionRelativeToCamera.xyz);',
		//Use that to calculate visibility
		'visibility = exp(-pow((distance*density), gradient));',
		//Ensure stays between 0 and 1
		'visibility = clamp(visibility, 0.0, 1.0);',
	'}'
].join('\n'));
gl.compileShader(vertexShader);
console.log("Vertex shader compliation status: " + gl.getShaderInfoLog(vertexShader));