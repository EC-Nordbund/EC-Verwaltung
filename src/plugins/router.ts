import Vue from 'vue'
import Router, { RawLocation, Route } from 'vue-router'
import routes from 'routes:../pages'
import { ref, Ref, watch, computed } from '@vue/composition-api'

let router: Router | null = null

export function installRouter() {
  Vue.use(Router)

  router = new Router({
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

  router.afterEach((to) => {
    route.value = to
  })

  route = ref(router.currentRoute)

  return router
}

function stringQueryRef(name: string) {
  const r = ref(route.value?.query?.[name])

  watch(r, () => {
    router.replace({
      ...route.value,
      query: {
        ...route.value.query,
        [name]: r.value
      } as any
    })
  })

  return r
}

function booleanQueryRef(name: string) {
  const r = stringQueryRef(name)

  const boolRef = computed({
    get: () => {
      return r.value && r.value !== 'false'
    },
    set: (val) => {
      r.value = val.toString()
    }
  })

  return boolRef
}

function pushWithPrev(loc: RawLocation) {
  if (typeof loc === 'string') {
    loc = {
      path: loc
    }
  }

  if (!loc.query) {
    loc.query = {}
  }

  if (!loc.query.prev) {
    loc.query.prev = route.value.fullPath
  }

  return router.push(loc)
}

let route: Ref<Route> = null

export function useRouter() {
  return {
    router,
    route,
    navigate: pushWithPrev,
    stringQueryRef,
    booleanQueryRef
  }
}
