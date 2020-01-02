<template>
  <div class="box" style="height: 100%">
    <div class="visualization" style="height: 100%">
      <progress v-if="data.length == 0" class="progress is-primary" max="100"></progress>
      <keep-alive>
        <component
          v-if="data.length != 0"
          :is="dynamicComponent"
          :data="data"
          :referenceSeq="referenceSeq"
          :info="aesthetics"
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
    locus: String,
    group: String
  },
  components: {
    Plot,
    BaseReadView
  },
  data() {
    return {
      data: [],
      histData: [],
      referenceSeq: "",
      fullReferenceSeq: "",
      index_start: 1,
      index_end: 2,
      meStart: 1,
      meEnd: 1,
      meFivePrime: 1,
      meThreePrime: 1,
      meStrand: "-",
      readLength: 250,
      indexedFile: null,
      publicPath: "", //process.env.BASE_URL,
      active: "histogram",
      fasta: null,
      aesthetics: {}
    };
  },
  mounted() {
    this.$root.$on("updatedView", active => {
      let refClass = "class='is-uppercase'";
      let meClass = "class='is-lowercase'";
      if (active === "histogram") {
        this.data = this.histData;
        this.referenceSeq = this.fullReferenceSeq;
        this.active = active;
      } else if (active === "5p_junction") {
        getReads(
          this.indexedFile,
          this.meFivePrime,
          5,
          this.readLength + 50
        ).then(data => {
          this.data = null;
          this.data = data;
          this.active = active;

          this.fasta.getSequenceList().then(d => {
            let a = d[0];
            this.fasta
              .getSequence(
                a,
                this.meFivePrime - (this.readLength + 50),
                this.meFivePrime + (this.readLength + 50)
              )
              .then(s => {
                this.referenceSeq =
                  "<span " +
                  (this.meStrand == "+" ? refClass : meClass) +
                  ">" +
                  s.slice(0, this.readLength + 50) +
                  "</span><span " +
                  (this.meStrand == "+" ? meClass : refClass) +
                  ">" +
                  s.slice(this.readLength + 50) +
                  "<span>";
              });
          });
        });
      } else if (active === "3p_junction") {
        getReads(
          this.indexedFile,
          this.meThreePrime,
          5,
          this.readLength + 50
        ).then(data => {
          this.data = null;
          this.data = data;
          this.active = active;
          this.fasta.getSequenceList().then(d => {
            let a = d[0];
            this.fasta
              .getSequence(
                a,
                this.meThreePrime - (this.readLength + 50),
                this.meThreePrime + (this.readLength + 50)
              )
              .then(s => {
                this.referenceSeq =
                  "<span " +
                  (this.meStrand == "+" ? meClass : refClass) +
                  ">" +
                  s.slice(0, this.readLength + 50) +
                  "</span><span " +
                  (this.meStrand == "+" ? refClass : meClass) +
                  ">" +
                  s.slice(this.readLength + 50) +
                  "<span>";
              });
          });
        });
      }
    });
  },
  watch: {
    locus: function() {
      console.log("updating plot", this.locus);
      if (this.locus) {
        let fileError = null;
        axios
          .get(this.publicPath + `data/${this.group}/meta/${this.locus}.json`)
          .then(response => {
            console.log("locus changed", response.data);
            // TODO: These should be precalculated
            this.meStrand = response.data.me_strand;
            this.aesthetics = response.data.regions;
            if (
              response.data.target_5p != null &&
              response.data.target_3p == null
            ) {
              this.index_end =
                response.data.target_5p[1] -
                response.data.target_5p[0] +
                (response.data.me_end - response.data.me_start);
              this.meStart =
                response.data.target_5p[1] - response.data.target_5p[0];
              this.meEnd =
                this.meStart +
                response.data.me_end -
                response.data.me_start +
                1000;
              this.meThreePrime = this.meStart;
            } else if (
              response.data.target_5p == null &&
              response.data.target_3p != null
            ) {
              this.meStart = -1000;
              this.meEnd = response.data.me_end - response.data.me_start;

              this.index_end =
                response.data.target_3p[1] -
                response.data.target_3p[0] +
                (response.data.me_end - response.data.me_start);
              this.meThreePrime = this.meEnd;
            } else {
              this.index;
              this.index_end =
                response.data.target_3p[1] -
                response.data.target_5p[0] +
                response.data.me_end -
                response.data.me_start;
              this.meStart =
                response.data.target_5p[1] - response.data.target_5p[0];
              this.meEnd =
                this.meStart + response.data.me_end - response.data.me_start;
              this.meFivePrime =
                response.data.me_strand === "+" ? this.meStart : this.meEnd;
              this.meThreePrime =
                response.data.me_strand === "+" ? this.meEnd : this.meStart;
            }
            this.$root.$emit("setType", response.data.type);
          })
          .catch(error => {
            fileError = error;
            alert(`${this.locus.replace("_", ":")} not found`);
            this.$router.push({
              // path: this.group.split("/")[2],
            });
          })
          .finally(() => {
            if (!fileError) {
              this.data = [];

              const t = new IndexedFasta({
                fasta: new RemoteFile(
                  this.publicPath +
                    `data/${this.group}/fasta/${this.locus}.fasta`
                ),
                fai: new RemoteFile(
                  this.publicPath +
                    `data/${this.group}/fasta/${this.locus}.fasta.fai`
                )
              });
              this.fasta = t;
              this.fasta.getSequenceList().then(d => {
                let a = d[0];
                this.fasta
                  .getSequence(a, this.index_start - 1, this.index_end + 1)
                  .then(s => {
                    this.referenceSeq = s;
                    this.fullReferenceSeq = s;
                  });
              });

              // TODO: Merge all of these async calls together (async.parrallel?)
              // open local files
              this.indexedFile = new IndexedCramFile({
                cramFilehandle: new RemoteFile(
                  this.publicPath + `data/${this.group}/cram/${this.locus}.cram`
                ),
                index: new CraiIndex({
                  filehandle: new RemoteFile(
                    this.publicPath +
                      `data/${this.group}/cram/${this.locus}.cram.crai`
                  )
                }),
                seqFetch: async (seqId, start, end) => {
                  let a = (await t.getSequenceList())[0];
                  let seq = await t.getSequence(a, start - 1, end);
                  return seq;
                },
                checkSequenceMD5: false
              });
              loadCramRecords(
                this.indexedFile,
                this.index_start,
                this.index_end,
                this.meStart,
                this.meEnd
              )
                .then(data => {
                  this.data = data;
                  this.histData = data;
                })
                .catch(error => {
                  console.error(error);
                })
                .finally(() => {
                  this.$root.$emit("resetView");
                });
            }
          });
      }
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
