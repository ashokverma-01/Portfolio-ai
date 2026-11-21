const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  legacy_id: { type: String, default: '', index: true },
  ref_id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
  scope: { type: String, default: 'WebGL & Frappe Architecture', maxlength: 200 },
  budget: { type: String, default: 'Undisclosed', maxlength: 100 },
  timeline: { type: String, default: 'Immediate', maxlength: 100 },
  details: { type: String, default: '', maxlength: 10000 },
  status: { type: String, enum: ['unread', 'contacted', 'archived'], default: 'unread', index: true },
  ip: { type: String, default: '' }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
module.exports = mongoose.model('Inquiry', schema);
