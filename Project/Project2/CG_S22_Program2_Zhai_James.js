"use strict";			// Enforce typing in javascript.

var canvas;			// Drawing surface. 
var gl;				// Graphics context.

var at = vec3(0.0,0.0,0.0);
var up = vec3(0.0,1.0,0.0);
var eye;

var left = -1.2;
var right = 1.2;
var topp = 1.2;
var bottom = -1.2;
var near = -10;
var far = 10;

var theta = 0.0;
var phi = 0.0;

var baseAngle = 0;          // The angle of the base on x-z plane.
var baseDist = [0,0,0];     // The distance to the base from the origin.
var turretAngle = 0;            // The angle that turret rotate.
var ammunitionDist = [0.0,0.2,0.0];     // The distance that ammunition moves on the world coordinates.

var MVMLoc;
var PMLoc;			// Holds shader uniform variable location.

var flag = false;		// Toggle Rotation Control.
var fireTrigger = false;
var sniperMode = false;

var Vertices = [];
var Colors = [];

var indices = [];


window.onload = function init()
{
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    gl.enable(gl.DEPTH_TEST);             

    createVertices();                                           // Create vertices, call the function in the other script file.
    //  Load shaders and initialize attribute buffers.

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // color array atrribute buffer.
    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(Colors), gl.STATIC_DRAW);

    var colorLoc = gl.getAttribLocation(program, "aColor");
    gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorLoc);

    // vertex array attribute buffer.
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(Vertices), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation( program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
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

    document.addEventListener('keydown',keyfunc);               // Press a key on the keyboard.

    document.getElementById("ButtonR").onclick = function(){
        theta = 0.0;
        phi = 0.0;
        baseAngle = 0; 
        baseDist = [0,0,0]; 
        turretAngle = 0;      
        ammunitionDist = [0.0,0.2,0.0];  
        flag = false;	
        fireTrigger = false;
        sniperMode = false;
        var xslider = document.getElementById('xslider');
        xslider.value = 0;
        var yslider = document.getElementById('yslider');
        yslider.value = 0;
    };     // Reset the scene

    render();
}


function render()
{
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    if(sniperMode){                                                         // If in the sniper mode.
        var modelMatrix = rotate((baseAngle+turretAngle), vec3(0,1,0));
        modelMatrix = mult(translate(baseDist[0],baseDist[1],baseDist[2]), modelMatrix);        // Get the model matrix from rotation and translation.
        var xoff = Math.sin((baseAngle+turretAngle)* Math.PI/180.0);
        var zoff = Math.cos((baseAngle+turretAngle)* Math.PI/180.0);
        eye = vec3(modelMatrix[0][3]+1.8*xoff, 0.65, modelMatrix[2][3]-1.8*zoff);           // Needs to set the eye and the at.
        at = vec3(modelMatrix[0][3]+2.7*xoff, 0.2, modelMatrix[2][3]-2.7*zoff);            // Same direction with the turret.
    }
    else{
        eye = vec3(1.0*Math.sin(phi), 1.0*Math.sin(theta), 1.0*Math.cos(phi));      // Create the default position of eyes.
        at = vec3(0.0,0.0,0.0);
    }

    drawMesh();             // Draw the mesh
    drawBase();             // Draw the tank's base.
    drawTurret();           // Draw the tank's turret.
    drawAmmunition();       // Draw the ammunition.
    drawAxes();             // Draw the axis.

    requestAnimationFrame(render);	// Call to browser to refresh display.
}


function drawMesh(){
    var modelViewMatrix = lookAt(eye,at,up);
    var projectionMatrix = ortho(left, right, bottom, topp, near, far);         // Calculate the two matrix.
    gl.uniformMatrix4fv(MVMLoc,false,flatten(modelViewMatrix));
    gl.uniformMatrix4fv(PMLoc, false, flatten(projectionMatrix));

   mesh_I_buffer();
   gl.drawElements(gl.TRIANGLES, 384 ,gl.UNSIGNED_BYTE, 0);
}


function drawAmmunition(){
    if(fireTrigger == true){                // If it's fired.
        ammunitionDist[0] += 0.1*Math.sin((baseAngle+turretAngle)* Math.PI/180.0);      // Update the translation position of the buttet.
        ammunitionDist[2] -= 0.1*Math.cos((baseAngle+turretAngle)* Math.PI/180.0);
    }
    if(Math.abs(ammunitionDist[0]) > 10 || Math.abs(ammunitionDist[2]) > 10){           // If it's out of the scene, reset it. (reload)
        ammunitionDist = [0.0,0.2,0.0];
        fireTrigger = false;
    }

    var modelMatrix = rotate((baseAngle+turretAngle), vec3(0,1,0));
    modelMatrix = mult(translate(baseDist[0],baseDist[1],baseDist[2]), modelMatrix);        // Get the model matrix from rotation and translation.
    modelMatrix = mult(translate(ammunitionDist[0],ammunitionDist[1],ammunitionDist[2]), modelMatrix);

    var modelViewMatrix = mult(lookAt(eye,at,up),modelMatrix);                  // Get the modelviewmatrix from the look at function.
    var projectionMatrix = ortho(left, right, bottom, topp, near, far);         // Get the projection matrix.
    gl.uniformMatrix4fv(MVMLoc,false,flatten(modelViewMatrix));
    gl.uniformMatrix4fv(PMLoc, false, flatten(projectionMatrix));

    gl.drawArrays(gl.POINTS,523,1);
}


function drawTurret(){
    var modelMatrix = rotate((baseAngle+turretAngle), vec3(0,1,0));
    modelMatrix = mult(translate(baseDist[0],baseDist[1],baseDist[2]), modelMatrix);        // Get the model matrix from rotation and translation.

    var modelViewMatrix = mult(lookAt(eye,at,up),modelMatrix);                  // Get the modelviewmatrix from the look at function.
    var projectionMatrix = ortho(left, right, bottom, topp, near, far);         // Get the projection matrix.
    gl.uniformMatrix4fv(MVMLoc,false,flatten(modelViewMatrix));
    gl.uniformMatrix4fv(PMLoc, false, flatten(projectionMatrix));

    gl.drawArrays(gl.TRIANGLE_STRIP, 293,6);
    gl.drawArrays(gl.TRIANGLE_STRIP, 299,6);
    gl.drawArrays(gl.TRIANGLE_STRIP, 305,14);                // Draw the turret.

    gl.drawArrays(gl.TRIANGLE_FAN, 319, 17);                 
    gl.drawArrays(gl.TRIANGLE_FAN, 336, 17);
    gl.drawArrays(gl.TRIANGLE_STRIP,353,34);            // Draw the barrel.

    gl.drawArrays(gl.TRIANGLE_FAN, 387, 17);            // Draw the door.
    gl.drawArrays(gl.TRIANGLE_FAN, 404, 17);
    gl.drawArrays(gl.TRIANGLE_STRIP,421,34);

    gl.drawArrays(gl.TRIANGLE_FAN, 455, 17);           // Draw the part on the barrel.
    gl.drawArrays(gl.TRIANGLE_FAN, 472, 17);
    gl.drawArrays(gl.TRIANGLE_STRIP,489,34);
}



function drawBase(){
    var modelMatrix = rotate(baseAngle, vec3(0,1,0));
    modelMatrix = mult(translate(baseDist[0],baseDist[1],baseDist[2]), modelMatrix);        // Get the model matrix from rotation and translation.

    var modelViewMatrix = mult(lookAt(eye,at,up),modelMatrix);                  // Get the modelviewmatrix from the look at function.
    var projectionMatrix = ortho(left, right, bottom, topp, near, far);         // Get the projection matrix.
    gl.uniformMatrix4fv(MVMLoc,false,flatten(modelViewMatrix));
    gl.uniformMatrix4fv(PMLoc, false, flatten(projectionMatrix));

    gl.drawArrays(gl.TRIANGLE_STRIP, 81, 6);                         // Draw the right part of the base.
    gl.drawArrays(gl.TRIANGLE_STRIP, 87, 6);
    right_I_buffer();
    gl.drawElements(gl.TRIANGLE_STRIP, 14 ,gl.UNSIGNED_BYTE, 0);

    gl.drawArrays(gl.TRIANGLE_STRIP, 93, 6);                    // Draw the left part.
    gl.drawArrays(gl.TRIANGLE_STRIP, 99, 6);
    left_I_buffer();
    gl.drawElements(gl.TRIANGLE_STRIP, 14 ,gl.UNSIGNED_BYTE, 0);

    gl.drawArrays(gl.TRIANGLE_STRIP, 105, 6);                    // Draw the middle part.
    gl.drawArrays(gl.TRIANGLE_STRIP, 111, 6);
    mid_I_buffer();
    gl.drawElements(gl.TRIANGLE_STRIP, 14 ,gl.UNSIGNED_BYTE, 0);

    gl.drawArrays(gl.TRIANGLE_FAN, 117, 10);                 // Draw the right track.
    gl.drawArrays(gl.TRIANGLE_FAN, 127, 10);
    gl.drawArrays(gl.TRIANGLE_STRIP,137,20);
    gl.drawArrays(gl.TRIANGLE_FAN, 157, 10);
    gl.drawArrays(gl.TRIANGLE_FAN, 167, 10);
    gl.drawArrays(gl.TRIANGLE_STRIP,177,20);
    gl.drawArrays(gl.TRIANGLE_STRIP,197,8);

    gl.drawArrays(gl.TRIANGLE_FAN, 205, 10);                // Draw the left track.
    gl.drawArrays(gl.TRIANGLE_FAN, 215, 10);
    gl.drawArrays(gl.TRIANGLE_STRIP,225,20);
    gl.drawArrays(gl.TRIANGLE_FAN, 245, 10);
    gl.drawArrays(gl.TRIANGLE_FAN, 255, 10);
    gl.drawArrays(gl.TRIANGLE_STRIP,265,20);
    gl.drawArrays(gl.TRIANGLE_STRIP,285,8);
}


function drawAxes(){
    var modelViewMatrix = lookAt(eye,at,up);
    var projectionMatrix = ortho(left, right, bottom, topp, near, far);         // Calculate the two matrix.
    gl.uniformMatrix4fv(MVMLoc,false,flatten(modelViewMatrix));
    gl.uniformMatrix4fv(PMLoc, false, flatten(projectionMatrix));
    if(flag){
        gl.drawArrays(gl.LINES, 524, 6);
    }
}


function keyfunc(e){
    if(e.keyCode == 65){            // Left rotate the base with key "A".
        baseAngle -= 2;
    }
    else if(e.keyCode == 68){             // Right rotate the base with key "D".
        baseAngle += 2;
    }
    else if(e.keyCode == 87){                       // Base move forward with key "W".
        baseDist[0] += 0.02*Math.sin(baseAngle* Math.PI/180.0);
        baseDist[2] -= 0.02*Math.cos(baseAngle* Math.PI/180.0);
    }
    else if(e.keyCode == 83){                   // Move backward with key "S".
        baseDist[0] -= 0.02*Math.sin(baseAngle* Math.PI/180.0);
        baseDist[2] += 0.02*Math.cos(baseAngle* Math.PI/180.0);
    }
    else if(e.keyCode == 81){
        turretAngle -= 2;                   // Left move the turret with key "Q".
    }
    else if(e.keyCode == 69){
        turretAngle += 2;               // Right move the turret with key "E".
    }
    else if(e.keyCode == 13 && fireTrigger == false){
        fireTrigger = true;            // Fire! with key "Enter"
    }
    else if(e.keyCode == 32){
        sniperMode = !sniperMode;           // Enter/Exit the sniper mode with key "Space".
    }
    else if(e.keyCode == 82){
        flag = !flag;
    }
}