
import React from 'react';
import Layout from '../components/Layout';
import { Building2, ShieldCheck, TrendingUp, Users, ExternalLink } from 'lucide-react';

const EntityView: React.FC = () => {
  const entities = [
    {
      name: "Bank A",
      trustScore: 98,
      status: "Active / Secure",
      volume: "₹1.2M",
      incidents: 4,
      color: "bg-indigo-600",
      description: "Primary institutional partner handling international SWIFT transfers."
    },
    {
      name: "Bank B",
      trustScore: 85,
      status: "Operational / Review",
      volume: "₹840K",
      incidents: 12,
      color: "bg-emerald-600",
      description: "Regional retail node facilitating high-frequency local peer-to-peer payments."
    }
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-8">
        <header>
          <h2 className="text-2xl font-bold text-white tracking-tight">Entity Collaboration</h2>
          <p className="text-slate-400 text-sm mt-1">Cross-institutional trust scores and shared security telemetry.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {entities.map((entity) => (
            <div key={entity.name} className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all flex flex-col">
              <div className="p-8 space-y-6 flex-1">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-2xl ${entity.color} text-white`}>
                      <Building2 size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{entity.name}</h3>
                      <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">NODE_ID: 0x82{entity.name.split(' ')[1]}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest block mb-1">Trust Score</span>
                    <span className={`text-3xl font-bold ${entity.trustScore > 90 ? 'text-emerald-500' : 'text-amber-500'}`}>{entity.trustScore}%</span>
                  </div>
                </div>

                <p className="text-slate-400 text-sm leading-relaxed">{entity.description}</p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp size={14} className="text-indigo-400" />
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">MTD Volume</span>
                    </div>
                    <span className="text-lg font-bold text-white">{entity.volume}</span>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldCheck size={14} className="text-rose-400" />
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Risk Incidents</span>
                    </div>
                    <span className="text-lg font-bold text-white">{entity.incidents}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 uppercase font-bold">Network Stability</span>
                    <span className="text-emerald-500">99.9% Uptime</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[99.9%]"></div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-slate-500" />
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Shared Data: ON</span>
                </div>
                <button className="text-indigo-400 hover:text-indigo-300 text-xs font-bold flex items-center gap-1 transition-colors">
                  Detailed Audit <ExternalLink size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-indigo-600/5 border border-indigo-600/10 p-8 rounded-2xl flex flex-col md:flex-row items-center gap-8">
           <div className="shrink-0">
             <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center border-4 border-slate-950 shadow-2xl shadow-indigo-600/20">
               <ShieldCheck size={40} className="text-white" />
             </div>
           </div>
           <div className="flex-1 space-y-2">
             <h4 className="text-lg font-bold text-white">Privacy-First Data Sharing</h4>
             <p className="text-slate-400 text-sm leading-relaxed">
               VVFNT_<span className="text-indigo-500">02</span> uses Zero-Knowledge Proofs to verify transaction patterns between Bank A and Bank B without exposing raw customer data. Both entities benefit from a shared threat intelligence pool while maintaining 100% data sovereignty.
             </p>
           </div>
           <button className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-lg whitespace-nowrap transition-colors">
             Configure Protocols
           </button>
        </div>
      </div>
    </Layout>
  );
};

export default EntityView;
