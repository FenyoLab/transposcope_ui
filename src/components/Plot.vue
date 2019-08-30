<template>
  <div id="plot" style="height: 80vh">
    <svg @mousemove="mouseover" :width="width" :height="height">
      <!--<svg :width="width" :height="height">-->
      <g :style="{ transform: `translate(${margin.left}px, ${margin.top}px` }">
        <path class="line" :d="paths.line" />
        <path class="area" :d="paths.area" />
        <path class="selector" :d="paths.selector" />
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
        area: "",
        selector: ""
      },
      lastHoverPoint: {},
      scaled: {
        x: null,
        x2: null,
        y: null
      },
      points: [],
      selections: {
        svg: null
      },
      zoom: null
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
      .scaleExtent([1, Infinity])
      .translateExtent([[0, 0], [this.width, this.height]])
      .extent([[0, 0], [this.width, this.height]])
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
        .x(d => this.scaled.x(d.x))
        .y0(() => this.height)
        .y1(d => this.scaled.y(d.y));
      return area(points);
    },
    createValueSelector(points) {
      let tmp = d3
        .area()
        .x(d => this.scaled.x(d.x))
        .y0(() => this.height)
        .y1(d => this.scaled.y(d.y));
      return tmp(points);
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
      this.scaled.y.domain([0, d3.max(_.map(this.data, d => d.y))]);
    },
    update() {
      this.points = _.chain(this.data)
        .slice(this.scaled.x.domain()[0], this.scaled.x.domain()[1])
        .value();
      this.paths.line = this.createLine(this.points);
      this.paths.area = this.createArea(this.points);
    },
    mouseover({ offsetX }) {
      if (this.points.length > 0) {
        const x = this.scaled.x.invert(offsetX - this.margin.left);
        const closestPoint = this.getClosestPoint(x);
        if (this.lastHoverPoint.index !== closestPoint.index) {
          const point = this.points[closestPoint.index];
          this.paths.selector = this.createValueSelector([point]);
          this.lastHoverPoint = closestPoint;
        }
      }
    },
    getClosestPoint(x) {
      return this.points
        .map((point, index) => ({
          x: point.x,
          diff: Math.abs(point.x - x),
          index
        }))
        .reduce((memo, val) => (memo.diff < val.diff ? memo : val));
    },
    zoomed() {
      this.scaled.x.domain(
        d3.event.transform.rescaleX(this.scaled.x2).domain()
      );
      this.update();
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
.area {
  fill: #76bf8a;
}
.line {
  stroke: #4f7f5c;
  stroke-width: 1px;
  fill: none;
}
</style>
