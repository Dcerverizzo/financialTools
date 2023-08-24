const mongoose = require('mongoose');

const balanceSchema = new mongoose.Schema({
  account_id: { type: String, required: true },
  balance: { type: Number, required: true },
});

// eslint-disable-next-line no-unused-vars
module.exports = mongoose.model('balances', balanceSchema);
