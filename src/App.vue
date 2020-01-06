<template>
  <div id="app">
    <nav class="navbar is-primary has-shadow" role="navigation" aria-label="main navigation">
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
          <router-link class="navbar-item" to="/">Home</router-link>
          <a
            class="navbar-item"
            href="https://github.com/FenyoLab/transposcope/wiki"
            target="_blank"
          >Documentation</a>
        </div>
      </div>
    </nav>

    <router-view />
  </div>
</template>

<style>
#app {
  height: 100vh;

  background-color: rgb(200, 200, 200);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: left;
  color: #2c3e50;
}
</style>
