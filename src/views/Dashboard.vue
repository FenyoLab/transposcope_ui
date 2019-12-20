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
          :locus="locus"
        />

        <div
          class="columns"
          style="height:40%"
        >
          <div
            class="column is-two-thirds"
            style="height: 100%"
          >
            <BaseUI :type="type" />

          </div>
          <div class="column">
            <BaseTable
              :group="group"
              :locus="locus"
              v-on:updateSelectedLocus="changeLoci"
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
      locus: "",
      // group: "ungrouped/ungrouped/melt_test",
      group: "ungrouped/ungrouped/tipseq_test",
      type: "tipseq"
    };
  },
  components: {
    BaseUI,
    BaseTable,
    Visualization,
    NavBar
  },
  methods: {
    changeLoci(locus) {
      // TODO: change this back to :
      this.locus = locus.replace(":", "_");
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