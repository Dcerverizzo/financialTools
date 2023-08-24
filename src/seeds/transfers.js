/* eslint-disable import/no-extraneous-dependencies */
const seeder = require('mongoose-seed');
const { faker } = require('@faker-js/faker');
const database = require('../config/database');
const Transfer = require('../models/transfer');

const data = [];

for (let i = 0; i < 2; i + 1) {
  data.push({
    description: faker.lorem.words(),
    value: faker.finance.amount(),
    date: faker.date.past(),
    status: faker.lorem.word(),
    userId: faker.datatype.uuid(),
    originAccountId: faker.datatype.uuid(),
    destinationAccountId: faker.datatype.uuid(),
    originBalance: faker.finance.amount(),
    destinationBalance: faker.finance.amount(),
  });
}

const transfersSeed = [
  {
    model: Transfer,
    documents: data,
  },
];

database.connect();

seeder.loadModels(['src/models/transfer.js']);
seeder.clearModels(['transfer']);

seeder.populateModels(transfersSeed, () => {
  console.log('Seed concluída!');
  database.disconnect();
});
