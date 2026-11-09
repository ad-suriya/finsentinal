# 🛡 Fin Sentinel

Fin Sentinel is a full-stack fraud intelligence **prototype** built under the **FinTech / RegTech** category during a 24-hour hackathon.

It demonstrates collaborative transaction monitoring across two simulated banks, which exchange hashed identifiers and risk scores instead of raw customer data. All customers and transactions are simulated.

🏆 VVORTEX 2026 — VIT Chennai  

---

## 📌 Problem Statement

Financial institutions face:

- Increasing cross-bank fraud coordination  
- Sophisticated smurfing and layering attacks  
- Regulatory restrictions on raw data sharing  
- High false positives in isolated rule engines  

Fraud networks operate across institutions.  
Fraud detection systems do not.

There is no unified, privacy-compliant infrastructure enabling collaborative fraud intelligence without violating DPDP or GDPR.

---

## 💡 Solution

The prototype provides:

- Simulated real-time transaction monitoring  
- Deterministic rule-based risk scoring, with optional FraudLabs Pro screening  
- SHA-256 hashing of customer identifiers before signals are shared  
- A cross-bank signal endpoint that matches hashed identifiers across Bank A and Bank B  
- A plain-language list of the rules behind each local score  
- AI briefings and analysis through the server  

---

## 🏗 System Architecture

High-Level Flow:

Simulated Transaction  
→ Server-side screening (FraudLabs Pro if configured, otherwise local rules)  
→ SHA-256 hashing of the customer identifier in the browser  
→ `POST /v1/signals` with bank ID, hashed identifier, score, and status  
→ Cross-bank correlation over a one-hour window  
→ Dashboard output  

The cross-bank result is advisory. It raises an aggregate score but does not change the transaction's status.

During screening, the simulated customer identifier and IP address are sent to the server and, if configured, to FraudLabs Pro. Only the signal exchange is limited to hashed identifiers.

---

## 🛠 Tech Stack

Frontend:
- React (Vite)
- TypeScript
- TailwindCSS
- Lucide Icons

Backend:
- Node.js (Express API layer)
- Origin allowlist, rate limiting, and input validation
- Gemini and FraudLabs Pro keys held on the server only

Data:
- Firebase Firestore for dashboard transactions

Simulation:
- Random transaction generator with rule-based scoring
- Fraud burst modeling

---

## 📂 Project Structure

.
├── client/
│   ├── components/
│   ├── context/
│   ├── pages/
│   ├── services/
│   ├── App.tsx
│   └── vite.config.ts
│
├── server/
│   ├── lib/
│   ├── test/
│   └── server.js
│
└── README.md

---

## 🔑 Core Features

- Two simulated bank nodes (Bank A and Bank B)
- Deterministic risk rules with listed reasons
- Hashed signal exchange and cross-bank correlation
- Dashboard with simulated traffic and fraud bursts
- AI briefing, transaction analysis, and assistant chat

---

## ⚙ Installation & Setup

Node.js 22.18 or later is required to run the tests.

1. Clone the repository

git clone https://github.com/ad-suriya/finsentinal.git  
cd finsentinal

2. Set up the backend

cd server  
cp .env.example .env  
npm install  
npm run dev  

Runs on http://localhost:3001

3. Set up the frontend in a second terminal

cd client  
npm install  
npm run dev  

Runs on http://localhost:3000 and proxies `/v1` to the backend.

4. Run the tests with `npm test` in `server/` and `client/`.

---

## 🔐 Environment Variables

All secrets belong in `server/.env`. See `server/.env.example`.

| Variable | Purpose |
| --- | --- |
| `GEMINI_API_KEY` | Required for AI features |
| `GEMINI_MODEL` | Optional Gemini model override |
| `FRAUDLABS_API_KEY` | Optional. Without it, only local rules are used |
| `ALLOWED_ORIGINS` | Comma-separated browser origins allowed to call the API |
| `PORT` | Server port, default 3001 |

Do not commit `.env` files, and never put API keys in `VITE_*` variables.

---

## ⚠ Regulatory Disclaimer

Fin Sentinel is a prototype fraud intelligence demonstration platform.  
It has not been assessed for DPDP or GDPR compliance. It is not a certified banking security system and is not intended for production deployment without regulatory review and formal security auditing.

---

## 🚧 Current Limitations

- Simple rule-based scoring on simulated data  
- The AI text is generated commentary and does not decide transaction status  
- Login is a demo placeholder. There is no real authentication or role-based access control  
- The API has no authentication, so rate limits are its only protection against direct calls  
- Unsalted SHA-256 is not anonymization. Common identifiers such as email addresses can be recovered by guessing and hashing  
- No production-grade encryption infrastructure or secure multi-party computation  
- Server state is in memory. The network simulation runs on a global `setInterval`, and signals reset on restart, so only a single server instance is supported  
- Not benchmarked under real banking load  

---

## 🔮 Future Improvements

- Federated learning-based adaptive risk scoring  
- Secure multi-party computation implementation  
- Real banking API integration  
- Hardware-backed cryptographic modules  
- Cloud-native distributed deployment  
- Performance benchmarking and stress testing  
- Blockchain-backed audit trail  

---

## 🏆 Hackathon Details

Event: VVORTEX 2026  
Track: FinTech / RegTech  
Duration: 24 Hours  

---

## 👥 Team

- A D Suriya  
- Shravanth K S  
- Pratyush R  
- J Hritik Sabarish  
