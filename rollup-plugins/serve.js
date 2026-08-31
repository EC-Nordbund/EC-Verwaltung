import { createServer } from 'http-server'
import WebSocket from 'ws'
import chokidar from 'chokidar'
import definePlugin from './helper'
import consola from "consola";

const PORT = parseInt(process.env.DEV_PORT || '8080')
const WS_PORT = PORT + 1

export default () => {
  let first = true

  return definePlugin({
    name: 'serve',
    generateBundle() {
      if (first) {
        first = false

        const httpServer = createServer({
          cache: -1,
          root: './dist'
        }).listen(PORT)

        const wsServer = new WebSocket.Server({
          port: WS_PORT
        })

        let sockets = []

        wsServer.on('connection', (socket) => {
          sockets.push(socket)

          socket.on('close', () => {
            sockets = sockets.filter((s) => s !== socket)
          })
        })

        let to = null

        function reload() {
          if (to !== null) {
            clearTimeout(to)
          }

          to = setTimeout(() => {
            to = null

            consola.info(`[SERVE] Change Detected - Reload`)

            sockets.forEach((socket) => socket.send('_'))
          }, 500)
        }

        chokidar.watch('./dist').on('all', () => reload())
      }
    },
    banner() {
      return `if(typeof window!=='undefined'&&!self._HMR){(new WebSocket('ws://localhost:${WS_PORT}')).onmessage=()=>{console.log("[SERVE] Change Detected - Reload");location.reload();};self._HMR=true;}`
    }
  })
}
