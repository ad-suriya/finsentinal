
import { Transaction } from './types';

export const INITIAL_MOCK_DATA: Transaction[] = [
  {
    id: "tx_101",
    hashId: "a3f92b8d",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    amount: 12500,
    score: 0.85,
    status: "BLOCKED",
    scenario: "HIGH_VALUE",
    explanation: "AI Explanation: Transaction exceeds historical average for this entity by 400%. Possible takeover.",
    entity: "Bank A"
  },
  {
    id: "tx_102",
    hashId: "9c2e1f4a",
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    amount: 450,
    score: 0.12,
    status: "APPROVED",
    scenario: "NORMAL_PATTERN",
    explanation: "Standard recurring payment detected. Low risk score.",
    entity: "Bank B"
  },
  {
    id: "tx_103",
    hashId: "b7d8c2e1",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    amount: 8900,
    score: 0.62,
    status: "FLAGGED",
    scenario: "VELOCITY_BURST",
    explanation: "AI Explanation: Multiple rapid transactions within 60 seconds from new IP location.",
    entity: "Bank A"
  },
  {
    id: "tx_104",
    hashId: "f4a9b2c8",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    amount: 2100,
    score: 0.05,
    status: "APPROVED",
    scenario: "NORMAL_PATTERN",
    explanation: "Verified peer-to-peer transfer. No anomalies detected.",
    entity: "Bank B"
  },
  {
    id: "tx_105",
    hashId: "2e1f4a9b",
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    amount: 15000,
    score: 0.98,
    status: "BLOCKED",
    scenario: "STRUCTURING",
    explanation: "AI Explanation: Pattern suggests smurfing/structuring. 5th high-value split in 2 hours.",
    entity: "Bank A"
  }
];

export const SCENARIOS = [
  "HIGH_VALUE",
  "VELOCITY_BURST",
  "STRUCTURING",
  "GEO_ANOMALY",
  "DORMANT_REACTIVATION"
];

export const EXPLANATIONS = [
  "Transaction exceeds historical limits.",
  "Rapid bursts detected from multiple endpoints.",
  "Possible money laundering pattern.",
  "Account accessed from unauthorized region.",
  "Large transfer following long period of inactivity."
];
