var stats, scene, renderer, composer;
var camera, cameraControls;
var geometry, mesh, material;

var Variables = function(){
  this.scale = 0.1
  this.rarity = 0.3
}
var variables = new Variables();

var gui = new dat.GUI();
gui.add(variables, 'scale', 0, 2, 0.001);
gui.add(variables, 'rarity', 0, 0.3, 0.00001);

var fs = {
  divide: divide,
  grow: grow,
  reset: init_mesh
};

gui.add(fs, 'grow');
gui.add(fs, 'divide');
gui.add(fs, 'reset');

if( !init() )	animate();

function grow() {
  var max_scale = 0.0012;

  var normalMatrixWorld = new THREE.Matrix3();
  var vertices = mesh.geometry.vertices;
  var faces = mesh.geometry.faces;
  var matrixWorld = mesh.matrixWorld;

  normalMatrixWorld.getNormalMatrix(matrixWorld);

  for (var i = 0, l = faces.length; i < l; i ++) {
    var fv = new THREE.Vector3();
    var face = faces[ i ];

    fv.copy( face.normal ).applyMatrix3( normalMatrixWorld ).normalize();
    var indices = [face.a, face.b, face.c];
    for (var j = 0; j < 3; j ++) {
      var vv = new THREE.Vector3();
      vertices[ indices[ j ] ].applyMatrix4( matrixWorld );
      vertices[ indices[ j ] ].addScaledVector(
        fv,
        Math.random() < variables.rarity ? (1+Math.sin(Math.random()*2*Math.PI))*variables.scale : 0
      );
    }
  }

  mesh.geometry.verticesNeedUpdate = true;
}

function divide() {
  var modifier = new THREE.SubdivisionModifier( 1 );
  mesh.geometry = modifier.modify( mesh.geometry );
}

function init_mesh() {
  mesh.geometry = new THREE.SphereGeometry( 0.5, 3, 3);
}

function init() {

  renderer = new THREE.WebGLRenderer({
    antialias: true,
  });
  renderer.setClearColor(0x1e1e1e);

  renderer.setSize( window.innerWidth, window.innerHeight );
  document.getElementById('container').appendChild(renderer.domElement);

  scene = new THREE.Scene();

  camera	= new THREE.PerspectiveCamera(15, window.innerWidth / window.innerHeight, 1, 10000);
  camera.position.set(0, 0, 5);
  scene.add(camera);

  var light = new THREE.HemisphereLight(0xffffff, 0x888888, 2);
  scene.add(light);

  cameraControls	= new THREE.TrackballControls( camera,  renderer.domElement  )

  geometry = new THREE.SphereGeometry(0.3, 3, 3);
  geometry.dynamic = true;
  geometry.__dirtyVertices = true;

  material = new THREE.MeshNormalMaterial();
  mesh = new THREE.Mesh( geometry, material );
  scene.add(mesh);
}

function animate() {
  requestAnimationFrame( animate );
  render();
}

function render() {
  cameraControls.update();
  renderer.render(scene, camera);
}

window.addEventListener('resize', function() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}, false);
