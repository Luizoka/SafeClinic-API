import request from 'supertest';
import app from '../src/app';

describe('Doctor Routes', () => {
  it('deve exigir autenticação para listar médicos', async () => {
    const res = await request(app).get('/api/v1/doctors');
    expect(res.status).toBe(401);
  });

  // Adicione outros testes de criação, listagem, etc.
});
