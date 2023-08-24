/* eslint-disable import/no-extraneous-dependencies */
const seeder = require('mongoose-seed');
const { faker } = require('@faker-js/faker');
const database = require('../config/database');
const Transactions = require('../models/transactions');

const data = [];
for (let i = 0; i < 2; i + 1) {
  data.push({
    description: faker.lorem.word(),
    value: faker.finance.amount(),
    category: faker.random.word(),
    date: faker.date.past(),
    status: faker.random.word(),
    type: faker.random.word(),
    userId: faker.datatype.uuid(),
    accountId: faker.datatype.uuid(),
    balance: faker.finance.amount(),
  });
}

const transactionsSeed = [
  {
    model: Transactions,
    documents: data,
  },
];

database.connect();

seeder.loadModels(['src/models/transactions.js']);
seeder.clearModels(['transactions']);

seeder.populateModels(transactionsSeed, () => {
  console.log('Seed concluída!');
  database.disconnect();
});
