var program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
console.log("Link status: " + gl.getProgramInfoLog(program));
gl.useProgram(program); //allowed to be here? or at bottom

/*
Should replace vertex colour attribute
*/
var textureCoordLocation = gl.getAttribLocation(program, "aTextureCoord");
gl.enableVertexAttribArray(textureCoordLocation);

var positionAttribLocation = gl.getAttribLocation(program, 'position');
gl.enableVertexAttribArray(positionAttribLocation);

var normalAttribLocation = gl.getAttribLocation(program, 'normal');
gl.enableVertexAttribArray(normalAttribLocation);

var lightPositionAttribLocation = gl.getUniformLocation(program, 'lightPosition');
var lightColourAttribLocation = gl.getUniformLocation(program, 'lightColour');

gl.enableVertexAttribArray(lightPositionAttribLocation);
gl.enableVertexAttribArray(lightColourAttribLocation);

//Specular lighting
var shineDamperAttribLocation = gl.getUniformLocation(program, 'shineDamper');
gl.enableVertexAttribArray(shineDamperAttribLocation);

var reflectivityAttribLocation = gl.getUniformLocation(program, 'reflectivity');
gl.enableVertexAttribArray(reflectivityAttribLocation);

//Directional
var reverseLightDirectionLocation = gl.getUniformLocation(program, 'reverseLightDirection');
gl.enableVertexAttribArray(reverseLightDirectionLocation);

//Specular
var lightDirectionLocation = gl.getUniformLocation(program, 'lightDirection');
gl.enableVertexAttribArray(lightDirectionLocation);

var skyColourLocation = gl.getUniformLocation(program, 'skyColour');
gl.enableVertexAttribArray(skyColourLocation);