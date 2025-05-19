import request from 'supertest';
import app from '../src/app';

describe('Auth Routes', () => {
  it('deve retornar erro ao tentar login sem credenciais', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  // Adicione outros testes de login, refresh-token, etc.
});
