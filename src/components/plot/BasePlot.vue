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
/*eslint no-console: ["error", {allow: ["warn", "error"]}] */
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
      readLength: 100,
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
                  s.slice(0, this.readLength + 49) +
                  "</span><span " +
                  (this.meStrand == "+" ? meClass : refClass) +
                  ">" +
                  s.slice(this.readLength + 49) +
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
                  s.slice(0, this.readLength + 49) +
                  "</span><span " +
                  (this.meStrand == "+" ? refClass : meClass) +
                  ">" +
                  s.slice(this.readLength + 49) +
                  "<span>";
              });
          });
        });
      }
    });
  },
  watch: {
    locus: function() {
      if (this.locus) {
        let fileError = null;
        axios
          .get(this.publicPath + `data/${this.group}/meta/${this.locus}.json`)
          .then(response => {
            // TODO: These should be precalculated
            this.meStrand = response.data.me_strand;
            this.aesthetics = response.data.regions;
            let stats = {
              chrom: "undefined",
              fivePTS: "N/A",
              fivePTE: "N/A",
              threePTS: "undefined",
              threePTE: "undefined",
              L1RS: "undefined",
              L1RE: "undefined"
            };
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
                1000; // this offsets the 5p end which does not exist to correctly classify reads
              this.meThreePrime = this.meStart;
              stats.threePTS = response.data.target_5p[0];
              stats.threePTE = response.data.target_5p[1];
              stats.L1RS = response.data.me_start;
              stats.L1RE = response.data.me_end;
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
              stats.threePTS = response.data.target_3p[0];
              stats.threePTE = response.data.target_3p[1];
              stats.L1RS = response.data.me_start;
              stats.L1RE = response.data.me_end;
            } else {
              this.index;
              this.index_end =
                response.data.target_3p[1] -
                response.data.target_5p[0] +
                response.data.me_end -
                response.data.me_start;
              this.meStart =
                response.data.target_5p[1] - response.data.target_5p[0] + 1;
              this.meEnd =
                this.meStart +
                response.data.me_end -
                response.data.me_start +
                1;
              this.meFivePrime =
                response.data.me_strand === "+" ? this.meStart : this.meEnd;
              this.meThreePrime =
                response.data.me_strand === "+" ? this.meEnd : this.meStart;
              stats.fivePTS = response.data.target_5p[0];
              stats.fivePTE = response.data.target_5p[1];
              stats.threePTS = response.data.target_3p[0];
              stats.threePTE = response.data.target_3p[1];
              stats.L1RS = response.data.me_start;
              stats.L1RE = response.data.me_end;
              stats.info = response.data.info;
            }
            stats.chrom = response.data.chromosome;
            this.readLength = response.data.read_length || 500;
            this.$root.$emit("setType", response.data.type);
            this.$root.$emit("updateStats", stats);
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
                this.meEnd,
                this.readLength
              )
                .then(data => {
                  this.data = data;
                  this.histData = data;
                })
                .catch(error => {
                  console.error("Error loading cram record", error);
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
