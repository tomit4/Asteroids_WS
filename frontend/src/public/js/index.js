import config from './config.js';
const socket = new WebSocket(config.ws_main_addr);
const yourId = document.getElementById('yourId');
const opponentId = document.getElementById('opponentId');
const errMessages = document.getElementById('errMessages');
let localClientList = [];
let clientId = null;
socket.addEventListener('open', () => {
    console.log('Websocket connection opened');
});
socket.addEventListener('close', () => {
    console.log('Websocket connection closed');
});
const board = document.getElementById('board');
const context = board.getContext('2d');
const boardWidth = 500;
const boardHeight = 500;
const playerWidth = 10;
const playerHeight = 50;
const playerVelocityY = 0;
const playerDefaults = {
    type: 'playerType',
    id: null,
    width: playerWidth,
    height: playerHeight,
    velocityY: playerVelocityY,
    color: null,
    direction: null,
};
const player1Default = Object.assign(Object.assign({}, playerDefaults), { x: 10, y: boardHeight / 2 });
const player2Default = Object.assign(Object.assign({}, playerDefaults), { x: boardWidth - playerWidth - 10, y: boardHeight / 2 });
let player1 = player1Default;
let player2 = player2Default;
const ballWidth = 10;
const ballHeight = 10;
const ballDefault = {
    type: 'ballType',
    x: boardWidth / 2,
    y: boardHeight / 2,
    width: ballWidth,
    height: ballHeight,
    velocityX: 1,
    velocityY: 2,
};
let ball = ballDefault;
window.onload = () => {
    board.height = boardHeight;
    board.width = boardWidth;
    requestAnimationFrame(update);
    document.addEventListener('keydown', emitMoveEvent, false);
};
const update = () => {
    requestAnimationFrame(update);
    context.clearRect(0, 0, board.width, board.height);
    context.fillStyle = 'skyblue';
    let nextPlayer1Y = player1.y ? player1.y + player1.velocityY : player1.y;
    if (!outOfBounds(nextPlayer1Y))
        player1.y = nextPlayer1Y;
    context.fillRect(player1.x, player1.y, player1.width, player1.height);
    let nextPlayer2Y = player2.y ? player2.y + player2.velocityY : player2.y;
    if (!outOfBounds(nextPlayer2Y))
        player2.y = nextPlayer2Y;
    context.fillRect(player2.x, player2.y, player2.width, player2.height);
    context.fillStyle = 'white';
    context.fillRect(ball.x, ball.y, ball.width, ball.height);
    socket.send(JSON.stringify(Object.assign(Object.assign({}, ball), { clientId })));
    for (let i = 10; i < board.height; i += 25) {
        context.fillRect(board.width / 2 - 10, i, 5, 5);
    }
};
const outOfBounds = (yPosition) => {
    return yPosition < 0 || yPosition + playerHeight > boardHeight;
};
const updateClientList = (clients) => {
    var _a, _b, _c, _d;
    localClientList = clients;
    player1 = Object.assign(Object.assign({}, player1), { id: (_a = clients[0]) === null || _a === void 0 ? void 0 : _a.player.id, color: (_b = clients[0]) === null || _b === void 0 ? void 0 : _b.player.color });
    player2 = Object.assign(Object.assign({}, player2), { id: (_c = clients[1]) === null || _c === void 0 ? void 0 : _c.player.id, color: (_d = clients[1]) === null || _d === void 0 ? void 0 : _d.player.color });
    if (clients.length !== 2)
        opponentId.innerText = '';
    else
        resetGame(1);
    clients.forEach((client) => {
        const pTag = document.createElement('p');
        pTag.style.backgroundColor = client.player.color;
        if (client.id !== clientId) {
            opponentId.innerText = '';
            pTag.textContent = `Your Opponent is: ${client.id}`;
            opponentId.appendChild(pTag);
        }
        else {
            yourId.innerText = '';
            pTag.textContent = `Your ID is: ${clientId}`;
            yourId.appendChild(pTag);
        }
    });
};
socket.onmessage = (message) => {
    const data = JSON.parse(message.data);
    if (data.type === 'id')
        clientId = data.id;
    if (data.type === 'clients') {
        updateClientList(data.clients);
        if (localClientList.length !== 2) {
            player1 = player1Default;
            player2 = player2Default;
            resetGame(1);
        }
    }
    if (data.type === 'message') {
        const messageData = JSON.parse(data.message);
        if (messageData.type === 'playerType') {
            movePlayer(messageData);
        }
        else if (messageData.type === 'ballType' &&
            messageData.clientId === clientId) {
            moveBall(messageData);
        }
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
        e.preventDefault();
        if (localClientList.length !== 2)
            return;
        const playerData = player1.id === clientId ? player1 : player2;
        playerData.direction = e.code;
        socket.send(JSON.stringify(playerData));
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
const moveBall = (messageData) => {
    ball.x += messageData.velocityX;
    ball.y += messageData.velocityY;
    if (ball.y <= 0 || ball.y + ball.height >= boardHeight) {
        ball.velocityY *= -1;
    }
    if (detectCollision(ball, player1)) {
        if (ball.x <= player1.x + player1.width) {
            ball.velocityX *= -1;
        }
    }
    else if (detectCollision(ball, player2)) {
        if (ball.x + ballWidth >= player2.x) {
            ball.velocityX *= -1;
        }
    }
    if (ball.x < 0) {
        resetGame(1);
    }
    else if (ball.x + ballWidth > boardWidth) {
        resetGame(-1);
    }
};
const detectCollision = (ball, player) => {
    return (ball.x < player.x + player.width &&
        ball.x + ball.width > player.x &&
        ball.y < player.y + player.height &&
        ball.y + ball.height > player.y);
};
const resetGame = (direction) => {
    ball = Object.assign(Object.assign({}, ballDefault), { velocityX: direction });
};
