<template>
  <div style="overflow: scroll;height: 100%;font-family: 'courier', 'monospace';white-space:pre; width=100%">
    <table class="table is-fullwidth is-hoverable is-narrow table">
      <thead>
        <tr>
          <th class="sticky has-text-dark has-background-white is-size-6">{{ referenceSeq }}</th>
        </tr>
      </thead>
      <tbody class="is-size-6">
        <tr
          v-for="(read, idx) in  data"
          :key="idx"
        >
          <td><span v-html="read"></span></td>
        </tr>
      </tbody>
    </table>
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
.sticky {
  position: -webkit-sticky;
  position: sticky;
  top: 0px;
}
</style>
