const express = require('express');
const authMiddleware = require('./authMiddleware');

module.exports = (app) => {
  app.use('/auth', app.routes.auth);

  const protectedApi = express.Router();

  protectedApi.use('/users', authMiddleware, app.routes.users);
  protectedApi.use('/accounts', authMiddleware, app.routes.accounts);
  protectedApi.use('/transactions', authMiddleware, app.routes.transactions);
  protectedApi.use('/transfers', authMiddleware, app.routes.transfer);
  protectedApi.use('/balance', authMiddleware, app.routes.balance);

  app.use('/v1', authMiddleware, protectedApi);
};
