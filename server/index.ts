import express from 'express';
import { config } from './config.js';
import { railwayRouter } from './railway.js';
import { shopRouter } from './shop.js';
import { authRouter } from './auth.js';
import { requestsRouter } from './trainRequests.js';
import path from 'node:path';
import fs from 'node:fs';

const app = express();

app.use(express.json());

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path.startsWith('/api')) {
      console.log(`[server] ${req.method} ${req.path} ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// API Routes
app.use('/api/railway', railwayRouter);
app.use('/api', shopRouter);
app.use('/api', authRouter);
app.use('/auth', authRouter);
app.use('/api', requestsRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    railkitConfigured: Boolean(config.railkitApiKey),
    supabaseConfigured: Boolean(config.supabaseUrl && config.supabaseServiceRoleKey),
    adminConfigured: Boolean(config.adminApiKey),
    deliveryStations: config.deliveryStations,
    timestamp: new Date().toISOString(),
  });
});

// Serve frontend dist in production if built
const distPath = path.join(config.root, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(config.port, '0.0.0.0', () => {
  console.log(`[server] RailQuick API server running on http://localhost:${config.port}`);
  console.log(`[server] RailKit configured: ${Boolean(config.railkitApiKey)}`);
  console.log(`[server] Delivery stations: ${config.deliveryStations.join(', ')}`);
});
