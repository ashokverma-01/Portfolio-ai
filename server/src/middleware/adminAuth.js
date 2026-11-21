const crypto = require('node:crypto');

function requireAdmin(req, res, next) {
  const expected = process.env.ADMIN_API_KEY;
  const supplied = req.get('x-admin-key') || '';
  if (!expected || expected === 'replace_with_a_long_random_value') {
    return res.status(503).json({ success: false, error: 'Set ADMIN_API_KEY in .env to enable admin actions.' });
  }
  const expectedBuffer = Buffer.from(expected);
  const suppliedBuffer = Buffer.from(supplied);
  if (expectedBuffer.length !== suppliedBuffer.length || !crypto.timingSafeEqual(expectedBuffer, suppliedBuffer)) {
    return res.status(401).json({ success: false, error: 'Admin key is missing or invalid.' });
  }
  return next();
}

module.exports = requireAdmin;
