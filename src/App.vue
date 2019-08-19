<template>
<div id="app" style="overflow-x: scroll">
<div v-for="(item, index) in data" :key="index">
{{ item }}
</div>
</div>
</template>

<script>

/* eslint-disable */
import HelloWorld from './components/HelloWorld.vue'
const _ = require('lodash');
const axios = require('axios');
const  { LocalFile, RemoteFile } = require('generic-filehandle')
const { IndexedCramFile, CramFile, CraiIndex } = require('@gmod/cram')
//Use indexedfasta library for seqFetch, if using local file (see below)
const { IndexedFasta, BgzipIndexedFasta } = require('@gmod/indexedfasta')
export default {
name: 'app',
        components: {
          HelloWorld
        },
        data() {
          return {
data: [],
      indexedFile: null,
      publicPath: process.env.BASE_URL
          }
        },
        mounted() {
          (async () => {
          console.log(this.indexedFile);
            if (this.indexedFile != null) {
            const records = await this.indexedFile.getRecordsForRange(0, 990, 1000)
            /* this.data = _.map(records.slice(records.length-10), (record) => { */
            this.data = _.map(records, (record) => {
              let result_string = '';
                result_string += '_'.repeat(record.alignmentStart-1);
                let bases = record.getReadBases();
                if (record.readFeatures != undefined) {
                  record.readFeatures.forEach(( rf) => { //{code, data, pos, refPos, ref, sub}) => { 

                    // process the "read features". this can be used similar to
                    // CIGAR/MD strings in SAM. see CRAM specs for more details.
                    if (rf.code === 'S')
                      bases = bases.slice(rf.data.length);
                    if (rf.code === 'X')
                      bases = bases
                    if (rf.code === 'D')
                      /* console.log(rf); */
                      bases = bases.slice(0, rf.pos) + "-" + bases.slice(rf.pos);
                  })
                }
                result_string += bases;
                return result_string;
                });
            }
          })();
        }, 
        beforeMount () {
          const t = new IndexedFasta({
fasta: new RemoteFile(this.publicPath + 'input/fasta/chr22_10743407.fasta'),
fai: new RemoteFile(this.publicPath + 'input/fasta/chr22_10743407.fasta.fai'),
});


// open local files
this.indexedFile = new IndexedCramFile({
cramFilehandle: new RemoteFile(this.publicPath + 'input/cram/chr22_10743407.cramtools.cram'),
index: new CraiIndex({
filehandle: new RemoteFile(this.publicPath + 'input/cram/chr22_10743407.cramtools.cram.crai'),
}),
seqFetch: async (seqId, start, end) => {
console.log(seqId, start, end);
let a = (await t.getSequenceList())[0];
let seq = (await t.getSequence(a, start-1, end));
// note:
// * seqFetch should return a promise for a string, in this instance retrieved from IndexedFasta
// * we use start-1 because cram-js uses 1-based but IndexedFasta uses 0-based coordinates
// * the seqId is a numeric identifier
return seq;
},
checkSequenceMD5: false,
})

/* console.log(indexedFile); */
// example of fetching records from an indexed CRAM file.
// NOTE: only numeric IDs for the reference sequence are accepted.
// For indexedfasta the numeric ID is the order in which the sequence names appear in the header

// Wrap in an async and then run
},
  /* mounted () { */
  /* console.log('mounted', this.indexedFile); */
  /*   this.run(); */
  /* } */
  }
</script>

<style>
#app {
  font-family: 'Monaco', courier, monospace;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: left;
color: #2c3e50;
       margin-top: 60px;
}
</style>
