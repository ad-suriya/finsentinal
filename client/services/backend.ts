const API_BASE: string = import.meta.env.VITE_API_BASE_URL ?? '';

export const postJson = async <T>(path: string, body: unknown): Promise<T> => {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`${path} failed with status ${response.status}`);
  }
  return response.json();
};

export interface RiskResult {
  score: number;
  status: 'APPROVE' | 'REVIEW' | 'BLOCKED';
  scenario: string;
  summary: string;
  rules: string[];
  reasons: string[];
}

export interface SignalCorrelation {
  banks: string[];
  signalCount: number;
  maxScore: number;
  aggregateScore: number;
  crossEntityRisk: boolean;
  reason: string;
}

export const scoreRisk = async (input: { amount: number; mcc: string; merchantId: string }) =>
  (await postJson<{ data: RiskResult }>('/v1/risk/score', input)).data;

export const screenFraud = async (input: {
  amount: number; mcc: string; merchantId: string; city: string; email: string; ip: string;
}) => (await postJson<{ data: RiskResult }>('/v1/fraud/screen', input)).data;

export const reportSignal = async (input: {
  bankId: string; hashedUserId: string; score: number; status: RiskResult['status'];
}) => (await postJson<{ data: SignalCorrelation }>('/v1/signals', input)).data;
