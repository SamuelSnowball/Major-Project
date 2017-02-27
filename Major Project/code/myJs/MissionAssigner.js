function MissionAssigner(){
	
	var mission0 = "Go and prospect a rock! (Hint press P key when in range of the rock)";
	var mission1 = "";
	var mission2 = "";
	var mission3 = "";
	var mission4 = "";

	
	//See if player obj has current mission,
	//If so, dont assign
	//Else, assign a new mission
	//Randomly select a mission for the player
	
	//So we can run in setup, rather than constructor automatically runs
	this.setup = function(){
	
		if(player.get.hasMission === false){
			//Assign them a mission
			
			gui.updateMission(mission0);
			//play new mission sound
			player.set.mission = true;
			sound.playNewMissionSound();
			console.log("player mission status: " + player.get.hasMission);
			//Also, make the mission GUI have some effect, glow for 5 secs or something
			//Whilst audio plays
			
		}
	
	}
	
	//Have an update function every certain amount of game time
	//if no mission, give them one, from a list, randomly pick from that list
	//basically, infinite playability with repeated hardcoded missions
	this.checkOrAssignPlayerMissions = function(){
		
		
		//document.getElementById("currentMission").style.color = "blue";
		
	}
	
}