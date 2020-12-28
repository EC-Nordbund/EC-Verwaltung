import Vue from 'vue'
import Router from 'vue-router'
import routes from 'routes:./pages'
Vue.use(Router)
const router = new Router({
  routes: [
    {
      path: '/',
      children: routes,
      component: {
        render: (h) => h('router-view')
      }
    }
  ]
})
export default router
