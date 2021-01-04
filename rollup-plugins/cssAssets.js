import { readFileSync } from "fs";
import definePlugin from './helper';


export default () => {
  const cssReplacements = []
  return definePlugin({
    name: 'css-asset-loader',
    async load(id) {
      if (id.endsWith('.css')) {
        const code = readFileSync(id, 'utf8');

        let reg = /url\(('|")([a-zA-Z0-9\-\$\\\/\.]*)('|")\)/g;

        let m;

        do {
          m = reg.exec(code);

          if (m) {
            const requiredFile = m[2];

            const searchString = m[2];

            const resolvedID = await this.resolve(requiredFile, id);

            const parts = requiredFile.split(/\\|\//);

            const assetId = this.emitFile({
              type: 'asset',
              name: parts[parts.length - 1],
              source: readFileSync(resolvedID.id)
            });

            cssReplacements.push([searchString, assetId]);
          }
        } while (m);

        return code;
      }
    },
    generateBundle(options, bundle) {
      Object.keys(bundle).filter(v => v.endsWith('.css')).forEach(cssFile => {
        let code = '';
        let code2 = bundle[cssFile].source.toString();

        while (code !== code2) {
          code = code2;

          cssReplacements.forEach(f => {
            code2 = code2.replace(f[0], this.getFileName(f[1]));

            if (f[0].startsWith('./')) {
              const fi = f[0].slice(2);

              code2 = code2.replace(fi, this.getFileName(f[1]));
            }
          });
        }

        bundle[cssFile].source = code2;
      });
    }
  });
};
