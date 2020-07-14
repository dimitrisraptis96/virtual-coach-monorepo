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

var exerciseId = BICEP_CURL;
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
      return "Adductor Extension";
    default:
      return "Wrong Exercise";
      break;
  }
}

function radToDegrees(angle) {
  return angle * (180 / Math.PI);
}

function predict(sample) {
  console.log(sample);

  const fraction = predictPosition(sample);

  const theta = minTheta + rangeTheta * fraction;

  const forearm = main.model.b[bodyPart];
  const axis = calibAxis;
  const quaternion = new THREE.Quaternion();
  quaternion.setFromAxisAngle(axis, theta);
  forearm.setRotationFromQuaternion(quaternion);

  THREE.SEA3D.AnimationHandler.update(0);
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

function setup() {
  setSceneColor(0xffffff);
  THREE.SEA3D.AnimationHandler.update(0);

  setupExercise();
  initSession();
  preCalibration();
}

function handleIframeMessaging(e) {
  const data = JSON.parse(e.data);

  switch (data.type) {
    case "init":
      exerciseId = data.exerciseId;
      exercisePositions = data.positions;
      setTimeout(setup, 2000);

      break;
    case "predict":
      predict(data.sample);
      break;
    default:
  }
}

if (window.addEventListener) {
  window.addEventListener("message", handleIframeMessaging, false);
} else {
  window.attachEvent("onmessage", handleIframeMessaging);
}
