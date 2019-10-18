<!-- TODO: Split these into separate panels -->
<template>
  <div>
    <div class="columns">
      <div class="column is-3">
        <div class="field">
          <label class="checkbox has-text-weight-bold">
            <input type="checkbox" v-model="selectAllGenome" />
            Genome (All)
          </label>
        </div>
        <div class="field">
          <label class="checkbox">
            <input type="checkbox" value="gg" v-model="selectedOrientations" />
            Genome / Genome
          </label>
        </div>
        <div class="field">
          <label class="checkbox">
            <input type="checkbox" value="gjG" v-model="selectedOrientations" />
            Genome / Junction
          </label>
        </div>
        <div class="field">
          <label class="checkbox">
            <input type="checkbox" value="glG" v-model="selectedOrientations" />
            Genome / Line
          </label>
        </div>
        <div class="field">
          <label class="checkbox">
            <input
              type="checkbox"
              value="g_jG"
              v-model="selectedOrientations"
            />
            Genome / Junction (Bridging)
          </label>
        </div>
        <div class="field">
          <label class="checkbox">
            <input type="checkbox" value="g_g" v-model="selectedOrientations" />
            Genome / Genome (Bridging)
          </label>
        </div>
        <div class="field">
          <label class="checkbox">
            <input type="checkbox" value="gn" v-model="selectedOrientations" />
            Genome / Unmapped
          </label>
        </div>
      </div>
      <div class="column is-3">
        <div class="field">
          <label class="checkbox">
            <input type="checkbox" value="glL" v-model="selectedOrientations" />
            Genome / Line
          </label>
        </div>
      </div>
      <div class="column is-3">
        <div class="field">
          <label class="checkbox has-text-weight-bold">
            <input type="checkbox" v-model="selectAllJunction" />
            Junction (All)
          </label>
        </div>
        <div class="field">
          <label class="checkbox">
            <input type="checkbox" value="gjJ" v-model="selectedOrientations" />
            Genome / Junction
          </label>
        </div>
        <div class="field">
          <label class="checkbox">
            <input
              type="checkbox"
              value="g_jJ"
              v-model="selectedOrientations"
            />
            Genome / Junction (Bridging)
          </label>
        </div>
        <div class="field">
          <label class="checkbox">
            <input type="checkbox" value="jj" v-model="selectedOrientations" />
            Junction / Junction
          </label>
        </div>
        <div class="field">
          <label class="checkbox">
            <input type="checkbox" value="jn" v-model="selectedOrientations" />
            Junction / Unmapped
          </label>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
const _ = require("lodash");
export default {
  name: "HistogramSelection",
  data() {
    return {
      genomeOrienations: ["gg", "gn", "g_g", "glG", "g_jG", "gjG"],
      junctionOrienations: ["jj", "jn", "j_j5", "j_j3", "jlJ", "g_jJ", "gjJ"],
      selectedOrientations: [
        "gg",
        "jj",
        "ll",
        "gn",
        "jn",
        "ln",
        "g_g",
        "g_jG",
        "g_jJ",
        "gjG",
        "gjJ",
        "glL",
        "glG",
        "jlJ",
        "jlL",
        "j_j5",
        "j_j3"
      ]
    };
  },
  watch: {
    selectedOrientations() {
      this.$root.$emit("updatedOrientations", this.selectedOrientations);
    }
  },
  computed: {
    selectAllGenome: {
      get: function() {
        return this.selectedOrientations
          ? _.intersection(this.selectedOrientations, this.genomeOrienations)
              .length == this.genomeOrienations.length
          : false;
      },
      set: function(value) {
        let selected = _.difference(
          this.selectedOrientations,
          this.genomeOrienations
        );
        console.log(selected);
        if (value) {
          selected = _.concat(selected, this.genomeOrienations);
        }
        this.selectedOrientations = selected;
      }
    },
    selectAllJunction: {
      get: function() {
        return this.selectedOrientations
          ? _.intersection(this.selectedOrientations, this.junctionOrienations)
              .length == this.junctionOrienations.length
          : false;
      },
      set: function(value) {
        let selected = _.difference(
          this.selectedOrientations,
          this.junctionOrienations
        );
        console.log(selected);
        if (value) {
          selected = _.concat(selected, this.junctionOrienations);
        }
        this.selectedOrientations = selected;
      }
    }
  }
};
</script>
<style></style>
