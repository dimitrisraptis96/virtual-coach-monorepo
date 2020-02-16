var scene, camera, renderer;

var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;

var IMUquaternion = new THREE.Quaternion();

var SPEED = 0.01;

function init() {
  scene = new THREE.Scene();

  initCube();
  initCamera();
  initRenderer();

  var debugAxes = new THREE.AxesHelper(20);
  scene.add(debugAxes);

  document.body.appendChild(renderer.domElement);
}

function updateQuaternion(x, y, z, w) {
  IMUquaternion.set(parseFloat(x), parseFloat(y), parseFloat(z), parseFloat(w));
  cube.setRotationFromQuaternion(IMUquaternion);
  render();
}

function initCamera() {
  camera = new THREE.PerspectiveCamera(70, WIDTH / HEIGHT, 1, 10);
  camera.position.set(0, 3.5, 5);
  camera.lookAt(scene.position);
}

function initRenderer() {
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(WIDTH, HEIGHT);
}

function initCube() {
  cube = new THREE.Mesh(
    new THREE.CubeGeometry(2, 2, 2),
    new THREE.MeshNormalMaterial()
  );
  scene.add(cube);
}

function rotateCube() {
  cube.rotation.x -= SPEED * 2;
  cube.rotation.y -= SPEED;
  cube.rotation.z -= SPEED * 3;
}

function render() {
  renderer.render(scene, camera);
}

init();
render();
