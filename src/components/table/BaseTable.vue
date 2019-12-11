<template>
  <div class="box is-paddingless" style="overflow-y: scroll">
    <!-- <div class="box is-paddingless" style="height: 100%;overflow-y: scroll"> -->
    <table
      class="table is-bordered is-narrow is-fullwidth is-hoverable table is-striped"
      style="height: 100%"
    >
      <thead>
        <tr>
          <th v-for="value in header" :key="value">{{value}}</th>
          <!-- <th>
            <abbr title="Chromosome-Position">ID</abbr>
          </th>-->
        </tr>
      </thead>
      <tbody class="is-size-7">
        <tr v-for="(row, idx) in content" :key="idx" :class="{ 'is-selected': idx==selected_idx}">
          <!-- <td v-for="(col, i) in row" :key='i'>{{ col }}</td> -->
          <td>{{ row[0] }}</td>
          <td :style="'color:'+row[1][1]">{{ row[1][0] }}</td>
          <td>{{ row[2] }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
const axios = require("axios");

export default {
  name: "BaseTable",
  props: {
    group: String,
    loci: String
  },
  data() {
    return {
      header: ["ID", "Gene", "P", "UCSC"],
      content: [["A", "B", "C"]],
      selected_idx: 2
    };
  },
  mounted() {
    axios
      .get(process.env.BASE_URL + `data/${this.group}/table_info.json`)
      .then(response => {
        this.header = response.data.heading;
        this.content = response.data.data;
      })
      .catch(function(error) {
        console.log(error);
      })
      .finally(function() {});
  }
};
</script>

<style>
</style>
