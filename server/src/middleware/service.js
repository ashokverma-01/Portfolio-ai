const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { rateLimit } = require('express-rate-limit');
const { errorResponse } = require('../utils/responseHandler');

function createServiceApp() {
  const app = express();
  const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',').map((origin) => origin.trim());

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: allowedOrigins, methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'] }));
  app.use(express.json({ limit: '7mb' }));
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: 'draft-7', legacyHeaders: false }));
  app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
  });
  return app;
}

function attachErrorHandler(app) {
  app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);
    if (err instanceof SyntaxError && 'body' in err) {
      return errorResponse(res, 'Request body must contain valid JSON.', 400);
    }
    if (err.name === 'MulterError') {
      const message = err.code === 'LIMIT_FILE_SIZE' ? 'Image must be 5 MB or smaller.' : 'Image upload could not be processed.';
      return errorResponse(res, message, 400);
    }
    const status = err.status || err.statusCode || 500;
    const message = status >= 500 ? 'Service request failed.' : err.message;
    if (status >= 500) console.error(`[${req.method} ${req.originalUrl}] ${err.message}`);
    return errorResponse(res, message, status);
  });
}

function startService(app, serviceName, defaultPort) {
  const port = Number(process.env[`${serviceName.toUpperCase()}_SERVICE_PORT`]) || defaultPort;
  const server = app.listen(port, '0.0.0.0', () => console.log(`[${serviceName}] listening on ${port}`));
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') console.error(`[${serviceName}] port ${port} is already in use. Stop its existing process or set ${serviceName.toUpperCase()}_SERVICE_PORT in .env.`);
    else console.error(`[${serviceName}] failed to listen: ${error.message}`);
    process.exit(1);
  });
  const shutdown = async () => {
    server.close();
    const mongoose = require('mongoose');
    await mongoose.disconnect();
    process.exit(0);
  };
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
  return server;
}

module.exports = { createServiceApp, attachErrorHandler, startService };
