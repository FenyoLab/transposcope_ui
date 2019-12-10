<template>
  <div class="box is-paddingless" style="height: 100%;overflow-y: scroll">
    <table class="table is-narrow is-fullwidth is-hoverable table is-striped" style="height: 100%">
      <thead>
        <tr>
          <th>
            <abbr title="Chromosome-Position">ID</abbr>
          </th>
          <th>
            <abbr title="Closest Gene">Gene</abbr>
          </th>
          <th>
            <abbr title="Insertion Confidence">P</abbr>
          </th>
          <th>
            <abbr title="View region on UCSC">UCSC</abbr>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="i in 35" :key="i">
          <td>{{ i }}</td>
          <td>B</td>
          <td>C</td>
          <td>D</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: "BaseTable"
};
</script>

<style></style>
