
/*
Have used code (ported it to JavaScript) from:
http://stackoverflow.com/questions/5988686/creating-a-3d-sphere-in-opengl-using-visual-c
*/
function makeSphere(radius, rings, sectors){
	
	var bigR = 1./(rings-1);
	var bigS = 1./(sectors-1);
	
	var vertices = [];
	var normals = [];
	var textureCoordinates = [];
	var indices = [];
	
	for(var r=0; r<rings; r++) {
		for(var s=0; s<sectors; s++)
		var y = Math.sin(-Math.PI/2 + Math.PI * r * bigR);
		var x = Math.cos(2 * Math.PI * s * bigS) * Math.sin(Math.PI * r * bigR);
		var z = Math.sin(2 * Math.PI * s * bigS) * Math.sin(Math.PI * r * bigR);
		
		textureCoordinates.push(s * bigS);
		textureCoordinates.push(r * bigR);
		
		vertices.push(x * radius);
		vertices.push(y * radius);
		vertices.push(z * radius);
		
		normals.push(x);
		normals.push(y);
		normals.push(z);
	}
	
    for(var r = 0; r < rings-1; r++) 
		for(var s = 0; s < sectors-1; s++) {
        indices.push(r * sectors + s);
        indices.push(r * sectors + (s+1));
        indices.push((r+1) * sectors + (s+1));
        indices.push((r+1) * sectors + s);
    }

	
}

function drawSphere(){
	
}