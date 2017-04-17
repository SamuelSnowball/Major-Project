
/*
Contains useful functions
*/
function Utility(){

	this.randomIntBetween = function(min, max){
		if(min > max){
			return 0;
		}
		else{
			return Math.floor(Math.random() * (max-min+1) + min);
		}
	}
	
	this.randomBetween = function(min, max){
		return (Math.random() * (max-min+1) + min);
	}
	
	// For camera
	this.toRadians = function(angle) {
		return angle * (Math.PI / 180);
	}	
		
	/*
	Retrieves the obj text from provided url
	*/
	this.httpGet = function(theUrl){
		var xmlHttp = new XMLHttpRequest();
		xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
		xmlHttp.send( null );
		return xmlHttp.responseText;
	}
	
}