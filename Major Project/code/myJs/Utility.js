
/*
Contains useful utility functions
*/
function Utility(){

	/*
	Returns random int between min and min
	*/
	this.randomIntBetween = function(min, max){
		return Math.floor(Math.random() * (max-min+1) + min);
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