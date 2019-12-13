<template>
  <div
    class="box"
    style="height: 100%"
  >
    <div
      class="visualization"
      style="height: 100%"
    >
      <progress
        v-if="data.length == 0"
        class="progress is-primary"
        max="100"
      >15%</progress>
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
const axios = require("axios");
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
    loci: String,
    group: String
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
      index_end: 2,
      meStart: 1,
      meEnd: 1,
      indexedFile: null,
      publicPath: "", //process.env.BASE_URL,
      active: "histogram",
      fasta: null
    };
  },
  mounted() {
    this.$root.$on("updatedView", active => {
      if (active === "histogram") {
        loadCramRecords(
          this.indexedFile,
          this.index_start,
          this.index_end,
          this.meStart,
          this.meEnd
        ).then(data => {
          this.data = data;
          this.active = active;
        });
      } else if (active === "5p_junction") {
        getReads(this.indexedFile, this.meStart - 5, this.meStart + 5).then(
          data => {
            this.data = null;
            this.data = data;
            this.active = active;
          }
        );
      } else if (active === "3p_junction") {
        getReads(this.indexedFile, this.meEnd - 5, this.meEnd + 5).then(
          data => {
            this.data = null;
            this.data = data;
            this.active = active;
            this.fasta.getSequenceList().then(d => {
              let a = d[0];
              this.fasta
                .getSequence(a, this.meEnd - 150, this.meEnd + 150)
                .then(s => {
                  this.referenceSeq = s;
                });
            });
          }
        );
      }
    });
  },
  watch: {
    loci: function() {
      this.$root.$emit("resetView");
      // TODO: Merge all of these async calls together (async.parrallel?)
      // open local files
      this.indexedFile = new IndexedCramFile({
        cramFilehandle: new RemoteFile(
          this.publicPath + `data/${this.group}/cram/${this.loci}.cram`
        ),
        index: new CraiIndex({
          filehandle: new RemoteFile(
            this.publicPath + `data/${this.group}/cram/${this.loci}.cram.crai`
          )
        }),
        seqFetch: async (seqId, start, end) => {
          let a = (await t.getSequenceList())[0];
          let seq = await t.getSequence(a, start - 1, end);
          this.referenceSeq = seq;
          return seq;
        },
        checkSequenceMD5: false
      });

      console.log("updating plot");

      axios
        .get(this.publicPath + `data/${this.group}/meta/${this.loci}.json`)
        .then(response => {
          // TODO: This should be precalculated when the files are generated
          console.log(response.data);
          this.index_end =
            response.data.target_3p[1] -
            response.data.target_5p[0] +
            response.data.me_end -
            response.data.me_start;
          this.meStart =
            response.data.target_5p[1] - response.data.target_5p[0];
          this.meEnd =
            this.meStart + response.data.me_end - response.data.me_start;
          loadCramRecords(
            this.indexedFile,
            this.index_start,
            this.index_end,
            this.meStart,
            this.meEnd
          ).then(data => {
            this.data = data;
          });
        })
        .catch(function(error) {
          console.error(error);
        })
        .finally(function() {});
      this.data = [];
      const t = new IndexedFasta({
        fasta: new RemoteFile(
          this.publicPath + `data/${this.group}/fasta/${this.loci}.fasta`
        ),
        fai: new RemoteFile(
          this.publicPath + `data/${this.group}/fasta/${this.loci}.fasta.fai`
        )
      });
      this.fasta = t;
    }
  },
  computed: {
    dynamicComponent() {
      switch (this.active) {
        case "histogram":
          return Plot;
        case "5p_junction":
          return BaseReadView;
        case "3p_junction":
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
