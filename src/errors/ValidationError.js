module.exports = function ValidationError(message) {
  this.name = 'ValidationError';
  this.message = message;
  this.stack = (new Error()).stack;
};
