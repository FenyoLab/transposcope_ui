<template>
  <div class="home">
    <div
      class="box"
      style="height: 100%"
    >
      <select v-model='outer'>
        <option
          v-for="(child, key, idx) in samples"
          :key="idx"
        > {{key}} </option>
      </select>
      <select v-model='inner'>
        <option
          v-for="(child, key, idx) in innerGroup"
          :key="idx"
        > {{key}} </option>
      </select>
      <select v-model='experiment'>
        <option
          v-for="(child, key, idx) in experimentGroup"
          :key="idx"
        > {{key}} </option>
      </select>
      {{ this.outer + "/" + this.inner + "/" + this.experiment}}
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
      })
      .catch(function(error) {
        console.error(error);
      })
      .finally(function() {});
  },
  computed: {
    innerGroup: function() {
      if (this.outer) {
        return this.samples[this.outer];
      } else {
        return [];
      }
    },
    experimentGroup: function() {
      console.log(this.samples);
      if (this.inner && this.outer) {
        return this.samples[this.outer][this.inner];
      } else {
        return [];
      }
    }
  }
};
</script>
