var program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
console.log("Link status: " + gl.getProgramInfoLog(program));
gl.useProgram(program); //allowed to be here? or at bottom