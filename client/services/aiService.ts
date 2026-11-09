import { Transaction } from '../types';
import { postJson } from './backend';

export interface ChatTurn {
  role: 'user' | 'ai';
  text: string;
}

// Only these fields are sent to the server for AI context.
const sanitizeForAI = (tx: Transaction) => ({
  id: tx.id,
  hashId: tx.hashId,
  amount: tx.amount,
  status: tx.status,
  score: tx.score,
  entity: tx.entity,
  scenario: tx.scenario,
  timestamp: tx.timestamp,
});

export const getSecurityBriefing = async (transactions: Transaction[]) => {
  const { briefing } = await postJson<{ briefing: string }>('/v1/ai/briefing', {
    transactions: transactions.slice(0, 15).map(sanitizeForAI),
  });
  return briefing;
};

export const getDeepAnalysis = async (transaction: Transaction) => {
  const { analysis } = await postJson<{ analysis: string }>(
    `/v1/ai/analyze/${encodeURIComponent(transaction.id)}`,
    { transaction: sanitizeForAI(transaction) },
  );
  return analysis;
};

export const sendChatMessage = async (message: string, history: ChatTurn[], transactions: Transaction[]) => {
  const { reply } = await postJson<{ reply: string }>('/v1/ai/chat', {
    message,
    history: history.slice(-20),
    context: transactions.slice(0, 5).map(sanitizeForAI),
  });
  return reply;
};
