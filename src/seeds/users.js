/* eslint-disable import/no-extraneous-dependencies */
const seeder = require('mongoose-seed');
const faker = require('@faker-js/faker');
const database = require('../config/database');
const User = require('../models/users');

const data = [];

for (let i = 0; i < 2; i + 1) {
  data.push({
    name: faker.name.findName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
  });
}

const usersSeed = [
  {
    model: User,
    documents: data,
  },
];

database.connect();

seeder.loadModels(['src/models/user.js']);
seeder.clearModels(['users']);

seeder.populateModels(usersSeed, () => {
  console.log('Seed concluída!');
  database.disconnect();
});
