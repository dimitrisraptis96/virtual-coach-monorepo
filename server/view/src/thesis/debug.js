var axis = new THREE.Vector3(0, 1, 0);
var theta = Math.PI / 2;

rotate(axis, theta);

function rotate(worldAxis, angle) {
  var part = "rThigh";
  var body = main.model.b[part];

  var worldToLocal = new THREE.Matrix4().getInverse(
    main.model.b["root"].matrixWorld
  );
  var localAxis = worldAxis.applyMatrix4(worldToLocal);

  var adjustQuaternion = new THREE.Quaternion();
  adjustQuaternion.setFromAxisAngle(localAxis, angle);
  body.setRotationFromQuaternion(adjustQuaternion);

  var debugHandAxes = new THREE.AxesHelper(20);
  body.add(debugHandAxes);
}

// main.model.b["rThigh"].rotateOnAxis(new THREE.Vector3(0,0,1), Math.PI/4);
// main.model.b["rThigh"].rotateOnAxis(new THREE.Vector3(0,1,0), -Math.PI/2);
// main.model.b["lThigh"].rotateOnAxis(new THREE.Vector3(0,1,0), -Math.PI/2);
