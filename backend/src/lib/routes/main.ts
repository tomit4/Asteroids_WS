import type {
    FastifyInstance,
    FastifyPluginOptions,
    FastifyReply,
    FastifyRequest,
    HookHandlerDoneFunction,
} from 'fastify'

export default (
    fastify: FastifyInstance,
    options: FastifyPluginOptions,
    done: HookHandlerDoneFunction,
) => {
    fastify.route({
        method: 'GET',
        url: '/',
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                reply
                    .code(200)
                    .send({ ok: true, message: 'Test Route Hit Succesfully!' })
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
        wsHandler: (socket, req) => {
            // this will handle websockets connections
            socket.send('hello client')

            socket.once('message', chunk => {
                socket.close()
            })
        },
    })
    done()
}
