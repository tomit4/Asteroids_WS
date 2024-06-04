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
const static_1 = __importDefault(require("@fastify/static"));
const node_path_1 = __importDefault(require("node:path"));
exports.default = (fastify) => __awaiter(void 0, void 0, void 0, function* () {
    yield fastify.register(static_1.default, {
        root: node_path_1.default.join(__dirname, '../../public'),
        prefix: '/public/', // optional: default '/'
        // constraints: {}, // { host: 'example.com' }
    });
    yield fastify.register(static_1.default, {
        root: node_path_1.default.join(__dirname, '../../public/css'),
        prefix: '/css/',
        decorateReply: false, // the reply decorator has been added by the first plugin registration
    });
    yield fastify.register(static_1.default, {
        root: node_path_1.default.join(__dirname, '../../public/js'),
        prefix: '/js/',
        decorateReply: false, // the reply decorator has been added by the first plugin registration
    });
});
