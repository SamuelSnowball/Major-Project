
var sphereVertices = [];
var sphereNormals = [];
var sphereTextureCoordinates = [];
var sphereIndices = [];

var removedIndices;

/*
Have used code to create sphere information from:
http://learningwebgl.com/blog/?p=1253
*/
function makeSphere(latitudeBands, longitudeBands, radius){
			
	//var maxY = 0;
	//var minY = 0;
			
	var xOff = 0;
	var yOff = 0;
	var offsetIncrement = 0.01;
	var scale = 0.5;
			
    for (var latNumber = 0; latNumber <= latitudeBands; latNumber++) {
	
		var theta = latNumber * Math.PI / latitudeBands;
		var sinTheta = Math.sin(theta);
		var cosTheta = Math.cos(theta);

		for (var longNumber = 0; longNumber <= longitudeBands; longNumber++) {
			var phi = longNumber * 2 * Math.PI / longitudeBands;
			var sinPhi = Math.sin(phi);
			var cosPhi = Math.cos(phi);

			var x = cosPhi * sinTheta;
			var y = cosTheta;
			var z = sinPhi * sinTheta;
			var u = 1 - (longNumber / longitudeBands);
			var v = 1 - (latNumber / latitudeBands);

			/*
			var max = 1;
			var min = -1;
			var rand = Math.random() * (max-min+1) + min;
			//console.log(rand);
			x += rand /50;
			y += rand /50;
			z += rand /50;
			*/
			
			/*
			var value = noise.simplex2(xOff, yOff) * scale;
			console.log("v is: " + value);
			xOff += offsetIncrement;
			
			x += value;
			y += value;
			z += value;
			*/
			
			/*
			if(y > maxY){
				maxY = y; //Record highest Y value
			}
			
			if(y < minY){
				minY = y; //Record lowest value
			}
			*/
			
			sphereNormals.push(x);
			sphereNormals.push(y);
			sphereNormals.push(z);
			
			sphereTextureCoordinates.push(u);
			sphereTextureCoordinates.push(v);
			
			sphereVertices.push(radius * x);
			sphereVertices.push(radius * y);
			sphereVertices.push(radius * z);
		}
		xOff = 0;
		yOff += offsetIncrement;
	}
	  
	for (var latNumber = 0; latNumber < latitudeBands; latNumber++) {
		for (var longNumber = 0; longNumber < longitudeBands; longNumber++) {
			var first = (latNumber * (longitudeBands + 1)) + longNumber;
			var second = first + longitudeBands + 1;
			
			sphereIndices.push(first);
			sphereIndices.push(second);
			sphereIndices.push(first + 1);

			sphereIndices.push(second);
			sphereIndices.push(second + 1);
			sphereIndices.push(first + 1);
		}
	}
	
	/*
	console.log("max: " + maxY);
	console.log("min: " + minY);
	var heightCutOff = maxY - minY;
	//Then take the difference, and cut off below that value
	for(var i=0; i<sphereVertices.length; i+=3){
		var currentSphereX = sphereVertices[i];
		var currentSphereY = sphereVertices[i+1];
		var currentSphereZ = sphereVertices[i+2];
		
		if(currentSphereY < heightCutOff){
			//Remove all 3 verts, careful about other texture ones etc
			sphereVertices.splice(i, 3); //splice at the x, remove 3 values following?
			removedIndices += 3;
		}
	}
	
	for(var a=0; a<sphereIndices; a++){
		
	}
	*/
	
}

var spherePositionBuffer;
var sphereElementsBuffer;
var sphereTextureCoordinateBuffer;
function setupSphereBuffers(){

	spherePositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, spherePositionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphereVertices), gl.STATIC_DRAW);
	positionAttribLocation = gl.getAttribLocation(program, 'position');
	gl.enableVertexAttribArray(positionAttribLocation);
	gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, false, 0, 0);	
	
	sphereElementsBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereElementsBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(sphereIndices), gl.STATIC_DRAW);
	
	
	/*
	Create the buffer,
	Bind to it,
	Buffer the data
	*/
	sphereTextureCoordinateBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, sphereTextureCoordinateBuffer);

	
	/*
	var textureCoordinates = [];
	var xUV = 0;
	var yUV = 0;
	for(var x=0; x<terrainRows; x++){
		for(var y=0; y<terrainColumns; y++){
			textureCoordinates.push(xUV);  
			textureCoordinates.push(yUV); 
			xUV += 0.00390625;
		}
		xUV = 0;
		yUV += 0.00390625;
	}
	*/
	
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphereTextureCoordinates), gl.STATIC_DRAW);
	//gl.vertexAttribPointer(textureCoordLocation, 2, gl.FLOAT, false, 0, 0);
}

/*
Might not see sphere, as needs texture, try set pixels to all blue etc in texture
*/
var sphereScale = 5;
var sphereX = 0, 
	sphereY = 10, 
	sphereZ = 0;
function drawSphere(){
	scale = m4.scaling(sphereScale, sphereScale, sphereScale)
	xRotation = m4.xRotation(0);
	yRotation = m4.yRotation(0);
	zRotation = m4.zRotation(0);
	position = m4.translation(sphereX, sphereY, sphereZ);
	
	//Times matrices together
	updateAttributesAndUniforms();

	//Vertices
	gl.bindBuffer(gl.ARRAY_BUFFER, spherePositionBuffer);
	gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, false, 0, 0);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, sphereTextureCoordinateBuffer);
	gl.vertexAttribPointer(textureCoordLocation, 2, gl.FLOAT, false, 0, 0);
	gl.activeTexture(gl.TEXTURE0); //change eventually
	gl.bindTexture(gl.TEXTURE_2D, myTexture);
	gl.uniform1i(gl.getUniformLocation(program, "uSampler"), 0);
	
	
	//Elements
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereElementsBuffer);
	
	/*
	Mode
	Number of indices ( divide by 3 because 3 vertices per vertex ) then * 2 to get number of indices
	Type
	The indices
	*/
	gl.drawElements(
		gl.TRIANGLES, 
		sphereIndices.length,
		gl.UNSIGNED_SHORT,
		0
	); 
}