const express = require('express');
const Stat = require('../models/Stat');
const requireAdmin = require('../../../../server/src/middleware/adminAuth');
const router = express.Router();
router.get('/', async (req, res, next) => {
  try { const rows = await Stat.find().lean(); res.json({ success: true, stats: Object.fromEntries(rows.map((row) => [row.key, row.value])) }); }
  catch (e) { next(e); }
});
async function update(req, res, next) {
  try {
    const entries = Object.entries(req.body || {});
    if (!entries.length) return res.status(400).json({ success: false, error: 'At least one stat is required.' });
    await Stat.bulkWrite(entries.map(([key, value]) => ({ updateOne: { filter: { key }, update: { $set: { value: String(value) } }, upsert: true } })));
    res.json({ success: true, message: 'Stats updated.' });
  } catch (e) { next(e); }
}
router.put('/', requireAdmin, update);
router.post('/', requireAdmin, update);
module.exports = router;
