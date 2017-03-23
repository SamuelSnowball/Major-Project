		
function RockGenerator(){

	//Obj text files
	var objRockText0 = utility.httpGet("resources/rocks/rockObjs/rock_0.txt");
	var objRockText1 = utility.httpGet("resources/rocks/rockObjs/rock_1.txt");
	var objRockText2 = utility.httpGet("resources/rocks/rockObjs/rock_2.txt");
	var objRockText3 = utility.httpGet("resources/rocks/rockObjs/rock_3.txt");
	var objRockText4 = utility.httpGet("resources/rocks/rockObjs/rock_4.txt");
	var objRockText5 = utility.httpGet("resources/rocks/rockObjs/rock_5.txt");
	
	var low_poly_obj_rock_0 = utility.httpGet("resources/rocks/rockObjs/low_poly_rock_0.txt");
	var low_poly_obj_rock_1 = utility.httpGet("resources/rocks/rockObjs/low_poly_rock_1.txt");
	
	var new1 = utility.httpGet("resources/rocks/rockObjs/new.txt");
	var new2 = utility.httpGet("resources/rocks/rockObjs/new2.txt");
	var new3 = utility.httpGet("resources/rocks/rockObjs/new3.txt");
	
	//Data
	var rockIndices = [];
	var rockVertices = [];
	var rockNormals = [];
	var rockUvs = [];
	var previousNumIndices = 0;
	
	//Buffers
	var rockUvsBuffer;
	var rockIndicesBuffer;
	var rockVerticesBuffer;
	var rockNormalsBuffer;
	
	var translations = [];
	var translationBuffer;
	var numInstances = 10000;
	var buffers;
	
	//var testTransform;// = m4.translation(310, 5, 310) * m4.xRotation(1) * m4.scale(4, 4, 4);
	var testTransform = m4.translation(310, 5, 310);
	//var testXRotation = m4.xRotation(1);
	var testScale = m4.scaling(4, 4, 4);
	
	//testTransform = m4.multiply(testTransform, testXRotation);
	testTransform = m4.multiply(testTransform, testScale);
	
	console.log(testTransform);
	
	//createInstancedRocksForQuadrant(); // MAKES VERTS
	//setupInstancedRocks();
	seutpInstancedRockBuffers(); // SETUPS UP BUFFERS
	
	
	/*
	function setupInstancedRocks(){	
		// For each quadrant, generate translations for the single rock mesh
		for(var i=0; i<numInstances; i++){
			addTranslations();
		}
	}
	*/
	
		var mesh;
	function seutpInstancedRockBuffers(){
	/*
		rockVerticesBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, rockVerticesBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rockVertices), gl.DYNAMIC_DRAW);
		gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, false, 0, 0);
		
		rockIndicesBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, rockIndicesBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Float32Array(rockIndices), gl.DYNAMIC_DRAW);

		rockNormalsBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, rockNormalsBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rockNormals), gl.DYNAMIC_DRAW);
		gl.vertexAttribPointer(normalAttribLocation, 3, gl.FLOAT, false, 0, 0);
		
		rockUvsBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, rockUvsBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rockUvs), gl.DYNAMIC_DRAW);
		gl.vertexAttribPointer(textureCoordLocation, 2, gl.FLOAT, false, 0, 0);	
		
		//translations
		translationBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, translationBuffer);
		translations.push(310, 5, 310, 315, 5, 315);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(translations), gl.DYNAMIC_DRAW);
		gl.vertexAttribPointer(instancingLocation, 3, gl.FLOAT, false, 0, 0);	
	*/
		
		
	//low_poly_obj_rock_0	
	//objRockText0
	// the problem is, the faces are made of quads or something, but need to split into triangles
	mesh = new OBJ.Mesh(new3);
	OBJ.initMeshBuffers(gl, mesh);
	
	console.log(mesh.vertexBuffer.numItems);
	
	buffers = twgl.createBuffersFromArrays(gl, {
	position: [],
	indices: [],
	//numbers could be other way around, like 0->1 going down rather than accross
	fullTransformsRow0: [],//[testTransform[0], testTransform[4], testTransform[8], testTransform[12]],
	fullTransformsRow1: [],//[testTransform[1], testTransform[5], testTransform[9], testTransform[13]],
	fullTransformsRow2: [],//[testTransform[2], testTransform[6], testTransform[10], testTransform[14]],
	fullTransformsRow3: []//[testTransform[3], testTransform[7], testTransform[11], testTransform[15]]
});
	
	// Set Y with the heightmap thing
	
	// Bind, do ALL data, then bufferData
	// Then do the next row
	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.fullTransformsRow0);
	var data = [];
	for(var i=0; i<numInstances; i++){
		data.push(testTransform[0], testTransform[4], testTransform[8], Math.random() * 512); //testTransform[12]
	}
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.DYNAMIC_DRAW);
	
	
	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.fullTransformsRow1);
	data = [];
	for(var i=0; i<numInstances; i++){
		data.push(testTransform[1], testTransform[5], testTransform[9], Math.random() * 512); //testTransform[13]
	}
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.DYNAMIC_DRAW);
	
	
	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.fullTransformsRow2);
	data = [];
	for(var i=0; i<numInstances; i++){
		data.push(testTransform[2], testTransform[6], testTransform[10], Math.random() * 512); //testTransform[14
	}
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.DYNAMIC_DRAW);
	
	
	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.fullTransformsRow3);
	data = [];
	for(var i=0; i<numInstances; i++){
		data.push(testTransform[3], testTransform[7], testTransform[11], testTransform[15]);
	}
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.DYNAMIC_DRAW);
	

	}
	
	
	/*
	Try with twgl helper library, see if still out of range verts in atribute 0
	*/
	this.renderInstancedRocks = function(){
		gl.disableVertexAttribArray(normalAttribLocation);
		gl.disableVertexAttribArray(textureCoordLocation);
		
		// 0 //gl.bindBuffer(gl.ARRAY_BUFFER, rockVerticesBuffer);
		// 0 //gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, false, 0, 0);
		
		//gl.bindBuffer(gl.ARRAY_BUFFER, translationBuffer);
		//gl.enableVertexAttribArray(instancingLocation);
		//gl.vertexAttribPointer(instancingLocation, 3, gl.FLOAT, false, 0, 0);
		
		//gl.bindBuffer(gl.ARRAY_BUFFER, rockUvsBuffer);
		//gl.vertexAttribPointer(textureCoordLocation, 2, gl.FLOAT, false, 0, 0);	
		//
		//gl.bindBuffer(gl.ARRAY_BUFFER, rockNormalsBuffer);
		//gl.vertexAttribPointer(normalAttribLocation, 3, gl.FLOAT, false, 0, 0);	
		  
		// 0 // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, rockIndicesBuffer);
		  
		// 0 // extension.vertexAttribDivisorANGLE(positionAttribLocation, 0);
	//	extension.vertexAttribDivisorANGLE(instancingLocation, 1);
	
		//extension.vertexAttribDivisorANGLE(textureCoordLocation, 1);
		//extension.vertexAttribDivisorANGLE(normalAttribLocation, 1);
		
		// need matrix location here?, updateAttributesAndUniforms() ??  
		// extension.drawElementsInstancedANGLE(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0, numInstances);
	
	
	
	useInstancing = true;
	gl.uniform1i(useInstancingLocation, useInstancing);
		
	//gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
	gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vertexBuffer);
	gl.enableVertexAttribArray(positionAttribLocation);
	gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, false, 0, 0);
	  
	// need normals and UVS and vertexAttribDivisorANGLE them
	  
	// mesh.index buffer
	 
	 // change shader to matrix4 attribute
	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.fullTransformsRow0);
	gl.enableVertexAttribArray(instancingLocation0);
	gl.vertexAttribPointer(instancingLocation0, 4, gl.FLOAT, false, 0, 0);
	  
	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.fullTransformsRow1);
	gl.enableVertexAttribArray(instancingLocation1);
	gl.vertexAttribPointer(instancingLocation1, 4, gl.FLOAT, false, 0, 0);
		
	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.fullTransformsRow2);
	gl.enableVertexAttribArray(instancingLocation2);
	gl.vertexAttribPointer(instancingLocation2, 4, gl.FLOAT, false, 0, 0);
		 
	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.fullTransformsRow3);
	gl.enableVertexAttribArray(instancingLocation3);
	gl.vertexAttribPointer(instancingLocation3, 4, gl.FLOAT, false, 0, 0);
	  
	//gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
	  
	extension.vertexAttribDivisorANGLE(positionAttribLocation, 0);
	extension.vertexAttribDivisorANGLE(instancingLocation0, 1);
	extension.vertexAttribDivisorANGLE(instancingLocation1, 1);
	extension.vertexAttribDivisorANGLE(instancingLocation2, 1);
	extension.vertexAttribDivisorANGLE(instancingLocation3, 1);

	/*
	This draw call is weird, because of the faces in the low poly obj rock files.
	
	Advice I used:
		"It’s probably a convex polygonal face
		You may be safe in triangulating it as a triangle fan"
	
	For the low poly objs I changed:
		gl.TRIANGLES to gl.TRIANGLE_FAN
		mesh.vertexBuffer.numItems to mesh.indexBuffer.numItems
	*/
	extension.drawElementsInstancedANGLE(gl.TRIANGLE_FAN, mesh.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0, numInstances);
		
	useInstancing = false;
	gl.uniform1i(useInstancingLocation, useInstancing);
	
	gl.disableVertexAttribArray(instancingLocation0);
	gl.disableVertexAttribArray(instancingLocation1);
	gl.disableVertexAttribArray(instancingLocation2);
	gl.disableVertexAttribArray(instancingLocation3);
	
	gl.enableVertexAttribArray(textureCoordLocation);
	gl.enableVertexAttribArray(normalAttribLocation);	

	}
	//
	//function addTranslations(){
	//	translations.push(Math.random() * 50, Math.random() * 50, Math.random() * 50);
	//}
	
	function setupTranslationBuffer(){
		translationBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, translationBuffer);
		//gl.enableVertexAttribArray(instancingLocation);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(translations), gl.DYNAMIC_DRAW);
		gl.vertexAttribPointer(instancingLocation, 3, gl.FLOAT, false, 0, 0);
	}
	
	
	
	/*
	Add to quadrant vertices?
		Get halfway into the array
		Then swap texture, and gldrawinstanced the rest?
		
	Or new VAOs array, requires copying code
		Use existing functions?
	*/
	function createInstancedRocksForQuadrant(){
		
			rockVertices.push(  
					// Front face
				  -1.0, -1.0,  1.0,
				   1.0, -1.0,  1.0,
				   1.0,  1.0,  1.0,
				  -1.0,  1.0,  1.0,
				  
				  // Back face
				  -1.0, -1.0, -1.0,
				  -1.0,  1.0, -1.0,
				   1.0,  1.0, -1.0,
				   1.0, -1.0, -1.0,
				  
				  // Top face
				  -1.0,  1.0, -1.0,
				  -1.0,  1.0,  1.0,
				   1.0,  1.0,  1.0,
				   1.0,  1.0, -1.0,
				  
				  // Bottom face
				  -1.0, -1.0, -1.0,
				   1.0, -1.0, -1.0,
				   1.0, -1.0,  1.0,
				  -1.0, -1.0,  1.0,
				  
				  // Right face
				   1.0, -1.0, -1.0,
				   1.0,  1.0, -1.0,
				   1.0,  1.0,  1.0,
				   1.0, -1.0,  1.0,
				  
				  // Left face
				  -1.0, -1.0, -1.0,
				  -1.0, -1.0,  1.0,
				  -1.0,  1.0,  1.0,
				  -1.0,  1.0, -1.0
			 );
			 
			rockNormals.push(
				//1
					0.5, 0.5, 0.5,
					0.5, 0.5, 0.5,
					0.5, 0.5, 0.5,
					0.5, 0.5, 0.5,
				//2           
					0.5, 0.5, 0.5,
					0.5, 0.5, 0.5,
					0.5, 0.5, 0.5,
					0.5, 0.5, 0.5,
				//3           
					0.5, 0.5, 0.5,
					0.5, 0.5, 0.5,
					0.5, 0.5, 0.5,
					0.5, 0.5, 0.5,
				//4           
					0.5, 0.5, 0.5,
					0.5, 0.5, 0.5,
					0.5, 0.5, 0.5,
					0.5, 0.5, 0.5,
				//5           
					0.5, 0.5, 0.5,
					0.5, 0.5, 0.5,
					0.5, 0.5, 0.5,
					0.5, 0.5, 0.5,
				//6           
					0.5, 0.5, 0.5,
					0.5, 0.5, 0.5,
					0.5, 0.5, 0.5,
					0.5, 0.5, 0.5			
					
				);
				
			rockUvs.push(
				0.5, 0.5,
				0.5, 0.5,
				0.5, 0.5,
				0.5, 0.5,
						 
				0.5, 0.5,
				0.5, 0.5,
				0.5, 0.5,
				0.5, 0.5,
						 
				0.5, 0.5,
				0.5, 0.5,
				0.5, 0.5,
				0.5, 0.5,
						 
				0.5, 0.5,
				0.5, 0.5,
				0.5, 0.5,
				0.5, 0.5,
						 
				0.5, 0.5,
				0.5, 0.5,
				0.5, 0.5,
				0.5, 0.5,
						 
				0.5, 0.5,
				0.5, 0.5,
				0.5, 0.5,
				0.5, 0.5
			);
			
			rockIndices.push(
				0,  1,  2,      0,  2,  3,    // front
				4,  5,  6,      4,  6,  7,    // back
				8,  9,  10,     8,  10, 11,   // top
				12, 13, 14,     12, 14, 15,   // bottom
				16, 17, 18,     16, 18, 19,   // right
				20, 21, 22,     20, 22, 23    // left
			);
			
	}	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	//Rock arrays, need to be visible in collisonTester, needs to have getter
	var rocks = [];
	this.getRocksArray = {
		get getRocks(){
			return rocks;
		}
	}
	var rockObjs = [];
	this.getObjRocksArray = {
		get getRocks(){
			return rockObjs;
		}
	}

	function Rock(xPos, yPos, zPos, width, xRotation, yRotation, zRotation, scale, texture, numIndices, id){
		this.x = xPos;
		this.y = yPos;
		this.z = zPos;
		this.width = width;
		this.xRotation = xRotation;
		this.yRotation = yRotation;
		this.zRotation = zRotation;
		this.scale = scale;
		this.texture = texture;
		this.numIndices = numIndices;
		this.id = id;
	}
	
	//createRocks();
	
	function createRocks(){
		//numRocks = 3;
		for(var i=0; i<25; i++){
			createObjRock(objRockText0, rockTexture0, 0, 0);
			createObjRock(objRockText0, rockTexture1, 1, 0);
			createObjRock(objRockText1, rockTexture2, 2, 1);
			createObjRock(objRockText1, rockTexture3, 3, 1);
			createObjRock(objRockText1, rockTexture4, 4, 2);
			createObjRock(objRockText2, rockTexture5, 5, 2);
			// Still can use rockText 3 and higher
			// Also need different sections as dont fit max 1536x1536
		}
	}
	
	/*
	Parameter, the obj file to use
	*/
	function createObjRock(objText, texture, id, area){
		
		var minXSpawn, maxXSpawn;
		var minZSpawn, maxZSpawn;
		switch(area){
			case 0:
				minXSpawn = 0;
				maxXSpawn = 512;
				minZSpawn = 0;
				maxZSpawn = 512;
				break;
			case 1:
				minXSpawn = 0;
				maxXSpawn = 512;
				minZSpawn = 512;
				maxZSpawn = 1024;
				break;
			case 2:
				minXSpawn = 512;
				maxXSpawn = 1024;
				minZSpawn = 0;
				maxZSpawn = 512;
				break;
			case 3:
				minXSpawn = 512;
				maxXSpawn = 1024;
				minZSpawn = 512;
				maxZSpawn = 1024;
				break;				
		}
	
		var mesh = new OBJ.Mesh(objText);
		OBJ.initMeshBuffers(gl, mesh);

		// Generate x,z position, use those to find the rock height
		var positionX = utility.randomIntBetween( minXSpawn, maxXSpawn );
		var positionZ = utility.randomIntBetween( minZSpawn, maxZSpawn );
		terrain.heightMapValueAtIndex.setTemporaryHeightMapX = positionZ;
		terrain.heightMapValueAtIndex.setTemporaryHeightMapZ = positionX;
		var rockHeight = terrain.heightMapValueAtIndex.getTemporaryHeightMapValue;
		
		mesh.x = positionX;
		mesh.y = rockHeight;
		mesh.z = positionZ;
		
		mesh.xRotation = Math.random();
		mesh.yRotation = Math.random();
		mesh.zRotation = Math.random();
		
		mesh.texture = texture;
		mesh.scale = Math.floor(Math.random() * 5) + 0;
		
		mesh.id = id;

		rockObjs.push(mesh);
	}

	
	/*
	Renders the .obj rocks loaded in
	*/
	this.renderObjRocks = function(){
		var startPosition = 0;

		for(var i=0; i<rockObjs.length; i++){

			// Get the distance from the player to the rock
			var distance = Math.sqrt( 
				Math.pow( (rockObjs[i].x - cameraPosition[0]), 2) +
				Math.pow( (rockObjs[i].y - cameraPosition[1]), 2) +
				Math.pow( (rockObjs[i].z - cameraPosition[2]), 2) 
			);
				
			if(distance > 180){
				// Rock too far away from player, don't render 
			}
			else{
				lightColour = [1, 1, 1];
				currentTexture = rockObjs[i].texture;
					
				scale = m4.scaling(rockObjs[i].scale, rockObjs[i].scale, rockObjs[i].scale);
				rotateX = m4.xRotation(rockObjs[i].xRotation);
				rotateY = m4.yRotation(rockObjs[i].yRotation);
				rotateZ = m4.zRotation(rockObjs[i].zRotation);
				position = m4.translation(rockObjs[i].x, rockObjs[i].y, rockObjs[i].z);
				
				//Times matrices together
				updateAttributesAndUniforms();
				
				gl.bindBuffer(gl.ARRAY_BUFFER, rockObjs[i].vertexBuffer);
				gl.vertexAttribPointer(positionAttribLocation, rockObjs[i].vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

				gl.enableVertexAttribArray(textureCoordLocation);
				gl.bindBuffer(gl.ARRAY_BUFFER, rockObjs[i].textureBuffer);
				gl.activeTexture(gl.TEXTURE0);
				gl.bindTexture(gl.TEXTURE_2D, currentTexture.getTextureAttribute.texture);
				gl.uniform1i(gl.getUniformLocation(program, "uSampler"), 0);
				gl.vertexAttribPointer(textureCoordLocation, rockObjs[i].textureBuffer.itemSize, gl.FLOAT, false, 0, 0);

				gl.bindBuffer(gl.ARRAY_BUFFER, rockObjs[i].normalBuffer);
				gl.vertexAttribPointer(normalAttribLocation, rockObjs[i].normalBuffer.itemSize, gl.FLOAT, false, 0, 0);

				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, rockObjs[i].indexBuffer);
				
				//rockObjs could still contain how much to index!!!! keep it
				gl.drawElements(gl.TRIANGLES, rockObjs[i].indexBuffer.numItems, gl.UNSIGNED_SHORT, startPosition);

				if(i === rockObjs.length-1){
					//Reset the start position
					startPosition = 0;
				}
				else{
					startPosition += rockObjs[i].numItems;
				}		
			}
		}
	}
	
}


