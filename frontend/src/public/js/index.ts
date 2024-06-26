/* NOTES:
 * CONSTRUCTION: In the middle of refactor of more game state/logic on backend
 * TODO: Move entire game state to backend, meaning all points of canvas, player movements,
 * ball's current position should exist on the server and sent out to each client
 * TODO: Replace all @ts-ignore and any with proper TS conventions
 */
import config from './config.js'
const socket = new WebSocket(config.ws_main_addr as string)
const yourId = document.getElementById('yourId') as HTMLSpanElement
const opponentId = document.getElementById('opponentId') as HTMLSpanElement
const errMessages = document.getElementById('errMessages') as HTMLDivElement

let localClientList: any[] = []
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

// players
let playerWidth: number = 0
let playerHeight: number = 0
let playerVelocityY: number = 0

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

let player1: any = null
let player2: any = null

/*
let player1Score = 0
let player2Score = 0
*/

let ball: any = null

socket.onmessage = (message): void => {
    const { type, id, clientList, gameState } = JSON.parse(message.data)
    if (type === 'id') clientId = id
    if (type === 'clients') updateClientList(clientList)
    if (type === 'gameState') {
        board.width = gameState.board.width
        board.height = gameState.board.height
        playerWidth = gameState.playerDefaults.width
        playerHeight = gameState.playerDefaults.height
        playerVelocityY = gameState.playerDefaults.velocityY
        player1 = gameState.player1
        player2 = gameState.player2
        ball = gameState.ballState
    }
    if (type === 'ballState') moveBall(ball)
    if (type === 'playerState') {
        const data = JSON.parse(message.data)
        const playerState = JSON.parse(data.playerState)
        movePlayer(playerState)
    }
}

window.onload = async (): Promise<void> => {
    requestAnimationFrame(update)
    document.addEventListener('keydown', emitMoveEvent, false)
}

// TODO: split up the function to differentiate between player and ball animations
const update = (): void => {
    requestAnimationFrame(update)
    context.clearRect(0, 0, board.width, board.height)
    context.fillStyle = 'skyblue'

    // player1
    if (player1) {
        // TODO: Move more game state to backend, detectCollision and outOfBounds
        let nextPlayer1Y = player1.y ? player1.y + player1.velocityY : player1.y
        if (!outOfBounds(nextPlayer1Y as number)) player1.y = nextPlayer1Y
        context.fillRect(
            player1.x as number,
            player1.y as number,
            player1.width,
            player1.height,
        )
    }

    // player2
    if (player2) {
        // TODO: Move more game state to backend, detectCollision and outOfBounds
        let nextPlayer2Y = player2.y ? player2.y + player2.velocityY : player2.y
        if (!outOfBounds(nextPlayer2Y as number)) player2.y = nextPlayer2Y
        context.fillRect(
            player2.x as number,
            player2.y as number,
            player2.width,
            player2.height,
        )
    }

    // ball
    if (ball) {
        socket.send(JSON.stringify(ball))
        context.fillStyle = 'white'
        context.fillRect(ball.x, ball.y, ball.width, ball.height)
    }
    // score
    /*
    context.font = '45px sans-serif'
    context.fillText(String(player1Score), boardWidth / 5, 45)
    context.fillText(String(player2Score), (boardWidth * 4) / 5 - 45, 45)
    */

    // draw dotted line down the middle
    if (board.height && board.width) {
        for (let i = 10; i < board.height; i += 25) {
            // i = starting y position, draw a square every 25 pixels down
            // (x position = half of boardWidth - 10) i = y position, width = 5, height
            // = 5
            context.fillRect(board.width / 2 - 10, i, 5, 5)
        }
    }
}

// TODO: Move more game state to backend, detectCollision and outOfBounds
const outOfBounds = (yPosition: number): boolean => {
    return yPosition < 0 || yPosition + playerHeight > board.height
}

// TODO: Massive cleanup
// BUG: Colors mismatched
const updateClientList = (clients: any[]): void => {
    localClientList = clients
    if (clients.length !== 2) opponentId.innerText = ''
    // else resetGame(1)
    clients.forEach((client: any) => {
        console.log(
            'client.gameState.player1.id :=>',
            client.gameState.player1.id,
        )
        console.log(
            'client.gameState.player2.id :=>',
            client.gameState.player2.id,
        )
        const pTag = document.createElement('p') as HTMLParagraphElement
        const pTag2 = document.createElement('p') as HTMLParagraphElement

        if (clientId === client.gameState.player1.id) {
            pTag.style.backgroundColor = client.gameState.player1
                .color as string
            yourId.innerText = ''
            pTag.textContent = `Your ID is: ${clientId}`
            pTag2.style.backgroundColor = client.gameState.player2
                .color as string
            opponentId.innerText = ''
            pTag2.textContent = `Your Opponent is: ${client.gameState.player2.id}`
            yourId.appendChild(pTag)
            if (client.gameState.player2.id) opponentId.appendChild(pTag2)
        } else {
            pTag.style.backgroundColor = client.gameState.player2
                .color as string
            yourId.innerText = ''
            pTag.textContent = `Your Id is: ${client.gameState.player2.id}`
            pTag2.style.backgroundColor = client.gameState.player1
                .color as string
            opponentId.innerText = ''
            pTag2.textContent = `Your Opponent is: ${client.gameState.player1.id}`
            yourId.appendChild(pTag)
            if (client.gameState.player1.id) opponentId.appendChild(pTag2)
            opponentId.appendChild(pTag2)
        }
    })
}
/*
socket.onmessage = (message): void => {
    if (data.type === 'error') {
        const errMsg = document.createElement('p') as HTMLParagraphElement
        errMsg.textContent = data.message
        errMsg.classList.add('errMsg')
        errMessages.appendChild(errMsg)
        socket.close()
    }
}
*/

const emitMoveEvent = (e: KeyboardEvent): void => {
    if (e.code === 'ArrowUp' || e.code === 'ArrowDown') {
        e.preventDefault()
        // if (localClientList.length !== 2) return
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
        } else if (localClientList[1]?.id === playerData.id) {
            player2.velocityY = -3
        }
    } else if (playerData.direction === 'ArrowDown') {
        if (localClientList[0].id === playerData.id) {
            player1.velocityY = 3
        } else if (localClientList[1]?.id === playerData.id) {
            player2.velocityY = 3
        }
    }
}

// TODO: Move more game state to backend, detectCollision and outOfBounds
const moveBall = (messageData: BallType) => {
    ball.x += messageData.velocityX
    ball.y += messageData.velocityY
    // if ball touches top or bottom of canvas
    if (ball.y <= 0 || ball.y + ball.height >= board.height) {
        ball.velocityY *= -1 // reverse direction
    }

    // bounce the ball back
    if (detectCollision(ball, player1)) {
        if (ball.x <= player1.x! + player1.width) {
            // left side of ball touches right side of player1
            ball.velocityX *= -1 // flip x direction
            socket.send(JSON.stringify(ball))
        }
    } else if (detectCollision(ball, player2)) {
        if (ball.x + ball.width >= player2.x!) {
            // right side of ball touches left side of player2
            ball.velocityX *= -1
            socket.send(JSON.stringify(ball))
        }
    }
    /*
    if (ball.x < 0) {
        // player2Score++
        resetGame(1)
    } else if (ball.x + ballWidth > boardWidth) {
        // player1Score++
        resetGame(-1)
    }
    */
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

// const resetGame = (direction: number): void => {
// ball = { ...ballDefault, velocityX: direction }
// }
