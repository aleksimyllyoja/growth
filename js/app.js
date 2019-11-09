var stats, scene, renderer, composer;
var camera, cameraControls, helper;
var geometry, mesh, material;
var c, ctx;
var shoti=0, x=0, y=0;

if( !init() )	animate();

function grow(scale) {
  var normalMatrixWorld = new THREE.Matrix3();
  mesh.geometry.computeVertexNormals();
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
      var a0 = fv.angleTo(new THREE.Vector3(1, 0, 0));
      var a1 = fv.angleTo(new THREE.Vector3(0, 1, 0));
      var a2 = fv.angleTo(new THREE.Vector3(0, 0, 1));
      var r = Math.floor(Math.random() * (8 - 2)) + 1;
      vertices[ indices[ j ] ].applyMatrix4( matrixWorld );

      vertices[ indices[ j ] ].addScaledVector(
        fv,
        Math.pow(Math.cos(a0*10*Math.random()), r)*scale*Math.cos(fv.y*Math.random()+fv.x*Math.random()/100.0)*a0
      );
    }
  }

  mesh.geometry.verticesNeedUpdate = true;
}

function divide() {
  var modifier = new THREE.SubdivisionModifier( 1 );
  mesh.geometry = modifier.modify( mesh.geometry );
}

function init_geometry() {
  geometry = new THREE.IcosahedronGeometry(0.5, 2);
  geometry.dynamic = true;
  geometry.__dirtyVertices = true;
}

function reset() {
  mesh.geometry = new THREE.IcosahedronGeometry(0.5, 2);
  var texture = random_texture();
  material = new THREE.MeshLambertMaterial({map: texture});
  mesh.material = material;
  if(Math.random() > 0.1) grow(Math.random()/10.0);
  divide();
  if(Math.random() > 0.3) grow(Math.random()/100.0);
  divide();
  if(Math.random() > 0.4) grow(Math.random()/100.0);
  divide();
  if(Math.random() > 0.5) grow(Math.random()/100.0);
  divide();

  mesh.rotateX(2*Math.PI*Math.random());
  mesh.rotateY(2*Math.PI*Math.random());
  mesh.rotateZ(2*Math.PI*Math.random());
}

function shot() {
  y = shoti % 3;
  x = x%3;
  var strMime = "image/jpeg";
  var imgData = renderer.domElement.toDataURL(strMime);

  var image = new Image(window.innerWidth, window.innerHeight);
  image.src = imgData;
  image.onload = function() {
    ctx.drawImage(image, x*c.width/3.0, y*c.height/3.0, c.width/3.0, c.height/3.0);
    reset();
    shoti++;
    if(y == 2) x++;
  }
  console.log(shoti, x, y)
}
function random_texture() {
  return texture = new THREE.TextureLoader().load( 'textures/t_'+Math.floor((Math.random())*15+1)+".jpg");
}

function init() {
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    preserveDrawingBuffer: true
  });
  renderer.setClearColor(0x1e1e1e);

  THREE.MOUSE.ROTATE = 0;

  c = document.getElementById("output");

  c.width = window.innerWidth*3;
  c.height =  window.innerHeight*3
  ctx = c.getContext("2d");

  renderer.setSize( window.innerWidth, window.innerHeight );
  document.getElementById('container').appendChild(renderer.domElement);

  scene = new THREE.Scene();

  camera	= new THREE.PerspectiveCamera(15, window.innerWidth / window.innerHeight, 1, 10000);
  camera.position.set(0, 0, 10);
  scene.add(camera);

  var light = new THREE.HemisphereLight(0xffffff, 0x000000, 2);
  scene.add(light);

  cameraControls	= new THREE.TrackballControls(camera,  renderer.domElement);

  init_geometry()

  var texture = random_texture();
  material = new THREE.MeshNormalMaterial();
  mesh = new THREE.Mesh( geometry, material );
  scene.add(mesh);

  //helper = new THREE.FaceNormalsHelper( mesh, 2, 0x00ff00, 1 );
  //scene.add(helper);
  //grow(100);
  //divide();

  reset();
}

function animate() {
  requestAnimationFrame( animate );
  render();
  //grow(0.1);
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
