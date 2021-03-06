
/**
 * All rocks use the same OBJ model
 * This file generates translations to apply to the singular rock vertex set
 * The rocks are then instanced rendered
 * 
 * Uses the obj loader library: webgl-obj-loader from frenchtoast747 on GitHub
 * 	https://github.com/frenchtoast747/webgl-obj-loader
 * 	
 * Rock objs used and edited from (Public domain): 
 * 	http://nobiax.deviantart.com/art/Free-LowPoly-Rocks-set01-587036357
 * 
 * @class RockGenerator
*/	
function RockGenerator(){

	// Rock textures
	var rockTexture0 = new Texture('resources/rocks/0.png', 10, 0);
	var rockTexture1 = new Texture('resources/rocks/1.png', 10, 0);
	var rockTexture2 = new Texture('resources/rocks/2.png', 10, 0);
	var rockTexture3 = new Texture('resources/rocks/3.png', 10, 0);
	var rockTexture4 = new Texture('resources/rocks/4.png', 10, 0);
	var rockTexture5 = new Texture('resources/rocks/5.png', 10, 0);
	var rockTextures = []
	rockTextures.push(rockTexture0, rockTexture1, rockTexture2, rockTexture3, rockTexture4, rockTexture5);
		
	// OBJ text file
	var rockObjTextFile = utility.httpGet("resources/rocks/rockObjs/OBJ/21.txt");
	
	// Translations
	var translations = [];
	var buffers;
	
	// The mesh containing the rock data, we draw from this loads of times
	var mesh; 
	
	// The matrix that is going to be updated and stored.
	var testTransform = m4.translation(0,0,0);
	var testYRotation = m4.yRotation(Math.random());
	
	var meshArray = [];
	var buffersArray = [];
	
	// Temporary matrix column data for the rock matrices
	var data = [];
	
	// Need to find and set the height of the rock, at the generated X,Z position
	// So need to save all generated X and Z positions
	var savedXPositions = [];
	var savedZPositions = [];
	
	// Use the length of the rock (say, x) to calculate its width
	// Use scaleX and scaleZ to set the rocks height
	// The bigger the rock, the lower it should spawn
	var savedXScales = [];
	var savedZScales = [];

	/**
	@constructor
	*/
	buildAllRockData();
	
	/**
	For every terrain quadrant, generate a set of rocks for it
	
	@method buildAllRockData
	@private
	*/
	function buildAllRockData(){
		for(var x=0; x<terrain.get.getNumberQuadrantRows; x++){
			for(var z=0; z<terrain.get.getNumberQuadrantColumns; z++){
				setupInstancedRockBuffers(x, z);
			}
		}
	}
	
	/**
	Sets up the data needed to render the rocks
	
	Wouldn't want to render the quadrants rocks in the same place, 
	Need to apply different matrices per rock instance
	
	Generates lots of translation matrices to apply to the quadrants rocks
	Each quadrant has a random number of rocks from 0->512
	
	In the generateMatrices functions, rock size generation sizes:
		Generate big rock (low chance)
		Generate medium rock (mid chance)
 		Generate small rock (high chance)
		
	@method setupInstancedRockBuffers
	@private
	@param x {int} The x index of the quadrant to generate the rocks in, 
				   the actual position of the rock is calculated in this method
	@param z {int} The z index of the quadrant to generate the rocks in
				   the actual position of the rock is calculated in this method
	*/
	function setupInstancedRockBuffers(x, z){
		
		// Reset the mesh, need to attach new attributes
		mesh = new OBJ.Mesh(rockObjTextFile);
		OBJ.initMeshBuffers(gl, mesh);
		// Pull min/max numbers of rocks from GUI
		mesh.numInstances = utility.randomIntBetween(myGUI.get.ui_min_rocks, myGUI.get.ui_max_rocks);
		// Give rocks in this quadrant random texture
		mesh.texture = rockTextures[ Math.floor(Math.random() * 5) + 0]; 

		// Reset previous buffers, ready for new translations
		buffers = twgl.createBuffersFromArrays(gl, {
			position: [],
			indices: [],
			fullTransformsRow1: [],
			fullTransformsRow2: [],
			fullTransformsRow3: [],
			fullTransformsRow4: []
		});
		
		// Minimum spawn positions
		var xMin = x * 128;
		var zMin = z * 128;

		// Reset previous quadrant data
		data = [];
		savedXPositions = [];
		savedZPositions = [];
		savedXScales = [];
		savedZScales = [];
		
		/*
		Creates different translations for the rock instance

		Cant pass in a mat4 attribute into shader, 
		Instead need to pass in 4 vec4's (16 floats, 4x4 matrix)
		Then build the matrix in the shader from those 16 passed in floats
		
		Keep this order! Need to generate X and Z first, to set Y height
		*/		
		generateMatricesForTransformRow1(xMin);
		generateMatricesForTransformRow3(zMin);
		generateMatricesForTransformRow2();
		generateMatricesForTransformRow4();
		
		// The full matrix translations for the rock are now built
		// Push to buffersArray
		meshArray.push(mesh);
		buffersArray.push(buffers);
	}
	
	/**
	Read setupInstancedRockBuffers function comments first
	Sets up the 1st column of the matrix translation
	
	@method generateMatricesForTransformRow1
	@private
	@param xMin {int} the index to calculate where the minimum rock X spawn position should be
	*/
	function generateMatricesForTransformRow1(xMin){
		// Bind buffer, create all data, then buffer data
		// Then do the next row
		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.fullTransformsRow1);
		for(var i=0; i<mesh.numInstances; i++){	
			// yRotation rotates around the UP vector, so rotate rocks by yRotation matrix
			var testYRotation = m4.yRotation(Math.random(Math.PI * 2) + 0); // 0 -> Math.PI/2 (360 degrees)
			m4.multiply(testYRotation, testTransform, testTransform); // a, b, destination
			
			var sizeOfRock = Math.random() * 100;
			var scaleX;
			if(sizeOfRock > 95){ // Large rock 5% chance
				scaleX = utility.randomBetween(75, 100); 
			}
			else if(sizeOfRock > 75){ // Medium rock 20% chance
				scaleX = utility.randomBetween(35, 50); 
			}
			else{ // Small rock 75% chance
				scaleX = utility.randomBetween(5, 15); 
			}
			
			positionX = Math.floor(Math.random() * 128) + xMin;
			savedXPositions.push(positionX);
			savedXScales.push(scaleX);

			// form this into a full matrix, times by rotation, take correct values?
			data.push(
				testTransform[0] * scaleX,	
				testTransform[4], 
				testTransform[8], 
				positionX // x translation
			); 
		}
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
		gl.vertexAttribPointer(mainProgram.get.instancingLocation0, 4, gl.FLOAT, false, 0, 0);
	}
	
	/**
	Read setupInstancedRockBuffers function comments first
	Sets up the 2nd column of the matrix translation
	
	@method generateMatricesForTransformRow2
	@private
	*/
	function generateMatricesForTransformRow2(){
		/*
		Y
		*/
		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.fullTransformsRow2);
		data = [];
		for(var i=0; i<mesh.numInstances ; i++){
			// yRotation rotates around the UP vector, so rotate rocks by yRotation matrix
			var testYRotation = m4.yRotation(Math.random(Math.PI * 2) + 0); // 0 -> Math.PI * 2 (360 degrees)
			m4.multiply(testYRotation, testTransform, testTransform); // a, b, destination
			
			var scaleY = (savedXScales[i] + savedZScales[i])/4;
			
			terrain.heightMapValueAtIndex.setTemporaryHeightMapX = savedZPositions[i]; // Reversed
			terrain.heightMapValueAtIndex.setTemporaryHeightMapZ = savedXPositions[i]; // Reversed
			var rockPosition = terrain.heightMapValueAtIndex.getTemporaryHeightMapValue;
			
			// The bigger the rock, the lower it should spawn in the ground
			// Otherwise big rocks will stick off edges, looks weird
			rockPosition -= savedXScales[i]/40;

			data.push(
				testTransform[1], 
				testTransform[5] * scaleY, 
				testTransform[9], 
				rockPosition  // y translation
			); 
		}
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);	
		gl.vertexAttribPointer(mainProgram.get.instancingLocation1, 4, gl.FLOAT, false, 0, 0);	
	}

	/**
	Read setupInstancedRockBuffers function comments first
	Sets up the 3rd column of the matrix translation
	
	@method generateMatricesForTransformRow3
	@private
	@param zMin {int} the index to calculate where the minimum rock Z spawn position should be
	*/
	function generateMatricesForTransformRow3(zMin){
		/*
		Z
		*/
		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.fullTransformsRow3);
		data = [];
		for(var i=0; i<mesh.numInstances ; i++){
			// yRotation rotates around the UP vector, so rotate rocks by yRotation matrix
			var testYRotation = m4.yRotation(Math.random(Math.PI * 2) + 0); // 0 -> Math.PI * 2 (360 degrees)
			m4.multiply(testYRotation, testTransform, testTransform); // a, b, destination
			
			var scaleZ = savedXScales[i];
			savedZScales.push(scaleZ);

			positionZ = Math.floor(Math.random() * 128) + zMin;
			savedZPositions.push(positionZ);
			
			data.push(
				testTransform[2], 
				testTransform[6], 
				testTransform[10] * scaleZ,
				positionZ   // z translation
			); 
		}
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
		gl.vertexAttribPointer(mainProgram.get.instancingLocation2, 4, gl.FLOAT, false, 0, 0);		
	}

	/**
	Read setupInstancedRockBuffers function comments first
	Sets up the 4th column of the matrix translation
	
	@method generateMatricesForTransformRow4
	@private
	*/	
	function generateMatricesForTransformRow4(){
		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.fullTransformsRow4);
		data = [];
		for(var i=0; i<mesh.numInstances; i++){
			var testYRotation = m4.yRotation(Math.random(Math.PI * 2) + 0); // 0 -> Math.PI * 2 (360 degrees)
			m4.multiply(testYRotation, testTransform, testTransform); // a, b, destination
			
			data.push(
				testTransform[3], 
				testTransform[7], 
				testTransform[11], 
				testTransform[15]
			);
		}
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
		gl.vertexAttribPointer(mainProgram.get.instancingLocation3, 4, gl.FLOAT, false, 0, 0);
	}
	
	/**
	9 instanced draw calls
	Uses the terrain render indices to determine what rocks should be processed, then rendered
	
	See terrain.render for comments on terrain render indices
	
	@method renderInstancedRocks
	@public
	*/
	this.renderInstancedRocks = function(){

		// Reset matrices
		scale = m4.scaling(1, 1, 1);
		rotateX = m4.xRotation(0);
		rotateY = m4.yRotation(0);
		rotateZ = m4.zRotation(0);
		position = m4.translation(0, 0, 0);
		
		// Times matrices together
		mainProgram.updateAttributesAndUniforms();
		
		// Yes, want to use instancing
		// This will build the 4x4 matrix from the 1x4 matrix rows passed into the shader
		useInstancing = true;
		gl.uniform1i(mainProgram.get.useInstancingLocation, useInstancing);
		
		gl.enableVertexAttribArray(mainProgram.get.instancingLocation0);
		gl.enableVertexAttribArray(mainProgram.get.instancingLocation1);
		gl.enableVertexAttribArray(mainProgram.get.instancingLocation2);
		gl.enableVertexAttribArray(mainProgram.get.instancingLocation3);
	    
		// The indices to render, see terrain.render for comments
		var renderIndices = terrain.get.getRenderIndices;

		// 9 Draw calls, 1 per visible quadrant
		for(var i=0; i<renderIndices.length; i++){

			// Get the rocks texture
			currentTexture = meshArray[renderIndices[i]].texture;
			gl.activeTexture(gl.TEXTURE0);
			gl.uniform1i(gl.getUniformLocation(mainProgram.get.program, "uSampler"), 0);
			gl.bindTexture(gl.TEXTURE_2D, currentTexture.getTextureAttribute.texture);
			
			// Bind vertices
			gl.bindBuffer(gl.ARRAY_BUFFER, meshArray[renderIndices[i]].vertexBuffer);
			gl.enableVertexAttribArray(mainProgram.get.positionAttribLocation);
			gl.vertexAttribPointer(mainProgram.get.positionAttribLocation, 3, gl.FLOAT, false, 0, 0);
			
			// Bind UVs
			gl.bindBuffer(gl.ARRAY_BUFFER, meshArray[renderIndices[i]].textureBuffer);
			gl.enableVertexAttribArray(mainProgram.get.textureCoordLocation);
			gl.vertexAttribPointer(mainProgram.get.textureCoordLocation, 2, gl.FLOAT, false, 0, 0);
			
			// Bind normals
			gl.bindBuffer(gl.ARRAY_BUFFER, meshArray[renderIndices[i]].normalBuffer);
			gl.enableVertexAttribArray(mainProgram.get.normalAttribLocation);
			gl.vertexAttribPointer(mainProgram.get.normalAttribLocation, 3, gl.FLOAT, false, 0, 0);
			 
			// Bind the first transforms row
			gl.bindBuffer(gl.ARRAY_BUFFER, buffersArray[renderIndices[i]].fullTransformsRow1);
			gl.enableVertexAttribArray(mainProgram.get.instancingLocation0);
			gl.vertexAttribPointer(mainProgram.get.instancingLocation0, 4, gl.FLOAT, false, 0, 0);
			  
			// Bind the second transforms row 
			gl.bindBuffer(gl.ARRAY_BUFFER, buffersArray[renderIndices[i]].fullTransformsRow2);
			gl.enableVertexAttribArray(mainProgram.get.instancingLocation1);
			gl.vertexAttribPointer(mainProgram.get.instancingLocation1, 4, gl.FLOAT, false, 0, 0);
			
			// Bind the third transforms row
			gl.bindBuffer(gl.ARRAY_BUFFER, buffersArray[renderIndices[i]].fullTransformsRow3);
			gl.enableVertexAttribArray(mainProgram.get.instancingLocation2);
			gl.vertexAttribPointer(mainProgram.get.instancingLocation2, 4, gl.FLOAT, false, 0, 0);
				
			// Bind the forth transforms row					
			gl.bindBuffer(gl.ARRAY_BUFFER, buffersArray[renderIndices[i]].fullTransformsRow4);
			gl.enableVertexAttribArray(mainProgram.get.instancingLocation3);
			gl.vertexAttribPointer(mainProgram.get.instancingLocation3, 4, gl.FLOAT, false, 0, 0);

			// Bind indices
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, meshArray[renderIndices[i]].indexBuffer);
			 
			// Specify how values should vary between instance
			extension.vertexAttribDivisorANGLE(mainProgram.get.positionAttribLocation, 0);
			extension.vertexAttribDivisorANGLE(mainProgram.get.textureCoordLocation, 0); 
			extension.vertexAttribDivisorANGLE(mainProgram.get.normalAttribLocation, 0);
			extension.vertexAttribDivisorANGLE(mainProgram.get.instancingLocation0, 1);
			extension.vertexAttribDivisorANGLE(mainProgram.get.instancingLocation1, 1);
			extension.vertexAttribDivisorANGLE(mainProgram.get.instancingLocation2, 1);
			extension.vertexAttribDivisorANGLE(mainProgram.get.instancingLocation3, 1);
		
			/*
			This draw call is weird, uses indexBuffer.numItems instead of vertexBuffer.numItems
			*/
			extension.drawElementsInstancedANGLE(gl.TRIANGLES, meshArray[renderIndices[i]].indexBuffer.numItems, gl.UNSIGNED_SHORT, 0, meshArray[renderIndices[i]].numInstances);
		}
		
		// Disable instancing now
		useInstancing = false;
		gl.uniform1i(mainProgram.get.useInstancingLocation, useInstancing);
		
		gl.disableVertexAttribArray(mainProgram.get.instancingLocation0);
		gl.disableVertexAttribArray(mainProgram.get.instancingLocation1);
		gl.disableVertexAttribArray(mainProgram.get.instancingLocation2);
		gl.disableVertexAttribArray(mainProgram.get.instancingLocation3);
	}
	
	/*
	TESTING FUNCTIONS BELOW
	*/
	
	/**
	Test rockGenerator textures
	
	@method test_rock_generator_textures
	@public
	*/
	this.test_rock_generator_textures = function(){
		for(var i=0; i<rockTextures.length; i++){
			testerObject.test_is_texture("rockTexture" + i, rockTextures[i].getTextureAttribute.texture);
		}
	}

	
	/**
	Test column 1 of matrix applied to the rock instance at a time, 
	Test mesh.numInstances is correct length
	The data array contains values for the one column only, at a time
	
	@example
	
	Parameter: the column it was called for, to print correct error message
	
	(First time being called, uses this column)
	
	[0, x, x, x]
	
	 4, x, x, x]
	 
	 8, x, x, x]
	 
	 12 x, x, x]
	 
	@method test_matricesForTransformRow
	@public
	@param column {int} the matrix column to test
	*/
	this.test_matricesForTransformRow = function(column){
		var error = false;
		
		if(mesh.numInstances !== data.length/4){
			console.error("In generateMatricesForTransformRow" + column +": mesh.numInstances wasn't correct length");
		}
	
		for(var i=0; i<mesh.numInstances; i++){
			if(isNaN(data[i])){
				error = true; // report an error when done
			}
		}	
			
		if(error){
			console.error("In generateMatricesForTransformRow" + column + ": one or more matrix value was NaN");
		}
	}
	
}

