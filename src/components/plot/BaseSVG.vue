<template>
  <div id="plot" style="height: 100%">
    <article
      class="base-stats message is-small is-dark"
      :style="
        'top:' +
          lastHoverPoint.offsetY +
          'px;left:' +
          (lastHoverPoint.offsetX + 60) +
          'px;opacity:0.9'
      "
      v-if="hoverPointStats !== null"
    >
      <div class="message-header">
        <p>Stats</p>
      </div>
      <div class="message-body">
        <p v-for="(value, name) in hoverPointStats.bpStat" :key="name">
          {{ name }}: {{ value }}
          {{ "(" + Math.floor(100 * (value / hoverPointStats.total||0)) + "%)" }}
        </p>
        <p>Total: {{ hoverPointStats.total }}</p>
        <p>x: {{ hoverPointStats.key }}</p>
      </div>
    </article>
    <svg :width="width" :height="height">
      <g :style="{ transform: `translate(${margin.left}px, ${margin.top}px` }">
        <g class="bases" />

        <g
          :style="{
            transform: `translate(${transform.x}px, ${
              transform.y
            }px) scaleX(${scaleFactor})`
        }"
          @mousemove="mouseover"
          @mouseleave="hoverPointStats = null"
        >
          <path
            v-for="orientation in orientations"
            v-bind:key="orientation"
            v-bind:class="orientation"
            v-bind:d="paths.area[orientation]"
            v-bind:style="'fill:' + fills[orientation]"
          />
          <!-- TODO: add a color parameter -->
          <rect
            v-for="item in paths.rects"
            :key="item.name"
            :x="scaled.x(item.x[0]+0.5)"
            :width="scaled.x(item.x[1])"
            :y="0"
            :height="padded.height"
            :stroke="item.color"
            :stroke-width="1/scaleFactor"
            :style="'fill:' + item.color + ';fill-opacity:0.2'"
          >
            <title>{{ item.name }}</title>
          </rect>
          <path class="selector" v-if="hoverPointStats" :d="paths.selector" />
        </g>

        <g class="axis axis--x" @mousemove="mouseover" @mouseleave="hoverPointStats = null" />
        <g class="axis axis--y" @mousemove="mouseover" @mouseleave="hoverPointStats = null" />
        <g class="snpbases" />
      </g>

      <pattern
        id="PgjJ"
        v-bind:x="0"
        v-bind:width="5 / scaleFactor"
        v-bind:height="5 / scaleFactor"
        patternUnits="userSpaceOnUse"
        v-bind:patternTransform="'scale(1 ' + scaleFactor + ')'"
      >
        <rect x="0" width="5" height="5" y="0" fill="#fc8803" />
        <path
          stroke="white"
          v-bind:stroke-width="0.5 / scaleFactor"
          v-bind:d="'M 0, ' + 5 / scaleFactor + ' L ' + 5 / scaleFactor + ',0'"
        />
      </pattern>
      <pattern
        id="Pg_jJ"
        v-bind:x="0"
        v-bind:width="5 / scaleFactor"
        v-bind:height="5 / scaleFactor"
        patternUnits="userSpaceOnUse"
        v-bind:patternTransform="'scale(1 ' + scaleFactor + ')'"
      >
        <rect x="0" width="5" height="5" y="0" fill="#aa0000" />
        <path
          stroke="white"
          v-bind:stroke-width="0.5 / scaleFactor"
          v-bind:d="'M 0, ' + 5 / scaleFactor + ' L ' + 5 / scaleFactor + ',0'"
        />
      </pattern>

      <pattern
        id="PglL"
        v-bind:x="0"
        v-bind:width="5 / scaleFactor"
        v-bind:height="5 / scaleFactor"
        patternUnits="userSpaceOnUse"
        v-bind:patternTransform="'scale(1 ' + scaleFactor + ')'"
      >
        <rect x="0" width="5" height="5" y="0" fill="#3399cc" />
        <path
          stroke="white"
          v-bind:stroke-width="0.5 / scaleFactor"
          v-bind:d="'M 0, ' + 5 / scaleFactor + ' L ' + 5 / scaleFactor + ',0'"
        />
      </pattern>
      <pattern
        id="Pjn"
        v-bind:x="0"
        v-bind:width="5 / scaleFactor"
        v-bind:height="5 / scaleFactor"
        patternUnits="userSpaceOnUse"
        v-bind:patternTransform="'scale(1 ' + scaleFactor + ')'"
      >
        <rect x="0" width="5" height="5" y="0" fill="#888800" />
        <path
          stroke="white"
          v-bind:stroke-width="0.5 / scaleFactor"
          v-bind:d="'M 0, ' + 5 / scaleFactor + ' L ' + 5 / scaleFactor + ',0'"
        />
      </pattern>
      <pattern
        id="Pjj"
        v-bind:x="0"
        v-bind:width="5 / scaleFactor"
        v-bind:height="5 / scaleFactor"
        patternUnits="userSpaceOnUse"
        v-bind:patternTransform="'scale(1 ' + scaleFactor + ')'"
      >
        <rect x="0" width="5" height="5" y="0" fill="#CC8800" />
        <path
          stroke="white"
          v-bind:stroke-width="0.5 / scaleFactor"
          v-bind:d="'M 0, ' + 5 / scaleFactor + ' L ' + 5 / scaleFactor + ',0'"
        />
      </pattern>
      <pattern
        id="Pll"
        v-bind:x="0"
        v-bind:width="5 / scaleFactor"
        v-bind:height="5 / scaleFactor"
        patternUnits="userSpaceOnUse"
        v-bind:patternTransform="'scale(1 ' + scaleFactor + ')'"
      >
        <rect x="0" width="5" height="5" y="0" fill="#173a6e" />
        <path
          stroke="white"
          v-bind:stroke-width="0.5 / scaleFactor"
          v-bind:d="'M 0, ' + 5 / scaleFactor + ' L ' + 5 / scaleFactor + ',0'"
        />
      </pattern>
      <pattern
        id="Pln"
        v-bind:x="0"
        v-bind:width="5 / scaleFactor"
        v-bind:height="5 / scaleFactor"
        patternUnits="userSpaceOnUse"
        v-bind:patternTransform="'scale(1 ' + scaleFactor + ')'"
      >
        <rect x="0" width="5" height="5" y="0" fill="#666644" />
        <path
          stroke="white"
          v-bind:stroke-width="0.5 / scaleFactor"
          v-bind:d="'M 0, ' + 5 / scaleFactor + ' L ' + 5 / scaleFactor + ',0'"
        />
      </pattern>
    </svg>
  </div>
</template>

<script>
const d3 = require("d3");
const _ = require("lodash");
const mapping = { T: "red", G: "orange", A: "green", C: "blue", X: "black" };
export default {
  name: "Plot",
  props: {
    data: Array,
    referenceSeq: String,
    info: Array,
    margin: {
      type: Object,
      default: () => ({
        left: 25,
        right: 5,
        top: 10,
        bottom: 25
      })
    }
  },
  data() {
    return {
      width: 0,
      height: 0,
      paths: {
        line: { "5p": "" },
        rects: {},
        area: { gg: "", g_g: "", gj: "", gl_l: "", gl_g: "" },
        selector: ""
      },
      lastHoverPoint: {},
      scaled: {
        x: d3.scaleLinear().range([0, 0]),
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
      zoom: null,
      scaleFactor: 1,
      baseFactor: 100,
      fills: {
        gg: "#999999", //Gray
        gn: "#888800", // Green
        g_g: "#db1a1a", // Red
        g_jG: "#aa0000", // Red
        g_jJ: "url(#Pg_jJ)", // Red Striped
        gjJ: "url(#PgjJ)", // orange striped
        gjG: "#fc8803", // orange
        glL: "url(#PglL)", // Blue
        glG: "#b707e3", // Purple
        jn: "url(#Pjn)",
        jj: "url(#Pjj)",
        jlJ: "url(#PgjJ)",
        jlL: "url(#PgjJ)",
        j_j3: "#FFFF00",
        j_j5: "#FF00FF",
        ln: "url(#Pln)",
        ll: "url(#Pll)"
      },
      hoverPointStats: null,
      snps: [],
      orientations: [
        "gg",
        "jj",
        "ll",
        "gn",
        "jn",
        "ln",
        "g_g",
        "g_jG",
        "g_jJ",
        "gjG",
        "gjJ",
        "glL",
        "glG",
        "jlJ",
        "jlL",
        "j_j5",
        "j_j3"
      ],
      scaleToStack: false,
      order: d3.stackOrderDescending,
      offset: d3.stackOffsetNone,
      type: "stacked"
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
    this.$root.$on("updatedOrientations", orientations => {
      this.orientations = orientations;
      this.initialize();
      this.update();
    });
    this.$root.$on("updateChartType", type => {
      if (type === "stacked") {
        this.order = d3.stackOrderDescending;
        this.offset = d3.stackOffsetNone;
        this.scaleToStack = false;
      } else if (type === "stream") {
        this.order = d3.stackOrderInsideOut;
        this.offset = d3.stackOffsetSilhouette;
        this.scaleToStack = true;
      }
      if (this.type !== type) {
        this.type = type;
        this.initialize();
        this.update();
      }
    });
    window.addEventListener("resize", this.onResize);
    this.onResize();

    this.initialize();
  },
  watch: {
    width: function widthChanged() {
      this.initialize();
      this.update();
    },
    height: function heightChanged() {
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
      let offset = this.scaleToStack ? point[0].total / 2 : 0;
      let points = [
        { y: point[0].total, x: point[0].key - 0.5 },
        { y: point[0].total, x: point[0].key + 0.5 }
      ];
      let tmp = d3
        .area()
        .x(d => this.scaled.x(d.x))
        .y0(() => this.scaled.y(0 - offset))
        .y1(d => this.scaled.y(d.y - offset));
      return tmp(points);
    },
    onResize() {
      this.width = this.$el.offsetWidth;
      this.height = this.$el.offsetHeight;
    },
    initialize() {
      this.selections.svg = d3.select(this.$el.querySelector("svg"));

      this.selections.svg
        .select(".snpbases")
        .selectAll("rect")
        .remove();

      this.selections.svg
        .select(".bases")
        .selectAll("rect")
        .remove();

      this.selections.gx = this.selections.svg.select(".axis--x");
      this.selections.gy = this.selections.svg.select(".axis--y");

      this.scaled.x = d3.scaleLinear().range([0, this.padded.width]);
      this.scaled.y = d3.scaleLinear().range([this.padded.height, 0]);

      this.scaled.x.domain(d3.extent(this.data, (d, i) => i));
      this.stacks = d3
        .stack()

        .order(this.order)
        .offset(this.offset)
        .keys(this.orientations)
        .value(function(d, key) {
          return d.classes[key];
        })(this.data);
      this.paths.area = {};
      _.forEach(this.orientations, d => {
        this.paths.area[d] = "";
      });
      // TODO: Add an option for whether to scale or not
      if (this.scaleToStack) {
        this.scaled.y.domain([
          d3.min(this.stacks, l => d3.min(l, d => d[0]) * 1.05),
          d3.max(this.stacks, l => d3.max(l, d => d[1]) * 1.05)
        ]);
      } else {
        this.scaled.y.domain([
          0,
          d3.max(_.map(this.data, d => d.total)) * 1.05
        ]);
      }

      this.axis.x = d3
        .axisTop()
        .scale(this.scaled.x)
        .ticks((this.padded.width / 1000) * 5, "~s")
        .tickSize(-this.padded.height)
        .tickPadding(-this.padded.height - 10);

      let yMax = Math.floor(this.scaled.y.domain()[1]) || 0;
      this.axis.y = d3
        .axisLeft()
        .scale(this.scaled.y)
        .ticks(yMax / 8 > 1 ? 8 : yMax, "~s")
        .tickSize(-this.padded.width)
        .tickPadding(this.margin.left * 0.25);
      // .tickFormat(d3.format("d"));

      if (this.selections.svg) {
        this.selections.gx.call(this.axis.x);
        this.selections.gy.call(this.axis.y);
      }

      const pixelsPerBase = 10;

      const maxScaleFactor =
        (pixelsPerBase / this.width) *
        Math.abs(this.scaled.x.domain()[1] - this.scaled.x.domain()[0]);

      this.baseFactor =
        (8 / this.width) *
        Math.abs(this.scaled.x.domain()[1] - this.scaled.x.domain()[0]);

      this.zoom = d3
        .zoom()
        .scaleExtent([1, maxScaleFactor])
        .translateExtent([[0, 0], [this.width, 0]])
        .extent([[0, 0], [this.width, 0]])
        .on("zoom", this.zoomed);

      this.selections.svg.call(this.zoom.transform, d3.zoomIdentity);

      this.selections.svg.call(this.zoom);

      this.snps = [];
      _.forEach(this.data.slice(1), (position, index) => {
        let dominant = _.chain(position.bpStat)
          .entries()
          .maxBy(1)
          .value();
        if (
          dominant[1] > 0 &&
          dominant[0].toUpperCase() !==
            this.referenceSeq.charAt(index).toUpperCase()
        ) {
          this.snps.push({ x: index, snp: dominant[0] });
        }
      });
      this.paths.rects = this.info;
      // _.forEach(this.info, (position, name) => {
      //   this.paths.rects[name] = position;
      // });
    },
    update() {
      this.points = this.stacks;
      _.forEach(this.orientations, (d, i) => {
        this.paths.area[d] = this.createArea(this.points[i]);
      });
    },
    mouseover({ offsetX, offsetY }) {
      if (this.data.length > 0) {
        const x = this.scaled.x.invert(
          (offsetX - this.margin.left - this.transform.x) / this.scaleFactor
        );
        const closestPoint = this.getClosestPoint(x);

        if (this.lastHoverPoint.index !== closestPoint.index) {
          const point = this.data[closestPoint.index];
          this.paths.selector = this.createValueSelector([point]);
          this.hoverPointStats = point;
        }
        this.lastHoverPoint = closestPoint;
        this.lastHoverPoint.offsetY = offsetY;
        this.lastHoverPoint.offsetX = offsetX;
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

      let currentScale = d3.event.transform.rescaleX(this.scaled.x);
      let dom = currentScale.domain();

      let bases = [];
      let diff = [];
      let domZeroOffset = Math.max(dom[0] - 4, 0);
      if (this.scaleFactor > this.baseFactor) {
        bases = _.slice(
          this.referenceSeq,
          Math.floor(domZeroOffset),
          Math.floor(dom[1] + 5)
        );
        diff = _.filter(this.snps, snp => snp.x <= dom[1] && snp.x >= dom[0]);
      }

      let snpRects = this.selections.svg
        .select(".snpbases")
        .selectAll("rect")
        .data(diff);

      snpRects
        .enter()
        .append("rect")
        .attr("x", d => currentScale(d.x))
        .attr("y", this.padded.height + 13)
        .attr("height", 5)
        .attr("width", currentScale(1) - currentScale(0))
        .style("fill", d => mapping[d.snp.toUpperCase()]);

      snpRects
        .attr("x", d => currentScale(d.x + 0.5))
        .attr("y", this.padded.height + 13)
        .attr("height", 5)
        .attr("width", currentScale(1) - currentScale(0))
        .style("fill", d => mapping[d.snp.toUpperCase()]);

      snpRects.exit().remove();

      let rects = this.selections.svg
        .select(".bases")
        .selectAll("rect")
        .data(bases);

      rects
        .enter()
        .append("rect")
        .attr("x", (d, i) => currentScale(i + Math.floor(domZeroOffset)))
        .attr("y", this.padded.height + 19)
        .attr("height", 5)
        .attr("width", currentScale(1) - currentScale(0))
        .style("fill", d => mapping[d.toUpperCase()]);

      rects
        .attr("x", (d, i) => currentScale(i + 0.5 + Math.floor(domZeroOffset)))
        .attr("y", this.padded.height + 19)
        .attr("height", 5)
        .attr("width", currentScale(1) - currentScale(0))
        .style("fill", d => mapping[d.toUpperCase()]);

      rects.exit().remove();
    }
  }
};
</script>

<style>
.base-stats {
  position: absolute;
  z-index: 100;
}
.selector {
  stroke: None;
  fill: black;
  opacity: 0.5;
}
.line {
  stroke: #4f7f5c;
  stroke-width: 0.25px;
  fill: none;
}

.axis line {
  stroke: #888888;
  opacity: 0.2;
  /* stroke-width: 0.25px;
  fill: none;*/
}

.axis .domain {
  /* stroke: #ff0000; */
  opacity: 0.2;
}
</style>
