		
function RockGenerator(){

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
	var numInstances = 5;
	var buffers;
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
	buffers = twgl.createBuffersFromArrays(gl, {
  position: [  // one face
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
  ],
  indices: 		[		0,  1,  2,      0,  2,  3,    // front
				4,  5,  6,      4,  6,  7,    // back
				8,  9,  10,     8,  10, 11,   // top
				12, 13, 14,     12, 14, 15,   // bottom
				16, 17, 18,     16, 18, 19,   // right
				20, 21, 22,     20, 22, 23 ],   // left 
  translation: [310,5,310,
				315,5,315,
				325,8,325,
				335,9,335,
				345,10,345],
});
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
		
		
	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
	  gl.enableVertexAttribArray(positionAttribLocation);
	  gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, false, 0, 0);
	  
	  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.translation);
	  gl.enableVertexAttribArray(instancingLocation);
	  gl.vertexAttribPointer(instancingLocation, 3, gl.FLOAT, false, 0, 0);
	  
	  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
	  
	  extension.vertexAttribDivisorANGLE(positionAttribLocation, 0);
	   extension.vertexAttribDivisorANGLE(instancingLocation, 1);
	   
	  //need to pass in matrices? or translatons?
	  
		 extension.drawElementsInstancedANGLE(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0, numInstances);
		
		
		gl.disableVertexAttribArray(instancingLocation);
		
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

	//Obj text files
	var objRockText0 = utility.httpGet("resources/rocks/rockObjs/rock_0.txt");
	var objRockText1 = utility.httpGet("resources/rocks/rockObjs/rock_1.txt");
	var objRockText2 = utility.httpGet("resources/rocks/rockObjs/rock_2.txt");
	var objRockText3 = utility.httpGet("resources/rocks/rockObjs/rock_3.txt");
	var objRockText4 = utility.httpGet("resources/rocks/rockObjs/rock_4.txt");
	var objRockText5 = utility.httpGet("resources/rocks/rockObjs/rock_5.txt");

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


