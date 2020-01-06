<template>
  <div class="home">
    <div class="box" style="height: 100%">
      <!-- <div class="select">
        <select>
          <option> A </option>
          <option> B </option>
        </select>
      </div>-->
      <div class="select">
        <select v-model="outer" lazy>
          <option v-for="(child, key, idx) in samples" :key="idx">{{key}}</option>
        </select>
      </div>
      <div class="select" v-if="outer">
        <select v-model="inner" lazy>
          <option v-for="(child, key, idx) in samples[outer]" :key="idx">{{key}}</option>
        </select>
      </div>
      <div class="select" v-if="inner">
        <select v-model="experiment" lazy>
          <option v-for="(child, key, idx) in samples[outer][inner]" :key="idx">{{key}}</option>
        </select>
      </div>
      <router-link class="navbar-item" :to="'/dashboard/' + outer + '/' + inner + '/' + experiment">
        <button class="button">Go</button>
      </router-link>
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
        this.samples = response.data;
        if (this.samples) this.outer = Object.keys(this.samples)[0];
        if (this.outer) this.inner = Object.keys(this.samples[this.outer])[0];
        if (this.inner)
          this.experiment = Object.keys(
            this.samples[this.outer][this.inner]
          )[0];
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
