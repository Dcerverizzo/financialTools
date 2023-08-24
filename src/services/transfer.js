// eslint-disable-next-line import/no-unresolved
const ValidationError = require('../errors/ValidationError');
const transferSchema = require('../models/transfer');
const AccountSchema = require('../models/accounts');

// eslint-disable-next-line no-unused-vars
module.exports = (app) => {
  const validate = async (transfer) => {
    if (!transfer.description) throw new ValidationError('Campo descrição é obrigatório');
    if (!transfer.value) throw new ValidationError('Campo valor é obrigatório');
    if (!transfer.date) throw new ValidationError('Campo data é obrigatório');
    if (!transfer.originAccountId) throw new ValidationError('Campo conta de origem é obrigatório');
    if (!transfer.destinationAccountId) throw new ValidationError('Campo conta de destino é obrigatório');
  };

  const findAll = async (filter = {}) => {
    const results = await transferSchema.find({ ...filter }).exec();
    return results;
  };

  const findOne = async (id) => {
    const result = await transferSchema.findById(id);
    if (!result) throw new ValidationError('Transferencia não encontrada');
    return result;
  };

  const save = async (transfer) => {
    // Verifica se as contas de origem e destino existem
    const originAccount = await AccountSchema.findById(transfer.originAccountId);
    const destinationAccount = await AccountSchema.findById(transfer.destinationAccountId);
    if (!originAccount || !destinationAccount) {
      throw new Error('Origin and/or destination account not found');
    }

    if (transfer.originAccountId === transfer.destinationAccountId) {
      throw new Error('Origin and destination account must be different');
    }
    if (transfer.value > originAccount.balance) {
      throw new Error('Insufficient funds');
    }
    if (transfer.value <= 0) {
      throw new Error('Invalid value');
    }

    const result = await transferSchema.create({
      description: transfer.description,
      value: transfer.value,
      date: transfer.date,
      status: transfer.status,
      userId: transfer.userId,
      originAccountId: transfer.originAccountId,
      destinationAccountId: transfer.destinationAccountId,
      originBalance: transfer.originBalance,
      destinationBalance: transfer.destinationBalance,
      name: transfer.name,
    });
    return result;
  };

  const remove = async (id) => {
    const result = await transferSchema.findByIdAndDelete(id);
    if (!result) throw new ValidationError('Transferencia não encontrada');
    return result;
  };

  const update = async (id, transfer) => {
    const {
      description, value, date, status, userId, originAccountId, destinationAccountId,
      originBalance, destinationBalance, name,
    } = transfer;

    const result = await transferSchema.findByIdAndUpdate(id, {
      description,
      value,
      date,
      status,
      userId,
      originAccountId,
      destinationAccountId,
      originBalance,
      destinationBalance,
      name,
    }, { new: true });
    return result;
  };

  return {
    findAll, findOne, save, remove, update, validate,
  };
};
