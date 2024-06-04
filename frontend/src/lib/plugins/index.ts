import fastifyStatic from '@fastify/static'
import type { FastifyInstance } from 'fastify'
import path from 'node:path'

export default async (fastify: FastifyInstance): Promise<void> => {
    await fastify.register(fastifyStatic, {
        root: path.join(__dirname, '../../public'),
        prefix: '/public/', // optional: default '/'
        // constraints: {}, // { host: 'example.com' }
    })
    await fastify.register(fastifyStatic, {
        root: path.join(__dirname, '../../public/css'),
        prefix: '/css/',
        decorateReply: false, // the reply decorator has been added by the first plugin registration
    })
    await fastify.register(fastifyStatic, {
        root: path.join(__dirname, '../../public/js'),
        prefix: '/js/',
        decorateReply: false, // the reply decorator has been added by the first plugin registration
    })
}
