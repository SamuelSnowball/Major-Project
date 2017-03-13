		
function RockGenerator(){

	//Data
	var rockIndices = [];
	var rockVertices = [];
	var rockNormals = [];
	var rockUvs = [];
	var previousNumIndices = 0;
	
	//Buffers
	var rockTextureCoordinateBuffer;
	var rockElementBuffer;
	var rockPositionBuffer;
	var rockNormalsBuffer;
	
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

	createRocks();
	
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
	
	/*
	Pass in quadrant rock should be in as well?
	*/
	function createRocks(){
		//numRocks = 3;
		for(var i=0; i<15; i++){
			createObjRock(objRockText0, rockTexture0, 0);
			createObjRock(objRockText0, rockTexture1, 1);
		}
	}
	
	/*
	Parameter, the obj file to use
	*/
	function createObjRock(objText, texture, id){
	
		var mesh = new OBJ.Mesh(objText);
		OBJ.initMeshBuffers(gl, mesh);

		// Generate x,z position, use those to find the rock height
		var positionX = utility.randomIntBetween( 384, 640 );
		var positionZ = utility.randomIntBetween( 384, 640 );
		terrain.heightMapValueAtIndex.setTemporaryHeightMapX = positionZ;
		terrain.heightMapValueAtIndex.setTemporaryHeightMapZ = positionX;
		var rockHeight = terrain.heightMapValueAtIndex.getTemporaryHeightMapValue;
		
		//console.log(positionX + ", " + positionZ);
		
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


