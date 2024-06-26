// TODO: Change All Objects to ES6/TS Classes
// TODO: Replace all @ts-ignore and any with proper TS conventions
// TODO: Move more game state to backend, detectCollision and outOfBounds
const board = {
    width: 500,
    height: 500,
}

const playerDefaults = {
    type: 'playerType',
    id: null,
    width: 10,
    height: 50,
    velocityY: 0,
    color: null,
    direction: null,
    x: null,
    y: board.height / 2,
}

const ballDefault = {
    type: 'ballType',
    x: board.width / 2,
    y: board.height / 2,
    width: 10,
    height: 10,
    velocityX: 1,
    velocityY: 2,
}

const player1Default = {
    ...playerDefaults,
    x: 10,
}

const player2Default = {
    ...playerDefaults,
    x: board.width - playerDefaults.width - 10,
}

const gameState = {
    board,
    playerDefaults,
    player1Default,
    player2Default,
    ballDefault,
    player1: null,
    player2: null,
    ballState: null,
}

// @ts-ignore
gameState.player1 = { ...gameState.player1Default }
// @ts-ignore
gameState.player2 = { ...gameState.player2Default }
// @ts-ignore
gameState.ballState = { ...gameState.ballDefault }

export default gameState
