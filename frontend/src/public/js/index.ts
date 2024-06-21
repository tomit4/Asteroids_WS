// TODO: Heavy Refactor lengthy functions
// and separate out canvas/clientlist/message functionality
// TODO: Figure out how to reset game board if one player loses connection
// NOTE: Buggy mess for now, but kind of works...
import config from './config.js'
const socket = new WebSocket(config.ws_main_addr as string)
const yourId = document.getElementById('yourId') as HTMLSpanElement
const opponentId = document.getElementById('opponentId') as HTMLSpanElement
const errMessages = document.getElementById('errMessages') as HTMLDivElement

type ClientProfile = {
    id: string | null
    player: PlayerType
}

let localClientList: ClientProfile[] = []
let clientId: string | null = null

socket.addEventListener('open', (): void => {
    console.log('Websocket connection opened')
})

socket.addEventListener('close', (): void => {
    console.log('Websocket connection closed')
})

// CANVAS
const board = document.getElementById('board') as HTMLCanvasElement
const context = board.getContext('2d') as CanvasRenderingContext2D
const boardWidth: number = 500
const boardHeight: number = 500

// players
const playerWidth: number = 10
const playerHeight: number = 50
const playerVelocityY: number = 0

type PlayerDefaultType = {
    type: string
    id: string | null
    width: number
    height: number
    velocityY: number
    color: string | null
    direction: string | null
}

interface PlayerType extends PlayerDefaultType {
    x: number | null
    y: number | null
}

type BallType = {
    type: string
    x: number
    y: number
    width: number
    height: number
    velocityX: number
    velocityY: number
}

const playerDefaults: PlayerDefaultType = {
    type: 'playerType',
    id: null,
    width: playerWidth,
    height: playerHeight,
    velocityY: playerVelocityY,
    color: null,
    direction: null,
}

const player1Default: PlayerType = {
    ...playerDefaults,
    x: 10,
    y: boardHeight / 2,
}

const player2Default: PlayerType = {
    ...playerDefaults,
    x: boardWidth - playerWidth - 10,
    y: boardHeight / 2,
}

let player1: PlayerType = player1Default
let player2: PlayerType = player2Default

// ball
const ballWidth = 10
const ballHeight = 10

const ballDefault: BallType = {
    type: 'ballType',
    x: boardWidth / 2,
    y: boardHeight / 2,
    width: ballWidth,
    height: ballHeight,
    velocityX: 1,
    velocityY: 2,
}

let ball: BallType = ballDefault

/*
let player1Score = 0
let player2Score = 0
*/

window.onload = (): void => {
    board.height = boardHeight
    board.width = boardWidth
    requestAnimationFrame(update)
    document.addEventListener('keydown', emitMoveEvent, false)
}

const update = (): void => {
    requestAnimationFrame(update)
    context.clearRect(0, 0, board.width, board.height)
    context.fillStyle = 'skyblue'

    // player1
    let nextPlayer1Y = player1.y ? player1.y + player1.velocityY : player1.y
    if (!outOfBounds(nextPlayer1Y as number)) player1.y = nextPlayer1Y
    context.fillRect(
        player1.x as number,
        player1.y as number,
        player1.width,
        player1.height,
    )

    // player2
    let nextPlayer2Y = player2.y ? player2.y + player2.velocityY : player2.y
    if (!outOfBounds(nextPlayer2Y as number)) player2.y = nextPlayer2Y
    context.fillRect(
        player2.x as number,
        player2.y as number,
        player2.width,
        player2.height,
    )

    // ball
    context.fillStyle = 'white'
    context.fillRect(ball.x, ball.y, ball.width, ball.height)
    socket.send(JSON.stringify(ball))

    // score
    /*
    context.font = '45px sans-serif'
    context.fillText(String(player1Score), boardWidth / 5, 45)
    context.fillText(String(player2Score), (boardWidth * 4) / 5 - 45, 45)
    */

    // draw dotted line down the middle
    for (let i = 10; i < board.height; i += 25) {
        // i = starting y position, draw a square every 25 pixels down
        // (x position = half of boardWidth - 10) i = y position, width = 5, height
        // = 5
        context.fillRect(board.width / 2 - 10, i, 5, 5)
    }
}

const outOfBounds = (yPosition: number): boolean => {
    return yPosition < 0 || yPosition + playerHeight > boardHeight
}

const updateClientList = (clients: ClientProfile[]): void => {
    localClientList = clients
    player1 = {
        ...player1,
        id: clients[0]?.player.id,
        color: clients[0]?.player.color,
    }
    player2 = {
        ...player2,
        id: clients[1]?.player.id,
        color: clients[1]?.player.color,
    }

    if (clients.length !== 2) opponentId.innerText = ''
    else resetGame(1)
    clients.forEach((client: ClientProfile) => {
        const pTag = document.createElement('p') as HTMLParagraphElement
        pTag.style.backgroundColor = client.player.color as string
        if (client.id !== clientId) {
            opponentId.innerText = ''
            pTag.textContent = `Your Opponent is: ${client.id}`
            opponentId.appendChild(pTag)
        } else {
            yourId.innerText = ''
            pTag.textContent = `Your ID is: ${clientId}`
            yourId.appendChild(pTag)
        }
    })
}

socket.onmessage = (message): void => {
    const data = JSON.parse(message.data)
    if (data.type === 'id') clientId = data.id
    if (data.type === 'clients') {
        updateClientList(data.clients)
        if (localClientList.length !== 2) {
            player1 = player1Default
            player2 = player2Default
            resetGame(1)
        }
    }
    if (data.type === 'message') {
        const messageData = JSON.parse(data.message)
        if (messageData.type === 'playerType') {
            movePlayer(messageData)
        } else if (messageData.type === 'ballType') {
            moveBall(messageData)
        }
    }
    if (data.type === 'error') {
        const errMsg = document.createElement('p') as HTMLParagraphElement
        errMsg.textContent = data.message
        errMsg.classList.add('errMsg')
        errMessages.appendChild(errMsg)
        socket.close()
    }
}

const emitMoveEvent = (e: KeyboardEvent): void => {
    if (e.code === 'ArrowUp' || e.code === 'ArrowDown') {
        e.preventDefault()
        if (localClientList.length !== 2) return
        const playerData: PlayerType =
            player1.id === clientId ? player1 : player2
        playerData.direction = e.code
        socket.send(JSON.stringify(playerData))
    }
}

const movePlayer = (playerData: PlayerType): void => {
    if (playerData.direction === 'ArrowUp') {
        if (localClientList[0].id === playerData.id) {
            player1.velocityY = -3
        } else if (localClientList[1].id === playerData.id) {
            player2.velocityY = -3
        }
    } else if (playerData.direction === 'ArrowDown') {
        if (localClientList[0].id === playerData.id) {
            player1.velocityY = 3
        } else if (localClientList[1].id === playerData.id) {
            player2.velocityY = 3
        }
    }
}

const moveBall = (messageData: BallType) => {
    ball.x += messageData.velocityX
    ball.y += messageData.velocityY
    // if ball touches top or bottom of canvas
    if (ball.y <= 0 || ball.y + ball.height >= boardHeight) {
        ball.velocityY *= -1 // reverse direction
    }

    // bounce the ball back
    if (detectCollision(ball, player1)) {
        if (ball.x <= player1.x! + player1.width) {
            // left side of ball touches right side of player1
            ball.velocityX *= -1 // flip x direction
        }
    } else if (detectCollision(ball, player2)) {
        if (ball.x + ballWidth >= player2.x!) {
            // right side of ball touches left side of player2
            ball.velocityX *= -1
        }
    }
    if (ball.x < 0) {
        // player2Score++
        resetGame(1)
    } else if (ball.x + ballWidth > boardWidth) {
        // player1Score++
        resetGame(-1)
    }
}

const detectCollision = (ball: BallType, player: PlayerType): boolean => {
    return (
        ball.x < player.x! + player.width && // a's top left corner doesn't reach b's top right
        // corner
        ball.x + ball.width > player.x! && // a's top right corner passes b's top left corner
        ball.y < player.y! + player.height && // a's top left corner doesn't reach b's bottom
        // left corner
        ball.y + ball.height > player.y! // a's bottom left corner passes b's top left corner
    )
}

const resetGame = (direction: number): void => {
    ball = { ...ballDefault, velocityX: direction }
}
