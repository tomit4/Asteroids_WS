import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import type { WebSocket } from '@fastify/websocket'
export default async (fastify: FastifyInstance): Promise<void> => {
    await fastify.register(import('@fastify/websocket'), {
        errorHandler: (
            _: Error,
            socket: WebSocket,
            __: FastifyRequest,
            ___: FastifyReply,
        ) => {
            socket.terminate()
        },
        options: {
            maxPayload: 1048576, // maximum allowed messages size to 1 MiB
        },
    })
}
