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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const fastify_1 = __importDefault(require("fastify"));
const config_1 = __importDefault(require("./config"));
const routes_1 = __importDefault(require("./lib/routes"));
const plugins_1 = __importDefault(require("./lib/plugins"));
const fastify = (0, fastify_1.default)(config_1.default);
const start = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, plugins_1.default)(fastify);
        yield (0, routes_1.default)(fastify);
        yield fastify.ready();
        return yield fastify.listen({
            port: process.env.PORT,
            host: process.env.HOST,
        });
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
});
start();
