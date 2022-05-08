

function createVertices(){
    createMesh();
    createBase();
    
    createLeftTrack();
    createRightTrack();

    createTurretV();
    createBarrel();
    createExtractor();

    createAmmunition();
}


function createMesh(){                              // Create the Terrain
    Vertices = [vec4(6,-0.3,6,1), vec4(6,-0.3,-6,1), vec4(-6,-0.3,-6,1)];
    Vertices = Vertices.concat([vec4(6,-0.3,6,1), vec4(-6,-0.3,-6,1),vec4(-6,-0.3,6,1)]);

    var nNormal = findNormal(Vertices[0],Vertices[2],Vertices[1]);      // Get the normal of that terrain

    for(var i = 0; i < 6; i++){
        normalsArray.push(nNormal);                 // Push all the normals to the array.
    }
}


function createBase(){
    var RightBaseVertices = [
        vec4(0.6,-0.125,-0.75,1.0),
        vec4(0.6,0.0,-0.6,1.0),
        vec4(0.6,-0.25,-0.6,1.0),
        vec4(0.6,0.0,0.6,1.0),
        vec4(0.6,-0.25,0.6,1.0),
        vec4(0.6,-0.125,0.75,1.0)
    ];      
    
    RightBaseVertices = RightBaseVertices.concat([
        vec4(0.4,-0.125,-0.75,1.0),
        vec4(0.4,0.0,-0.6,1.0),
        vec4(0.4,-0.25,-0.6,1.0),
        vec4(0.4,0.0,0.6,1.0),
        vec4(0.4,-0.25,0.6,1.0),
        vec4(0.4,-0.125,0.75,1.0)
    ]);      
    
    createBasePart(RightBaseVertices);              // Create the Right part

    var LeftBaseVertices = [
        vec4(-0.4,-0.125,-0.75,1.0),
        vec4(-0.4,0.0,-0.6,1.0),
        vec4(-0.4,-0.25,-0.6,1.0),
        vec4(-0.4,0.0,0.6,1.0),
        vec4(-0.4,-0.25,0.6,1.0),
        vec4(-0.4,-0.125,0.75,1.0)
    ];

    LeftBaseVertices = LeftBaseVertices.concat([
        vec4(-0.6,-0.125,-0.75,1.0),
        vec4(-0.6,0.0,-0.6,1.0),
        vec4(-0.6,-0.25,-0.6,1.0),
        vec4(-0.6,0.0,0.6,1.0),
        vec4(-0.6,-0.25,0.6,1.0),
        vec4(-0.6,-0.125,0.75,1.0)
    ]);                                      

    createBasePart(LeftBaseVertices);               // Create the Left Part

    var MidBaseVertices = [
        vec4(0.4,-0.1,-0.75,1.0),
        vec4(0.4,0.1,-0.5,1.0),
        vec4(0.4,-0.2,-0.5,1.0),
        vec4(0.4,0.1,0.5,1.0),
        vec4(0.4,-0.2,0.5,1.0),
        vec4(0.4,-0.1,0.7,1.0)
    ];   

    MidBaseVertices = MidBaseVertices.concat([
        vec4(-0.4,-0.1,-0.75,1.0),
        vec4(-0.4,0.1,-0.5,1.0),
        vec4(-0.4,-0.2,-0.5,1.0),
        vec4(-0.4,0.1,0.5,1.0),
        vec4(-0.4,-0.2,0.5,1.0),
        vec4(-0.4,-0.1,0.7,1.0)
    ]);                                      

    createBasePart(MidBaseVertices);                    // Create the Mid Part
}


function createLeftTrack(){            // Create the left track under the base
    var BaseVertices =  [
        vec4(-0.405, -0.25, -0.6, 1.0),
        vec4(-0.405, -0.05, -0.5, 1.0),
        vec4(-0.405, -0.3, -0.5, 1.0),
        vec4(-0.405, -0.05, 0.5, 1.0),
        vec4(-0.405, -0.3, 0.5, 1.0),
        vec4(-0.405, -0.25, 0.6, 1.0)
    ];                          

    BaseVertices = BaseVertices.concat([
        vec4(-0.595, -0.25, -0.6, 1.0),
        vec4(-0.595, 0.0, -0.5, 1.0),
        vec4(-0.595, -0.3, -0.5, 1.0),
        vec4(-0.595, 0.0, 0.5, 1.0),
        vec4(-0.595, -0.3, 0.5, 1.0),
        vec4(-0.595, -0.25, 0.6, 1.0)
    ]);

    createBasePart(BaseVertices);
}


function createRightTrack(){             // Function for creating the Right track.

    var BaseVertices =  [
        vec4(0.595, -0.25, -0.6, 1.0),
        vec4(0.595, 0.0, -0.5, 1.0),
        vec4(0.595, -0.3, -0.5, 1.0),
        vec4(0.595, 0.0, 0.5, 1.0),
        vec4(0.595, -0.3, 0.5, 1.0),
        vec4(0.595, -0.25, 0.6, 1.0)
    ];                          

    BaseVertices = BaseVertices.concat([
        vec4(0.405, -0.25, -0.6, 1.0),
        vec4(0.405, -0.05, -0.5, 1.0),
        vec4(0.405, -0.3, -0.5, 1.0),
        vec4(0.405, -0.05, 0.5, 1.0),
        vec4(0.405, -0.3, 0.5, 1.0),
        vec4(0.405, -0.25, 0.6, 1.0)
    ]);

    createBasePart(BaseVertices);
}


function createTurretV(){           // Function which creates the Turret

    var BaseVertices =  [
        vec4(0.15,0.3,-0.3,1.0),
        vec4(-0.15,0.3,-0.3,1.0),
        vec4(0.25,0.32,0.1,1.0),
        vec4(-0.25,0.32,0.1,1.0),
        vec4(0.17,0.3,0.35,1.0),
        vec4(-0.17,0.3,0.35,1.0),       // Top of the Turret.
    ];                          

    BaseVertices = BaseVertices.concat([
        vec4(0.15,0.1,-0.4,1.0),
        vec4(-0.15,0.1,-0.4,1.0),
        vec4(0.3,0.1,0.1,1.0),
        vec4(-0.3,0.1,0.1,1.0),
        vec4(0.2,0.1,0.4,1.0),
        vec4(-0.2,0.1,0.4,1.0)          // Bottom of the Turret.
    ]);

    createBasePart(BaseVertices);
}


function createBarrel(){            // Create the Barrel (Cylinder shape)

    var normals = new Array(34);            // Create an array of normals 
    var temparray = [vec4(0.0,0.2,-1.5, 1.0)];                      // Create one circle's center
    temparray = temparray.concat(makeCircle([0.0,0.2,-1.5],0.025,16));      // Create its circle
    
    var farnormal = findNormal(temparray[0],temparray[1], temparray[2]);      // Find its normal

    temparray.push(vec4(0.0,0.2,0.0,1.0));
    temparray = temparray.concat(makeCircle([0.0,0.2,0.0],0.035,16));

    var nearnormal = findNormal(temparray[18],temparray[20], temparray[19]);  // Find the normal of the other circle.

    for(var i = 0; i < 17;i++){
        normals[i] = farnormal;
        normals[i+17] = nearnormal;             // Add the normals to the array

        temparray.push(temparray[i+1]);
        temparray.push(temparray[i+19]);        // +19 is because there're two centers, we don't need them when making the side of the cylinder
    }

    for(var i = 0; i< 16; i++){                 // For each Quad that forming the side of the cylinder
        var a = temparray[i+1];
        var b = temparray[i+19];
        var c = temparray[i+2];
        var d = temparray[i+20];            // Get the four vertices

        var subnormal1 = findNormal(a,b,c);         // Find the one normal
        normals[i] = add(normals[i], subnormal1);
        normals[i+17] = add(normals[i+17], subnormal1);
        normals[i+1] = add(normals[i+1], subnormal1);   

        var subnormal2 = findNormal(b,d,c);             // Find the other normal
        normals[i+17] = add(normals[i+17], subnormal2);
        normals[i+1] = add(normals[i+1], subnormal2);
        normals[i+18] = add(normals[i+18], subnormal2);        
    }

    for(var i = 0; i < normals.length; i++){
        normals[i] = mult(0.25,normals[i]);        // Need to divide by 4 to take the average normal.
    }

    normalsArray.push(farnormal);
    for(var i = 0; i < 17; i++){
        normalsArray.push(normals[i]);
    }
    normalsArray.push(nearnormal);
    for(var i = 0; i < 17; i++){
        normalsArray.push(normals[i+17]);
    }
    for(var i = 0; i < 17; i++){
        normalsArray.push(normals[i]);
        normalsArray.push(normals[i+17]);
    }

    Vertices = Vertices.concat(temparray);
}


function createExtractor(){                 // Create the Smoke Extractor on the Barrel, similar function as above.

    var normals = new Array(34);
    var temparray = [vec4(0.0,0.2,-1.0, 1.0)];
    temparray = temparray.concat(makeCircle([0.0,0.2,-1.0],0.05,16));
    
    var farnormal = findNormal(temparray[0],temparray[1], temparray[2]);

    temparray.push(vec4(0.0,0.2,-0.8,1.0));
    temparray = temparray.concat(makeCircle([0.0,0.2,-0.8],0.05,16));

    var nearnormal = findNormal(temparray[18],temparray[20], temparray[19]);

    for(var i = 0; i < 17;i++){
        normals[i] = farnormal;
        normals[i+17] = nearnormal;

        temparray.push(temparray[i+1]);
        temparray.push(temparray[i+19]);
    }

    for(var i = 0; i< 16; i++){
        var a = temparray[i+1];
        var b = temparray[i+19];
        var c = temparray[i+2];
        var d = temparray[i+20];

        var subnormal1 = findNormal(a,b,c);
        normals[i] = add(normals[i], subnormal1);
        normals[i+17] = add(normals[i+17], subnormal1);
        normals[i+1] = add(normals[i+1], subnormal1);

        var subnormal2 = findNormal(b,d,c);
        normals[i+17] = add(normals[i+17], subnormal2);
        normals[i+1] = add(normals[i+1], subnormal2);
        normals[i+18] = add(normals[i+18], subnormal2);        
    }

    for(var i = 0; i < normals.length; i++){
        normals[i] = mult(0.25,normals[i]);
    }

    normalsArray.push(farnormal);
    for(var i = 0; i < 17; i++){
        normalsArray.push(normals[i]);
    }
    normalsArray.push(nearnormal);
    for(var i = 0; i < 17; i++){
        normalsArray.push(normals[i+17]);
    }
    for(var i = 0; i < 17; i++){
        normalsArray.push(normals[i]);
        normalsArray.push(normals[i+17]);
    }

    Vertices = Vertices.concat(temparray);   
}


function createAmmunition(){                // Function for creating the bullet, which is one point.
    Vertices.push(vec4(0.0,0.0,0.0,1.0));

    normalsArray.push(vec4(0.0,1.0,0.0,0.0));
}


function createBasePart(BaseVertices){              // Create the polygon which forms the base and the Turret
    var normals1 = new Array(12);                                   // Create an array of normals for each vertex.
    for(var i = 0; i < 12; i++){
        normals1[i] = vec4(0,0,0,1);
    }
                     
    var BaseNormal1 = findNormal(BaseVertices[0],BaseVertices[2],BaseVertices[1]);      // Find the normal of the top

    var BaseNormal2 = findNormal(BaseVertices[6],BaseVertices[7],BaseVertices[8]);      // Find the normal of the bottom
    
    for(var i = 0; i < 6; i++){
        normals1[i] = BaseNormal1;                      // Add them to the normal array
        normals1[i+6] = BaseNormal2;
    }
          
    var indices = [
        0,6,
        2,8,
        4,10,
        5,11,
        3,9,
        1,7,
        0,6
    ];                                                              // The order of vertices when forming the side.

    for(var i = 0; i < indices.length-2; i+=2){                     // Loop through each face.
        var a = indices[i];
        var b = indices[i+1];
        var c = indices[i+2];
        var d = indices[i+3];                                       // Find the index of four vertices.

        var subnormal = findNormal(BaseVertices[a],BaseVertices[b],BaseVertices[c]);        // Find its normal.

        normals1[a] = add(normals1[a], subnormal);
        normals1[b] = add(normals1[b], subnormal);
        normals1[c] = add(normals1[c], subnormal);
        normals1[d] = add(normals1[d], subnormal);                  // Add it to the array.
    }
    
    for(var i = 0; i < normals1.length; i++){
        normals1[i] = mult((1/3),normals1[i]);            // Need to divide the normals by 3 cus it was the cumulative results.
        normalsArray.push(normals1[i]);
    }

    for(var i = 0; i < indices.length; i++){
        BaseVertices.push(BaseVertices[indices[i]]);
        normalsArray.push(normals1[indices[i]]);        // Apply the normals and the vertices that forms the side.
    }

    Vertices = Vertices.concat(BaseVertices); 

    texCoordsArray.push(texCoord[0]);                   // Fill the texture array with a specific order.
    texCoordsArray.push(texCoord[1]);
    texCoordsArray.push(texCoord[2]);
    texCoordsArray.push(texCoord[3]);
    texCoordsArray.push(texCoord[1]);
    texCoordsArray.push(texCoord[0]);

    texCoordsArray.push(texCoord[0]);
    texCoordsArray.push(texCoord[1]);
    texCoordsArray.push(texCoord[2]);
    texCoordsArray.push(texCoord[3]);
    texCoordsArray.push(texCoord[1]);
    texCoordsArray.push(texCoord[0]);

    texCoordsArray.push(texCoord[0]);
    texCoordsArray.push(texCoord[1]);

    for(var i = 0; i < 3; i++){
        texCoordsArray.push(texCoord[2]);
        texCoordsArray.push(texCoord[3]);
        texCoordsArray.push(texCoord[1]);
        texCoordsArray.push(texCoord[0]);
    }
}


function makeCircle(center, radius, nvertices){             // Create a circle with certain requirements.
    var tarray = [];

    for(var i = 0; i <= nvertices; i++){
        var deg = 2* Math.PI / nvertices * i;
        tarray.push(vec4(center[0] + radius * Math.cos(deg), center[1] + radius * Math.sin(deg), center[2], 1.0));
    }
    return tarray;
}


// Reference: From code example.
function findNormal(a,b,c){
    var t1 = subtract(b, a);
    var t2 = subtract(c, a);
    var normal = normalize(cross(t2, t1));
    return vec4(normal[0], normal[1], normal[2], 0.0);
}