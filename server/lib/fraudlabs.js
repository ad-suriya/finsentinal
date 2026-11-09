const ENDPOINT = 'https://api.fraudlabspro.com/v1/order/screen';

// Returns a risk result, or null when the local rules should be used instead.
// Never log the request URL: it contains the API key.
async function screenWithFraudLabs({ amount, city, email, ip }, apiKey, fetchImpl = fetch) {
  if (!apiKey) return null;

  try {
    const params = new URLSearchParams({
      key: apiKey,
      format: 'json',
      email,
      ip,
      amount: String(amount),
      currency: 'INR',
      bill_city: city,
      bill_country: 'IN',
    });
    const response = await fetchImpl(`${ENDPOINT}?${params}`, { signal: AbortSignal.timeout(2000) });
    if (!response.ok) return null;

    const data = await response.json();
    const score = Number.parseInt(data.fraudlabspro_score, 10);
    // Errors such as a revoked key can arrive as HTTP 200 with no score.
    if (!Number.isFinite(score)) return null;

    const status =
      data.fraudlabspro_status === 'REJECT' ? 'BLOCKED'
      : data.fraudlabspro_status === 'REVIEW' ? 'REVIEW'
      : 'APPROVE';
    const summary = data.fraudlabspro_message || 'Verified by FraudLabs Pro';

    return { score, status, scenario: 'REAL_API_VERIFIED', summary, rules: [], reasons: [summary] };
  } catch {
    return null;
  }
}

module.exports = { screenWithFraudLabs };
