import { h, ref, watch, computed } from 'vue'
import type { Ref } from 'vue'
import { createRouter, createWebHashHistory, RouterView } from 'vue-router'
import type {
  Router,
  RouteLocationRaw,
  RouteLocationNormalizedLoaded
} from 'vue-router'
import { routes } from './routes'

let router: Router | null = null
let route: Ref<RouteLocationNormalizedLoaded> = null as any

export function installRouter() {
  router = createRouter({
    // Hash-Modus ('#/...') wie bisher (vue-router-3-Default ohne mode-Option)
    history: createWebHashHistory(),
    routes: [
      {
        path: '/',
        children: routes,
        component: {
          render: () => h(RouterView)
        }
      }
    ]
  })

  // currentRoute ist in vue-router 4/5 bereits ein reaktiver Ref —
  // direkt durchreichen (ersetzt das alte afterEach-Konstrukt).
  route = router.currentRoute

  return router
}

function stringQueryRef(name: string): Ref<string> {
  const r = ref(route.value?.query?.[name])

  watch(r, () => {
    router!
      .replace({
        path: route.value.path,
        hash: route.value.hash,
        query: {
          ...route.value.query,
          [name]: r.value
        } as any
      })
      // redundante Navigationen (z. B. Tastendruck ohne effektive Änderung)
      // still schlucken
      .catch(() => {})
  })

  return r as any
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

function numberQueryRef(name: string) {
  const r = stringQueryRef(name)

  const boolRef = computed({
    get: () => {
      return r.value ? parseInt(r.value) : 0
    },
    set: (val) => {
      r.value = val.toString()
    }
  })

  return boolRef
}

function pushWithPrev(loc: RouteLocationRaw) {
  if (typeof loc === 'string') {
    loc = {
      path: loc
    }
  }

  if (!(loc as any).query) {
    ;(loc as any).query = {}
  }

  if (!(loc as any).query.prev) {
    ;(loc as any).query.prev = route.value.fullPath
  }

  return router!.push(loc)
}

export function useRouter() {
  return {
    router,
    route,
    navigate: pushWithPrev,
    stringQueryRef,
    booleanQueryRef,
    numberQueryRef
  }
}
