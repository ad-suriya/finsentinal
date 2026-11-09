const test = require('node:test');
const assert = require('node:assert/strict');
const { createSignalStore } = require('../lib/signals');

const hash = 'a'.repeat(64);
const signal = (bankId, score, status) => ({ bankId, hashedUserId: hash, score, status });

test('one bank alone is never a cross-bank match', () => {
  const store = createSignalStore();
  const result = store.record(signal('bank_a', 90, 'BLOCKED'));
  assert.equal(result.crossEntityRisk, false);
  assert.equal(result.aggregateScore, 90);
});

test('two banks with no elevated signal are not flagged', () => {
  const store = createSignalStore();
  store.record(signal('bank_a', 10, 'APPROVE'));
  assert.equal(store.record(signal('bank_b', 10, 'APPROVE')).crossEntityRisk, false);
});

test('two banks with an elevated signal raise the aggregate score', () => {
  const store = createSignalStore();
  store.record(signal('bank_a', 60, 'REVIEW'));
  const result = store.record(signal('bank_b', 10, 'APPROVE'));
  assert.equal(result.crossEntityRisk, true);
  assert.equal(result.aggregateScore, 70);
  assert.deepEqual(store.listCorrelated().map((entry) => entry.hashedUserId), [hash]);
});

test('signals outside the window are forgotten', () => {
  let time = 0;
  const store = createSignalStore({ windowMs: 100, now: () => time });
  store.record(signal('bank_a', 60, 'REVIEW'));
  time = 101;
  assert.equal(store.record(signal('bank_b', 10, 'APPROVE')).crossEntityRisk, false);
});
