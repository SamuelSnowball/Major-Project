/*
Vertex shader 
*/
var vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, [
	'attribute vec3 position;',
	'attribute vec2 aTextureCoord;',
	'varying highp vec2 vTextureCoord;',
	
	'uniform mat4 viewMatrix;',
	'uniform mat4 inverseViewMatrix;', //glsl inverse doesn't work
	'uniform mat4 model;',
	'uniform mat4 projection;',
	
	
	'uniform vec3 lightPosition;',
	'attribute vec3 normal;', //attribute = in
	'varying vec3 surfaceNormal;', //varying = out
	'varying vec3 surfaceToLightVector;',
	
	//For specular
	'varying vec3 toCameraVector;',
	
	'void main(){',
		'vec4 worldPostion = model * vec4(position, 1.0);', //needed for light, 
		//after its been transformed, rotated in world, we can use it
		'gl_Position = projection * viewMatrix * worldPostion;',
		'',
		'gl_PointSize = 5.0;',
		'',
		'vTextureCoord = aTextureCoord;',
		'surfaceNormal = (model * vec4(normal, 0.0)).xyz;', //will return 4d vector, so need to get xyz
		'surfaceToLightVector = lightPosition - worldPostion.xyz;', //4d vec, need 3d, so get xyz
		
		//Dont have camera position in the shader, so cant just subtract to get the toCameraVector
		//Do have the viewMatrix though, contains the negative camera position, so just inverse it
		'toCameraVector = (inverseViewMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz - worldPostion.xyz;', //cameraPosition - worldPostion
	'}'
].join('\n'));
gl.compileShader(vertexShader);
console.log("Vertex shader compliation status: " + gl.getShaderInfoLog(vertexShader));