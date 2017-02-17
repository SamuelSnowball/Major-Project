/*
This file currently loads and saves:
	Player position
*/
function WorldState(){

	this.loadWorld = function(){
	
		/*
		Do they have localStorage available?
		*/
		if(typeof(Storage) !== "undefined"){
			
			if(localStorage.getItem("playerXPos") !== "undefined"){
				player.x = localStorage.getItem("playerXPos");
				player.y = localStorage.getItem("playerYPos");
				player.z = localStorage.getItem("playerZPos");
			}
			else{
				//Then this is first time user is playing, set their position
				player.x = 0, player.y = 0, player.z = 0;
			}
			
		}
		else{
			alert("No local storage support, please try another browser :(");
		}
	}
	
	this.saveWorld = function(){		
		localStorage.setItem("playerXPos", player.x);
		localStorage.setItem("playerYPos", player.y);
		localStorage.setItem("playerZPos", player.z);
	}
}

