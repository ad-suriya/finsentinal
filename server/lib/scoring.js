const HIGH_VALUE_THRESHOLD = 10000;
const GAMBLING_MCC = '7995';
const UNKNOWN_MERCHANT = 'Unknown Vendor';
const BLOCK_ABOVE = 80;
const REVIEW_ABOVE = 50;

function statusForScore(score) {
  if (score > BLOCK_ABOVE) return 'BLOCKED';
  if (score > REVIEW_ABOVE) return 'REVIEW';
  return 'APPROVE';
}

// Same input always gives the same score, and every point is explained in `reasons`.
function scoreTransaction({ amount, mcc, merchantId }) {
  const amountPoints = Math.min(10, Math.floor(amount / 1000));
  let score = amountPoints;
  const rules = [];
  const reasons = [];

  if (amountPoints > 0) {
    reasons.push(`Amount of ₹${amount} adds ${amountPoints} baseline points.`);
  }
  if (amount > HIGH_VALUE_THRESHOLD) {
    score += 40;
    rules.push('HIGH_VALUE');
    reasons.push(`Amount exceeds the ₹${HIGH_VALUE_THRESHOLD} high-value threshold (+40).`);
  }
  if (mcc === GAMBLING_MCC) {
    score += 50;
    rules.push('HIGH_RISK_MCC');
    reasons.push(`Merchant category ${GAMBLING_MCC} (gambling) is high risk (+50).`);
  }
  if (merchantId === UNKNOWN_MERCHANT) {
    score += 20;
    rules.push('UNKNOWN_MERCHANT');
    reasons.push('Merchant is not recognised (+20).');
  }

  score = Math.min(100, score);
  if (reasons.length === 0) reasons.push('No risk rules triggered.');

  return {
    score,
    status: statusForScore(score),
    scenario: 'LOCAL_HEURISTICS',
    summary: 'Scored by local rules',
    rules,
    reasons,
  };
}

module.exports = { scoreTransaction, statusForScore };
