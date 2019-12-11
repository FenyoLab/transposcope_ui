<template>
  <div id="app">
    <NavBar></NavBar>
    <section class="section" style="height:calc(100vh - 52px)">
      <div class="columns has-text-grey-dark" style="height: 100%">
        <!--TODO: Move this div to a separate component -->
        <div class="column is-two-thirds" style="height: 100%">
          <Visualization
            style="height: 60%"
            :group="group"
            :loci="loci"
            :meStart="meStart"
            :meEnd="meEnd"
          ></Visualization>
          <BaseUI></BaseUI>
        </div>
        <div class="column" style="height: 100%">
          <BaseTable :group="group" :loci="loci"></BaseTable>
        </div>
      </div>

      <!-- Hero footer: will stick at the bottom -->
    </section>
  </div>
  <!--<div id="app">-->
  <!--  <div><a class="button is-primary">Reads </a></div>-->
  <!--  <Visualization></Visualization>-->
  <!--</div>-->
</template>

<script>
/* eslint-disable */
import BaseTable from "./components/table/BaseTable.vue";
import BaseUI from "./components/ui/BaseUI.vue";
import Visualization from "./components/plot/BasePlot.vue";
import NavBar from "./components/navbar/BaseNavbar.vue";

export default {
  name: "app",
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
