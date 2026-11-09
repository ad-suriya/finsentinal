const ONE_HOUR_MS = 60 * 60 * 1000;

// In-memory exchange of hashed risk signals. It never receives raw identifiers.
function createSignalStore({ windowMs = ONE_HOUR_MS, maxSignals = 5000, now = Date.now } = {}) {
  let signals = [];

  function prune() {
    const cutoff = now() - windowMs;
    signals = signals.filter((signal) => signal.receivedAt >= cutoff).slice(-maxSignals);
  }

  function correlate(hashedUserId) {
    const matches = signals.filter((signal) => signal.hashedUserId === hashedUserId);
    const banks = [...new Set(matches.map((signal) => signal.bankId))];
    const elevated = matches.some((signal) => signal.status !== 'APPROVE');
    const crossEntityRisk = banks.length >= 2 && elevated;
    const maxScore = Math.max(0, ...matches.map((signal) => signal.score));
    const aggregateScore = crossEntityRisk
      ? Math.min(100, maxScore + 10 * (banks.length - 1))
      : maxScore;

    return {
      hashedUserId,
      banks,
      signalCount: matches.length,
      maxScore,
      aggregateScore,
      crossEntityRisk,
      reason: crossEntityRisk
        ? `Same hashed identity seen at ${banks.length} banks with an elevated signal in the current window.`
        : 'No cross-bank risk pattern in the current window.',
    };
  }

  function record({ bankId, hashedUserId, score, status }) {
    prune();
    signals.push({ bankId, hashedUserId, score, status, receivedAt: now() });
    return correlate(hashedUserId);
  }

  function listCorrelated() {
    prune();
    return [...new Set(signals.map((signal) => signal.hashedUserId))]
      .map(correlate)
      .filter((entry) => entry.crossEntityRisk)
      .sort((a, b) => b.aggregateScore - a.aggregateScore);
  }

  return { record, correlate, listCorrelated };
}

module.exports = { createSignalStore };
