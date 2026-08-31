import { h } from 'vue'
import { RouterView } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

/**
 * Routen-Generator — ersetzt das virtuelle Modul 'routes:../pages' aus
 * rollup-plugins/routes.js. Baut aus dem pages-Verzeichnisbaum das
 * Routen-Array nach der alten Konvention:
 *
 * - Datei `name.route.vue`   -> { path: 'name' }
 * - Datei `_param.route.vue` -> { path: ':param' }
 * - Datei `_.route.vue`      -> Layout { path: '' }, Kinder aus Geschwister-
 *                               Ordner `_/` (falls vorhanden)
 * - Ordner `name/`           -> Pass-Through { render: () => h(RouterView) }
 * - Ordner `_param/`         -> `:param`-Pass-Through
 * - Ordner `_/`              -> übersprungen (wird von `_.route.vue` konsumiert)
 * - pro Ebene ein Catch-all (früher path '*'), der auf /404?prev=... leitet
 */

// eager: true reproduziert das alte Verhalten (alle Seiten im Hauptbundle,
// kein Code-Splitting).
const pages: Record<string, any> = import.meta.glob(
  '../pages/**/*.route.vue',
  { eager: true }
)

const passThrough = { render: () => h(RouterView) }

interface TreeNode {
  files: Map<string, any> // Segmentname -> Seiten-Komponente
  dirs: Map<string, TreeNode>
}

function makeNode(): TreeNode {
  return { files: new Map(), dirs: new Map() }
}

const root = makeNode()

for (const key of Object.keys(pages)) {
  // '../pages/_/ak/_id/_.route.vue' -> ['_', 'ak', '_id', '_.route.vue']
  const segments = key.slice('../pages/'.length).split('/')
  let node = root
  for (const dirName of segments.slice(0, -1)) {
    if (!node.dirs.has(dirName)) {
      node.dirs.set(dirName, makeNode())
    }
    node = node.dirs.get(dirName)!
  }
  // Segmentname = Dateiname bis zum ersten Punkt (wie im alten Plugin)
  const fileName = segments[segments.length - 1].split('.')[0]
  node.files.set(fileName, pages[key].default)
}

// Deterministische Sortierung wie im alten Plugin: statische Routen (0)
// zuerst, :param-Routen (1) danach, das '_'-Layout (path '') zuletzt (2),
// damit dessen innerer Catch-all keine Geschwister-Routen (z. B. /login)
// verschluckt; innerhalb gleichen Rangs localeCompare.
function rank(name: string) {
  if (name === '_') return 2
  if (name[0] === '_') return 1
  return 0
}

function handleFolder(node: TreeNode): RouteRecordRaw[] {
  const entries = [
    ...[...node.files.keys()].map((name) => ({ name, type: 'file' as const })),
    ...[...node.dirs.keys()].map((name) => ({ name, type: 'dir' as const }))
  ].sort((a, b) => rank(a.name) - rank(b.name) || a.name.localeCompare(b.name))

  const ret: RouteRecordRaw[] = []

  for (const entry of entries) {
    if (entry.type === 'file') {
      const component = node.files.get(entry.name)

      if (entry.name === '_') {
        // Layout-Route: konsumiert den Geschwister-Ordner '_'
        const layoutDir = node.dirs.get('_')
        if (layoutDir) {
          ret.push({
            path: '',
            component,
            children: [
              // Alt-Semantik: der Layout-Pfad selbst (z. B. '/') hatte kein
              // eigenes Kind und lief in den '*'-Catch-all → 404-Redirect.
              // vue-router 4 matcht das Layout sonst auch ohne Kind (leerer
              // Inhalt), daher explizites Default-Kind mit Redirect.
              {
                path: '',
                redirect: (to) => ({
                  path: '/404',
                  query: { prev: to.fullPath }
                })
              } as RouteRecordRaw,
              ...handleFolder(layoutDir)
            ]
          })
        } else {
          ret.push({ path: '', component })
        }
      } else if (entry.name[0] === '_') {
        ret.push({ path: `:${entry.name.slice(1)}`, component })
      } else {
        ret.push({ path: entry.name, component })
      }
    } else {
      if (entry.name === '_') {
        // wird von der '_.route.vue'-Datei konsumiert
        continue
      }
      const path =
        entry.name[0] === '_' ? `:${entry.name.slice(1)}` : entry.name
      ret.push({
        path,
        component: passThrough,
        children: handleFolder(node.dirs.get(entry.name)!)
      })
    }
  }

  // Catch-all auf JEDER Ebene (früher path '*'). vue-router 4/5:
  // ':pathMatch(.*)*' und auf Kind-Ebenen RELATIV (ohne führenden '/').
  ret.push({
    path: ':pathMatch(.*)*',
    redirect: (to) => ({ path: '/404', query: { prev: to.fullPath } })
  })

  return ret
}

export const routes = handleFolder(root)
