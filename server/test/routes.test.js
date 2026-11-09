const test = require('node:test');
const assert = require('node:assert/strict');

// Set before loading the app, so a local server/.env cannot trigger real API calls.
process.env.GEMINI_API_KEY = '';
process.env.FRAUDLABS_API_KEY = '';
process.env.ALLOWED_ORIGINS = 'http://allowed.test';

const { app } = require('../server');

let server;
let base;

test.before(async () => {
  await new Promise((resolve) => { server = app.listen(0, resolve); });
  base = `http://127.0.0.1:${server.address().port}`;
});

test.after(() => server.close());

const post = (path, body, headers = {}) =>
  fetch(`${base}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });

const screening = { amount: 12000, mcc: '7995', merchantId: 'Zomato', city: 'Pune', email: 'a@b.test', ip: '1.2.3.4' };
const transaction = {
  id: 'tx_1', hashId: 'abc123', amount: 100, status: 'APPROVED', score: 0.1,
  entity: 'Bank A', scenario: 'NORMAL_PATTERN', timestamp: '2026-01-01T00:00:00.000Z',
};

test('rejects a disallowed origin', async () => {
  const response = await post('/v1/risk/score', screening, { origin: 'http://evil.test' });
  assert.equal(response.status, 403);
});

test('allows a configured origin', async () => {
  const response = await post('/v1/risk/score', screening, { origin: 'http://allowed.test' });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('access-control-allow-origin'), 'http://allowed.test');
});

test('screening falls back to local rules without a FraudLabs key', async () => {
  const { data } = await (await post('/v1/fraud/screen', screening)).json();
  assert.equal(data.scenario, 'LOCAL_HEURISTICS');
  assert.equal(data.status, 'BLOCKED');
});

test('rejects a malformed signal', async () => {
  const response = await post('/v1/signals', { bankId: 'bank_a', hashedUserId: 'not-a-hash', score: 1, status: 'APPROVE' });
  assert.equal(response.status, 400);
});

test('AI routes validate before checking configuration', async () => {
  assert.equal((await post('/v1/ai/chat', { message: 'x'.repeat(2001) })).status, 400);
  assert.equal((await post('/v1/ai/briefing', { transactions: [{ ...transaction, status: 'NOPE' }] })).status, 400);
});

test('AI routes return 503 when no key is configured', async () => {
  const response = await post('/v1/ai/analyze/tx_1', { transaction });
  assert.equal(response.status, 503);
});

test('AI routes are rate limited', async () => {
  const statuses = [];
  for (let i = 0; i < 25; i++) {
    statuses.push((await post('/v1/ai/chat', { message: '' })).status);
  }
  assert.ok(statuses.includes(429));
});
