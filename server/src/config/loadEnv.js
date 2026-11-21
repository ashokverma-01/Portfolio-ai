const path = require('node:path');
const dotenv = require('dotenv');

// Prefer the project-level .env. Keep compatibility with the existing server/.env.
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

module.exports = {};
