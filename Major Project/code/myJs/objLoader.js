	
var rockObj1Vertices = [];
var rockObj1Normals = [];
var rockObj1Uvs = [];
var rockObj1Indices = [];
	
function ObjLoader(){
	
	this.loadObj = function(path, texture){
		
		var indicesLength = 0;			
					
		var rawFile = new XMLHttpRequest();
		rawFile.open("GET", path, false);
		rawFile.onreadystatechange = function ()
		{
			if(rawFile.readyState === 4)
			{
				if(rawFile.status === 200 || rawFile.status == 0)
				{
					//elements/indices = faces
				
					var allText = rawFile.responseText;
					lines = allText.split("\n"); 

					var number = 0.0;
					var isNegative = false;
					for(i = 0; i < lines.length; i++){ 
						//Lines starts with a V, but cant be VN or VT
						if(lines[i].charAt(0) === "v" && lines[i].charAt(1) !== "t" && lines[i].charAt(1) !== "n"){
							//console.log("started with v");
							
							//For every character in the current line, search it
							for(var x=0; x<lines[i].length; x++){
								if(lines[i].charAt(x) === "."){
									
									//This is ONE x, OR y OR z, not all 3. Get the number before the decimal and 2 after it
									number = lines[i].charAt(x-1);
									number = parseFloat(number[0]);
									var a = 0.0;
									a = 0.1 * lines[i].charAt(x+1);
									number += a;
									
									var b = 0.0;
									b = 0.01 * lines[i].charAt(x+2);
									number += b;
									
									//Check if number is negative
									if(lines[i].charAt(x-2) === "-"){
										number *= -1;
									}
									else{
										//Number was positive leave it
									}
									
									//console.log("number is: " + number);
						
									rockVertices.push(number);
								}
							}
							
						}
						//Line starts with VN
						else if(lines[i].charAt(0) === "v" && lines[i].charAt(1) === "n"){
							//console.log("started with vn");
							//normals
							for(var x=0; x<lines[i].length; x++){
								if(lines[i].charAt(x) === "."){
									//This is ONE x, OR y OR z, not all 3. Get the number before the decimal and 2 after it
									number = lines[i].charAt(x-1);
									number = parseFloat(number[0]);
									var a = 0.0;
									a = 0.1 * lines[i].charAt(x+1);
									number += a;
									
									var b = 0.0;
									b = 0.01 * lines[i].charAt(x+2);
									number += b;
									
									//Check if number is negative
									if(lines[i].charAt(x-2) === "-"){
										number *= -1;
									}
									else{
										//Number was positive leave it
									}
									
									//console.log("normal is: " + number);
									
							
									rockNormals.push(number);			
								}
							}								
						}
						else if(lines[i].charAt(0) === "v" && lines[i].charAt(1) === "t"){
						//	console.log("started with vt (uv)");
							//uvs
							for(var x=0; x<lines[i].length; x++){
								if(lines[i].charAt(x) === "."){
									//This is ONE x, OR y OR z, not all 3. Get the number before the decimal and 2 after it
									number = lines[i].charAt(x-1);
									number = parseFloat(number[0]);
									var a = 0.0;
									a = 0.1 * lines[i].charAt(x+1);
									number += a;
									
									var b = 0.0;
									b = 0.01 * lines[i].charAt(x+2);
									number += b;
									
									//Check if number is negative
									if(lines[i].charAt(x-2) === "-"){
										number *= -1;
									}
									else{
										//Number was positive leave it
									}
									
									//console.log("uv is: " + number);
								
									rockUvs.push(number);							
								}
							}
						}
						else if(lines[i].charAt(0) === "f"){
							//console.log("started with faces");
							//faces
							//for current line, go through every character
							for(var x=0; x<lines[i].length; x++){
								//If character is a slash, or whitespace, get 1 or 2 numbers before it
								//the x > 1 is needed otherwise, it will go on the whitespace between f and the start number
								if(lines[i].charAt(x) === "/" || lines[i].charAt(x) === " " && x > 1){
									
									//debugger;
									//lines[i].charAt(x) is a slash or whitespace atm
									//If current isnt equal to whitespace or slash, get as number
									
									//Get the previous previous previous first, so can concatenate easily
									//Need to check if going past a slash, atm it skips?
									var number = 0.0;
									if(lines[i].charAt(x-3) !== "/" && lines[i].charAt(x-3) !== " "){
										//Try the previous previous character, to the slash/whitespace
										//Check if we went over a whitespace or slash, if we did, break
										if(lines[i].charAt(x-2) === "/" 
										|| lines[i].charAt(x-2) === " "
										|| lines[i].charAt(x-1) === "/" 
										|| lines[i].charAt(x-1) === " "){
											
										}
										else{
											
											var previousPrevious = 0.0;
											previousPrevious = 100 * lines[i].charAt(x-3);
											number += previousPrevious;
										}
					
									}
									//Get the previous previous
									if(lines[i].charAt(x-2) !== "/" && lines[i].charAt(x-2) !== " "){
										//Try the previous previous character, to the slash/whitespace
										var previousPrevious = 0.0;
										previousPrevious = 10 * lines[i].charAt(x-2);
										number += previousPrevious;
									}
									if(lines[i].charAt(x-1) !== "/" && lines[i].charAt(x-1) !== " "){
										//Then the previous character before the slash, is a number
										var previous = 0.0;
										previous = 1 * lines[i].charAt(x-1);
										number += previous;
									}
									
									//console.log("Indice is: " + number);
									
									//This doesnt have to do whole line, just 1 slash at a time?
									indicesLength+=3;
									rockIndices.push(number);
								}
							}
						}
						else{
							//Was a comment in the obj file, dont care
						}
					}
					
					
				}
			}
		}
		rawFile.send(null);
		
		// xPos, yPos, zPos, width, xRotation, yRotation, zRotation, scale, texture
		var x = Math.floor(Math.random() * terrain.get.getTerrainRows) + 0;
		var z = Math.floor(Math.random() * terrain.get.getTerrainRows) + 0;
		terrain.heightMapValueAtIndex.setTemporaryHeightMapX = x;
		terrain.heightMapValueAtIndex.setTemporaryHeightMapZ = z;
		var rockHeight = terrain.heightMapValueAtIndex.getTemporaryHeightMapValue;
		var y = rockHeight + 1;
		
		console.log("obj indices : " + indicesLength);
		var objRock = new Rock( x, y, z, 3, 0, 0, 0, 1, texture, indicesLength);
		rockGenerator.getRocksArray.getRocks.push(objRock);
		//rockVertices.push(objVertices);
		//rockNormals.push(objNormals);
		//rockUvs.push(objUvs);
		//rockIndices.push(objIndices);
	}
	
	
	
	
}