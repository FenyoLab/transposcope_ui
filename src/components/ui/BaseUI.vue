<template>
  <div class="box is-paddingless" style="height: 100%">
    <div class="tabs is-marginless">
      <ul>
        <li @click="setActive('stats')" :class="{ 'is-active': active == 'stats' }">
          <a>Stats</a>
        </li>
        <li @click="setActive('display')" :class="{ 'is-active': active == 'display' }">
          <a>Display</a>
        </li>
        <li @click="setActive('histograms')" :class="{ 'is-active': active == 'histograms' }">
          <a>Histograms</a>
        </li>
        <li @click="setActive('styles')" :class="{ 'is-active': active == 'styles' }">
          <a>Style</a>
        </li>
      </ul>
    </div>
    <div style="height:calc(100% - 41px);overflow:auto">
      <keep-alive>
        <component :type="type" :is="dynamicComponent" style="padding:5px"></component>
      </keep-alive>
    </div>
  </div>
</template>

<script>
import HistogramSelection from "./tabs/BaseHistogramSelections.vue";
import StyleSettings from "./tabs/BaseStyle.vue";
import DisplaySettings from "./tabs/BaseDisplay.vue";
import DisplayStats from "./tabs/BaseStats.vue";

export default {
  name: "BaseUI",
  props: {
    type: String
  },
  data: () => {
    return {
      active: "stats"
    };
  },
  methods: {
    setActive(key) {
      this.active = key;
    }
  },
  computed: {
    dynamicComponent() {
      switch (this.active) {
        case "stats":
          return DisplayStats;
        case "display":
          return DisplaySettings;
        case "histograms":
          return HistogramSelection;
        case "styles":
          return StyleSettings;
      }
      return "component-unknown";
    }
  }
};
</script>

<style></style>
