"use strict";			// Enforce typing in javascript

var canvas;			// Drawing surface 
var gl;				// Graphics context

var axis = 0;			// Currently active axis of rotation
var xAxis = 0;			//  Will be assigned on of these codes for
var yAxis =1;			//  
var zAxis = 2;

var theta = [0, 0, 0];		// Rotation angles for x, y and z axes
var scale = [1,1,1];
var scaleLoc;
var thetaLoc;			// Holds shader uniform variable location
var flag = true;		// Toggle Rotation Control
var cflag = false;

var vert_list;          // A list for vertices
var col_list;            // A list for colors
var indices;            // The indices for creating the tetrahedron


    var nvert_list = new Array(
        0.0,0.0,0.4,
        0.4,0.0,-0.4,
        -0.4,0.0,-0.4,
        0.0,0.6,0.0
    );

    var ncol_list = new Array(
        1.0,0.0,0.0,1.0,
        0.0,1.0,0.0,1.0,
        0.0,0.0,1.0,1.0,
        1.0,1.0,0.0,1.0
    );


    indices = [
        0,1,3,
        1,2,3,
        0,3,2,
        1,2,0
    ]


    // Creating the normal lines for each face.
    for(var i = 0; i < 12; i+=3){

        var center = new Array();
        center.push((nvert_list[indices[i]*3] + nvert_list[indices[i+1]*3] + nvert_list[indices[i+2]*3])/3);
        center.push((nvert_list[indices[i]*3+1] + nvert_list[indices[i+1]*3+1] + nvert_list[indices[i+2]*3+1])/3);
        center.push((nvert_list[indices[i]*3+2] + nvert_list[indices[i+1]*3+2] + nvert_list[indices[i+2]*3+2])/3);  // Get the center of that face
        nvert_list = nvert_list.concat(center);                                                 // Take it as one point


        var p = [nvert_list[indices[i]*3],nvert_list[indices[i]*3+1],nvert_list[indices[i]*3+2]];
        var q = [nvert_list[indices[i+1]*3],nvert_list[indices[i+1]*3+1],nvert_list[indices[i+1]*3+2]];
        var r = [nvert_list[indices[i+2]*3],nvert_list[indices[i+2]*3+1],nvert_list[indices[i+2]*3+2]];     // Get the three points which form the triangle
        

        var u = new Array();
        var v = new Array();
        for(var j = 0; j < 3; j++){
            u.push(q[j] - p[j]);
            v.push(r[j] - p[j]);            // Get U and V which are two vectors on that face
        }
        var n = crossProduct(u,v);          // Doing cross product

        var n_long = P_V_Addition(center,n,1);          // Add the normal vector to the center point.

        nvert_list = nvert_list.concat(n_long);
    }

    ncol_list= ncol_list.concat([1.0,0.1,0.1,1.0]);     // Make colors for the lines.
    ncol_list= ncol_list.concat([1.0,0.1,0.1,1.0]);

    ncol_list= ncol_list.concat([0.1,1.0,0.1,1.0]);
    ncol_list= ncol_list.concat([0.1,1.0,0.1,1.0]);

    ncol_list= ncol_list.concat([0.1,0.1,1.0,1.0]);
    ncol_list= ncol_list.concat([0.1,0.1,1.0,1.0]);

    ncol_list= ncol_list.concat([1.0,1.0,0.1,1.0]);
    ncol_list= ncol_list.concat([1.0,1.0,0.1,1.0]);

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

    document.getElementById("ButtonC").onclick = function(){cflag = !cflag;};

    document.getElementById("Front").onclick = function(){gl.cullFace(gl.FRONT);};

    document.getElementById("Back").onclick = function(){gl.cullFace(gl.BACK);};

    document.getElementById("F_and_B").onclick = function(){gl.cullFace(gl.FRONT_AND_BACK);};

    document.getElementById("xslider").onpointermove = function(event){
        scale[0] = event.target.value;
    }

    document.getElementById("yslider").onpointermove = function(event){
        scale[1] = event.target.value;
    }

    document.getElementById("zslider").onpointermove = function(event){
        scale[2] = event.target.value;
    }

    render();
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if(flag) theta[axis] += 0.017;	// Increment rotation of currently active axis of rotation in radians

    gl.uniform3fv(thetaLoc, theta);	// Update uniform in vertex shader with new rotation angle

    gl.uniform3fv(scaleLoc,scale);


    gl.drawElements(gl.TRIANGLES, 12 ,gl.UNSIGNED_BYTE, 0);         // Use drawElements to draw the tetrahedron
    if(cflag){                                                  // If needs to show the normals.
        gl.drawArrays(gl.LINES, 4, 2);
        gl.drawArrays(gl.LINES, 6, 2);
        gl.drawArrays(gl.LINES, 8, 2);
        gl.drawArrays(gl.LINES, 10, 2);
    }
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


function crossProduct(u, v){            // A function that takes two vectors and do cross product.
    return new Array(
        u[1] * v[2] - u[2] * v[1],
        u[2] * v[0] - u[0] * v[2],
        u[0] * v[1] - u[1] * v[0]
    )
}

function P_V_Addition(p,v,w){   // p is the point, v is the vector, and w is the weight which changes the distance.
    return new Array(
        p[0] + v[0] * w,
        p[1] + v[1] * w,
        p[2] + v[2] * w
    )
}