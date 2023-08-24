const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  name: { type: String, required: true },
  user_id: { type: String, required: true },
});

// eslint-disable-next-line no-unused-vars
module.exports = mongoose.model('accounts', accountSchema);
