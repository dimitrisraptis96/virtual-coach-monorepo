var IMUquaternion = new THREE.Quaternion();
var rotationAxis = new THREE.Vector3(0, 1, 0);
const exercise = new Exercise();
const timer = new WorkoutTimer();

const DEBUG_MODE = false;
const CALIBRATION_STEPS = 100;
const CALIBRATION_DELAY = 30;
const IS_SAVE_ENABLED = false;

var isWorkingOut = false;

var calibrationSamples = DEBUG_MODE ? samples : [];

const STATES = {
  INTRO: 0,
  CALIBRATION: 1,
  PROCESSING: 2,
  PREDICTION: 3,
  FINISH: 4,
  IDLE: 5
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
  for (let i = 0; i < CALIBRATION_STEPS; i++) {
    const delay = i * CALIBRATION_DELAY; //milliseconds
    const theta = 0.9 * Math.PI * (i / CALIBRATION_STEPS);

    setTimeout(() => {
      const forearm = main.model.b["lForeArm"];
      const axis = new THREE.Vector3(0, 1, 0);
      const quaternion = new THREE.Quaternion();
      quaternion.setFromAxisAngle(axis, theta);
      forearm.setRotationFromQuaternion(quaternion);

      THREE.SEA3D.AnimationHandler.update(0);
    }, delay);

    if (i === CALIBRATION_STEPS - 1) {
      setTimeout(startProcessing, delay + 1000);
    }
  }
}

function saveData(samples) {
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
        data: JSON.stringify({
          samples: samples,
          name: "calib",
          id: id
        }),
        url: "/exercise"
      }).catch(error => {
        console.log(error);
      });
    })
    .catch(error => {
      console.log(error);
    });
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

    if (IS_SAVE_ENABLED) saveData(calibrationSamples);

    resumeExercise();
    calibrationSamples = [];
    //TODO: Start exercise

    // TODO: Add the metrics panel here
    document.getElementById("reps").style.opacity = "1";
    document.getElementById("metrics").style.opacity = "1";
  }, 3000);
}

function finishExercise() {
  exercise.stop();
  // TODO: here show the end screen
}

function predict(x, y, z, w) {
  const sample = { x, y, z, w };
  console.log(sample);

  const theta = predictPosition(sample);

  // console.log("Predicted theta: " + theta);

  // Update avatar
  const forearm = main.model.b["lForeArm"];
  const axis = new THREE.Vector3(0, 1, 0);
  const quaternion = new THREE.Quaternion();
  quaternion.setFromAxisAngle(axis, theta);
  forearm.setRotationFromQuaternion(quaternion);

  THREE.SEA3D.AnimationHandler.update(0);

  // if (!exercise.getIsExercising()) {
  //   exercise.start();
  // }
  //   const degrees = Math.round(theta * (180 / Math.PI));
  exercise.update(theta);
}

function pauseExercise() {
  const ctaButton = document.getElementById("cta-button");
  ctaButton.innerHTML = "Resume Workout!";
  ctaButton.style.backgroundColor = "#2705ad";

  currentState = STATES.IDLE;
  exercise.stop();
  timer.stop();
  isWorkingOut = !isWorkingOut;
}

function resumeExercise() {
  const ctaButton = document.getElementById("cta-button");
  ctaButton.innerHTML = "Pause Exercise";
  ctaButton.style.backgroundColor = "red";

  currentState = STATES.PREDICTION;
  timer.start();
  exercise.start();
  isWorkingOut = !isWorkingOut;
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
    setupButton("cta-button", () => {
      if (isWorkingOut) {
        pauseExercise();
      } else {
        resumeExercise();
      }
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

setTimeout(initSession, 2000);
