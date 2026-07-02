"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpec = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const env_1 = require("./env");
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'HomiePG SaaS Backend API Documentation',
            version: '1.0.0',
            description: 'API specifications and endpoints reference for HomiePG paying guest management.',
            contact: {
                name: 'HomiePG Tech Team',
                email: 'support@homiepg.com',
            },
        },
        servers: [
            {
                url: `http://localhost:${env_1.env.PORT}/api/v1`,
                description: 'Development Server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter Supabase authenticated user JWT token.',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./src/routes/**/*.ts', './src/modules/**/*.ts'],
};
exports.swaggerSpec = (0, swagger_jsdoc_1.default)(options);
exports.default = exports.swaggerSpec;
