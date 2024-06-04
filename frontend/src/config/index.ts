import { type FastifyLoggerOptions } from 'fastify'

type FastifyConfig = {
    logger?: FastifyLoggerOptions & {
        transport: {
            target: string
        }
    }
}

const fastifyConfig: FastifyConfig = {
    logger: {
        transport: {
            target: 'pino-pretty',
        },
    },
}

export default fastifyConfig
