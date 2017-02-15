
/*
Stores information of all rocks in game
*/
var rockIndices = [];
var rockVertices = [];
var rockNormals = [];
var rockUvs = [];
var rocks = [];

/*
Just store x and z, Y not needed
x
z
x + width
z + width
*/
var rockHitboxes = []; //needed in collision file
						//if player within range, print to console

var previousNumIndices = 0;
var startPosition = 0;

/*
Pass in quadrant rock should be in as well?
*/
function createRocks(){
	numRocks = 3;
	for(var i=0; i<numRocks; i++){
		createRock(20, 30, 30);
	}
}

/*
COPIED createRock code from:
https://github.com/mrdoob/three.js/blob/master/src/geometries/SphereGeometry.js
(three.js is MIT licensed)
*/
function createRock(radius, widthSegments, heightSegments){ 
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
			var max = 1;
			var min = -1;
			var rand = Math.random() * (max-min+1) + min;
			//console.log(rand);
			vertex.x += rand/2;
			vertex.y += rand/2;
			vertex.z += rand/2;
			
			rockVertices.push( vertex.x, vertex.y, vertex.z );
			
			//Find largest z coordinate
			if(vertex.z > largestZCoord){
				largestZCoord = vertex.z;
			}
			else{
				//It isnt the biggest coordinate, check if its the smallest
				if(vertex.z < smallestZCoord){
					smallestZCoord = vertex.z;
				}
				else{
					//Coordinate isn't smallest or biggest, ignore it
				}
			}

			// normal

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
	var x = Math.floor(Math.random() * 256) + 0;
	var z = Math.floor(Math.random() * 256) + 0;  
	//Find the current terrain vertex height, assign it to the rock
	var y = heightMap[x][z];
	
	//Pretty sure these do nothing
	var xRotation = Math.random();
	var yRotation = Math.random();
	var zRotation = Math.random();
		
	var texture = rockTexture;
	var scale = 0;
	if(rocks.length === 0){
		scale = 0.1;
	}else{
		scale = 0.1;
	}
	
	var numIndices = rockIndices.length - previousNumIndices; 

	previousNumIndices = rockIndices.length;
	
	
	var tempRock = new Rock(x, y, z, xRotation, yRotation, zRotation, scale, texture, numIndices);
	rocks.push(tempRock);
	console.log("THREE JS CODE BELOW");
	console.log("R verts length: " + rockVertices.length);
	console.log("R indices length: " + rockIndices.length);
	console.log("R uvs length: " + rockUvs.length);
	
	/*
	Work out and store hitbox of rock	
	
	Width = the highest z point - the lowest z point?
	*/
	var rockWidth = 1;
	if(scale === 0.1){
		rockWidth = 1;
	}
	else if(scale === 0.3){
		rockWidth = 8;
	}
	
	//x and z are in middle of rock, make it not, by - half width
	rockHitboxes.push(x - (rockWidth/2)); 
	rockHitboxes.push(z - (rockWidth/2));
	rockHitboxes.push(x + rockWidth);
	rockHitboxes.push(z + rockWidth);
	
	console.log("Rock hitbox x: " + (x - (rockWidth/2)) );
	console.log("Rock hitbox z: " + (z - (rockWidth/2)) );
	console.log("Rock hitbox x+w: " + (x + rockWidth) );
	console.log("Rock hitbox z+w: " + (z + rockWidth) );	
}

function Rock(xPos, yPos, zPos, xRotation, yRotation, zRotation, scale, texture, numIndices){
	this.x = xPos;
	this.y = yPos;
	this.z = zPos;
	this.xRotation = xRotation;
	this.yRotation = yRotation;
	this.zRotation = zRotation;
	this.scale = scale;
	this.texture = texture;
	this.numIndices = numIndices;
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
}

/*
Loop through rocks array, separate draw call for each
*/
function drawRocks(){
	for(var i=0; i<rocks.length; i++){
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
		gl.bindTexture(gl.TEXTURE_2D, rocks[i].texture);
		gl.uniform1i(gl.getUniformLocation(program, "uSampler"), 0);
		
		//Elements
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, rockElementBuffer);
		
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



