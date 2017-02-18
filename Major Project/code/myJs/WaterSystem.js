


function WaterSystem(){
	
	var waterVertexBuffer;
	var waterTextureCoordinateBuffer;
	var waterElementsBuffer;
	var waterVertices = [];
	var textureCoordinates = [];
	
	var waterRows = 64;
	var waterColumns = 64;
	var waterSize = waterRows * waterColumns;
	
	setupWater();
	
	function setupWater(){
		createWaterVertices();
		setupWaterIndiciesBuffer();
		setupWaterTextureCoordinates();
	}
	
	function createWaterVertices(){
			//For each row, do all the columns
					waterVertexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, waterVertexBuffer);
		
		
		
			var waterX = 0,
			waterY = 0,
			waterZ = 0;
		for(var x=0; x<waterRows; x++){
			for(var y=0; y<waterColumns; y++){
				
				waterVertices.push(waterX); 
				waterVertices.push(waterY);
				waterVertices.push(waterZ); 
				
				//Move along in the row
				waterX++;
			}
			//New row, reset X, and increment Z
			waterX = 0;
			waterZ++;
		}
		
		//Reset all values as above loop changed them
		x = 0; y = 0; z = 0; 

		console.log("Water vertices: " + waterVertices.size);
		console.log("Individual water x,y,z values: " + waterVertices.length);	
		
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(waterVertices), gl.STATIC_DRAW);
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
	
	
	/*
	Currently the waterVertices are being completely reset every frame,
	But they should just slightly increment
	*/
	this.updateWaterVertices = function(){
		/*
		Loop through all water vertices, apply Sin to their height?
		
		WaterVertices is 1D array
		
		Might need waterVertices.length * 3?
		*/
		var now = Date.now();
		gl.bindBuffer(gl.ARRAY_BUFFER, waterVertexBuffer);
		for(var i=0; i<waterVertices.length; i+=3){
			//waterVertices[i]; //x, dont change
			waterVertices[i+1] += Math.sin(i * now) ; //y, change this
			
			//Once hit max height, make go down again
			if(waterVertices[i+1 > 2]){
				waterVertices[i+1] -= Math.sin(i * now);
			}
			
			
			//console.log("set height to: " + Math.sin(i) * 10);
			//waterVertices[i+2]; //z dont change
		}
		//console.log("lewping");
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(waterVertices), gl.DYNAMIC_DRAW);
		
	}
	
	this.render = function(){
		scale = m4.scaling(1, 1, 1);
		xRotation = m4.xRotation(0);
		yRotation = m4.yRotation(0);
		zRotation = m4.zRotation(0);
		position = m4.translation(0, 5, 0);
		
		//Times matrices together
		updateAttributesAndUniforms();
			
		gl.bindBuffer(gl.ARRAY_BUFFER, waterVertexBuffer);
		gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, waterTextureCoordinateBuffer);
		gl.vertexAttribPointer(textureCoordLocation, 2, gl.FLOAT, false, 0, 0);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, waterTexture);
		gl.uniform1i(gl.getUniformLocation(program, "uSampler"), 0);
		

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