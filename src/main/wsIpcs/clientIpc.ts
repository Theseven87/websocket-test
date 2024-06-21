import { ipcMain } from 'electron'
import WebSocket from 'ws'

const wsClientRegister = async (): Promise<void> => {
  let clientWs: WebSocket | null = null
  function connectionWebsocket(
    url: string,
    connectedCallback: () => void,
    sendMsgCallbal: (msg: WebSocket.RawData) => void
  ) {
    clientWs = new WebSocket(url)
    clientWs.on('open', () => {
      connectedCallback && connectedCallback()
      console.log('open')
    })

    clientWs.on('error', console.error)

    clientWs.on('message', (message) => {
      sendMsgCallbal && sendMsgCallbal(message)
    })
  }

  ipcMain.handle('connectionWs', async (event, url: string) => {
    try {
      connectionWebsocket(
        url,
        () => {
          console.log('客户端已连接')
          event.sender.send('sendMsg2ClientPage', 'connected')
        },
        (msg) => {
          event.sender.send('sendMsg2ClientPage', msg.toString())
        }
      )
      return true
    } catch (error) {
      console.error('Failed to start WebSocket server:', error)
      return false
    }
  })

  ipcMain.handle('sendMessageToServer', async (_event, data: string) => {
    clientWs?.send(data)
  })

  ipcMain.handle('disconnection', async (event) => {
    if (clientWs) {
      event.sender.send('sendMsg2ClientPage', 'disconnection')
      clientWs.close()
      clientWs = null
    }
  })
}

export default { wsClientRegister }
