const express = require('express');
const mongoose = require('mongoose');
const Blog = require('../models/Blog');
const requireAdmin = require('../../../../server/src/middleware/adminAuth');
const router = express.Router();
router.get('/', async (req, res, next) => {
  try {
    const filter = req.query.category && req.query.category !== 'all' ? { category: req.query.category } : {};
    const blogs = await Blog.find(filter).select('-content').sort({ created_at: -1 }).lean();
    res.json({ success: true, count: blogs.length, blogs });
  } catch (e) { next(e); }
});
router.get('/:identifier', async (req, res, next) => {
  try {
    const { identifier } = req.params;
    const blog = mongoose.isValidObjectId(identifier)
      ? await Blog.findOne({ $or: [{ slug: identifier }, { _id: identifier }] }).lean()
      : await Blog.findOne({ slug: identifier }).lean();
    if (!blog) return res.status(404).json({ success: false, error: 'Article not found.' });
    res.json({ success: true, blog });
  } catch (e) { next(e); }
});
router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const { title, content } = req.body;
    if (!title?.trim() || !content?.trim()) return res.status(400).json({ success: false, error: 'Title and content are required.' });
    const slug = String(req.body.slug || title).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const blog = await Blog.create({ ...req.body, slug, excerpt: req.body.excerpt || `${content.slice(0, 160)}...` });
    res.status(201).json({ success: true, id: blog.id, slug: blog.slug });
  } catch (e) { next(e); }
});
module.exports = router;
