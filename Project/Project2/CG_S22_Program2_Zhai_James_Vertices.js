

function createVertices(){
    createMesh();
    createBaseV();              // Create the base of the tank.
    createTurretV();
    createBarrel();
    createDoor();               // Create the door at the back of the turret
    createAmmunition();
    createAxes();               // Create the world axes.
}


function createMesh(){
    var temparray = [];

    for(var i = -8; i <= 8; i += 2){                
        for(var j = -8; j <= 8; j+= 2){
            var ry = Math.random() * 0.4 -0.57;             // Set a random y value -0.55~-0.15
            temparray.push(vec4(j, ry, i, 1.0))
            Colors.push(vec4(0.43, 0.275, 0.06, 0.8));
        }                           
    }
    Vertices = Vertices.concat(temparray);
}


function createAxes(){              // Function for creating the axes.
    Vertices.push(vec4(10.0,0.0,0.0,1.0));
    Vertices.push(vec4(-10.0,0.0,0.0,1.0));
    Vertices.push(vec4(0.0,10.0,0.0,1.0));
    Vertices.push(vec4(0.0,-10.0,0.0,1.0));
    Vertices.push(vec4(0.0,0.0,10.0,1.0));
    Vertices.push(vec4(0.0,0.0,-10.0,1.0));

    Colors.push(vec4(1.0,0.0,0.0,0.8));
    Colors.push(vec4(1.0,0.0,0.0,0.8));
    Colors.push(vec4(0.0,1.0,0.0,0.8));
    Colors.push(vec4(0.0,1.0,0.0,0.8));
    Colors.push(vec4(0.0,0.0,1.0,0.8));
    Colors.push(vec4(0.0,0.0,1.0,0.8));
}


function createAmmunition(){                // Function for creating the bullet, which is one point.
    Vertices.push(vec4(0.0,0.0,0.0,1.0));
    Colors.push(vec4(1.0,0.0,0.0,0.8));
}


function createTurretV(){           // Function for creating the turret.
    var TurretVertices = [
        vec4(0.15,0.3,-0.3,1.0),
        vec4(-0.15,0.3,-0.3,1.0),
        vec4(0.25,0.32,0.1,1.0),
        vec4(-0.25,0.32,0.1,1.0),
        vec4(0.17,0.3,0.35,1.0),
        vec4(-0.17,0.3,0.35,1.0),       // Top of the Turret.

        vec4(0.15,0.1,-0.4,1.0),
        vec4(-0.15,0.1,-0.4,1.0),
        vec4(0.3,0.1,0.1,1.0),
        vec4(-0.3,0.1,0.1,1.0),
        vec4(0.2,0.1,0.4,1.0),
        vec4(-0.2,0.1,0.4,1.0)          // Bottom of the Turret.
    ];

    TurretVertices.push(TurretVertices[0]);
    TurretVertices.push(TurretVertices[6]);
    TurretVertices.push(TurretVertices[1]);
    TurretVertices.push(TurretVertices[7]);
    TurretVertices.push(TurretVertices[3]);
    TurretVertices.push(TurretVertices[9]);
    TurretVertices.push(TurretVertices[5]);
    TurretVertices.push(TurretVertices[11]);
    TurretVertices.push(TurretVertices[4]);
    TurretVertices.push(TurretVertices[10]);
    TurretVertices.push(TurretVertices[2]);
    TurretVertices.push(TurretVertices[8]);
    TurretVertices.push(TurretVertices[0]);
    TurretVertices.push(TurretVertices[6]);

    for(var i = 0; i < 26; i++){
        Colors.push(vec4(0.67,0.04,0.557,0.8));
    }

    Vertices = Vertices.concat(TurretVertices);
}


function createBarrel(){
    var temparray = makeCircle([0.0,0.2,-1.5],0.03,16);
    temparray = temparray.concat(makeCircle([0.0,0.2,0.0],0.03,16));

    var size = temparray.length;
    for (var i = 0; i < size; i+=2){
        temparray.push(temparray[i]);
        temparray.push(temparray[i+17]);
    }                                         

    Vertices = Vertices.concat(temparray);

    for(var i = 0; i < 68; i++){
        Colors.push(vec4(0.9,0.7,0.0,0.8));
    }

    var temparray2 = makeCircle([0.0,0.2,-1.0],0.05,16);
    temparray2 = temparray2.concat(makeCircle([0.0,0.2,-0.8],0.05,16));     // The part on the barrel.

    var size = temparray2.length;
    for (var i = 0; i < size; i+=2){
        temparray2.push(temparray2[i]);
        temparray2.push(temparray2[i+17]);
    }                                         

    Vertices = Vertices.concat(temparray2);

    for(var i = 0; i < 68; i++){
        Colors.push(vec4(0.9,0.7,0.0,0.8));
    }
}


function createDoor(){                      // Function for creating the door on the back of the turret.
    var temparray = makeCircle([-0.1,0.2,0.4],0.06,16);
    temparray = temparray.concat(makeCircle([-0.1,0.2,0.0],0.06,16));

    var size = temparray.length;
    for (var i = 0; i < size; i+=2){
        temparray.push(temparray[i]);
        temparray.push(temparray[i+17]);
    }                                         

    Vertices = Vertices.concat(temparray);

    for(var i = 0; i < 68; i++){
        Colors.push(vec4(0.95,0.5,0.1,0.8));
    }
}

function createBaseV(){             // Function for creating the base.
    var BaseVertices = [
        vec4(0.6,-0.125,-0.75,1.0),
        vec4(0.6,0.0,-0.6,1.0),
        vec4(0.6,-0.25,-0.6,1.0),
        vec4(0.6,0.0,0.6,1.0),
        vec4(0.6,-0.25,0.6,1.0),
        vec4(0.6,-0.125,0.75,1.0)
    ];                                  

    BaseVertices = BaseVertices.concat([
        vec4(0.4,-0.125,-0.75,1.0),
        vec4(0.4,0.0,-0.6,1.0),
        vec4(0.4,-0.25,-0.6,1.0),
        vec4(0.4,0.0,0.6,1.0),
        vec4(0.4,-0.25,0.6,1.0),
        vec4(0.4,-0.125,0.75,1.0)
    ]);                                     // Right Part.

    BaseVertices = BaseVertices.concat([
        vec4(-0.6,-0.125,-0.75,1.0),
        vec4(-0.6,0.0,-0.6,1.0),
        vec4(-0.6,-0.25,-0.6,1.0),
        vec4(-0.6,0.0,0.6,1.0),
        vec4(-0.6,-0.25,0.6,1.0),
        vec4(-0.6,-0.125,0.75,1.0)
    ]);                                

    BaseVertices = BaseVertices.concat([
        vec4(-0.4,-0.125,-0.75,1.0),
        vec4(-0.4,0.0,-0.6,1.0),
        vec4(-0.4,-0.25,-0.6,1.0),
        vec4(-0.4,0.0,0.6,1.0),
        vec4(-0.4,-0.25,0.6,1.0),
        vec4(-0.4,-0.125,0.75,1.0)
    ]);                                      // Left Part.

    BaseVertices = BaseVertices.concat([
        vec4(-0.4,-0.1,-0.75,1.0),
        vec4(-0.4,0.1,-0.5,1.0),
        vec4(-0.4,-0.2,-0.5,1.0),
        vec4(-0.4,0.1,0.5,1.0),
        vec4(-0.4,-0.2,0.5,1.0),
        vec4(-0.4,-0.1,0.7,1.0)
    ]);

    BaseVertices = BaseVertices.concat([
        vec4(0.4,-0.1,-0.75,1.0),
        vec4(0.4,0.1,-0.5,1.0),
        vec4(0.4,-0.2,-0.5,1.0),
        vec4(0.4,0.1,0.5,1.0),
        vec4(0.4,-0.2,0.5,1.0),
        vec4(0.4,-0.1,0.7,1.0)
    ]);                                 // Middle Part.

    for(var i = 0; i < 24; i++){
        Colors.push(vec4(0.235,0.53,0.31,1.0));
    }

    for(var i = 0; i < 12; i++){
        Colors.push(vec4(0.235,0.71,0.31,1.0));
    }                                   // Add colors for those part.

    Vertices = Vertices.concat(BaseVertices);

    createLeftTrack();          // Create the left track of the base.
    createRightTrack();         // Create the right track of the base.
}


function createLeftTrack(){             // Function for creating the track.
    createWheel(0.6, 0.5);              // Create the two guide wheels on the sides of a track.
    createWheel(0.6, -0.5);

    Vertices.push(vec4(0.405,0,0.5, 1.0));
    Vertices.push(vec4(0.405,0,-0.5, 1.0));

    Vertices.push(vec4(0.405,-0.3,0.5, 1.0));
    Vertices.push(vec4(0.405,-0.3,-0.5, 1.0));

    Vertices.push(vec4(0.595,-0.3,0.5, 1.0));
    Vertices.push(vec4(0.595,-0.3,-0.5, 1.0));

    Vertices.push(vec4(0.595,0,0.5, 1.0));
    Vertices.push(vec4(0.595,0,-0.5, 1.0));     // Connect the wheels with the track.

    for(var i = 0; i < 8; i++){
        Colors.push(vec4(0.4,0.4,0.4,1.0));
    }
}


function createRightTrack(){            // Mirror the function above.
    createWheel(-0.4, 0.5);
    createWheel(-0.4, -0.5);

    Vertices.push(vec4(-0.405,0,0.5, 1.0));
    Vertices.push(vec4(-0.405,0,-0.5, 1.0));

    Vertices.push(vec4(-0.405,-0.3,0.5, 1.0));
    Vertices.push(vec4(-0.405,-0.3,-0.5, 1.0));

    Vertices.push(vec4(-0.595,-0.3,0.5, 1.0));
    Vertices.push(vec4(-0.595,-0.3,-0.5, 1.0));

    Vertices.push(vec4(-0.595,0,0.5, 1.0));
    Vertices.push(vec4(-0.595,0,-0.5, 1.0));

    for(var i = 0; i < 8; i++){
        Colors.push(vec4(0.4,0.4,0.4,1.0));
    }
}


function createWheel(x,z){          // Create the Guide Wheel, basically a semi-cylinder.
    var temparray = [];
    temparray = temparray.concat(makeSemiCircle([x-0.005, -0.20, z], 0.1, 8));
    temparray = temparray.concat(makeSemiCircle([x-0.195, -0.20, z], 0.1, 8));      // Two semi circle faces.

    var size = temparray.length;

    for (var i = 0; i < size; i+=2){
        temparray.push(temparray[i]);
        temparray.push(temparray[i+10]);
    }                                           // The middle.

    Vertices = Vertices.concat(temparray);
    for(var i = 0; i < 40; i++){
        Colors.push(vec4(0.4,0.4,0.4,1.0));
    }
}


function makeSemiCircle(center, radius, nvertices){             // Create a circle with certain requirements .
    var tarray = [];

    tarray.push(vec4(center[0],center[1],center[2],1.0));
    for(var i = 0; i <= nvertices; i++){
        var deg = Math.PI / nvertices * i;
        tarray.push(vec4(center[0], center[1] - radius * Math.sin(deg), center[2] + radius * Math.cos(deg), 1.0));
    }
    return tarray;
}


function makeCircle(center, radius, nvertices){             // Create a circle with certain requirements .
    var tarray = [];

    for(var i = 0; i <= nvertices; i++){
        var deg = 2* Math.PI / nvertices * i;
        tarray.push(vec4(center[0] + radius * Math.cos(deg), center[1] + radius * Math.sin(deg), center[2], 1.0));
    }
    return tarray;
}


function mesh_I_buffer(){
    
    indices = [];
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

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), gl.STATIC_DRAW);
}


function right_I_buffer(){                  // Buffer for creating the faces of the base.
    indices = [
        81,87,
        83,89,
        85,91,
        86,92,
        84,90,
        82,88,
        81,87
    ];
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), gl.STATIC_DRAW);
}

function left_I_buffer(){
    indices = [
        93,99,
        95,101,
        97,103,
        98,104,
        96,102,
        94,100,
        93,99
    ];
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), gl.STATIC_DRAW);
}

function mid_I_buffer(){
    indices = [
        105,111,
        107,113,
        109,115,
        110,116,
        108,114,
        106,112,
        105,111
    ];
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), gl.STATIC_DRAW);
}