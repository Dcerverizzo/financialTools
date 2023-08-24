const mongoose = require('mongoose');

const { Schema } = mongoose;

const transferSchema = new mongoose.Schema({
  description: { type: String, required: true },
  value: { type: Number, min: 0, required: true },
  date: { type: Date, required: true },
  status: { type: String },
  userId: { type: Schema.ObjectId, required: true, ref: 'users' },
  originAccountId: { type: Schema.ObjectId, required: true, ref: 'accounts' },
  destinationAccountId: { type: Schema.ObjectId, required: true, ref: 'accounts' },
  originBalance: { type: Number, min: 0, required: true },
  destinationBalance: { type: Number, min: 0, required: true },
}, { strictPopulate: false });

module.exports = mongoose.model('transfers', transferSchema);
