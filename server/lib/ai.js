const { GoogleGenAI } = require('@google/genai');

const SYSTEM_INSTRUCTIONS = `
You are the Fin Sentinel Intelligence Core.
You specialize in Real-time Fraud Detection and Financial Forensics.
Output must be technical, objective, and action-oriented.
Currency used is Indian Rupees (₹).
`;

const CHAT_INSTRUCTIONS = `
You are the Fin Sentinel Virtual Security Officer.
You help users navigate the dashboard and understand threat vectors.
You can interpret transaction data and provide Indian Rupee (₹) based financial advice.
Keep it professional, like a high-end SOC terminal.
`;

const REQUEST_TIMEOUT_MS = 30000;

let client;

function isAiConfigured() {
  return Boolean(process.env.GEMINI_API_KEY);
}

async function generate(contents, config) {
  client ??= new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await client.models.generateContent({
    model: process.env.GEMINI_MODEL || 'gemini-3.6-flash',
    contents,
    config: { ...config, httpOptions: { timeout: REQUEST_TIMEOUT_MS } },
  });
  return response.text ?? '';
}

function generateBriefing(transactions) {
  const prompt = `
  Analyze this stream of recent financial transactions and provide a Lead Analyst Briefing.
  Context: ${JSON.stringify(transactions)}

  Required format:
  1. TREND: (1 sentence on overall traffic pattern)
  2. RISK: (Identification of the single most dangerous anomaly)
  3. ACTION: (One specific mitigation step for the SOC team)
  `;
  return generate(prompt, { systemInstruction: SYSTEM_INSTRUCTIONS, temperature: 0.5 });
}

function generateAnalysis(transaction) {
  const prompt = `
  Perform an exhaustive forensic breakdown on Transaction ${transaction.hashId}.
  Data: ${JSON.stringify(transaction)}

  Analyze:
  - Geographic/IP inconsistencies
  - Value vs. Entity baseline
  - Methodological signature (e.g. Structuring, Velocity, Account Takeover)

  Conclude with a final Forensic Verdict and a Confidence Score (0-100%).
  `;
  return generate(prompt, { systemInstruction: SYSTEM_INSTRUCTIONS });
}

function generateChatReply({ message, context, history }) {
  const firstUserTurn = history.findIndex((turn) => turn.role === 'user');
  const turns = firstUserTurn === -1 ? [] : history.slice(firstUserTurn);
  const contents = [
    ...turns.map((turn) => ({
      role: turn.role === 'ai' ? 'model' : 'user',
      parts: [{ text: turn.text }],
    })),
    {
      role: 'user',
      parts: [{ text: `[SYSTEM CONTEXT: Current Transactions: ${JSON.stringify(context)}] ${message}` }],
    },
  ];
  return generate(contents, { systemInstruction: CHAT_INSTRUCTIONS });
}

module.exports = { generate, generateAnalysis, generateBriefing, generateChatReply, isAiConfigured };
