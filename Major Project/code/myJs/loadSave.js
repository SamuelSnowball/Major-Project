/*
This file currently loads and saves:
	
	
	
	
*/

function loadWorldInfo(){
	/*
	Do they have localStorage available?
	*/
	if(typeof(Storage) !== "undefined"){
		
		//Then they're saved before, retrieve items, else don't
		if(localStorage.getItem("previouslySaved")){
			playerX = localStorage.getItem("playerX");
			playerY = localStorage.getItem("playerY");
			playerZ = localStorage.getItem("playerZ");
			
			playerX -= 0.001; //fixes bug playerX set to NaN if this line not here
			playerY -= 0.001; //fixes bug playerY set to NaN if this line not here
			playerZ -= 0.001; //fixes bug playerZ set to NaN if this line not here
		}
		else{
			//Then this is first time user is playing, set their position
			playerX = 0, playerY = 0, playerZ = 0;
		}
		
	}
	else{
		alert("No local storage support, please try another browser :(");
	}
}


function saveWorldInfo(){
	/*
	In loadWorldInfo I check if previouslySaved is true,
	If it is then they've saved before.
	
	If this variable is true, then it saves checking all other variables
	*/
	localStorage.setItem("previouslySaved", true);
	
	localStorage.setItem("playerX", playerX);
	localStorage.setItem("playerY", playerY);
	localStorage.setItem("playerZ", playerZ);
}