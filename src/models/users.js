const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, unique: true },
  password: { type: String },
});

// eslint-disable-next-line no-unused-vars
module.exports = mongoose.model('users', userSchema);
