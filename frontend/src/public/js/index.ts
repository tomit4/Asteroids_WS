// TODO: Heavy Refactor lengthy functions
// and separate out canvas/clientlist/message functionality
import config from './config.js'
let socket = new WebSocket(config.ws_main_addr as string)
const yourId = document.getElementById('yourId') as HTMLSpanElement
const opponentId = document.getElementById('opponentId') as HTMLSpanElement
const errMessages = document.getElementById('errMessages') as HTMLDivElement

type ClientProfile = {
    id: string
    color: string
}

let localClientList: ClientProfile[] = []
let clientId: string = ''

const updateClientList = (clients: ClientProfile[]) => {
    localClientList = clients
    console.log('localClientList :=>', localClientList)
    clients.forEach(client => {
        if (client.id !== clientId) {
            player2.id = Number(client.id)
            opponentId.innerHTML = ''
            const pTag = document.createElement('p') as HTMLParagraphElement
            pTag.textContent = `Your Opponent is: ${client.id}`
            pTag.style.backgroundColor = client.color
            opponentId.appendChild(pTag)
        }
    })
}

socket.addEventListener('open', () => {
    console.log('Websocket connection opened')
})

socket.addEventListener('close', () => {
    console.log('Websocket connection closed')
})

// CANVAS
let board = document.getElementById('board') as HTMLCanvasElement
const boardWidth: number = 500
const boardHeight: number = 500
let context = board.getContext('2d') as CanvasRenderingContext2D

// players
const playerWidth = 10
const playerHeight = 50
const playerVelocityY = 0

type PlayerType = {
    id: number | null
    x: number
    y: number
    width: number
    height: number
    velocityY: number
}

const player1: PlayerType = {
    id: null,
    x: 10,
    y: boardHeight / 2,
    width: playerWidth,
    height: playerHeight,
    velocityY: playerVelocityY,
}

const player2: PlayerType = {
    id: null,
    x: boardWidth - playerWidth - 10,
    y: boardHeight / 2,
    width: playerWidth,
    height: playerHeight,
    velocityY: playerVelocityY,
}

// ball
/*
const ballWidth = 10
const ballHeight = 10
let ball = {
    x: boardWidth / 2,
    y: boardHeight / 2,
    width: ballWidth,
    height: ballHeight,
    velocityX: 1,
    velocityY: 2,
}
*/
/*
let player1Score = 0
let player2Score = 0
*/

window.onload = () => {
    board.height = boardHeight
    board.width = boardWidth

    // draw initial player1
    context.fillStyle = 'skyblue'
    context.fillRect(player1.x, player1.y, player1.width, player1.height)

    requestAnimationFrame(update)
    document.addEventListener('keyup', emitMoveEvent)
}

const update = () => {
    requestAnimationFrame(update)
    context.clearRect(0, 0, board.width, board.height)

    // player1
    context.fillStyle = 'skyblue'
    let nextPlayer1Y = player1.y + player1.velocityY
    if (!outOfBounds(nextPlayer1Y)) player1.y = nextPlayer1Y
    context.fillRect(player1.x, player1.y, player1.width, player1.height)

    // player2
    context.fillStyle = 'skyblue'
    let nextPlayer2Y = player2.y + player2.velocityY
    if (!outOfBounds(nextPlayer2Y)) player2.y = nextPlayer2Y
    context.fillRect(player2.x, player2.y, player2.width, player2.height)

    // ball
    /*
  context.fillStyle = 'white'
  ball.x += ball.velocityX
  ball.y += ball.velocityY
  context.fillRect(ball.x, ball.y, ball.width, ball.height)

  // if ball touches top or bottom of canvas
  if (ball.y <= 0 || ball.y + ball.height >= boardHeight) {
      ball.velocityY *= -1 // reverse direction
  }

  // bounce the ball back
  if (detectCollision(ball, player1)) {
      if (ball.x <= player1.x + player1.width) {
          // left side of ball touches right side of player1
          ball.velocityX *= -1 // flip x direction
      }
  } else if (detectCollision(ball, player2)) {
      if (ball.x + ballWidth >= player2.x) {
          // rigth side of ball touches left side of player2
          ball.velocityX *= -1
      }
  }

  // game over
  if (ball.x < 0) {
      player2Score++
      resetGame(1)
  } else if (ball.x + ballWidth > boardWidth) {
      player1Score++
      resetGame(-1)
  }
  */

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

const outOfBounds = (yPosition: number) => {
    return yPosition < 0 || yPosition + playerHeight > boardHeight
}

socket.onmessage = message => {
    const data = JSON.parse(message.data)
    if (data.type === 'id' && !clientId.length) {
        clientId = data.id
        player1.id = data.id
        const pTag = document.createElement('p') as HTMLParagraphElement
        pTag.textContent = `Your ID is: ${clientId}`
        pTag.style.backgroundColor = data.color
        yourId.appendChild(pTag)
    } else if (data.type === 'clients') {
        updateClientList(data.clients)
    } else if (data.type === 'message') {
        const playerData = JSON.parse(data.message)
        movePlayer(playerData)
        console.log('playerData :=>', playerData)
    }
    if (data.type === 'error') {
        const errMsg = document.createElement('p')
        errMsg.textContent = data.message
        errMsg.classList.add('errMsg')
        errMessages.appendChild(errMsg)
        socket.close()
    }
}

// TODO: Consider sending more info about player to backend
const emitMoveEvent = (e: KeyboardEvent) => {
    if (e.code === 'ArrowUp' || e.code === 'ArrowDown') {
        socket.send(
            JSON.stringify({
                id: clientId,
                direction: e.code,
            }),
        )
    }
}

// TODO: Refactor logic, think on this, there's a lot repeated here,
// and doing ANOTHER helper function feels like a code smell...
const movePlayer = (playerData: { id: string; direction: string }) => {
    if (playerData.id === clientId) {
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
    } else {
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
}

/*
const detectCollision = (
    a: { x: number; y: number; width: number; height: number },
    b: { x: number; y: number; width: number; height: number },
) => {
    return (
        a.x < b.x + b.width && // a's top left corner doesn't reach b's top right
        // corner
        a.x + a.width > b.x && // a's top right corner passes b's top left corner
        a.y < b.y + b.height && // a's top left corner doesn't reach b's bottom
        // left corner
        a.y + a.height > b.y // a's bottom left corner passes b's top left corner
    )
}
const resetGame = (direction: number) => {
    ball = {
        x: boardWidth / 2,
        y: boardHeight / 2,
        width: ballWidth,
        height: ballHeight,
        velocityX: direction,
        velocityY: 2,
    }
}
*/
