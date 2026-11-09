const SHORT_ID = /^[\w-]{1,128}$/;
const SCENARIO = /^[\w .:-]{1,64}$/;
const SHA256_HEX = /^[a-f0-9]{64}$/;
const MCC = /^\d{4}$/;
const IPV4 = /^(\d{1,3}\.){3}\d{1,3}$/;
const MAX_AMOUNT = 1_000_000_000;
const MAX_BRIEFING_TRANSACTIONS = 15;
const MAX_CHAT_CONTEXT = 5;
const MAX_CHAT_HISTORY = 20;
const MAX_MESSAGE_LENGTH = 2000;

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const isAmount = (value) => Number.isFinite(value) && value > 0 && value <= MAX_AMOUNT;
const isScore = (value, max) => Number.isFinite(value) && value >= 0 && value <= max;
const isText = (value, max) => typeof value === 'string' && value.length > 0 && value.length <= max;

const ok = (value) => ({ value });
const fail = (error) => ({ error });

// Returns only known fields, so nothing unexpected can reach a prompt.
function parseTransaction(tx) {
  if (!isObject(tx)) return null;
  const valid =
    SHORT_ID.test(String(tx.id)) &&
    SHORT_ID.test(String(tx.hashId)) &&
    Number.isFinite(tx.amount) && tx.amount >= 0 && tx.amount <= MAX_AMOUNT &&
    ['APPROVED', 'FLAGGED', 'BLOCKED'].includes(tx.status) &&
    isScore(tx.score, 1) &&
    ['Bank A', 'Bank B'].includes(tx.entity) &&
    SCENARIO.test(String(tx.scenario)) &&
    typeof tx.timestamp === 'string' && !Number.isNaN(Date.parse(tx.timestamp));
  if (!valid) return null;

  const { id, hashId, amount, status, score, entity, scenario, timestamp } = tx;
  return { id, hashId, amount, status, score, entity, scenario, timestamp };
}

function parseTransactions(list, max) {
  if (!Array.isArray(list) || list.length > max) return null;
  const parsed = list.map(parseTransaction);
  return parsed.every(Boolean) ? parsed : null;
}

function validateBriefing(body) {
  const transactions = parseTransactions(body?.transactions, MAX_BRIEFING_TRANSACTIONS);
  if (!transactions || transactions.length === 0) {
    return fail(`transactions must be an array of 1 to ${MAX_BRIEFING_TRANSACTIONS} valid transactions`);
  }
  return ok({ transactions });
}

function validateAnalysis(body, id) {
  const transaction = parseTransaction(body?.transaction);
  if (!transaction || transaction.id !== id) return fail('transaction is invalid or does not match the URL id');
  return ok({ transaction });
}

function validateChat(body) {
  if (!isText(body?.message, MAX_MESSAGE_LENGTH)) return fail('message is required, up to 2000 characters');

  const context = parseTransactions(body.context ?? [], MAX_CHAT_CONTEXT);
  if (!context) return fail(`context must be up to ${MAX_CHAT_CONTEXT} valid transactions`);

  const history = body.history ?? [];
  const historyValid =
    Array.isArray(history) &&
    history.length <= MAX_CHAT_HISTORY &&
    history.every((m) => isObject(m) && ['user', 'ai'].includes(m.role) && isText(m.text, MAX_MESSAGE_LENGTH));
  if (!historyValid) return fail(`history must be up to ${MAX_CHAT_HISTORY} valid messages`);

  return ok({ message: body.message, context, history: history.map(({ role, text }) => ({ role, text })) });
}

function validateRiskInput(body) {
  if (!isObject(body) || !isAmount(body.amount)) return fail('amount must be a positive number');
  if (!MCC.test(String(body.mcc))) return fail('mcc must be 4 digits');
  if (!isText(body.merchantId, 64)) return fail('merchantId is required, up to 64 characters');
  return ok({ amount: body.amount, mcc: String(body.mcc), merchantId: body.merchantId });
}

function validateScreening(body) {
  const risk = validateRiskInput(body);
  if (risk.error) return risk;
  if (!isText(body.city, 64)) return fail('city is required, up to 64 characters');
  if (!isText(body.email, 128)) return fail('email is required, up to 128 characters');
  const ipValid = IPV4.test(String(body.ip)) && String(body.ip).split('.').every((part) => Number(part) <= 255);
  if (!ipValid) return fail('ip must be an IPv4 address');
  return ok({ ...risk.value, city: body.city, email: body.email, ip: body.ip });
}

function validateSignal(body) {
  if (!isObject(body)) return fail('body must be an object');
  if (!['bank_a', 'bank_b'].includes(body.bankId)) return fail('bankId must be bank_a or bank_b');
  if (!SHA256_HEX.test(String(body.hashedUserId))) return fail('hashedUserId must be a SHA-256 hex digest');
  if (!isScore(body.score, 100)) return fail('score must be between 0 and 100');
  if (!['APPROVE', 'REVIEW', 'BLOCKED'].includes(body.status)) return fail('status is invalid');
  const { bankId, hashedUserId, score, status } = body;
  return ok({ bankId, hashedUserId, score, status });
}

module.exports = {
  MAX_MESSAGE_LENGTH,
  validateAnalysis,
  validateBriefing,
  validateChat,
  validateRiskInput,
  validateScreening,
  validateSignal,
};
