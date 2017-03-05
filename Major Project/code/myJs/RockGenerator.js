		
function RockGenerator(){
	
	//Obj text files
	var objRockText0 = httpGet("resources/rocks/rockObjs/rock_0.txt");
	var objRockText1 = httpGet("resources/rocks/rockObjs/rock_1.txt");
	var objRockText2 = httpGet("resources/rocks/rockObjs/rock_2.txt");
	var objRockText3 = httpGet("resources/rocks/rockObjs/rock_3.txt");
	var objRockText4 = httpGet("resources/rocks/rockObjs/rock_4.txt");
	var objRockText5 = httpGet("resources/rocks/rockObjs/rock_5.txt");
	
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
	
	//Arrays, need to be visible in collisonTester, needs to have getter
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
	
	createRocks();
	
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
	Stores x and z and scale, the y is not needed
	x
	z
	x + width
	z + width
	*/
	var rockHitboxes = []; 
	
	/*
	Pass in quadrant rock should be in as well?
	*/
	function createRocks(){
		//numRocks = 3;
		for(var i=0; i<30; i++){
			createRock(20, 30, 30, 0.1, rockTexture);
			createRock(20, 30, 30, 0.2, rockTexture);
			createRock(20, 30, 30, 0.3, rockTexture);
			createRock(20, 30, 30, 0.4, rockTexture);
			
			createRock(20, 30, 30, 0.1, rockTexture);
			createRock(20, 30, 30, 0.2, rockTexture);
			createRock(20, 30, 30, 0.1, rockTexture);
			createRock(20, 30, 30, 0.2, rockTexture);


			createObjRock(objRockText0, scratchedIceTexture);	
			createObjRock(objRockText1, blackGlassTexture);	
			createObjRock(objRockText2, blackIceTexture);	
			createObjRock(objRockText3, scratchedBlackTexture);	
			createObjRock(objRockText4, blueTexture);	
			createObjRock(objRockText5, emeraldTexture);				
		}
	}
	
	/*
	Parameter, the obj file to use
	*/
	function createObjRock(objText, texture){
		var mesh = new OBJ.Mesh(objText);
		OBJ.initMeshBuffers(gl, mesh);
		
		var position = generateRockPosition();
		mesh.x = position.x;
		mesh.y = position.y;
		mesh.z = position.z;
		mesh.texture = texture;
		mesh.scale = Math.floor(Math.random() * 5) + 0;

		rockObjs.push(mesh);	
	}
	
	/*
	Returns an x,y,z spawn point for a rock
	*/
	function generateRockPosition(){
		var x = Math.floor(Math.random() * terrain.get.getTerrainRows) + 0;
		var z = Math.floor(Math.random() * terrain.get.getTerrainRows) + 0;
		terrain.heightMapValueAtIndex.setTemporaryHeightMapX = x;
		terrain.heightMapValueAtIndex.setTemporaryHeightMapZ = z;
		var rockHeight = terrain.heightMapValueAtIndex.getTemporaryHeightMapValue;
		var y = rockHeight + 1;	
		
		var position = new Object();
		position.x = x;
		position.y = y;
		position.z = z;
		
		return position;
	}
	
	/*
	COPIED the code to make a sphere from:
	https://github.com/mrdoob/three.js/blob/master/src/geometries/SphereGeometry.js
	(three.js is MIT licensed)
	
	The MIT License

	Copyright © 2010-2017 three.js authors

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.
	*/
	function createRock(radius, widthSegments, heightSegments, scale, textureParam){ 
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
		
		var vertices = [];
		var normals = [];
		var uvs = [];
		var indices = [];
		
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
				// broken normals
				rockNormals.push(0, 1, 0);
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
		var position = generateRockPosition();
		
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
		
		var tempRock = new Rock(position.x, position.y, position.z, width, xRotation, yRotation, zRotation, scale, texture, numIndices);
		rocks.push(tempRock);
	}

	//Needed in index setup, after objs are loaded, otherwise when constructor called in index
	//this setupRockBuffers function gets called too early
	this.setupRockBuffers = function(){
		rockPositionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, rockPositionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rockVertices), gl.DYNAMIC_DRAW);
		positionAttribLocation = gl.getAttribLocation(program, 'position');
		gl.enableVertexAttribArray(positionAttribLocation);
		gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, false, 0, 0);	
		
		rockElementBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, rockElementBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(rockIndices), gl.DYNAMIC_DRAW);
		
		rockTextureCoordinateBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, rockTextureCoordinateBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rockUvs), gl.DYNAMIC_DRAW);
		
		rockNormalsBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, rockNormalsBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rockNormals), gl.DYNAMIC_DRAW);
		
		console.log("ROCK INDICES LENGTH: " + rockIndices.length);
		console.log("ROCK NORMALS LENGTH: " + rockNormals.length);
		console.log("ROCK VERTICES LENGTH: " + rockVertices.length);
	}

	/*
	Loop through rocks array, separate draw call for each
	*/
	this.renderRocks = function(){
		lightColour = [1, 1, 1];
		var startPosition = 0;
		for(var i=0; i<rocks.length; i++){
			currentTexture = rocks[i].texture;
			
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
			
			//Normals
			gl.bindBuffer(gl.ARRAY_BUFFER, rockNormalsBuffer);
			gl.vertexAttribPointer(normalAttribLocation, 3, gl.FLOAT, false, 0, 0);				
			
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
	
	/*
	Could just have, affected by light uniform, and pass it in
	
	Disable light for these...
	*/
	this.renderObjRocks = function(){
		//Disable lighting when rendering rocks
		useLight = false;
		
		var startPosition = 0;
		for(var i=0; i<rockObjs.length; i++){
			lightColour = [1, 1, 1];
			currentTexture = rockObjs[i].texture;
				
			scale = m4.scaling(rockObjs[i].scale, rockObjs[i].scale, rockObjs[i].scale);
			rotateX = m4.xRotation(0);
			rotateY = m4.yRotation(0);
			rotateZ = m4.zRotation(0);
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
			gl.drawElements(gl.TRIANGLES, rockObjs[i].indexBuffer.numItems, gl.UNSIGNED_SHORT, startPosition);

			if(i === rockObjs.length-1){
				//Reset the start position
				startPosition = 0;
			}
			else{
				startPosition += rockObjs[i].numIndices;
			}		
		}
		
		//Re-enable light once rendered rocks
		useLight = true;
	}
	
}


