
/*
	New terrain rendering code:
	
			vao_ext.bindVertexArrayOES(terrainVAOs[x]); 
			gl.drawElements(gl.TRIANGLE_STRIP, quadrantFloorVerticesLength / 3 * 2, gl.UNSIGNED_INT, 0 ); 
			vao_ext.bindVertexArrayOES(null); 

*/