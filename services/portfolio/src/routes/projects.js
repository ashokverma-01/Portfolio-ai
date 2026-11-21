const express = require('express');
const mongoose = require('mongoose');
const Project = require('../models/Project');
const requireAdmin = require('../../../../server/src/middleware/adminAuth');
const router = express.Router();
router.get('/', async (req, res, next) => {
  try {
    const filter = req.query.category && req.query.category !== 'all' ? { category: req.query.category } : {};
    const projects = await Project.find(filter).sort({ sort_order: 1, created_at: -1 }).lean();
    res.json({ success: true, count: projects.length, projects });
  } catch (e) { next(e); }
});
router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const { name, summary } = req.body;
    if (!name?.trim() || !summary?.trim()) return res.status(400).json({ success: false, error: 'Name and summary are required.' });
    const project = await Project.create({ ...req.body, name: name.trim(), summary: summary.trim() });
    res.status(201).json({ success: true, project, id: project.id });
  } catch (e) { next(e); }
});
router.put('/:id', requireAdmin, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, error: 'Invalid project ID.' });
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!project) return res.status(404).json({ success: false, error: 'Project not found.' });
    res.json({ success: true, project });
  } catch (e) { next(e); }
});
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, error: 'Invalid project ID.' });
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ success: false, error: 'Project not found.' });
    res.json({ success: true, message: 'Project deleted.' });
  } catch (e) { next(e); }
});
module.exports = router;
