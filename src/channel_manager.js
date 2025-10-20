/*
  Manages simulated LN channels & liquidity.
  Responsibilities:
  - Tracks total available liquidity
  - Opens channels if minimum capacity not met
  - Allocates & releases liquidity for payments
  - Simulates force-close events
  - Logs all actions for observability
*/

import logger from './logger.js';
import LightsparkClientMock from './lightspark_client_mock.js';

export default class ChannelManager {
  constructor(client) {
    this.client = client;
    this.channels = new Map();
    this.totalLiquidity = 1_000_000; // 1M sats simulated
  }

  async ensureCapacity(minSats = 10000) {
    if (this.totalLiquidity < minSats) {
      logger.info('not enough liquidity — opening channel');
      const ch = await this.client.openChannel({ capacitySats: Math.max(minSats, 100000) });
      this.channels.set(ch.channelId, ch);
      this.totalLiquidity += ch.capacitySats;
    }
    return true;
  }

  async allocate(amountSats) {
    if (amountSats > this.totalLiquidity) throw new Error('insufficient_liquidity');
    this.totalLiquidity -= amountSats;
    logger.info({ event: 'allocate', amountSats, remaining: this.totalLiquidity });
    return true;
  }

  async release(amountSats) {
    this.totalLiquidity += amountSats;
    logger.info({ event: 'release', amountSats, total: this.totalLiquidity });
  }

  async forceClose(channelId) {
    logger.warn({ event: 'force_close', channelId });
    await this.client.closeChannel({ channelId, force: true });
    // fallback handling...
  }
}
