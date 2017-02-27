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
			
			if(localStorage.getItem("playerXPos") !== "undefined" && 
				localStorage.getItem("playerYPos") !== "undefined" && 
				localStorage.getItem("playerZPos") !== "undefined"){
				
				console.log("Retrieved these values from local storage: " + localStorage.getItem("playerXPos") + ", " + localStorage.getItem("playerYPos") + ", " + localStorage.getItem("playerZPos"));
				
				player.set.x = localStorage.getItem("playerXPos");
				player.set.y = localStorage.getItem("playerYPos");
				player.set.z = localStorage.getItem("playerZPos");
				
			}
			else{
				//Then this is first time user is playing, set their position
				player.set.x = 0, player.set.y = 0, player.set.z = 0;
			}
			
		}
		else{
			alert("No local storage support, please try another browser :(");
		}
	}
	
	this.saveWorld = function(){		
		localStorage.setItem("playerXPos", player.get.x);
		localStorage.setItem("playerYPos", player.get.y);
		localStorage.setItem("playerZPos", player.get.z);
	}
}

