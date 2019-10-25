const WebSocket = require('ws')
const https     = require('https')
const fs        = require('fs')
const uuidv     = require('uuid/v4')
const users     = {}
const sendTo    = (ws, message) => {  ws.send(JSON.stringify(message)) }
const cert      = fs.readFileSync('/var/www/html/seqr.link/crt/certificate.pem')
const key       = fs.readFileSync('/var/www/html/seqr.link/crt/key.pem')
const server    = https.createServer({cert:cert,key:key})
const wss       = new WebSocket.Server({ server })

wss.on('connection', function connection(ws) {
  console.log('User connected')
  ws.on('message', message => {
    let data = null
    let soc  = null
    try { data = JSON.parse(message) } catch (error) { console.error('Invalid JSON', error); data = {} }
    let rsp  = { type: '_' + data.type }
    console.log(data.type)

    switch (data.type) {
      case 'login':
          let uuid      = uuidv()
          ws.username   = uuid
          rsp.success   = uuid
          users[uuid]   = ws
          soc           = ws
        break
      case 'offer':
        if (users[data.otherUsername] != null) {
          ws.otherUsername  = data.otherUsername
          rsp.offer         = data.offer
          rsp.username      = ws.username
          soc               = users[data.otherUsername]
        }
        break
      case 'answer':
        if (users[data.otherUsername] != null) {
          ws.otherUsername  = data.otherUsername
          rsp.answer        = data.answer
          soc               = users[data.otherUsername]
        }
        break
      case 'candidate':
        if (users[data.otherUsername] != null) {
          rsp.candidate     = data.candidate
          soc               = users[data.otherUsername]
        }
        break
      case 'close':
        users[data.otherUsername].otherUsername = null
        if (users[data.otherUsername] != null){
            soc = users[data.otherUsername]
        }
        break
      default:
        soc = ws
        rsp.message = 'Command not found: ' + data.type
        break
    }
    sendTo(soc, rsp)
  })

  ws.on('close', () => {
    if (ws.username) {
      delete users[ws.username]

      if (ws.otherUsername) {
        console.log('Disconnecting from ', ws.otherUsername)
        users[ws.otherUsername].otherUsername = null

        if (users[ws.otherUsername] != null) {
          sendTo(users[ws.otherUsername], { type: 'close' })
        }
      }
    }
  })
})

server.listen(3001)
