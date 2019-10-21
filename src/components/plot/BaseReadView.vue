<template>
  <div
    style="overflow: auto;height: 100%;font-family: 'courier', 'monospace';white-space:pre"
  >
    <p v-for="(read, index) in data" :key="index">
      <span v-html="read"></span>
    </p>
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

<style></style>
