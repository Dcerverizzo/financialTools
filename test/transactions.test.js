/* eslint-disable no-underscore-dangle */
const request = require('supertest');
const { faker } = require('@faker-js/faker');
const app = require('../src/app');

const database = require('../src/config/database');

database.connect();

const mainRoute = '/v1/transactions';
const authRoute = '/auth';
const userRoute = '/v1/users';
const accountRoute = '/v1/accounts';

describe('Testes de contas', () => {
  let userId1; let userId2; let token1; let token2; let accountId1; let accountId2;
  let transactionId;
  let transactionBalanceId;

  jest.setTimeout(10000);

  beforeAll(async () => {
    // create first user and account
    const name1 = faker.name.firstName();
    const email1 = faker.internet.email();
    const password1 = '1234567';

    const userCreate1 = await request(app)
      .post(`${authRoute}/signup`)
      .send({ name: name1, email: email1, password: password1 });

    const userLogin1 = await request(app)
      .post(`${authRoute}/signin`)
      .send({ email: email1, password: password1 });

    userId1 = userCreate1.body._id;
    token1 = userLogin1.body.token;

    const accountName1 = faker.name.fullName();
    const res1 = await request(app).post(accountRoute)
      .send({ name: accountName1, user_id: userId1 })
      .set('Authorization', `Bearer ${token1}`);

    accountId1 = res1.body._id;

    // create second user and account
    const name2 = faker.name.firstName();
    const email2 = faker.internet.email();
    const password2 = '1234567';

    const userCreate2 = await request(app)
      .post(`${authRoute}/signup`)
      .send({ name: name2, email: email2, password: password2 });

    const userLogin2 = await request(app)
      .post(`${authRoute}/signin`)
      .send({ email: email2, password: password2 });

    userId2 = userCreate2.body._id;
    token2 = userLogin2.body.token;

    const accountName2 = faker.name.fullName();
    const res2 = await request(app).post(accountRoute)
      .send({ name: accountName2, user_id: userId2 })
      .set('Authorization', `Bearer ${token2}`);

    accountId2 = res2.body._id;
  });

  beforeEach(async () => {
    jest.setTimeout(10000);
  });

  afterAll(async () => {
    // remove created users and accounts\
    await request(app).delete(`${mainRoute}/${transactionBalanceId}`).set('Authorization', `Bearer ${token1}`);
    await request(app).delete(`${accountRoute}/${accountId1}`).set('Authorization', `Bearer ${token1}`);
    await request(app).delete(`${accountRoute}/${accountId2}`).set('Authorization', `Bearer ${token2}`);
    await request(app).delete(`${userRoute}/${userId1}`).set('Authorization', `Bearer ${token1}`);
    await request(app).delete(`${userRoute}/${userId2}`).set('Authorization', `Bearer ${token2}`);
  });

  test('Deve listar apenas as transações do usuario', async () => {
    const res = await request(app).get(mainRoute)
      .set('Authorization', `Bearer ${token1}`);
    expect(res.statusCode).toEqual(200);
  });

  test('Deve inserir uma transação com sucesso', async () => {
    const res = await request(app).post(mainRoute)
      .send({
        description: 'Salário1',
        date: new Date(),
        value: 100,
        type: 'I',
        accountId: accountId1,
        category: 'Salário1',
        status: true,
        userId: userId1,
        balance: 0,
      })
      .set('Authorization', `Bearer ${token1}`);
    transactionId = res.body._id;
    expect(res.statusCode).toEqual(201);
    expect(res.body.accountId).toEqual(accountId1);
  });

  test('Deve retornar uma transação por ID', async () => {
    const res = await request(app).get(`${mainRoute}/${transactionId}`)
      .set('Authorization', `Bearer ${token1}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body._id).toEqual(transactionId);
    expect(res.body.accountId).toEqual(accountId1);
    expect(res.body.description).toEqual('Salário1');
  });

  test('Deve alterar uma transação com sucesso', async () => {
    const res = await request(app).put(`${mainRoute}/${transactionId}`)
      .send({
        description: 'Salário atualizado',
        date: new Date(),
        value: 100,
        type: 'I',
        accountId: accountId1,
        category: 'Salário',
        status: true,
        userId: userId1,
        balance: 0,
      })
      .set('Authorization', `Bearer ${token1}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body._id).toEqual(transactionId);
    expect(res.body.accountId).toEqual(accountId1);
    expect(res.body.description).toEqual('Salário atualizado');
  });

  test('Não deve manipular transação de outro usuário', async () => {
    const res = await request(app).put(`${mainRoute}/${transactionId}`)
      .send({
        description: 'Salário atualizado de outro usuario',
        date: new Date(),
        value: 100,
        type: 'I',
        accountId: accountId1,
        category: 'Salário',
        status: true,
        userId: userId1,
        balance: 0,
      })
      .set('Authorization', `Bearer ${token2}`);
    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toEqual('Você não tem permissão para acessar essa conta');
  });

  test('Transação de entrada deve atualizar o saldo da conta', async () => {
    const res = await request(app).post(mainRoute)
      .send({
        description: 'Salário',
        date: new Date(),
        value: 100,
        type: 'I',
        accountId: accountId1,
        category: 'Salário',
        status: true,
        userId: userId1,
        balance: 0,
      })
      .set('Authorization', `Bearer ${token1}`);
    transactionBalanceId = res.body._id;
    expect(res.statusCode).toEqual(201);
    expect(res.body.accountId).toEqual(accountId1);
    expect(res.body.balance).toEqual(100);
  });

  test('Nao deve inserir uma transaçao sem descrição', async () => {
    const res = await request(app).post(mainRoute)
      .send({
        date: new Date(),
        value: 100,
        type: 'I',
        accountId: accountId1,
        category: 'Salário2',
        status: true,
        userId: userId1,
        balance: 0,
      })
      .set('Authorization', `Bearer ${token1}`);
    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toEqual('Campo descrição é obrigatório');
  });

  test('Nao deve inserir uma transaçao sem data', async () => {
    const res = await request(app).post(mainRoute)
      .send({
        description: 'Salário3',
        value: 100,
        type: 'I',
        accountId: accountId1,
        category: 'Salário3',
        status: true,
        userId: userId1,
        balance: 0,
      })
      .set('Authorization', `Bearer ${token1}`);
    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toEqual('Campo data é obrigatório');
  });

  test('Nao deve inserir uma transaçao sem valor', async () => {
    const res = await request(app).post(mainRoute)
      .send({
        description: 'Salário4',
        date: new Date(),
        type: 'I',
        accountId: accountId1,
        category: 'Salário4',
        status: true,
        userId: userId1,
        balance: 0,
      })
      .set('Authorization', `Bearer ${token1}`);
    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toEqual('Campo valor é obrigatório');
  });

  test('Nao deve inserir uma transaçao sem tipo', async () => {
    const res = await request(app).post(mainRoute)
      .send({
        description: 'Salário5',
        date: new Date(),
        value: 100,
        accountId: accountId1,
        category: 'Salário5',
        status: true,
        userId: userId1,
        balance: 0,
      })
      .set('Authorization', `Bearer ${token1}`);
    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toEqual('Campo tipo é obrigatório');
  });

  test('Nao deve inserir uma transaçao sem conta', async () => {
    const res = await request(app).post(mainRoute)
      .send({
        description: 'Salário6',
        date: new Date(),
        value: 100,
        type: 'I',
        category: 'Salário6',
        status: true,
        userId: userId1,
        balance: 0,
      })
      .set('Authorization', `Bearer ${token1}`);
    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toEqual('Campo conta é obrigatório');
  });

  test('Nao deve remover uma conta com transações', async () => {
    const res = await request(app).delete(`${accountRoute}/${accountId1}`)
      .set('Authorization', `Bearer ${token1}`);
    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toEqual('Não é possível excluir uma conta com transações');
  });

  test('Deve remover uma transação com sucesso', async () => {
    const res = await request(app).delete(`${mainRoute}/${transactionId}`)
      .set('Authorization', `Bearer ${token1}`);
    expect(res.statusCode).toEqual(204);

    const res2 = await request(app).get(`${mainRoute}/${transactionId}`)
      .set('Authorization', `Bearer ${token1}`);
    expect(res2.statusCode).toEqual(400);
    expect(res2.body.error).toEqual('Transação não encontrada');
  });
});
