/* eslint-disable no-underscore-dangle */
const request = require('supertest');
const { faker } = require('@faker-js/faker');
const app = require('../src/app');
const database = require('../src/config/database');

database.connect();

describe('Teste de autenticação', () => {
  let user;
  let accountId;
  let token;
  let userId;
  const userRoute = '/v1/users';
  const authRoute = '/auth';

  jest.setTimeout(10000);

  beforeAll(async () => {
    // Cria um novo usuário para ser utilizado nos testes
    const name = faker.name.fullName();
    const password = '1234567';
    const email = faker.internet.email();

    const res = await request(app)
      .post(`${authRoute}/signup`)
      .send({ name, email, password });

    user = res.body;
    userId = user._id;
  });

  afterAll(async () => {
    // Remove o usuário criado nos testes
    await request(app).delete(`${userRoute}/${accountId}`);
    await request(app).delete(`${userRoute}/${userId}`).set('Authorization', `Bearer ${token}`);
  });

  test('Deve retornar um token de autenticação', async () => {
    const { email } = user;
    const res = await request(app)
      .post(`${authRoute}/signin`)
      .send({ email, password: '1234567' });
    token = res.body.token;
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  test('Não deve autenticar um usuário com senha errada', async () => {
    const { email } = user;
    const res = await request(app)
      .post(`${authRoute}/signin`)
      .send({ email, password: '12345678' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBe('Senha inválida');
  });

  test('Nao deve acessar uma rota protegida sem token', async () => {
    const res = await request(app).get(userRoute);
    expect(res.status).toBe(401);
  });
});
