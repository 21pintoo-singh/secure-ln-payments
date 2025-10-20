/*
  Mock client to simulate Lightspark SDK behavior on testnet.
  Responsibilities:
  - createInvoice: Generate a fake BOLT-11 invoice string
  - payInvoice: Simulate payment with optional induced failures
  - openChannel / closeChannel: Simulate channel liquidity management
  - sleep(ms): Simulate network latency
  - Provides predictable responses for testing without real LN nodes
*/

import { v4 as uuidv4 } from 'uuid';
import logger from './logger.js';

// Simulated client for testnet flows.
// Methods: createInvoice, payInvoice, openChannel, closeChannel
export default class LightsparkClientMock {
  constructor(opts = {}) {
    this.nodeId = opts.nodeId || 'mock-node';
    this.simulateLatencyMs = opts.simulateLatencyMs || 200;
    this.failureMode = opts.failureMode || false;
  }

  async createInvoice({ amount, memo }) {
    await sleep(this.simulateLatencyMs);
    const id = uuidv4();
    const bolt11 = `lnbc${amount}n1p${id.slice(0,16)}`; // simplified placeholder
    logger.info({ event: 'createInvoice', amount, id });
    return { invoice: bolt11, id };
  }

  async payInvoice({ invoice, timeoutMs = 30000, induceFailure = false }) {
    await sleep(this.simulateLatencyMs);
    if (induceFailure && Math.random() < 0.7) {
      const err = new Error('Transient network error (simulated)');
      err.transient = true;
      throw err;
    }
    return { id: uuidv4(), status: 'SUCCEEDED', latencyMs: this.simulateLatencyMs };
  }

  async openChannel({ capacitySats }) {
    await sleep(this.simulateLatencyMs);
    const channelId = uuidv4();
    logger.info({ event: 'openChannel', channelId, capacitySats });
    return { channelId, capacitySats };
  }

  async closeChannel({ channelId, force = false }) {
    await sleep(this.simulateLatencyMs);
    logger.info({ event: 'closeChannel', channelId, force });
    return { channelId, closed: true, force };
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
