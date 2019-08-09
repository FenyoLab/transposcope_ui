<template>
  <div id="app">
    {{ info }}
    <HelloWorld msg="Welcome to Your Vue.js App"/>
  </div>
</template>

<script>

/* eslint-disable */
import HelloWorld from './components/HelloWorld.vue'
const axios = require('axios');
const { IndexedFasta } = require('@gmod/indexedfasta')
const  { LocalFile, RemoteFile } = require('generic-filehandle')

export default {
  name: 'app',
  components: {
    HelloWorld
  },
  data() {
    return {
      info: null,
      publicPath: process.env.BASE_URL
    }
  },
  mounted () {

//    axios.all([
//      axios.get(this.publicPath + 'input/fasta/chr22_10743407.fasta'),
//      axios.get(this.publicPath + 'input/fasta/chr22_10743407.fasta.fai')
//    ])
//      .then(axios.spread((fa, fai) => {
//        const t = new IndexedFasta({
//          fasta: fa,
//          fai: fai,
//        });
//        console.log(t);
//        (async () => {
//          console.log(await t.getSequence());
//        })();
//      }));
    const t = new IndexedFasta({
      fasta: new RemoteFile(this.publicPath + 'input/fasta/chr22_10743407.fasta'),
      fai: new RemoteFile(this.publicPath + 'input/fasta/chr22_10743407.fasta.fai')
//      fasta: new RemoteFile('http://localhost:8080/public/input/fasta/chr22_10743407.fasta'),
//      fai: new RemoteFile('http://localhost:8080/public/input/fasta/chr22_10743407.fasta.fai'),
    });
   (async () => {
await t.getSequence((await t.getSequenceList())[0]).then((a) => {this.info = a});
        })();
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
