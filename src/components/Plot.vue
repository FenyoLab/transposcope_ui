<template>
  <div id="plot">
    <div v-for="(item, index) in data" v-bind:key="index">
      <div v-html="item"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Plot",
  props: {
    data: Array
  }
}
</script>

<style>
</style>
