<template>
  <section class="section" style="height:calc(100vh - 52px)">
    <div class="columns has-text-grey-dark" style="height: 100%">
      <!--TODO: Move this div to a separate component -->
      <div class="column" style="height: 100%;width:100%">
        <Visualization style="height: 60%" :group="group" :locus="locus" />

        <div class="columns" style="height:40%">
          <div class="column is-two-thirds" style="height: 100%">
            <BaseUI />
          </div>
          <div class="column">
            <BaseTable :group="group" :locus="locus" />
          </div>
        </div>
      </div>
    </div>
    <!-- Hero footer: will stick at the bottom -->
  </section>
</template>
<script>
import BaseTable from "../components/table/BaseTable.vue";
import BaseUI from "../components/ui/BaseUI.vue";
import Visualization from "../components/plot/BasePlot.vue";

const _ = require("lodash");

export default {
  name: "dashboard",
  data() {
    return {
      locus: "",
      group: ""
    };
  },
  components: {
    BaseUI,
    BaseTable,
    Visualization
  },
  mounted() {
    this.group = _.join(_.values(this.$route.params), "/");
    if (this.$route.query.locus)
      this.locus = this.$route.query.locus.replace("-", "_");
  },
  methods: {
    changeLoci(locus) {
      this.locus = locus.replace(":", "_");
    }
  },
  watch: {
    $route: function() {
      this.group = _.join(_.values(this.$route.params), "/");
      if (this.$route.query.locus)
        this.locus = this.$route.query.locus.replace("-", "_");
      else {
        this.locus = "";
      }
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