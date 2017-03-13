function MissionAssigner(){
	
	var mission0 = "Go and prospect a rock! (Hint: press P key when in range of the rock)";
	var mission1 = "Mission 1";
	var mission2 = "Mission 2";
	var mission3 = "Mission 3";
	var mission4 = "Mission 4";

	var missions = [];
	missions.push(mission0, mission1, mission2, mission3, mission4);
	
	/*
	Randomly select a mission for the player if they don't have one
	*/
	this.checkOrAssignPlayerMissions = function(){
		
		if(player.get.hasMission === false){
			// Assign them a mission from the available list
			var randomMission = Math.floor(Math.random() * 4) + 0;
			gui.updateMission(missions[randomMission]);
			player.set.currentMission = randomMission;
			player.set.hasMission = true;
			
			sound.playNewMissionSound();
		}
		else{
			// Player already has a mission, don't let them get a new one until current mission is complete
			
			// See if mission has been completed
			if(player.get.currentMission === 0 && player.get.xp > 0){
				// mission complete
				// play some sound
				// clear old mission gui text
				gui.clearMission();
				player.set.hasMission = false;
			}
			
		}
		
	}

}