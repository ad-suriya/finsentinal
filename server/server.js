// server.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env'), quiet: true });

const express = require('express');
const cors = require('cors');
const { rateLimit } = require('express-rate-limit');
const { WebSocketServer } = require('ws');

const { generate, generateAnalysis, generateBriefing, generateChatReply, isAiConfigured } = require('./lib/ai');
const { screenWithFraudLabs } = require('./lib/fraudlabs');
const { sha256Hex } = require('./lib/hashing');
const { scoreTransaction } = require('./lib/scoring');
const { createSignalStore } = require('./lib/signals');
const {
  MAX_MESSAGE_LENGTH,
  validateAnalysis,
  validateBriefing,
  validateChat,
  validateRiskInput,
  validateScreening,
  validateSignal,
} = require('./lib/validation');

const app = express();
const PORT = process.env.PORT || 3001;
const MAX_TRANSACTION_PAGE = 200;
const SEVERITIES = ['low', 'medium', 'high', 'critical'];
const WS_MESSAGES_PER_MINUTE = 10;

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// cors() only withholds headers, so requests from other sites are rejected here.
function rejectDisallowedOrigin(req, res, next) {
  const { origin } = req.headers;
  if (origin && !allowedOrigins.includes(origin)) {
    return res.status(403).json({ success: false, error: 'Origin not allowed' });
  }
  next();
}

const limiter = (limit) =>
  rateLimit({
    windowMs: 60 * 1000,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Too many requests' },
  });

// Middleware
app.use(rejectDisallowedOrigin);
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '100kb' }));
app.use('/v1/ai', limiter(20));
app.use('/v1', limiter(300));

const signalStore = createSignalStore();

// In-memory data store
let transactions = [];
let entities = [];
let simulationRunning = false;

function sendValidationError(res, error) {
  return res.status(400).json({ success: false, error });
}

// Handles the shared validate, check configuration, generate, respond flow of the AI routes.
function aiRoute(validate, run, errorMessage) {
  return async (req, res) => {
    const { value, error } = validate(req);
    if (error) return sendValidationError(res, error);
    if (!isAiConfigured()) {
      return res.status(503).json({ success: false, error: 'AI service is not configured' });
    }
    try {
      res.json({ success: true, ...(await run(value)), generatedAt: new Date().toISOString() });
    } catch (err) {
      console.error(`${errorMessage}:`, err.message);
      res.status(502).json({ success: false, error: errorMessage });
    }
  };
}

// Helper: Generate mock transaction
function generateTransaction() {
  const types = ['transfer', 'login', 'api_call', 'data_access', 'file_upload'];
  const statuses = ['success', 'failed', 'pending', 'blocked'];

  return {
    id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    type: types[Math.floor(Math.random() * types.length)],
    source: `10.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    destination: `10.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    severity: SEVERITIES[Math.floor(Math.random() * SEVERITIES.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    bytes: Math.floor(Math.random() * 1000000),
    user: `user_${Math.floor(Math.random() * 100)}`,
    description: 'Network activity detected'
  };
}

// Helper: Generate mock entities
function generateEntities() {
  return [
    {
      id: 'ent_001',
      name: 'Web Application',
      trustScore: Math.floor(Math.random() * 40) + 60,
      connections: Math.floor(Math.random() * 1000),
      lastSeen: new Date().toISOString(),
      riskLevel: 'low'
    },
    {
      id: 'ent_002',
      name: 'Database Server',
      trustScore: Math.floor(Math.random() * 30) + 70,
      connections: Math.floor(Math.random() * 500),
      lastSeen: new Date().toISOString(),
      riskLevel: 'medium'
    },
    {
      id: 'ent_003',
      name: 'API Gateway',
      trustScore: Math.floor(Math.random() * 20) + 80,
      connections: Math.floor(Math.random() * 2000),
      lastSeen: new Date().toISOString(),
      riskLevel: 'low'
    },
    {
      id: 'ent_004',
      name: 'External Service',
      trustScore: Math.floor(Math.random() * 50) + 30,
      connections: Math.floor(Math.random() * 300),
      lastSeen: new Date().toISOString(),
      riskLevel: 'high'
    }
  ];
}

// Initialize with some data
for (let i = 0; i < 50; i++) {
  transactions.push(generateTransaction());
}
entities = generateEntities();

// Simulation interval
let simulationInterval = null;

function startSimulation() {
  if (simulationInterval) return;

  simulationInterval = setInterval(() => {
    const newTx = generateTransaction();
    transactions.unshift(newTx);

    // Keep only last 1000 transactions
    if (transactions.length > 1000) {
      transactions = transactions.slice(0, 1000);
    }

    // Update entities
    entities = generateEntities();

    // Broadcast to WebSocket clients
    broadcastToClients({ type: 'transaction', data: newTx });
  }, 2000); // Generate every 2 seconds

  simulationRunning = true;
}

function stopSimulation() {
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
  }
  simulationRunning = false;
}

// API Routes

// GET /v1/transactions - Fetch live transaction feed
app.get('/v1/transactions', (req, res) => {
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), MAX_TRANSACTION_PAGE);
  const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);
  const severity = req.query.severity;

  if (severity !== undefined && !SEVERITIES.includes(severity)) {
    return sendValidationError(res, `severity must be one of ${SEVERITIES.join(', ')}`);
  }

  const filtered = severity ? transactions.filter(tx => tx.severity === severity) : transactions;

  res.json({
    success: true,
    data: filtered.slice(offset, offset + limit),
    total: filtered.length,
    limit,
    offset
  });
});

// GET /v1/transactions/:id - Fetch detail for specific hash
app.get('/v1/transactions/:id', (req, res) => {
  const transaction = transactions.find(tx => tx.id === req.params.id);

  if (!transaction) {
    return res.status(404).json({
      success: false,
      error: 'Transaction not found'
    });
  }

  // Add detailed metadata
  const detailed = {
    ...transaction,
    metadata: {
      protocol: 'TCP',
      port: Math.floor(Math.random() * 65535),
      duration: Math.floor(Math.random() * 5000),
      packets: Math.floor(Math.random() * 1000),
      flags: ['SYN', 'ACK'],
      hash: `sha256:${sha256Hex(JSON.stringify(transaction))}`
    },
    relatedTransactions: transactions
      .filter(tx => tx.id !== req.params.id)
      .slice(0, 5)
      .map(tx => tx.id)
  };

  res.json({
    success: true,
    data: detailed
  });
});

// POST /v1/simulation/control - Start/Stop traffic generators
app.post('/v1/simulation/control', (req, res) => {
  const { action } = req.body ?? {};

  if (action === 'start') {
    startSimulation();
    res.json({
      success: true,
      message: 'Simulation started',
      status: 'running'
    });
  } else if (action === 'stop') {
    stopSimulation();
    res.json({
      success: true,
      message: 'Simulation stopped',
      status: 'stopped'
    });
  } else {
    res.status(400).json({
      success: false,
      error: 'Invalid action. Use "start" or "stop"'
    });
  }
});

// GET /v1/entities - Fetch cross-entity trust telemetry
app.get('/v1/entities', (req, res) => {
  res.json({
    success: true,
    data: entities,
    timestamp: new Date().toISOString()
  });
});

// POST /v1/risk/score - Score a transaction with the local rules only
app.post('/v1/risk/score', (req, res) => {
  const { value, error } = validateRiskInput(req.body);
  if (error) return sendValidationError(res, error);
  res.json({ success: true, data: scoreTransaction(value) });
});

// POST /v1/fraud/screen - Screen with FraudLabs Pro, falling back to the local rules
app.post('/v1/fraud/screen', async (req, res) => {
  const { value, error } = validateScreening(req.body);
  if (error) return sendValidationError(res, error);
  const result = await screenWithFraudLabs(value, process.env.FRAUDLABS_API_KEY);
  res.json({ success: true, data: result ?? scoreTransaction(value) });
});

// POST /v1/signals - Share a hashed risk signal and get the cross-bank correlation
app.post('/v1/signals', (req, res) => {
  const { value, error } = validateSignal(req.body);
  if (error) return sendValidationError(res, error);
  res.json({ success: true, data: signalStore.record(value) });
});

// GET /v1/signals/correlated - List identities with a cross-bank risk pattern
app.get('/v1/signals/correlated', (req, res) => {
  res.json({ success: true, data: signalStore.listCorrelated() });
});

// POST /v1/ai/briefing - Generate Executive Security Summary
app.post('/v1/ai/briefing', aiRoute(
  (req) => validateBriefing(req.body),
  async ({ transactions: recent }) => ({ briefing: await generateBriefing(recent) }),
  'Failed to generate briefing'
));

// POST /v1/ai/analyze/:id - Perform forensic deep-dive
app.post('/v1/ai/analyze/:id', aiRoute(
  (req) => validateAnalysis(req.body, req.params.id),
  async ({ transaction }) => ({ analysis: await generateAnalysis(transaction) }),
  'Failed to perform analysis'
));

// POST /v1/ai/chat - Answer a question from the dashboard assistant
app.post('/v1/ai/chat', aiRoute(
  (req) => validateChat(req.body),
  async (chat) => ({ reply: await generateChatReply(chat) }),
  'Failed to generate reply'
));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    simulation: simulationRunning ? 'running' : 'stopped',
    transactions: transactions.length
  });
});

const clients = new Set();

function broadcastToClients(message) {
  clients.forEach(client => {
    if (client.readyState === 1) { // OPEN
      client.send(JSON.stringify(message));
    }
  });
}

function handleConnection(ws) {
  console.log('🔌 WebSocket client connected');
  clients.add(ws);
  let windowStart = Date.now();
  let messagesInWindow = 0;

  const sendError = (error) => ws.send(JSON.stringify({ type: 'error', error, timestamp: new Date().toISOString() }));

  // Send welcome message
  ws.send(JSON.stringify({
    type: 'system',
    message: 'Connected to Fin Sentinel Assistant. How can I help you?',
    timestamp: new Date().toISOString()
  }));

  ws.on('message', async (data) => {
    if (Date.now() - windowStart > 60 * 1000) {
      windowStart = Date.now();
      messagesInWindow = 0;
    }
    if (++messagesInWindow > WS_MESSAGES_PER_MINUTE) return sendError('Too many requests');

    try {
      const message = JSON.parse(data.toString());

      if (message.type === 'query') {
        if (typeof message.query !== 'string' || !message.query || message.query.length > MAX_MESSAGE_LENGTH) {
          return sendError('query must be 1 to 2000 characters');
        }
        if (!isAiConfigured()) return sendError('AI service is not configured');

        // Build context from current system state
        const context = `Current System Status:
- Active Transactions: ${transactions.length}
- Simulation: ${simulationRunning ? 'Running' : 'Stopped'}
- Critical Alerts: ${transactions.filter(tx => tx.severity === 'critical').length}
- Entities Monitored: ${entities.length}

Recent Activity:
${transactions.slice(0, 5).map(tx =>
  `- ${tx.type} from ${tx.source} (${tx.severity})`
).join('\n')}

User Query: ${message.query}

Provide a helpful response as a security command assistant.`;

        const text = await generate(context);

        ws.send(JSON.stringify({
          type: 'response',
          query: message.query,
          response: text,
          timestamp: new Date().toISOString()
        }));
      }
    } catch (error) {
      console.error('WebSocket query failed:', error.message);
      sendError('Failed to process query');
    }
  });

  ws.on('close', () => {
    console.log('🔌 WebSocket client disconnected');
    clients.delete(ws);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clients.delete(ws);
  });
}

function startServer() {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Fin Sentinel backend running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
  });

  // WebSocket Server for /v1/ai/chat. Browsers always send Origin, so it is required here.
  const wss = new WebSocketServer({
    server,
    path: '/v1/ai/chat',
    maxPayload: 16 * 1024,
    verifyClient: ({ origin }) => allowedOrigins.includes(origin),
  });
  wss.on('connection', handleConnection);

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    stopSimulation();
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
}

if (require.main === module) {
  startServer();
}

module.exports = { app };
