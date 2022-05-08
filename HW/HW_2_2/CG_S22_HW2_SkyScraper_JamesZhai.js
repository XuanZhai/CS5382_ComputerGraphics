"use strict";			// Enforce typing in javascript

var canvas;			// Drawing surface 
var gl;				// Graphics context

var axis = 1;			// Currently active axis of rotation
var xAxis = 0;			//  Will be assigned on of these codes for
var yAxis =1;			//  
var zAxis = 2;

var theta = [0, 0, 0];		// Rotation angles for x, y and z axes
var scale = [1,1,1];
var displacement = [0,0,0,0];

var scaleLoc;
var thetaLoc;			// Holds shader uniform variable location
var disloc;

var dislist;
var scallist;

var flag = true;		// Toggle Rotation Control
var Tflag = false;

var vert_list;          // A list for vertices
var col_list;            // A list for colors
var indices;            // The indices for creating the tetrahedron


    var nvert_list = new Array(
        0.1,-0.1,0.1,
        0.1,0.1,0.1,
        -0.1,0.1,0.1,
        -0.1,-0.1,0.1,

        0.1,-0.1,-0.1,
        0.1,0.1,-0.1,
        -0.1,0.1,-0.1,
        -0.1,-0.1,-0.1
    );                              // The vertices for a cube. 

    var ncol_list = new Array(
        1.0,0.0,0.0,1.0,
        0.0,1.0,0.0,1.0,
        0.0,0.0,1.0,1.0,
        1.0,1.0,0.0,1.0,

        1.0,1.0,0.0,1.0,
        0.0,0.0,1.0,1.0,
        0.0,1.0,0.0,1.0,
        1.0,0.0,0.0,1.0
    );


    indices = [
        0,1,2,0,2,3,
        4,5,1,4,1,0,
        4,7,5,5,7,6,
        6,7,2,2,7,3,
        1,5,6,1,6,2,
        3,7,0,0,7,4
    ]                       // The order of vertices which construte the cube.


    var points2vert = [1.0,0.0,0.0,-1.0,0.0,0.0, 0.0,1.0,0.0,0.0,-1.0,0.0, 0.0,0.0,1.0, 0.0,0.0,-1.0];  // The world axes
    var color2vert = [
        1.0,0.0,0.0,0.8,
        1.0,0.0,0.0,0.8,
        0.0,1.0,0.0,0.8,
        0.0,1.0,0.0,0.8,
        0.0,0.0,1.0,0.8,
        0.0,0.0,1.0,0.8,
    ]

    nvert_list = nvert_list.concat(points2vert);
    ncol_list = ncol_list.concat(color2vert);
 
    vert_list = new Float32Array(nvert_list);
    col_list = new Float32Array(ncol_list);



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
    //
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

    thetaLoc = gl.getUniformLocation(program, "uTheta");
    scaleLoc = gl.getUniformLocation(program, "uScale");
    disloc = gl.getUniformLocation(program, "uDisplacement");

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

    document.getElementById("ButtonA").onclick = function(){Tflag = !Tflag;};

    setLocation();

    render();
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if(flag) theta[axis] += 0.017;	// Increment rotation of currently active axis of rotation in radians

    gl.uniform3fv(thetaLoc, theta);	// Update uniform in vertex shader with new rotation angle



    for(var i = 0; i < 9; i++){
        scale = scallist[i];
        gl.uniform3fv(scaleLoc,scale);

        displacement = dislist[i];
        gl.uniform4fv(disloc,displacement);
        gl.drawElements(gl.TRIANGLES, 36 ,gl.UNSIGNED_BYTE, 0);         // Use drawElements to draw the tetrahedron
    }

    if(Tflag == true){                              // If show the world coordinates.
        gl.uniform3fv(scaleLoc, [1, 1, 1]);
        gl.uniform4fv(disloc,[0.0,0.0,0.0,0.0]);
        gl.drawArrays(gl.LINES, 8, 2);
        gl.drawArrays(gl.LINES, 10, 2);
        gl.drawArrays(gl.LINES, 12, 2);
    }


    requestAnimationFrame(render);	// Call to browser to refresh display
}


function setLocation(){
    dislist = new Array();
    scallist = new Array();
    for(var i = 0; i < 9; i++){
        var x = Math.random() * (0.7 + 0.7) -0.7;               // Random transition on x
        var y = 0;                                      // Since it will be on the x-z plane, so y is 0.
        var z = Math.random() * (0.7 + 0.7) -0.7;
        dislist.push([x,y,z,0]);
        var sx = Math.random() * 1.5;                   // Non-uniform scaling
        var sy = Math.random() * 1.5;
        var sz = Math.random() * 1.5;
        scallist.push([sx,sy,sz]);
    }
    console.log(dislist);
}