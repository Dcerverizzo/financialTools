const express = require('express');
const RecurseInvalidError = require('../errors/RecurseInvalidError');

module.exports = (app) => {
  const router = express.Router();

  router.param('id', async (req, res, next) => {
    await app.services.accounts.findOne(req.params.id)
      // eslint-disable-next-line consistent-return
      .then((result) => {
        if (result.user_id !== req.user.id) return next(new RecurseInvalidError());
        next();
      }).catch((error) => next(error));
  });

  router.get('/', async (req, res, next) => {
    await app.services.accounts.findAll({ user_id: req.user.id })
      .then((result) => res.status(200).send({ result })).catch((error) => next(error));
  });

  router.post('/', async (req, res, next) => {
    await app.services.accounts.save({ ...req.body, user_id: req.user.id })
      .then((result) => res.status(201).json(result)).catch((error) => next(error));
  });

  router.get('/:id', async (req, res, next) => {
    await app.services.accounts.findOne(req.params.id)
      .then((result) => res.status(200).json(result)).catch((error) => next(error));
  });

  router.put('/:id', async (req, res, next) => {
    await app.services.accounts.update(req.params.id, req.body)
      .then((result) => res.status(200).json(result)).catch((error) => next(error));
  });

  router.delete('/:id', async (req, res, next) => {
    await app.services.accounts.deleteOne(req.params.id)
      .then((result) => res.status(204).json(result)).catch((error) => next(error));
  });

  return router;
};
