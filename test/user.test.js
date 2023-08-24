/* eslint-disable no-underscore-dangle */
const request = require('supertest');
const { faker } = require('@faker-js/faker');
const app = require('../src/app');
const database = require('../src/config/database');

const mainRoute = '/v1/users';
const authRoute = '/auth';

describe('Testes de usuários', () => {
  let name;
  let email;
  let password;
  let userId;
  let token;

  beforeAll(async () => {
    await database.connect();
    name = faker.name.firstName();
    email = faker.internet.email();
    password = '1234567';

    const userCreate = await request(app)
      .post(`${authRoute}/signup`)
      .send({ name, email, password });

    const userLogin = await request(app)
      .post(`${authRoute}/signin`)
      .send({ email, password });

    userId = userCreate.body._id;
    token = userLogin.body.token;
  });

  afterAll(async () => {
    await request(app).delete(`${mainRoute}/${userId}`).set('Authorization', `Bearer ${token}`);
    await database.disconnect();
  });

  test.skip('Deve inserir usuário com sucesso', async () => {
    const res = await request(app)
      .post(`${authRoute}/signup`)
      .send({ name, email, password });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.name).toBe(name);
    expect(res.body.email).toBe(email);
    expect(res.body).not.toHaveProperty('password');
  });

  test('Deve listar todos os usuários', async () => {
    const res = await request(app)
      .get(mainRoute)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.result.length).toBeGreaterThan(0);
  });

  test('Nao Deve inserir usuário sem nome', async () => {
    request(app)
      .post(mainRoute)
      .send({ email, password })
      .set('Authorization', `Bearer ${token}`)
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Campo nome é obrigatório');
      });
  });

  test('Nao Deve inserir usuário sem email', async () => {
    request(app)
      .post(mainRoute)
      .send({ name, password })
      .set('Authorization', `Bearer ${token}`)
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Campo email é obrigatório');
      });
  });

  test('Nao Deve inserir usuário sem senha', async () => {
    request(app)
      .post(mainRoute)
      .send({ name, email })
      .set('Authorization', `Bearer ${token}`)
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Campo senha é obrigatório');
      });
  });

  test('Nao Deve inserir usuário com email existente', async () => {
    const res = await request(app)
      .post(mainRoute)
      .send({ name, email, password })
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Usuário já existente');
  });

  test('Deve armazenar senha criptografada', async () => {
    const res = await request(app)
      .get(`${mainRoute}/${userId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(201);
    // eslint-disable-next-line no-underscore-dangle
    expect(res.body.password).not.toBeUndefined();
    expect(res.body.password).not.toBe(password);
  });

  test.skip('Deve remover usuário por id', async () => {
    const user = await request(app)
      .get(mainRoute)
      .set('Authorization', `Bearer ${token}`);

    const res = await request(app)
      .set('Authorization', `Bearer ${token}`)
      // eslint-disable-next-line no-underscore-dangle
      .delete(`/users/${user.body.result[0]._id}`);
    expect(res.status).toBe(204);
  });
});
