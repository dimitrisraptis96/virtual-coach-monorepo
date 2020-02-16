const MODE_BOTTOM_UP = 1;
const MODE_TOP_UP = 2;
const MODE_TOP_DOWN = 3;
const MODE_BOTTOM_DOWN = 4;

class Exercise {
  constructor() {
    this.isExercising = false;
    this.reps = 0;
    this.mode = MODE_BOTTOM_UP;
    this.previous = [];
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

  update(degree) {
    const { previous, mode } = this;

    if (previous.length < 5) {
      previous.push(degree);
    } else {
      previous.push(degree);

      const sum = previous.reduce((a, b) => a + b, 0);
      const avg = sum / previous.length || 0;

      this.previous = [];
      this.calculateMode(avg, mode);
    }
  }

  setMode(newMode) {
    this.mode = newMode;
    document.getElementById("mode").innerHTML = this.mode + " mode";
  }

  increaseReps() {
    this.reps = this.reps + 1;

    document.getElementById("reps").innerHTML = this.reps + " reps";
  }

  decreaseReps() {
    this.reps = this.reps - 1;

    document.getElementById("reps").innerHTML = this.reps + " reps";
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
