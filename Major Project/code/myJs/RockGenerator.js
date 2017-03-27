		
function RockGenerator(){

	// Obj text files
	var rock21 = utility.httpGet("resources/rocks/rockObjs/objmaster2/obj/21.txt");
	var rock29 = utility.httpGet("resources/rocks/rockObjs/objmaster2/obj/29.txt");
	var rock30 = utility.httpGet("resources/rocks/rockObjs/objmaster2/obj/30.txt");
	var rock31 = utility.httpGet("resources/rocks/rockObjs/objmaster2/obj/31.txt");
	var rock32 = utility.httpGet("resources/rocks/rockObjs/objmaster2/obj/32.txt");
	
	// Data
	var rockIndices = [];
	var rockVertices = [];
	var rockNormals = [];
	var rockUvs = [];
	var previousNumIndices = 0;
	
	// Buffers
	var rockUvsBuffer;
	var rockIndicesBuffer;
	var rockVerticesBuffer;
	var rockNormalsBuffer;
	
	var translations = [];
	var translationBuffer;
	var numInstances = 1024; // Per quadrant!
	var buffers;
	
	var rockVAOs = [];
	
	// The mesh containing the rock data, we draw from this loads of times
	var mesh; 
	
	/*
	The matrix that is going to be updated and stored.
	*/
	var testTransform = m4.translation(0,0,0);
	var testYRotation = m4.yRotation(Math.random());
	m4.multiply(testYRotation, testTransform, testTransform); // a, b, destination
	
	var meshArray = [];
	var buffersArray = [];
	
	buildAllRockData();
	
	function buildAllRockData(){
		for(var x=0; x<terrain.get.getNumberQuadrantRows; x++){
			for(var z=0; z<terrain.get.getNumberQuadrantColumns; z++){
				setupInstancedRockBuffers(x, z);
			}
		}
	}
	
	function setupInstancedRockBuffers(x, z){
	
		mesh = new OBJ.Mesh(rock21);
		OBJ.initMeshBuffers(gl, mesh);

		buffers = twgl.createBuffersFromArrays(gl, {
			position: [],
			indices: [],
			fullTransformsRow0: [],
			fullTransformsRow1: [],
			fullTransformsRow2: [],
			fullTransformsRow3: []
		});
		
		/*
		These loops create different translations for the rock instance.
		Wouldn't want to render 10,000 rocks in the same place, 
		Need to apply different matrices per rock instance
		
		Cant pass in a mat4 attribute into shader, 
		Instead need to pass in 4 vec4's (16 floats, 4x4 matrix)
		Then build the matrix in the shader from those 16 passed in floats
		
		yRotation rotates around the UP vector, so rotate rocks by yRotation matrix
		*/
		var data = [];
		
		// Minimum spawn positions
		var xMin = x * 128;
		var zMin = z * 128;
		
		// Need to find and set the height of the rock, at the generated X,Z position
		// So need to save all generated X and Z positions
		var savedXPositions = [];
		var savedZPositions = [];

		// Bind buffer, create all data, then buffer data
		// Then do the next row
		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.fullTransformsRow0);
		for(var i=0; i<numInstances; i++){	
			var testYRotation = m4.yRotation(Math.random(Math.PI * 2) + 0); // 0 -> Math.PI/2 (360 degrees)
			m4.multiply(testYRotation, testTransform, testTransform); // a, b, destination
			
			var scaleX = (Math.random() * 50) + 5;
			
			positionX = Math.floor(Math.random() * 128) + xMin;
			savedXPositions.push(positionX);

			data.push(
				scaleX * testTransform[0], //Scale X first	
				testTransform[4], 
				testTransform[8], 
				positionX // x translation
			); 
		}
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
		gl.vertexAttribPointer(instancingLocation0, 4, gl.FLOAT, false, 0, 0);
		
		/*
		Z
		*/
		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.fullTransformsRow2);
		data = [];
		for(var i=0; i<numInstances; i++){

			var testYRotation = m4.yRotation(Math.random(Math.PI * 2) + 0); // 0 -> Math.PI/2 (360 degrees)
			m4.multiply(testYRotation, testTransform, testTransform); // a, b, destination
			
			var scaleZ = (Math.random() * 50) + 5;
			
			positionZ = Math.floor(Math.random() * 128) + zMin;
			
			savedZPositions.push(positionZ);
			data.push(
				testTransform[2], 
				testTransform[6], 
				scaleZ * testTransform[10], // Scale Z first
				positionZ   // z translation
			); 
		}
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
		gl.vertexAttribPointer(instancingLocation2, 4, gl.FLOAT, false, 0, 0);
		
		/*
		Y
		*/
		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.fullTransformsRow1);
		data = [];
		for(var i=0; i<numInstances; i++){
			var testYRotation = m4.yRotation(Math.random(Math.PI * 2) + 0); // 0 -> Math.PI/2 (360 degrees)
			m4.multiply(testYRotation, testTransform, testTransform); // a, b, destination
			
			var scaleY = (Math.random() * 25) + 5;
			
			terrain.heightMapValueAtIndex.setTemporaryHeightMapX = savedZPositions[i]; // Reversed
			terrain.heightMapValueAtIndex.setTemporaryHeightMapZ = savedXPositions[i]; // Reversed
			var rockHeight = terrain.heightMapValueAtIndex.getTemporaryHeightMapValue;

			data.push(
				testTransform[1], 
				scaleY * testTransform[5], // Scale Y first
				testTransform[9], 
				rockHeight  // y translation
			); 
		}
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);	
		gl.vertexAttribPointer(instancingLocation1, 4, gl.FLOAT, false, 0, 0);
		
		
		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.fullTransformsRow3);
		data = [];
		for(var i=0; i<numInstances; i++){
			data.push(
				testTransform[3], 
				testTransform[7], 
				testTransform[11], 
				testTransform[15]
			);
		}
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
		gl.vertexAttribPointer(instancingLocation3, 4, gl.FLOAT, false, 0, 0);

		
		meshArray.push(mesh);
		buffersArray.push(buffers);
	}
	
	
	this.renderInstancedRocks = function(){

		//6->8 nice
		currentTexture = rockTexture6;
		gl.activeTexture(gl.TEXTURE0);
		gl.uniform1i(gl.getUniformLocation(program, "uSampler"), 0);
		gl.bindTexture(gl.TEXTURE_2D, currentTexture.getTextureAttribute.texture);
			
		useInstancing = true;
		gl.uniform1i(useInstancingLocation, useInstancing);
		
		gl.enableVertexAttribArray(instancingLocation0);
		gl.enableVertexAttribArray(instancingLocation1);
		gl.enableVertexAttribArray(instancingLocation2);
		gl.enableVertexAttribArray(instancingLocation3);

		var renderIndices = terrain.get.renderIndices;
		
		for(var i=0; i<renderIndices.length; i++){
			gl.bindBuffer(gl.ARRAY_BUFFER, meshArray[renderIndices[i]].vertexBuffer);
			gl.enableVertexAttribArray(positionAttribLocation);
			gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, false, 0, 0);
			
			gl.bindBuffer(gl.ARRAY_BUFFER, meshArray[renderIndices[i]].textureBuffer);
			gl.enableVertexAttribArray(textureCoordLocation);
			gl.vertexAttribPointer(textureCoordLocation, 2, gl.FLOAT, false, 0, 0);
			
			gl.bindBuffer(gl.ARRAY_BUFFER, meshArray[renderIndices[i]].normalBuffer);
			gl.enableVertexAttribArray(normalAttribLocation);
			gl.vertexAttribPointer(normalAttribLocation, 3, gl.FLOAT, false, 0, 0);
			  
			gl.bindBuffer(gl.ARRAY_BUFFER, buffersArray[renderIndices[i]].fullTransformsRow0);
			gl.enableVertexAttribArray(instancingLocation0);
			gl.vertexAttribPointer(instancingLocation0, 4, gl.FLOAT, false, 0, 0);
			  
			gl.bindBuffer(gl.ARRAY_BUFFER, buffersArray[renderIndices[i]].fullTransformsRow1);
			gl.enableVertexAttribArray(instancingLocation1);
			gl.vertexAttribPointer(instancingLocation1, 4, gl.FLOAT, false, 0, 0);
				
			gl.bindBuffer(gl.ARRAY_BUFFER, buffersArray[renderIndices[i]].fullTransformsRow2);
			gl.enableVertexAttribArray(instancingLocation2);
			gl.vertexAttribPointer(instancingLocation2, 4, gl.FLOAT, false, 0, 0);
				 
			gl.bindBuffer(gl.ARRAY_BUFFER, buffersArray[renderIndices[i]].fullTransformsRow3);
			gl.enableVertexAttribArray(instancingLocation3);
			gl.vertexAttribPointer(instancingLocation3, 4, gl.FLOAT, false, 0, 0);

			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, meshArray[renderIndices[i]].indexBuffer);
			  
			extension.vertexAttribDivisorANGLE(positionAttribLocation, 0);
			extension.vertexAttribDivisorANGLE(textureCoordLocation, 0); 
			extension.vertexAttribDivisorANGLE(normalAttribLocation, 0);
			extension.vertexAttribDivisorANGLE(instancingLocation0, 1);
			extension.vertexAttribDivisorANGLE(instancingLocation1, 1);
			extension.vertexAttribDivisorANGLE(instancingLocation2, 1);
			extension.vertexAttribDivisorANGLE(instancingLocation3, 1);

			/*
			This draw call is weird,
			Uses indexBuffer.numItems instead of vertexBuffer.numItems
			*/
			extension.drawElementsInstancedANGLE(gl.TRIANGLES, meshArray[renderIndices[i]].indexBuffer.numItems, gl.UNSIGNED_SHORT, 0, numInstances);
		}
						
		useInstancing = false;
		gl.uniform1i(useInstancingLocation, useInstancing);
		
		gl.disableVertexAttribArray(instancingLocation0);
		gl.disableVertexAttribArray(instancingLocation1);
		gl.disableVertexAttribArray(instancingLocation2);
		gl.disableVertexAttribArray(instancingLocation3);
		
	}
	
}

