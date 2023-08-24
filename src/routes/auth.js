const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const ValidationError = require('../errors/ValidationError');

module.exports = (app) => {
  const router = express.Router();

  router.post('/signin', async (req, res, next) => {
    try {
      const user = await app.services.users.findOne({ email: req.body.email });
      const isPasswordValid = await bcrypt.compare(req.body.password, user.password);

      if (!isPasswordValid) {
        throw new ValidationError('Senha inválida');
      }

      const payload = { id: user.id };
      const token = jwt.sign(payload, app.get('secret'), { expiresIn: 86400 });

      return res.json({
        name: user.name,
        email: user.email,
        token,
      });
    } catch (error) {
      return next(error);
    }
  });

  router.post('/signup', async (req, res, next) => {
    try {
      const result = await app.services.users.save(req.body);
      return res.status(201).json(result);
    } catch (error) {
      return next(error);
    }
  });

  return router;
};
