/*
This code is needed before the projection + matrices code use it.
Without this file being included before matrices.js and projection.js, a undefined gl is thrown

Also loads in extension libraries for WebGL
*/
var canvas = document.getElementById('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var gl = canvas.getContext('webgl');
gl.enable(gl.DEPTH_TEST);

/*
Load the GUI canvas for minimap
*/
var gui_canvas = document.getElementById('GUIcanvas');
var gui_context = gui_canvas.getContext('2d');

/*
Load extension libraries, not in WebGL version 1 by default
*/

//Needed for large amount of terrain vertices
var ext = gl.getExtension('OES_element_index_uint');
if (!ext) {
  console.error ("ERROR: Your browser does not support WebGL UINT extension");
}

//Needed for VAO objects
var vao_ext = gl.getExtension ("OES_vertex_array_object");
if (!vao_ext) {
  console.error ("ERROR: Your browser does not support WebGL VAO extension");
}

// For instancing
var extension = gl.getExtension("ANGLE_instanced_arrays");
if (!extension) {
  console.error("need ANGLE_instanced_arrays");
}

var water_ext = gl.getExtension('WEBGL_depth_texture');
if (!water_ext) {
  console.error("need water extension");
}

var draw_ext = gl.getExtension('WEBGL_draw_buffers');
if (!draw_ext) {
  console.error("need draw buffer extension");
}
