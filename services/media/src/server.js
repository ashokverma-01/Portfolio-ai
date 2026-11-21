require('../../../server/src/config/loadEnv');
const { createServiceApp, attachErrorHandler, startService } = require('../../../server/src/middleware/service');
const app = createServiceApp();
app.get('/health', (req, res) => res.json({ success: true, service: 'media' }));
app.use('/upload', require('./routes/upload'));
attachErrorHandler(app);
startService(app, 'media', 5003);
