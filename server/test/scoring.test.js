const test = require('node:test');
const assert = require('node:assert/strict');
const { scoreTransaction, statusForScore } = require('../lib/scoring');

const base = { amount: 500, mcc: '5411', merchantId: 'Flipkart' };

test('same input always gives the same result', () => {
  const input = { amount: 12000, mcc: '7995', merchantId: 'Zomato' };
  assert.deepEqual(scoreTransaction(input), scoreTransaction(input));
});

test('a small ordinary payment is approved with no rules', () => {
  const result = scoreTransaction(base);
  assert.equal(result.score, 0);
  assert.equal(result.status, 'APPROVE');
  assert.deepEqual(result.rules, []);
  assert.deepEqual(result.reasons, ['No risk rules triggered.']);
});

test('a gambling merchant alone is sent to review', () => {
  const result = scoreTransaction({ ...base, amount: 2000, mcc: '7995' });
  assert.equal(result.score, 52);
  assert.equal(result.status, 'REVIEW');
  assert.deepEqual(result.rules, ['HIGH_RISK_MCC']);
});

test('a high-value gambling payment is blocked and capped at 100', () => {
  const result = scoreTransaction({ ...base, amount: 50000, mcc: '7995', merchantId: 'Unknown Vendor' });
  assert.equal(result.score, 100);
  assert.equal(result.status, 'BLOCKED');
  assert.deepEqual(result.rules, ['HIGH_VALUE', 'HIGH_RISK_MCC', 'UNKNOWN_MERCHANT']);
});

test('the high-value threshold is exclusive', () => {
  assert.deepEqual(scoreTransaction({ ...base, amount: 10000 }).rules, []);
  assert.deepEqual(scoreTransaction({ ...base, amount: 10001 }).rules, ['HIGH_VALUE']);
});

test('status boundaries match the thresholds', () => {
  assert.equal(statusForScore(50), 'APPROVE');
  assert.equal(statusForScore(51), 'REVIEW');
  assert.equal(statusForScore(80), 'REVIEW');
  assert.equal(statusForScore(81), 'BLOCKED');
});
