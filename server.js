const express = require('express')
const app = express()
const port = 8080

var io = require('socket.io')
({
  // transports  : [ 'websocket' ],
  // transports: [
  //   'websocket',
  //   'flashsocket',
  //   'htmlfile',
  //   'xhr-polling',
  //   'jsonp-polling',
  //   'polling'
  // ],
  path: '/webrtc'
})

let sequenceNumberByPeer = new Map()

app.use(express.static(__dirname + '/build'))
app.get('/', (req, res, next) => {
    // res.sendFile(__dirname + '/public/views/index.html')
    res.sendFile(__dirname + '/public/build/index.html')
})

app.get('/hello', (req, res) => res.send('Hello World!!!!!'))

const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`))

io.listen(server)

const peers = io.of('/webrtcPeer')

peers.on('connection', socket => {
console.log(socket.id)
  socket.emit('connection-success', { success: socket.id })

  socket.on('disconnect', () => {
    console.log('disconnected')
    sequenceNumberByPeer.delete(socket.id)
  })

  sequenceNumberByPeer.set(socket.id, socket)

  socket.on('offerOrAnswer', (data) => {
    // send to the other peear if any
    for (const [socketID, socket] of sequenceNumberByPeer.entries()) {
      if (socketID !== data.socketID) {
        console.log(socketID, data.payload.type)
        socket.emit('offerOrAnswer', data.payload)
      }
    }
  })

  socket.on('candidate', (data) => {
    // send candidate to the other peear if any
    for (const [socketID, socket] of sequenceNumberByPeer.entries()) {
      if (socketID !== data.socketID) {
        console.log(socketID, data.payload)
        socket.emit('candidate', data.payload)
      }
    }
  })
})