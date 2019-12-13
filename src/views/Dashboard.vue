<template>
  <section
    class="section"
    style="height:calc(100vh - 52px)"
  >
    <div
      class="columns has-text-grey-dark"
      style="height: 100%"
    >
      <!--TODO: Move this div to a separate component -->
      <div
        class="column"
        style="height: 100%;width:100%"
      >
        <Visualization
          style="height: 60%"
          :group="group"
          :loci="loci"
        />

        <div
          class="columns"
          style="height:40%"
        >
          <div
            class="column is-two-thirds"
            style="height: 100%"
          >
            <BaseUI />

          </div>
          <div class="column">
            <BaseTable
              :group="group"
              :loci="loci"
              v-on:updateSelectedLoci="changeLoci"
            />

          </div>
        </div>
      </div>
    </div>
    <!-- Hero footer: will stick at the bottom -->
  </section>
</template>
<script>
/* eslint-disable */
import BaseTable from "../components/table/BaseTable.vue";
import BaseUI from "../components/ui/BaseUI.vue";
import Visualization from "../components/plot/BasePlot.vue";
import NavBar from "../components/navbar/BaseNavbar.vue";

export default {
  name: "dashboard",
  data() {
    return {
      loci: "chr22_11376996",
      group: "ungrouped/ungrouped/melt_test",
      meStart: 1000,
      meEnd: 2991
    };
  },
  components: {
    BaseUI,
    BaseTable,
    Visualization,
    NavBar
  },
  methods: {
    changeLoci(loci) {
      this.loci = loci.replace(":", "_");
    }
  }
};
</script>

<style>
#app {
  height: 100vh;

  background-color: rgb(200, 200, 200);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: left;
  color: #2c3e50;
}
</style>