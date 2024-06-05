import config from './config.js';
const socket = new WebSocket(config.ws_main_addr);
socket.addEventListener('open', event => {
    socket.send('Hello Server!');
});
socket.addEventListener('message', event => {
    console.log('Message from server ', event.data);
});
