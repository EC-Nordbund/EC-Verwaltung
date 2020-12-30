import { readdirSync, readFileSync } from 'fs'
import { join } from 'path'
import definePlugin from './helper'

let fileIDs

export default () => {
  return definePlugin({
    name: 'icons',

    buildStart() {
      fileIDs = readdirSync('./src/icons').map(f => {
        return this.emitFile({
          type: 'asset',
          name: f,
          source: readFileSync(join('./src/icons', f))
        })
      })
    },
    generateBundle() {
      const icons = fileIDs.map(v => this.getFileName(v)).map(v => [v, v.split('-')[2]])
      // TODO manifest
      console.log(icons)
    }
  })
}
