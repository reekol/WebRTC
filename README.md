# WebRTC
RTC media comunication

### Experimental "boilerplate" for WebRTC communication.

### Setup

```bash
git clone git@github.com:reekol/WebRTC.git
apt-get install stun-server
cd ./WebRTC
npm i
mkdir crt 
cd ./crt
openssl req -newkey rsa:2048 -nodes -keyout key.pem -x509 -days 365 -out certificate.pem -subj "/C=BG/ST=Sofia/L=Sofia/O=SeQR.link/OU=SeQR/CN=*.seqr.link"
```
### Run STUN Server.
```
stund -v  -h XXX.XXX.XXX.XXX # <-Replace with your ip
```
### Run secured HTTPS and Web Socket server
```
node ./server.js
```

### Use: 
Open https://127.0.0.1:3001
