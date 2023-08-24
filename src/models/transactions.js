const mongoose = require('mongoose');

const { Schema } = mongoose;

const transactionSchema = new mongoose.Schema({
  description: { type: String, required: true },
  value: { type: Number, min: 0, required: true },
  category: { type: String, required: true },
  date: { type: Date, required: true },
  status: { type: String },
  type: { type: String, required: true },
  userId: { type: Schema.ObjectId, required: true, ref: 'users' },
  accountId: { type: Schema.ObjectId, required: true, ref: 'accounts' },
  balance: { type: Number, min: 0, required: true },
}, { strictPopulate: false });

// eslint-disable-next-line no-unused-vars
module.exports = mongoose.model('transactions', transactionSchema);
