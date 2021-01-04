import definePlugin from "./helper";
import { version } from '../package.json'
import { readFileSync } from "fs";

const commitHash = readFileSync('./.commithash', 'utf-8').split('\n')[0]

const modulePrefix = 'version:'

export default () => definePlugin({
  name: 'version',

  resolveId(id, importer) {
    if (id.startsWith(modulePrefix)) {
      return id
    }
  },
  load(id) {
    if (id.startsWith(modulePrefix)) {
      return `export default ${JSON.stringify({ version, commitHash })}`
    }
  }
})
