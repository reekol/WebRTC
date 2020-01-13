let   connection        = null
let   name              = null
let   otherUsername     = null
const ws                = new WebSocket('wss://seqr.link:3001/socket')
const error             = error         => { console.error(error) }
const answer            = answr         => { connection.setLocalDescription(answr); sendMessage({type: 'answer',answer: answr}) }
const offer             = ofr           => { sendMessage({ type: 'offer', offer: ofr }); connection.setLocalDescription(ofr)}
const sendMessage       = message       => { message.otherUsername = otherUsername; ws.send(JSON.stringify(message)) }
const closeCall         = ()            => { sendMessage({type: 'close' }); handleClose() }
const login             = ()            => { sendMessage({type: 'login'}) }
const makeCall          = ()            => { otherUsername = document.querySelector('input#username-to-call').value; connection.createOffer( offer,error ) }
const _close            = ()            => { connection.close(); connection.onicecandidate = null; connection.onaddstream = null }
const _answer           = data          => { connection.setRemoteDescription(new RTCSessionDescription(data.answer)) }
const _candidate        = data          => { connection.addIceCandidate     (new RTCIceCandidate(data.candidate))    }
const _offer            = data          => { otherUsername = data.username; connection.setRemoteDescription(new RTCSessionDescription(data.offer)); connection.createAnswer(answer,error) }
const _login            = async data    => {
    let local      = document.querySelector('video#local')
    let videoMode  = document.querySelector('select#videoMode').value
    let audioMode  = document.querySelector('select#audioMode').value
    let hasAudio   = ['sendrecv','sendonly'].includes(audioMode)
    let hasVideo   = ['sendrecv','sendonly'].includes(videoMode)
    let hasMedia   = ( hasAudio || hasVideo )
        connection = new RTCPeerConnection({ iceServers: [{ url: 'stun:seqr.link:3478' }] })
    if(hasMedia){
        let localStream = await navigator.mediaDevices.getUserMedia({ video: hasVideo, audio: hasAudio })
        local.volume = 0
        local.srcObject = localStream
        local.style.visibility = 'visible'
        connection.addStream(localStream)
    }

    connection.addTransceiver('video',{currentDirection:videoMode})
    connection.addTransceiver('audio',{currentDirection:audioMode})
    document.querySelector('button#call-close') .style.visibility = 'visible'
    document.querySelector('button#call-make')  .style.visibility = 'visible'
    connection.onaddstream      = event  => { document.querySelector('video#remote').srcObject = event.stream }
    connection.onicecandidate   = event  => { if (event.candidate) sendMessage({ type: 'candidate', candidate: event.candidate }) }
    document.querySelector('#username').value = data.success
}
const handlers          =                   {_login:_login,_offer:_offer,_answer:_answer,_candidate:_candidate,_close:_close}
ws.onopen               = ()             => { console.log('Connected to the signaling server') }
ws.onmessage            = msg            => { const data = JSON.parse(msg.data); handlers[data.type](data) }
ws.onerror              = error
document.querySelector('button#call-close') .addEventListener('click', closeCall)
document.querySelector('button#call-make')  .addEventListener('click', makeCall )
document.querySelector('button#login') .addEventListener('click', login )
