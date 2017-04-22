
/**
 * Contains useful functions
 * 
 * 
 * @class Utility
*/
function Utility(){
	
	/**
	@method randomIntBetween
	@public
	@param min {int} minimum number possible
	@param max {int} maximum number possible
	*/
	this.randomIntBetween = function(min, max){
		if(min > max){
			return 0;
		}
		else{
			return Math.floor(Math.random() * (max-min+1) + min);
		}
	}

	/**
	@method randomBetween
	@public
	@param min {float} minimum number possible
	@param max {float} maximum number possible
	*/	
	this.randomBetween = function(min, max){
		return (Math.random() * (max-min+1) + min);
	}
	
	/**
	Used in camera class
	
	@method toRadians
	@public
	@param angle {float} the angle to convert to radians
	*/
	this.toRadians = function(angle) {
		return angle * (Math.PI / 180);
	}	
		
	/**
	Retrieves the obj text from provided url
	
	@method httpGet
	@public
	@param theUrl {string} path to the obj text file
	*/
	this.httpGet = function(theUrl){
		var xmlHttp = new XMLHttpRequest();
		xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
		xmlHttp.send( null );
		return xmlHttp.responseText;
	}
	
}