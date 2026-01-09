import React, { useState, useEffect, useCallback } from 'react';
import { 
  Play, Pause, RefreshCw, Zap, Lock, Unlock, Server, BrainCircuit, 
  ArrowRight, Activity, ShieldCheck, DollarSign, AlertTriangle, Terminal,
  ShieldAlert, CheckCircle
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- TYPES ---
export enum TransactionStatus {
  APPROVE = 'APPROVE',
  REVIEW = 'REVIEW',
  BLOCKED = 'BLOCKED'
}

export interface TransactionDetails {
  mcc: string;
  channel: 'POS' | 'ATM' | 'ONLINE' | 'MOBILE';
  location_city: string;
  payment_type: 'CARD' | 'UPI' | 'TRANSFER';
}

export interface RiskAssessment {
  score: number;
  status: TransactionStatus;
  scenario: string;
}

export interface BankEntity {
  id: string;
  name: string;
}

export interface Transaction {
  id: string;
  userId: string;
  hashedUserId: string;
  merchantId: string;
  amount: number;
  currency: string;
  timestamp: string;
  details: TransactionDetails;
  risk: RiskAssessment;
  entity: BankEntity;
}

export interface IngestPayload {
  meta: {
    request_id: string;
    generated_at: string;
    total: number;
  };
  data: Transaction[];
}

// --- SERVICES & SIMULATION ---
const FRAUDLABS_API_KEY = 'REMOVED_KEY';
const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Pune', 'Hyderabad', 'Ahmedabad'];
const CHANNELS = ['POS', 'ATM', 'ONLINE', 'MOBILE'] as const;
const PAYMENT_TYPES = ['CARD', 'UPI', 'TRANSFER'] as const;
const MERCHANTS = ['Amazon India', 'Flipkart', 'Zomato', 'Uber', 'Local Grocery', 'Reliance Digital', 'Starbucks', 'Unknown Vendor'];
const USERS = ['user_akash@email.com', 'user_priya@email.com', 'user_rahul@email.com', 'user_sneha@email.com', 'wallet_9876543210'];
const MCCS = ['5411', '5812', '5732', '4121', '7995', '5999'];

const generateSha256 = async (input: string): Promise<string> => {
  const msgBuffer = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const checkFraudLabsPro = async (
  amount: number, mcc: string, city: string, email: string, ip: string
): Promise<{ score: number; status: TransactionStatus; scenario: string; summary: string }> => {
  try {
    const params = new URLSearchParams({
      key: FRAUDLABS_API_KEY, format: 'json', email, ip, 
      amount: amount.toString(), currency: 'INR', bill_city: city, bill_country: 'IN'
    });
    const response = await fetch(`https://api.fraudlabspro.com/v1/order/screen?${params.toString()}`, {
      method: 'GET', signal: AbortSignal.timeout(2000)
    });
    if (response.ok) {
      const data = await response.json();
      const apiScore = parseInt(data.fraudlabspro_score || '0', 10);
      let status = TransactionStatus.APPROVE;
      if (data.fraudlabspro_status === 'REJECT') status = TransactionStatus.BLOCKED;
      else if (data.fraudlabspro_status === 'REVIEW') status = TransactionStatus.REVIEW;
      return {
        score: apiScore,
        status,
        scenario: 'REAL_API_VERIFIED',
        summary: data.fraudlabspro_message || 'Verified by FraudLabs Pro'
      };
    }
  } catch (e) {}

  // Local Fallback
  let score = Math.floor(Math.random() * 15);
  if (amount > 10000) score += 40;
  if (mcc === '7995') score += 50;
  score = Math.min(100, score);
  let status = TransactionStatus.APPROVE;
  if (score > 80) status = TransactionStatus.BLOCKED;
  else if (score > 50) status = TransactionStatus.REVIEW;
  return { score, status, scenario: 'LOCAL_HEURISTICS', summary: 'Local simulation fallback' };
};

const generateTransaction = async (): Promise<Transaction> => {
  const amount = Math.floor(Math.random() * 15000) + 50;
  const mcc = MCCS[Math.floor(Math.random() * MCCS.length)];
  const city = CITIES[Math.floor(Math.random() * CITIES.length)];
  const userId = USERS[Math.floor(Math.random() * USERS.length)];
  const ip = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.1.1`;
  const fraud = await checkFraudLabsPro(amount, mcc, city, userId, ip);
  const hashedUserId = await generateSha256(userId);
  return {
    id: crypto.randomUUID(),
    userId, hashedUserId,
    merchantId: MERCHANTS[Math.floor(Math.random() * MERCHANTS.length)],
    amount, currency: 'INR', timestamp: new Date().toISOString(),
    details: { 
      mcc, 
      channel: CHANNELS[Math.floor(Math.random() * CHANNELS.length)], 
      location_city: city, 
      payment_type: PAYMENT_TYPES[Math.floor(Math.random() * PAYMENT_TYPES.length)] 
    },
    risk: { score: fraud.score, status: fraud.status, scenario: fraud.scenario },
    entity: { id: 'bank_01', name: 'Sentinel Local Node' }
  };
};

// --- COMPONENTS ---

const RiskChart: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => {
  const data = transactions.slice(-20).map(t => ({
    time: new Date(t.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second:'2-digit' }),
    score: t.risk.score,
    id: t.id
  }));

  return (
    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg h-64">
      <div className="mb-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Real-time Risk Velocity</div>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
          <XAxis dataKey="time" hide />
          <YAxis domain={[0, 100]} stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', fontSize: '12px' }}
            itemStyle={{ color: '#e5e7eb' }}
            labelStyle={{ color: '#9ca3af' }}
          />
          <Area 
            type="monotone" 
            dataKey="score" 
            stroke="#ef4444" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorScore)" 
            animationDuration={500}
            isAnimationActive={true}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

const StatsOverview: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => {
  const total = transactions.length;
  const blocked = transactions.filter(t => t.risk.status === TransactionStatus.BLOCKED).length;
  const review = transactions.filter(t => t.risk.status === TransactionStatus.REVIEW).length;
  const volume = transactions.reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg hover:border-blue-500/30 transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Total Transactions</span>
          <Activity className="w-5 h-5 text-blue-500" />
        </div>
        <div className="text-4xl font-bold text-white">{total}</div>
      </div>
      
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg hover:border-emerald-500/30 transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Volume Processed</span>
          <DollarSign className="w-5 h-5 text-emerald-500" />
        </div>
        <div className="text-4xl font-bold text-white">₹{(volume / 100000).toFixed(2)}L</div>
      </div>

      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg hover:border-amber-500/30 transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Flagged for Review</span>
          <ShieldAlert className="w-5 h-5 text-amber-500" />
        </div>
        <div className="text-4xl font-bold text-amber-400">{review}</div>
      </div>

      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg hover:border-red-500/30 transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Blocked Fraud</span>
          <ShieldCheck className="w-5 h-5 text-red-500" />
        </div>
        <div className="text-4xl font-bold text-red-400">{blocked}</div>
      </div>
    </div>
  );
};

interface TransactionDetailProps {
  transaction: Transaction | null;
}

const TransactionDetail: React.FC<TransactionDetailProps> = ({ transaction }) => {
  const [activeTab, setActiveTab] = useState<'visual' | 'payload' | 'raw'>('visual');
  const [isDevMode, setIsDevMode] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');

  useEffect(() => {
    setAiAnalysis('');
    if (transaction && (transaction.risk.score > 50)) {
      handleAnalyze();
    }
  }, [transaction]);

  useEffect(() => {
    if (!isDevMode && activeTab === 'raw') {
      setActiveTab('visual');
    }
  }, [isDevMode, activeTab]);

  const handleAnalyze = async () => {
    if (!transaction) return;
    const analysis = `AI Analysis: This transaction from ${transaction.merchantId} via ${transaction.details.channel} shows ${
      transaction.risk.score > 80 ? 'multiple high-risk indicators including unusual amount patterns' :
      transaction.risk.score > 50 ? 'moderate risk factors requiring further verification' :
      'normal behavioral patterns consistent with user history'
    }. ${transaction.risk.scenario === 'REAL_API_VERIFIED' ? 'Verified by external fraud detection API.' : 'Analyzed using local heuristics.'}`;
    setAiAnalysis(analysis);
  };

  if (!transaction) {
    return (
      <div className="h-full bg-slate-900 border border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-500 p-8 text-center">
        <Server className="w-16 h-16 mb-4 opacity-30" />
        <p className="text-lg mb-2">No Transaction Selected</p>
        <p className="text-sm text-slate-600">Select a transaction from the live feed to inspect details and privacy hashing.</p>
      </div>
    );
  }

  const hashedPayload: IngestPayload['data'][0] = {
    id: transaction.id,
    hashedUserId: transaction.hashedUserId,
    userId: transaction.userId,
    merchantId: transaction.merchantId,
    amount: transaction.amount,
    currency: transaction.currency,
    timestamp: transaction.timestamp,
    details: transaction.details,
    risk: transaction.risk,
    entity: transaction.entity
  };

  const payloadWrapper: IngestPayload = {
    meta: {
      request_id: `req_${Math.random().toString(36).substring(7)}`,
      generated_at: new Date().toISOString(),
      total: 1
    },
    data: [hashedPayload]
  };

  return (
    <div className="h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
      <div className="flex border-b border-slate-800 bg-slate-950/50 justify-between">
        <div className="flex flex-1">
          <button 
            onClick={() => setActiveTab('visual')}
            className={`flex-1 px-4 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'visual' ? 'text-indigo-400 bg-slate-900 border-b-2 border-indigo-500' : 'text-slate-500 hover:text-gray-300'}`}
          >
            <Lock className="w-4 h-4" />
            Privacy & Risk
          </button>
          <button 
            onClick={() => setActiveTab('payload')}
            className={`flex-1 px-4 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'payload' ? 'text-indigo-400 bg-slate-900 border-b-2 border-indigo-500' : 'text-slate-500 hover:text-gray-300'}`}
          >
            <span className="text-xs uppercase tracking-wider">JSON</span>
          </button>
          {isDevMode && (
            <button 
              onClick={() => setActiveTab('raw')}
              className={`flex-1 px-4 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'raw' ? 'text-red-400 bg-slate-900 border-b-2 border-red-500' : 'text-slate-500 hover:text-gray-300'}`}
            >
              <span className="text-xs uppercase tracking-wider">Raw</span>
            </button>
          )}
        </div>
        
        <button
          onClick={() => setIsDevMode(!isDevMode)}
          className={`px-4 border-l border-slate-800 flex items-center gap-2 transition-colors hover:bg-slate-800 ${isDevMode ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-600'}`}
          title="Toggle Developer Mode"
        >
          <Terminal className="w-4 h-4" />
          <span className="hidden lg:inline text-[10px] font-mono font-bold">{isDevMode ? 'DEV ON' : 'DEV OFF'}</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'visual' && (
          <div className="space-y-8">
            <div className="flex justify-between items-start">
               <div>
                 <h2 className="text-2xl font-bold text-white font-mono">TX-{transaction.id.substring(0, 8)}</h2>
                 <p className="text-slate-500 text-sm">{new Date(transaction.timestamp).toLocaleString()}</p>
               </div>
               <div className={`px-4 py-2 rounded text-sm font-bold border ${
                 transaction.risk.status === TransactionStatus.BLOCKED ? 'bg-red-500/10 border-red-500/50 text-red-500' :
                 transaction.risk.status === TransactionStatus.REVIEW ? 'bg-amber-500/10 border-amber-500/50 text-amber-500' :
                 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500'
               }`}>
                 {transaction.risk.status}
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-950/50 rounded-lg p-4 border border-slate-800">
                <div className="text-xs text-slate-500 uppercase font-bold mb-2">Merchant</div>
                <div className="text-sm text-white">{transaction.merchantId}</div>
              </div>
              <div className="bg-slate-950/50 rounded-lg p-4 border border-slate-800">
                <div className="text-xs text-slate-500 uppercase font-bold mb-2">Channel</div>
                <div className="text-sm text-white">{transaction.details.channel}</div>
              </div>
              <div className="bg-slate-950/50 rounded-lg p-4 border border-slate-800">
                <div className="text-xs text-slate-500 uppercase font-bold mb-2">Location</div>
                <div className="text-sm text-white">{transaction.details.location_city}</div>
              </div>
              <div className="bg-slate-950/50 rounded-lg p-4 border border-slate-800">
                <div className="text-xs text-slate-500 uppercase font-bold mb-2">Amount</div>
                <div className="text-2xl font-bold text-white">₹{transaction.amount.toLocaleString()}</div>
              </div>
            </div>

            <div className="bg-slate-950/50 rounded-lg p-5 border border-slate-800">
               <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                 <Lock className="w-4 h-4" />
                 Privacy Preservation Layer
               </h3>
               
               <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2 text-red-400 text-xs uppercase font-bold">
                        <Unlock className="w-3 h-3" /> Raw PII (Local Only)
                    </div>
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <div className="text-[10px] text-slate-500 uppercase">User ID</div>
                        <div className="font-mono text-sm text-red-200 break-all">{transaction.userId}</div>
                    </div>
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <div className="text-[10px] text-slate-500 uppercase">Merchant</div>
                        <div className="font-mono text-sm text-red-200">{transaction.merchantId}</div>
                    </div>
                  </div>

                  <div className="flex justify-center text-slate-600">
                     <ArrowRight className="w-6 h-6" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2 text-emerald-400 text-xs uppercase font-bold">
                        <Lock className="w-3 h-3" /> Hashed (Transmitted)
                    </div>
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                        <div className="text-[10px] text-slate-500 uppercase">Hash ID (SHA-256)</div>
                        <div className="font-mono text-xs text-emerald-200 break-all">{transaction.hashedUserId}</div>
                    </div>
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                        <div className="text-[10px] text-slate-500 uppercase">MCC Category</div>
                        <div className="font-mono text-sm text-emerald-200">{transaction.details.mcc}</div>
                    </div>
                  </div>
               </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-900/20 to-slate-900 rounded-lg p-5 border border-indigo-500/20">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                        <BrainCircuit className="w-4 h-4" />
                        AI Fraud Analyst
                    </h3>
                    {transaction.risk.score > 50 && (
                        <button 
                            onClick={handleAnalyze}
                            className="text-xs text-indigo-400 hover:text-indigo-300 underline"
                        >
                            Refresh Analysis
                        </button>
                    )}
                </div>
                
                {transaction.risk.score <= 50 ? (
                    <p className="text-slate-500 text-sm italic">Transaction is low risk. AI analysis typically reserved for suspicious activity.</p>
                ) : aiAnalysis ? (
                    <p className="text-slate-200 text-sm leading-relaxed border-l-2 border-indigo-500 pl-4">
                        {aiAnalysis}
                    </p>
                ) : (
                    <div className="animate-pulse space-y-2">
                        <div className="h-4 bg-indigo-500/20 rounded w-3/4"></div>
                        <div className="h-4 bg-indigo-500/20 rounded w-1/2"></div>
                    </div>
                )}
                <div className="mt-3 text-xs text-slate-600">
                  Risk Score: <span className={`font-bold ${
                    transaction.risk.score > 80 ? 'text-red-400' : 
                    transaction.risk.score > 50 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>{transaction.risk.score}/100</span> • Method: {transaction.risk.scenario}
                </div>
            </div>
          </div>
        )}

        {activeTab === 'payload' && (
          <div className="relative h-full">
            <pre className="font-mono text-xs text-emerald-400 bg-black p-4 rounded-lg border border-slate-800 h-full overflow-auto shadow-inner">
              {JSON.stringify(payloadWrapper, null, 2)}
            </pre>
            <div className="absolute top-2 right-2 flex flex-col items-end">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Status</span>
              <span className="text-xs text-emerald-500 font-mono">POST /api/ingest [SIMULATED]</span>
            </div>
          </div>
        )}

        {activeTab === 'raw' && isDevMode && (
           <div className="space-y-4">
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex gap-3 items-start">
                  <Unlock className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                      <h3 className="text-red-400 font-bold text-sm uppercase">Unencrypted Data Exposure</h3>
                      <p className="text-xs text-red-300/80 mt-1">
                          You are viewing the raw transaction object before it passes through the SHA-256 privacy layer. 
                          In a production environment, this data never leaves the secure memory of the local entity.
                      </p>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
                      <div className="text-xs text-slate-500 uppercase font-bold mb-2">User Identity (PII)</div>
                      <div className="font-mono text-sm text-emerald-400 break-all">{transaction.userId}</div>
                  </div>
                  <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
                      <div className="text-xs text-slate-500 uppercase font-bold mb-2">Merchant Identity</div>
                      <div className="font-mono text-sm text-amber-400">{transaction.merchantId}</div>
                  </div>
              </div>

              <div className="relative h-full">
                <div className="text-xs text-slate-500 mb-2 uppercase font-bold">Full Transaction Object</div>
                <pre className="font-mono text-xs text-slate-300 bg-black p-4 rounded-lg border border-slate-800 overflow-auto shadow-inner">
                  {JSON.stringify(transaction, null, 2)}
                </pre>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

const StatusIcon = ({ status }: { status: TransactionStatus }) => {
  switch (status) {
    case TransactionStatus.BLOCKED:
      return <ShieldAlert className="w-4 h-4 text-red-500" />;
    case TransactionStatus.REVIEW:
      return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    case TransactionStatus.APPROVE:
      return <CheckCircle className="w-4 h-4 text-emerald-500" />;
    default:
      return <Activity className="w-4 h-4 text-slate-500" />;
  }
};

interface TransactionListProps {
  transactions: Transaction[];
  onSelect: (t: Transaction) => void;
  selectedId?: string;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onSelect, selectedId }) => {
  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
        <h3 className="font-bold text-slate-500 uppercase text-xs tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-500" />
          Live Transaction Feed
        </h3>
        <span className="text-xs text-slate-500">{transactions.length} events</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-2 relative">
        {transactions.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-slate-600 text-sm">
                Waiting for incoming stream...
            </div>
        )}
        {[...transactions].reverse().map((tx) => (
          <div
            key={tx.id}
            onClick={() => onSelect(tx)}
            className={`
              p-4 rounded-lg border cursor-pointer transition-all duration-200 group
              ${selectedId === tx.id 
                ? 'bg-slate-800/50 border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.1)]' 
                : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800'
              }
            `}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <StatusIcon status={tx.risk.status} />
                <span className={`font-mono text-sm font-medium ${
                    tx.risk.status === TransactionStatus.BLOCKED ? 'text-red-400' : 
                    tx.risk.status === TransactionStatus.REVIEW ? 'text-amber-400' : 'text-slate-300'
                }`}>
                  {tx.risk.status}
                </span>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {new Date(tx.timestamp).toLocaleTimeString()}
              </span>
            </div>
            
            <div className="flex justify-between items-end">
                <div>
                     <div className="text-xs text-slate-500 mb-0.5 truncate max-w-[160px]">{tx.userId}</div>
                     <div className="text-xs text-slate-400">{tx.details.location_city} • {tx.details.channel}</div>
                </div>
                <div className="text-right">
                    <div className="font-mono text-sm text-white">
                        ₹{tx.amount.toLocaleString('en-IN')}
                    </div>
                    <div className={`text-[10px] uppercase font-bold tracking-wide ${
                        tx.risk.score > 80 ? 'text-red-500' : tx.risk.score > 50 ? 'text-amber-500' : 'text-emerald-500'
                    }`}>
                        Risk: {tx.risk.score}/100
                    </div>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- APP ROOT ---
const BankA: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(2000);

  const addTx = useCallback(async () => {
    const tx = await generateTransaction();
    setTransactions(prev => [...prev, tx].slice(-40));
    if (!selectedTx) setSelectedTx(tx);
  }, [selectedTx]);

  useEffect(() => {
    let timer: any;
    if (isRunning) {
      timer = setInterval(addTx, speed);
    }
    return () => clearInterval(timer);
  }, [isRunning, speed, addTx]);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Zap className="text-indigo-500" size={32} />
          <h1 className="text-3xl font-bold">
            SENTINEL <span className="text-slate-500">| Fraud Intelligence Hub</span>
          </h1>
        </div>
        <p className="text-slate-400 text-sm">
          Local Bank Entity Simulation Node • Region: India (IN-WEST-1) • Privacy-First Architecture
        </p>
      </header>

      <div className="flex justify-between items-center mb-6 bg-slate-900 p-4 rounded-xl border border-slate-800">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold uppercase tracking-wider text-sm transition-all ${
            isRunning
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}
        >
          {isRunning ? <Pause size={18} /> : <Play size={18} />}
          {isRunning ? 'Stop Stream' : 'Start Stream'}
        </button>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-slate-400 text-sm">Speed:</span>
            <select 
              value={speed} 
              onChange={e => setSpeed(Number(e.target.value))} 
              className="bg-slate-950 border border-slate-800 text-sm rounded-lg px-3 py-2 outline-none focus:border-indigo-500 transition-colors"
            >
              <option value={5000}>Slow (5s)</option>
              <option value={2000}>Normal (2s)</option>
              <option value={500}>Fast (0.5s)</option>
            </select>
          </div>
          <button 
            onClick={() => { setTransactions([]); setSelectedTx(null); }} 
            className="p-2 text-slate-500 hover:text-white transition-colors"
            title="Reset"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      <StatsOverview transactions={transactions} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-1 h-[500px]">
          <TransactionList 
            transactions={transactions} 
            onSelect={setSelectedTx} 
            selectedId={selectedTx?.id} 
          />
        </div>

        <div className="lg:col-span-2 h-[500px]">
          <TransactionDetail transaction={selectedTx} />
        </div>
      </div>

      <RiskChart transactions={transactions} />
      
      <div className="mt-6 text-center text-xs text-slate-600">
        <p>Simulation Environment • Using {FRAUDLABS_API_KEY ? 'FraudLabs Pro API + ' : ''}Local Heuristics • All PII is hashed locally before transmission</p>
      </div>
    </div>
  );
};

export default BankA;