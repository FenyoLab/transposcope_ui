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
          <label class="checkbox has-text-weight-bold">
            <input type="checkbox" v-model="selectAllLine" />
            LINE-1 (All)
          </label>
        </div>
        <div v-for="(key, value) in lineOrientations" class="field" :key="key">
          <label class="checkbox">
            <input type="checkbox" :value="key" v-model="selectedOrientations" />
            {{ value }}
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
        <div v-for="(key, value) in junctionOrientations" class="field" :key="key">
          <label class="checkbox">
            <input type="checkbox" :value="key" v-model="selectedOrientations" />
            {{ value }}
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
        "Genome | Genome": "gg",
        "Genome | Junction": "gjG",
        "Genome | LINE-1": "glG",
        "Genome | Junction (Bridging)": "g_jG",
        "Genome | Genome (Bridging)": "g_g",
        "Genome | Unmapped": "gn"
      },
      lineOrientations: {
        "LINE-1 | LINE-1": "ll",
        "Genome | LINE-1": "glL",
        "Junction | LINE-1": "jlL",
        "LINE-1 | Unmapped": "ln"
      },
      junctionOrientations: {
        "Junction | Junction": "jj",
        "Genome | Junction": "gjJ",
        "Junction | LINE-1": "jlJ",
        "Genome | Junction (Bridging)": "g_jJ",
        "Junction | Junction (Bridging, 5p)": "j_j5",
        "Junction | Junction (Bridging, 3p)": "j_j3",
        "Junction | Unmapped": "jn"
      },
      selectedOrientations: [
        "gg", // Added
        "jj", // Added
        "ll", // Added
        "gn", // Added
        "jn", // Added
        "ln", // Added
        "g_g", // Added
        "g_jG", // Added
        "g_jJ", // Added
        "gjG", // Added
        "gjJ", // Added
        "glL", // Added
        "glG", // Added
        "jlJ", // Added
        "jlL", // Added
        "j_j5", // Added
        "j_j3" // Added
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
    selectAllLine: {
      get: function() {
        return this.selectedOrientations
          ? _.intersection(
              this.selectedOrientations,
              _.values(this.lineOrientations)
            ).length == _.values(this.lineOrientations).length
          : false;
      },
      set: function(value) {
        let selected = _.difference(
          this.selectedOrientations,
          _.values(this.lineOrientations)
        );
        if (value) {
          selected = _.concat(selected, _.values(this.lineOrientations));
        }
        this.selectedOrientations = selected;
      }
    },
    selectAllJunction: {
      get: function() {
        return this.selectedOrientations
          ? _.intersection(
              this.selectedOrientations,
              _.values(this.junctionOrientations)
            ).length == _.values(this.junctionOrientations).length
          : false;
      },
      set: function(value) {
        let selected = _.difference(
          this.selectedOrientations,
          _.values(this.junctionOrientations)
        );
        if (value) {
          selected = _.concat(selected, _.values(this.junctionOrientations));
        }
        this.selectedOrientations = selected;
      }
    }
  }
};
</script>
<style></style>
