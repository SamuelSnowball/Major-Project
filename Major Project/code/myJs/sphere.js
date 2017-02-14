/*
Need array of rocks, each with their own position - for collision and drawing all of them
Could have small rocks that don't move, that are drawn instanced.
Still need to update the rocks position, so they aren't all drawn at same position
gl_InstanceID, in vertex shader, which instance is currently being rendered
	When first instanced rendered this would be 0
	2nd instance = 1
	3rd instance = 2
	
	could add gl_InstanceID to the vertexPosition.x in the shader
	
Store all model matrices and offsets, in the particles VAO
VAO contains attribute lists, all info, pos, text coord, normal
Can have per vertex attributes, or per instance attributes

Have to change modelViewMatrix to render sphere in different position
texture offsets


And the rocks the player interacts with are drawn individually?
*/
var rocks = [];
function Rock(xPos, yPos, zPos, xRotation, yRotation, zRotation){
	this.x = xPos;
	this.y = yPos;
	this.z = zPos;
	this.xRotate = xRotation;
	this.yRotate = yRotation;
	this.zRotate = zRotation;
	
	//this.type (rune rock or whatever)
	//this.xp, idk
	//this.requiredLevel
	//this.collisionAABB
}

var offsets = new Float32Array([
	0.0, 1.0, 0.0,
	0.0, 2.0, 0.0,
	0.0, 3.0, 0.0,
	0.0, 4.0, 0.0,
]);
var offsetBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, offsetBuffer);
gl.bufferData(gl.ARRAY_BUFFER, offsets, gl.STATIC_DRAW);

/*
offsets array = rock positions?
	This data used once per instance

*/

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

			
			var max = 1;
			var min = -1;
			var rand = Math.random() * (max-min+1) + min;
			//console.log(rand);
			x += rand /10;
			y += rand /10;
			z += rand /10;
			
			
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
	Pick random x,z, see what height is closest to it, place rock there
	Pass sphere x and z into heightmap, let it return the value
	
	
	Create 1 sphere geometry, glDrawInstaced, draws multiple with different textures
	Then save position of rocks and type in global space
	
	Could only floor randomX and Z for indexing, rather than doing it for all
	*/
	var max = 256;
	var min = 0;
	var randX = Math.random() * (max-min+1) + min; //Just generate for 1st quadrant atm
	var randZ = Math.random() * (max-min+1) + min;
	var chosenHeight = heightMap[Math.floor(randX)][Math.floor(randZ)];
	
	//Play with these values a bit
	var xRotation = Math.random() * 5; 
	var yRotation = Math.random() * 5;
	var zRotation = Math.random() * 5;
	
	console.log("New Rock, parameters below: ");
	console.log("	Rock X, Y, Z: " + Math.floor(randX) + ", " + Math.floor(chosenHeight) + ", " + Math.floor(randZ));
	console.log("	Rock rotation X, Y, Z: " + Math.floor(xRotation) + ", " + Math.floor(yRotation) + ", " + Math.floor(zRotation));
	
	var tempRock = new Rock(randX, chosenHeight, randZ, xRotation, yRotation, zRotation);
	rocks.push(tempRock);
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

	//Scale isn't needed in draw loop, the scale is based off of radius when creating the sphere
	scale = m4.scaling(sphereScale, sphereScale, sphereScale)

	/*
	Have this draw code in for loop, changing the position as I in rocks each time?
	*/
	for(var i=0; i<rocks.length; i++){
		xRotation = m4.xRotation(rocks[i].xRotation);
		yRotation = m4.yRotation(rocks[i].yRotation);
		zRotation = m4.zRotation(rocks[i].zRotation);
		
		position = m4.translation(rocks[i].x, rocks[i].y, rocks[i].z); //pick point in heightMap or terrianVertices
		//Times matrices together
		updateAttributesAndUniforms();
		//Vertices
		gl.bindBuffer(gl.ARRAY_BUFFER, spherePositionBuffer);
		gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, false, 0, 0);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, sphereTextureCoordinateBuffer);
		gl.vertexAttribPointer(textureCoordLocation, 2, gl.FLOAT, false, 0, 0);
		gl.activeTexture(gl.TEXTURE0); //change eventually
		gl.bindTexture(gl.TEXTURE_2D, rockTexture);
		gl.uniform1i(gl.getUniformLocation(program, "uSampler"), 0);
		
		//Elements
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereElementsBuffer);
		
		/*
		Mode
		Number of indices
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
	
	
}