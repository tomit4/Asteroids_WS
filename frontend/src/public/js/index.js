import config from './config.js';
let socket = new WebSocket(config.ws_main_addr);
const form = document.getElementById('msgForm');
const chat = document.getElementById('chat');
const message = document.getElementById('inputBox');
let clientId = '';
socket.addEventListener('open', () => {
    console.log('Websocket connection opened');
});
socket.onmessage = message => {
    const data = JSON.parse(message.data);
    if (data.type === 'id' && !clientId.length) {
        clientId = data.id;
    }
    else if (data.type === 'message') {
        const message = document.createElement('p');
        message.textContent = `${data.id}: ${data.message}`;
        if (data.id === clientId) {
            const yourMsg = document.createElement('div');
            yourMsg.classList.add('yourMsg');
            yourMsg.appendChild(message);
            chat.appendChild(yourMsg);
        }
        else {
            const theirMsg = document.createElement('div');
            theirMsg.classList.add('theirMsg');
            theirMsg.appendChild(message);
            chat.appendChild(theirMsg);
        }
    }
};
socket.addEventListener('close', () => {
    console.log('Websocket connection closed');
});
form.addEventListener('submit', event => {
    event.preventDefault();
    socket.send(message.value);
    form.reset();
});
