require('../../../server/src/config/loadEnv');
const connectDB = require('../../../server/src/config/db');
const { createServiceApp, attachErrorHandler, startService } = require('../../../server/src/middleware/service');
const app = createServiceApp();
app.get('/health', (req, res) => res.json({ success: true, service: 'contact' }));
app.use('/contact', require('./routes/contact'));
attachErrorHandler(app);
connectDB('contact').then(() => startService(app, 'contact', 5002))
  .catch((e) => { console.error(`[contact] startup failed: ${e.message}`); process.exit(1); });
