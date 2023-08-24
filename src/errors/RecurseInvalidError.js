module.exports = function RecurseInvalidError(message = 'Você não tem permissão para acessar essa conta') {
  this.name = 'RecurseInvalidError';
  this.message = message;
  this.stack = (new Error()).stack;
};
