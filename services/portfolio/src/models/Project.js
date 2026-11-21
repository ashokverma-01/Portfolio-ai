const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  legacy_id: { type: String, default: '', index: true },
  category: { type: String, enum: ['erp', 'webgl', 'cloud', 'fintech', 'other'], default: 'other', index: true },
  tag: { type: String, default: 'SYSTEM ARCHITECTURE' },
  name: { type: String, required: true, trim: true },
  summary: { type: String, required: true, trim: true },
  tech_stack: { type: String, default: 'Full-Stack' }, metrics: { type: String, default: '' },
  demo_url: { type: String, default: '#' }, github_url: { type: String, default: '#' },
  image_url: { type: String, default: '' }, image_public_id: { type: String, default: '' },
  sort_order: { type: Number, default: 0 }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
module.exports = mongoose.model('Project', schema);
