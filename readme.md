# Lightspark LN Integrator by P_SINGH — Node.js + Express (Demo)
# MAin Summary by PSINGH
Secure Lightning Network payment service using Node.js and Express, featuring invoice creation, retryable payments, AEAD-encrypted memos, simulated channel management, and Prometheus metrics for observability.

Summary with File :

server.js → HTTP entrypoint

lightspark_integrator.js → Core LN integration logic

lightspark_client_mock.js → Mock client for offline/testing

channel_manager.js → Simulated liquidity/channel handling

crypto_aead.js → Encryption & decryption

retry.js → Generic retry/backoff

semaphore.js → Limit concurrent operations

logger.js → Structured logging

metrics.js → Prometheus metrics counters

integration.test.js → Manual integration instructions

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

-------------Test APi Request & Response ------------------
curl --location 'http://localhost:3000/invoice' \
--header 'Content-Type: application/json' \
--data '{"amount":100000,"memo":"demo"}'

Response: 
{
    "invoice": "lnbc100000n1pd6d04982-9e7d-4f",
    "id": "d6d04982-9e7d-4f60-b759-f0d329ad1f24",
    "encryptedMemo": "ek1bAm7U8XCFdeSSTcr5/ZIggeYXz4T2DSJfLxF1rLo="
}

curl --location 'http://localhost:3000/pay' \
--header 'Content-Type: application/json' \
--data '{"invoice":"lnbc100000n1pd6d04982-9e7d-4f","induce_failure":true}'

Response:
{
    "id": "ad9765cc-8112-4fec-96e2-ed42a4a7bc50",
    "status": "SUCCEEDED",
    "latency_ms": 1221
}

curl --location 'http://localhost:3000/metrics'

Response:
# HELP ln_payment_success_total Total successful payments
# TYPE ln_payment_success_total counter
ln_payment_success_total 1

# HELP ln_payment_failure_total Total failed payments
# TYPE ln_payment_failure_total counter
ln_payment_failure_total 0

# HELP ln_payment_latency_seconds Payment latency seconds
# TYPE ln_payment_latency_seconds histogram
ln_payment_latency_seconds_bucket{le="0.1"} 0
ln_payment_latency_seconds_bucket{le="0.5"} 0
ln_payment_latency_seconds_bucket{le="1"} 0
ln_payment_latency_seconds_bucket{le="1.5"} 1
ln_payment_latency_seconds_bucket{le="2"} 1
ln_payment_latency_seconds_bucket{le="5"} 1
ln_payment_latency_seconds_bucket{le="+Inf"} 1
ln_payment_latency_seconds_sum 1.221
ln_payment_latency_seconds_count 1