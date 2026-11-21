const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  slug: { type: String, unique: true, required: true, trim: true, lowercase: true },
  title: { type: String, required: true, trim: true }, excerpt: { type: String, required: true },
  content: { type: String, required: true }, category: { type: String, default: 'tech', index: true },
  read_time: { type: String, default: '5 min read' }, author: { type: String, default: 'STUDIO.DEV' }, tags: { type: String, default: '' }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
module.exports = mongoose.model('Blog', schema);
