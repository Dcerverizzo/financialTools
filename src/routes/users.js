const express = require('express');

module.exports = (app) => {
  const router = express.Router();

  router.get('/', async (req, res, next) => {
    try {
      const result = await app.services.users.findAll(req, res);
      return res.status(200).send({ result });
    } catch (error) {
      return next(error);
    }
  });

  router.get('/:id', async (req, res, next) => {
    try {
      const result = await app.services.users.findById(req.params.id, true);
      return res.status(201).json(result);
    } catch (error) {
      return next(error);
    }
  });

  router.delete('/:id', async (req, res, next) => {
    try {
      await app.services.users.remove(req.params.id);
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  });

  router.post('/', async (req, res, next) => {
    try {
      const result = await app.services.users.save(req.body);
      return res.status(201).json(result);
    } catch (error) {
      return next(error);
    }
  });

  return router;
};
