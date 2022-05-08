"use strict";			// Enforce typing in javascript

var canvas;			// Drawing surface 
var gl;				// Graphics context

var axis = 1;			// Currently active axis of rotation
var xAxis = 0;			//  Will be assigned on of these codes for
var yAxis =1;			//  
var zAxis = 2;

var scaleLoc;
var thetaLoc;			// Holds shader uniform variable location
var disloc;

var dislist;
var scallist;

var flag = true;		// Toggle Rotation Control

var vert_array;          // A list for vertices
var col_array;            // A list for colors
var vert_list;
var col_list;

    createPedestal();

    var points2vert = [1.0,0.0,0.0,-1.0,0.0,0.0, 0.0,1.0,0.0,0.0,-1.0,0.0];  // The world axes
    var color2vert = [
        1.0,0.0,0.0,0.8,
        1.0,0.0,0.0,0.8,
        0.0,1.0,0.0,0.8,
        0.0,1.0,0.0,0.8
    ]

    vert_array = vert_array.concat(points2vert);
    col_array = col_array.concat(color2vert);
 
    vert_list = new Float32Array(vert_array);
    col_list = new Float32Array(col_array);



window.onload = function init()
{
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");


    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.8, 0.8, 0.8, 1.0);

    gl.enable(gl.DEPTH_TEST);              
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);


    // color array atrribute buffer
    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, col_list, gl.STATIC_DRAW);

    var colorLoc = gl.getAttribLocation(program, "aColor");
    gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorLoc);

    // vertex array attribute buffer

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    //gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
    gl.bufferData(gl.ARRAY_BUFFER, vert_list, gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation( program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc );

    thetaLoc = gl.getUniformLocation(program, "uTheta");
    scaleLoc = gl.getUniformLocation(program, "uScale");
    disloc = gl.getUniformLocation(program, "uDisplacement");

    render();
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniform3fv(thetaLoc, [0,0,0]);	// Update uniform in vertex shader with new rotation angle
    gl.uniform3fv(scaleLoc, [1, 1, 1]);
    gl.uniform4fv(disloc,[0.0,0.0,0.0,0.0]);
    gl.drawArrays(gl.LINES,234, 2);
    gl.drawArrays(gl.LINES, 236, 2);

    gl.uniform4fv(disloc,[0.5,0.5,0.0,0.0]);        // Front view
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 34);      // Upper surface
    gl.drawArrays(gl.TRIANGLE_FAN, 34, 34);     // Mid surface
    gl.drawArrays(gl.TRIANGLE_FAN, 68, 34);     // Bottom surface
    gl.drawArrays(gl.TRIANGLE_STRIP, 102, 66);      // Upper shell
    gl.drawArrays(gl.TRIANGLE_STRIP, 168, 66);      // Lower shell

    gl.uniform3fv(thetaLoc, [0,-Math.PI/2,0]);          // Side View
    gl.uniform4fv(disloc,[0.5,-0.5,0.0,0.0]);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 34);      // Upper surface
    gl.drawArrays(gl.TRIANGLE_FAN, 34, 34);     // Mid surface
    gl.drawArrays(gl.TRIANGLE_FAN, 68, 34);     // Bottom surface
    gl.drawArrays(gl.TRIANGLE_STRIP, 102, 66);      // Upper shell
    gl.drawArrays(gl.TRIANGLE_STRIP, 168, 66);      // Lower shell

    gl.uniform3fv(thetaLoc, [-Math.PI/2,0,0]);          // Top view
    gl.uniform4fv(disloc,[-0.5,-0.5,0.0,0.0]);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 34);      // Upper surface
    gl.drawArrays(gl.TRIANGLE_FAN, 34, 34);     // Mid surface
    gl.drawArrays(gl.TRIANGLE_FAN, 68, 34);     // Bottom surface
    gl.drawArrays(gl.TRIANGLE_STRIP, 102, 66);      // Upper shell
    gl.drawArrays(gl.TRIANGLE_STRIP, 168, 66);      // Lower shell

    //Reference: https://www.petercollingridge.co.uk/tutorials/svg/isometric-projection/ 
    var alpha = Math.asin(Math.tan(30*Math.PI/180));        // Isometric View
    var beta = 45*Math.PI/180;
    gl.uniform3fv(thetaLoc, [-alpha,-beta,0]);
    gl.uniform4fv(disloc,[-0.5,0.5,0.0,0.0]);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 34);      // Upper surface
    gl.drawArrays(gl.TRIANGLE_FAN, 34, 34);     // Mid surface
    gl.drawArrays(gl.TRIANGLE_FAN, 68, 34);     // Bottom surface
    gl.drawArrays(gl.TRIANGLE_STRIP, 102, 66);      // Upper shell
    gl.drawArrays(gl.TRIANGLE_STRIP, 168, 66);      // Lower shell
}


function createPedestal(){                  // Create the pedestal, from program 1
    vert_array = [0.0,0.2,0.0];
    col_array = [0.2,0.4,0.8,1.0];   
    
    vert_array = vert_array.concat(makeCircle([0.0,0.2,0.0], 0.25, 32))
    for(var i = 0; i<=32;i++){
        col_array.push(0.2);
        col_array.push(0.4);
        col_array.push(0.8);
        col_array.push(1.0);
    }
    
    vert_array = vert_array.concat([0.0,0.0,0.0]);
    vert_array = vert_array.concat(makeCircle([0.0,0.0,0.0], 0.1, 32))
    for(var i = 0; i<=33;i++){
        col_array.push(0.2);
        col_array.push(0.4);
        col_array.push(0.8);
        col_array.push(1.0);
    }

    vert_array = vert_array.concat([0.0,-0.2,0.0]);
    vert_array = vert_array.concat(makeCircle([0.0,-0.2,0.0], 0.25, 32))
    for(var i = 0; i<=33;i++){
        col_array.push(0.9);
        col_array.push(0.8);
        col_array.push(0.5);
        col_array.push(1.0);
    }

    for(var i = 3; i<102; i+=3){
        vert_array.push(vert_array[i]);
        vert_array.push(vert_array[i+1]);
        vert_array.push(vert_array[i+2]);
        
        vert_array.push(vert_array[i+102]);
        vert_array.push(vert_array[i+103]);
        vert_array.push(vert_array[i+104]);
    }

    for(var i = 105; i<204;i+=3){
        vert_array.push(vert_array[i]);
        vert_array.push(vert_array[i+1]);
        vert_array.push(vert_array[i+2]);
        
        vert_array.push(vert_array[i+102]);
        vert_array.push(vert_array[i+103]);
        vert_array.push(vert_array[i+104]);
    }

    for(var i = 0; i< 132;i+=4){
        col_array.push(0.6);
        col_array.push(0.2);
        col_array.push(0.8);
        col_array.push(1.0);
    }

    for(var i = 0; i< 132;i+=4){
        col_array.push(1.0);
        col_array.push(1.0);
        col_array.push(0.0);
        col_array.push(1.0);
    }

    for(var i = 0; i< 66;i+=4){
        col_array.push(0.1);
        col_array.push(0.4);
        col_array.push(0.3);
        col_array.push(1.0);
    }

    for(var i = 0; i< 132;i+=4){
        col_array.push(0.0);
        col_array.push(0.0);
        col_array.push(0.8);
        col_array.push(1.0);
    }

    for(var i = 0; i< 62;i+=4){
        col_array.push(0.1);
        col_array.push(0.4);
        col_array.push(0.3);
        col_array.push(1.0);
    }
}

function makeCircle(center, radius, nvertices){             // Create a circle with certain requirements 
    var tarray = [];

    for(var i = 0; i <= nvertices; i++){
        var deg = 2* Math.PI / nvertices * i;
        tarray.push(center[0] + radius * Math.cos(deg));
        tarray.push(center[1]);
        tarray.push(center[2] + radius * Math.sin(deg));
    }
    return tarray;
}