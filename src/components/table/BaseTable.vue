<template>
  <div
    class="box is-paddingless"
    style="overflow-y: scroll;height:100%"
  >
    <input
      class="input"
      type="text"
      v-model="filterKey"
      placeholder="Search loci"
    >
    <table class=" table is-bordered is-narrow is-fullwidth is-hoverable table is-striped">
      <thead>
        <tr class="loci">
          <th
            v-for="key in columns"
            :key="key"
            @click="sortBy(key)"
          >{{ key }}<span
              class="arrow"
              :class="sortOrders[key] > 0 ? 'asc' : 'dsc'"
            >
            </span>
          </th>
          <!--
              <th
            >
              <abbr title="Chromosome-Position">ID</abbr>
          </th>-->
        </tr>
      </thead>
      <tbody class="is-size-7">
        <tr
          v-for="(entry, idx) in  filteredLoci"
          :key="idx"
          @click="selectLoci(idx, entry['ID'])"
          :class="{ 'loci is-selected': idx==selected_idx}"
        >
          <td
            v-for="key in columns"
            :key='key'
          >{{ entry[key] }}</td>
          <!-- <td>{{ row[0] }}</td>
          <td :style="'color:'+row[1][1]">{{ row[1][0] }}</td>
          <td>{{ row[2] }}</td> -->
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
/*eslint no-console: ["error", {allow: ["warn", "error"]}] */
const axios = require("axios");
const _ = require("lodash");

export default {
  name: "BaseTable",
  props: {
    group: String,
    loci: String
  },
  data: function() {
    var sortOrders = {};
    var header = ["ID", "Gene", "P"];
    header.forEach(function(key) {
      sortOrders[key] = 1;
    });
    return {
      columns: header,
      contents: [{ ID: "A", Gene: "B", P: "C" }],
      selected_idx: 0,
      sortKey: "",
      filterKey: "",
      sortOrders: sortOrders
    };
  },
  mounted() {
    axios
      .get(process.env.BASE_URL + `data/${this.group}/table_info.json`)
      .then(response => {
        this.columns = response.data.heading;
        var sortOrders = {};
        this.columns.forEach(function(key) {
          sortOrders[key] = 1;
        });
        this.sortOrders = sortOrders;
        // FIX: This should be a dictionary so that ID is extracted
        this.contents = response.data.data.map(loci =>
          _.zipObject(this.columns, loci)
        );
        this.$emit("updateSelectedLoci", this.contents[0][this.columns[0]]);
      })
      .catch(function(error) {
        console.error(error);
      })
      .finally(function() {});
  },
  computed: {
    filteredLoci: function() {
      var sortKey = this.sortKey;
      var order = this.sortOrders[sortKey] || 1;
      var loci = _.filter(this.contents, o => {
        return o.ID.includes(this.filterKey);
      });

      if (sortKey) {
        loci = loci.slice().sort(function(a, b) {
          a = a[sortKey];
          b = b[sortKey];
          if (sortKey == "ID") {
            a = a.split(":");
            b = b.split(":");
            let chrA = parseInt(a[0].replace("chr", ""));
            let chrB = parseInt(b[0].replace("chr", ""));
            if (chrA !== chrB) return (chrA > chrB ? 1 : -1) * order;
            return (a[1] === b[1] ? 0 : a[1] > b[1] ? 1 : -1) * order;
          }
          return (a === b ? 0 : a > b ? 1 : -1) * order;
        });
      }
      return loci;
    }
  },
  methods: {
    selectLoci: function(idx, loci) {
      this.selected_idx = idx;
      this.$emit("updateSelectedLoci", loci);
    },
    sortBy: function(key) {
      this.sortKey = key;
      this.sortOrders[key] *= -1;
    }
  }
};
</script>

<style scoped>
tr {
  cursor: pointer;
}
.arrow {
  display: inline-block;
  vertical-align: middle;
  width: 0;
  height: 0;
  margin-left: 5px;
  opacity: 0.66;
}

.arrow.asc {
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-bottom: 4px solid #fff;
}

.arrow.dsc {
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 4px solid #fff;
}
</style>
