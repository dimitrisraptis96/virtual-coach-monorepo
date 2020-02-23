class WorkoutTimer {
  constructor() {
    this.offset = null;
    this.intervalId = null;
    this.clock = 0;
  }

  _secToHHMM(sec) {
    var d = new Date();
    d.setHours(0);
    d.setMinutes(0);
    d.setSeconds(0);
    d = new Date(d.getTime() + sec * 1000);
    return d.toLocaleString("en-GB").split(" ")[1];
  }

  start() {
    this.offset = Date.now();
    this.intervalId = setInterval(() => {
      var now = Date.now();
      var delta = now - this.offset;
      this.offset = now;

      this.clock = this.clock + delta;

      document.getElementById("time").innerHTML = this._secToHHMM(
        Math.floor(this.clock / 1000)
      ); // in seconds
    }, 1000);
  }

  stop() {
    clearInterval(this.intervalId);
  }
}
