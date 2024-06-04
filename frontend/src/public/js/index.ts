// Create WebSocket connection.
const socket = new WebSocket('ws://localhost:3000')

// Connection opened
socket.addEventListener('open', event => {
    socket.send('Hello Server!')
})

// Listen for messages
socket.addEventListener('message', event => {
    console.log('Message from server ', event.data) // 'hello client' from backend
})
