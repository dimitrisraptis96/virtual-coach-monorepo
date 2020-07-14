var exercise = null;
const timer = new WorkoutTimer();

const DEBUG_MODE = false;
const CALIBRATION_STEPS = 100;
const CALIBRATION_DELAY = 30;
const IS_SAVE_ENABLED = true;

const BICEP_CURL = "0";
const LATERAL_EXTENSION = "1";
const ADDUCTOR_EXTENTION = "2";
const LEG_EXTENTION = "3";

var currentExerciseUUID = null;

var exerciseId = 0;
var weight = 1;
var height = 1;

var bodyPart,
  calibAxis,
  calculateThetaSteps,
  preCalibration,
  minTheta,
  rangeTheta;

var isWorkingOut = false;

var calibrationSamples = DEBUG_MODE ? samples : [];
var predictSamples = [];

const STATES = {
  INTRO: 0,
  CALIBRATION: 1,
  PROCESSING: 2,
  PREDICTION: 3,
  FINISH: 4,
  IDLE: 5,
};

var currentState = STATES.INTRO;

function getExerciseName(id) {
  switch (id) {
    case BICEP_CURL:
      return "Bicep Curl";
    case LATERAL_EXTENSION:
      return "Lateral Extension";
    case ADDUCTOR_EXTENTION:
      return "Adductor Extension";
    case LEG_EXTENTION:
      return "Leg Extension";
    default:
      return "Wrong Exercise";
      break;
  }
}

function updateQuaternion(x, y, z, w) {
  if (currentState === STATES.CALIBRATION) {
    calibrationSamples.push({ x, y, z, w });
  } else if (currentState === STATES.PREDICTION) {
    predict(x, y, z, w);
  }
}

function calibration() {
  preCalibration();

  for (let i = 0; i < CALIBRATION_STEPS; i++) {
    const delay = i * CALIBRATION_DELAY; //milliseconds
    const theta = calculateThetaSteps(i);

    setTimeout(() => {
      const forearm = main.model.b[bodyPart];
      const axis = calibAxis;
      const quaternion = new THREE.Quaternion();

      quaternion.setFromAxisAngle(axis, theta);
      forearm.setRotationFromQuaternion(quaternion);

      // THREE.SEA3D.AnimationHandler.update(0);
    }, delay);

    if (i === CALIBRATION_STEPS - 1) {
      setTimeout(startProcessing, delay + 1000);
    }
  }
}

function saveData() {
  if (currentExerciseUUID) {
    axios({
      method: "PUT",
      headers: { "content-type": "application/json" },
      data: JSON.stringify({
        samples: predictSamples,
        id: currentExerciseUUID,
        type: exerciseId,
        positions: exercisePositions,
        name: getExerciseName(exerciseId),
        duration: timer.getSeconds(),
        minTheta: minTheta,
        rangeTheta: rangeTheta,
        metrics: {
          reps: exercise.reps,
          energy: exercise.energy,
          calories: exercise.calories,
          power: exercise.power,
        },
      }),
      url: "/exercise",
    }).catch((error) => {
      console.log(error);
    });
  } else {
    axios({
      method: "POST",
      headers: { "content-type": "application/json" },
      url: "/exercise",
    })
      .then((res) => {
        currentExerciseUUID = res.data;

        axios({
          method: "PUT",
          headers: { "content-type": "application/json" },
          data: JSON.stringify({
            samples: predictSamples,
            name: getExerciseName(exerciseId),
            id: currentExerciseUUID,
            exercisePositions: exercisePositions,
            metrics: {
              reps: exercise.reps,
              energy: exercise.energy,
              calories: exercise.calories,
              power: exercise.power,
            },
          }),
          url: "/exercise",
        }).catch((error) => {
          console.log(error);
        });
      })
      .catch((error) => {
        console.log(error);
      });
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

    // if (IS_SAVE_ENABLED) saveData(calibrationSamples);

    //TODO: Start exercise
    resumeExercise();
    calibrationSamples = [];

    // TODO: Add the metrics panel here
    document.getElementById("upper-card").style.opacity = "1";
    document.getElementById("metrics").style.opacity = "1";
  }, 3000);
}

function finishExercise() {
  exercise.stop();
  saveData();
  // TODO: here show the end screen
}

function radToDegrees(angle) {
  return angle * (180 / Math.PI);
}

function predict(x, y, z, w) {
  const sample = { x, y, z, w };

  const fraction = predictPosition(sample);

  const theta = minTheta + rangeTheta * fraction;

  predictSamples.push({ x, y, z, w, theta });

  // console.log("Predicted theta: " + theta);

  // Update avatar
  const forearm = main.model.b[bodyPart];
  const axis = calibAxis;
  const quaternion = new THREE.Quaternion();
  quaternion.setFromAxisAngle(axis, theta);
  forearm.setRotationFromQuaternion(quaternion);

  THREE.SEA3D.AnimationHandler.update(0);

  // if (!exercise.getIsExercising()) {
  //   exercise.start();
  // }
  //   const degrees = Math.round(theta * (180 / Math.PI));
  exercise.update(theta, timer.getSeconds());
}

function pauseExercise() {
  const ctaButton = document.getElementById("cta-button");
  ctaButton.innerHTML = "Resume Workout!";
  ctaButton.style.backgroundColor = "#2705ad";

  currentState = STATES.IDLE;
  exercise.stop();
  timer.stop();
  isWorkingOut = !isWorkingOut;

  saveData();
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
    const forearm = main.model.b[bodyPart];
    // const debugHandAxes = new THREE.AxesHelper(20);
    // forearm.add(debugHandAxes);

    const axis = calibAxis;
    const quaternion = new THREE.Quaternion();
    quaternion.setFromAxisAngle(axis, 0);
    forearm.setRotationFromQuaternion(quaternion);
    THREE.SEA3D.AnimationHandler.update(0);

    // calibration();
  } else {
    //not ready
  }
}

function setupExercise() {
  const {
    name,
    partId,
    weightFraction,
    axis,
    calcTheta,
    prepare,
    min,
    max,
  } = loadMovement(exerciseId);

  bodyPart = partId;
  calibAxis = axis;
  calculateThetaSteps = calcTheta;
  preCalibration = prepare;

  minTheta = min;
  rangeTheta = Math.abs(max - min);

  const lowerBound = min + Math.round(0.2 * rangeTheta);
  const upperBound = min + Math.round(0.8 * rangeTheta);

  exercise = new Exercise(
    weight * weightFraction,
    height / 100,
    lowerBound,
    upperBound
  );
}

function setSceneColor(hexColor = 0x2705ad) {
  view.getScene().background = new THREE.Color(hexColor);
}

function intro() {
  setSceneColor(0x212121);
  // setSceneColor(0xffffff);
  if (DEBUG_MODE) {
    document.getElementById("debug-sign").style.display = "block";
  }
  THREE.SEA3D.AnimationHandler.update(0);

  setupExercise();
  const infoDialog = document.getElementById("vue-select-exercise");
  infoDialog.style.display = "none";

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
