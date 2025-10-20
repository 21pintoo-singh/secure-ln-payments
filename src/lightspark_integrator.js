import { decode } from 'bolt11';
import LightsparkClientMock from './lightspark_client_mock.js';
import { generateKey, aeadEncrypt, aeadDecrypt } from './crypto_aead.js';
import { withRetry } from './retry.js';
import { limit } from './semaphore.js';
import ChannelManager from './channel_manager.js';
import { info, error } from './logger.js';
import { paymentSuccess, paymentLatency, paymentFailure } from './metrics.js';
import { AbortController } from 'abort-controller';

class LightsparkIntegrator {
  constructor(opts = {}) {
    this.client = opts.client || new LightsparkClientMock({ simulateLatencyMs: 200 });
    this.key = opts.key || generateKey(); // AEAD key for memos/secret data
    this.channelManager = new ChannelManager(this.client);
  }

  // Build invoice request
  async createInvoice({ amount, memo }) {
    if (!Number.isInteger(amount) || amount <= 0) {
      const err = new Error('invalid_amount');
      err.statusCode = 400;
      throw err;
    }

    const encryptedMemo = aeadEncrypt(this.key, memo || '', `invoice-${Date.now()}`);

    const resp = await this.client.createInvoice({ amount, memo: encryptedMemo });

    return { invoice: resp.invoice, id: resp.id, encryptedMemo };
  }

  // Payment with retry/backoff; returns PaymentResult
  async payInvoice({ invoice, timeoutMs = 30000, induceFailure = false }) {
    if (!invoice || typeof invoice !== 'string' || !invoice.startsWith('ln')) {
      const err = new Error('invalid_invoice');
      err.statusCode = 400;
      throw err;
    }

    let decoded;
    try {
      decoded = decode(invoice);
    } catch (e) {
      decoded = null;
    }

    const sats = decoded && decoded.satoshis ? decoded.satoshis : 100_000;
    await this.channelManager.ensureCapacity(sats);
    await this.channelManager.allocate(sats);

    const doPay = limit(async () => {
      const start = Date.now();
      const controller = new AbortController();
      const timeouter = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const attemptFn = async (attempt) => {
          info({ event: 'attempt_pay', attempt, invoice });
          const pr = await this.client.payInvoice({ invoice, timeoutMs, induceFailure });
          return pr;
        };

        const result = await withRetry(attemptFn, { retries: 3, minTimeout: 200, factor: 2 });
        const latency = Date.now() - start;
        paymentSuccess.inc();
        paymentLatency.observe(latency / 1000);
        return { id: result.id, status: result.status, latency_ms: latency };
      } catch (err) {
        paymentFailure.inc();
        error({ event: 'payment_failed', err: err.message || err.toString() });
        throw err;
      } finally {
        clearTimeout(timeouter);
        await this.channelManager.release(sats);
      }
    });

    try {
      const res = await doPay();
      return res;
    } catch (err) {
      if (err.message && err.message.includes('force_close')) {
        await this.channelManager.forceClose('simulate-channel');
      }
      throw err;
    }
  }
}

export default LightsparkIntegrator;
