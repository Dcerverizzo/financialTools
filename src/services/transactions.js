const ValidationError = require('../errors/ValidationError');
const transactionSchema = require('../models/transactions');

// eslint-disable-next-line no-unused-vars
module.exports = (app) => {
  const findAll = async (filter = {}) => {
    const results = await transactionSchema.find({ ...filter }).populate('accounts').exec();
    return results;
  };

  const findOne = async (id) => {
    if (!id) throw new ValidationError('Id é obrigatório');
    const result = await transactionSchema.findById(id);
    if (!result) throw new ValidationError('Transação não encontrada');
    return result;
  };

  const create = async (transaction) => {
    const {
      description, value, type, status, category, date, accountId, userId, balance,
    } = transaction;

    if (!description) throw new ValidationError('Campo descrição é obrigatório');
    if (!value) throw new ValidationError('Campo valor é obrigatório');
    if (!type) throw new ValidationError('Campo tipo é obrigatório');
    if (!category) throw new ValidationError('Campo categoria é obrigatório');
    if (!date) throw new ValidationError('Campo data é obrigatório');
    if (!accountId) throw new ValidationError('Campo conta é obrigatório');
    if (!userId) throw new ValidationError('Campo usuário é obrigatório');
    if (!(typeof balance === 'number' && !Number.isNaN(balance))) {
      throw new ValidationError('Campo saldo é obrigatório');
    }
    let newBalance = 0;
    if (type === 'I') {
      newBalance += value;
    } else {
      newBalance -= value;
    }

    const newTransaction = transactionSchema.create({
      description,
      value,
      type,
      category,
      date,
      accountId,
      status,
      userId,
      balance: newBalance,
    });

    return newTransaction;
  };

  const deleteOne = async (id) => {
    if (!id) throw new ValidationError('Id é obrigatório');
    const result = await transactionSchema.deleteOne({ _id: id });
    return result;
  };

  const update = async (id, transaction) => {
    const {
      description, value, type, status, category, date, accountId, userId, balance,
    } = transaction;

    if (!description) throw new ValidationError('Campo descrição é obrigatório');
    if (!value) throw new ValidationError('Campo valor é obrigatório');
    if (!type) throw new ValidationError('Campo tipo é obrigatório');
    if (!category) throw new ValidationError('Campo categoria é obrigatório');
    if (!date) throw new ValidationError('Campo data é obrigatório');
    if (!accountId) throw new ValidationError('Campo conta é obrigatório');
    if (!userId) throw new ValidationError('Campo usuário é obrigatório');
    if (!(typeof balance === 'number' && !Number.isNaN(balance))) {
      throw new ValidationError('Campo saldo é obrigatório');
    }

    const result = await transactionSchema.findOneAndUpdate(
      { _id: id },
      {
        description, value, type, status, category, date, accountId, userId, balance,
      },
      { new: true },
    );
    return result;
  };

  return {
    findAll, findOne, create, deleteOne, update,
  };
};
