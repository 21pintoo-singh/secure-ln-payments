# Lightspark LN Integrator — Node.js + Express (Demo)

Goal:
Non-custodial Lightning demo (invoice, pay, channel simulate) — simple aur runnable.

Quick start:
1. Install deps
   npm ci

2. Run locally
   npm run start
   (server port 3000)

Endpoints:
- POST /invoice
  Body: { "amount":100000, "memo":"demo" }
  Returns: { invoice, id, encryptedMemo }

- POST /pay
  Body: { "invoice":"<bolt11>", "induce_failure": true }
  Returns: { id, status, latency_ms }

- GET /metrics
  Prometheus metrics (latency, success/fail counters)

Notes:
- AEAD used for memos (AES-GCM).
- Channel liquidity simulated (1,000,000 sats).
- Retry: exponential backoff 3 attempts for transient errors.
- Rate limit and 30s timeouts added.

How to demo (100k sats + induced failure):
1) Create invoice:
   curl -s -X POST http://localhost:3000/invoice \
     -H "Content-Type: application/json" \
     -d '{"amount":100000,"memo":"demo"}'

2) Pay with induced failure:
   curl -s -X POST http://localhost:3000/pay \
     -H "Content-Type: application/json" \
     -d '{"invoice":"<invoice>","induce_failure":true}'

Replace mock client with real Lightspark SDK by swapping `src/lightspark_client_mock.js`.
