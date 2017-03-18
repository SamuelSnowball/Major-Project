
function Player(x, y, z){

	var x = x; 
	var y = y;
	var z = z;
	
	var movementSpeed = 0.3;
	
	var xRotation = 0;
	var yRotation = 0;
	
	var previousY = 0; // To remember Y pos when moving camera for fog
	var quadrant; // Current section of the map they're in
	
	var numberQuadrantRows = terrain.get.getNumberQuadrantRows;
	var numberQuadrantColumns = terrain.get.getNumberQuadrantColumns;

	var inventory = Array(8).fill(-1);
	
	var playerVertices = [];
	var playerUvs = [];
	var playerNormals = [];
	var playerIndices = [];
	
	var playerVertexBuffer;
	var playerUvsBuffer;
	var playerIndicesBuffer;
	var playerNormalsBuffer;	
		
	/*
	P key, are they prospecting a rock?
	
	Prospecting getter needed in CollisonTester class
	*/
	var prospecting = false; 
	var inProspectingRange = false; //To know whether to update GUI or not
	var prospectingSpeed = 0.5;
	var xp = 0;
	
	var health = 100;
	
	var hasMission = false; // if they have a mission, true false
	var currentMission; // a number representing what mission they have
	
	/*
	Handles user input and changes the 4 movement variables
	The movement variables are used in the player class

	2 Arrow keys:
		Forward (up key)
		Back (down key)
		
	W Key:
		Moves camera up
		
	S Key:
		Moves camera down
	*/
	var moveUp = false, 
		moveDown = false, 
		moveForward = false, 
		moveBack = false;	
	
	this.get = {
		get prospecting(){
			return prospecting;
		},
		get xp(){
			return xp;
		},
		get hasMission(){
			return hasMission;
		},
		get currentMission(){
			return currentMission;
		},
		get inProspectingRange(){
			return inProspectingRange;
		},
		get x(){
			return x;
		},
		get y(){
			return y;
		},
		get z(){
			return z;
		},
		get speed(){
			return movementSpeed;
		},
		get quadrant(){
			return quadrant;
		},
		get inventory(){
			return inventory;
		},
		get prospectingSpeed(){
			return prospectingSpeed;
		},
		get movingForward(){
			return moveForward;
		},
		get movingBackward(){
			return moveBack;
		},
		get health(){
			return health;
		}
	}	
	
	this.set = {
		set hasMission(missionParam){
			hasMission = missionParam; // bool if they have a mission
		},
		set currentMission(missionParam){
			currentMission = missionParam; // int, what mission they have
		},
		set inProspectingRange(inRange){
			inProspectingRange = inRange;
		},
		set x(xParam){
			x = xParam; //careful
		},
		set y(yParam){
			y = yParam; //careful
		},
		set z(zParam){
			z = zParam; //careful
		},
		set xRotation(x){
			xRotation = x;
		},
		set yRotation(y){
			yRotation = y;
		},
		set inventory(param){
			inventory = param;
		},
		set prospectingSpeed(param){
			prospectingSpeed = param;
		}
	}
	
	this.add = {
		set xp(xpParam){
			xp += xpParam;
		},
		set health(hpParam){
			health += hpParam;
		},
		set x(xParam){
			x += xParam;
		},
		set y(yParam){
			y += yParam;
		},
		set z(zParam){
			z += zParam;
		}
		
	}
	
	
	setupPlayerMovement();
	setupPlayerBuffers();
	
		
	function setupPlayerMovement(){
		document.addEventListener('keydown', function(event){
			if(event.keyCode == 38){
				moveForward = true;
			}
			if(event.keyCode == 40){
				moveBack = true;
			}
			if(event.keyCode == 87){
				moveUp = true;
			}
			if(event.keyCode == 83){
				moveDown = true;
			}
			if(event.keyCode === 80){
				prospecting = true;
			}
			// Holding down M key for map, disable fog so we can see properly
			if(event.keyCode === 77){
				useFog = false;
				zFar = 768;
				/*
				Save their y position, so we can restore it when they stop pressing M
				*/
				if(y > 490){
					
				}else{
					previousY = y;
				}
			}
			if(event.keyCode === 49){
				gui.showRockInformation();
			}			
			if(event.keyCode === 50){
				gui.showInventory();
			}		
			if(event.keyCode === 51){
				gui.showMission();
			}		
			
		});
		
		
		document.addEventListener('keyup', function(event){
			if(event.keyCode == 38){
				moveForward = false;
			}
			if(event.keyCode == 40){
				moveBack = false;
			}
			if(event.keyCode == 87){
				moveUp = false;
			}
			if(event.keyCode == 83){
				moveDown = false;
			}
			if(event.keyCode === 80){
				prospecting = false;
			}
			//Released M key for map, enable fog, set the players position to what it was
			if(event.keyCode === 77){
				useFog = true;
				zFar = 256; 
				y = previousY; //Set their position back to normal
			}
		});
	}
	
	
	/*
	Checks what key the player is holding down,
	Updates player position,
	Calls function to move camera matrix accordingly.
	*/
	this.movePlayer = function(){
		/*
		Don't let the player move in the Y axis, otherwise they would fly.
		*/
		if(moveUp === true){
			y += movementSpeed;
		}
		else if(moveDown === true){
			y -= movementSpeed;
		}
		else if(moveForward === true){
			x -= (cameraPosition[0] - cameraTarget[0]) * movementSpeed;
			z -= (cameraPosition[2] - cameraTarget[2]) * movementSpeed;
		}
		else if(moveBack === true){
			x += (cameraPosition[0] - cameraTarget[0]) * movementSpeed;
			z += (cameraPosition[2] - cameraTarget[2]) * movementSpeed;
		}
		else{
		
		}
		
		this.updatePlayerCamera();
	}
	
	/*
	Updates the camera matrix with the new player position
	*/
	this.updatePlayerCamera = function(){	
		cameraMatrix = m4.yRotation(0);
		cameraMatrix = m4.translate(cameraMatrix, x, y, z);
		
		/*
		xPos = sin(y rotation in radians)
		yPos = sin(x rotation in radians)
		zPos = cos(y rotation in radians)
		
		playerYRotation is the angle I rotated
		
		I think camera target is too small,
		Its always in range 0->1, therefore camera always looks there :/
		I've added the camera position on to fix it
		*/
		cameraTarget = [
			cameraMatrix[12] + Math.sin(yRotation * cameraSpeed), 
			cameraMatrix[13] + Math.sin(xRotation * cameraSpeed),
			cameraMatrix[14] + Math.cos(yRotation * cameraSpeed),
		];
		
		// For minimap
		if(useFog === false){
			renderPlayerOnMinimap();
			y = 500;
			cameraTarget = [
				cameraMatrix[12] , 
				cameraMatrix[13] -1,
				cameraMatrix[14] -0.0001
			];		
		}
		
		// Retrieve position from camera matrix
		cameraPosition = [
			cameraMatrix[12], //x
			cameraMatrix[13], //y
			cameraMatrix[14]  //z
		];
			
		cameraMatrix = m4.lookAt(cameraPosition, cameraTarget, UP_VECTOR);
		viewMatrix = m4.inverse(cameraMatrix);
		viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);
		
		// Stops it breaking....
		currentTexture = myPerlinTexture;
		
		updateAttributesAndUniforms();
	}	
	
	/*
	Work out what quadrant the player is in
	So can process and render whats in view of the player
	*/
	this.assignPlayerQuadrant = function(){
	
		// Need count variable because quadrant is a single number, cant work it out with the 2 loops properly
		var count = 0;
		
		// r and c to avoid messing with player x and y
		for(var r=0; r<numberQuadrantRows; r++){
		
			for(var c=0; c<numberQuadrantColumns; c++){
				
				if(z > (c * 128) && z < (c + 1) * 128 && 
					x > (r * 128) && x < (r+1) * 128 ){
					
					quadrant = count;
				}			
				count ++;
			}
		}
	}
	
	var slot0 = document.getElementById("slot0");
	
	var slot1 = document.getElementById("slot1");
	var slot2 = document.getElementById("slot2");
	var slot3 = document.getElementById("slot3");
	var slot4 = document.getElementById("slot4");
	var slot5 = document.getElementById("slot5");
	var slot6 = document.getElementById("slot6");
	var slot7 = document.getElementById("slot7");
	
	
	var inventorySlotIDs = [];
	inventorySlotIDs.push(slot0, slot1, slot2, slot3, slot4, slot5, slot6, slot7);
	
	this.renderInventory = function(){
		for(var i=0; i<8; i++){
			if(inventory[i] === -1){
				//Render empty slot
				inventorySlotIDs[i].style.backgroundImage = "url('resources/rocks/empty.png')";
			}
			else{
				inventorySlotIDs[i].style.backgroundImage = "url(resources/rocks/" + inventory[i] + ".png)";
			}
		}
		
		//remake  gui?
	}

	/*
	Only call when player prospects a rock!
	*/
	this.addToInventory = function(rock){
		
		for(var i=0; i<8; i++){
			if(inventory[i] !== -1){
				// Then this spot is taken
			}
			else{
				// The inventory spot is free
				console.log("set rockid: " + rock.id);
				inventory[i] = rock.id;
				break;
			}
		}
	}
	
	/*
	All code below this is for rendering the player on the minimap,
	Just a red square
	*/
	
	
	function setupPlayerBuffers(){
		setupPlayerVertexBuffer();
		setupPlayerIndicesBuffer();
		seutpPlayerTextureBuffer();
		setupPlayerNormalsBuffer();
	}
	
	function setupPlayerVertexBuffer(){
		playerVertexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, playerVertexBuffer);
		playerVertices = [
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
		];	
	    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(playerVertices), gl.DYNAMIC_DRAW);			
	}
	
	function setupPlayerIndicesBuffer(){
		playerIndicesBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, playerIndicesBuffer);

		playerIndices = [
		  0,  1,  2,      0,  2,  3,    // front
		  4,  5,  6,      4,  6,  7,    // back
		  8,  9,  10,     8,  10, 11,   // top
		  12, 13, 14,     12, 14, 15,   // bottom
		  16, 17, 18,     16, 18, 19,   // right
		  20, 21, 22,     20, 22, 23    // left
		];

		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(playerIndices), gl.DYNAMIC_DRAW);		
	}
	
	function seutpPlayerTextureBuffer(){
		playerUvsBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, playerUvsBuffer);
		for(var x=0; x<playerVertices.length; x+=3){
			playerUvs.push(0, 1);
		}
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(playerUvs), gl.DYNAMIC_DRAW);		
	}
	
	function setupPlayerNormalsBuffer(){
		playerNormalsBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, playerNormalsBuffer);
		for(var x=0; x<playerVertices.length; x+=3){
			playerNormals.push(0, 1, 0);
		}
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(playerNormals), gl.DYNAMIC_DRAW);
	}
	
	function renderPlayerOnMinimap(){

		lightColour = [1, 1, 1];
		currentTexture = playerTexture;

		scale = m4.scaling(5, 5, 5);
		rotateX = m4.xRotation(0);
		rotateY = m4.yRotation(0);
		rotateZ = m4.zRotation(0);
		position = m4.translation(x, 50, z);
		
		//Times matrices together
		updateAttributesAndUniforms();

		//Vertices
		gl.bindBuffer(gl.ARRAY_BUFFER, playerVertexBuffer);
		gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, playerUvsBuffer);
		gl.vertexAttribPointer(textureCoordLocation, 2, gl.FLOAT, false, 0, 0);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, currentTexture.getTextureAttribute.texture); //myPerlinTexture
		gl.uniform1i(gl.getUniformLocation(program, "uSampler"), 0);

		//Normals
		gl.enableVertexAttribArray(normalAttribLocation);
		gl.bindBuffer(gl.ARRAY_BUFFER, playerNormalsBuffer);
		gl.vertexAttribPointer(normalAttribLocation, 3, gl.FLOAT, false, 0, 0);
		
		
		//Elements
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, playerIndicesBuffer);
		
		/*
		Mode
		Number of indices ( divide by 3 because 3 vertices per vertex ) then * 2 to get number of indices
		Type
		The indices
		*/
		gl.drawElements(
			gl.TRIANGLES, 
			36,
			gl.UNSIGNED_SHORT, 
			0
		); 				
	}
	
};


	
