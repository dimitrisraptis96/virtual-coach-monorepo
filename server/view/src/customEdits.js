var IMUquaternion = new THREE.Quaternion();
var rotationAxis = new THREE.Vector3(0, 1, 0);
var DEBUG_MODE = true;

function getRotationAxisAndTheta(quaternion) {
  var rotationAxis = new THREE.Vector3(0, 1, 0);
  var theta = Math.acos(quaternion.w) * 2;
  var sin = Math.sin(theta / 2);
  if (sin >= 0.01 || sin <= -0.01) {
    rotationAxis.x = quaternion.x / sin;
    rotationAxis.y = quaternion.y / sin;
    rotationAxis.z = quaternion.z / sin;
    rotationAxis.normalize();
    return { rotationAxis, theta };
  } else {
    // Maybe handle this situation too
    return null;
  }
}

function updateQuaternion(x, y, z, w) {
  // This is the pure Quaternion sampled from the IMU
  IMUquaternion.set(parseFloat(z), parseFloat(y), parseFloat(x), parseFloat(w));

  if (main.model) {
    const forearm = main.model.b["lForeArm"];
    var debugHandAxes = new THREE.AxesHelper(20);
    forearm.add(debugHandAxes);

    const { theta, rotationAxis } = getRotationAxisAndTheta(IMUquaternion);
    const worldAxis = new THREE.Vector3(
      rotationAxis.y,
      rotationAxis.z,
      rotationAxis.x
    );

    // 💪 https://aframe.io/docs/0.8.0/introduction/developing-with-threejs.html#transforming-between-coordinate-spaces
    const worldToLocal = new THREE.Matrix4().getInverse(
      main.model.b["root"].matrixWorld
    );
    const localAxis = worldAxis.applyMatrix4(worldToLocal);

    const adjustQuaternion = new THREE.Quaternion();
    adjustQuaternion.setFromAxisAngle(localAxis, theta);

    forearm.setRotationFromQuaternion(adjustQuaternion);
  }

  THREE.SEA3D.AnimationHandler.update(0);
}

function initSession() {
  THREE.SEA3D.AnimationHandler.update(0);
  if (main.model) {
    const forearm = main.model.b["lForeArm"];
    var debugHandAxes = new THREE.AxesHelper(20);
    forearm.add(debugHandAxes);
  }
}

if (DEBUG_MODE) {
  function run() {
    for (var i = 1; i < samples.length; i++) {
      const { x, y, z, w } = samples[i];
      setTimeout(() => updateQuaternion(x, y, z, w), i * 5);
    }
  }
  setTimeout(run, 2000);
} else {
  setTimeout(initSession, 2000);
}
