let   connection        = null
let   name              = null
let   otherUsername     = null
const ws                = new WebSocket('wss://seqr.link:3001')
const error             = error         => { console.error(error) }
const answer            = answr         => { connection.setLocalDescription(answr); sendMessage({type: 'answer',answer: answr}) }
const offer             = ofr           => { sendMessage({ type: 'offer', offer: ofr }); connection.setLocalDescription(ofr)}
const sendMessage       = message       => { message.otherUsername = otherUsername; ws.send(JSON.stringify(message)) }
const closeCall         = ()            => { sendMessage({ type: 'close' }); handleClose() }
const login             = ()            => { sendMessage({type: 'login'}) }
const makeCall          = ()            => { otherUsername = document.querySelector('input#username-to-call').value; connection.createOffer( offer,error ) }
const _close            = ()            => { connection.close(); connection.onicecandidate = null; connection.onaddstream = null }
const _answer           = data          => { connection.setRemoteDescription(new RTCSessionDescription(data.answer)) }
const _candidate        = data          => { connection.addIceCandidate     (new RTCIceCandidate(data.candidate))    }
const _offer            = data          => { otherUsername = data.username; connection.setRemoteDescription(new RTCSessionDescription(data.offer)); connection.createAnswer(answer,error) }
const _login            = async data    => {
    let localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    let local       = document.querySelector('video#local')
    local.volume = 0; local.srcObject = localStream
    connection = new RTCPeerConnection({ iceServers: [{ url: 'stun:seqr.link:3478' }] })
    connection.addStream(localStream)
    connection.onaddstream      = event  => { document.querySelector('video#remote').srcObject = event.stream }
    connection.onicecandidate   = event  => { if (event.candidate) sendMessage({ type: 'candidate', candidate: event.candidate }) }
    document.querySelector('#username').value = data.success
}
const handlers          =                   {_login:_login,_offer:_offer,_answer:_answer,_candidate:_candidate,_close:_close}
ws.onopen               = ()             => { console.log('Connected to the signaling server') }
ws.onmessage            = msg            => { const data = JSON.parse(msg.data); handlers[data.type](data) }
ws.onerror              = error
document.querySelector('button#close-call') .addEventListener('click', closeCall)
document.querySelector('button#call')       .addEventListener('click', makeCall )
document.querySelector('button#login')      .addEventListener('click', login    )
setTimeout(login,1000)
