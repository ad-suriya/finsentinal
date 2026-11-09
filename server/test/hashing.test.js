const test = require('node:test');
const assert = require('node:assert/strict');
const { sha256Hex } = require('../lib/hashing');

test('matches the published SHA-256 test vector', () => {
  assert.equal(sha256Hex('abc'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
});

test('hashes UTF-8 input consistently', () => {
  assert.equal(sha256Hex('₹'), sha256Hex('₹'));
  assert.notEqual(sha256Hex('₹'), sha256Hex('Rs'));
});
