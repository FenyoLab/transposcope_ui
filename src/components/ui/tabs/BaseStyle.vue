<template>
  <div>
    <select v-model="selectedType">
      <option disabled value="">Please select one</option>
      <option>stacked</option>
      <option>stream</option>
    </select>
  </div>
</template>
<script>
export default {
  name: "StyleSettings",
  data() {
    return {
      selectedType: "stacked"
    };
  },
  watch: {
    selectedType() {
      this.$root.$emit("updateChartType", this.selectedType);
    }
  }
};
</script>
<style></style>
