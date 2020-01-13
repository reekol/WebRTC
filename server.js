const WebSocket = require('ws')
const https     = require('https')
const fs        = require('fs')
const express   = require('express')
const app       = express()
const uuidv     = require('uuid/v4')
const users     = {}
const sendTo    = (ws, message) => {  ws.send(JSON.stringify(message)) }
const cert      = fs.readFileSync('./crt/certificate.pem')
const key       = fs.readFileSync('./crt/key.pem')
const server    = https.createServer({cert:cert,key:key},app)
const wss       = new WebSocket.Server({ server: server , path: '/socket'})
const cwd       = process.cwd()
let d = console.log

wss.on('connection', ws => {
  ws.on('message', message => {
    let data = null
    let soc  = null
    try { data = JSON.parse(message) } catch (error) { console.error('Invalid JSON', error); data = {} }
    let rsp  = { type: '_' + data.type }
    console.log(data.type)

    switch (data.type) {
      case 'login':
          let uuid
          while( uuid = uuidv().substring(0,3) ) if(typeof users[uuid] === 'undefined') break;
          ws.username       = uuid
          rsp.success       = uuid
          users[uuid]       = ws
          soc               = ws
        break
      case 'offer':
          ws.otherUsername  = data.otherUsername
          rsp.offer         = data.offer
          rsp.username      = ws.username
          soc               = users[data.otherUsername]
        break
      case 'answer':
          ws.otherUsername  = data.otherUsername
          rsp.answer        = data.answer
          soc               = users[data.otherUsername]
        break
      case 'candidate':
          rsp.candidate     = data.candidate
          soc               = users[data.otherUsername]
        break
      case 'close':
          users[data.otherUsername].otherUsername = null
          soc               = users[data.otherUsername]
        break
      default:
          soc               = ws
          rsp.message       = 'Command not found: ' + data.type
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
          sendTo(users[ws.otherUsername], { type: '_close' })
        }
      }
    }
  })
})

app.get('/favicon.ico', (req, res) => res.sendFile(`${cwd}/icon.png`    ) )
app.get('/',            (req, res) => res.sendFile(`${cwd}/index.html`  ) )
app.get('/style.css',   (req, res) => res.sendFile(`${cwd}/style.css`   ) )
app.get('/client.js',   (req, res) => res.sendFile(`${cwd}/client.js`   ) )
server.listen(3001)
