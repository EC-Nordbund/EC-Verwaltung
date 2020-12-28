import { Route } from 'vue-router'

declare module 'routes:*' {
  const routes: Route[]
  export default routes
}
