var IMUquaternion = new THREE.Quaternion();
var rotationAxis = new THREE.Vector3(0, 1, 0);
const exercise = new Exercise();
var DEBUG_MODE = false;

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
  data.push({
    x: parseFloat(x),
    y: parseFloat(y),
    z: parseFloat(z),
    w: parseFloat(w)
  });

  if (!exercise.getIsExercising()) {
    exercise.start();
  }
  // This is the pure Quaternion sampled from the IMU
  IMUquaternion.set(parseFloat(x), parseFloat(y), parseFloat(z), parseFloat(w));

  if (main.model) {
    const forearm = main.model.b["lForeArm"];
    var debugHandAxes = new THREE.AxesHelper(20);
    forearm.add(debugHandAxes);

    const { theta, rotationAxis } = getRotationAxisAndTheta(IMUquaternion);
    const worldAxis = new THREE.Vector3(
      rotationAxis.y,
      rotationAxis.x,
      rotationAxis.z
    );

    // 💪 https://aframe.io/docs/0.8.0/introduction/developing-with-threejs.html#transforming-between-coordinate-spaces
    const worldToLocal = new THREE.Matrix4().getInverse(
      main.model.b["root"].matrixWorld
    );
    const localAxis = worldAxis.applyMatrix4(worldToLocal);

    const adjustQuaternion = new THREE.Quaternion();
    adjustQuaternion.setFromAxisAngle(localAxis, theta);

    forearm.setRotationFromQuaternion(adjustQuaternion);

    console.log(worldAxis);

    const degrees = Math.round(theta * (180 / Math.PI));
    // document.getElementById("calories").innerHTML = degrees;

    // if (
    //   Math.abs(worldAxis.y) > 0.7 &&
    //   Math.abs(worldAxis.x) < 0.3 &&
    //   Math.abs(worldAxis.z) < 0.3
    // ) {
    //   const degrees = theta * (180 / Math.PI);
    exercise.update(degrees);
    // console.log(exercise.getReps(), exercise.getMode(), degrees);
    // hideErrorOverlay();
    // } else {
    // displayErrorOverlay();
    // }
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

setupButton();

if (DEBUG_MODE) {
  function run() {
    for (var i = 1; i < samples.length; i++) {
      const { x, y, z, w } = samples[i];
      setTimeout(() => updateQuaternion(x, y, z, w), i * 10);
    }
  }
  setTimeout(run, 2000);
} else {
  setTimeout(initSession, 2000);
}

function displayErrorOverlay() {
  document.getElementById("overlay").style.backgroundColor =
    "rgba(255, 0, 0, 0.5)";
  document.getElementById("overlay").style.zIndex = "2";
  document.getElementById("overlay").style.position = "absolute";
  document.getElementById("overlay").style.width = "100%";
  document.getElementById("overlay").style.height = "100%";
}

function hideErrorOverlay() {
  document.getElementById("overlay").style.backgroundColor = "rgba(0, 0, 0, 0)";
  document.getElementById("overlay").style.zIndex = "2";
  document.getElementById("overlay").style.position = "absolute";
  document.getElementById("overlay").style.width = "100%";
  document.getElementById("overlay").style.height = "100%";
}

var startData = [],
  endData = [],
  data = [];

const yWorldAxis = new THREE.Vector3(0, 1, 0);

function firstPosition(x, y, z, w) {
  // This is the pure Quaternion sampled from the IMU
  IMUquaternion.set(parseFloat(x), parseFloat(y), parseFloat(z), parseFloat(w));

  if (main.model) {
    const root = main.model.b["root"];
    var debugHandAxes = new THREE.AxesHelper(20);
    root.add(debugHandAxes);

    const { theta, rotationAxis } = getRotationAxisAndTheta(IMUquaternion);

    root.rotateOnWorldAxis(yWorldAxis, theta);
  }

  THREE.SEA3D.AnimationHandler.update(0);
  startData.push({
    x: parseFloat(x),
    y: parseFloat(y),
    z: parseFloat(z),
    w: parseFloat(w)
  });
}

function endPosition(x, y, z, w) {
  endData.push({
    x: parseFloat(x),
    y: parseFloat(y),
    z: parseFloat(z),
    w: parseFloat(w)
  });
}

function saveData() {
  axios({
    method: "POST",
    headers: { "content-type": "application/json" },
    url: "/exercise"
  })
    .then(res => {
      const id = res.data;

      axios({
        method: "PUT",
        headers: { "content-type": "application/json" },
        data: JSON.stringify({ samples: data, name: "Testing", id: id }),
        url: "/exercise"
      }).catch(error => {
        console.log(error);
      });
    })
    .catch(error => {
      console.log(error);
    });
}

// function saveData() {
//   axios({s
//     method: "PUT",
//     headers: { "content-type": "application/json" },
//     data: JSON.stringify({ start: startData, end: endData }),
//     url: "/calibration"
//   });
// }

function cleanClient() {
  startData = [];
  endData = [];
  data = [];

  console.log("cleanClient is fired");
}

var offset = null;
var intervalId = null;
var clock = 0;

function startTimer() {
  offset = Date.now();
  intervalId = setInterval(() => {
    var now = Date.now();
    var delta = now - offset;
    offset = now;

    clock = clock + delta;

    document.getElementById("time").innerHTML = secToHHMM(
      Math.floor(clock / 1000)
    ); // in seconds
    // alternatively just show wall clock time:
    // output(new Date().toUTCString());
  }, 1000); // update about every second
}

function secToHHMM(sec) {
  var d = new Date();
  d.setHours(0);
  d.setMinutes(0);
  d.setSeconds(0);
  d = new Date(d.getTime() + sec * 1000);
  return d.toLocaleString("en-GB").split(" ")[1];
}

function stopTimer() {
  clearInterval(intervalId);
}

var hasStarted = false;

function setupButton() {
  const ctaButton = document.getElementById("cta-button");
  if (ctaButton) {
    ctaButton.addEventListener(
      "click",
      function() {
        console.log("here");

        if (hasStarted) {
          ctaButton.innerHTML = "Start Now!";
          stopTimer();
          hasStarted = !hasStarted;
        } else {
          ctaButton.innerHTML = "Stop Exercise";
          startTimer();
          hasStarted = !hasStarted;
        }
      },
      false
    );
  } else {
    setTimeout(setupButton, 200);
  }
}
