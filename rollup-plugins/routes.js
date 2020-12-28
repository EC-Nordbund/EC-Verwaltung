import { join } from "path";
import dirTree from "directory-tree"

const routeProto = 'routes:'

function handleFolder(folder) {
  let ret = folder.map(v => {
    if (v.type === 'file') {
      let path = v.name.split('.')[0];

      if (path === '_') {
        let fol = folder.filter(e => e.name === '_').filter(v => v.type !== 'file')[0]

        if (fol) {
          return {
            path: '',
            component: `/|${cmp(v.path)}|/`,
            children: handleFolder(fol.children)
          }
        } else {
          return {
            path: '',
            component: `/|${cmp(v.path)}|/`
          }
        }



      } else if (path[0] === '_') {
        return {
          path: `:${path.substr(1)}`,
          component: `/|${cmp(v.path)}|/`
        }
      } else {
        return {
          path,
          component: `/|${cmp(v.path)}|/`
        }
      }
    } else {
      let path = v.name.split('.')[0];
      if (path === '_') {
        return null
      } else if (path[0] === '_') {
        return {
          path: `:${path.substr(1)}`,
          children: handleFolder(v.children),
          component: { render: `/|(h) => h('router-view')|/` }
        }
      } else {
        return {
          path,
          children: handleFolder(v.children),
          component: { render: `/|(h) => h('router-view')|/` }
        }
      }
    }
  }).filter(v => !!v)

  ret.push({
    path: '*',
    redirect: `/|(to) => ({path: '/404', query: {prev: to.fullPath}})|/`
  })

  return ret
}

let counter = 0
let imp = ''
function cmp(path) {
  counter++
  imp += `import cmp${counter} from '${path.replace(/\\|\//g, '/')}'\n`
  return `cmp${counter}`
}

export default () => ({
  name: 'route-generator',
  resolveId(id, importer) {
    if (id.startsWith(routeProto)) {
      const parts = importer.split(/\\|\//)
      const path = join(parts.slice(0, parts.length - 1).join('/'), id.slice(routeProto.length))

      return routeProto + path
    }
  },
  load(id) {
    if (id.startsWith(routeProto)) {
      const tree = dirTree(id.slice(routeProto.length));

      let val = 'export default ' + JSON.stringify(handleFolder(tree.children)).split('"/|').join('').split('|/"').join('').split('\\\\').join('/')

      return imp + val
    }
  }
})
