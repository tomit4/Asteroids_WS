import { FastifyInstance } from 'fastify'
import mainRoute from './main'

export default async (fastify: FastifyInstance): Promise<void> => {
    await fastify.register(mainRoute)
}
