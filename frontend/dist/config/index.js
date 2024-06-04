"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fastifyConfig = {
    logger: {
        transport: {
            target: 'pino-pretty',
        },
    },
};
exports.default = fastifyConfig;
