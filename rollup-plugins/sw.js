import definePlugin from './helper'
const swProto = 'sw:'

export default ({ path } = { path: 'sw.js' }) => {
  return definePlugin({
    name: 'service-worker',
    async resolveId(id, importer) {
      if (id.startsWith(swProto)) {
        const resolve = await this.resolve(id.slice(swProto.length), importer)

        return swProto + resolve.id
      }
    },
    load(id) {
      if (id.startsWith(swProto)) {

        return `export default () => {
        if ('serviceWorker' in navigator) {
          return navigator.serviceWorker.register(${JSON.stringify(path)})
        }
        return null
      }`
      }
    }
  })
}