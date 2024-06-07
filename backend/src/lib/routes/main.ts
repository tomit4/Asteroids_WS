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
        // TODO: Now create rooms where only two chatters are allowed
        wsHandler: (socket: WebSocket, _: FastifyRequest) => {
            const clientId = nanoid()
            const client: Client = {
                id: clientId,
                socket,
            }
            clients.set(clientId, client)
            socket.send(JSON.stringify({ type: 'id', id: clientId }))

            socket.on('message', chunk => {
                clients.forEach(client => {
                    // NOTE: Use if only want to see messages from other client
                    // if (client.socket !== socket) {}
                    client.socket.send(
                        JSON.stringify({
                            id: clientId,
                            type: 'message',
                            message: chunk.toString(),
                        }),
                    )
                })
            })
            socket.on('close', () => {
                clients.delete(clientId)
                if (clients.size === 0) socket.close()
            })
        },
    })
    done()
}
