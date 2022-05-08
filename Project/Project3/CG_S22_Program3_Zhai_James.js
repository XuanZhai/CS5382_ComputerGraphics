"use strict";			// Enforce typing in javascript.

var program;
var canvas;			// Drawing surface. 
var gl;				// Graphics context.

var at = vec3(0.0,0.0,0.0);
var up = vec3(0.0,1.0,0.0);
var eye;                        // Eye info and look-at info

var left = -1.2;
var right = 1.2;
var topp = 1.2;
var bottom = -1.2;
var near = -10;
var far = 10;                   // View Volume

var theta = 0.0;
var phi = 0.0;

var baseAngle = 0;          // The angle of the base on x-z plane.
var baseDist = [0,0,0];     // The distance to the base from the origin.
var turretAngle = 0;            // The angle that turret rotate.
var ammunitionDist = [0.0,0.2,0.0];     // The distance that ammunition moves on the world coordinates.

var MVMLoc;
var PMLoc;			// Holds shader uniform variable location.
var NLoc;
var nMatrix;

var APLoc;
var DPLoc;
var SPLoc;
var LPLoc;              // Location for storing the product of Light and Material

var flag = false;		// Toggle Disco Mode 1
var flag2 = false;      // Toggle Disco Mode 2
var timer = 0;          // Timer for Disco Mode 1
var timer2 = 0;         // Timer for Disco Mode 2
var currLighted = -1;       // Current Light in Disco Mode 2

var fireTrigger = false;
var sniperMode = false;

var Vertices = [];

var indices = [];

var normalsArray = [];

var texCoordsArray = [          // Array for storeing the all the texture coordinate data for the vertices.
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0),
    vec2(0, 1),
    vec2(1, 0),
    vec2(0, 0)
];

var texCoord = [                // u and v value
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
];

var textures = [];          // And array of textures

// Lights' info 
var lightPositions = [vec4(0.0,1.4,0.0,1.0), 
                      vec4(Math.sin(0), 0.7, Math.sin(0), 1.0), 
                      vec4(Math.sin(120), 0.7, Math.sin(120), 1.0), 
                      vec4(Math.sin(240), 0.7, Math.sin(240), 1.0),
                      vec4(0,0.201,0,1)];

var lightAmbients = [vec4(0.7,0.7,0.7,1.0) , 
                     vec4(0.0,0.0,0.0,1.0), 
                     vec4(0.0,0.0,0.0,1.0), 
                     vec4(0.0,0.0,0.0,1.0),
                     vec4(0.0,0.0,0.0,1)];

var lightDiffuses = [vec4(0.7,0.7,0.7,1.0) , 
                     vec4(0.0,0.0,0.0,1.0), 
                     vec4(0.0,0.0,0.0,1.0), 
                     vec4(0.0,0.0,0.0,1.0),
                     vec4(0.0,0.0,0.0,1)];

var lightSpeculars = [vec4(0.8,0.8,0.8,1.0), 
                      vec4(0.0,0.0,0.0,1.0), 
                      vec4(0.0,0.0,0.0,1.0), 
                      vec4(0.0,0.0,0.0,1.0),
                      vec4(0.0,0.0,0.0,1)];

var materialShininess = 25.0;

var Aslid;
var Dslid;
var Sslid;


// Reference: https://webglfundamentals.org/webgl/lessons/webgl-2-textures.html
function loadImage(url, callback) {
    var image = new Image();
    image.crossOrigin = "anonymous";
    image.src = url;
    image.onload = callback;
    return image;           // Load one image
}


function configureTexture() {
    var images = new Array(2);
    var imagesToLoad = 2;

    var onImageLoad = function(){
        --imagesToLoad;

        if(imagesToLoad == 0){              // If all image loaded
            for(var i = 0; i < 2; i++){
                var texture = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, images[i]);
                gl.generateMipmap(gl.TEXTURE_2D);
                textures.push(texture);         // Get the texture with the image

                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, textures[0]);
                gl.activeTexture(gl.TEXTURE1);
                gl.bindTexture(gl.TEXTURE_2D, textures[1]);     // Set the texture array
            
                render();                   // If all textures were set up, do the render!
            }
        }
    }

    images[0] = loadImage("https://i.ibb.co/HXBWK0M/359.jpg", onImageLoad);
    images[1] = loadImage("https://i.ibb.co/vQsVZKh/camouflage.png", onImageLoad);  // The image source
}


window.onload = function init()
{
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.8, 0.8, 0.8, 1.0);

    gl.enable(gl.DEPTH_TEST);             

    createVertices();                                         // Create vertices, call the function in the other script file.

    //  Load shaders and initialize attribute buffers.
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

    var normalLoc = gl.getAttribLocation(program, "aNormal");           // Set the normal array
    gl.vertexAttribPointer(normalLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(normalLoc);

    // vertex array attribute buffer.
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(Vertices), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation( program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc );


    var tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);
    var texCoordLoc = gl.getAttribLocation( program, "aTexCoord");          // Set the texture coord array
    gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(texCoordLoc);

    configureTexture();                             // Load Image and set textures

    var ibuffer = gl.createBuffer();                                    // Loading the element array.
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), gl.STATIC_DRAW);

    MVMLoc = gl.getUniformLocation(program, "modelViewMatrix");
    PMLoc = gl.getUniformLocation(program, "projectionMatrix");
    NLoc = gl.getUniformLocation(program,"uNormalMatrix");

    APLoc = gl.getUniformLocation(program,"uAmbientProducts");
    DPLoc = gl.getUniformLocation(program,"uDiffuseProducts");
    SPLoc = gl.getUniformLocation(program,"uSpecularProducts");
    LPLoc = gl.getUniformLocation(program,"uLightPositions");

    document.getElementById("xslider").onpointermove = function(event){
        phi = event.target.value* Math.PI/180.0;
    }

    document.getElementById("yslider").onpointermove = function(event){
        theta = event.target.value* Math.PI/180.0;
    }

    Aslid = document.getElementById("Aslider");
    Dslid = document.getElementById("Dslider");
    Sslid = document.getElementById("Sslider");
    Aslid.onpointermove = function(event){
        var value = parseFloat(event.target.value);
        lightAmbients[0] = vec4(value,value,value,1.0);
    }

    Dslid.onpointermove = function(event){
        var value = parseFloat(event.target.value);
        lightDiffuses[0] = vec4(value,value,value,1.0);
    }

    Sslid.onpointermove = function(event){
        var value = parseFloat(event.target.value);
        lightSpeculars[0] = vec4(value,value,value,1.0);
    }


    document.addEventListener('keydown',keyfunc);               // Press a key on the keyboard.

    document.getElementById("ButtonR").onclick = function(){        // Reset all the data
        theta = 0.0;
        phi = 0.0;
        baseAngle = 0; 
        baseDist = [0,0,0]; 
        turretAngle = 0;      
        ammunitionDist = [0.0,0.2,0.0];  	
        fireTrigger = false;
        sniperMode = false;
        var xslider = document.getElementById('xslider');
        xslider.value = 0;
        var yslider = document.getElementById('yslider');
        yslider.value = 0;
        flag2 = false;
        flag = false;
        lightAmbients = [vec4(0.7,0.7,0.7,1.0) , vec4(0.0,0.0,0.0,1.0), vec4(0.0,0.0,0.0,1.0), vec4(0.0,0.0,0.0,1.0), lightAmbients[4]];
        lightDiffuses = [vec4(0.7,0.7,0.7,1.0) , vec4(0.0,0.0,0.0,1.0), vec4(0.0,0.0,0.0,1.0), vec4(0.0,0.0,0.0,1.0), lightDiffuses[4]];
        lightSpeculars = [vec4(0.8,0.8,0.8,1.0), vec4(0.0,0.0,0.0,1.0), vec4(0.0,0.0,0.0,1.0), vec4(0.0,0.0,0.0,1.0), lightSpeculars[4]];

        Aslid.value = 0.7;
        Dslid.value = 0.7;
        Sslid.value = 0.8;          
    };  

    document.getElementById('Disco').onclick = function(){          // Disco Mode 1
        if(!flag){          // Enter
            lightAmbients = [vec4(0.0,0.0,0.0,1.0) , vec4(1.0, 0.0, 0.0, 1.0), vec4(0.0, 1.0, 0.0, 1.0), vec4(0.0, 0.0, 1.0, 1.0), lightAmbients[4]];
            lightDiffuses = [vec4(0.0,0.0,0.0,1.0) , vec4(1.0, 0.7, 0.7, 1.0), vec4(0.7, 1.0, 0.7, 1.0), vec4(0.7, 0.7, 1.0, 1.0), lightDiffuses[4]];
            lightSpeculars = [vec4(0.0,0.0,0.0,1.0), vec4(1.0, 0.0, 0.0, 1.0), vec4(0.0, 1.0, 0.0, 1.0), vec4(0.0, 0.0, 1.0, 1.0), lightSpeculars[4]];  
            flag = true;
            flag2 = false;      // Need to close the previous mode 

            Aslid.value = 0.0;
            Dslid.value = 0.0;
            Sslid.value = 0.0;
        }
        else{       // Exit
            flag = false;
            flag2 = false;
            lightAmbients = [vec4(0.7,0.7,0.7,1.0) , vec4(0.0,0.0,0.0,1.0), vec4(0.0,0.0,0.0,1.0), vec4(0.0,0.0,0.0,1.0), lightAmbients[4]];
            lightDiffuses = [vec4(0.7,0.7,0.7,1.0) , vec4(0.0,0.0,0.0,1.0), vec4(0.0,0.0,0.0,1.0), vec4(0.0,0.0,0.0,1.0), lightDiffuses[4]];
            lightSpeculars = [vec4(0.8,0.8,0.8,1.0), vec4(0.0,0.0,0.0,1.0), vec4(0.0,0.0,0.0,1.0), vec4(0.0,0.0,0.0,1.0), lightSpeculars[4]];

            Aslid.value = 0.7;
            Dslid.value = 0.7;
            Sslid.value = 0.8;
        }
    }

    document.getElementById('Disco2').onclick = function(){
        if(!flag2){
            flag2 = true;
            flag = false;
            currLighted = 1;
        }
        else{
            flag2 = false;
            flag = false;
            lightAmbients = [vec4(0.7,0.7,0.7,1.0) , vec4(0.0,0.0,0.0,1.0), vec4(0.0,0.0,0.0,1.0), vec4(0.0,0.0,0.0,1.0), lightAmbients[4]];
            lightDiffuses = [vec4(0.7,0.7,0.7,1.0) , vec4(0.0,0.0,0.0,1.0), vec4(0.0,0.0,0.0,1.0), vec4(0.0,0.0,0.0,1.0), lightDiffuses[4]];
            lightSpeculars = [vec4(0.8,0.8,0.8,1.0), vec4(0.0,0.0,0.0,1.0), vec4(0.0,0.0,0.0,1.0), vec4(0.0,0.0,0.0,1.0), lightSpeculars[4]];
            Aslid.value = 0.7;
            Dslid.value = 0.7;
            Sslid.value = 0.8;
        }
    }

    gl.uniform1f( gl.getUniformLocation(program,"uShininess"),materialShininess);
    gl.uniform1i( gl.getUniformLocation(program, "uTextureMap"), 0);
    gl.uniform1i( gl.getUniformLocation(program, "uTextureMap2"), 1);
    gl.uniform1i( gl.getUniformLocation(program, "texTrigger"), 0);
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
        eye = vec3(3.0*Math.sin(phi), 3.0*Math.sin(theta), 3.0*Math.cos(phi));      // Create the default position of eyes.
        at = vec3(0.0,0.0,0.0);
    }

    if(flag){                   // If in Disco Mode 1
        if(timer == 3600){      // Reset the timer if reach 3600
            timer = 0;
        }

        timer = timer + 1;
        var coe = timer/10;

        lightPositions[1][0] = Math.sin(0+coe);
        lightPositions[1][2] = Math.cos(0+coe);     // Update the light postion

        lightPositions[2][0] = Math.sin(120+coe);
        lightPositions[2][2] = Math.cos(120+coe);

        lightPositions[3][0] = Math.sin(240+coe);
        lightPositions[3][2] = Math.cos(240+coe);
        Aslid.value = 0.0;
        Dslid.value = 0.0;
        Sslid.value = 0.0;
    }
    else if(flag2){                     // If in Mode 2

        timer2 = timer2 + 1;

        if(timer2%61 == 60){            // If reach 60
            currLighted++;
            if(currLighted == 4){
                currLighted = 1;        // Update the current light
            }

            if(currLighted == 1){       // Show current light based on the index.
                lightAmbients = [vec4(0.0,0.0,0.0,1.0) , vec4(1.0, 0.0, 0.0, 1.0), vec4(0.0, 0.0, 0.0, 1.0), vec4(0.0, 0.0, 0.0, 1.0), lightAmbients[4]];
                lightDiffuses = [vec4(0.0,0.0,0.0,1.0) , vec4(1.0, 0.7, 0.7, 1.0), vec4(0.0, 0.0, 0.0, 1.0), vec4(0.0, 0.0, 0.0, 1.0), lightDiffuses[4]];
                lightSpeculars = [vec4(0.0,0.0,0.0,1.0), vec4(1.0, 0.0, 0.0, 1.0), vec4(0.0, 0.0, 0.0, 1.0), vec4(0.0, 0.0, 0.0, 1.0), lightSpeculars[4]];
            }
            else if(currLighted == 2){
                lightAmbients = [vec4(0.0,0.0,0.0,1.0) , vec4(0.0, 0.0, 0.0, 1.0), vec4(0.0, 1.0, 0.0, 1.0), vec4(0.0, 0.0, 0.0, 1.0), lightAmbients[4]];
                lightDiffuses = [vec4(0.0,0.0,0.0,1.0) , vec4(0.0, 0.0, 0.0, 1.0), vec4(0.7, 1.0, 0.7, 1.0), vec4(0.0, 0.0, 0.0, 1.0), lightDiffuses[4]];
                lightSpeculars = [vec4(0.0,0.0,0.0,1.0), vec4(0.0, 0.0, 0.0, 1.0), vec4(0.0, 1.0, 0.0, 1.0), vec4(0.0, 0.0, 0.0, 1.0), lightSpeculars[4]];
            }
            else{
                lightAmbients = [vec4(0.0,0.0,0.0,1.0) , vec4(0.0, 0.0, 0.0, 1.0), vec4(0.0, 0.0, 0.0, 1.0), vec4(0.0, 0.0, 1.0, 1.0), lightAmbients[4]];
                lightDiffuses = [vec4(0.0,0.0,0.0,1.0) , vec4(0.0, 0.0, 0.0, 1.0), vec4(0.0, 0.0, 0.0, 1.0), vec4(0.7, 0.7, 1.0, 1.0), lightDiffuses[4]];
                lightSpeculars = [vec4(0.0,0.0,0.0,1.0), vec4(0.0, 0.0, 0.0, 1.0), vec4(0.0, 0.0, 0.0, 1.0), vec4(0.0, 0.0, 1.0, 1.0), lightSpeculars[4]];
            }
            Aslid.value = 0.0;
            Dslid.value = 0.0;
            Sslid.value = 0.0;
            timer2 = 0;         // Reset the timer
        }
    }

    drawMesh();             // Draw the mesh
    drawBase();             // Draw the tank's base.
    drawTurret();           // Draw the tank's turret.
    drawAmmunition();       // Draw the ammunition.

    requestAnimationFrame(render);	// Call to browser to refresh display.
}

// Calculate the product based on the material's info
function setLightProduct(materialAmbient, materialDiffuse, materialSpecular){

    var ambientProducts = [];
    ambientProducts[0] = mult(lightAmbients[0], materialAmbient);
    ambientProducts[1] = mult(lightAmbients[1], materialAmbient);
    ambientProducts[2] = mult(lightAmbients[2], materialAmbient);
    ambientProducts[3] = mult(lightAmbients[3], materialAmbient);
    ambientProducts[4] = mult(lightAmbients[4], materialAmbient);

    var diffuseProducts = [];
    diffuseProducts[0] = mult(lightDiffuses[0], materialDiffuse);
    diffuseProducts[1] = mult(lightDiffuses[1], materialDiffuse);
    diffuseProducts[2] = mult(lightDiffuses[2], materialDiffuse);
    diffuseProducts[3] = mult(lightDiffuses[3], materialDiffuse);
    diffuseProducts[4] = mult(lightDiffuses[4], materialDiffuse);

    var specularProducts = [];
    specularProducts[0] = mult(lightSpeculars[0], materialSpecular);
    specularProducts[1] = mult(lightSpeculars[1], materialSpecular);
    specularProducts[2] = mult(lightSpeculars[2], materialSpecular);
    specularProducts[3] = mult(lightSpeculars[3], materialSpecular);
    specularProducts[4] = mult(lightSpeculars[4], materialSpecular);

    gl.uniform4fv( APLoc, flatten(ambientProducts));
    gl.uniform4fv( DPLoc, flatten(diffuseProducts));
    gl.uniform4fv( SPLoc,flatten(specularProducts));
    gl.uniform4fv( LPLoc,flatten(lightPositions));
}

// Change the diffuse product with difference materialDiffuse
function changeDiffuse(materialDiffuse){
    var diffuseProducts = [];
    diffuseProducts[0] = mult(lightDiffuses[0], materialDiffuse);
    diffuseProducts[1] = mult(lightDiffuses[1], materialDiffuse);
    diffuseProducts[2] = mult(lightDiffuses[2], materialDiffuse);
    diffuseProducts[3] = mult(lightDiffuses[3], materialDiffuse);
    diffuseProducts[4] = mult(lightDiffuses[4], materialDiffuse);
    gl.uniform4fv( DPLoc, flatten(diffuseProducts));
}


function drawMesh(){
    gl.uniform1i( gl.getUniformLocation(program, "texTrigger"), 1);             // Set it to use the terrain texture
    var materialAmbient = vec4(0.2, 0.2, 0.2, 1.0);
    var materialDiffuse = vec4(0.43, 0.275, 0.06, 0.8);
    var materialSpecular = vec4(1.0, 1.0, 1.0, 1.0);                        // The material property of the terrain

    setLightProduct(materialAmbient, materialDiffuse, materialSpecular);

    var modelViewMatrix = lookAt(eye,at,up);
    var projectionMatrix = ortho(left, right, bottom, topp, near, far);         // Calculate the two matrix.
    nMatrix = normalMatrix(modelViewMatrix,true);
   
    gl.uniformMatrix4fv(MVMLoc,false,flatten(modelViewMatrix));
    gl.uniformMatrix4fv(PMLoc, false, flatten(projectionMatrix));
    gl.uniformMatrix3fv(NLoc, false, flatten(nMatrix)  );
 
    gl.drawArrays(gl.TRIANGLES,0,6);
    gl.uniform1i( gl.getUniformLocation(program, "texTrigger"), 2);         // Set it to the camouflage texture
}


function drawAmmunition(){
    var materialAmbient = vec4(0.2, 0.2, 0.2, 1.0);             // The material property of the ammunition.
    var materialDiffuse = vec4(0.43, 0.275, 0.06, 0.8);
    var materialSpecular = vec4(1.0, 1.0, 1.0, 1.0);


    if(fireTrigger == true){                // If it's fired.
        ammunitionDist[0] += 0.3*Math.sin((baseAngle+turretAngle)* Math.PI/180.0);      // Update the translation position of the buttet.
        ammunitionDist[2] -= 0.3*Math.cos((baseAngle+turretAngle)* Math.PI/180.0);

        if(Math.sqrt(Math.pow(ammunitionDist[0]-baseDist[0],2) + Math.pow(ammunitionDist[2] - baseDist[2], 2)) > 0.2){  // If it's out of the barret
            lightPositions[4] = vec4(ammunitionDist[0], 0.202, ammunitionDist[2],1.0);                  // Wake the light up
            gl.uniform4fv( gl.getUniformLocation(program,"uLightPositions"),flatten(lightPositions));
            lightAmbients[4] = vec4(1.0,1.0,1.0,1.0);
            lightDiffuses[4] = vec4(1.0,1.0,1.0,1.0);
            lightSpeculars[4] = vec4(1.0,1.0,1.0,1.0);          
        }


    }
    if(Math.abs(ammunitionDist[0]) > 10 || Math.abs(ammunitionDist[2]) > 10){           // If it's out of the scene, reset it. (reload)
        lightPositions[4] = vec4(ammunitionDist[0], 0.202, ammunitionDist[2]);
        gl.uniform4fv( gl.getUniformLocation(program,"uLightPositions"),flatten(lightPositions));
        ammunitionDist = [0.0,0.2,0.0];
        lightAmbients[4] = vec4(0.0,0.0,0.0,1.0);
        lightDiffuses[4] = vec4(0.0,0.0,0.0,1.0);
        lightSpeculars[4] = vec4(0.0,0.0,0.0,1.0);                          // Also needs to reset the light
        fireTrigger = false;
    }

    setLightProduct(materialAmbient, materialDiffuse, materialSpecular);

    var modelMatrix = rotate((baseAngle+turretAngle), vec3(0,1,0));
    modelMatrix = mult(translate(baseDist[0],baseDist[1],baseDist[2]), modelMatrix);        // Get the model matrix from rotation and translation.
    modelMatrix = mult(translate(ammunitionDist[0],ammunitionDist[1],ammunitionDist[2]), modelMatrix);

    var modelViewMatrix = mult(lookAt(eye,at,up),modelMatrix);                  // Get the modelviewmatrix from the look at function.
    var projectionMatrix = ortho(left, right, bottom, topp, near, far);         // Get the projection matrix.
    nMatrix = normalMatrix(modelViewMatrix,true);


    gl.uniformMatrix4fv(MVMLoc,false,flatten(modelViewMatrix));
    gl.uniformMatrix4fv(PMLoc, false, flatten(projectionMatrix));
    gl.uniformMatrix3fv(NLoc, false, flatten(nMatrix));

    gl.drawArrays(gl.POINTS,302,1);
}


function drawTurret(){

    var materialAmbient = vec4(0.2, 0.2, 0.2, 1.0);             // The material property of the turret
    var materialDiffuse = vec4(0.68,0.95,0.15,0.8);
    var materialSpecular = vec4(1.0, 1.0, 1.0, 1.0);

    setLightProduct(materialAmbient, materialDiffuse, materialSpecular);

    var modelMatrix = rotate((baseAngle+turretAngle), vec3(0,1,0));
    modelMatrix = mult(translate(baseDist[0],baseDist[1],baseDist[2]), modelMatrix);        // Get the model matrix from rotation and translation.

    var modelViewMatrix = mult(lookAt(eye,at,up),modelMatrix);                  // Get the modelviewmatrix from the look at function.
    var projectionMatrix = ortho(left, right, bottom, topp, near, far);         // Get the projection matrix.
    nMatrix = normalMatrix(modelViewMatrix,true);

    gl.uniformMatrix4fv(MVMLoc,false,flatten(modelViewMatrix));
    gl.uniformMatrix4fv(PMLoc, false, flatten(projectionMatrix));
    gl.uniformMatrix3fv(NLoc, false, flatten(nMatrix)  );

    gl.drawArrays(gl.TRIANGLE_STRIP, 136, 6);                         // Draw the top of the turret.
    gl.drawArrays(gl.TRIANGLE_STRIP, 142, 6);
    gl.drawArrays(gl.TRIANGLE_STRIP,148,14);

    changeDiffuse(vec4(0.9,0.7,0.0,0.8));                           // Change the color to draw the barrel

    gl.drawArrays(gl.TRIANGLE_FAN, 162, 18);                 
    gl.drawArrays(gl.TRIANGLE_FAN, 180, 18);
    gl.drawArrays(gl.TRIANGLE_STRIP,198,34);            // Draw the barrel.

    gl.drawArrays(gl.TRIANGLE_FAN, 232, 18);                 
    gl.drawArrays(gl.TRIANGLE_FAN, 250, 18);
    gl.drawArrays(gl.TRIANGLE_STRIP,268,34);            // Draw the gas extractor.
}


function drawBase(){
    var materialAmbient = vec4(0.2, 0.2, 0.2, 1.0);         // The material property for the base
    var materialDiffuse = vec4(0.235,0.53,0.31,1.0);
    var materialSpecular = vec4(1.0, 1.0, 1.0, 1.0);

    setLightProduct(materialAmbient, materialDiffuse, materialSpecular);

    var modelMatrix = rotate(baseAngle, vec3(0,1,0));
    modelMatrix = mult(translate(baseDist[0],baseDist[1],baseDist[2]), modelMatrix);        // Get the model matrix from rotation and translation.

    var modelViewMatrix = mult(lookAt(eye,at,up),modelMatrix);                  // Get the modelviewmatrix from the look at function.
    var projectionMatrix = ortho(left, right, bottom, topp, near, far);         // Get the projection matrix.
    nMatrix = normalMatrix(modelViewMatrix,true);
   
    gl.uniformMatrix4fv(MVMLoc,false,flatten(modelViewMatrix));
    gl.uniformMatrix4fv(PMLoc, false, flatten(projectionMatrix));
    gl.uniformMatrix3fv(NLoc, false, flatten(nMatrix)  );

    gl.drawArrays(gl.TRIANGLE_STRIP, 6, 6);                         // Draw the right part of the base.
    gl.drawArrays(gl.TRIANGLE_STRIP, 12, 6);
    gl.drawArrays(gl.TRIANGLE_STRIP,18,14);


    gl.drawArrays(gl.TRIANGLE_STRIP, 32, 6);                    // Draw the left part.
    gl.drawArrays(gl.TRIANGLE_STRIP, 38, 6);
    gl.drawArrays(gl.TRIANGLE_STRIP,44,14);

    changeDiffuse(vec4(0.235,0.71,0.11,1.0));                   // Change the color

    gl.drawArrays(gl.TRIANGLE_STRIP, 58, 6);                    // Draw the middle part.
    gl.drawArrays(gl.TRIANGLE_STRIP, 64, 6);
    gl.drawArrays(gl.TRIANGLE_STRIP,70,14);

    gl.uniform1i( gl.getUniformLocation(program, "texTrigger"), 0);     // Change the texture to "not use texture"

    changeDiffuse(vec4(0.4,0.4,0.4,1.0));                       // Change the color to draw the track

    gl.drawArrays(gl.TRIANGLE_STRIP, 84, 6);                    // Draw the left track.
    gl.drawArrays(gl.TRIANGLE_STRIP, 90, 6);
    gl.drawArrays(gl.TRIANGLE_STRIP,96,14);

    gl.drawArrays(gl.TRIANGLE_STRIP, 110, 6);                    // Draw the right track.
    gl.drawArrays(gl.TRIANGLE_STRIP, 116, 6);
    gl.drawArrays(gl.TRIANGLE_STRIP,122,14);

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
    else if(e.keyCode == 70 && fireTrigger == false){
        fireTrigger = true;            // Fire! with key "F"
    }
    else if(e.keyCode == 32){
        sniperMode = !sniperMode;           // Enter/Exit the sniper mode with key "Space".
    }
}