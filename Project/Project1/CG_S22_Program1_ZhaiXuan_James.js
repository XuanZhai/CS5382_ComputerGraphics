"use strict";			// Enforce typing in javascript

var canvas;			// Drawing surface 
var gl;				// Graphics context

var axis = 0;			// Currently active axis of rotation
var xAxis = 0;			//  Will be assigned on of these codes for
var yAxis =1;			//  
var zAxis = 2;

var theta = [0, 0, 0];		// Rotation angles for x, y and z axes
var thetaLoc;			// Holds shader uniform variable location
var PostLoc; 
var flag = false;		// Toggle Rotation Control
var moving = false;
var Cmoving = false;
var langle = 0;
var xangle = 0;
var confettiLoc = [];

var vert_array = [];
var col_array = [];                          // 34 vertices

    createPedestal();
    createZ();
    createJ();
    createConfetti();


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
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation( program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc );

    thetaLoc = gl.getUniformLocation(program, "uTheta");
    PostLoc = gl.getUniformLocation(program, "uPosition");

    //event listeners for buttons

    document.getElementById( "ButtonR" ).onclick = function () {         // Button for reset all the angles
        allReset();
        document.getElementById('xslider').value = 0;                   // Reset the slider values
        document.getElementById('yslider').value = 0;
    };

    document.getElementById("ButtonT").onclick = function() {               // Button for rotation
        flag = !flag;
        resetConfetti();
        moving = true;
    };

    document.getElementById("xslider").onpointermove = function(event){
        var newv = Math.PI * event.target.value / 1     // Cus on the X-axis, the logo and the pedestal will not move together
        xangle = newv;                                  // We need to set the angle seperately. Here we just store the angle. 
    }

    document.getElementById("yslider").onpointermove = function(event){
        var newv = Math.PI * event.target.value / 1
        theta[1] = newv;
    }

    render();
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if(moving){                                     // If it's moving
        if(flag){                                   // Identify the direction of rotation
            langle += 0.017;                        // increament the data
            if(langle >= Math.PI/2){                // If the moving is done
                moving = false;                     // Stop moving
                Cmoving = true;                     // Start the confetti effect
            }
        }
        else{
            Cmoving = false;                        // If it's moving back
            langle -= 0.017;
            if(langle <= 0){
                moving = false;
            }
        }
    }

    if(Cmoving){                                    // If it's in the confetti effect
        for(var i =0; i < confettiLoc.length;i++){              // For each vetex
            if(confettiLoc[i][1] < -1.0){                       // If it left to the screeen
                var xPos = Math.random() * (1.0 - (-1.0)) + (-1.0);     // Reset it to a new position and let it keep falling
                var yPos = Math.random() * (2.0 - (1.0)) + (1.0);
                confettiLoc[i][0] = xPos;
                confettiLoc[i][1] = yPos;
            }
            else{
            var dX = Math.random() * (0.004 - (-0.004)) + (-0.004);
            var dY = 0.017;                                 // Else just fall at a consistant speed with minor vibration
            confettiLoc[i][0] -= dX;
            confettiLoc[i][1] -= dY;
            }
        }
    }


    theta[0] = xangle;                                  // Set the angle of pedestal
    gl.uniform3fv(thetaLoc, theta);	
    gl.uniform4fv(PostLoc, [0.0,0.0,0.0,0.0]);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 34);      // Upper surface
    gl.drawArrays(gl.TRIANGLE_FAN, 34, 34);     // Mid surface
    gl.drawArrays(gl.TRIANGLE_FAN, 68, 34);     // Bottom surface
    gl.drawArrays(gl.TRIANGLE_STRIP, 102, 66);      // Upper shell
    gl.drawArrays(gl.TRIANGLE_STRIP, 168, 66);      // Lower shell


    theta[0] = xangle+Math.PI/2 - langle;       // Set the angle of logo, it needs to be laying down at the beginning.

    gl.uniform3fv(thetaLoc, theta);
    gl.drawArrays(gl.TRIANGLE_STRIP, 234, 8);      // Z
    gl.drawArrays(gl.TRIANGLE_STRIP, 242, 8);     
    gl.drawArrays(gl.TRIANGLE_STRIP, 250, 22);      
    gl.drawArrays(gl.TRIANGLE_STRIP, 272, 34);      // J
    gl.drawArrays(gl.TRIANGLE_STRIP, 306, 34);  
    gl.drawArrays(gl.TRIANGLE_STRIP, 340, 34); 
    gl.drawArrays(gl.TRIANGLE_STRIP, 374, 34);   
    gl.drawArrays(gl.TRIANGLE_STRIP, 408, 4); 
    gl.drawArrays(gl.TRIANGLE_STRIP, 412, 4);   
    gl.drawArrays(gl.TRIANGLE_STRIP, 416, 4);   
    gl.drawArrays(gl.TRIANGLE_STRIP, 420, 4);   
    gl.drawArrays(gl.TRIANGLE_STRIP, 424, 4);     
    gl.drawArrays(gl.TRIANGLE_STRIP, 428, 4);  
    gl.drawArrays(gl.TRIANGLE_STRIP, 432, 4);     
    gl.drawArrays(gl.TRIANGLE_STRIP, 436, 10);      

    if(Cmoving){                                    // Drawing the confetti effect
        var temp = [0,0,0];                         // We want it always be at the front 
        gl.uniform3fv(thetaLoc, temp);
        for(var i =0; i < confettiLoc.length;i++){
                gl.uniform4fv(PostLoc, confettiLoc[i]);     // Draw each vertex
                gl.drawArrays(gl.POINTS, 446+i, 1);
        }
        gl.uniform3fv(thetaLoc, theta);             // Change the offset back to the world Coordinate
    }

    requestAnimationFrame(render);	// Call to browser to refresh display
}


function allReset(){
    theta = [0, 0, 0];		
    flag = false;		    
    moving = false;
    Cmoving = false;
    langle = 0;
    xangle = 0;
    resetConfetti();
}


function resetConfetti(){
    for(var i = 0; i < confettiLoc.length; i++){
        var xPos = Math.random() * (1.0 - (-1.0)) + (-1.0);     // For each vertex, reset its position at the beginning.
        var yPos = Math.random() * (3.0 - (1.0)) + (1.0);
        confettiLoc[i] = [xPos,yPos,0.0,0.0];
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


function createConfetti(){
    var nvert_array = []
    var ncol_array = []

    for(var i = 0; i < 100; i++){
        nvert_array.push(0.0);
        nvert_array.push(0.0);              // It's position will be the same, cus, it will changed later by the offsets.
        nvert_array.push(-0.8);
        confettiLoc.push([0.0,0.0,0.0,0.0]);

        var rR = Math.random();                 // It's color is randomly generated.
        var rG = Math.random();
        var rB = Math.random();
        ncol_array.push(rR);
        ncol_array.push(rG);
        ncol_array.push(rB);
        ncol_array.push(1.0);
    }
    vert_array = vert_array.concat(nvert_array);
    col_array = col_array.concat(ncol_array);
}


function createJ(){                     // Create the initial J
    var nvert_array = []
    var ncol_array = []

    for(var i = 0; i <=16; i++){
        var deg = Math.PI / 16 * i + Math.PI;

        nvert_array.push(-0.4 + 0.1 * Math.cos(deg));
        nvert_array.push(0.2 + 0.1 * Math.sin(deg));
        nvert_array.push(0);

        nvert_array.push(-0.4 + 0.2 * Math.cos(deg));
        nvert_array.push(0.2+ + 0.2 * Math.sin(deg));
        nvert_array.push(0);

        ncol_array.push(1.0);
        ncol_array.push(0.85);
        ncol_array.push(0.0);
        ncol_array.push(1.0);

        ncol_array.push(1.0);
        ncol_array.push(0.85);
        ncol_array.push(0.0);
        ncol_array.push(1.0);
    }

    for(var i = 0; i <=16; i++){
        var deg = Math.PI / 16 * i + Math.PI;
        nvert_array.push(-0.4 + 0.1 * Math.cos(deg));
        nvert_array.push(0.2 + 0.1 * Math.sin(deg));
        nvert_array.push(-0.1);

        nvert_array.push(-0.4 + 0.2 * Math.cos(deg));
        nvert_array.push(0.2+ + 0.2 * Math.sin(deg));
        nvert_array.push(-0.1);

        ncol_array.push(1.0);
        ncol_array.push(0.85);
        ncol_array.push(0.0);
        ncol_array.push(1.0);

        ncol_array.push(1.0);
        ncol_array.push(0.85);
        ncol_array.push(0.0);
        ncol_array.push(1.0);
    }

    for(var i = 0; i <102; i+=6){
        nvert_array.push(nvert_array[i]);
        nvert_array.push(nvert_array[i+1]);
        nvert_array.push(nvert_array[i+2]);

        nvert_array.push(nvert_array[102+i]);
        nvert_array.push(nvert_array[103+i]);
        nvert_array.push(nvert_array[104+i]);

        ncol_array.push(0.2);
        ncol_array.push(0.7);
        ncol_array.push(0.8);
        ncol_array.push(1.0);

        ncol_array.push(0.2);
        ncol_array.push(0.7);
        ncol_array.push(0.8);
        ncol_array.push(1.0);
    }

    for(var i = 0; i <102; i+=6){
        nvert_array.push(nvert_array[i+3]);
        nvert_array.push(nvert_array[i+4]);
        nvert_array.push(nvert_array[i+5]);

        nvert_array.push(nvert_array[105+i]);
        nvert_array.push(nvert_array[106+i]);
        nvert_array.push(nvert_array[107+i]);

        ncol_array.push(0.2);
        ncol_array.push(0.7);
        ncol_array.push(0.8);
        ncol_array.push(1.0);

        ncol_array.push(0.2);
        ncol_array.push(0.7);
        ncol_array.push(0.8);
        ncol_array.push(1.0);
    }

    nvert_array.push(nvert_array[3]);
    nvert_array.push(nvert_array[4]);
    nvert_array.push(nvert_array[5]);

    nvert_array.push(nvert_array[105]);
    nvert_array.push(nvert_array[106]);
    nvert_array.push(nvert_array[107]);

    nvert_array.push(nvert_array[0]);
    nvert_array.push(nvert_array[1]);
    nvert_array.push(nvert_array[2]);

    nvert_array.push(nvert_array[102]);
    nvert_array.push(nvert_array[103]);
    nvert_array.push(nvert_array[104]);

    for(var i = 0; i < 4; i++){
        ncol_array.push(0.2);
        ncol_array.push(0.7);
        ncol_array.push(0.8);
        ncol_array.push(1.0);
    }


    nvert_array = nvert_array.concat([nvert_array[99],nvert_array[100],nvert_array[101]]);
    nvert_array = nvert_array.concat([nvert_array[99],0.5,nvert_array[101]]);

    nvert_array = nvert_array.concat([nvert_array[96],nvert_array[97],nvert_array[98]]);
    nvert_array = nvert_array.concat([nvert_array[96],0.5,nvert_array[98]]);

    nvert_array = nvert_array.concat([nvert_array[198],nvert_array[199],nvert_array[200]]);
    nvert_array = nvert_array.concat([nvert_array[198],0.5,nvert_array[200]]);

    nvert_array = nvert_array.concat([nvert_array[201],nvert_array[202],nvert_array[203]]);
    nvert_array = nvert_array.concat([nvert_array[201],0.5,nvert_array[203]]);

    nvert_array = nvert_array.concat([nvert_array[99],nvert_array[100],nvert_array[101]]);
    nvert_array = nvert_array.concat([nvert_array[99],0.5,nvert_array[101]]);

    nvert_array = nvert_array.concat([nvert_array[201],nvert_array[202],nvert_array[203]]);
    nvert_array = nvert_array.concat([nvert_array[201],0.5,nvert_array[203]]);

    nvert_array = nvert_array.concat([nvert_array[96],nvert_array[97],nvert_array[98]]);
    nvert_array = nvert_array.concat([nvert_array[96],0.5,nvert_array[98]]);

    nvert_array = nvert_array.concat([nvert_array[198],nvert_array[199],nvert_array[200]]);
    nvert_array = nvert_array.concat([nvert_array[198],0.5,nvert_array[200]]);

    for(var i = 0; i < 8; i++){
        ncol_array.push(1.0);
        ncol_array.push(0.85);
        ncol_array.push(0.0);
        ncol_array.push(1.0);
    }

    for(var i = 0; i < 8; i++){
        ncol_array.push(0.2);
        ncol_array.push(0.7);
        ncol_array.push(0.8);
        ncol_array.push(1.0);
    }

    nvert_array = nvert_array.concat([-0.6,0.6,0]);
    nvert_array = nvert_array.concat([-0.6,0.5,0]);

    nvert_array = nvert_array.concat([-0.1,0.6,0]);
    nvert_array = nvert_array.concat([-0.1,0.5,0]);

    nvert_array = nvert_array.concat([-0.6,0.6,-0.1]);
    nvert_array = nvert_array.concat([-0.6,0.5,-0.1]);

    nvert_array = nvert_array.concat([-0.1,0.6,-0.1]);
    nvert_array = nvert_array.concat([-0.1,0.5,-0.1]);

    nvert_array = nvert_array.concat([-0.6,0.6,0]);
    nvert_array = nvert_array.concat([-0.6,0.6,-0.1]);

    nvert_array = nvert_array.concat([-0.6,0.5,0]);
    nvert_array = nvert_array.concat([-0.6,0.5,-0.1]);

    nvert_array = nvert_array.concat([-0.1,0.5,0]);
    nvert_array = nvert_array.concat([-0.1,0.5,-0.1]);

    nvert_array = nvert_array.concat([-0.1,0.6,0]);
    nvert_array = nvert_array.concat([-0.1,0.6,-0.1]);

    nvert_array = nvert_array.concat([-0.6,0.6,0]);
    nvert_array = nvert_array.concat([-0.6,0.6,-0.1]);

    for(var i = 0; i < 8; i++){
        ncol_array.push(1.0);
        ncol_array.push(0.85);
        ncol_array.push(0.0);
        ncol_array.push(1.0);
    }

    for(var i = 0; i < 10; i++){
        ncol_array.push(0.2);
        ncol_array.push(0.7);
        ncol_array.push(0.8);
        ncol_array.push(1.0);
    }

    vert_array = vert_array.concat(nvert_array);
    col_array = col_array.concat(ncol_array);
}


function createZ(){                 // Create the initial Z
    var nvert_array = []
    var ncol_array = []
    
    nvert_array = nvert_array.concat([0.1,0.6,0.0]);
    nvert_array = nvert_array.concat([0.1,0.5,0.0]);

    nvert_array = nvert_array.concat([0.6,0.6,0.0]);
    nvert_array = nvert_array.concat([0.6,0.5,0.0]);

    nvert_array = nvert_array.concat([0.1,0.1,0.0]);
    nvert_array = nvert_array.concat([0.1,0.0,0.0]);

    nvert_array = nvert_array.concat([0.6,0.1,0.0]);
    nvert_array = nvert_array.concat([0.6,0.0,0.0]);

    nvert_array = nvert_array.concat([0.1,0.6,-0.1]);
    nvert_array = nvert_array.concat([0.1,0.5,-0.1]);

    nvert_array = nvert_array.concat([0.6,0.6,-0.1]);
    nvert_array = nvert_array.concat([0.6,0.5,-0.1]);

    nvert_array = nvert_array.concat([0.1,0.1,-0.1]);
    nvert_array = nvert_array.concat([0.1,0.0,-0.1]);

    nvert_array = nvert_array.concat([0.6,0.1,-0.1]);
    nvert_array = nvert_array.concat([0.6,0.0,-0.1]);

    for(var i = 0; i < 16; i++){
        ncol_array.push(0.2);
        ncol_array.push(0.7);
        ncol_array.push(0.8);
        ncol_array.push(1.0);
    }

    nvert_array = nvert_array.concat([0.1,0.6,0.0]);
    nvert_array = nvert_array.concat([0.1,0.6,-0.1]);

    nvert_array = nvert_array.concat([0.6,0.6,0.0]);
    nvert_array = nvert_array.concat([0.6,0.6,-0.1]);

    nvert_array = nvert_array.concat([0.6,0.5,0.0]);
    nvert_array = nvert_array.concat([0.6,0.5,-0.1]);

    nvert_array = nvert_array.concat([0.2,0.1,0.0]);
    nvert_array = nvert_array.concat([0.2,0.1,-0.1]);

    nvert_array = nvert_array.concat([0.6,0.1,0.0]);
    nvert_array = nvert_array.concat([0.6,0.1,-0.1]);

    nvert_array = nvert_array.concat([0.6,0.0,0.0]);
    nvert_array = nvert_array.concat([0.6,0.0,-0.1]);

    nvert_array = nvert_array.concat([0.1,0.0,0.0]);
    nvert_array = nvert_array.concat([0.1,0.0,-0.1]);

    nvert_array = nvert_array.concat([0.1,0.1,0.0]);
    nvert_array = nvert_array.concat([0.1,0.1,-0.1]);

    nvert_array = nvert_array.concat([0.5,0.5,0.0]);
    nvert_array = nvert_array.concat([0.5,0.5,-0.1]);

    nvert_array = nvert_array.concat([0.1,0.5,0.0]);
    nvert_array = nvert_array.concat([0.1,0.5,-0.1]);

    nvert_array = nvert_array.concat([0.1,0.6,0.0]);
    nvert_array = nvert_array.concat([0.1,0.6,-0.1]);


    for(var i = 0; i < 22; i++){
        ncol_array.push(1.0);
        ncol_array.push(0.85);
        ncol_array.push(0.0);
        ncol_array.push(1.0);
    }

    vert_array = vert_array.concat(nvert_array);
    col_array = col_array.concat(ncol_array);
}


function createPedestal(){                  // Create the pedestal
    vert_array = [0.0,0.0,0.0];
    col_array = [0.2,0.4,0.8,1.0];   
    
    vert_array = vert_array.concat(makeCircle([0.0,0.0,0.0], 0.6, 32))
    for(var i = 0; i<=32;i++){
        col_array.push(0.2);
        col_array.push(0.4);
        col_array.push(0.8);
        col_array.push(1.0);
    }
    
    vert_array = vert_array.concat([0.0,-0.3,0.0]);
    vert_array = vert_array.concat(makeCircle([0.0,-0.3,0.0], 0.3, 32))
    for(var i = 0; i<=33;i++){
        col_array.push(0.2);
        col_array.push(0.4);
        col_array.push(0.8);
        col_array.push(1.0);
    }

    vert_array = vert_array.concat([0.0,-0.6,0.0]);
    vert_array = vert_array.concat(makeCircle([0.0,-0.6,0.0], 0.6, 32))
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

    for(var i = 0; i< 264;i+=4){
        col_array.push(0.6);
        col_array.push(0.2);
        col_array.push(0.8);
        col_array.push(1.0);
    }

    for(var i = 0; i< 264;i+=4){
        col_array.push(0.1);
        col_array.push(0.4);
        col_array.push(0.3);
        col_array.push(1.0);
    }

}