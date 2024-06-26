var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
let playerWidth = 0;
let playerHeight = 0;
let playerVelocityY = 0;
let player1 = null;
let player2 = null;
let ball = null;
socket.onmessage = (message) => {
    const { type, id, clientList, gameState } = JSON.parse(message.data);
    if (type === 'id')
        clientId = id;
    if (type === 'clients')
        updateClientList(clientList);
    if (type === 'gameState') {
        board.width = gameState.board.width;
        board.height = gameState.board.height;
        playerWidth = gameState.playerDefaults.width;
        playerHeight = gameState.playerDefaults.height;
        playerVelocityY = gameState.playerDefaults.velocityY;
        player1 = gameState.player1;
        player2 = gameState.player2;
        ball = gameState.ballState;
    }
    if (type === 'ballState')
        moveBall(ball);
    if (type === 'playerState') {
        const data = JSON.parse(message.data);
        const playerState = JSON.parse(data.playerState);
        movePlayer(playerState);
    }
};
window.onload = () => __awaiter(void 0, void 0, void 0, function* () {
    requestAnimationFrame(update);
    document.addEventListener('keydown', emitMoveEvent, false);
});
const update = () => {
    requestAnimationFrame(update);
    context.clearRect(0, 0, board.width, board.height);
    context.fillStyle = 'skyblue';
    if (player1) {
        let nextPlayer1Y = player1.y ? player1.y + player1.velocityY : player1.y;
        if (!outOfBounds(nextPlayer1Y))
            player1.y = nextPlayer1Y;
        context.fillRect(player1.x, player1.y, player1.width, player1.height);
    }
    if (player2) {
        let nextPlayer2Y = player2.y ? player2.y + player2.velocityY : player2.y;
        if (!outOfBounds(nextPlayer2Y))
            player2.y = nextPlayer2Y;
        context.fillRect(player2.x, player2.y, player2.width, player2.height);
    }
    if (ball) {
        socket.send(JSON.stringify(ball));
        context.fillStyle = 'white';
        context.fillRect(ball.x, ball.y, ball.width, ball.height);
    }
    if (board.height && board.width) {
        for (let i = 10; i < board.height; i += 25) {
            context.fillRect(board.width / 2 - 10, i, 5, 5);
        }
    }
};
const outOfBounds = (yPosition) => {
    return yPosition < 0 || yPosition + playerHeight > board.height;
};
const updateClientList = (clients) => {
    localClientList = clients;
    if (clients.length !== 2)
        opponentId.innerText = '';
    clients.forEach((client) => {
        console.log('client.gameState.player1.id :=>', client.gameState.player1.id);
        console.log('client.gameState.player2.id :=>', client.gameState.player2.id);
        const pTag = document.createElement('p');
        const pTag2 = document.createElement('p');
        if (clientId === client.gameState.player1.id) {
            pTag.style.backgroundColor = client.gameState.player1
                .color;
            yourId.innerText = '';
            pTag.textContent = `Your ID is: ${clientId}`;
            pTag2.style.backgroundColor = client.gameState.player2
                .color;
            opponentId.innerText = '';
            pTag2.textContent = `Your Opponent is: ${client.gameState.player2.id}`;
            yourId.appendChild(pTag);
            if (client.gameState.player2.id)
                opponentId.appendChild(pTag2);
        }
        else {
            pTag.style.backgroundColor = client.gameState.player2
                .color;
            yourId.innerText = '';
            pTag.textContent = `Your Id is: ${client.gameState.player2.id}`;
            pTag2.style.backgroundColor = client.gameState.player1
                .color;
            opponentId.innerText = '';
            pTag2.textContent = `Your Opponent is: ${client.gameState.player1.id}`;
            yourId.appendChild(pTag);
            if (client.gameState.player1.id)
                opponentId.appendChild(pTag2);
            opponentId.appendChild(pTag2);
        }
    });
};
const emitMoveEvent = (e) => {
    if (e.code === 'ArrowUp' || e.code === 'ArrowDown') {
        e.preventDefault();
        const playerData = player1.id === clientId ? player1 : player2;
        playerData.direction = e.code;
        socket.send(JSON.stringify(playerData));
    }
};
const movePlayer = (playerData) => {
    var _a, _b;
    if (playerData.direction === 'ArrowUp') {
        if (localClientList[0].id === playerData.id) {
            player1.velocityY = -3;
        }
        else if (((_a = localClientList[1]) === null || _a === void 0 ? void 0 : _a.id) === playerData.id) {
            player2.velocityY = -3;
        }
    }
    else if (playerData.direction === 'ArrowDown') {
        if (localClientList[0].id === playerData.id) {
            player1.velocityY = 3;
        }
        else if (((_b = localClientList[1]) === null || _b === void 0 ? void 0 : _b.id) === playerData.id) {
            player2.velocityY = 3;
        }
    }
};
const moveBall = (messageData) => {
    ball.x += messageData.velocityX;
    ball.y += messageData.velocityY;
    if (ball.y <= 0 || ball.y + ball.height >= board.height) {
        ball.velocityY *= -1;
    }
    if (detectCollision(ball, player1)) {
        if (ball.x <= player1.x + player1.width) {
            ball.velocityX *= -1;
            socket.send(JSON.stringify(ball));
        }
    }
    else if (detectCollision(ball, player2)) {
        if (ball.x + ball.width >= player2.x) {
            ball.velocityX *= -1;
            socket.send(JSON.stringify(ball));
        }
    }
};
const detectCollision = (ball, player) => {
    return (ball.x < player.x + player.width &&
        ball.x + ball.width > player.x &&
        ball.y < player.y + player.height &&
        ball.y + ball.height > player.y);
};
