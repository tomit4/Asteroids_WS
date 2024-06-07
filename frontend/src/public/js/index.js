import config from './config.js';
let socket = new WebSocket(config.ws_main_addr);
const form = document.getElementById('msgForm');
const chat = document.getElementById('chat');
const yourId = document.getElementById('yourId');
const message = document.getElementById('inputBox');
const clientListElement = document.getElementById('clientList');
let clientId = '';
let localClientList = [];
const updateClientList = (clients) => {
    clientListElement.innerHTML = '';
    localClientList = clients;
    clients.forEach(client => {
        if (client.id !== clientId) {
            const listItem = document.createElement('li');
            listItem.textContent = client.id;
            listItem.style.backgroundColor = client.color;
            clientListElement.appendChild(listItem);
        }
    });
};
socket.addEventListener('open', () => {
    console.log('Websocket connection opened');
});
socket.onmessage = message => {
    const data = JSON.parse(message.data);
    if (data.type === 'id' && !clientId.length) {
        clientId = data.id;
        yourId.textContent = `Your ID is: ${clientId}`;
        yourId.style.backgroundColor = data.color;
    }
    else if (data.type === 'message') {
        const message = document.createElement('p');
        message.textContent =
            data.id === clientId
                ? `You:\n${data.message}`
                : `${data.id}:\n${data.message}`;
        localClientList.forEach(client => {
            if (client.id === data.id)
                message.style.backgroundColor = client.color;
        });
        if (data.id === clientId) {
            message.style.backgroundColor = data.color;
            const yourMsg = document.createElement('p');
            yourMsg.classList.add('yourMsg');
            yourMsg.appendChild(message);
            chat.appendChild(yourMsg);
        }
        else {
            const theirMsg = document.createElement('p');
            theirMsg.classList.add('theirMsg');
            theirMsg.appendChild(message);
            chat.appendChild(theirMsg);
        }
    }
    else if (data.type === 'clients') {
        updateClientList(data.clients);
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
