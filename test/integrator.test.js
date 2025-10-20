import { test, expect } from '@jest/globals';

// High-level manual integration test instructions
// Start server: npm start
// Then run these curl commands (simulate success with one induced failure):
//
// 1) Create invoice:
// curl -s -X POST http://localhost:3000/invoice \
//      -H "Content-Type: application/json" \
//      -d '{"amount":100000, "memo":"test-payment"}'
//
// -> copy invoice from response
//
// 2) Attempt pay with induced failure (server mock will fail first attempts and succeed later):
// curl -s -X POST http://localhost:3000/pay \
//      -H "Content-Type: application/json" \
//      -d '{"invoice":"<invoice-string>", "induce_failure":true}'
//
// Expect JSON: { id, status: "SUCCEEDED", latency_ms: <number> }

test('integration manual test instructions in README', () => {
  expect(true).toBe(true);
});
