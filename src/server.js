const app = require('./app');

const database = require('./config/database');

database.connect();

app.listen(3001);
