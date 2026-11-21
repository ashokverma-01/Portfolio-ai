const express = require('express');
const multer = require('multer');
const getCloudinary = require('../cloudinary');
const requireAdmin = require('../../../../server/src/middleware/adminAuth');
const router = express.Router();
const types = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const upload = multer({
  storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => types.has(file.mimetype) ? cb(null, true) : cb(Object.assign(new Error('Use a JPG, PNG, WEBP, or GIF image.'), { status: 415 }))
});
router.post('/', requireAdmin, upload.single('image'), async (req, res, next) => {
  try {
    const cloudinary = getCloudinary();
    if (!cloudinary) return res.status(503).json({ success: false, error: 'Cloudinary is not configured.' });
    let buffer = req.file?.buffer; let format;
    if (!buffer && typeof req.body?.image === 'string') {
      const match = req.body.image.match(/^data:(image\/(?:jpeg|png|webp|gif));base64,([A-Za-z0-9+/=]+)$/);
      if (!match) return res.status(400).json({ success: false, error: 'A supported image is required.' });
      buffer = Buffer.from(match[2], 'base64'); format = match[1].split('/')[1].replace('jpeg', 'jpg');
    }
    if (!buffer?.length || buffer.length > 5 * 1024 * 1024) return res.status(400).json({ success: false, error: 'Image is required and must be at most 5 MB.' });
    const result = await new Promise((resolve, reject) => cloudinary.uploader.upload_stream({ folder: process.env.CLOUDINARY_FOLDER || 'studio_portfolio_uploads', resource_type: 'image', format }, (err, data) => err ? reject(err) : resolve(data)).end(buffer));
    res.json({ success: true, message: 'Portrait uploaded successfully.', url: result.secure_url, public_id: result.public_id });
  } catch (e) { next(e); }
});
module.exports = router;
