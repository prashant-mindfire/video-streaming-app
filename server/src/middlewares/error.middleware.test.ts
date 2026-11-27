import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { errorHandler } from './error.middleware';
import { AppError } from '../utils/app.error';

describe('errorHandler', () => {
  it('has Express error middleware arity', () => {
    expect(errorHandler.length).toBe(4);
  });

  it('returns the formatted JSON error response', async () => {
    const app = express();
    app.get('/failure', (_req, _res, next) => {
      next(new AppError('Request failed', 422));
    });
    app.use(errorHandler);

    const response = await request(app).get('/failure').expect(422);

    expect(response.body).toMatchObject({
      success: false,
      message: 'Request failed',
    });
  });
});
