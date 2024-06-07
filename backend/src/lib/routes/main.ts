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
    color: string
    socket: WebSocket
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
            const clientId = nanoid()
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

            const client: Client = {
                id: clientId,
                color: genRandomColor(),
                socket,
            }
            clients.set(clientId, client)

            const broadcastClientList = () => {
                const clientList = Array.from(clients.values()).map(client => ({
                    id: client.id,
                    color: client.color,
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
                    color: client.color,
                }),
            )
            broadcastClientList()

            socket.on('message', chunk => {
                clients.forEach(client => {
                    // NOTE: Use if only want to see messages from other client
                    // if (client.socket !== socket) {}
                    client.socket.send(
                        JSON.stringify({
                            id: clientId,
                            color: client.color,
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
