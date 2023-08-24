/* eslint-disable no-unused-vars */
const mongoose = require('mongoose');
const transactionsSchema = require('../models/transactions');
const ValidationError = require('../errors/ValidationError');

module.exports = (app) => {
  const getSaldo = async (userId) => {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('ID de usuário inválido');
    }

    const result = await transactionsSchema.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId(userId),
        },
      },
      {
        $group: {
          _id: userId,
          sum: {
            $sum: '$balance',
          },
        },
      },
    ]);
    if (!result || !result.length) {
      throw new ValidationError('Saldo não encontrado');
    }

    return result[0];
  };

  return { getSaldo };
};
