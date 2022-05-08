"use strict";			// Enforce typing in javascript

var canvas;
var gl;

var at = vec3(0.0,0.0,0.0);
var up = vec3(0.0,1.0,0.0);
var eye = vec3(0.0,0.0,1.0);            // Parameters for setting the lookat function

var left = -1.2;
var right = 1.2;
var topp = 1.2;
var bottom = -1.2;
var near = -10;
var far = 10;                   // Parameters for projection

var sscale =1.0;
var angle = 0;                  // Angle of rotation for the cube
var flag = false;               // If auto-rotation

var texCoord1;              // For the Video
var texCoord2;              // For the geo texture

var Vertices;               // Cube vertices
var VerticesP;              // Geo texture vertices

var program1, program2;
var texture0, texture1;     // 0=Video; 1=Geo texture

var framebuffer;
var aPosition, aPosition2;
var aTexCoord, aTexCoord2;
var video;


var copyVideo = false;      // If video is loaded. 

var imageType = 0;          // Type of image processing technique. 

var distortionangle = 0.0;              // Angle of geometric distortion. 



window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if(!gl) alert("Webgl 2.0 is not available");

    createTexture();                                    // Create the two textures.

    document.getElementById("rslider").onpointermove = function(event){
        angle =  parseFloat(event.target.value);                // Rotate the cube
    }

    document.getElementById("sslider").onpointermove = function(event){
        sscale =  parseFloat(event.target.value);                // Scale the cube
    }

    document.getElementById("dslider").onpointermove = function(event){
        distortionangle =  parseFloat(event.target.value);          // Apply distortion
    }

    document.getElementById("ButtonCR").onclick = function(){
        flag = !flag;                                           // Apply auto-rotate
    };   

    document.getElementById("ButtonR").onclick = function(){
        if(imageType == 1){
            imageType = 0;
        }
        else{
            imageType = 1;
        }
    };                                                          // Turn On/Off reverse color 

    document.getElementById("ButtonL").onclick = function(){
        if(imageType == 2){
            imageType = 0;
        }
        else{
            imageType = 2;
        }
    };                                                          // Turn On/Off Luminance

    document.getElementById("ButtonT").onclick = function(){
        if(imageType == 3){
            imageType = 0;
        }
        else{
            imageType = 3;
        }
    };                                                          // Turn On/Off Toon Shading

    // Load shaders and initialize attribute buffers
    program1 = initShaders(gl, "vertex-shader1", "fragment-shader1");
    program2 = initShaders(gl, "vertex-shader2", "fragment-shader2");       // Create two textures.

    render();
}


function createTexture(){
    video = setupVideo('http://localhost:3100/CG_S22_Program4_Zhai_James_Video.mp4');       // Load the Video

    texture0 = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture0);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0,
    gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));                   // Default is blue, since it takes time to load the video.

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);                  // Create Video texture

    texture1 = gl.createTexture();
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texture1);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 512, 512, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);


    framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture1, 0);
    // Check for completeness
    var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if(status != gl.FRAMEBUFFER_COMPLETE) alert ("Frame Buffer incomplete!");               // Create geometric texture

}


function render(){

    if(flag){
        angle = parseFloat(angle) + (1/15);             // Apply cube rotation.

        if(angle == 3600){angle = 0;}                              // Reset the angle

        var rslider = document.getElementById("rslider");
        rslider.value = angle;                      // Update angle on the slider.
    }

    drawTexture();                                  // Draw the geometric texture
    drawScene();                                    // Draw the window scene.
    requestAnimationFrame(render);
}


function drawTexture(){
    gl.useProgram(program1);

    //Create and initialize a buffer object
    var buffer1 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer1);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(VerticesP), gl.STATIC_DRAW);
    //Initialize the vertex position attribute from the vertex shader
    aPosition = gl.getAttribLocation(program1, "aPosition1");
    gl.vertexAttribPointer(aPosition, 4, gl.FLOAT, false, 0 , 0);


    var buffer2 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer2);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoord1), gl.STATIC_DRAW);
    aTexCoord = gl.getAttribLocation(program1, "aTexCoord1");
    gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, 0, 0);            // Create and bind buffers.

    gl.enableVertexAttribArray(aPosition);

    gl.enableVertexAttribArray(aTexCoord);
    
    gl.uniform1i(gl.getUniformLocation(program1, "uTexture1"), 0);                  // Use the first texture
    gl.uniform1i( gl.getUniformLocation(program1, "imageType"), imageType);         // Set image processing type.
    gl.uniform1f( gl.getUniformLocation(program1, "distortDegree"), distortionangle);       // Set geometric distortion angle.

    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.bindTexture(gl.TEXTURE_2D, texture0);                            // Bind to frame buffer and textures.

    
    // render the photo
    gl.viewport(0,0,512,512);
    gl.clearColor(0.0,0.0,1.0,1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (copyVideo) {
        updateTexture();                                        // Update the video.
    }

    gl.drawArrays(gl.TRIANGLES,0,6);                        // Draw the geometry with video.
}


function drawScene(){
    // unbind to window system framebuffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    gl.useProgram(program2);
    gl.enable(gl.DEPTH_TEST);     

    gl.bindTexture(gl.TEXTURE_2D, texture1);

    var buffer2 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer2);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(Vertices), gl.STATIC_DRAW);
    
    var aPosition2 = gl. getAttribLocation(program2, "aPosition2");
    gl.vertexAttribPointer(aPosition2, 4, gl.FLOAT, false, 0,0);

    var buffer3 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer3);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoord2), gl.STATIC_DRAW);
    aTexCoord2 = gl.getAttribLocation(program2, "aTexCoord2");
    gl.vertexAttribPointer(aTexCoord2, 2, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(aPosition2);
    gl.enableVertexAttribArray(aTexCoord2);                                 // Set buffers.

    gl.uniform1i(gl.getUniformLocation(program2, "uTexture2"), 1);          // Use texture 1
    gl.clearColor(0.5,0.5,0.5,1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0,0,512,512);                                       

    var modelMatrix = rotate(angle, vec3(1,1,1));                               // Apply cube rotation.
    modelMatrix = mult(scale(sscale, sscale, sscale), modelMatrix);             // Apply cube scaling.
    var modelViewMatrix = mult(lookAt(eye,at,up),modelMatrix);                  // Get the modelviewmatrix from the look at function.
    var projectionMatrix = ortho(left, right, bottom, topp, near, far);         // Get the projection matrix.

    gl.uniformMatrix4fv(gl.getUniformLocation(program2, "modelViewMatrix"),false,flatten(modelViewMatrix));
    gl.uniformMatrix4fv(gl.getUniformLocation(program2, "projectionMatrix"), false, flatten(projectionMatrix));

    gl.drawArrays(gl.TRIANGLES, 0, 36);                                     // Draw the cube.
}


// Update the video each frame.
function updateTexture() {
    gl.bindTexture(gl.TEXTURE_2D, texture0);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);    
}


// Reference: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Animating_textures_in_WebGL
function setupVideo(url) {                              // Load a texture.
  var video = document.createElement('video');

  var playing = false;
  var timeupdate = false;

  video.autoplay = true;
  video.muted = true;
  video.loop = true;

  // Waiting for these 2 events ensures
  // there is data in the video

  video.addEventListener('playing', function() {
     playing = true;
     checkReady();
  }, true);

  video.addEventListener('timeupdate', function() {
     timeupdate = true;
     checkReady();
  }, true);

  video.crossOrigin = "anonymous";
  video.src = url;
  video.play();

  function checkReady() {
    if (playing && timeupdate) {
      copyVideo = true;
    }
  }

  return video;
}
