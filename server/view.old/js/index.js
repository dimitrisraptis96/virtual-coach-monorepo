var camera, scene, renderer;
var geometry, material, mesh;
var rendererHeight, rendererWidth;

const DEBUG_MODE = false;
const WIDTH_FACTOR = 0.49,
  HEIGHT_FACTOR = 0.8;

const AXIS_LENGTH = 430,
  TRACE_SEGMENTS = 25;

var objectDragged = "none";
var mousePos = {
    x: 0,
    y: 0
  },
  cameraPos = {
    x: 0.425,
    y: 1.595
  };

var index = 1;
var lastIndex = dataArray.length;

var vectorObject = new THREE.Line();
var vectorQuaternion = new THREE.Quaternion();
var rotationAxis = new THREE.Vector3(0, 1, 0);
var axisXName, axisYName, axisZName;
var eulerOrder = "XYZ";
var eulerAngleFormat = "degrees";

var meshTraceObject = new THREE.Mesh();
var lineTraceObject = new THREE.Line();

var animation = false,
  showAxis = true;
var rotationAxisObject = new THREE.Line();

let exerciseId = "";

init();

/* *******************************
      ANDROID ONLY FUNCTIONS

THESE ARE THE WEBVIEW'S FUNCTIONS
******************************* */
function clearData() {
  dataArray = [];
}

function postSamples() {
  // Split data into chunks in order to prevent size limit error
  const CHUNK_SIZE = 4000;
  console.log(dataArray.length);

  const requestsArray = [];

  for (var i = 0; i < dataArray.length; i = i + CHUNK_SIZE) {
    var chunk = dataArray.slice(i, i + CHUNK_SIZE);
    requestsArray.push(
      axios({
        method: "PUT",
        headers: { "content-type": "application/json" },
        data: JSON.stringify({ samples: chunk, id: exerciseId }),
        url: "/exercise"
      })
    );
  }

  axios.all(requestsArray).then(res => console.log(res));
}

async function saveData() {
  axios({
    method: "POST",
    headers: { "content-type": "application/json" },
    url: "/exercise"
  }).then(response => {
    exerciseId = response.data;
    postSamples();
  });
}

function updateQuaternion(x, y, z, w) {
  dataArray.push({ x, y, z, w, timestamp: Date.now() });

  vectorQuaternion.set(
    parseFloat(x),
    parseFloat(y),
    parseFloat(z),
    parseFloat(w)
  );
  updateRotationAxis();
  updateVectorVisuals();
  // updateRotationInfo();
  updateAxesNames();

  var demoVector = new THREE.Vector3(1, 0, 0);
  demoVector.applyQuaternion(vectorQuaternion);
  var xyPlane = new THREE.Vector3(1, 0, 0);
  var theta = (demoVector.angleTo(xyPlane) * 180) / Math.PI;
  console.log(theta);

  renderer.render(scene, camera);
}

if (DEBUG_MODE) {
  function run() {
    for (var i = 1; i < samples.length; i++) {
      const { x, y, z, w } = samples[i];
      setTimeout(() => updateQuaternion(x, y, z, w, 0.1), i * 60);
    }
  }

  setTimeout(run, 2000);
}

function init() {
  rendererWidth = document.getElementById("renderDiv").clientWidth;
  rendererHeight = Math.min(
    document.getElementById("renderDiv").clientHeight,
    window.innerHeight * HEIGHT_FACTOR
  );
  aspectRatio = rendererWidth / rendererHeight;

  camera = new THREE.PerspectiveCamera(75, aspectRatio, 1, 10000);
  turnCamera();

  scene = new THREE.Scene();

  initGrid();
  initAxes();
  initAxesNames();
  initVector();
  initLineTrace();
  initRotationAxis();

  renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true
  });
  renderer.setSize(rendererWidth, rendererHeight);
  renderer.setClearColor(0xffffff, 1);

  document.getElementById("renderDiv").appendChild(renderer.domElement);

  window.addEventListener("resize", onWindowResize, false);
  document.addEventListener("mousemove", handleMouseMove, false);
  document.addEventListener("mousedown", handleMouseDown, false);
  document.addEventListener("mouseup", handleMouseUp, false);
  document.addEventListener("touchmove", handleTouchMove, false);
  document.addEventListener("touchstart", handleTouchStart, false);
  document.addEventListener("touchend", handleTouchEnd, false);
}

function initGrid() {
  var GRID_SEGMENT_COUNT = 5;
  var gridLineMat = new THREE.LineBasicMaterial({
    color: 0xdddddd
  });
  var gridLineMatThick = new THREE.LineBasicMaterial({
    color: 0xaaaaaa,
    linewidth: 2
  });

  for (var i = -GRID_SEGMENT_COUNT; i <= GRID_SEGMENT_COUNT; i++) {
    var dist = (AXIS_LENGTH * i) / GRID_SEGMENT_COUNT;
    var gridLineGeomX = new THREE.Geometry();
    var gridLineGeomY = new THREE.Geometry();

    if (i == 0) {
      gridLineGeomX.vertices.push(new THREE.Vector3(dist, 0, -AXIS_LENGTH));
      gridLineGeomX.vertices.push(new THREE.Vector3(dist, 0, 0));

      gridLineGeomY.vertices.push(new THREE.Vector3(-AXIS_LENGTH, 0, dist));
      gridLineGeomY.vertices.push(new THREE.Vector3(0, 0, dist));

      scene.add(new THREE.Line(gridLineGeomX, gridLineMatThick));
      scene.add(new THREE.Line(gridLineGeomY, gridLineMatThick));
    } else {
      gridLineGeomX.vertices.push(new THREE.Vector3(dist, -AXIS_LENGTH, 0));
      gridLineGeomX.vertices.push(new THREE.Vector3(dist, AXIS_LENGTH, 0));

      gridLineGeomY.vertices.push(new THREE.Vector3(-AXIS_LENGTH, dist, 0));
      gridLineGeomY.vertices.push(new THREE.Vector3(AXIS_LENGTH, dist, 0));

      scene.add(new THREE.Line(gridLineGeomX, gridLineMat));
      scene.add(new THREE.Line(gridLineGeomY, gridLineMat));
    }
  }
}

function initAxes() {
  var xAxisMat = new THREE.LineBasicMaterial({
    color: 0xff0000,
    linewidth: 1
  });
  var xAxisGeom = new THREE.Geometry();
  xAxisGeom.vertices.push(new THREE.Vector3(0, 0, 0));
  xAxisGeom.vertices.push(new THREE.Vector3(AXIS_LENGTH, 0, 0));
  var xAxis = new THREE.Line(xAxisGeom, xAxisMat);
  scene.add(xAxis);

  var yAxisMat = new THREE.LineBasicMaterial({
    color: 0x00cc00,
    linewidth: 1
  });
  var yAxisGeom = new THREE.Geometry();
  yAxisGeom.vertices.push(new THREE.Vector3(0, 0, 0));
  yAxisGeom.vertices.push(new THREE.Vector3(0, AXIS_LENGTH, 0));
  var yAxis = new THREE.Line(yAxisGeom, yAxisMat);
  scene.add(yAxis);

  var zAxisMat = new THREE.LineBasicMaterial({
    color: 0x0000ff,
    linewidth: 1
  });
  var zAxisGeom = new THREE.Geometry();
  zAxisGeom.vertices.push(new THREE.Vector3(0, 0, 0));
  zAxisGeom.vertices.push(new THREE.Vector3(0, 0, AXIS_LENGTH));
  var zAxis = new THREE.Line(zAxisGeom, zAxisMat);
  scene.add(zAxis);
}

function initAxesNames() {
  var objects = new Array(3);
  var names = ["x", "y", "z"];
  var colors = ["#ff0000", "#00cc00", "#0000ff"];
  for (var i = 0, len = objects.length; i < len; i++) {
    objects[i] = document.createElement("div");
    objects[i].innerHTML = names[i];
    objects[i].style.position = "absolute";
    objects[i].style.transform = "translateX(-50%) translateY(-50%)";
    objects[i].style.color = colors[i];
    document.body.appendChild(objects[i]);
  }
  axisXName = objects[0];
  axisYName = objects[1];
  axisZName = objects[2];
}

function initVector() {
  var vectorMat = new THREE.LineBasicMaterial({
    color: 0x00f0000,
    linewidth: 3
  });
  var vectorGeom = new THREE.Geometry();
  vectorGeom.vertices.push(new THREE.Vector3(0, 0, 0));
  var vectorStandard = new THREE.Vector3(AXIS_LENGTH, 0, 0);
  var vectorStandardBack = new THREE.Vector3(
    -AXIS_LENGTH / 5,
    AXIS_LENGTH / 5,
    0
  );
  vectorStandardBack.add(vectorStandard);
  vectorStandard.applyQuaternion(vectorQuaternion);
  vectorStandardBack.applyQuaternion(vectorQuaternion);
  vectorGeom.vertices.push(vectorStandard);
  vectorGeom.vertices.push(vectorStandardBack);
  vectorObject = new THREE.Line(vectorGeom, vectorMat);
  scene.add(vectorObject);
}

function initLineTrace() {
  var meshTraceMat = new THREE.MeshBasicMaterial({
    color: 0x0066cc,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.05
  });
  var lineTraceMat = new THREE.LineBasicMaterial({
    color: 0x0066cc
  });
  var meshTraceGeom = new THREE.Geometry();
  var lineTraceGeom = new THREE.Geometry();
  meshTraceGeom.vertices.push(new THREE.Vector3(0, 0, 0));
  for (var i = 0; i <= TRACE_SEGMENTS; i++) {
    var currentQuat = new THREE.Quaternion().slerp(
      vectorQuaternion,
      i / TRACE_SEGMENTS
    );
    var currentVector = new THREE.Vector3(AXIS_LENGTH, 0, 0);
    currentVector.applyQuaternion(currentQuat);
    meshTraceGeom.vertices.push(currentVector);
    lineTraceGeom.vertices.push(currentVector);
  }
  for (var i = 0; i <= TRACE_SEGMENTS; i++) {
    meshTraceGeom.faces.push(new THREE.Face3(0, i, i + 1));
  }

  meshTraceObject = new THREE.Mesh(meshTraceGeom, meshTraceMat);
  lineTraceObject = new THREE.Line(lineTraceGeom, lineTraceMat);
  //scene.add(meshTraceObject);
  //scene.add(lineTraceObject);
}

function initRotationAxis() {
  var axisMat = new THREE.LineBasicMaterial({
    color: 0xdddddd,
    linewidth: 2
  });
  var axisGeom = new THREE.Geometry();
  axisGeom.vertices.push(
    new THREE.Vector3().copy(rotationAxis).multiplyScalar(-AXIS_LENGTH)
  );
  axisGeom.vertices.push(
    new THREE.Vector3().copy(rotationAxis).multiplyScalar(AXIS_LENGTH)
  );
  rotationAxisObject = new THREE.Line(axisGeom, axisMat);
  scene.add(rotationAxisObject);
}

function onWindowResize() {
  rendererWidth = document.getElementById("renderDiv").clientWidth;
  rendererHeight = Math.min(
    document.getElementById("renderDiv").clientHeight,
    window.innerHeight * HEIGHT_FACTOR
  );
  renderer.setSize(rendererWidth, rendererHeight);
  camera.aspect = rendererWidth / rendererHeight;
  camera.updateProjectionMatrix();
}

function handleTouchMove(event) {
  if (objectDragged != "none") {
    event.preventDefault();
  }
  handlePointerMove(event.touches[0].clientX, event.touches[0].clientY);
}

function handleMouseMove(event) {
  handlePointerMove(event.clientX, event.clientY);
}

function handlePointerMove(x, y) {
  mouseDiffX = x - mousePos.x;
  mouseDiffY = y - mousePos.y;
  mousePos = {
    x: x,
    y: y
  };
  if (objectDragged == "scene") {
    cameraPos.x -= mouseDiffX / 200;
    cameraPos.y += mouseDiffY / 200;
    cameraPos.y = Math.min(cameraPos.y, 3.1415 / 2);
    cameraPos.y = Math.max(cameraPos.y, -3.1415 / 2);
    turnCamera();
  } else if (objectDragged.startsWith("slider")) {
    applyManualSliderChange();
  }
}

function turnCamera() {
  camera.position.x = Math.sin(cameraPos.x) * 1000 * Math.cos(cameraPos.y);
  camera.position.z = Math.cos(cameraPos.x) * 1000 * Math.cos(cameraPos.y);
  camera.position.y = Math.sin(cameraPos.y) * 1000;
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  //console.log(cameraPos.x + "  " + cameraPos.y);
}

function handleTouchStart(event) {
  handlePointerStart(event.touches[0].clientX, event.touches[0].clientY);
}

function handleMouseDown(event) {
  handlePointerStart(event.clientX, event.clientY);
}

function handlePointerStart(x, y) {
  mousePos = {
    x: x,
    y: y
  };
  var rect = renderer.domElement.getBoundingClientRect();
  if (
    mousePos.x >= rect.left &&
    mousePos.x <= rect.left + rendererWidth &&
    mousePos.y >= rect.top &&
    mousePos.y <= rect.top + rendererHeight &&
    objectDragged == "none"
  ) {
    objectDragged = "scene";
  }
}

function handleTouchEnd(event) {
  objectDragged = "none";
}

function handleMouseUp(event) {
  objectDragged = "none";
}

function updateAxesNames() {
  distance = AXIS_LENGTH * 1.1;
  vectors = [
    new THREE.Vector3(distance, 0, 0),
    new THREE.Vector3(0, distance, 0),
    new THREE.Vector3(0, 0, distance)
  ];
  objects = [axisXName, axisYName, axisZName];
  for (var i = 0; i < objects.length; i++) {
    position = toXYCoords(vectors[i], camera);
    objects[i].style.top = position.y + "px";
    objects[i].style.left = position.x + "px";
  }
}

function toXYCoords(pos) {
  var sitetop = window.pageYOffset || document.documentElement.scrollTop,
    siteleft = window.pageXOffset || document.documentElement.scrollLeft;
  var vector = pos.clone().project(camera);
  var rect = renderer.domElement.getBoundingClientRect();
  var vector2 = new THREE.Vector3(0, 0, 0);
  vector2.x =
    siteleft + rect.left + ((vector.x + 1) / 2) * (rect.right - rect.left);
  vector2.y =
    sitetop + rect.top + ((-vector.y + 1) / 2) * (rect.bottom - rect.top);
  //console.log(rect.top + "     -    " + (rect.bottom - rect.top))
  return vector2;
}

function updateRotationAxis() {
  var theta = Math.acos(vectorQuaternion.w) * 2;
  var sin = Math.sin(theta / 2);
  if (sin >= 0.01 || sin <= -0.01) {
    //console.log(quatY + "  "+ quatZ + "  "+ sin)
    rotationAxis.x = vectorQuaternion.x / sin;
    rotationAxis.y = vectorQuaternion.y / sin;
    rotationAxis.z = vectorQuaternion.z / sin;
    rotationAxis.normalize();
  }
}

function updateVectorVisuals() {
  vectorObject.quaternion.w = vectorQuaternion.w;
  vectorObject.quaternion.x = vectorQuaternion.x;
  vectorObject.quaternion.y = vectorQuaternion.y;
  vectorObject.quaternion.z = vectorQuaternion.z;

  // The following code section is about the traceline update
  // for (var i = 1; i <= TRACE_SEGMENTS + 1; i++) {
  //   var currentQuat = new THREE.Quaternion().slerp(
  //     vectorQuaternion,
  //     (i - 1) / TRACE_SEGMENTS
  //   );
  //   var currentVector = new THREE.Vector3(AXIS_LENGTH, 0, 0);
  //   currentVector.applyQuaternion(currentQuat);
  //   meshTraceObject.geometry.vertices[i].x = currentVector.x;
  //   meshTraceObject.geometry.vertices[i].y = currentVector.y;
  //   meshTraceObject.geometry.vertices[i].z = currentVector.z;
  //   lineTraceObject.geometry.vertices[i - 1].x = currentVector.x;
  //   lineTraceObject.geometry.vertices[i - 1].y = currentVector.y;
  //   lineTraceObject.geometry.vertices[i - 1].z = currentVector.z;
  // }
  // meshTraceObject.geometry.verticesNeedUpdate = true;
  // lineTraceObject.geometry.verticesNeedUpdate = true;

  var rotAxisVec = new THREE.Vector3()
    .copy(rotationAxis)
    .multiplyScalar(AXIS_LENGTH);
  rotationAxisObject.geometry.vertices[0].x = -rotAxisVec.x;
  rotationAxisObject.geometry.vertices[0].y = -rotAxisVec.y;
  rotationAxisObject.geometry.vertices[0].z = -rotAxisVec.z;
  rotationAxisObject.geometry.vertices[1].x = rotAxisVec.x;
  rotationAxisObject.geometry.vertices[1].y = rotAxisVec.y;
  rotationAxisObject.geometry.vertices[1].z = rotAxisVec.z;
  rotationAxisObject.geometry.verticesNeedUpdate = true;
}

function updateRotationInfo() {
  // updateRotationInfoQuaternion();

  var vectorEuler = new THREE.Euler(0, 0, 0, eulerOrder);
  vectorEuler.setFromQuaternion(vectorQuaternion, eulerOrder);
  // updateRotationInfoEuler(vectorEuler);
}
