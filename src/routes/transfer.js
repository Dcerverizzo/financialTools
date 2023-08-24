const express = require('express');
const RecurseInvalidError = require('../errors/RecurseInvalidError');

module.exports = (app) => {
  const router = express.Router();

  const validate = (req, res, next) => {
    app.services.transfer.validate({ ...req.body, userId: req.user.id })
      .then(() => next()).catch((error) => next(error));
  };

  router.param('id', async (req, res, next) => {
    await app.services.transfer.findOne(req.params.id)
      // eslint-disable-next-line consistent-return
      .then((result) => {
        if (result.userId.toString() !== req.user.id) return next(new RecurseInvalidError());
        next();
      }).catch((error) => next(error));
  });

  router.get('/', async (req, res, next) => {
    await app.services.transfer.findAll({ user_id: req.user.id })
      .then((result) => res.status(200).send({ result })).catch((error) => next(error));
  });

  router.post('/', validate, async (req, res, next) => {
    await app.services.transfer.save({ ...req.body })
      .then((result) => res.status(201).json(result)).catch((error) => next(error));
  });

  router.delete('/:id', async (req, res, next) => {
    await app.services.transfer.remove(req.params.id)
      .then(() => res.status(204).send()).catch((error) => next(error));
  });

  router.get('/:id', async (req, res, next) => {
    await app.services.transfer.findOne(req.params.id)
      .then((result) => res.status(200).send({ result })).catch((error) => next(error));
  });

  router.put('/:id', async (req, res, next) => {
    await app.services.transfer.update(req.params.id, req.body)
      .then((result) => res.status(200).send({ result })).catch((error) => next(error));
  });

  return router;
};
