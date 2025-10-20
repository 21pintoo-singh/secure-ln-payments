/*
  Main Express server file.
  Responsibilities:
  - Sets up HTTP server with security (helmet), body parsing (body-parser), and rate limiting (express-rate-limit)
  - Exposes 3 endpoints:
      POST /invoice → Create a Lightning invoice
      POST /pay → Pay a given invoice with retries and optional induced failure
      GET /metrics → Expose Prometheus metrics for success/failure/latency
  - Handles graceful shutdown on SIGINT/SIGTERM
  - Uses LightsparkIntegrator class for actual payment/invoice logic
*/

import express from 'express';
import rateLimit from 'express-rate-limit';
import bodyParser from 'body-parser';
const { json } = bodyParser;
import helmet from 'helmet';
import LightsparkIntegrator from './lightspark_integrator.js';
import { error as _error, info } from './logger.js';
import { client } from './metrics.js';

const app = express();
app.use(helmet());
app.use(json({ limit: '10kb' }));

const limiter = rateLimit({ windowMs: 1000, max: 10 }); // 10 req/sec per IP
app.use(limiter);

const integrator = new LightsparkIntegrator({});

app.post('/invoice', async (req, res) => {
  try {
    const { amount, memo } = req.body;
    const invoice = await integrator.createInvoice({ amount, memo });
    res.json(invoice);
  } catch (err) {
    _error({ err: err.message || err });
    res.status(err.statusCode || 500).json({ error: err.message || 'internal_error' });
  }
});

app.post('/pay', async (req, res) => {
  try {
    const { invoice, timeoutMs = 30000, induce_failure = false } = req.body;
    const result = await integrator.payInvoice({ invoice, timeoutMs, induceFailure: !!induce_failure });
    res.json(result);
  } catch (err) {
    _error({ err: err.message || err });
    const status = err.statusCode || 500;
    res.status(status).json({ error: err.message || 'payment_failed' });
  }
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

const port = process.env.PORT || 3000;
const server = app.listen(port, () => info({ event: 'server_start', port }));

// graceful shutdown
process.on('SIGINT', async () => {
  info('SIGINT received — shutting down');
  server.close(() => process.exit(0));
});
process.on('SIGTERM', async () => {
  info('SIGTERM received — shutting down');
  server.close(() => process.exit(0));
});
