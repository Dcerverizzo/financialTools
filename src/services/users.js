// eslint-disable-next-line import/no-unresolved
const { hashPassword } = require('../config/bcrypt');
const ValidationError = require('../errors/ValidationError');
const userSchema = require('../models/users');

// eslint-disable-next-line no-unused-vars
module.exports = (app) => {
  const findAll = (filter = {}) => userSchema.find(filter).select('-password');

  const findById = async (id, includePassword = false) => {
    try {
      let query = userSchema.findById(id);
      if (!includePassword) {
        query = query.select('-password');
      }
      const result = await query.exec();
      if (!result) throw new ValidationError('Usuário não encontrado');
      return result;
    } catch (error) {
      throw new ValidationError(error);
    }
  };

  const findOne = async (filter = {}) => userSchema.findOne(filter);

  const remove = async (id) => {
    const result = await userSchema.deleteOne({ _id: id });
    return result;
  };

  const save = async (user) => {
    if (!user.name) throw new ValidationError('Campo nome é obrigatório');
    if (!user.email) throw new ValidationError('Campo email é obrigatório');
    if (!user.password) throw new ValidationError('Campo senha é obrigatório');
    const userDb = await findAll({ email: user.email });
    if (userDb.length > 0) throw new ValidationError('Usuário já existente');
    const newUser = await userSchema.create({
      name: user.name,
      email: user.email,
      password: await hashPassword(user.password),
    });
    // eslint-disable-next-line no-underscore-dangle
    return findById(newUser._id);
  };

  return {
    findAll, save, findById, remove, findOne,
  };
};
