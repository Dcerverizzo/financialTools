/* eslint-disable no-underscore-dangle */
const request = require('supertest');
const { faker } = require('@faker-js/faker');
const app = require('../src/app');
const database = require('../src/config/database');

database.connect();

const mainRoute = '/v1/accounts';
const authRoute = '/auth';
const userRoute = '/v1/users';

describe('Testes de contas', () => {
  let accountId;
  let accountName;
  let userId;
  let name;
  let email;
  let password;
  let token;
  let accountInsertId;

  jest.setTimeout(10000);

  beforeAll(async () => {
    // Cria uma nova conta para ser utilizada nos testes

    accountName = faker.name.fullName();

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

    const res = await request(app).post(mainRoute)
      .send({ name: `${accountName}`, user_id: `${userId}` })
      .set('Authorization', `Bearer ${token}`);
    accountId = res.body._id;
  });

  afterAll(async () => {
    // Remove a conta criada nos testes
    await request(app).delete(`${mainRoute}/${accountId}`)
      .set('Authorization', `Bearer ${token}`);

    await request(app).delete(`${userRoute}/${userId}`)
      .set('Authorization', `Bearer ${token}`);
  });

  test('Deve inserir uma conta com sucesso', async () => {
    const nameInsert = faker.name.fullName();
    const res = await request(app).post(mainRoute)
      .send({ name: `${nameInsert}` })
      .set('Authorization', `Bearer ${token}`);
    accountInsertId = res.body._id;
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.name).toBe(nameInsert);
  });

  test('Não deve inserir uma conta com nome duplicado', async () => {
    const res = await request(app).post(mainRoute)
      .send({ name: `${accountName}` })
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBe('Já existe uma conta com esse nome');
  });

  test('Deve alterar uma conta com sucesso', async () => {
    const res = await request(app).put(`${mainRoute}/${accountId}`)
      .send({ name: `${accountName} updato`, user_id: `${userId}` })
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe(`${accountName} updato`);
  });

  test('Deve listar apenas as contas do usuário', async () => {
    const res = await request(app)
      .get(mainRoute)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('result');
    expect(res.body.result.length).toBeGreaterThan(0);
    expect(res.body.result[0].user_id).toBe(userId);
  });

  test('Deve listar todas as contas', async () => {
    const res = await request(app)
      .get(mainRoute)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('result');
    expect(res.body.result).toBeInstanceOf(Array);
    expect(res.body.result.length).toBeGreaterThan(0);
  });

  test('Deve retornar uma conta por id', async () => {
    const res = await request(app)
      .get(`${mainRoute}/${accountId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('_id');
    expect(res.body).toHaveProperty('name');
  });

  test('Não deve inserir uma conta sem nome', async () => {
    const res = await request(app).post(mainRoute).send({})
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBe('Campo nome é obrigatório');
  });

  test.skip('Não deve retornar uma conta de outro usuário', async () => {
    const res = await request(app)
      .get(`${mainRoute}/${accountId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBe('Você não tem permissão para acessar essa conta');
  });

  test.skip('Não deve alterar uma conta de outro usuário', async () => {
    const res = await request(app).put(`${mainRoute}/${accountId}`)
      .send({ name: `${accountName} updato1` })
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBe('Você não tem permissão para alterar essa conta');
  });

  test('Deve remover uma conta', async () => {
    const res = await request(app)
      .delete(`${mainRoute}/${accountInsertId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(204);

    // Verifica que a conta não existe mais
    const resGet = await request(app)
      .get(`${mainRoute}/${accountInsertId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(resGet.status).toBe(400);
  });
});
