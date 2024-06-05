import config from './config.js';
const socket = new WebSocket(config.ws_main_addr);
const form = document.getElementById('msgForm');
socket.addEventListener('open', event => {
    console.log('Websocket connection opened');
});
socket.onmessage = message => {
    console.log('Message from server :=>', message.data);
};
socket.addEventListener('close', () => {
    console.log('Websocket connection closed');
});
form.addEventListener('submit', event => {
    event.preventDefault();
    const message = document.getElementById('inputBox');
    socket.send(message.value);
    const newMsg = document.getElementById('newMsg');
    newMsg.textContent = message.value;
    const inputBox = document.getElementById('inputBox');
    inputBox.textContent = '';
});
