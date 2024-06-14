import path from 'node:path'
import type {
    FastifyInstance,
    FastifyPluginOptions,
    FastifyReply,
    FastifyRequest,
    HookHandlerDoneFunction,
} from 'fastify'

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
                    .code(200)
                    .sendFile(
                        'index.html',
                        path.join(__dirname, '../../public/'),
                    )
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
    })
    done()
}
