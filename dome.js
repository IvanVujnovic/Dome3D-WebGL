var scene, camera, renderer;
var radius, controls;
var rot_y = 270*Math.PI/180;

window.onresize = main;   //// Make sure the main() function is called every time the window is resized

// Entry point for the main app
function main() {
    init();
    animate();    
}

// Initialize Three.js and draw the dome
function init() {
    scene = new THREE.Scene();
    
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.z = 1000;

    // The dome radius is 70% from the window min dimension
    radius = Math.min(window.innerWidth, window.innerHeight) * 0.7;

    // We draw the dome in two parts (upper and lower)
    var tri = triangle_list();

    for(var i = 0; i < tri.length; i++) {
        // Draw every triangle as a filled shape
        var tst = filled_triangle(tri[i][0].x, tri[i][0].y, tri[i][0].z, 
        tri[i][1].x, tri[i][1].y, tri[i][1].z, 
        tri[i][2].x, tri[i][2].y, tri[i][2].z);

        scene.add(tst);
        tst.rotation.y = rot_y;

        // Draw every triangle as a wired shape
        var wired_tst = wired_triangle(tri[i][0].x, tri[i][0].y, tri[i][0].z, 
        tri[i][1].x, tri[i][1].y, tri[i][1].z, 
        tri[i][2].x, tri[i][2].y, tri[i][2].z);

        scene.add(wired_tst);
        wired_tst.rotation.y = rot_y;

    }

    // Draw the lower part of the dome (this has a opening/door in shape of a pentagon)
    var tri_low = triangle_list2();

    for(var i = 0; i < tri_low.length - 12; i++) {
        // Draw every triangle as a filled shape
        var tst = filled_triangle(tri_low[i][0].x, tri_low[i][0].y, tri_low[i][0].z, 
        tri_low[i][1].x, tri_low[i][1].y, tri_low[i][1].z, 
        tri_low[i][2].x, tri_low[i][2].y, tri_low[i][2].z);

        scene.add(tst);
        tst.rotation.y = rot_y;

        // Draw every triangle as a wired shape
        var wired_tst = wired_triangle(tri_low[i][0].x, tri_low[i][0].y, tri_low[i][0].z, 
        tri_low[i][1].x, tri_low[i][1].y, tri_low[i][1].z, 
        tri_low[i][2].x, tri_low[i][2].y, tri_low[i][2].z);

        scene.add(wired_tst);
        wired_tst.rotation.y = rot_y;
    }

    // Identify the 4 corners of the opening
    var xa = tri_low[tri_low.length - 12 - 1][1].x;
    var ya = tri_low[tri_low.length - 12 - 1][1].y;
    var za = tri_low[tri_low.length - 12 - 1][1].z;

    var xd = tri_low[tri_low.length - 12 - 1][2].x;
    var yd = tri_low[tri_low.length - 12 - 1][2].y;
    var zd = tri_low[tri_low.length - 12 - 1][2].z;

    var xc = tri_low[tri_low.length - 1][1].x;
    var yc = tri_low[tri_low.length - 1][1].y;
    var zc = tri_low[tri_low.length - 1][1].z;

    var xb = tri_low[tri_low.length - 1][2].x;
    var yb = tri_low[tri_low.length - 1][2].y;
    var zb = tri_low[tri_low.length - 1][2].z;

    // Define two points on the opening
    var xn = (xd + xa)/2;
    var yn = (yd + ya)/2;
    var zn = (zd + za)/2;

    var xm = (xb + xc)/2;
    var ym = (yb + yc)/2;
    var zm = (zb + zc)/2;

    // Create the pentagon effect by drawing 2 extra triangles over the exisiting "square" opening
    var tt = filled_triangle(
        xd, yd, zd,        
        xb, yb, zb,
        xn, yn, zn
        );

    scene.add(tt);
    tt.rotation.y = rot_y;

    var tt2 = filled_triangle(
        xd, yd, zd,        
        xb, yb, zb,
        xm, ym, zm
        );

    scene.add(tt2);
    tt2.rotation.y = rot_y;

    renderer = new THREE.WebGLRenderer({antialias:true});

    // Add mouse controls to the scene
    controls = new THREE.OrbitControls(camera, renderer.domElement);

    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setDepthTest(true);

    document.body.appendChild( renderer.domElement );    
}

// Called every time the scene is redrawn
function animate() {
    requestAnimationFrame( animate );

    renderer.render(scene, camera);
}

// Generate a 3D mesh for the upper dome
function triangle_list() {
    var nr_vert_slices = 6;
    var nr_horiz_slices = 6;
    var triangles = [];

    var old_ring = [];

    for(var i = 0; i < nr_horiz_slices/2 + 1; i++) {
        old_ring.push(new THREE.Vector3(0, radius, 0));
    }

    var delta_vert = (Math.PI - Math.PI/2)/nr_vert_slices;
    var theta;
    var x, y, z;

    for(var i = 1; i <= nr_vert_slices; i++) {
        theta = 0.95*i*delta_vert;
        //theta = i*delta_vert;
        var phi = 0;

        var new_ring = [];
        var delta_horiz = 2*Math.PI/nr_horiz_slices;

        for(var j = 0; j <= nr_horiz_slices; j++) {
            phi = j*delta_horiz;

            x = radius * Math.cos(phi)*Math.sin(theta);
            y = radius * Math.cos(theta);
            z = radius * Math.sin(phi) * Math.sin(theta);

            new_ring.push(new THREE.Vector3(x, y, z));
        }

        nr_horiz_slices *= 2;

        var nr_points = new_ring.length;

        var cont = 0;

        for(var kk = 0; kk < nr_points - 1; kk++) {
            cont = Math.floor(kk/2);
            if(i == 1) {
                var triangle = [];
                triangle.push(new_ring[kk]);
                triangle.push(new_ring[kk + 1]);
                triangle.push(old_ring[cont]);                
                triangles.push(triangle);
            }
            else {
                if(kk % 2 === 0) {
                    var triangle = [];
                    triangle.push(new_ring[kk]);
                    triangle.push(new_ring[kk + 1]);
                    triangle.push(old_ring[cont]);
                    triangles.push(triangle);
                }     
                else {
                    var triangle = [];
                    triangle.push(new_ring[kk]);
                    triangle.push(old_ring[cont + 1]);
                    triangle.push(old_ring[cont]);
                    triangles.push(triangle);

                    triangle = [];
                    triangle.push(new_ring[kk]);
                    triangle.push(new_ring[kk + 1]);
                    triangle.push(old_ring[cont + 1]);
                    triangles.push(triangle);
                }           
            }
        } 

        old_ring = new_ring;

        if(i == 4) break;
        //break;

    }

    return triangles;
}

// Generate a 3D mesh for the lower dome
function triangle_list2() {
    var nr_vert_slices = 6;
    var nr_horiz_slices = 6;
    var triangles = [];

    var old_ring = [];

    for(var i = 0; i < nr_horiz_slices/2 + 1; i++) {
        old_ring.push(new THREE.Vector3(0, radius, 0));
    }

    var delta_vert = (Math.PI - Math.PI/2)/nr_vert_slices;
    var theta;
    var x, y, z;

    for(var i = 1; i <= nr_vert_slices; i++) {
        //theta = 0.98*i*delta_vert;
        theta = 0.95*i*delta_vert;
        var phi = 0;
        last_theta = theta;

        var new_ring = [];
        var delta_horiz = 2*Math.PI/nr_horiz_slices;

        for(var j = 0; j <= nr_horiz_slices; j++) {
            phi = j*delta_horiz;

            x = radius * Math.cos(phi)*Math.sin(theta);
            y = radius * Math.cos(theta);
            z = radius * Math.sin(phi) * Math.sin(theta);

            new_ring.push(new THREE.Vector3(x, y, z));
        }

        nr_horiz_slices *= 2;

        var nr_points = new_ring.length;

        var cont = 0;

        for(var kk = 0; kk < nr_points - 1; kk++) {
            cont = Math.floor(kk/2);
            if(i == 1) {
                var triangle = [];
                triangle.push(new_ring[kk]);
                triangle.push(new_ring[kk + 1]);
                triangle.push(old_ring[cont]); 

                if(i >= 4) triangles.push(triangle);
            }
            else {
                if(kk % 2 === 0) {
                    var triangle = [];
                    triangle.push(new_ring[kk]);
                    triangle.push(new_ring[kk + 1]);
                    triangle.push(old_ring[cont]);
                    if(i >= 4) triangles.push(triangle);
                }     
                else {
                    var triangle = [];
                    triangle.push(new_ring[kk]);
                    triangle.push(old_ring[cont + 1]);
                    triangle.push(old_ring[cont]);
                    if(i >= 4) triangles.push(triangle);

                    triangle = [];
                    triangle.push(new_ring[kk]);
                    triangle.push(new_ring[kk + 1]);
                    triangle.push(old_ring[cont + 1]);
                    if(i >= 4) triangles.push(triangle);
                }           
            }
        } 

        old_ring = new_ring;
    }

    return triangles;
}

// Create a filled triangle
function filled_triangle(x0, y0, z0, x1, y1, z1, x2, y2, z2) {
    var geometry = new THREE.Geometry();

    var xa = (x0 + x1)/2;
    var ya = (y0 + y1)/2;
    var za = (z0 + z1)/2;

    var xb = (x1 + x2)/2;
    var yb = (y1 + y2)/2;
    var zb = (z1 + z2)/2;

    var xc = (x0 + x2)/2;
    var yc = (y0 + y2)/2;
    var zc = (z0 + z2)/2;

    // Triangle 0
    geometry.vertices.push(new THREE.Vector3( x0,  y0, z0));
    geometry.vertices.push(new THREE.Vector3(xa, ya, za));
    geometry.vertices.push(new THREE.Vector3( xc, yc, zc));

    geometry.faces.push(new THREE.Face3(0, 1, 2));

    geometry.faces[0].vertexColors[0] = new THREE.Color(0xffffff);
    geometry.faces[0].vertexColors[1] = new THREE.Color(0x000000);
    geometry.faces[0].vertexColors[2] = new THREE.Color(0x000000);

    // Triangle 1
    geometry.vertices.push(new THREE.Vector3(xa, ya, za));
    geometry.vertices.push(new THREE.Vector3(x1,  y1, z1));    
    geometry.vertices.push(new THREE.Vector3(xb, yb, zb));

    geometry.faces.push(new THREE.Face3(3, 4, 5));

    geometry.faces[1].vertexColors[0] = new THREE.Color(0x000000);
    geometry.faces[1].vertexColors[1] = new THREE.Color(0xffffff);
    geometry.faces[1].vertexColors[2] = new THREE.Color(0x000000);

    // Triangle 2
    geometry.vertices.push(new THREE.Vector3(xc, yc, zc));
    geometry.vertices.push(new THREE.Vector3(xb, yb, zb));
    geometry.vertices.push(new THREE.Vector3(x2,  y2, z2));    

    geometry.faces.push(new THREE.Face3(6, 7, 8));

    geometry.faces[2].vertexColors[0] = new THREE.Color(0x000000);
    geometry.faces[2].vertexColors[1] = new THREE.Color(0x000000);
    geometry.faces[2].vertexColors[2] = new THREE.Color(0xffffff);

    // Triangle 3
    geometry.vertices.push(new THREE.Vector3(xa, ya, za));
    geometry.vertices.push(new THREE.Vector3(xb, yb, zb));
    geometry.vertices.push(new THREE.Vector3(xc, yc, zc));    

    geometry.faces.push(new THREE.Face3(9, 10, 11));

    geometry.faces[3].vertexColors[0] = new THREE.Color(0x000000);
    geometry.faces[3].vertexColors[1] = new THREE.Color(0x000000);
    geometry.faces[3].vertexColors[2] = new THREE.Color(0x000000);
    
    var material = new THREE.MeshBasicMaterial({vertexColors:THREE.VertexColors, side:THREE.DoubleSide});

    var mesh = new THREE.Mesh(geometry, material);

    return mesh;
}

// Create a wired triangle
function wired_triangle(x0, y0, z0, x1, y1, z1, x2, y2, z2) {
    var geometry = new THREE.Geometry();

    var xa = (x0 + x1)/2;
    var ya = (y0 + y1)/2;
    var za = (z0 + z1)/2;

    var xb = (x1 + x2)/2;
    var yb = (y1 + y2)/2;
    var zb = (z1 + z2)/2;

    var xc = (x0 + x2)/2;
    var yc = (y0 + y2)/2;
    var zc = (z0 + z2)/2;

    // Triangle 0
    geometry.vertices.push(new THREE.Vector3( x0,  y0, z0));
    geometry.vertices.push(new THREE.Vector3(xa, ya, za));
    geometry.vertices.push(new THREE.Vector3( xc, yc, zc));

    geometry.faces.push(new THREE.Face3(0, 1, 2));

    // Triangle 1
    geometry.vertices.push(new THREE.Vector3(xa, ya, za));
    geometry.vertices.push(new THREE.Vector3(x1,  y1, z1));    
    geometry.vertices.push(new THREE.Vector3(xb, yb, zb));

    geometry.faces.push(new THREE.Face3(3, 4, 5));
    // Triangle 2
    geometry.vertices.push(new THREE.Vector3(xc, yc, zc));
    geometry.vertices.push(new THREE.Vector3(xb, yb, zb));
    geometry.vertices.push(new THREE.Vector3(x2,  y2, z2));    

    geometry.faces.push(new THREE.Face3(6, 7, 8));

    // Triangle 3
    geometry.vertices.push(new THREE.Vector3(xa, ya, za));
    geometry.vertices.push(new THREE.Vector3(xb, yb, zb));
    geometry.vertices.push(new THREE.Vector3(xc, yc, zc));    

    geometry.faces.push(new THREE.Face3(9, 10, 11));
    
    var material = new THREE.MeshBasicMaterial({color: 0x000000, side:THREE.DoubleSide, wireframe: true, wireframeLinewidth: 2});

    var mesh = new THREE.Mesh(geometry, material);

    return mesh;
}
