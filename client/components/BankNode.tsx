import React, { useState, useEffect, useCallback } from 'react';
import { 
  Play, Pause, RefreshCw, Zap, Lock, Unlock, Server, BrainCircuit, 
  ArrowRight, Activity, ShieldCheck, DollarSign, AlertTriangle, Terminal,
  ShieldAlert, CheckCircle
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { reportSignal, screenFraud, SignalCorrelation } from '../services/backend';
import { sha256Hex } from '../services/hashing';

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
  reasons: string[];
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
  correlation: SignalCorrelation;
}

// --- SERVICES & SIMULATION ---
const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Pune', 'Hyderabad', 'Ahmedabad'];
const CHANNELS = ['POS', 'ATM', 'ONLINE', 'MOBILE'] as const;
const PAYMENT_TYPES = ['CARD', 'UPI', 'TRANSFER'] as const;
const MERCHANTS = ['Amazon India', 'Flipkart', 'Zomato', 'Uber', 'Local Grocery', 'Reliance Digital', 'Starbucks', 'Unknown Vendor'];
const USERS = ['user_akash@email.com', 'user_priya@email.com', 'user_rahul@email.com', 'user_sneha@email.com', 'wallet_9876543210'];
const MCCS = ['5411', '5812', '5732', '4121', '7995', '5999'];

const pick = <T,>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)];

const generateTransaction = async (bank: BankEntity): Promise<Transaction> => {
  const amount = Math.floor(Math.random() * 15000) + 50;
  const mcc = pick(MCCS);
  const city = pick(CITIES);
  const userId = pick(USERS);
  const merchantId = pick(MERCHANTS);
  const ip = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.1.1`;
  const risk = await screenFraud({ amount, mcc, merchantId, city, email: userId, ip });
  const hashedUserId = await sha256Hex(userId);
  const status = risk.status as TransactionStatus;
  const correlation = await reportSignal({
    bankId: bank.id, hashedUserId, score: risk.score, status: risk.status,
  });
  return {
    id: crypto.randomUUID(),
    userId, hashedUserId, merchantId,
    amount, currency: 'INR', timestamp: new Date().toISOString(),
    details: {
      mcc,
      channel: pick(CHANNELS),
      location_city: city,
      payment_type: pick(PAYMENT_TYPES)
    },
    risk: { score: risk.score, status, scenario: risk.scenario, reasons: risk.reasons },
    entity: bank,
    correlation
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
    <div className="bg-white p-6 rounded-xl border border-[#D1FAE5] shadow-lg h-64">
      <div className="mb-4 text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Real-time Risk Velocity</div>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#D1FAE5" vertical={false} />
          <XAxis dataKey="time" hide />
          <YAxis domain={[0, 100]} stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#D1FAE5', fontSize: '12px', color: '#064E3B' }}
            itemStyle={{ color: '#064E3B' }}
            labelStyle={{ color: '#64748B' }}
          />
          <Area 
            type="monotone" 
            dataKey="score" 
            stroke="#EF4444" 
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
      <div className="bg-white p-6 rounded-xl border border-[#D1FAE5] shadow-lg hover:border-[#10B981]/30 transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-[#94A3B8] uppercase font-bold tracking-wider">Total Transactions</span>
          <Activity className="w-5 h-5 text-[#10B981]" />
        </div>
        <div className="text-4xl font-bold text-[#064E3B]">{total}</div>
      </div>
      
      <div className="bg-white p-6 rounded-xl border border-[#D1FAE5] shadow-lg hover:border-[#10B981]/30 transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-[#94A3B8] uppercase font-bold tracking-wider">Volume Processed</span>
          <DollarSign className="w-5 h-5 text-[#10B981]" />
        </div>
        <div className="text-4xl font-bold text-[#064E3B]">₹{(volume / 100000).toFixed(2)}L</div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-[#D1FAE5] shadow-lg hover:border-amber-500/30 transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-[#94A3B8] uppercase font-bold tracking-wider">Flagged for Review</span>
          <ShieldAlert className="w-5 h-5 text-amber-500" />
        </div>
        <div className="text-4xl font-bold text-amber-400">{review}</div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-[#D1FAE5] shadow-lg hover:border-[#EF4444]/30 transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-[#94A3B8] uppercase font-bold tracking-wider">Blocked Fraud</span>
          <ShieldCheck className="w-5 h-5 text-[#EF4444]" />
        </div>
        <div className="text-4xl font-bold text-[#EF4444]">{blocked}</div>
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

  useEffect(() => {
    if (!isDevMode && activeTab === 'raw') {
      setActiveTab('visual');
    }
  }, [isDevMode, activeTab]);

  if (!transaction) {
    return (
      <div className="h-full bg-white border border-[#D1FAE5] rounded-xl flex flex-col items-center justify-center text-[#94A3B8] p-8 text-center">
        <Server className="w-16 h-16 mb-4 opacity-30" />
        <p className="text-lg mb-2 text-[#064E3B]">No Transaction Selected</p>
        <p className="text-sm text-[#94A3B8]">Select a transaction from the live feed to inspect details and privacy hashing.</p>
      </div>
    );
  }

  const sharedSignal = {
    bankId: transaction.entity.id,
    hashedUserId: transaction.hashedUserId,
    score: transaction.risk.score,
    status: transaction.risk.status
  };

  return (
    <div className="h-full bg-white border border-[#D1FAE5] rounded-xl overflow-hidden flex flex-col">
      <div className="flex border-b border-[#D1FAE5] bg-[#F0F7F4] justify-between">
        <div className="flex flex-1">
          <button 
            onClick={() => setActiveTab('visual')}
            className={`flex-1 px-4 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'visual' ? 'text-[#10B981] bg-white border-b-2 border-[#10B981]' : 'text-[#94A3B8] hover:text-[#64748B]'}`}
          >
            <Lock className="w-4 h-4" />
            Privacy & Risk
          </button>
          <button 
            onClick={() => setActiveTab('payload')}
            className={`flex-1 px-4 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'payload' ? 'text-[#10B981] bg-white border-b-2 border-[#10B981]' : 'text-[#94A3B8] hover:text-[#64748B]'}`}
          >
            <span className="text-xs uppercase tracking-wider">JSON</span>
          </button>
          {isDevMode && (
            <button 
              onClick={() => setActiveTab('raw')}
              className={`flex-1 px-4 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'raw' ? 'text-[#EF4444] bg-white border-b-2 border-[#EF4444]' : 'text-[#94A3B8] hover:text-[#64748B]'}`}
            >
              <span className="text-xs uppercase tracking-wider">Raw</span>
            </button>
          )}
        </div>
        
        <button
          onClick={() => setIsDevMode(!isDevMode)}
          className={`px-4 border-l border-[#D1FAE5] flex items-center gap-2 transition-colors hover:bg-[#F0F7F4] ${isDevMode ? 'text-[#10B981] bg-[#D1FAE5]' : 'text-[#94A3B8]'}`}
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
                 <h2 className="text-2xl font-bold text-[#064E3B] font-mono">TX-{transaction.id.substring(0, 8)}</h2>
                 <p className="text-[#94A3B8] text-sm">{new Date(transaction.timestamp).toLocaleString()}</p>
               </div>
               <div className={`px-4 py-2 rounded text-sm font-bold border ${
                 transaction.risk.status === TransactionStatus.BLOCKED ? 'bg-[#FEF2F2] border-[#FCA5A5] text-[#EF4444]' :
                 transaction.risk.status === TransactionStatus.REVIEW ? 'bg-amber-50 border-amber-200 text-amber-600' :
                 'bg-[#D1FAE5] border-[#10B981] text-[#064E3B]'
               }`}>
                 {transaction.risk.status}
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#F0F7F4] rounded-lg p-4 border border-[#D1FAE5]">
                <div className="text-xs text-[#94A3B8] uppercase font-bold mb-2">Merchant</div>
                <div className="text-sm text-[#064E3B]">{transaction.merchantId}</div>
              </div>
              <div className="bg-[#F0F7F4] rounded-lg p-4 border border-[#D1FAE5]">
                <div className="text-xs text-[#94A3B8] uppercase font-bold mb-2">Channel</div>
                <div className="text-sm text-[#064E3B]">{transaction.details.channel}</div>
              </div>
              <div className="bg-[#F0F7F4] rounded-lg p-4 border border-[#D1FAE5]">
                <div className="text-xs text-[#94A3B8] uppercase font-bold mb-2">Location</div>
                <div className="text-sm text-[#064E3B]">{transaction.details.location_city}</div>
              </div>
              <div className="bg-[#F0F7F4] rounded-lg p-4 border border-[#D1FAE5]">
                <div className="text-xs text-[#94A3B8] uppercase font-bold mb-2">Amount</div>
                <div className="text-2xl font-bold text-[#064E3B]">₹{transaction.amount.toLocaleString()}</div>
              </div>
            </div>

            <div className="bg-[#F0F7F4] rounded-lg p-5 border border-[#D1FAE5]">
               <h3 className="text-sm font-bold text-[#94A3B8] uppercase tracking-wider mb-4 flex items-center gap-2">
                 <Lock className="w-4 h-4" />
                 Privacy Preservation Layer
               </h3>
               
               <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2 text-[#EF4444] text-xs uppercase font-bold">
                        <Unlock className="w-3 h-3" /> Raw PII (Local Only)
                    </div>
                    <div className="p-4 bg-[#FEF2F2] border border-[#FCA5A5] rounded-lg">
                        <div className="text-[10px] text-[#64748B] uppercase">User ID</div>
                        <div className="font-mono text-sm text-[#EF4444] break-all">{transaction.userId}</div>
                    </div>
                    <div className="p-4 bg-[#FEF2F2] border border-[#FCA5A5] rounded-lg">
                        <div className="text-[10px] text-[#64748B] uppercase">Merchant</div>
                        <div className="font-mono text-sm text-[#EF4444]">{transaction.merchantId}</div>
                    </div>
                  </div>

                  <div className="flex justify-center text-[#D1FAE5]">
                     <ArrowRight className="w-6 h-6" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2 text-[#10B981] text-xs uppercase font-bold">
                        <Lock className="w-3 h-3" /> Hashed (Transmitted)
                    </div>
                    <div className="p-4 bg-[#D1FAE5] border border-[#10B981] rounded-lg">
                        <div className="text-[10px] text-[#64748B] uppercase">Hash ID (SHA-256)</div>
                        <div className="font-mono text-xs text-[#064E3B] break-all">{transaction.hashedUserId}</div>
                    </div>
                    <div className="p-4 bg-[#D1FAE5] border border-[#10B981] rounded-lg">
                        <div className="text-[10px] text-[#64748B] uppercase">MCC Category</div>
                        <div className="font-mono text-sm text-[#064E3B]">{transaction.details.mcc}</div>
                    </div>
                  </div>
               </div>
            </div>

            <div className="bg-gradient-to-br from-[#F0F7F4] to-white rounded-lg p-5 border border-[#D1FAE5]">
                <h3 className="text-sm font-bold text-[#10B981] uppercase tracking-wider flex items-center gap-2 mb-3">
                    <BrainCircuit className="w-4 h-4" />
                    Risk Explanation
                </h3>
                <ul className="text-[#64748B] text-sm leading-relaxed border-l-2 border-[#10B981] pl-4 space-y-1">
                    {transaction.risk.reasons.map(reason => <li key={reason}>{reason}</li>)}
                </ul>
                {transaction.correlation && (
                  <p className={`mt-3 text-sm ${transaction.correlation.crossEntityRisk ? 'text-[#EF4444] font-bold' : 'text-[#94A3B8]'}`}>
                    Cross-bank: {transaction.correlation.reason} Aggregate score {transaction.correlation.aggregateScore}/100.
                  </p>
                )}
                <div className="mt-3 text-xs text-[#94A3B8]">
                  Risk Score: <span className={`font-bold ${
                    transaction.risk.score > 80 ? 'text-[#EF4444]' :
                    transaction.risk.score > 50 ? 'text-amber-500' : 'text-[#10B981]'
                  }`}>{transaction.risk.score}/100</span> • Method: {transaction.risk.scenario}
                </div>
            </div>
          </div>
        )}

        {activeTab === 'payload' && (
          <div className="relative h-full">
            <pre className="font-mono text-xs text-[#10B981] bg-[#F0F7F4] p-4 rounded-lg border border-[#D1FAE5] h-full overflow-auto shadow-inner">
              {JSON.stringify(sharedSignal, null, 2)}
            </pre>
            <div className="absolute top-2 right-2 flex flex-col items-end">
              <span className="text-[10px] text-[#94A3B8] uppercase font-bold tracking-wider mb-1">Status</span>
              <span className="text-xs text-[#10B981] font-mono">POST /v1/signals</span>
            </div>
          </div>
        )}

        {activeTab === 'raw' && isDevMode && (
           <div className="space-y-4">
              <div className="bg-[#FEF2F2] border border-[#FCA5A5] rounded-lg p-4 flex gap-3 items-start">
                  <Unlock className="w-5 h-5 text-[#EF4444] shrink-0 mt-0.5" />
                  <div>
                      <h3 className="text-[#EF4444] font-bold text-sm uppercase">Unencrypted Data Exposure</h3>
                      <p className="text-xs text-[#EF4444]/80 mt-1">
                          You are viewing the raw transaction object before it passes through the SHA-256 privacy layer. 
                          In a production environment, this data never leaves the secure memory of the local entity.
                      </p>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-[#F0F7F4] border border-[#D1FAE5]">
                      <div className="text-xs text-[#94A3B8] uppercase font-bold mb-2">User Identity (PII)</div>
                      <div className="font-mono text-sm text-[#10B981] break-all">{transaction.userId}</div>
                  </div>
                  <div className="p-4 rounded-lg bg-[#F0F7F4] border border-[#D1FAE5]">
                      <div className="text-xs text-[#94A3B8] uppercase font-bold mb-2">Merchant Identity</div>
                      <div className="font-mono text-sm text-amber-500">{transaction.merchantId}</div>
                  </div>
              </div>

              <div className="relative h-full">
                <div className="text-xs text-[#94A3B8] mb-2 uppercase font-bold">Full Transaction Object</div>
                <pre className="font-mono text-xs text-[#64748B] bg-[#F0F7F4] p-4 rounded-lg border border-[#D1FAE5] overflow-auto shadow-inner">
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
      return <ShieldAlert className="w-4 h-4 text-[#EF4444]" />;
    case TransactionStatus.REVIEW:
      return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    case TransactionStatus.APPROVE:
      return <CheckCircle className="w-4 h-4 text-[#10B981]" />;
    default:
      return <Activity className="w-4 h-4 text-[#94A3B8]" />;
  }
};

interface TransactionListProps {
  transactions: Transaction[];
  onSelect: (t: Transaction) => void;
  selectedId?: string;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onSelect, selectedId }) => {
  return (
    <div className="flex flex-col h-full bg-white border border-[#D1FAE5] rounded-xl overflow-hidden shadow-xl">
      <div className="p-4 border-b border-[#D1FAE5] flex justify-between items-center bg-[#F0F7F4]">
        <h3 className="font-bold text-[#94A3B8] uppercase text-xs tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#10B981]" />
          Live Transaction Feed
        </h3>
        <span className="text-xs text-[#94A3B8]">{transactions.length} events</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-2 relative">
        {transactions.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-[#94A3B8] text-sm">
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
                ? 'bg-[#F0F7F4] border-[#10B981] shadow-[0_0_10px_rgba(16,185,129,0.1)]' 
                : 'bg-white border-[#D1FAE5] hover:border-[#10B981] hover:bg-[#F0F7F4]'
              }
            `}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <StatusIcon status={tx.risk.status} />
                <span className={`font-mono text-sm font-medium ${
                    tx.risk.status === TransactionStatus.BLOCKED ? 'text-[#EF4444]' : 
                    tx.risk.status === TransactionStatus.REVIEW ? 'text-amber-500' : 'text-[#064E3B]'
                }`}>
                  {tx.risk.status}
                </span>
              </div>
              <span className="text-xs text-[#94A3B8] font-mono">
                {new Date(tx.timestamp).toLocaleTimeString()}
              </span>
            </div>
            
            <div className="flex justify-between items-end">
                <div>
                     <div className="text-xs text-[#94A3B8] mb-0.5 truncate max-w-[160px]">{tx.userId}</div>
                     <div className="text-xs text-[#94A3B8]">{tx.details.location_city} • {tx.details.channel}</div>
                </div>
                <div className="text-right">
                    <div className="font-mono text-sm text-[#064E3B]">
                        ₹{tx.amount.toLocaleString('en-IN')}
                    </div>
                    <div className={`text-[10px] uppercase font-bold tracking-wide ${
                        tx.risk.score > 80 ? 'text-[#EF4444]' : tx.risk.score > 50 ? 'text-amber-500' : 'text-[#10B981]'
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
const BankNode: React.FC<BankEntity> = ({ id, name }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(2000);
  const [error, setError] = useState('');

  const addTx = useCallback(async () => {
    try {
      const tx = await generateTransaction({ id, name });
      setError('');
      setTransactions(prev => [...prev, tx].slice(-40));
      if (!selectedTx) setSelectedTx(tx);
    } catch {
      setError('Cannot reach the Fin Sentinel server. Stream stopped.');
      setIsRunning(false);
    }
  }, [selectedTx, id, name]);

  useEffect(() => {
    let timer: any;
    if (isRunning) {
      timer = setInterval(addTx, speed);
    }
    return () => clearInterval(timer);
  }, [isRunning, speed, addTx]);

  return (
    <div className="min-h-screen bg-[#F0F7F4] text-[#64748B] p-6">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Zap className="text-[#10B981]" size={32} />
          <h1 className="text-3xl font-bold text-[#064E3B]">
            SENTINEL <span className="text-[#94A3B8]">| Fraud Intelligence Hub</span>
          </h1>
        </div>
        <p className="text-[#94A3B8] text-sm">
          {name} Simulation Node • Region: India (IN-WEST-1) • Privacy-First Architecture
        </p>
      </header>

      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl border border-[#D1FAE5]">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold uppercase tracking-wider text-sm transition-all ${
            isRunning
              ? 'bg-[#EF4444] hover:bg-red-600 text-white'
              : 'bg-[#10B981] hover:bg-[#059669] text-white'
          }`}
        >
          {isRunning ? <Pause size={18} /> : <Play size={18} />}
          {isRunning ? 'Stop Stream' : 'Start Stream'}
        </button>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-[#94A3B8] text-sm">Speed:</span>
            <select 
              value={speed} 
              onChange={e => setSpeed(Number(e.target.value))} 
              className="bg-white border border-[#D1FAE5] text-[#064E3B] text-sm rounded-lg px-3 py-2 outline-none focus:border-[#10B981] transition-colors"
            >
              <option value={5000}>Slow (5s)</option>
              <option value={2000}>Normal (2s)</option>
              <option value={500}>Fast (0.5s)</option>
            </select>
          </div>
          <button 
            onClick={() => { setTransactions([]); setSelectedTx(null); }} 
            className="p-2 text-[#94A3B8] hover:text-[#064E3B] transition-colors"
            title="Reset"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-[#FEF2F2] border border-[#FCA5A5] rounded-lg text-sm text-[#EF4444]">{error}</div>
      )}

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
      
      <div className="mt-6 text-center text-xs text-[#94A3B8]">
        <p>Simulation Environment • Simulated customers only • Only hashed identifiers and risk scores are shared between banks</p>
      </div>
    </div>
  );
};

export default BankNode;