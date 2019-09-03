<template>
  <div id="plot" style="height: 80vh">
    <svg @mousemove="mouseover" :width="width" :height="height">
      <!--<svg :width="width" :height="height">-->
      <g :style="{ transform: `translate(${margin.left}px, ${margin.top}px` }">
        <g
          :style="{
            transform: `translate(${transform.x}px, ${
              transform.y
            }px) scaleX(${scaleFactor})`
          }"
        >
          <path class="line" :d="paths.line" />
          <path
            v-for="orientation in orientations"
            v-bind:key="orientation"
            v-bind:class="'area-' + orientation"
            v-bind:d="paths.area[orientation]"
          />
        </g>
      </g>
    </svg>
  </div>
</template>

<script>
const d3 = require("d3");
const _ = require("lodash");
export default {
  name: "Plot",
  props: {
    data: Array,
    margin: {
      type: Object,
      default: () => ({
        left: 0,
        right: 0,
        top: 10,
        bottom: 10
      })
    }
  },
  data() {
    return {
      width: 0,
      height: 0,
      paths: {
        line: "",
        area: { ggn: "", gng: "", ngg: "", gjn: "", gln: "" },
        selector: ""
      },
      lastHoverPoint: {},
      scaled: {
        x: null,
        x2: null,
        y: null
      },
      transform: {
        x: 0,
        y: 0
      },
      points: [],
      stacks: [],
      filterdStacks: [],
      selections: {
        svg: null
      },
      orientations: [],
      zoom: null,
      scaleFactor: 1
    };
  },
  computed: {
    padded() {
      const width = this.width - this.margin.left - this.margin.right;
      const height = this.height - this.margin.top - this.margin.bottom;
      return { width, height };
    }
  },
  mounted() {
    window.addEventListener("resize", this.onResize);
    this.onResize();
    this.initialize();

    this.selections.svg = d3.select(this.$el.querySelector("svg"));
    const svg = this.selections.svg;

    this.zoom = d3
      .zoom()
      .scaleExtent([1, 50])
      .translateExtent([[0, 0], [this.width, 0]])
      .extent([[0, 0], [this.width, 0]])
      .on("zoom", this.zoomed);

    svg.call(this.zoom);
  },
  watch: {
    width: function widthChanged() {
      this.initialize();
      this.update();
    },
    data: function dataChanged() {
      this.initialize();
      this.update();
    }
  },
  methods: {
    createLine(points) {
      let line = d3
        .line()
        .curve(d3.curveStep)
        .x(d => this.scaled.x(d.x))
        .y(d => this.scaled.y(d.y));
      return line(points);
    },
    createArea(points) {
      let area = d3
        .area()
        .curve(d3.curveStep)
        .x(d => this.scaled.x(d.data.key))
        .y0(d => this.scaled.y(d[0]))
        .y1(d => this.scaled.y(d[1]));
      return area(points);
    },
    createValueSelector(point) {
      let points = [
        { y: point[0].total, x: point[0].key - 0.5 },
        { y: point[0].total, x: point[0].key + 0.5 }
      ];
      let tmp = d3
        .area()
        .x(d => this.scaled.x(d.key))
        .y0(() => this.padded.height)
        .y1(d => this.scaled.y(d.total));
      return tmp(point);
    },
    onResize() {
      this.width = this.$el.offsetWidth;
      this.height = this.$el.offsetHeight;
    },
    initialize() {
      this.scaled.x = d3.scaleLinear().range([0, this.padded.width]);
      this.scaled.x2 = d3.scaleLinear().range([0, this.padded.width]);
      this.scaled.y = d3.scaleLinear().range([this.padded.height, 0]);
      d3.axisLeft().scale(this.scaled.x);
      d3.axisBottom().scale(this.scaled.y);
      this.scaled.x.domain(d3.extent(this.data, (d, i) => i));
      this.scaled.x2.domain(this.scaled.x.domain());
      // TODO: The max/min etc should be passed as props
      this.scaled.y.domain([0, d3.max(_.map(this.data, d => d.total))]);
      if (this.data.length > 0)
        this.orientations = _.map(this.data[0].classes, d => d.name);
      this.stacks = d3
        .stack()
        .keys(_.map(this.orientations, (d, i) => i))
        .value(function(d, key) {
          return d.classes[key].total;
        })(this.data);
      this.paths.area = {};
      _.forEach(this.orientations, d => {
        this.paths.area[d] = "";
      });
    },
    update() {
      this.points = this.stacks;
      //this.paths.line = this.createLine(this.points);
      _.forEach(this.orientations, (d, i) => {
        this.paths.area[d] = this.createArea(this.points[i]);
      });
    },
    mouseover({ offsetX }) {
      if (this.data.length > 0) {
        const x = this.scaled.x.invert(
          (offsetX - this.margin.left - this.transform.x) / this.scaleFactor
        );
        const closestPoint = this.getClosestPoint(x);
        if (this.lastHoverPoint.index !== closestPoint.index) {
          const point = this.data[closestPoint.index];
          this.paths.selector = this.createValueSelector([point]);
          this.lastHoverPoint = closestPoint;
        }
      }
    },
    getClosestPoint(x) {
      return this.data
        .map((point, index) => ({
          x: point.key,
          diff: Math.abs(point.key - x),
          index
        }))
        .reduce((memo, val) => (memo.diff < val.diff ? memo : val));
    },
    zoomed() {
      // TODO: on pans the area should not be redrawn, just translated
      // this.scaled.x.domain(
      //   d3.event.transform.rescaleX(this.scaled.x2).domain()
      // );
      this.transform.x = d3.event.transform.x;
      this.transform.y = d3.event.transform.y;
      this.scaleFactor = d3.event.transform.k;
      //if (this.scaleFactor !== d3.event.transform.k) {
      //   this.scaleFactor = d3.event.transform.k;
      //    this.filterdStacks = _.map(this.stacks, d =>
      //      _.filter(d, (v, i) => {
      //        return i % Math.floor(50 / this.scaleFactor) == 0;
      //      })
      //    );
      //this.update();
      // }
    }
  }
};
</script>

<style>
.selector {
  stroke: #28402e;
  stroke-width: 3px;
  fill: none;
}
.area-ggn {
  fill: #22ff22;
}
.area-ngg {
  fill: #2222ff;
}
.area-gng {
  fill: #ff2222;
}
.area-gjn {
  fill: #fc8803;
}
.area-gln {
  fill: #b707e3;
}
.line {
  stroke: #4f7f5c;
  stroke-width: 0.25px;
  fill: none;
}
</style>
