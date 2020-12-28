declare module '*.vue' {
  import Vue from 'vue'
  export default Vue
}

declare module 'routes:*' {
  import { Route } from 'vue-router'
  const routes: Route[]
  export default routes
}
