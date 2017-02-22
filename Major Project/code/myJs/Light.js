

function Light(){
	var position = (10, 10, 10);
	var colour;
	
	//pass normals array, how to calculate for vertices
	
	//bind normals in shader
	//enable attrib array 2 in render

	/*
	To calculate brightness
	
	Find vector from object to light source
	
	Every vertex has:
		vector pointing towards lightsource
		and normal vector
		
	The more a vertex is facing towards the light,
	The closer the above 2 vectors are together
	
	Determine brightness, based on if 2 vectors are facing same direction
	
	How to measure distance between the 2 vectors,
	dot product/scalar product
	Must be unit vectors
	
	a . product b = 1, if in same direction
	If 90 degrees, away = 0
	
	Have to rotate the normal in shader,
	because our object can be rotated
	
	*/
}

//Position it when rendering
//set color to white, 1,1,1 rgb
var light = new Light();

function setupLightEverything(){

}

function renderLight(){
	
	
	
	
}