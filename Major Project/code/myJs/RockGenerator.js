
function RockGenerator(){
	
	/*
	Stores information of all rocks in game
	*/
	var rockIndices = [];
	var rockVertices = [];
	var rockNormals = [];
	var rockUvs = [];
	
	var rockTextureCoordinateBuffer;
	var rockElementBuffer;
	var rockPositionBuffer;
	var rockNormalsBuffer;
	
	var rocks = [];
	//Rocks array needs to be visible in collisonTester, needs to have getter
	this.getRocksArray = {
		get getRocks(){
			return rocks;
		}
	}

	/*
	Stores x and z and scale, the y is not needed
	x
	z
	x + width
	z + width
	*/
	var rockHitboxes = []; 

	var previousNumIndices = 0;
	var startPosition = 0;
	
	
	//Tri starts
	var triangleRockIndices = [];
	var triangleRockVertices = [];
	var triangleRockNormals = [];
	var triangleRockUvs = [];
	
	var triangleRockTextureCoordinateBuffer;
	var triangleRockElementBuffer;
	var triangleRockPositionBuffer;
	var triangleRockNormalsBuffer;
	
	var triangleRocks = [];
	
	this.getTriRocksArray = {
		get getRocks(){
			return triangleRocks;
		}
	}
	
	/*
	Have to use 2 different draw calls, so cant have in same arrays
	*/
	function TriangleRock(xPos, yPos, zPos, width, scale, texture, numVertices){
		this.x = xPos;
		this.y = yPos;
		this.z = zPos;
		this.width = width;
		this.scale = scale;
		this.texture = texture;
		this.numVertices = numVertices;
	}
	
	createRocks();
	setupRockBuffers();

	setupTriangleRockBuffers();
	
	function Rock(xPos, yPos, zPos, width, xRotation, yRotation, zRotation, scale, texture, numIndices){
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
	}
	
	
	/*
	Pass in quadrant rock should be in as well?
	*/
	function createRocks(){
		//numRocks = 3;
		for(var i=0; i<3; i++){
			createRock(20, 30, 30, 0.1, rockTexture);
			createRock(20, 30, 30, 0.2, rockTexture);
			createRock(20, 30, 30, 0.3, rockTexture);
			createRock(20, 30, 30, 0.4, rockTexture);
			
			createRock(20, 30, 30, 0.1, sandstoneTexture);
			createRock(20, 30, 30, 0.2, sandstoneTexture);
			createRock(20, 30, 30, 0.1, sandstoneTexture);
			createRock(20, 30, 30, 0.2, sandstoneTexture);
			
			createTriangleRock(sandstoneTexture);
			createTriangleRock(sandstoneTexture);
			createTriangleRock(sandstoneTexture);
			createTriangleRock(sandstoneTexture);
			createTriangleRock(sandstoneTexture);
			createTriangleRock(sandstoneTexture);
		}
	}

	/*
	Pyramid vertices from: http://learningwebgl.com/blog/?p=370
	*/
	function createTriangleRock(textureParam){
		triangleRockVertices.push(0.0,  1.0 ,  0.0);
		triangleRockVertices.push(-1.0 , -1.0 ,  1.0 );
		triangleRockVertices.push( 1.0 , -1.0 ,  1.0 );
		triangleRockVertices.push(0.0,  1.0 ,  0.0);
		triangleRockVertices.push(1.0 , -1.0 ,  1.0 );
		triangleRockVertices.push(1.0 , -1.0 , -1.0 );
		triangleRockVertices.push(0.0,  1.0 ,  0.0);
		triangleRockVertices.push(1.0 , -1.0 , -1.0 );
		triangleRockVertices.push(-1.0, -1.0, -1.0);
		triangleRockVertices.push( 0.0,  1.0 ,  0.0);
		triangleRockVertices.push(-1.0 , -1.0 , -1.0 );
		triangleRockVertices.push(-1.0 , -1.0 ,  1.0 );
	
		//Texture coordinates Random!
		triangleRockUvs.push(0, 0.08);
		triangleRockUvs.push(0.08, 0.16);
		triangleRockUvs.push(0.16, 0.24);
		
		triangleRockUvs.push(0.24, 0.32);
		triangleRockUvs.push(0.32, 0.40);
		triangleRockUvs.push(0.40, 0.48);
		
		triangleRockUvs.push(0.48, 0.56);
		triangleRockUvs.push(0.56, 0.64);
		triangleRockUvs.push(0.64, 0.72);
		
		triangleRockUvs.push(0.72, 0.8);
		triangleRockUvs.push(0.8, 0.88);
		triangleRockUvs.push(0.88, 1);
		
		//Temporary!
		triangleRockNormals.push(0, 1 ,0);
		triangleRockNormals.push(0, 1 ,0);
		triangleRockNormals.push(0, 1 ,0);
		triangleRockNormals.push(0, 1 ,0);
		triangleRockNormals.push(0, 1 ,0);
		triangleRockNormals.push(0, 1 ,0);
		triangleRockNormals.push(0, 1 ,0);
		triangleRockNormals.push(0, 1 ,0);
		triangleRockNormals.push(0, 1 ,0);
		triangleRockNormals.push(0, 1 ,0);
		triangleRockNormals.push(0, 1 ,0);
		triangleRockNormals.push(0, 1 ,0);
		
		/*
		Set x and z coordinate of the rock
		Then find out what the terrain vertex height is, at that point.
		Set that height to the rock, so it doesn't appear below floor
		*/
		var x = Math.floor(Math.random() * 512);
		var z = Math.floor(Math.random() * 512);
		terrain.heightMapValueAtIndex.setTemporaryHeightMapX = x;
		terrain.heightMapValueAtIndex.setTemporaryHeightMapZ = z;
		var rockHeight = terrain.heightMapValueAtIndex.getTemporaryHeightMapValue;
		var y = rockHeight + 1;
		
		var width = 4;
		var scale = 5;
		var texture = textureParam;
		
		var triRock = new TriangleRock(x, y, z, width, scale, texture, 12);
		triangleRocks.push(triRock);	
	}

	/*
	COPIED the code to make a sphere from:
	https://github.com/mrdoob/three.js/blob/master/src/geometries/SphereGeometry.js
	(three.js is MIT licensed)
	*/
	function createRock(radius, widthSegments, heightSegments, scale, textureParam, quadrant){ 
		var phiStart = 0;
		var phiLength = Math.PI * 2; 
		var thetaStart = 0; 
		var thetaLength = Math.PI;
		
		var thetaEnd = thetaStart + thetaLength;

		var ix, iy;

		var index = 0;
		var grid = [];	
		
		var vertex = [2];
		var normal = [2];
		
		var largestZCoord = 0;
		var smallestZCoord = 0;
		
		//generate vertices, normals and uvs
		for ( iy = 0; iy <= heightSegments; iy ++ ) {

			var verticesRow = [];

			var v = iy / heightSegments;

			for ( ix = 0; ix <= widthSegments; ix ++ ) {

				var u = ix / widthSegments;

				// vertex

				vertex.x = - radius * Math.cos( phiStart + u * phiLength ) * Math.sin( thetaStart + v * thetaLength );
				vertex.y = radius * Math.cos( thetaStart + v * thetaLength );
				vertex.z = radius * Math.sin( phiStart + u * phiLength ) * Math.sin( thetaStart + v * thetaLength );
				
				//rand
				var max = (Math.random() * 5) + 1;
				var min = (Math.random() * -5) + 1;
			
				var rand = Math.random() * (max-min+1) + min;
				//console.log(rand);
				vertex.x += rand/2;
				vertex.y += rand/2;
				vertex.z += rand/2;
				
				rockVertices.push( vertex.x, vertex.y, vertex.z );

				// normal
				//how is this working... normals is empty array?
				rockNormals.push( normal.x, normal.y, normal.z );

				// uv

				rockUvs.push( u, 1 - v );

				verticesRow.push( index ++ );

			}

			grid.push( verticesRow );

		}
		
		// indices

		for ( iy = 0; iy < heightSegments; iy ++ ) {

			for ( ix = 0; ix < widthSegments; ix ++ ) {

				var a = grid[ iy ][ ix + 1 ];
				var b = grid[ iy ][ ix ];
				var c = grid[ iy + 1 ][ ix ];
				var d = grid[ iy + 1 ][ ix + 1 ];

				if ( iy !== 0 || thetaStart > 0 ) rockIndices.push( a, b, d );
				if ( iy !== heightSegments - 1 || thetaEnd < Math.PI ) rockIndices.push( b, c, d );

			}
		}	
		
		/*
		Give rock information, and store it ready for drawing
		*/
		//Where should we spawn the rock?
		var x = Math.floor(Math.random() * 512) + 0;
		var z = Math.floor(Math.random() * 512) + 0;
		
		//Find the current terrain vertex height, assign it to the rock
		terrain.heightMapValueAtIndex.setTemporaryHeightMapX = x;
		terrain.heightMapValueAtIndex.setTemporaryHeightMapZ = z;
		var rockHeight = terrain.heightMapValueAtIndex.getTemporaryHeightMapValue;
		var y = rockHeight;
		
		//Pretty sure these do nothing
		var xRotation = Math.random();
		var yRotation = Math.random();
		var zRotation = Math.random();
			
		var texture = textureParam;
		
		var numIndices = rockIndices.length - previousNumIndices; 
		previousNumIndices = rockIndices.length;
		
		var width = scale * 30;
		/*
		x,y,z is in the middle of the rock,
		So minus the width/2 to get correct coordinates
		*/
		
		/*
		Draw 4 lines at these points? rather than a cube
		Or 2d square
		*/
		
		var tempRock = new Rock(x, y, z, width, xRotation, yRotation, zRotation, scale, texture, numIndices);
		rocks.push(tempRock);
	}

	
	function setupTriangleRockBuffers(){
		triangleRockPositionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, triangleRockPositionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleRockVertices), gl.STATIC_DRAW);
		positionAttribLocation = gl.getAttribLocation(program, 'position');
		gl.enableVertexAttribArray(positionAttribLocation);
		gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, false, 0, 0);	
		
		triangleRockTextureCoordinateBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, triangleRockTextureCoordinateBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleRockUvs), gl.STATIC_DRAW);	

		//TriangleRock normals havent been calculated properly
		triangleRockNormalsBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, triangleRockNormalsBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleRockNormals), gl.STATIC_DRAW);		
			console.log("TRI ROCK NORMALS LENGTH: " + triangleRockNormals.length);
			console.log("TRI ROCK VERTICES LENGTH: " + triangleRockVertices.length);
	}

	function setupRockBuffers(){
		rockPositionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, rockPositionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rockVertices), gl.STATIC_DRAW);
		positionAttribLocation = gl.getAttribLocation(program, 'position');
		gl.enableVertexAttribArray(positionAttribLocation);
		gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, false, 0, 0);	
		
		rockElementBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, rockElementBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(rockIndices), gl.STATIC_DRAW);
		
		rockTextureCoordinateBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, rockTextureCoordinateBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rockUvs), gl.STATIC_DRAW);
		
		rockNormalsBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, rockNormalsBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rockNormals), gl.STATIC_DRAW);
		
			console.log("ROCK NORMALS LENGTH: " + rockNormals.length);
			console.log("ROCK VERTICES LENGTH: " + rockVertices.length);
	}

	/*
	Loop through rocks array, separate draw call for each
	*/
	this.renderRocks = function(){
		for(var i=0; i<rocks.length; i++){
			currentTexture = rocks[i].texture;

			//debugger;
			scale = m4.scaling(rocks[i].scale, rocks[i].scale, rocks[i].scale);
			xRotation = m4.xRotation(rocks[i].xRotation);
			yRotation = m4.yRotation(rocks[i].yRotation);
			zRotation = m4.zRotation(rocks[i].zRotation);
			position = m4.translation(rocks[i].x, rocks[i].y, rocks[i].z);
			
			//Times matrices together
			updateAttributesAndUniforms();

			//Vertices
			gl.bindBuffer(gl.ARRAY_BUFFER, rockPositionBuffer);
			gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, false, 0, 0);
			
			gl.bindBuffer(gl.ARRAY_BUFFER, rockTextureCoordinateBuffer);
			gl.vertexAttribPointer(textureCoordLocation, 2, gl.FLOAT, false, 0, 0);
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, currentTexture.getTextureAttribute.texture);
			gl.uniform1i(gl.getUniformLocation(program, "uSampler"), 0);
			
			//Lights, they're set as uniform.. are they being set anywhere?
			
			
			
			//Elements
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, rockElementBuffer);
			
			//console.log("Start positioon is: " + startPosition);
			//console.log("Current rocks indices: " + rocks[i].numIndices);
			
			/*
			Mode
			Number of indices, only draw current indices, not all in indices array
			Type
			The indices
			*/
			gl.drawElements(
				gl.TRIANGLES, 
				rocks[i].numIndices, // how many indices should we draw, only draw current indices, not all
				gl.UNSIGNED_SHORT,
				startPosition //start drawing at end of last sphere indices
			); 
			
			if(i === rocks.length-1){
				//Reset the start position
				startPosition = 0;
			}
			else{
				startPosition += rocks[i].numIndices;
			}
			
		}
	}
	
	var triStartPosition = 0;
	this.renderTriangleRocks = function (){
		for(var i=0; i<triangleRocks.length; i++){
			currentTexture = triangleRocks[i].texture;
			//debugger;
			scale = m4.scaling(triangleRocks[i].scale, triangleRocks[i].scale, triangleRocks[i].scale);
			position = m4.translation(triangleRocks[i].x, triangleRocks[i].y, triangleRocks[i].z);
			
			//Times matrices together
			updateAttributesAndUniforms();

			//Vertices
			gl.bindBuffer(gl.ARRAY_BUFFER, triangleRockPositionBuffer);
			gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, false, 0, 0);
			
			//Uvs
			gl.bindBuffer(gl.ARRAY_BUFFER, triangleRockTextureCoordinateBuffer);
			gl.vertexAttribPointer(textureCoordLocation, 2, gl.FLOAT, false, 0, 0);
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, currentTexture.getTextureAttribute.texture);
			gl.uniform1i(gl.getUniformLocation(program, "uSampler"), 0);
			
			gl.drawArrays(gl.TRIANGLES, triStartPosition, 12);
			
			/*
			Rock 2
			*/
			scale = m4.scaling(triangleRocks[i].scale /3, triangleRocks[i].scale/3, triangleRocks[i].scale/3);
			position = m4.translation(triangleRocks[i].x + 5, triangleRocks[i].y, triangleRocks[i].z);
			
			//Times matrices together
			updateAttributesAndUniforms();

			//Vertices
			gl.bindBuffer(gl.ARRAY_BUFFER, triangleRockPositionBuffer);
			gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, false, 0, 0);
			
			gl.bindBuffer(gl.ARRAY_BUFFER, triangleRockTextureCoordinateBuffer);
			gl.vertexAttribPointer(textureCoordLocation, 2, gl.FLOAT, false, 0, 0);
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, currentTexture.getTextureAttribute.texture);
			gl.uniform1i(gl.getUniformLocation(program, "uSampler"), 0);
			
			gl.drawArrays(gl.TRIANGLES, triStartPosition, 12);			
			
			/*
			Rock 3
			*/
			scale = m4.scaling(triangleRocks[i].scale/2, triangleRocks[i].scale/2, triangleRocks[i].scale/2);
			position = m4.translation(triangleRocks[i].x, triangleRocks[i].y - 0.2, triangleRocks[i].z + 4);
			
			//Times matrices together
			updateAttributesAndUniforms();

			//Vertices
			gl.bindBuffer(gl.ARRAY_BUFFER, triangleRockPositionBuffer);
			gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, false, 0, 0);
			
			gl.bindBuffer(gl.ARRAY_BUFFER, triangleRockTextureCoordinateBuffer);
			gl.vertexAttribPointer(textureCoordLocation, 2, gl.FLOAT, false, 0, 0);
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, currentTexture.getTextureAttribute.texture);
			gl.uniform1i(gl.getUniformLocation(program, "uSampler"), 0);
			
			gl.drawArrays(gl.TRIANGLES, triStartPosition, 12);
			
			if(i === triangleRocks.length-1){
				//Reset the start position
				triStartPosition = 0;
			}
			else{
				triStartPosition += triangleRocks[i].numVertices;
			}
			
		}		
		
	}
	
}


