import React, { useState } from 'react';
import { Activity, DollarSign, Shield, AlertTriangle, Zap, Play, Database } from 'lucide-react';

const BankA = () => {
  const [isStreaming, setIsStreaming] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center gap-2">
            <Zap className="text-indigo-500" size={32} />
            <h1 className="text-3xl font-bold">
              SENTINEL <span className="text-slate-500">| Fraud Intelligence Hub</span>
            </h1>
          </div>
        </div>
        <p className="text-slate-400 text-sm">
          Local Bank Entity Simulation Node • Region: India (IN)
        </p>
      </header>

      {/* Control Bar */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => setIsStreaming(!isStreaming)}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
            isStreaming
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-emerald-600 hover:bg-emerald-700'
          }`}
        >
          <Play size={18} />
          {isStreaming ? 'Stop Stream' : 'Start Stream'}
        </button>
        <div className="flex items-center gap-3">
          <span className="text-slate-400 text-sm">Speed:</span>
          <span className="text-white font-semibold">Normal (2x)</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="text-blue-400" size={20} />
            <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">
              Total Transactions
            </span>
          </div>
          <div className="text-4xl font-bold">0</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="text-emerald-400" size={20} />
            <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">
              Volume Processed
            </span>
          </div>
          <div className="text-4xl font-bold">₹0.00L</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="text-amber-400" size={20} />
            <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">
              Flagged For Review
            </span>
          </div>
          <div className="text-4xl font-bold text-amber-400">0</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="text-red-400" size={20} />
            <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">
              Blocked Fraud
            </span>
          </div>
          <div className="text-4xl font-bold text-red-400">0</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Live Transaction Feed */}
        <div className="col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="text-blue-400" size={18} />
              <h2 className="text-lg font-bold uppercase tracking-wider">
                Live Transaction Feed
              </h2>
            </div>
            <span className="text-slate-500 text-sm">0 events</span>
          </div>
          <div className="h-96 flex items-center justify-center">
            <p className="text-slate-600 text-sm">Waiting for incoming stream...</p>
          </div>
        </div>

        {/* Transaction Details */}
        <div className="col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="h-full flex flex-col items-center justify-center">
            <Database className="text-slate-700 mb-4" size={64} />
            <p className="text-slate-500 text-center">
              Select a transaction from the live feed to inspect details and privacy hashing.
            </p>
          </div>
        </div>
      </div>

      {/* Real-Time Risk Velocity */}
      <div className="mt-6 bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-bold uppercase tracking-wider mb-4">
          Real-Time Risk Velocity
        </h2>
        <div className="h-48 flex items-center justify-center border-2 border-dashed border-slate-800 rounded-lg">
          <p className="text-slate-600">Chart will appear when stream is active</p>
        </div>
      </div>
    </div>
  );
};

export default BankA;