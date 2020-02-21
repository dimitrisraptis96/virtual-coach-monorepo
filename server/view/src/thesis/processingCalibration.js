const WINDOW = 20;
const FACTOR = 10;
const MIN = 0.2;
const POINTS_BETWEEN = 20;

var startingPoint = 0,
  endingPoint = 0;
var exercisePositions = [];
var hasFound = false;

function mean(arr) {
  return sum(arr) / arr.length;
}

function sum(arr) {
  var sum = 0;
  var i = arr.length;
  while (--i >= 0) sum += arr[i];
  return sum;
}

function processCalibration(jsonData) {
  const size = jsonData.length;
  console.log(size);

  const samples = array2object(jsonData); // samples = {x: [...], y: [...], z: [...], w: [...],}

  const dist = [];
  for (let i = 0; i < Math.ceil(size / WINDOW); i++) {
    const windowSamples = {
      x: samples.x.slice(i * WINDOW, (i + 1) * WINDOW),
      y: samples.y.slice(i * WINDOW, (i + 1) * WINDOW),
      z: samples.z.slice(i * WINDOW, (i + 1) * WINDOW),
      w: samples.w.slice(i * WINDOW, (i + 1) * WINDOW)
    };

    const windowMean = {
      x: mean(windowSamples.x),
      y: mean(windowSamples.y),
      z: mean(windowSamples.z),
      w: mean(windowSamples.w)
    };

    for (let j = 0; j < WINDOW; j++) {
      const sample = {
        x: samples.x[i * WINDOW + j],
        y: samples.y[i * WINDOW + j],
        z: samples.z[i * WINDOW + j],
        w: samples.w[i * WINDOW + j]
      };
      const distance = calculateDistance(sample, windowMean);
      if (distance) {
        dist.push(distance);
        if (distance > MIN && !hasFound) {
          hasFound = true;
          startingPoint = i * WINDOW + j;
        }
      }
    }
  }

  findEndingPoint(dist);

  console.log(`[START]: IDLE until sample No.${startingPoint}`);
  console.log(`[FINISH]: IDLE after sample No.${endingPoint}`);

  // Calculate the fixed exercise positions
  const samplesInOneRep = jsonData.slice(startingPoint, endingPoint);

  const range = endingPoint - startingPoint;
  const step = Math.floor(range / POINTS_BETWEEN);

  console.log(`[STEP]: Positions use the step=${step}`);

  exercisePositions = Array.from(Array(POINTS_BETWEEN).keys());

  exercisePositions.forEach((value, index) => {
    exercisePositions[index] = samplesInOneRep[index * step];
  });

  // Should be 0
  //   const testingPoint = jsonData[1000];
  //   const posIndex = predictPosition(positions, testingPoint);
  //   console.log(`[POSITION]: Predicted position index: ${posIndex}`);
}

function predictPosition(testingPoint) {
  const distancesFromPositions = exercisePositions.map(pos =>
    calculateDistance(pos, testingPoint)
  );
  const minDistance = Math.min(...distancesFromPositions);
  const posIndex = distancesFromPositions.indexOf(minDistance);
  const theta = (Math.PI * posIndex) / POINTS_BETWEEN;
  return theta;
}

function findEndingPoint(array) {
  for (let i = array.length - 1; i > -1; i--) {
    if (array[i] > MIN) {
      endingPoint = i;
      break;
    }
  }
}

function calculateDistance(point1, point2) {
  return Math.sqrt(
    Math.pow(point1.x - point2.x, 2) +
      Math.pow(point1.y - point2.y, 2) +
      Math.pow(point1.z - point2.z, 2) +
      Math.pow(point1.w - point2.w, 2)
  );
}

function array2object(input) {
  const axes = Object.keys(input[0]);
  const output = {};
  // Initialize output array
  axes.forEach(axis => {
    output[axis] = [];
  });

  input.forEach(sample => {
    axes.forEach(axis => {
      output[axis].push(sample[axis] * FACTOR);
    });
  });

  return output;
}
