require('./config/loadEnv');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const serviceTargets = {
  portfolio: process.env.PORTFOLIO_SERVICE_URL || `http://127.0.0.1:${process.env.PORTFOLIO_SERVICE_PORT || 5001}`,
  contact: process.env.CONTACT_SERVICE_URL || `http://127.0.0.1:${process.env.CONTACT_SERVICE_PORT || 5002}`,
  media: process.env.MEDIA_SERVICE_URL || `http://127.0.0.1:${process.env.MEDIA_SERVICE_PORT || 5003}`
};

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((value) => value.trim()) }));
app.get('/api/health', async (req, res) => {
  const checks = await Promise.all(Object.entries(serviceTargets).map(async ([name, target]) => {
    try {
      const response = await fetch(`${target}/health`, { signal: AbortSignal.timeout(2500) });
      return [name, response.ok ? 'online' : 'degraded'];
    } catch {
      return [name, 'offline'];
    }
  }));
  const services = Object.fromEntries(checks);
  const healthy = Object.values(services).every((status) => status === 'online');
  res.status(healthy ? 200 : 503).json({ success: healthy, service: 'portfolio-api-gateway', services, timestamp: new Date().toISOString() });
});

app.use('/api', createProxyMiddleware({
  router: (req) => {
    const path = req.originalUrl || req.url;
    if (path.startsWith('/api/contact')) return serviceTargets.contact;
    if (path.startsWith('/api/upload')) return serviceTargets.media;
    return serviceTargets.portfolio;
  },
  pathRewrite: (_path, req) => (req.originalUrl || req.url).replace(/^\/api/, ''),
  changeOrigin: true,
  proxyTimeout: 15000,
  timeout: 15000,
  on: {
    error: (error, req, res) => {
      console.error(`[gateway] ${req.method} ${req.url}: ${error.message}`);
      if (!res.headersSent) res.status(503).json({ success: false, error: 'Requested service is unavailable.' });
    }
  }
}));

app.use((req, res) => res.status(404).json({ success: false, error: 'Route not found.' }));

const port = Number(process.env.GATEWAY_PORT) || 3000;
const server = app.listen(port, '0.0.0.0', () => console.log(`[gateway] listening on ${port}`));
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') console.error(`[gateway] port ${port} is already in use. Stop its existing process or set GATEWAY_PORT in .env.`);
  else console.error(`[gateway] failed to listen: ${error.message}`);
  process.exit(1);
});
