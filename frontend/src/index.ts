import 'dotenv/config'
import Fastify, { type FastifyInstance } from 'fastify'
import fastifyConfig from './config'
import registerRoutes from './lib/routes'
import registerPlugins from './lib/plugins'

const fastify: FastifyInstance = Fastify(fastifyConfig)

const start = async (): Promise<string> => {
    try {
        await registerPlugins(fastify)
        await registerRoutes(fastify)
        await fastify.ready()
        return await fastify.listen({
            port: process.env.PORT as unknown as number,
            host: process.env.HOST as string,
        })
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}

start()
