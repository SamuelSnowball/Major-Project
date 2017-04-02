

function WaterSystem(){

	
	// Need shaders as well
	var waterVertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(waterVertexShader, [
		'attribute vec3 waterPosition;',

		'uniform mat4 projectionMatrix;',
		'uniform mat4 viewMatrix;',

		'void main(void){',
			'gl_Position = projectionMatrix * viewMatrix * vec4(waterPosition, 1.0); ',
			'waterTextureCoords = waterPosition;',
		'}'
		
	].join('\n'));
	gl.compileShader(waterVertexShader);
	console.log("Water vertex shader compliation status: " + gl.getShaderInfoLog(waterVertexShader));
	
	var waterFragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(waterFragmentShader, [
		'precision highp float;',
		
		'varying highp vec2 vTextureCoord;',
		'uniform sampler2D uSampler;',

		'vec3 texture(samplerCube sampler, vec3 c){',
			'return textureCube(sampler, c).rgb;',
		'}',
		
		'void main(void){',
			'vec3 sample = texture(cubeMap, waterTextureCoords);',
			'gl_FragColor = vec4(sample, 1.0);',
		'}'
		
	].join('\n'));
	gl.compileShader(waterFragmentShader);
	console.log("Water fragment shader compliation status: " + gl.getShaderInfoLog(waterFragmentShader));
	
	var waterProgram = gl.createProgram();
	gl.attachShader(waterProgram, waterVertexShader);
	gl.attachShader(waterProgram, waterFragmentShader);
	gl.linkProgram(waterProgram);
	console.log("waterProgram status: " + gl.getProgramInfoLog(waterProgram));

	gl.useProgram(waterProgram);
		var waterPositionAttribLocation = gl.getAttribLocation(skyboxProgram, 'skyboxPosition');
		gl.enableVertexAttribArray(waterPositionAttribLocation);
		
		var waterViewMatrixLocation = gl.getUniformLocation(skyboxProgram, 'viewMatrix');
		gl.uniformMatrix4fv(waterViewMatrixLocation, false, new Float32Array(viewMatrix));
		
		var waterProjectionLocation = gl.getUniformLocation(skyboxProgram, 'projectionMatrix');
		gl.uniformMatrix4fv(waterProjectionLocation, false, new Float32Array(projectionMatrix));
	gl.useProgram(program);
	
	
	var waterVertexBuffer = gl.createBuffer(); 
	var waterTextureCoordinateBuffer;
	var waterElementsBuffer;
	var waterNormalsBuffer = gl.createBuffer();
	
	var waterVertices = [];
	var textureCoordinates = [];
	var waterNormals = [];
	
	var waterRows = 32;
	var waterColumns = 32;
	var waterSize = waterRows * waterColumns;
	
	var waterHeightMap = [];
	
	var waterDirections = []; 

	setupWater();
	
	function setupWater(){
	
		createWaterHeightMap();
		
		fillWaterHeightMap();
		createWaterVertices();
		createWaterNormals();
		
		setupWaterIndiciesBuffer();
		setupWaterTextureCoordinates();
		setupWaterNormalsBuffer();
	}
	
	function createWaterVertices(){
			//For each row, do all the columns
		gl.bindBuffer(gl.ARRAY_BUFFER, waterVertexBuffer);
		
			waterVertices = []; //reset all vertices, ready for new ones
								//hm idk if this is good
								
			waterNormals = [];
			
			var waterX = 0,
			waterY = 0,
			waterZ = 0;
		for(var x=0; x<waterRows; x++){
			for(var y=0; y<waterColumns; y++){
				
				waterVertices.push(waterX); 
				waterVertices.push(waterHeightMap[x][y]);
				waterVertices.push(waterZ); 
				
				//waterNormals.push(0, 1, 0); //temporary
				
				//Move along in the row
				waterX++;
			}
			//New row, reset X, and increment Z
			waterX = 0;
			waterZ++;
		}
		
		//console.log("Normals length: " + waterNormals.length);
		//console.log("Vertices length: " + waterVertices.length);	
		
		//Reset all values as above loop changed them
		x = 0; y = 0; z = 0; 

		//console.log("Individual water x,y,z values: " + waterVertices.length);	
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(waterVertices), gl.STATIC_DRAW);
		
		//Dont have to reset, normals, becauase theyre updated in shader?
		createWaterNormals();
		setupWaterNormalsBuffer();
	}
	
	/*
	Copied from terrain normals
	*/
	function createWaterNormals(){
		for(var i=0; i<waterVertices.length; i+=3){
			//Get 1st point (3 vertices), 2nd point(3 vertices), 3rd (3 vertices)(under) point
			
			//Top left vertex
			var vertex0x = waterVertices[i];
			var vertex0y = waterVertices[i+1];
			var vertex0z = waterVertices[i+2];
			
			//Top right vertex
			var vertex1x = waterVertices[i+3];
			var vertex1y = waterVertices[i+4];
			var vertex1z = waterVertices[i+5];
			
			//Under top left vertex
			//Its the current row times the current column!
			//They both dont exist, just add a single value
			//i + value 
			//i + 1 + value
			//try value as 1024, would push current value exactly 1 row down
			// times 3, because 3 vertices, rows isnt 100% correct, as its a 1d array, with an x,y,z each
			var vertex2x = waterVertices[i + (waterRows*3)];
			var vertex2y = waterVertices[(i + 1) + (waterRows*3)];
			var vertex2z = waterVertices[(i + 2) + (waterRows*3)];
			
			//Now work out vector0, might be wrong direction
			var vector0x = vertex1x - vertex0x;
			var vector0y = vertex1y - vertex0y;
			var vector0z = vertex1z - vertex0z;
			var vector0 = [vector0x, vector0y, vector0z];
			
			//Now work out vector1, might be wrong direction
			var vector1x = vertex2x - vertex0x;
			var vector1y = vertex2y - vertex0y;
			var vector1z = vertex2z - vertex0z;
			var vector1 = [vector1x, vector1y, vector1z];

			//Need to normalize vectors
			vector0 = m4.normalize(vector0);
			vector1 = m4.normalize(vector1);
			//console.log("vector 0: " + vector0);
			//console.log("vector 1: " + vector1);
			
			
			//Now cross product between vector0 and vector1
				//vector0 * vector1, might be wrong way around,
				//Also the vectors could've been calculated wrong way around
			var normal = m4.cross(vector0, vector1);
			
			waterNormals.push(-normal[0]); //x
			waterNormals.push(-normal[1]); //y
			waterNormals.push(-normal[2]); //z
			
			
		}
		
		/*
		Should have same number of normals to individual x,y,z points
		Because each x,y,z has a normal x,y,z
		
		TerrainVertices length / 3 = 104k vertices, each with a normal vector, of 3 components
		*/
		//console.log("Water Normals length: " + waterNormals.length);	
	}
	
	function setupWaterNormalsBuffer(){
		//waterNormalsBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, waterNormalsBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(waterNormals), gl.STATIC_DRAW);
		//gl.enableVertexAttribArray(normalAttribLocation);
		//gl.vertexAttribPointer(normalAttribLocation, 3, gl.FLOAT, false, 0, 0);				
	}
	
	function setupWaterTextureCoordinates(){
		waterTextureCoordinateBuffer = gl.createBuffer();
				/*
		Need a double for loop to set accurately
		1/256 for max row increment?
			=0.00390625 * 265 = 1. so increment by that
		*/
		var xUV = 0;
		var yUV = 0;
		for(var x=0; x<waterRows; x++){
			for(var y=0; y<waterColumns; y++){
				textureCoordinates.push(xUV);  
				textureCoordinates.push(yUV); 
				xUV += 0.00390625;
			}
			xUV = 0;
			yUV += 0.015625; // 1divied by 64, as thats current water size
		}
		gl.bindBuffer(gl.ARRAY_BUFFER, waterTextureCoordinateBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);	
	}
	
	/*
	Private
	
	Code from: http://stackoverflow.com/questions/5915753/generate-a-plane-with-triangle-strips
	Answer with 11 upvotes
	*/
	function setupWaterIndiciesBuffer(){
		//make the *2 stuff, overallRows and overallColumsn and remove x2
		// * 2 orginaly then *4 cos double, make this non bad eventually, base off varaible
		var indices = new Array(waterSize * 2 ); // i think 64 verts = 124 indicies

		// Set up indices
		var i = 0;
		for (var r = 0; r < waterRows - 1; ++r) {
			indices[i++] = r * waterColumns ;
			for (var c = 0; c < waterColumns ; ++c) {
				indices[i++] = r * waterColumns + c;
				indices[i++] = (r + 1) * waterColumns  + c;
			}
			indices[i++] = (r + 1) * waterColumns  + (waterColumns- 1);
		}
		
		//console.log(indices);
		
		console.log("Length of indices: " + indices.length);
		
		waterElementsBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, waterElementsBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(indices), gl.STATIC_DRAW);		
	}
	
	function createWaterHeightMap(){
		waterHeightMap = new Array(waterRows); 
		for(var i=0; i<waterRows; i++){
			waterHeightMap[i] = new Array(waterColumns);
		}
		
		//2D array of water directions, new direction for every vertex
		waterDirections = new Array(waterRows); 
		for(var i=0; i<waterRows; i++){
			waterDirections[i] = new Array(waterColumns);
		}
	}

	/*
	Fills waterHeightMap with initial values and row/column directions
	*/
	function fillWaterHeightMap(){
		var count = 0;
		var waterSpawnHeight = -2.6;
		for(var x=0; x<waterRows; x++){
			for(var y=0; y<waterColumns; y++){
				waterHeightMap[x][y] = waterSpawnHeight; //Works well
				
				//For every cell, have a direction
				if(count < 4){
					//rows 0 -> 3
					waterDirections[x][y] = -1; //-1 for down, 1 for up
				}
				else if(count < 8){
					//rows 4 -> 7
					waterDirections[x][y] = 1;
				}
			
				//Increment/Reset count
				count++;
				if(count === 8){
					count = 0;
				}

				//0.01 is ok, a bit too same height on rows tho
				waterSpawnHeight += 0.01;
			}	
		}
	}

	
	this.render = function(){
	
	
		currentTexture = waterTexture;
		lightColour = [0.2, 0.2, 0.8];
		
		scale = m4.scaling(1, 1, 1);
		xRotation = m4.xRotation(0);
		yRotation = m4.yRotation(0);
		/*
		If you change this position, 
		also need to change max/min height values in updateWaterVertices, 
		also spawn points in fillWaterHeightMap
		*/
		position = m4.translation(310, 15.1, 310); 
		
		//Times matrices together
		updateAttributesAndUniforms();
			
		gl.bindBuffer(gl.ARRAY_BUFFER, waterVertexBuffer);
		gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, waterTextureCoordinateBuffer);
		gl.vertexAttribPointer(textureCoordLocation, 2, gl.FLOAT, false, 0, 0);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, currentTexture.getTextureAttribute.texture);
		gl.uniform1i(gl.getUniformLocation(program, "uSampler"), 0);
		
		gl.enableVertexAttribArray(normalAttribLocation);
		gl.bindBuffer(gl.ARRAY_BUFFER, waterNormalsBuffer);
		gl.vertexAttribPointer(normalAttribLocation, 3, gl.FLOAT, false, 0, 0);		

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, waterElementsBuffer);
		
		/*
		Mode
		Number of indices ( divide by 3 because 3 vertices per vertex ) then * 2 to get number of indices
		Type
		The indices
		*/
		gl.drawElements(
			gl.TRIANGLE_STRIP, 
			waterVertices.length / 3 * 2,
			gl.UNSIGNED_INT, 
			waterElementsBuffer
		); 		
	}
	
}