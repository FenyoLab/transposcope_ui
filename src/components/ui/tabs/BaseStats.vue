<template>
  <div style="margin-top:20px;width:100%">
    <table class="table is-narrow is-fullwidth is-bordered is-striped">
      <tbody>
        <tr>
          <td class="has-text-weight-bold">Chromosome:</td>
          <td align="right">{{ info["chrom"] }}</td>
        </tr>
        <tr>
          <td class="has-text-weight-bold">Five Prime Flanking Start:</td>
          <td align="right">{{ info["fivePTS"] }}</td>
        </tr>
        <tr>
          <td class="has-text-weight-bold">Five Prime Flanking End:</td>
          <td align="right">{{ info["fivePTE"] }}</td>
        </tr>
        <tr>
          <td class="has-text-weight-bold">Three Prime Flanking Start:</td>
          <td align="right">{{ info["threePTS"] }}</td>
        </tr>
        <tr>
          <td class="has-text-weight-bold">Three Prime Flanking End:</td>
          <td align="right">{{ info["threePTE"] }}</td>
        </tr>
        <tr>
          <td class="has-text-weight-bold">LINE-1 Reference Start:</td>
          <td align="right">{{ info["L1RS"] }}</td>
        </tr>
        <tr>
          <td class="has-text-weight-bold">LINE-1 Reference End:</td>
          <td align="right">{{ info["L1RE"] }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
export default {
  name: "StyleSettings",
  data() {
    return {
      info: {}
    };
  },
  mounted() {
    this.$root.$on("updateStats", info => {
      this.info = info;
    });
  }
};
</script>
<style></style>
