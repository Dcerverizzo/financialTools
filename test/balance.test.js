/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */
const request = require('supertest');
const { faker } = require('@faker-js/faker');
const app = require('../src/app');
const database = require('../src/config/database');

database.connect();

const mainRoute = '/v1/balance';
const authRoute = '/auth';
const userRoute = '/v1/users';
const accountRoute = '/v1/accounts';
const transferRoute = 'v1/transfers';
const transactionRoute = '/v1/transactions';

describe('Testes de contas', () => {
  let userId1; let userId2; let token1; let token2; let accountId1; let accountId2;
  let transactionId;

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

    // criar uma transferencia entre as contas
    const res = await request(app).post(transactionRoute)
      .send({
        description: 'Transferencia de teste',
        date: new Date(),
        value: 100,
        type: 'I',
        accountId: accountId1,
        category: 'Transfer',
        status: true,
        userId: userId1,
        balance: 0,
      })
      .set('Authorization', `Bearer ${token1}`);
    transactionId = res.body._id;
  });

  beforeEach(async () => {
    jest.setTimeout(10000);
  });

  afterAll(async () => {
    // remove created users and accounts\
    await request(app).delete(`${transactionRoute}/${transactionId}`).set('Authorization', `Bearer ${token1}`);
    await request(app).delete(`${accountRoute}/${accountId1}`).set('Authorization', `Bearer ${token1}`);
    await request(app).delete(`${accountRoute}/${accountId2}`).set('Authorization', `Bearer ${token2}`);
    await request(app).delete(`${userRoute}/${userId1}`).set('Authorization', `Bearer ${token1}`);
    await request(app).delete(`${userRoute}/${userId2}`).set('Authorization', `Bearer ${token2}`);
  });

  describe('Ao calcular o saldo do usuario', () => {
    test('Deve retornar apenas as contas com alguma transaçao', async () => {
      const res = await request(app).get(mainRoute)
        .set('Authorization', `Bearer ${token1}`);
      expect(res.status).toBe(200);
      expect(res.body.result.sum).toBe(100);
      expect(res.body.result._id).toBe(userId1);
    });

    test('Deve adicionar valores de entrada', async () => {
      const res = await request(app).get(mainRoute)
        .set('Authorization', `Bearer ${token1}`);
      expect(res.status).toBe(200);
      expect(res.body.result.sum).toBe(100);
    });

    test('Deve retornar o saldo de cada conta', async () => {
      const res = await request(app).get(mainRoute)
        .set('Authorization', `Bearer ${token1}`);
      expect(res.status).toBe(200);
      expect(res.body.result.sum).toBe(100);
    });

    test('Deve retornar o saldo total do usuario', async () => {
      const res = await request(app).get(mainRoute)
        .set('Authorization', `Bearer ${token1}`);
      expect(res.status).toBe(200);
      expect(res.body.result.sum).toBe(100);
    });

    test.skip('Deve substrair valores de saida', async () => {
      const res = await request(app).get(transactionRoute)
        .send({
          description: 'Teste', value: -100, date: new Date(), status: 'Pendente', account_id: accountId1,
        })
        .set('Authorization', `Bearer ${token1}`);
      expect(res.status).toBe(200);
      expect(res.body[0].balance).toBe(0);
      await request(app).delete(`${transactionRoute}/${res.body[0]._id}`)
        .set('Authorization', `Bearer ${token1}`)
        .send({ account_id: accountId1 });
      expect(res.status).toBe(200);
    });
  });
});
