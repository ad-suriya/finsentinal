
/**
 * VVFNT_02 Backend Implementation (Node.js + Express)
 * This is a standalone file for reference.
 */

const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// In-memory database (Replace with MongoDB/PostgreSQL in production)
let transactions = [
  {
    id: "tx_101",
    hashId: "a3f92b8d",
    timestamp: new Date().toISOString(),
    amount: 12500,
    score: 0.85,
    status: "BLOCKED",
    scenario: "HIGH_VALUE",
    explanation: "Transaction exceeds historical average.",
    entity: "Bank A"
  }
];

// GET /v1/transactions
app.get('/v1/transactions', (req, res) => {
  res.json(transactions);
});

// GET /v1/transactions/:id
app.get('/v1/transactions/:id', (req, res) => {
  const tx = transactions.find(t => t.id === req.params.id);
  if (!tx) return res.status(404).send('Not found');
  res.json(tx);
});

// POST /v1/transactions
app.post('/v1/transactions', (req, res) => {
  const newTx = { ...req.body, timestamp: new Date().toISOString() };
  transactions = [newTx, ...transactions];
  res.status(201).json(newTx);
});

// PATCH /v1/transactions/:id (Status update)
app.patch('/v1/transactions/:id', (req, res) => {
  const { status } = req.body;
  const index = transactions.findIndex(t => t.id === req.params.id);
  if (index === -1) return res.status(404).send('Not found');
  
  transactions[index].status = status;
  res.json(transactions[index]);
});

app.listen(port, () => {
  console.log(`VVFNT Core Backend listening at http://localhost:${port}`);
});
