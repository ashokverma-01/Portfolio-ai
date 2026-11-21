const express = require('express');
const crypto = require('node:crypto');
const mongoose = require('mongoose');
const Inquiry = require('../models/Inquiry');
const requireAdmin = require('../../../../server/src/middleware/adminAuth');
const router = express.Router();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
router.get('/', requireAdmin, async (req, res, next) => {
  try {
    const filter = req.query.status && req.query.status !== 'all' ? { status: req.query.status } : {};
    const inquiries = await Inquiry.find(filter).sort({ created_at: -1 }).lean();
    res.json({ success: true, count: inquiries.length, inquiries });
  } catch (e) { next(e); }
});
router.post('/', async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim(); const email = String(req.body.email || '').trim();
    if (!name || !email) return res.status(400).json({ success: false, error: 'Name and email are required fields.' });
    if (!emailPattern.test(email)) return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
    const refId = `REQ-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
    const inquiry = await Inquiry.create({
      ref_id: refId, name, email,
      scope: String(req.body.scope || 'WebGL & Frappe Architecture').trim(),
      budget: String(req.body.budget || 'Undisclosed').trim(),
      timeline: String(req.body.timeline || 'Immediate').trim(),
      details: String(req.body.details || '').trim(),
      ip: String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim()
    });
    res.status(201).json({ success: true, message: 'TRANSMISSION RECEIVED & LOGGED TO STUDIO SECURE LEDGER', ref_id: refId, inquiry_id: inquiry.id, timestamp: inquiry.created_at, sla: 'Guaranteed response within 24 hours' });
  } catch (e) { next(e); }
});
async function update(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, error: 'Invalid inquiry ID.' });
    if (!['unread', 'contacted', 'archived'].includes(req.body.status)) return res.status(400).json({ success: false, error: 'Invalid status.' });
    const row = await Inquiry.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
    if (!row) return res.status(404).json({ success: false, error: 'Inquiry not found.' });
    res.json({ success: true, message: `Inquiry status updated to ${row.status}.` });
  } catch (e) { next(e); }
}
router.patch('/:id', requireAdmin, update);
router.put('/:id', requireAdmin, update);
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, error: 'Invalid inquiry ID.' });
    const row = await Inquiry.findByIdAndDelete(req.params.id);
    if (!row) return res.status(404).json({ success: false, error: 'Inquiry not found.' });
    res.json({ success: true, message: 'Inquiry deleted.' });
  } catch (e) { next(e); }
});
module.exports = router;
