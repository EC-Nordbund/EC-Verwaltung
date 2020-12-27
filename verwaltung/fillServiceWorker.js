const crypto = require('crypto')
const fs = require('fs')
const { join } = require('path')

const cacheExtensions = [
  '.png',
  '.js',
  '.woff',
  '.woff2',
  '.otf',
  '.css',
  '.json',
  '.docx',
  '.xlsx',
  '.webmanifest'
]

const files = []

function readDir(dir) {
  fs.readdirSync(join('./dist', dir)).forEach(f => {
    const file = join(dir, f)

    if (fs.statSync(join('./dist', file)).isFile()) {
      if (cacheExtensions.some((v) => file.endsWith(v))) {
        files.push(file)
      }
    } else {
      readDir(file)
    }
  })
}

readDir('.')

files.push('')
files.push('loading.html')

const hash = crypto.createHash('md5')


const ASSETS = JSON.stringify(files.map(v => '/' + v.replace(/\\|\//g, '/')))
hash.update(ASSETS)
const VERSION = hash.digest('hex')

fs.writeFileSync('./dist/sw.js', fs.readFileSync('./dist/sw.js', 'utf-8').replace('"<ASSETS>"', ASSETS).replace('<VERSION>', VERSION))
