"use strict";			// Enforce typing in javascript

var canvas;			// Drawing surface 
var gl;				// Graphics context

var at = vec3(0.0,0.0,0.0);
var up = vec3(0.0,1.0,0.0);

var left = -1.0;
var right = 1.0;
var topp = 1.0;
var bottom = -1.0;
var near = 0;
var far = 2;

var theta = 0.0;
var phi = 0.0;

var MVMLoc;
var PMLoc;			// Holds shader uniform variable location

var flag = false;		// Toggle Rotation Control

var vert_array = new Array();          // A list for vertices
var col_array = new Array();            // A list for colors
var vert_list;
var col_list;
var indices = new Array();


    for(var i = -0.8; i <= 0.8; i += 0.2){                  // 11 X 11, 121 points in total.
        for(var j = -0.8; j <= 0.8; j+= 0.2){
            vert_array.push(j);
            var Vheight = Math.cos((i-j)/2) * Math.random()*Math.random()*Math.random() - 0.1;      // ##The height equation.
            vert_array.push(Vheight);
            vert_array.push(i);

            col_array.push(0);
            col_array.push(0.5);
            col_array.push(0.3);
            col_array.push(1.0);
        }
    }

    for(var i = 0; i < 8; i++){             // Form half of the surface as triangles.
        for(var j = 0; j < 8; j++){
            indices.push(i*9 + j);
            indices.push((i+1)*9 + j);
            indices.push(i*9 + j+1);
        }
    }

    for(var i = 0; i < 8; i++){             // Form for the other half.
        for(var j = 0; j < 8; j++){
            indices.push((i+1)*9 + j);
            indices.push((i+1)*9 + j+1);
            indices.push(i*9 + j+1);
        }
    }

    var points2vert = [1.0,0.0,0.0,-1.0,0.0,0.0, 0.0,1.0,0.0,0.0,-1.0,0.0, 0.0,0.0,1.0, 0.0,0.0,-1.0];  // The world axes
    var color2vert = [
        1.0,0.0,0.0,0.8,
        1.0,0.0,0.0,0.8,
        0.0,1.0,0.0,0.8,
        0.0,1.0,0.0,0.8,
        0.0,0.0,1.0,0.8,
        0.0,0.0,1.0,0.8,
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
    gl.enable(gl.CULL_FACE);                            // Enable culling and set the default to BACK.
    gl.cullFace(gl.BACK);              
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

    var ibuffer = gl.createBuffer();                                    // Loading the element array.
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), gl.STATIC_DRAW);

    MVMLoc = gl.getUniformLocation(program, "modelViewMatrix");
    PMLoc = gl.getUniformLocation(program, "projectionMatrix");

    document.getElementById("xslider").onpointermove = function(event){
        phi = event.target.value* Math.PI/180.0;
    }

    document.getElementById("yslider").onpointermove = function(event){
        theta = event.target.value* Math.PI/180.0;
    }

    document.getElementById("ButtonT").onclick = function(){flag = !flag;};

    render();
}

function render()
{
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var eye = vec3(1.0*Math.sin(phi), 1.0*Math.sin(theta), 1.0*Math.cos(phi));      // Create the position of eyes.

    var modelViewMatrix = lookAt(eye,at,up);
    var projectionMatrix = ortho(left, right, bottom, topp, near, far);         // Calculate the two matrix.
    gl.uniformMatrix4fv(MVMLoc,false,flatten(modelViewMatrix));
    gl.uniformMatrix4fv(PMLoc, false, flatten(projectionMatrix));

    gl.drawElements(gl.TRIANGLES, 384 ,gl.UNSIGNED_BYTE, 0);  

    if(flag){
        gl.drawArrays(gl.LINES, 81, 2);
        gl.drawArrays(gl.LINES, 83, 2);
        gl.drawArrays(gl.LINES, 85, 2);
    }
    requestAnimationFrame(render);	// Call to browser to refresh display
}
