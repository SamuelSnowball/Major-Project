
/**
 * Minimap in bottom right corner of screen,
 * Displays terrain cells and camera position
 * 
 * Uses a completely new 2D canvas, rendering over the WebGL one
 * 
 * Current problems:
 * 	The collision on the grid is calculated from cameras world position like usual
 * 	But the user appears to go into the out of range cells, due to coordinates being calculated
 * 	from the top left of the square.
 * 	
 * 	The user doesn't actually go outside of the allowed cells on the map, 
 * 	it just looks like they do on the minimap.
 * 
 * @class Minimap
*/
function Minimap(){

	var canvas_width = 58; // the CSS makes canvas way too big, the canvas is just blank so cant see it
	var canvas_height = 58; // it looks smaller, cos only rendering a square to 50,50 - so set these as the height

	var gui_canvas_min = 0;
	var gui_canvas_max = canvas_width;

	var map_min = 0;
	var map_max = terrain.get.getTerrainRows;

	/*
	Example for 4x4 map
		getTerrainRows = 512;
		getNumberQuadrantRows = 4;
		So the boundary value = 512/4 = 128
	Now need to map it to canvas size, the below 2 lines do this
	*/
	var canvas_boundary_unmapped = terrain.get.getTerrainRows / terrain.get.getNumberQuadrantRows;
	var canvas_boundary_mapped = (canvas_boundary_unmapped - 0) / (terrain.get.getTerrainRows - 0) * (gui_canvas_max - gui_canvas_min) + gui_canvas_min;

	// Size of user on minimap
	var user_width = 4;
	var user_height = 4;

	/**
	Maps the user position in the world, to the position on the canvas
	Then draws the user as a blue square
	
	@method renderUser
	@private
	*/
	function renderUser(){
		// Do the mapping
		var userX = (camera.get.x - map_min) / (map_max - map_min) * (gui_canvas_max - gui_canvas_min) + gui_canvas_min;
		var userZ = (camera.get.z - map_min) / (map_max - map_min) * (gui_canvas_max - gui_canvas_min) + gui_canvas_min;
		
		// Now draw
		gui_context.fillStyle = 'rgb(255,0,0)'; // Prepare to draw blue square
		gui_context.fillRect(userX, userZ, user_width, user_height); // Draws square
	}

	/**
	The below code draws the blue lines across the minimap
	
	@method renderGrid
	@private
	*/	
	function renderGrid(){
		// For working out how many grid_rows to draw
		// Since it can be updated via UI, needs to be checked
		// Should update once via UI, getter/setter
		var grid_rows = terrain.get.getNumberQuadrantRows;
		map_max = terrain.get.getTerrainRows;
		canvas_boundary_unmapped = terrain.get.getTerrainRows / terrain.get.getNumberQuadrantRows;
		canvas_boundary_mapped = (canvas_boundary_unmapped - 0) / (terrain.get.getTerrainRows - 0) * (gui_canvas_max - gui_canvas_min) + gui_canvas_min;
	
		var grid_start_x = 0;
		var grid_start_y = 0;
		
		var grid_end_x = canvas_width;
		var grid_end_y = 0;	

		// Draws horizontal grid lines 
		for(var y=0; y<grid_rows+1; y++){
			gui_context.beginPath();
			gui_context.moveTo(grid_start_x, grid_start_y);
			gui_context.lineTo(grid_end_x, grid_end_y);
			gui_context.lineWidth = 1;
			gui_context.strokeStyle = 'rgb(47, 161, 214)';
			gui_context.stroke();
		
			grid_start_y += canvas_boundary_mapped;
			grid_end_y += canvas_boundary_mapped;
		}

		// Reset values
		grid_start_y = 0;
		grid_end_y = canvas_width;
		grid_end_x = 0;
		
		// Draw vertical grid lines
		for(var x=0; x<grid_rows+1; x++){
			gui_context.beginPath();
			gui_context.moveTo(grid_start_x, grid_start_y);
			gui_context.lineTo(grid_end_x, grid_end_y);
			gui_context.lineWidth = 1;
			gui_context.strokeStyle = 'rgb(47, 161, 214)';
			gui_context.stroke();
		
			grid_start_x += canvas_boundary_mapped;
			grid_end_x += canvas_boundary_mapped;
		}		
	}
	
	/**
	Render 4 rectangles on the borders of the minimap,
	marking the out of range cells.
	
	If render these first, can just use 4 rectangles, and the grid will properly render over it
	
	canvas_boundary_mapped is just the width of a cell
	
	@method renderOutOfRangeCells
	@private
	*/
	function renderOutOfRangeCells(){
		gui_context.fillStyle = 'rgb(25,25,112)'; // Prepare to draw black rectangle
		
		gui_context.fillRect(0, 0, canvas_boundary_mapped, canvas_height); // top left to bottom left rect
		gui_context.fillRect(canvas_width - canvas_boundary_mapped, 0, canvas_boundary_mapped, canvas_height); // top right to bottom right rect
		gui_context.fillRect(0, 0, canvas_width, canvas_boundary_mapped);  // top left to top right
		gui_context.fillRect(0, canvas_height - canvas_boundary_mapped, canvas_width, canvas_boundary_mapped); // bottom left to bottom right
	}
	
	/**
	Calls methods to render grid and user
	
	@method render
	@public
	*/
	this.render = function(){
		gui_context.clearRect(0, 0, canvas_width, canvas_height); // Clears minimap for redrawing
		
		renderOutOfRangeCells();
		renderGrid();
		renderUser();
	}
	
}