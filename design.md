# DESIGN (short)

Maqsad:
- Non-custodial LN payments demo: invoice create, pay with routing retries, channel simulate.
- Secure: AES-GCM se memos/keys encrypt.
- Reliable: retries, timeouts, concurrency limit (10), metrics.

Architecture:
- Express HTTP -> Lightspark Integrator -> Lightspark client (adapter) -> Channel Manager
- Metrics: Prometheus; Logging: pino.

Error handling:
- Invalid input -> 400.
- Transient errors -> retry 3x (exp backoff).
- Timeout (30s) -> abort and release liquidity.
- Persistent failure -> mark failure, release funds, optional force-close handling.

Trade-offs:
- Lightspark SDK = less ops, faster dev; LND/raw = more control, harder ops.
- Using symmetric AEAD (AES-GCM) for simplicity; real-world might use per-session keys / Noise for peer ops.

Scaling notes:
- Persist state (Postgres/Redis) for idempotency and crash recovery.
- Separate channel-manager service with dedicated nodes.
- Horizontal workers + job queue (Kafka/RabbitMQ) for high throughput.
