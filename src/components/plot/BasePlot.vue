<template>
  <div class="box" style="height: 100%">
    <div class="visualization" style="height: 100%">
      <progress v-if="data.length == 0" class="progress is-primary" max="100"
        >15%</progress
      >
      <!--<Plot v-else v-bind:data="data" :referenceSeq="referenceSeq"></Plot>-->
      <!--<BaseReadView :reads="data"></BaseReadView>-->
      <keep-alive>
        <component
          :is="dynamicComponent"
          :data="data"
          :referenceSeq="referenceSeq"
        ></component>
      </keep-alive>
    </div>
  </div>
</template>

<script>
// const axios = require("axios");
const { RemoteFile } = require("generic-filehandle");
const { IndexedCramFile, CraiIndex } = require("@gmod/cram");
const { getReads, loadCramRecords } = require("../../js/cram_processor.js");
//Use indexedfasta library for seqFetch, if using local file (see below)
// TODO: Update this to use a zipped FA
const { IndexedFasta } = require("@gmod/indexedfasta");

import Plot from "./BaseSVG.vue";
import BaseReadView from "./BaseReadView.vue";

export default {
  name: "Visualization",
  props: {
    loci: String
  },
  components: {
    Plot,
    BaseReadView
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
      publicPath: process.env.BASE_URL,
      active: "histogram"
    };
  },
  mounted() {
    console.log("mounted");
    this.$root.$on("updatedView", active => {
      if (active === "histogram") {
        loadCramRecords(
          this.indexedFile,
          this.index_start,
          this.index_end
        ).then(data => {
          this.data = data;
          this.active = active;
        });
      } else if (active === "5p_junction") {
        getReads(this.indexedFile, 999, 1001).then(data => {
          this.data = null;
          this.data = data;
          this.active = active;
        });
      }
    });
    loadCramRecords(this.indexedFile, this.index_start, this.index_end).then(
      data => {
        this.data = data;
      }
    );
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
        return seq;
      },
      checkSequenceMD5: false
    });
  },
  computed: {
    dynamicComponent() {
      switch (this.active) {
        case "histogram":
          return Plot;
        case "5p_junction":
          return BaseReadView;
      }
      return "component-unknown";
    }
  }
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
