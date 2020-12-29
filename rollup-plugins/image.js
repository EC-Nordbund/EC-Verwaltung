import definePlugin from './helper'
import { readFileSync } from "fs";

export default () => {
  return definePlugin({
    name: 'image-loader',
    load(id) {
      const endungen = ['png', 'webp', 'jpg', 'jpeg'];

      const p = id.split('.');
      const end = p[p.length - 1];
      if (endungen.includes(end)) {
        const nameParts = p[p.length - 2].split(/\\|\//);

        // TODO: compile to webp

        const em = this.emitFile({
          type: 'asset',
          name: nameParts[nameParts.length - 1] + '.' + end,
          source: readFileSync(id)
        });

        return `export default import.meta.ROLLUP_FILE_URL_${em}`;
      }
    }
  })
}
