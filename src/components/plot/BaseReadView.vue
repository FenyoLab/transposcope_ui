<template>
  <div style="height: 100%;font-family: 'courier', 'monospace';white-space:pre; width=100%">
    <div
      class='reads'
      style="overflow: scroll;height: 95%"
    >
      <p class='has-text-weight-bold'>{{referenceSeq}}</p>
      <p
        v-for="(read, index) in data"
        :key="index"
      >
        <span v-html="read"></span>
      </p>
    </div>
    <!-- <div>
      <p> {{referenceSeq}}</p>
    </div> -->
  </div>
</template>

<script>
export default {
  name: "BaseReadView",
  props: {
    data: Array,
    referenceSeq: String
  }
};
</script>

<style>
</style>
