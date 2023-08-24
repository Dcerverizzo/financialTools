/* eslint-disable import/no-extraneous-dependencies */
const { faker } = require('@faker-js/faker');

const accountSeed = [{
  model: 'accounts',
  documents: [],
}];

accountSeed[0].documents.push({
  name: `${faker.name.firstName()} ${faker.name.lastName()}`,
  user_id: faker.datatype.uuid(),
});

module.exports = { accountSeed };
