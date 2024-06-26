// TODO: Replace all @ts-ignore and any with proper TS conventions
import type {
    FastifyInstance,
    FastifyPluginOptions,
    FastifyReply,
    FastifyRequest,
    HookHandlerDoneFunction,
} from 'fastify'
import type { WebSocket, WebsocketHandler } from '@fastify/websocket'
import { nanoid } from 'nanoid'
import gameState from '../models/game-state'

type Client = {
    id: string
    socket: WebSocket
}

const clients: Map<string, Client> = new Map()

// TODO: when assigning player colors,
// don't assign random, just choose two as this each room will only be two players...
const genRandomColor = (): string => {
    return '#' + (((1 << 24) * Math.random()) | 0).toString(16).padStart(6, '0')
}

export default (
    fastify: FastifyInstance,
    _: FastifyPluginOptions,
    done: HookHandlerDoneFunction,
) => {
    fastify.route({
        method: 'GET',
        url: '/',
        handler: async (
            _: FastifyRequest,
            reply: FastifyReply,
        ): Promise<FastifyReply> => {
            try {
                reply
                    .code(404)
                    .send({ ok: false, message: 'http route not found' })
            } catch (error) {
                if (error instanceof Error)
                    reply.code(500).send({
                        ok: false,
                        message: error.message,
                    })
            } finally {
                return reply
            }
        },
        // TODO: Now create rooms where only two players are allowed
        // TODO: Wrap entire handler block in try/catch/finally witht throws
        wsHandler: (socket: WebSocket, _: FastifyRequest): void => {
            const clientId = nanoid()

            const client: Client = {
                id: clientId,
                socket,
            }
            clients.set(clientId, client)

            const clientList = Array.from(clients.values()).map(
                (client: Client) => ({
                    id: client.id,
                    gameState,
                }),
            )

            if (clients.size > 2) {
                socket.send(
                    JSON.stringify({
                        type: 'error',
                        message:
                            'Sorry, but no more than two players at a time. \
                                Please wait until someone else logs out.',
                    }),
                )
                socket.close()
                return
            }

            // TODO: Doesn't actually broadcast anything...rename?
            const broadcastGameState = () => {
                try {
                    const { player1, player2 } = gameState
                    // @ts-ignore
                    player1.id = clientList[0]?.id ?? null
                    // @ts-ignore
                    player1.color = player1.color
                        ? // @ts-ignore
                          player1.color
                        : genRandomColor()
                    // @ts-ignore
                    player2.id = clientList[1]?.id ?? null
                    // @ts-ignore
                    player2.color = player2.color
                        ? // @ts-ignore
                          player2.color
                        : genRandomColor()
                } catch (err) {
                    console.error('ERROR :=>', err)
                }
            }

            broadcastGameState()

            // BUG: Laggy...
            clients.forEach(client => {
                client.socket.send(
                    JSON.stringify({
                        type: 'gameState',
                        gameState,
                    }),
                )
            })

            socket.send(
                JSON.stringify({
                    type: 'id',
                    id: clientId,
                }),
            )

            clients.forEach(client => {
                client.socket.send(
                    JSON.stringify({
                        type: 'clients',
                        clientList,
                    }),
                )
            })

            socket.on('message', (chunk: WebsocketHandler): void => {
                const { type } = JSON.parse(chunk.toString())
                if (type === 'ballType') {
                    gameState.ballState = JSON.parse(chunk.toString())
                    socket.send(
                        JSON.stringify({
                            type: 'ballState',
                            ballState: gameState.ballState,
                        }),
                    )
                }
                if (type === 'playerType') {
                    clients.forEach(client => {
                        client.socket.send(
                            JSON.stringify({
                                type: 'playerState',
                                playerState: chunk.toString(),
                            }),
                        )
                    })
                }
            })

            socket.on('close', (): void => {
                clients.delete(clientId)
                broadcastGameState()
                if (clients.size === 0) socket.close()
            })
        },
    })
    done()
}
