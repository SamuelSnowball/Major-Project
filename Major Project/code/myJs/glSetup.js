/*
This file is needed to load this code, before the projection + matrices code uses it.
Without this file being included before matrices.js and projection.js, a undefined gl is thrown
*/

var canvas = document.getElementById('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var gl = canvas.getContext('webgl');
gl.enable(gl.DEPTH_TEST);
gl.clearColor(0.1, 0.1, 0.1, 0);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

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


