const { createHash } = require('crypto');

function sha256Hex(input) {
  return createHash('sha256').update(input, 'utf8').digest('hex');
}

module.exports = { sha256Hex };
