const cloudinary = require('cloudinary').v2;
function getCloudinary() {
  let fromUrl = {};
  if (process.env.CLOUDINARY_URL) {
    try {
      const parsed = new URL(process.env.CLOUDINARY_URL);
      if (parsed.protocol === 'cloudinary:') fromUrl = { cloud_name: parsed.hostname, api_key: decodeURIComponent(parsed.username), api_secret: decodeURIComponent(parsed.password) };
    } catch { /* handled by missing-credential response below */ }
  }
  const config = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || fromUrl.cloud_name,
    api_key: process.env.CLOUDINARY_API_KEY || fromUrl.api_key,
    api_secret: process.env.CLOUDINARY_API_SECRET || fromUrl.api_secret,
    secure: true
  };
  if (!config.cloud_name || !config.api_key || !config.api_secret) return null;
  cloudinary.config(config);
  return cloudinary;
}
module.exports = getCloudinary;
