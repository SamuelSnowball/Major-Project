/*
This file is needed to load this code, before the projection + matrices code uses it.
Without this file being included before matrices.js and projection.js, a undefined gl is thrown

var canvas = document.createElement('canvas');
canvas.width = window.innerWidth; //to stop annoying scrolling
canvas.height = window.innerHeight; //to stop annoying scrolling
canvas.className = "canvasClass";

document.body.appendChild(canvas);
*/

var canvas = document.getElementById('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var gl = canvas.getContext('webgl2');
gl.enable(gl.DEPTH_TEST);
gl.clearColor(0.1, 0.1, 0.1, 0);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

var ext = gl.getExtension('OES_element_index_uint');



