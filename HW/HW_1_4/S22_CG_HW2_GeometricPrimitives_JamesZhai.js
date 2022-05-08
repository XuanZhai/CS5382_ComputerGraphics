"use strict";			// Enforce typing in javascript

var canvas;			// Drawing surface 
var gl;				// Graphics context

var axis = 0;			// Currently active axis of rotation
var xAxis = 0;			//  Will be assigned on of these codes for
var yAxis =1;			//  
var zAxis = 2;

var theta = [0, 0, 0];		// Rotation angles for x, y and z axes
var thetaLoc;			// Holds shader uniform variable location
var flag = true;		// Toggle Rotation Control


    var vert_array = [0.5,0.8,0.0];
    var col_array = [0.2,0.4,0.8,1.0];                          // 34 vertices


    vert_array = vert_array.concat(makeCircle([0.5,0.4,0.0],0.2,32));       // Create the shell of the cone 
    for(var i = 0; i <= 32; i++){
        col_array.push(0.2);
        col_array.push(0.4);
        col_array.push(0.8);
        col_array.push(1.0);
    }

    vert_array = vert_array.concat([0.5,0.4,0.0]);                          // Create the bottom of the cone 
    vert_array = vert_array.concat(makeCircle([0.5,0.4,0.0],0.2,32));
    for(var i = 0; i <= 33; i++){
        col_array.push(0.8);
        col_array.push(0.5);
        col_array.push(0.2);
        col_array.push(1.0);
    }


    vert_array = vert_array.concat([-0.4,0.2,0.1, -0.2,0.2,0.1, -0.2,0.2,-0.1, -0.4,0.2,-0.1]); // Create the cube
    vert_array = vert_array.concat([-0.4,0.4,0.1, -0.2,0.4,0.1, -0.2,0.4,-0.1, -0.4,0.4,-0.1]);
    vert_array = vert_array.concat([-0.4,0.2,0.1, -0.4,0.4,0.1]);
    vert_array = vert_array.concat([-0.2,0.2,0.1, -0.2,0.4,0.1]);
    vert_array = vert_array.concat([-0.2,0.2,-0.1, -0.2,0.4,-0.1]);
    vert_array = vert_array.concat([-0.4,0.2,-0.1, -0.4,0.4,-0.1]);
    for (var i = 0; i < 16; i++){
        col_array.push(0.8);
        col_array.push(0.6);
        col_array.push(0.5);
        col_array.push(1.0);
    }


    var topcircle = makeCircle([0.5,-0.3,0.0],0.2,32);          // Create the top and the botttom of the cylinder
    var bottomcircle = makeCircle([0.5,-0.6,0.0],0.2,32);
    vert_array = vert_array.concat([0.5,-0.3,0.0]);
    vert_array = vert_array.concat(topcircle);
    for(var i = 0; i <= 33; i++){
        col_array.push(0.1);
        col_array.push(0.7);
        col_array.push(0.7);
        col_array.push(1.0);
    }


    vert_array = vert_array.concat([0.5,-0.6,0.0]);
    vert_array = vert_array.concat(bottomcircle);
    for(var i = 0; i <= 33; i++){
        col_array.push(0.1);
        col_array.push(0.7);
        col_array.push(0.7);
        col_array.push(1.0);
    }

    var cylindervertex = []
    for(var i = 0; i <= 32*3;i+=3){                         // Connect the circles to form a shell
        cylindervertex.push(topcircle[i]);
        cylindervertex.push(topcircle[i+1]);
        cylindervertex.push(topcircle[i+2]);

        cylindervertex.push(bottomcircle[i]);
        cylindervertex.push(bottomcircle[i+1]);
        cylindervertex.push(bottomcircle[i+2]);
    }
    vert_array = vert_array.concat(cylindervertex);
    for(var i = 0; i <= 66;i++){
        col_array.push(1.0);
        col_array.push(0.0);
        col_array.push(0.0);
        col_array.push(1.0);
    }


    var vertices = new Float32Array(vert_array);
    var vertexColors = new Float32Array(col_array);




window.onload = function init()
{
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");


    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.8, 0.8, 0.8, 1.0);

    gl.enable(gl.DEPTH_TEST);;

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // color array atrribute buffer

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexColors, gl.STATIC_DRAW);

    var colorLoc = gl.getAttribLocation(program, "aColor");
    gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorLoc);

    // vertex array attribute buffer

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    //gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation( program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc );

    thetaLoc = gl.getUniformLocation(program, "uTheta");

    //event listeners for buttons

    document.getElementById( "xButton" ).onclick = function () {
        axis = xAxis;
    };
    document.getElementById( "yButton" ).onclick = function () {
        axis = yAxis;
    };
    document.getElementById( "zButton" ).onclick = function () {
        axis = zAxis;
    };
    document.getElementById("ButtonT").onclick = function(){flag = !flag;};

    render();
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if(flag) theta[axis] += 0.017;	// Increment rotation of currently active axis of rotation in radians

    gl.uniform3fv(thetaLoc, theta);	// Update uniform in vertex shader with new rotation angle

    //gl.drawArrays(gl.LINES, 0, vertices.length/3);	// Try changing the primitive type
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 34);      // Cone shell
    gl.drawArrays(gl.TRIANGLE_FAN, 34, 34);     // Cone bottom
    gl.drawArrays(gl.LINE_LOOP, 68, 4);         // Cube top
    gl.drawArrays(gl.LINE_LOOP, 72, 4);         // Cube bottom
    gl.drawArrays(gl.LINES, 76, 2);             // Cube mid lines
    gl.drawArrays(gl.LINES, 78, 2);
    gl.drawArrays(gl.LINES, 80, 2);
    gl.drawArrays(gl.LINES, 82, 2);
    gl.drawArrays(gl.TRIANGLE_STRIP, 152, 66);      // Cylinder shell
    gl.drawArrays(gl.TRIANGLE_FAN, 84, 34);         // Cylinder top
    gl.drawArrays(gl.TRIANGLE_FAN, 118, 34);        // Cylinder bottom
    requestAnimationFrame(render);	// Call to browser to refresh display
}


function makeCircle(center, radius, nvertices){
    var tarray = [];

    for(var i = 0; i <= nvertices; i++){
        var deg = 2* Math.PI / nvertices * i;
        tarray.push(center[0] + radius * Math.cos(deg));
        tarray.push(center[1]);
        tarray.push(center[2] + radius * Math.sin(deg));
    }
    return tarray;
}