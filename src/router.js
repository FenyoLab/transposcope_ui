import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import Dashboard from './views/Dashboard.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/dashboard/:group1/:group2/:sample/',
      name: 'dashboard',
      component: Dashboard,
      props: true,
      query: { locus: "" }
    }
  ]
})
