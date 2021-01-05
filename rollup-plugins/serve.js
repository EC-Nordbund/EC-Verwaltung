import { createServer } from 'http-server'
import WebSocket from 'ws'
import chokidar from 'chokidar'
import definePlugin from './helper'

export default () => {
  let first = true

  return definePlugin({
    name: 'serve',
    generateBundle() {
      if (first) {
        first = false

        const httpServer = createServer({
          cache: -1
        }).listen(8080)

        const wsServer = new WebSocket.Server({
          port: 8081
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

            console.log(`[SERVE] Change Detected - Reload`)

            sockets.forEach((socket) => socket.send('_'))
          }, 500)
        }

        chokidar.watch('./public').on('all', () => reload())
      }
    },
    banner() {
      return `if(!(window||self)._HMR){(new WebSocket('ws://localhost:8081')).onmessage=()=>{console.log("[SERVE] Change Detected - Reload");location.reload();};(window||self)._HMR=true;}`
    }
  })
}
