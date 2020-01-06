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
        <div v-for="(key, value) in genomeOrienations" class="field" :key="key">
          <label class="checkbox">
            <input type="checkbox" :value="key" v-model="selectedOrientations" />
            {{ value }}
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
            <input type="checkbox" value="g_jJ" v-model="selectedOrientations" />
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
      genomeOrienations: {
        "Genome / Genome": "gg",
        "Genome / Junction": "gjG",
        "Genome / Line": "glG",
        "Genome / Junction (Bridging)": "g_jG",
        "Genome / Genome (Bridging)": "g_g",
        "Genome / Unmapped": "gn"
      },
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
          ? _.intersection(
              this.selectedOrientations,
              _.values(this.genomeOrienations)
            ).length == _.values(this.genomeOrienations).length
          : false;
      },
      set: function(value) {
        let selected = _.difference(
          this.selectedOrientations,
          _.values(this.genomeOrienations)
        );
        if (value) {
          selected = _.concat(selected, _.values(this.genomeOrienations));
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
