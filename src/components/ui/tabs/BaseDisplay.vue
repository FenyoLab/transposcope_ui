<template>
  <div>
    <div class="control">
      <label class="radio">
        <input
          type="radio"
          value="histogram"
          v-model="currentView"
          name="type"
          checked
        />
        Histograms
      </label>
      <label
        class="radio"
        :disabled="isTipseq"
      >
        <input
          type="radio"
          value="5p_junction"
          v-model="currentView"
          name="type"
          :disabled="isTipseq"
        />
        Mobile Element 5' Junction Reads
      </label>
      <label class="radio">
        <input
          type="radio"
          value="3p_junction"
          v-model="currentView"
          name="type"
        />
        Mobile Element 3' Junction Reads
      </label>
    </div>
  </div>
</template>

<script>
export default {
  name: "Display",
  props: {},
  data() {
    return {
      currentView: "histogram",
      type: ""
    };
  },
  mounted() {
    this.$root.$on("resetView", () => {
      this.currentView = "histogram";
    });
    this.$root.$on("setType", type => {
      console.log("SETTING TYPE");
      this.type = type;
    });
  },
  watch: {
    currentView() {
      this.$root.$emit("updatedView", this.currentView);
    },
    type() {
      console.log(this.type);
    }
  },
  computed: {
    isTipseq() {
      return this.type === "tipseq";
    }
  }
};
</script>

<style></style>
