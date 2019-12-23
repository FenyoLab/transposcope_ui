<template>
  <div class="home">
    <div
      class="box"
      style="height: 100%"
    >
      <div class="select">
        <select>
          <option> A </option>
          <option> B </option>
        </select>
      </div>
      <!-- <div class="select">
        <select
          v-model='outer'
          lazy
        >
          <option
            v-for="(child, key, idx) in samples"
            :key="idx"
          > {{key}} </option>
        </select>
      </div>
      <div
        class="select is-multiple"
        v-if="outer"
      >
        <select
          v-model='inner'
          lazy
        >
          <option
            v-for="(child, key, idx) in samples[outer]"
            :key="idx"
          > {{key}} </option>
        </select>
      </div>
      <div
        class="select"
        v-if="inner"
      >
        <select
          v-model='experiment'
          lazy
        >
          <option
            v-for="(child, key, idx) in samples[outer][inner]"
            :key="idx"
          > {{key}} </option>
        </select>
      </div>
      {{ this.outer + "/" + this.inner + "/" + this.experiment}} -->
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
const axios = require("axios");

export default {
  name: "home",
  data: function() {
    return {
      samples: {},
      outer: "",
      inner: "",
      experiment: ""
    };
  },
  mounted() {
    axios
      .get(process.env.BASE_URL + `data/manifest.json`)
      .then(response => {
        console.log(response.data);
        this.samples = response.data;
      })
      .catch(function(error) {
        console.error(error);
      })
      .finally(function() {});
  }
  // computed: {
  //   innerGroup: function() {
  //     return this.samples[this.outer];
  //   },
  //   experimentGroup: function() {
  //     return this.samples[this.outer][this.inner];
  //   }
  // }
};
</script>
