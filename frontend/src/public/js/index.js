import config from './config.js';
let socket = new WebSocket(config.ws_main_addr);
const yourId = document.getElementById('yourId');
const opponentId = document.getElementById('opponentId');
const errMessages = document.getElementById('errMessages');
let localClientList = [];
let clientId = '';
const updateClientList = (clients) => {
    localClientList = clients;
    console.log('localClientList :=>', localClientList);
    clients.forEach(client => {
        if (client.id !== clientId) {
            player2.id = Number(client.id);
            opponentId.innerHTML = '';
            const pTag = document.createElement('p');
            pTag.textContent = `Your Opponent is: ${client.id}`;
            pTag.style.backgroundColor = client.color;
            opponentId.appendChild(pTag);
        }
    });
};
socket.addEventListener('open', () => {
    console.log('Websocket connection opened');
});
socket.addEventListener('close', () => {
    console.log('Websocket connection closed');
});
let board = document.getElementById('board');
const boardWidth = 500;
const boardHeight = 500;
let context = board.getContext('2d');
const playerWidth = 10;
const playerHeight = 50;
const playerVelocityY = 0;
const player1 = {
    id: null,
    x: 10,
    y: boardHeight / 2,
    width: playerWidth,
    height: playerHeight,
    velocityY: playerVelocityY,
};
const player2 = {
    id: null,
    x: boardWidth - playerWidth - 10,
    y: boardHeight / 2,
    width: playerWidth,
    height: playerHeight,
    velocityY: playerVelocityY,
};
window.onload = () => {
    board.height = boardHeight;
    board.width = boardWidth;
    requestAnimationFrame(update);
    document.addEventListener('keyup', emitMoveEvent);
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
socket.onmessage = message => {
    const data = JSON.parse(message.data);
    if (data.type === 'id' && !clientId.length) {
        clientId = data.id;
        player1.id = data.id;
        const pTag = document.createElement('p');
        pTag.textContent = `Your ID is: ${clientId}`;
        pTag.style.backgroundColor = data.color;
        yourId.appendChild(pTag);
    }
    else if (data.type === 'clients') {
        updateClientList(data.clients);
    }
    else if (data.type === 'message') {
        const playerData = JSON.parse(data.message);
        movePlayer(playerData);
        console.log('playerData :=>', playerData);
    }
    if (data.type === 'error') {
        const errMsg = document.createElement('p');
        errMsg.textContent = data.message;
        errMsg.classList.add('errMsg');
        errMessages.appendChild(errMsg);
        socket.close();
    }
};
const emitMoveEvent = (e) => {
    if (e.code === 'ArrowUp' || e.code === 'ArrowDown') {
        socket.send(JSON.stringify({
            id: clientId,
            direction: e.code,
        }));
    }
};
const movePlayer = (playerData) => {
    if (playerData.direction === 'ArrowUp') {
        if (localClientList[0].id === playerData.id) {
            player1.velocityY = -3;
        }
        else if (localClientList[1].id === playerData.id) {
            player2.velocityY = -3;
        }
    }
    else if (playerData.direction === 'ArrowDown') {
        if (localClientList[0].id === playerData.id) {
            player1.velocityY = 3;
        }
        else if (localClientList[1].id === playerData.id) {
            player2.velocityY = 3;
        }
    }
};
