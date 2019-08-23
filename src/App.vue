<template>
  <div id="app" style="overflow-x: scroll; height: 85vh">
    <div>Reads</div>
    <Visualization></Visualization>
  </div>
</template>

<script>
/* eslint-disable */
import Visualization from "./components/Visualization.vue";
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
  font-family: "Monaco", courier, monospace;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: left;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
