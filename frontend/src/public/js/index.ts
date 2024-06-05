// Create WebSocket connection.
import config from './config.js'
// const socket = new WebSocket('ws://localhost:3000')
const socket = new WebSocket(config.ws_main_addr as string)

// Connection opened
socket.addEventListener('open', event => {
    socket.send('Hello Server!')
})

// Listen for messages
socket.addEventListener('message', event => {
    console.log('Message from server ', event.data) // 'hello client' from backend
})
