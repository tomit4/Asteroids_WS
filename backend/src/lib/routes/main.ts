import type {
    FastifyInstance,
    FastifyPluginOptions,
    FastifyReply,
    FastifyRequest,
    HookHandlerDoneFunction,
} from 'fastify'
import type { WebSocket } from '@fastify/websocket'

type Params = {
    id?: string | null
}

export default (
    fastify: FastifyInstance,
    options: FastifyPluginOptions,
    done: HookHandlerDoneFunction,
) => {
    fastify.route({
        method: 'GET',
        url: '/:id?',
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
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
        wsHandler: (socket: WebSocket, request: FastifyRequest) => {
            // TODO: handle user ids on both front and back ends
            // from user inputted url for now
            const { id } = request.params as Params
            console.log('id :=>', id)
            socket.on('message', chunk => {
                console.log('message sent from client!! :=>', chunk.toString())
                socket.send(chunk.toString())
            })

            // TODO: attach to an event
            // i.e. "close connection button" on frontend
            // socket.close()
        },
    })
    done()
}
