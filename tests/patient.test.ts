import request from 'supertest';
import app from '../src/app';

describe('Patient Routes', () => {
  it('deve retornar erro ao criar paciente sem dados obrigatórios', async () => {
    const res = await request(app).post('/api/v1/patients').send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  // Adicione outros testes de criação, listagem, etc.
});
