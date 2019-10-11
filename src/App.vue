<template>
  <div id="app">
    <div>Reads</div>
    <Visualization></Visualization>
  </div>
</template>

<script>
/* eslint-disable */
import Visualization from "./components/plot/BasePlot.vue";
const _ = require("lodash");
const axios = require("axios");
const { LocalFile, RemoteFile } = require("generic-filehandle");
const { IndexedCramFile, CramFile, CraiIndex } = require("@gmod/cram");
//Use indexedfasta library for seqFetch, if using local file (see below)
const { IndexedFasta, BgzipIndexedFasta } = require("@gmod/indexedfasta");
export default {
  name: "app",
  components: {
    Visualization
  }
};
</script>

<style>
#app {
  /*TODO fix this 76px offset*/
  min-height: calc(100vh - 76px);
  background-color: rgb(255, 245, 245);
  font-family: "Monaco", courier, monospace;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: left;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
