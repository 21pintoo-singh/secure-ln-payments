import client from 'prom-client';

export const paymentSuccess = new client.Counter({
  name: 'ln_payment_success_total',
  help: 'Total successful payments',
});

export const paymentFailure = new client.Counter({
  name: 'ln_payment_failure_total',
  help: 'Total failed payments',
});

export const paymentLatency = new client.Histogram({
  name: 'ln_payment_latency_seconds',
  help: 'Payment latency seconds',
  buckets: [0.1, 0.5, 1, 1.5, 2, 5],
});

export { client };
