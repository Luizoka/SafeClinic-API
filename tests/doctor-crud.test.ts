import request from 'supertest';
import app from '../src/app';

// Você pode precisar criar um usuário recepcionista e fazer login para obter o token
// Aqui está um fluxo básico para isso:
const receptionist = {
  name: 'Recepcionista Teste',
  email: 'recep.test@safeclinic.com',
  password: '123456',
  cpf: '12345678901',
  work_shift: 'morning'
};

const doctor = {
  name: 'Dr. Teste',
  email: 'dr.teste@safeclinic.com',
  password: '123456',
  cpf: '98765432100',
  crm: 'CRM12345',
  speciality: 'Cardiologia',
  phone: '11999999999'
};

let receptionistToken: string;
let doctorId: string;

describe('CRUD Doctor (Médico)', () => {
  beforeAll(async () => {
    // Cria o primeiro recepcionista (rota pública)
    await request(app)
      .post('/api/v1/receptionists/register')
      .send(receptionist);

    // Faz login como recepcionista
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: receptionist.email, password: receptionist.password });

    receptionistToken = loginRes.body.token;
    expect(receptionistToken).toBeDefined();
  });

  it('deve criar um novo médico', async () => {
    const res = await request(app)
      .post('/api/v1/doctors')
      .set('Authorization', `Bearer ${receptionistToken}`)
      .send(doctor);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('crm', doctor.crm);
    doctorId = res.body.id;
  });

  it('deve buscar o médico criado', async () => {
    const res = await request(app)
      .get(`/api/v1/doctors/${doctorId}`)
      .set('Authorization', `Bearer ${receptionistToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', doctorId);
    expect(res.body).toHaveProperty('crm', doctor.crm);
  });

  it('deve editar o médico', async () => {
    const update = { speciality: 'Neurologia', phone: '11888888888' };
    const res = await request(app)
      .put(`/api/v1/doctors/${doctorId}`)
      .set('Authorization', `Bearer ${receptionistToken}`)
      .send(update);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('speciality', update.speciality);
    expect(res.body).toHaveProperty('phone', update.phone);
  });

  it('deve deletar (desativar) o médico', async () => {
    const res = await request(app)
      .delete(`/api/v1/doctors/${doctorId}`)
      .set('Authorization', `Bearer ${receptionistToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  it('não deve encontrar o médico após deleção', async () => {
    const res = await request(app)
      .get(`/api/v1/doctors/${doctorId}`)
      .set('Authorization', `Bearer ${receptionistToken}`);

    expect(res.status).toBe(404);
  });
});
