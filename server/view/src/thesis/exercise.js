const MODE_BOTTOM_UP = 1;
const MODE_TOP_UP = 2;
const MODE_TOP_DOWN = 3;
const MODE_BOTTOM_DOWN = 4;

// const DEGREE_RANGE = 180;
// const LOWER_BOUND = Math.round(0.2 * DEGREE_RANGE);
// const UPPER_BOUND = Math.round(0.8 * DEGREE_RANGE);

// const BOUNDS = [LOWER_BOUND, UPPER_BOUND];
const MIN_DIST = 10;

const G = 9.8; // m/s^2;

const STATE = {
  IDLE: "IDLE",
  START_POINT: "START_POINT",
  MIDDLE_POINT: "MIDDLE_POINT",
  END_POINT: "END_POINT"
};
// const power = calories * reps / duration; // Watt

class Exercise {
  constructor(m /*kg*/, h /*m*/, lowerBound, upperBound) {
    this.duration = 0;
    this.isExercising = false;
    this.reps = 0;
    this.energy = 0;
    this.calories = 0;
    this.power = 0;
    this.mode = MODE_BOTTOM_UP;
    this.state = STATE.IDLE;
    this.previous = [];
    this.energyPerRep = m * G * h; //1323 Joule per rep
    this.caloriesPerRep = this.energyPerRep / 4184; // 0.31 kcal per rep

    this.bounds = [lowerBound, upperBound];
  }

  getReps() {
    return this.reps;
  }

  getMode() {
    return this.mode;
  }

  getIsExercising() {
    return this.isExercising;
  }

  getPrevious() {
    return this.previous;
  }

  start() {
    this.isExercising = true;
  }

  stop() {
    this.isExercising = false;
  }

  update(degree, seconds) {
    const { previous, mode, state } = this;
    this.duration = seconds;

    if (previous.length < 5) {
      previous.push(degree);
    } else {
      previous.push(degree);

      const sum = previous.reduce((a, b) => a + b, 0);
      const avg = sum / previous.length || 0;

      this.previous = [];
      this.findState(avg, state);
      // this.calculateMode(avg, mode);
    }
  }

  findState(avg, state) {
    const distancesFromBounds = this.bounds.map(bound =>
      Math.sqrt(Math.pow(avg - bound, 2))
    );
    const minDistance = Math.min(...distancesFromBounds);
    const posIndex = distancesFromBounds.indexOf(minDistance);

    // Add state as a progress spinner
    // document.getElementById("power").innerHTML = this.state;

    if (minDistance > MIN_DIST) {
      // The avg is not near a bound, keep going
      return;
    }

    // Here the avg is near a bound
    if (state === STATE.IDLE && posIndex === 0) {
      this.state = STATE.START_POINT;
    } else if (state === STATE.START_POINT && posIndex === 1) {
      this.state = STATE.MIDDLE_POINT;
    } else if (state === STATE.MIDDLE_POINT && posIndex === 0) {
      // One rep is completed
      this.state = STATE.IDLE;
      this.increaseReps();
    } else {
      //Keep going
      console.log("Possible never here, because of initial if");
    }
  }

  setMode(newMode) {
    this.mode = newMode;
    // document.getElementById("mode").innerHTML = this.mode + " mode";
  }

  increaseReps() {
    this.reps = this.reps + 1;
    this.power = ((this.caloriesPerRep * this.reps) / this.duration).toFixed(2);
    this.energy = (this.energyPerRep * this.reps).toFixed();
    this.calories = (this.caloriesPerRep * this.reps).toFixed(2);

    document.getElementById("power").innerHTML = this.power;
    document.getElementById("calories").innerHTML = this.calories;
    document.getElementById("energy").innerHTML = this.energy;
    document.getElementById("reps").innerHTML = this.reps;
  }

  decreaseReps() {
    this.reps = this.reps - 1;

    document.getElementById("reps").innerHTML = this.reps;
  }

  calculateMode(avg, mode) {
    // const min = Math.min(...this.previous);
    // const max = Math.max(...this.previous);
    // if (Math.abs(max - min) > 5) return;
    console.log(avg);
    const current = avg;

    switch (mode) {
      case MODE_BOTTOM_UP:
        if (current > 90) {
          this.setMode(MODE_TOP_UP);
        }
        break;
      case MODE_TOP_UP:
        if (current > 170) {
          this.setMode(MODE_TOP_DOWN);
          // this.increaseReps();
        } else if (current < 90) {
          this.setMode(MODE_BOTTOM_UP);
        }
        break;
      case MODE_TOP_DOWN:
        if (current < 90) {
          this.setMode(MODE_BOTTOM_DOWN);
        }
        break;
      case MODE_BOTTOM_DOWN:
        if (current < 10) {
          this.setMode(MODE_BOTTOM_UP);
          this.increaseReps();
        }
        break;

      default:
        console.log("WRONG MODE");
    }
  }
}
