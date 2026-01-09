// server.js
const express = require('express');
const cors = require('cors');
const { WebSocketServer } = require('ws');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// In-memory data store
let transactions = [];
let entities = [];
let simulationRunning = false;

// Helper: Generate mock transaction
function generateTransaction() {
  const types = ['transfer', 'login', 'api_call', 'data_access', 'file_upload'];
  const severities = ['low', 'medium', 'high', 'critical'];
  const statuses = ['success', 'failed', 'pending', 'blocked'];
  
  return {
    id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    type: types[Math.floor(Math.random() * types.length)],
    source: `10.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    destination: `10.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    severity: severities[Math.floor(Math.random() * severities.length)],
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
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;
  const severity = req.query.severity;
  
  let filtered = transactions;
  
  if (severity) {
    filtered = transactions.filter(tx => tx.severity === severity);
  }
  
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
      hash: `sha256:${Math.random().toString(36).substr(2, 32)}`
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
  const { action } = req.body;
  
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

// POST /v1/ai/briefing - Generate Executive Security Summary
app.post('/v1/ai/briefing', async (req, res) => {
  try {
    const recentTx = transactions.slice(0, 20);
    const criticalCount = recentTx.filter(tx => tx.severity === 'critical').length;
    const highCount = recentTx.filter(tx => tx.severity === 'high').length;
    const blockedCount = recentTx.filter(tx => tx.status === 'blocked').length;
    
    const prompt = `Generate an executive security briefing based on this data:
    
Recent Activity:
- Total Transactions: ${recentTx.length}
- Critical Severity: ${criticalCount}
- High Severity: ${highCount}
- Blocked: ${blockedCount}

Top Transaction Types: ${[...new Set(recentTx.map(tx => tx.type))].join(', ')}

Entities Status:
${entities.map(e => `- ${e.name}: Trust Score ${e.trustScore}%, Risk: ${e.riskLevel}`).join('\n')}

Provide a concise executive summary with:
1. Overall security posture
2. Key concerns
3. Recommended actions`;

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    res.json({
      success: true,
      briefing: text,
      generatedAt: new Date().toISOString(),
      stats: {
        totalTransactions: recentTx.length,
        criticalCount,
        highCount,
        blockedCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate briefing',
      message: error.message
    });
  }
});

// POST /v1/ai/analyze/:id - Perform forensic deep-dive
app.post('/v1/ai/analyze/:id', async (req, res) => {
  try {
    const transaction = transactions.find(tx => tx.id === req.params.id);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }
    
    const prompt = `Perform a detailed forensic analysis of this security transaction:

Transaction ID: ${transaction.id}
Type: ${transaction.type}
Timestamp: ${transaction.timestamp}
Source: ${transaction.source}
Destination: ${transaction.destination}
Severity: ${transaction.severity}
Status: ${transaction.status}
User: ${transaction.user}
Bytes Transferred: ${transaction.bytes}

Provide:
1. Threat assessment
2. Potential attack vectors
3. Indicators of compromise (IoCs)
4. Recommended mitigation steps
5. Related patterns to watch for`;

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    res.json({
      success: true,
      transactionId: req.params.id,
      analysis: text,
      analyzedAt: new Date().toISOString(),
      transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to perform analysis',
      message: error.message
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    simulation: simulationRunning ? 'running' : 'stopped',
    transactions: transactions.length
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Security Monitoring Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

// WebSocket Server for /v1/ai/chat
const wss = new WebSocketServer({ server, path: '/v1/ai/chat' });

const clients = new Set();

function broadcastToClients(message) {
  clients.forEach(client => {
    if (client.readyState === 1) { // OPEN
      client.send(JSON.stringify(message));
    }
  });
}

wss.on('connection', (ws) => {
  console.log('🔌 WebSocket client connected');
  clients.add(ws);
  
  // Send welcome message
  ws.send(JSON.stringify({
    type: 'system',
    message: 'Connected to Security Command Assistant. How can I help you?',
    timestamp: new Date().toISOString()
  }));
  
  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString());
      
      if (message.type === 'query') {
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

        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const result = await model.generateContent(context);
        const response = await result.response;
        const text = response.text();
        
        ws.send(JSON.stringify({
          type: 'response',
          query: message.query,
          response: text,
          timestamp: new Date().toISOString()
        }));
      }
    } catch (error) {
      ws.send(JSON.stringify({
        type: 'error',
        error: 'Failed to process query',
        message: error.message,
        timestamp: new Date().toISOString()
      }));
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
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  stopSimulation();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});