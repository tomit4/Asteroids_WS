import type { FastifyInstance } from 'fastify'
export default async (fastify: FastifyInstance): Promise<void> => {
    await fastify.register(import('@fastify/websocket'), {
        errorHandler: function (error, socket, request, reply) {
            socket.terminate()
        },
        options: {
            maxPayload: 1048576, // maximum allowed messages size to 1 MiB
        },
    })
}
