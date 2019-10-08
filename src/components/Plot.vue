<template>
  <div id="plot" style="height: 80vh">
    <svg @mousemove="mouseover" :width="width" :height="height">
      <g class="axis axis--x"></g>
      <g class="axis axis--y"></g>
      <g class="bases"></g>
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
      axis: {
        x: null,
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
        svg: null,
        gx: null,
        gy: null
      },
      orientations: [],
      zoom: null,
      scaleFactor: 1,
      sequence: Array.from({ length: 4999 }, () =>
        Math.floor(Math.random() * 4)
      )
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
    this.onResize();
    this.initialize();
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
      window.addEventListener("resize", this.onResize);
      this.selections.svg = d3.select(this.$el.querySelector("svg"));

      this.selections.gx = this.selections.svg.select(".axis--x");
      this.selections.gy = this.selections.svg.select(".axis--y");

      this.scaled.x = d3.scaleLinear().range([0, this.padded.width]);
      this.scaled.x2 = d3.scaleLinear().range([0, this.padded.width]);
      this.scaled.y = d3.scaleLinear().range([this.padded.height, 0]);

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

      this.axis.x = d3
        .axisTop()
        .scale(this.scaled.x)
        .ticks((this.width / 2 / (this.height + 2)) * 10)
        .tickSize(-this.height)
        .tickPadding(5 - this.height);
      this.axis.y = d3
        .axisRight()
        .scale(this.scaled.y)
        .ticks(10)
        .tickSize(this.width)
        .tickPadding(8 - this.width);

      // FIXME: Every initialize adds new axis

      if (this.selections.svg) {
        this.selections.gx.call(this.axis.x);
        this.selections.gy.call(this.axis.y);
      }

      const pixelsPerBase = 10;

      const maxScaleFactor =
        (pixelsPerBase / this.width) *
        Math.abs(this.scaled.x.domain()[1] - this.scaled.x.domain()[0]);

      this.zoom = d3
        .zoom()
        .scaleExtent([1, maxScaleFactor])
        .translateExtent([[0, 0], [this.width, 0]])
        .extent([[0, 0], [this.width, 0]])
        .on("zoom", this.zoomed);

      this.selections.svg.call(this.zoom);
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
      this.transform.x = d3.event.transform.x;
      this.transform.y = d3.event.transform.y;
      this.scaleFactor = d3.event.transform.k;

      this.selections.gx.call(
        this.axis.x.scale(d3.event.transform.rescaleX(this.scaled.x))
      );

      const currentScale = d3.event.transform.rescaleX(this.scaled.x);
      const dom = currentScale.domain();
      const mapping = ["red", "orange", "green", "blue"];
      console.log(dom);

      if (this.scaleFactor > 35) {
        let rects = this.selections.svg
          .select(".bases")
          .selectAll("rect")
          .data(_.slice(this.sequence, Math.floor(dom[0]), Math.floor(dom[1])));

        rects
          .enter()
          .append("rect")
          .attr("x", (d, i) => currentScale(i + Math.floor(dom[0])))
          .attr("height", this.scaled.y(500))
          .attr("width", currentScale(1) - currentScale(0))
          .style("fill", d => mapping[d]);

        rects
          .attr("x", (d, i) => currentScale(i + Math.floor(dom[0])))
          .attr("height", this.scaled.y(500))
          .attr("width", currentScale(1) - currentScale(0))
          .style("fill", d => mapping[d]);

        rects.exit().remove();
      }
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
