import config from './config.js';
let socket = new WebSocket(config.ws_main_addr);
const form = document.getElementById('msgForm');
const chat = document.getElementById('chat');
const yourId = document.getElementById('yourId');
const message = document.getElementById('inputBox');
const clientListElement = document.getElementById('clientList');
const errMessages = document.getElementById('errMessages');
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
    else if (data.type === 'error') {
        const errMsg = document.createElement('p');
        errMsg.textContent = data.message;
        errMsg.classList.add('errMsg');
        errMessages.appendChild(errMsg);
        socket.close();
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
let board = document.getElementById('board');
const boardWidth = 500;
const boardHeight = 500;
let context = board.getContext('2d');
const playerWidth = 10;
const playerHeight = 50;
const playerVelocityY = 0;
const player1 = {
    x: 10,
    y: boardHeight / 2,
    width: playerWidth,
    height: playerHeight,
    velocityY: playerVelocityY,
};
const player2 = {
    x: boardWidth - playerWidth - 10,
    y: boardHeight / 2,
    width: playerWidth,
    height: playerHeight,
    velocityY: playerVelocityY,
};
window.onload = () => {
    board.height = boardHeight;
    board.width = boardWidth;
    context.fillStyle = 'skyblue';
    context.fillRect(player1.x, player1.y, player1.width, player1.height);
    requestAnimationFrame(update);
    document.addEventListener('keyup', movePlayer);
};
const update = () => {
    requestAnimationFrame(update);
    context.clearRect(0, 0, board.width, board.height);
    context.fillStyle = 'skyblue';
    let nextPlayer1Y = player1.y + player1.velocityY;
    if (!outOfBounds(nextPlayer1Y))
        player1.y = nextPlayer1Y;
    context.fillRect(player1.x, player1.y, player1.width, player1.height);
    context.fillStyle = 'skyblue';
    let nextPlayer2Y = player2.y + player2.velocityY;
    if (!outOfBounds(nextPlayer2Y))
        player2.y = nextPlayer2Y;
    context.fillRect(player2.x, player2.y, player2.width, player2.height);
    for (let i = 10; i < board.height; i += 25) {
        context.fillRect(board.width / 2 - 10, i, 5, 5);
    }
};
const outOfBounds = (yPosition) => {
    return yPosition < 0 || yPosition + playerHeight > boardHeight;
};
const movePlayer = (e) => {
    if (e.code === 'KeyW')
        player1.velocityY = -3;
    else if (e.code === 'KeyS')
        player1.velocityY = 3;
    if (e.code === 'ArrowUp')
        player2.velocityY = -3;
    else if (e.code === 'ArrowDown')
        player2.velocityY = 3;
};
const detectCollision = (a, b) => {
    return (a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y);
};
