function loadMovement(id) {
  switch (id) {
    case BICEP_CURL:
      return movements[BICEP_CURL];

    case LATERAL_EXTENSION:
      return movements[LATERAL_EXTENSION];

    case ADDUCTOR_EXTENTION:
      return movements[ADDUCTOR_EXTENTION];

    case LEG_EXTENTION:
      return movements[LEG_EXTENTION];

    default:
      return movements[BICEP_CURL];
  }
}

// Percentages of Total Body Weight: https://exrx.net/Kinesiology/Segments
const movements = [
  {
    name: "Bicep Curls",
    partId: "lForeArm",
    weightFraction: 2.295,
    min: 0,
    max: 0.9 * Math.PI,
    axis: new THREE.Vector3(0, 1, 0),
    calcTheta: i => 0.9 * Math.PI * (i / CALIBRATION_STEPS),
    prepare: () => {}
  },
  {
    name: "Lateral Extensions",
    partId: "lShldr",
    weightFraction: 5.335,
    min: -Math.PI / 3,
    max: 0,
    axis: new THREE.Vector3(0, 0, 1),
    calcTheta: i => (Math.PI / 3) * (i / CALIBRATION_STEPS) - Math.PI / 3,
    prepare: () => {}
  },
  {
    name: "Adductor Extension",
    partId: "rThigh",
    weightFraction: 17.555,
    min: Math.PI,
    max: (4 * Math.PI) / 3,
    axis: new THREE.Vector3(0, 0, 1),
    calcTheta: i => Math.PI + (Math.PI / 3) * (i / CALIBRATION_STEPS),
    prepare: () => {}
  },
  {
    name: "Leg Extension",
    partId: "rShin",
    weightFraction: 6.43,
    min: 0,
    max: Math.PI / 2,
    axis: new THREE.Vector3(0, 1, 0),
    calcTheta: i => (Math.PI / 2) * (i / CALIBRATION_STEPS),
    prepare: () => {
      main.model.b["rThigh"].rotateOnAxis(
        new THREE.Vector3(0, 1, 0),
        -Math.PI / 2
      );
      main.model.b["lThigh"].rotateOnAxis(
        new THREE.Vector3(0, 1, 0),
        -Math.PI / 2
      );
      main.model.b["lShin"].rotateOnAxis(
        new THREE.Vector3(0, 1, 0),
        Math.PI / 2
      );
    }
  }
];
