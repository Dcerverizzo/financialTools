const seeder = require('mongoose-seed');
const { accountSeed } = require('./accounts');
const database = require('../config/database');

database.connect(() => {
  seeder.loadModels([
    'src/models/accounts.js',
  ]);
  seeder.clearModels(['accounts'], () => {
    seeder.populateModels(accountSeed, () => {
      console.log('Seed concluída!');
      database.disconnect();
    });
  });
});
