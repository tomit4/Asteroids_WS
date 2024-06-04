"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (fastify, options, done) => {
    fastify.route({
        method: 'GET',
        url: '/',
        handler: (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                // reply
                // .code(200)
                // .send({ ok: true, message: 'Test Route Hit Succesfully!' })
                throw new Error('ERROR!');
            }
            catch (error) {
                if (error instanceof Error)
                    reply.code(500).send({
                        ok: false,
                        message: error.message,
                    });
            }
            finally {
                return reply;
            }
        }),
    });
    done();
};
