/*
This file contains code for pointerlock,

Also holds the global rotation parameters that get used in matrices

When user clicks, GUI elements display
*/
canvas.requestPointerLock = canvas.requestPointerLock ||
                            canvas.mozRequestPointerLock;
							
document.exitPointerLock = document.exitPointerLock    ||
							document.mozExitPointerLock;

var pointerLocked = false;

var prospectingBarValue = 0;
			
canvas.addEventListener('mousedown', function(){
	
	$(function(){
		$("#menu").menu();
		
		$("#minimapID").dialog({
			height: window.innerHeight/2.5,
			width: window.innerWidth/3,
			resizable: false,
			position: {  at: "left bottom-10%" },
			closeOnEscape: false,
			open: function(event, ui) { $(".ui-dialog-titlebar-close").hide(); },
			draggable: false
		});
		$("#nearestRockID").dialog({
			height: window.innerHeight/3,
			width: window.innerWidth/4.5,
			resizable: false,
			position: {  at: "center-4% bottom-15%"},
			closeOnEscape: false,
			open: function(event, ui) { $(".ui-dialog-titlebar-close").hide(); },
			draggable: false
		});	
		$("#inventoryOverlayID").dialog({
			height: window.innerHeight/3,
			width: window.innerWidth/4.5 - window.innerWidth/50,
			resizable: false,
			position: {  at: "right-32% bottom-15%"},
			closeOnEscape: false,
			open: function(event, ui) { $(".ui-dialog-titlebar-close").hide(); },
			draggable: false
		});
		$("#currentMissionID").dialog({
			height: window.innerHeight/3,
			width: window.innerWidth/4.5 - window.innerWidth/50,
			resizable: false,
			position: {  at: "right bottom-15%"},
			closeOnEscape: false,
			open: function(event, ui) { $(".ui-dialog-titlebar-close").hide(); },
			draggable: false
		});
		
		$( "#depositOreID" ).progressbar({
			closeOnEscape: false,
			draggable: false
		})
	
		$( "#xpBarID" ).progressbar({
			value: 100,
			closeOnEscape: false,
			draggable: false
		})
		$( "#prospectingBarID" ).progressbar({
			value: prospectingBarValue,
			closeOnEscape: false,
			draggable: false
		})

	})
	
	if(gameRunning === false){
		setup();
	}
	else{
		//Game already running, dont run setup again
	}

	//Remove background image and text when game starts
	var banner = document.getElementById('banner');
	if(banner !== null){
		banner.parentNode.removeChild(banner);
	}
	document.body.style.backgroundImage = ""; 
	
	/*
	The boolean pointerLocked might screw up if they exit via escape
	*/
	if(pointerLocked === false){
		canvas.requestPointerLock();
		console.log("Pointer locked!");
		pointerLocked = true;
	}
	else{
		// They clicked again, attempt to unlock
		pointerLocked = false;
		console.log("Pointer unlocked!");
		document.exitPointerLock();
	}
	
	//Show GUI elements
	/*
	document.getElementById("xpOverlay").style.visibility = "visible";
	document.getElementById("minimapOverlay").style.visibility = "visible";
	document.getElementById("missionOverlay").style.visibility = "visible";
	document.getElementById("nearestRockOverlay").style.visibility = "visible";
	document.getElementById("inventoryOverlay").style.visibility = "visible";
	*/
	
	document.getElementById("minimapID").style.visibility = "visible";
	document.getElementById("nearestRockID").style.visibility = "visible";
	document.getElementById("currentMissionID").style.visibility = "visible";
	document.getElementById("menu").style.visibility = "visible";
	document.getElementById("xpBarID").style.visibility = "visible";	
	document.getElementById("inventoryOverlayID").style.visibility = "visible";	
	
});


var currentRotateY = 0;
var currentRotateX = 0;
var rotateSpeed = 0.3;

var prevX = 0;
var prevY = 0;

canvas.addEventListener('mousemove', function(e){

	/*
	X and Y are kinda reversed here, because you move mouse on the X, to rotate terrain in Y
	*/
	if(pointerLocked === true){
		//Horizontal
		var currentXMovement = e.movementX;
		currentRotateY += currentXMovement + prevX;//e.movementX;
		prevX = currentXMovement;
		player.set.yRotation = currentRotateY * rotateSpeed;
		
		//Vertical
		var currentYMovement = e.movementY;
		currentRotateX += currentYMovement + prevY;
		prevY = currentYMovement;
		player.set.xRotation = currentRotateX * rotateSpeed;
	}
	
});
							
