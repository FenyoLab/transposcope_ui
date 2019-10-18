<template>
  <div id="app">
    <nav
      class="navbar is-primary"
      role="navigation"
      aria-label="main navigation"
    >
      <div class="navbar-brand">
        <a class="navbar-item" href="/">
          <p class="title has-text-light">TranspoScope</p>
        </a>

        <a
          role="button"
          class="navbar-burger burger"
          aria-label="menu"
          aria-expanded="false"
          data-target="navbarBasicExample"
        >
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>
      </div>

      <div id="navbarBasicExample" class="navbar-menu">
        <div class="navbar-start">
          <a class="navbar-item">
            Home
          </a>

          <a class="navbar-item">
            Documentation
          </a>
        </div>
      </div>
    </nav>
    <section class="section" style="height:calc(100vh - 52px)">
      <div class="columns has-text-grey-dark" style="height: 100%">
        <div class="column is-8" style="height: 100%">
          <div class="box" style="height: 60%">
            <Visualization style="height: 100%"></Visualization>
          </div>
          <div class="box" style="height: calc(40% - 1.5rem)"></div>
        </div>
        <div class="column" style="height: 100%">
          <div
            class="box is-paddingless"
            style="height: 100%;overflow-y: scroll"
          >
            <table
              class="table is-narrow is-fullwidth is-hoverable table is-striped"
              style="height: 100%"
            >
              <thead>
                <tr>
                  <th><abbr title="Chromosome-Position">ID</abbr></th>
                  <th><abbr title="Closest Gene">Gene</abbr></th>
                  <th><abbr title="Insertion Confidence">P</abbr></th>
                  <th><abbr title="View region on UCSC">UCSC</abbr></th>
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
        </div>
      </div>

      <!-- Hero footer: will stick at the bottom -->
    </section>
  </div>
  <!--<div id="app">-->
  <!--  <div><a class="button is-primary">Reads </a></div>-->
  <!--  <Visualization></Visualization>-->
  <!--</div>-->
</template>

<script>
/* eslint-disable */
import Visualization from "./components/plot/BasePlot.vue";
export default {
  name: "app",
  components: {
    Visualization
  }
};
</script>

<style>
html {
  overflow-y: hidden;
}
#app {
  height: 100vh;

  background-color: rgb(200, 200, 200);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: left;
  color: #2c3e50;
}
</style>
