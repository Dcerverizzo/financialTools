/* eslint-disable no-underscore-dangle */
const request = require('supertest');
const { faker } = require('@faker-js/faker');
const app = require('../src/app');
const database = require('../src/config/database');

database.connect();

const mainRoute = '/v1/transfers';
const authRoute = '/auth';
const userRoute = '/v1/users';
const accountRoute = '/v1/accounts';

describe('Testes de contas', () => {
  let userId1; let userId2; let token1; let token2; let accountId1; let accountId2;
  let transferId;

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
    // const transfer = {
    //   description: 'Transferencia de teste',
    //   value: 100,
    //   date: new Date(),
    //   status: 'Pendente',
    //   userId: userId1,
    //   originAccountId: accountId1,
    //   destinationAccountId: accountId2,
    //   originBalance: 100,
    //   destinationBalance: 100,
    // };

    // const transferRes = await request(app).post(mainRoute)
    //   .send(transfer)
    //   .set('Authorization', `Bearer ${token1}`);

    // console.log(transferRes.body);
    // transferId = transferRes.body._id;
  });

  afterAll(async () => {
    // remove created users and accounts\
    await request(app).delete(`${mainRoute}/${transferId}`).set('Authorization', `Bearer ${token1}`);
    await request(app).delete(`${accountRoute}/${accountId1}`).set('Authorization', `Bearer ${token1}`);
    await request(app).delete(`${accountRoute}/${accountId2}`).set('Authorization', `Bearer ${token2}`);
    await request(app).delete(`${userRoute}/${userId1}`).set('Authorization', `Bearer ${token1}`);
    await request(app).delete(`${userRoute}/${userId2}`).set('Authorization', `Bearer ${token2}`);
  });

  test('Deve inserir uma transferencia com sucesso', async () => {
    const transfer = {
      description: 'Transferencia de teste',
      value: 100,
      date: new Date(),
      status: 'Pendente',
      userId: userId1,
      originAccountId: accountId1,
      destinationAccountId: accountId2,
      originBalance: 100,
      destinationBalance: 100,
      name: 'Teste',
    };

    const res = await request(app).post(mainRoute)
      .send({ ...transfer })
      .set('Authorization', `Bearer ${token1}`);
    transferId = res.body._id;
    expect(res.statusCode).toEqual(201);
    expect(res.body.description).toEqual('Transferencia de teste');
  });

  test('Deve listar apenas as transferencias do usuário', async () => {
    const res = await request(app).get(mainRoute)
      .set('Authorization', `Bearer ${token1}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.result.length).toBeGreaterThan(0);
    expect(res.body.result[0].description).toEqual('Transferencia de teste');
  });

  test('Deve retornar uma transferencia válida por id', async () => {
    const res = await request(app).get(`${mainRoute}/${transferId}`)
      .set('Authorization', `Bearer ${token1}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.result.description).toEqual('Transferencia de teste');
  });

  test('Deve alterar uma transferencia com sucesso', async () => {
    const res = await request(app).put(`${mainRoute}/${transferId}`)
      .send({ description: 'Transferencia alterada' })
      .set('Authorization', `Bearer ${token1}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.result.description).toEqual('Transferencia alterada');
  });

  test('Não deve alterar uma transferencia de outro usuário', async () => {
    const res = await request(app).put(`${mainRoute}/${transferId}`)
      .send({ description: 'Transferencia alterada 123' })
      .set('Authorization', `Bearer ${token2}`);
    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toEqual('Você não tem permissão para acessar essa conta');
  });

  test('Deve remover uma transferencia com sucesso', async () => {
    const res = await request(app).delete(`${mainRoute}/${transferId}`)
      .set('Authorization', `Bearer ${token1}`);
    expect(res.statusCode).toEqual(204);
  });
});
