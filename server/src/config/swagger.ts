import path from 'path';
import swaggerJsDoc, { type SwaggerDefinition } from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const isProd = process.env.NODE_ENV === 'production';

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
        sessionCookie: {
          type: 'apiKey',
          in: 'cookie',
          name: 'session',
        },
      },
    },
  } as SwaggerDefinition,
  apis: isProd
    ? [path.join(process.cwd(), 'dist/routes/*.js'), path.join(process.cwd(), 'dist/docs/*.js')]
    : [path.join(process.cwd(), 'src/routes/*.ts'), path.join(process.cwd(), 'src/docs/*.ts')],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

export { swaggerDocs, swaggerUi };
