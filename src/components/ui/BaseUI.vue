<template>
  <div class="box" style="height: calc(40% - 1.5rem)">
    <div class="tabs">
      <ul>
        <li
          @click="setActive('display')"
          :class="{ 'is-active': active == 'display' }"
        >
          <a>Display</a>
        </li>
        <li
          @click="setActive('histograms')"
          :class="{ 'is-active': active == 'histograms' }"
        >
          <a>Histograms</a>
        </li>
        <li
          @click="setActive('styles')"
          :class="{ 'is-active': active == 'styles' }"
        >
          <a>Style</a>
        </li>
      </ul>
    </div>
    <div style="height: 80%;overflow-x: hidden;overflow-y:auto">
      <keep-alive>
        <component :is="dynamicComponent"></component>
      </keep-alive>
    </div>
  </div>
</template>

<script>
import HistogramSelection from "./tabs/BaseHistogramSelections.vue";
import StyleSettings from "./tabs/BaseStyle.vue";
import DisplaySettings from "./tabs/BaseDisplay.vue";

export default {
  name: "BaseUI",
  data: () => {
    return {
      active: "display"
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
