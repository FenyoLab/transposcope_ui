<template>
  <div class="visualization">
    <progress v-if="data.length == 0" class="progress is-primary" max="100"
      >15%</progress
    >
    <Plot v-else v-bind:data="data" :referenceSeq="referenceSeq"></Plot>
  </div>
</template>

<script>
// const axios = require("axios");
const { RemoteFile } = require("generic-filehandle");
const { IndexedCramFile, CraiIndex } = require("@gmod/cram");
const { loadCramRecords } = require("../../js/cram_processor.js");
//Use indexedfasta library for seqFetch, if using local file (see below)
// TODO: Update this to use a zipped FA
const { IndexedFasta } = require("@gmod/indexedfasta");

import Plot from "./BaseSVG.vue";

export default {
  name: "Visualization",
  props: {
    loci: String
  },
  components: {
    Plot
  },
  data() {
    return {
      data: [],
      referenceSeq: "",
      index_start: 1,
      // index_start: 699,
      // index_end: 700,
      index_end: 4859,
      indexedFile: null,
      publicPath: process.env.BASE_URL
    };
  },
  mounted() {
    console.log("mounted");
    loadCramRecords(this.indexedFile, this.index_start, this.index_end).then(
      data => {
        this.data = data;
      }
    );
    /* processCram(this.indexedFile, this.index_start, this.index_end).then(
      data => {
        this.data = data;
      }
    ); */
  },
  beforeMount() {
    const t = new IndexedFasta({
      fasta: new RemoteFile(
        this.publicPath + "input/fasta/chr22_10743407.fasta"
      ),
      fai: new RemoteFile(
        this.publicPath + "input/fasta/chr22_10743407.fasta.fai"
      )
    });

    // open local files
    this.indexedFile = new IndexedCramFile({
      cramFilehandle: new RemoteFile(
        this.publicPath + "input/cram/chr22_10743407.cramtools.cram"
      ),
      index: new CraiIndex({
        filehandle: new RemoteFile(
          this.publicPath + "input/cram/chr22_10743407.cramtools.cram.crai"
        )
      }),
      seqFetch: async (seqId, start, end) => {
        console.log(seqId, start, end);
        let a = (await t.getSequenceList())[0];
        let seq = await t.getSequence(a, start - 1, end);
        this.referenceSeq = seq;
        // note:
        // * seqFetch should return a promise for a string, in this instance retrieved from IndexedFasta
        // * we use start-1 because cram-js uses 1-based but IndexedFasta uses 0-based coordinates
        // * the seqId is a numeric identifier
        return seq;
      },
      checkSequenceMD5: false
    });

    /* console.log(indexedFile); */
    // example of fetching records from an indexed CRAM file.
    // NOTE: only numeric IDs for the reference sequence are accepted.
    // For indexedfasta the numeric ID is the order in which the sequence names appear in the header

    // Wrap in an async and then run
  }
  /* mounted () { */
  /* console.log('mounted', this.indexedFile); */
  /*   this.run(); */
  /* } */
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
