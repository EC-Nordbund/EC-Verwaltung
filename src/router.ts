import Vue, { CreateElement } from 'vue';
import Router from 'vue-router';
import routes from 'routes:./pages';

Vue.use(Router);

const router = new Router({
  // mode: 'history',
  routes: [
    {
      path: '/',
      children: routes,
      component: {
        render: (h: CreateElement) => h('router-view')
      }
    }
  ]
});

export default router;
