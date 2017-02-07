/*
This file is needed to load this code, before the projection + matrices code uses it.
Without this file being included before matrices.js and projection.js, a undefined gl is thrown
*/
var canvas = document.createElement('canvas');
canvas.width = window.innerWidth; //to stop annoying scrolling
canvas.height = window.innerHeight; //to stop annoying scrolling

document.body.appendChild(canvas);

var gl = canvas.getContext('webgl');
gl.clearColor(0, 0, 0, 0);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);



