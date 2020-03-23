const setupVue = () => {
  Vue.component("exercise-option", {
    props: ["exercise"],
    template: `
        <div>
            {{ exercise.name }}
        </div>
    `
  });

  var app = new Vue({
    el: "#vue-select-exercise",
    data: {
      exerciseId: BICEP_CURL,
      weight: 75,
      height: 180,
      exerciseList: [
        {
          id: BICEP_CURL,
          name: "Bicep Curls",
          icon: `<svg><rectangle width="10" height="10" fill="red"/></svg>`
        },
        {
          id: LATERAL_EXTENSION,
          name: "Lateral Extensions",
          icon: `<svg><rectangle width="10" height="10" fill="blue"/></svg>`
        },
        {
          id: ADDUCTOR_EXTENTION,
          name: "Adductor Extensions",
          icon: `<svg><rectangle width="10" height="10" fill="green"/></svg>`
        },
        {
          id: LEG_EXTENTION,
          name: "Leg Extensions",
          icon: `<svg><rectangle width="10" height="10" fill="green"/></svg>`
        }
      ]
    },
    methods: {
      setExerciseId(id) {
        console.log(id);
        this.exerciseId = id;
      },
      saveInfo() {
        weight = this.weight;
        height = this.height;
        exerciseId = this.exerciseId;

        intro();
      }
    }
  });
};

// setTimeout(setupVue, 1000);
setupVue();
