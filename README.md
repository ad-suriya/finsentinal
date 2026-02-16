# 🛡 Fin Sentinel

Fin Sentinel is a full-stack real-time fraud intelligence platform built under the **FinTech / RegTech** category during a 24-hour hackathon.

The system enables privacy-preserving collaborative transaction monitoring across multiple independent financial entities without sharing raw customer data.

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

Fin Sentinel provides:

- Real-time transaction monitoring  
- Local autonomous risk scoring engines  
- SHA-256 privacy-preserving identity hashing  
- Cross-entity risk signal aggregation  
- Explainable fraud reasoning  
- Live fraud intelligence dashboard  

It converts isolated transaction signals into collaborative risk intelligence without exposing raw PII.

---

## 🏗 System Architecture

High-Level Flow:

Customer Transaction  
→ Local Bank Risk Engine  
→ Client-Side SHA-256 Hashing  
→ Shared Risk Signal Aggregation Layer  
→ Cross-Entity Pattern Analysis  
→ Decision (Approved / Flagged / Blocked)  
→ Real-Time Dashboard Output  

Each institution retains full data sovereignty.  
No centralized raw transaction database exists.

---

## 🛠 Tech Stack

Frontend:
- React (Vite)
- TypeScript
- TailwindCSS
- Lucide Icons

Backend:
- Node.js (Express API Layer)
- RESTful architecture

Security & Privacy:
- SHA-256 hashing
- Local entity data isolation
- Role-based access control

Simulation:
- Heuristic transaction generator
- Fraud burst modeling
- Real-time monitoring updates

---

## 📂 Project Structure

.
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   ├── types/
│   │   └── App.tsx
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
│
├── server/
│   ├── services/
│   ├── server.js
│   └── package.json
│
├── docs/
│   ├── presentation.pdf
│   └── problem-statement.pdf
│
├── package.json
└── README.md

---

## 🔑 Core Features

- Multi-entity fraud simulation (Bank A & Bank B)
- Autonomous local risk engines
- Privacy-preserving hashed signal exchange
- Cross-entity fraud correlation
- Real-time dashboard
- Explainable fraud reasoning engine
- Smurfing and layering attack simulation
- Risk-based transaction blocking
- Role-based access control

---

## ⚙ Installation & Setup

1. Clone the repository

git clone https://github.com/your-username/fin-sentinel.git  
cd fin-sentinel

2. Setup Frontend

cd client  
npm install  
npm run dev  

Runs on:  
http://localhost:5173

3. Setup Backend

cd server  
npm install  
npm run dev  

Runs on:  
http://localhost:3000

---

## 🔐 Environment Variables

Create `.env` files where required.

Server (.env inside server/)

PORT=3000  
JWT_SECRET=  

Do not commit `.env` files.

---

## ⚠ Regulatory Disclaimer

Fin Sentinel is a prototype fraud intelligence demonstration platform.  
It is not a certified banking security system and is not intended for production deployment without regulatory review and formal security auditing.

---

## 🚧 Current Limitations

- Rule-based risk engine only  
- Simulated multi-bank environment  
- No production-grade encryption infrastructure  
- No secure multi-party computation layer  
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
