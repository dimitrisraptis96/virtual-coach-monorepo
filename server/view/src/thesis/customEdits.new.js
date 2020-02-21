var IMUquaternion = new THREE.Quaternion();
var rotationAxis = new THREE.Vector3(0, 1, 0);
const exercise = new Exercise();
var DEBUG_MODE = false;

var calibrationSamples = samples;

const STATES = {
  INTRO: 0,
  CALIBRATION: 1,
  PROCESSING: 2,
  PREDICTION: 3,
  FINISH: 4
};

var currentState = STATES.INTRO;

function updateQuaternion(x, y, z, w) {
  if (currentState === STATES.CALIBRATION) {
    calibrationSamples.push({ x, y, z, w });
  } else if (currentState === STATES.PREDICTION) {
    predict(x, y, z, w);
  }
}

function calibration() {
  const steps = 20;

  for (let i = 0; i < steps; i++) {
    const delay = i * 100; //milliseconds
    const theta = 0.9 * Math.PI * (i / steps);

    setTimeout(() => {
      const forearm = main.model.b["lForeArm"];
      const axis = new THREE.Vector3(0, 1, 0);
      const quaternion = new THREE.Quaternion();
      quaternion.setFromAxisAngle(axis, theta);
      forearm.setRotationFromQuaternion(quaternion);

      THREE.SEA3D.AnimationHandler.update(0);
    }, delay);

    if (i === steps - 1) {
      setTimeout(startProcessing, delay + 1000);
    }
  }
}

function startProcessing() {
  currentState = STATES.PROCESSING;
  processCalibration(calibrationSamples);

  document.getElementById("countdown").style.opacity = "1";

  setTimeout(() => {
    document.getElementById("countdown-text").innerHTML = "2";
  }, 1000);
  setTimeout(() => {
    document.getElementById("countdown-text").innerHTML = "1";
  }, 2000);
  setTimeout(() => {
    document.getElementById("countdown").style.opacity = "0";
    currentState = STATES.PREDICTION;
    calibrationSamples = [];
    // TODO: Add the metrics panel here
  }, 3000);
}

function finishExercise() {
  // TODO: here show the end screen
}

function predict(x, y, z, w) {
  const sample = { x, y, z, w };
  console.log(sample);

  const theta = predictPosition(sample);
  console.log("Predicted position: " + theta);

  // Update avatar
  const forearm = main.model.b["lForeArm"];
  const axis = new THREE.Vector3(0, 1, 0);
  const quaternion = new THREE.Quaternion();
  quaternion.setFromAxisAngle(axis, 0);
  forearm.setRotationFromQuaternion(quaternion);

  THREE.SEA3D.AnimationHandler.update(0);

  // if (!exercise.getIsExercising()) {
  //   exercise.start();
  // }
  //   const degrees = Math.round(theta * (180 / Math.PI));
  // exercise.update(degrees);
}

function initSession() {
  if (main.model) {
    const forearm = main.model.b["lForeArm"];
    // const debugHandAxes = new THREE.AxesHelper(20);
    // forearm.add(debugHandAxes);

    const axis = new THREE.Vector3(0, 1, 0);
    const quaternion = new THREE.Quaternion();
    quaternion.setFromAxisAngle(axis, 0);
    forearm.setRotationFromQuaternion(quaternion);

    THREE.SEA3D.AnimationHandler.update(0);

    // calibration();
    intro();
  } else {
    //not ready
  }
}

function intro() {
  const popup = document.getElementById("intro");

  if (popup !== undefined) {
    popup.style.opacity = "1";
    setupButton("calib-button", () => {
      currentState = STATES.CALIBRATION;

      document.getElementById("intro").style.opacity = "0";
      setTimeout(calibration, 500);
    });
  } else {
    setTimeout(intro, 200);
  }
}

function setupButton(id, callback) {
  const ctaButton = document.getElementById(id);
  if (ctaButton) {
    ctaButton.addEventListener("click", callback, false);
  } else {
    setTimeout(setupButton, 200);
  }
}

setTimeout(initSession, 3000);

// setupButton();

// if (DEBUG_MODE) {
//   function run() {
//     for (var i = 1; i < samples.length; i++) {
//       const { x, y, z, w } = samples[i];
//       setTimeout(() => updateQuaternion(x, y, z, w), i * 10);
//     }
//   }
//   setTimeout(run, 2000);
// } else {
//   setTimeout(initSession, 2000);
// }

// function displayErrorOverlay() {
//   document.getElementById("overlay").style.backgroundColor =
//     "rgba(255, 0, 0, 0.5)";
//   document.getElementById("overlay").style.zIndex = "2";
//   document.getElementById("overlay").style.position = "absolute";
//   document.getElementById("overlay").style.width = "100%";
//   document.getElementById("overlay").style.height = "100%";
// }

// function hideErrorOverlay() {
//   document.getElementById("overlay").style.backgroundColor = "rgba(0, 0, 0, 0)";
//   document.getElementById("overlay").style.zIndex = "2";
//   document.getElementById("overlay").style.position = "absolute";
//   document.getElementById("overlay").style.width = "100%";
//   document.getElementById("overlay").style.height = "100%";
// }

// var startData = [],
//   endData = [],
//   data = [];

// const yWorldAxis = new THREE.Vector3(0, 1, 0);

// function firstPosition(x, y, z, w) {
//   // This is the pure Quaternion sampled from the IMU
//   IMUquaternion.set(parseFloat(x), parseFloat(y), parseFloat(z), parseFloat(w));

//   if (main.model) {
//     const root = main.model.b["root"];
//     var debugHandAxes = new THREE.AxesHelper(20);
//     root.add(debugHandAxes);

//     const { theta, rotationAxis } = getRotationAxisAndTheta(IMUquaternion);

//     root.rotateOnWorldAxis(yWorldAxis, theta);
//   }

//   THREE.SEA3D.AnimationHandler.update(0);
//   startData.push({
//     x: parseFloat(x),
//     y: parseFloat(y),
//     z: parseFloat(z),
//     w: parseFloat(w)
//   });
// }

// function endPosition(x, y, z, w) {
//   endData.push({
//     x: parseFloat(x),
//     y: parseFloat(y),
//     z: parseFloat(z),
//     w: parseFloat(w)
//   });
// }

// function saveData() {
//   axios({
//     method: "POST",
//     headers: { "content-type": "application/json" },
//     url: "/exercise"
//   })
//     .then(res => {
//       const id = res.data;

//       axios({
//         method: "PUT",
//         headers: { "content-type": "application/json" },
//         data: JSON.stringify({ samples: data, name: "Testing", id: id }),
//         url: "/exercise"
//       }).catch(error => {
//         console.log(error);
//       });
//     })
//     .catch(error => {
//       console.log(error);
//     });
// }

// // function saveData() {
// //   axios({s
// //     method: "PUT",
// //     headers: { "content-type": "application/json" },
// //     data: JSON.stringify({ start: startData, end: endData }),
// //     url: "/calibration"
// //   });
// // }

// function cleanClient() {
//   startData = [];
//   endData = [];
//   data = [];

//   console.log("cleanClient is fired");
// }

// var offset = null;
// var intervalId = null;
// var clock = 0;

// function startTimer() {
//   offset = Date.now();
//   intervalId = setInterval(() => {
//     var now = Date.now();
//     var delta = now - offset;
//     offset = now;

//     clock = clock + delta;

//     document.getElementById("time").innerHTML = secToHHMM(
//       Math.floor(clock / 1000)
//     ); // in seconds
//     // alternatively just show wall clock time:
//     // output(new Date().toUTCString());
//   }, 1000); // update about every second
// }

// function secToHHMM(sec) {
//   var d = new Date();
//   d.setHours(0);
//   d.setMinutes(0);
//   d.setSeconds(0);
//   d = new Date(d.getTime() + sec * 1000);
//   return d.toLocaleString("en-GB").split(" ")[1];
// }

// function stopTimer() {
//   clearInterval(intervalId);
// }

// var hasStarted = false;

// function setupButton() {
//   const ctaButton = document.getElementById("cta-button");
//   if (ctaButton) {
//     ctaButton.addEventListener(
//       "click",
//       function() {
//         console.log("here");

//         if (hasStarted) {
//           ctaButton.innerHTML = "Start Now!";
//           stopTimer();
//           hasStarted = !hasStarted;
//         } else {
//           ctaButton.innerHTML = "Stop Exercise";
//           startTimer();
//           hasStarted = !hasStarted;
//         }
//       },
//       false
//     );
//   } else {
//     setTimeout(setupButton, 200);
//   }
// }
