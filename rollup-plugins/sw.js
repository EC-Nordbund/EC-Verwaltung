const swProto = 'sw:'

export default ({ path } = { path: 'sw.js' }) => ({
  name: 'route-generator',
  async resolveId(id, importer) {
    if (id.startsWith(swProto)) {
      const resolve = await this.resolve(id.slice(swProto.length), importer)

      return swProto + resolve.id
    }
  },
  load(id) {
    if (id.startsWith(swProto)) {
      this.emitFile({
        type: 'chunk',
        id: id.slice(swProto.length),
        fileName: path
      })

      return `
        export default () => {
          if ('serviceWorker' in navigator) {
            return navigator.serviceWorker.register(${JSON.stringify(path)});
          }
          return null
        }
      `
    }
  }
})
