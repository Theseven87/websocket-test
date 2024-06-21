import { ipcMain } from 'electron'
import WebSocket from 'ws'

type ClientInfo = {
  ws: WebSocket
  ip: string
  port: number
}

const wsServerRegister = async (): Promise<void> => {
  let wss: WebSocket.Server | null = null
  let clients: ClientInfo[] = []

  function startWebSocketServer(
    port: number,
    callback: () => void,
    sendMsgCallbal: (msg: WebSocket.RawData) => void
  ) {
    if (wss) {
      console.warn('WebSocket server is already running.')
      return
    }
    wss = new WebSocket.Server({ port })
    wss.on('connection', (ws: WebSocket, req) => {
      const ip: string =
        (req.headers['x-forwarded-for'] as string)?.split(',').shift() || req.socket.remoteAddress!
      const port = req.socket.remotePort!
      const clientInfo: ClientInfo = {
        ws,
        ip: ip.split('f:').reverse()[0],
        port
      }
      clients.push(clientInfo)
      // const ip = req.socket.remoteAddress
      // console.log(ip)
      callback && callback()

      ws.on('close', () => {
        const index = clients.findIndex((client) => client.ws === ws)
        if (index !== -1) {
          clients.splice(index, 1)
          console.log(`Client with IP: ${ip} and Port: ${port} has disconnected.`)
          callback && callback()
        }
      })
      ws.on('message', (msg) => {
        sendMsgCallbal && sendMsgCallbal(msg)
      })
    })

    console.log(`WebSocket server started on port ${port}`)
  }

  ipcMain.handle('checkWsInstance', async () => {
    if (wss && wss.options) return wss?.options?.port
    return false
  })

  function sendClients(event: Electron.IpcMainInvokeEvent) {
    const addressList = clients.map((item) => `${item.ip}:${item.port}`)
    event.sender.send('clientsList', addressList)
  }

  function sendMessage(event, msg: WebSocket.RawData) {
    event.sender.send('sendMsg2ServerPage', msg.toString())
  }
  ipcMain.handle('startWebSocketServerAtPort', async (event, port) => {
    try {
      startWebSocketServer(
        port,
        () => {
          sendClients(event)
        },
        (msg) => {
          sendMessage(event, msg)
        }
      )
      return true
    } catch (error) {
      console.error('Failed to start WebSocket server:', error)
      return false
    }
  })

  ipcMain.handle('stopWebSocketServer', async () => {
    if (wss) {
      wss.close()
      wss = null
      clients = []
      console.log('WebSocket server stopped')
    }
    return true
  })

  ipcMain.handle('sendMessageByWebsocket', async (_event, msg) => {
    if (clients && clients.length) {
      clients.forEach((item) => {
        item.ws.send(msg)
      })
    }
  })
}

export default { wsServerRegister }
