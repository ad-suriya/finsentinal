
import { GoogleGenAI } from "@google/genai";
import { Transaction } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTIONS = `
You are the VVFNT_02 Cyber-Security Intelligence Core. 
You specialize in Real-time Fraud Detection and Financial Forensics.
Output must be technical, objective, and action-oriented.
Currency used is Indian Rupees (₹).
`;

// Helper to strictly sanitize transaction data for AI context
const sanitizeForAI = (tx: Transaction) => ({
  id: tx.id,
  hashId: tx.hashId,
  amount: tx.amount,
  status: tx.status,
  score: tx.score,
  entity: tx.entity,
  scenario: tx.scenario,
  timestamp: tx.timestamp
});

export const getSecurityBriefing = async (transactions: Transaction[]) => {
  console.log('API CALL: POST /ai/briefing');
  // Sanitize to prevent circular reference errors
  const safeTransactions = transactions.slice(0, 15).map(sanitizeForAI);
  const context = JSON.stringify(safeTransactions);
  
  const prompt = `
  Analyze this stream of recent financial transactions and provide a Lead Analyst Briefing.
  Context: ${context}
  
  Required format:
  1. TREND: (1 sentence on overall traffic pattern)
  2. RISK: (Identification of the single most dangerous anomaly)
  3. ACTION: (One specific mitigation step for the SOC team)
  `;
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTIONS,
      temperature: 0.5, // Lower temperature for more stable analyst reports
    },
  });
  
  return response.text;
};

export const getDeepAnalysis = async (transaction: Transaction) => {
  console.log(`API CALL: POST /ai/analyze/${transaction.id}`);
  const prompt = `
  Perform an exhaustive forensic breakdown on Transaction ${transaction.hashId}.
  Data: ${JSON.stringify(sanitizeForAI(transaction))}
  
  Analyze:
  - Geographic/IP inconsistencies
  - Value vs. Entity baseline
  - Methodological signature (e.g. Structuring, Velocity, Account Takeover)
  
  Conclude with a final Forensic Verdict and a Confidence Score (0-100%).
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTIONS,
    }
  });

  return response.text;
};

export const createAIChat = () => {
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `
      You are the VVFNT_02 Virtual Security Officer. 
      You help users navigate the dashboard and understand threat vectors.
      You can interpret transaction data and provide Indian Rupee (₹) based financial advice.
      Keep it professional, like a high-end SOC terminal.
      `,
    },
  });
};
