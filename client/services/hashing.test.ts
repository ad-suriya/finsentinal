import test from 'node:test';
import assert from 'node:assert/strict';
import { sha256Hex } from './hashing.ts';

test('matches the published SHA-256 test vector', async () => {
  assert.equal(await sha256Hex('abc'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
});

test('pads every byte to two hex characters', async () => {
  assert.match(await sha256Hex('user_akash@email.com'), /^[a-f0-9]{64}$/);
});

test('hashes UTF-8 input consistently', async () => {
  assert.equal(await sha256Hex('₹'), await sha256Hex('₹'));
  assert.notEqual(await sha256Hex('₹'), await sha256Hex('Rs'));
});
