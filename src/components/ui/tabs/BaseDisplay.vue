<template>
  <div>
    <div class="control">
      <label class="radio">
        <input
          type="radio"
          value="histogram"
          v-model="currentView"
          name="answer"
          checked
        />
        histograms
      </label>
      <label class="radio">
        <input
          type="radio"
          value="5p_junction"
          v-model="currentView"
          name="answer"
        />
        5' Junction Reads
      </label>
      <label class="radio" disabled>
        <input type="radio" name="answer" disabled />
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
  watch: {
    currentView() {
      this.$root.$emit("updatedView", this.currentView);
    }
  }
};
</script>

<style></style>
