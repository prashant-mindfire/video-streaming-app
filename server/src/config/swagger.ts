import swaggerJsDoc, { type SwaggerDefinition } from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const swaggerOptions: swaggerJsDoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Video Streaming API',
            version: '1.0.0',
            description: 'Video Streaming API',
        },
        servers: [
            {
                url: `/api/${process.env.API_VERSION}`,
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    } as SwaggerDefinition,
    apis: ['./src/routes/*.ts'],
}

const swaggerDocs = swaggerJsDoc(swaggerOptions)

export { swaggerDocs, swaggerUi }
