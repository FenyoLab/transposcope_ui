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
      <label class="radio">
        <input
          type="radio"
          value="5p_junction"
          v-model="currentView"
          name="type"
        />
        5' Junction Reads
      </label>
      <label class="radio">
        <input
          type="radio"
          value="3p_junction"
          v-model="currentView"
          name="type"
        />
        3' Junction Reads
      </label>
    </div>
  </div>
</template>

<script>
export default {
  name: "Display",
  data() {
    return {
      currentView: "histogram"
    };
  },
  mounted() {
    this.$root.$on("resetView", () => {
      console.log("resetting view");
      this.currentView = "histogram";
    });
  },
  watch: {
    currentView() {
      this.$root.$emit("updatedView", this.currentView);
    }
  }
};
</script>

<style></style>
