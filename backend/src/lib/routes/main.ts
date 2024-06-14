import type {
    FastifyInstance,
    FastifyPluginOptions,
    FastifyReply,
    FastifyRequest,
    HookHandlerDoneFunction,
} from 'fastify'
import type { WebSocket } from '@fastify/websocket'
import { nanoid } from 'nanoid'

type Client = {
    id: string
    player: PlayerType
    socket: WebSocket
}

type PlayerType = {
    id: string | null
    x: number | null
    y: number | null
    width: number
    height: number
    velocityY: number
    color: string | undefined
    direction: string | null
}

const clients: Map<string, Client> = new Map()

export default (
    fastify: FastifyInstance,
    _: FastifyPluginOptions,
    done: HookHandlerDoneFunction,
) => {
    fastify.route({
        method: 'GET',
        url: '/',
        handler: async (_: FastifyRequest, reply: FastifyReply) => {
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
        wsHandler: (socket: WebSocket, _: FastifyRequest) => {
            // TODO: when assigning player colors,
            // don't assign random, just choose two as this each room will only be two players...
            const genRandomColor = (): string => {
                return (
                    '#' +
                    (((1 << 24) * Math.random()) | 0)
                        .toString(16)
                        .padStart(6, '0')
                )
            }

            const player: PlayerType = {
                id: null,
                x: null,
                y: null,
                width: 10,
                height: 50,
                velocityY: 0,
                color: genRandomColor(),
                direction: null,
            }
            player.id = nanoid()
            const clientId = player.id

            const client: Client = {
                id: clientId,
                player,
                socket,
            }
            clients.set(clientId, client)

            const broadcastClientList = () => {
                // TODO: Handle this differently later on,
                // have even number clients "pair off" into "rooms"
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
                const clientList = Array.from(clients.values()).map(client => ({
                    id: client.id,
                    player: client.player,
                }))
                clients.forEach(client => {
                    client.socket.send(
                        JSON.stringify({
                            type: 'clients',
                            clients: clientList,
                        }),
                    )
                })
            }

            socket.send(
                JSON.stringify({
                    type: 'id',
                    id: clientId,
                    player,
                }),
            )

            broadcastClientList()

            socket.on('message', chunk => {
                clients.forEach(client => {
                    // NOTE: Use if only want to see messages from other client
                    // if (client.socket !== socket) {}
                    client.socket.send(
                        JSON.stringify({
                            type: 'message',
                            message: chunk.toString(),
                        }),
                    )
                })
            })
            socket.on('close', () => {
                clients.delete(clientId)
                broadcastClientList()
                if (clients.size === 0) socket.close()
            })
        },
    })
    done()
}
