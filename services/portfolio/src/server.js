require('../../../server/src/config/loadEnv');
const connectDB = require('../../../server/src/config/db');
const { createServiceApp, attachErrorHandler, startService } = require('../../../server/src/middleware/service');
const app = createServiceApp();
app.get('/health', (req, res) => res.json({ success: true, service: 'portfolio' }));
app.use('/projects', require('./routes/projects'));
app.use('/blogs', require('./routes/blogs'));
app.use('/stats', require('./routes/stats'));
attachErrorHandler(app);
connectDB('portfolio').then(() => startService(app, 'portfolio', 5001))
  .catch((e) => { console.error(`[portfolio] startup failed: ${e.message}`); process.exit(1); });
