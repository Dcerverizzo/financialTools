// eslint-disable-next-line import/no-unresolved
const ValidationError = require('../errors/ValidationError');
const accountSchema = require('../models/accounts');

// eslint-disable-next-line no-unused-vars
module.exports = (app) => {
  const findAll = async (filter = {}) => {
    const results = await accountSchema.find({ ...filter }).exec();
    return results;
  };

  const save = async (req) => {
    if (!req.name) throw new ValidationError('Campo nome é obrigatório');
    if (!req.user_id) throw new ValidationError('Campo user_id é obrigatório');
    const acc = await findAll({ name: req.name, user_id: req.user_id });
    if (acc.length > 0) throw new ValidationError('Já existe uma conta com esse nome');
    const result = await accountSchema.create({
      name: req.name,
      user_id: req.user_id,
    });

    return result;
  };

  const findOne = async (id) => {
    const result = await accountSchema.findById(id).select('-password');
    if (!result) throw new ValidationError('Conta não encontrada');
    return result;
  };

  const update = async (id, account) => {
    const result = await accountSchema.findOneAndUpdate(
      { _id: id },
      { name: account.name },
      { new: true },
    );
    return result;
  };

  const deleteOne = async (id) => {
    if (!id) throw new ValidationError('Id é obrigatório');
    const transactions = await app.services.transactions.findAll({ accountId: id });
    if (transactions.length > 0) throw new ValidationError('Não é possível excluir uma conta com transações');
    const result = await accountSchema.deleteOne({ _id: id });
    return result;
  };

  return {
    findAll, save, findOne, update, deleteOne,
  };
};
