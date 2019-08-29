<template>
  <div id="plot" style="height: 80vh">
    <svg @mousemove="mouseover" :width="width" :height="height">
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
    createLine: d3
      .line()
      .curve(d3.curveStep)
      .x(d => d.x)
      .y(d => d.y),
    createArea: d3
      .area()
      .curve(d3.curveStep)
      .x(d => d.x)
      .y0(d => d.base)
      .y1(d => d.y),
    createValueSelector: d3
      .area()
      .x(d => d.x)
      .y0(d => d.base)
      .y1(d => d.max),
    onResize() {
      this.width = this.$el.offsetWidth;
      this.height = this.$el.offsetHeight;
    },
    initialize() {
      //this.scaled.x = d3.scaleLinear().range([0, this.padded.width]);
      this.scaled.x = d3.scaleLinear().range([0, this.padded.width]);
      this.scaled.y = d3.scaleLinear().range([this.padded.height, 0]);
      d3.axisLeft().scale(this.scaled.x);
      d3.axisBottom().scale(this.scaled.y);
      this.scaled.x.domain(d3.extent(this.data, (d, i) => i));
      this.scaled.y.domain([0, d3.max(this.data)]);
    },
    update() {
      console.log(this.scaled.x.domain());
      this.points = _.chain(this.data)
        .slice(this.scaled.x.domain()[0], this.scaled.x.domain()[1])
        .map((d, i) => {
          return {
            x: this.scaled.x(this.scaled.x.domain()[0] + i),
            y: this.scaled.y(d),
            max: this.scaled.y(d),
            base: this.height
          };
        })
        .value();
      console.log(this.points);
      this.paths.line = this.createLine(this.points);
      this.paths.area = this.createArea(this.points);
    },
    mouseover({ offsetX }) {
      if (this.points.length > 0) {
        const x = offsetX - this.margin.left;
        const closestPoint = this.getClosestPoint(x);
        if (this.lastHoverPoint.index !== closestPoint.index) {
          const point = this.points[closestPoint.index];
          this.paths.selector = this.createValueSelector([point]);
          this.lastHoverPoint = closestPoint;
        }
      }
    },
    zoomed() {
      this.scaled.x.domain([950, 1050]);
      this.update();
      //this.scaled.x = d3.event.transform.rescaleX(this.scaled.x);
      //console.log(d3.event.sourceEvent.offsetX);
    },
    getClosestPoint(x) {
      return this.points
        .map((point, index) => ({
          x: point.x,
          diff: Math.abs(point.x - x),
          index
        }))
        .reduce((memo, val) => (memo.diff < val.diff ? memo : val));
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
