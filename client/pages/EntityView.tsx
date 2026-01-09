import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Building2, ShieldCheck, TrendingUp, Users } from 'lucide-react';

const EntityView: React.FC = () => {
  const navigate = useNavigate();

  const entities = [
    {
      name: 'Bank A',
      trustScore: 98,
      status: 'Active / Secure',
      volume: '₹1.2M',
      incidents: 4,
      color: 'bg-[#10B981]',
      description: 'Primary institutional partner handling international SWIFT transfers.',
      route: '/page-a',
    },
    {
      name: 'Bank B',
      trustScore: 85,
      status: 'Operational / Review',
      volume: '₹840K',
      incidents: 12,
      color: 'bg-[#10B981]',
      description: 'Regional retail node facilitating high-frequency local peer-to-peer payments.',
      route: '/page-b',
    },
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header>
          <h2 className="text-2xl font-bold text-[#064E3B] tracking-tight">
            Entity Collaboration
          </h2>
          <p className="text-[#64748B] text-sm mt-1">
            Cross-institutional trust scores and shared security telemetry.
          </p>
        </header>

        {/* Entity Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {entities.map((entity) => (
            <div
              key={entity.name}
              onClick={() => navigate(entity.route)}
              className="bg-[#FFFFFF] border border-[#D1FAE5] rounded-2xl overflow-hidden transition-colors hover:border-[#10B981] flex flex-col cursor-pointer"
            >
              <div className="p-8 space-y-6 flex-1">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-2xl ${entity.color} text-white`}>
                      <Building2 size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#064E3B]">
                        {entity.name}
                      </h3>
                      <span className="text-[10px] text-[#94A3B8] font-mono tracking-widest uppercase">
                        NODE_ID: 0x82{entity.name.split(' ')[1]}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-semibold text-[#64748B] uppercase tracking-widest block mb-1">
                      Trust Score
                    </span>
                    <span
                      className={`text-3xl font-bold ${
                        entity.trustScore > 90
                          ? 'text-[#10B981]'
                          : 'text-[#64748B]'
                      }`}
                    >
                      {entity.trustScore}%
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-[#64748B] text-sm leading-relaxed">
                  {entity.description}
                </p>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#F0F7F4] p-4 rounded-xl border border-[#D1FAE5]">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp size={14} className="text-[#10B981]" />
                      <span className="text-[10px] text-[#64748B] uppercase font-bold tracking-widest">
                        MTD Volume
                      </span>
                    </div>
                    <span className="text-lg font-bold text-[#064E3B]">
                      {entity.volume}
                    </span>
                  </div>

                  <div className="bg-[#F0F7F4] p-4 rounded-xl border border-[#D1FAE5]">
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldCheck size={14} className="text-[#EF4444]" />
                      <span className="text-[10px] text-[#64748B] uppercase font-bold tracking-widest">
                        Risk Incidents
                      </span>
                    </div>
                    <span className="text-lg font-bold text-[#064E3B]">
                      {entity.incidents}
                    </span>
                  </div>
                </div>

                {/* Stability */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#64748B] uppercase font-bold">
                      Network Stability
                    </span>
                    <span className="text-[#10B981] font-semibold">
                      99.9% Uptime
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-[#D1FAE5] rounded-full overflow-hidden">
                    <div className="h-full bg-[#10B981] w-[99.9%]" />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-[#D1FAE5] bg-[#F0F7F4] flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-[#64748B]" />
                  <span className="text-[10px] text-[#64748B] uppercase font-bold">
                    Shared Data: ON
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default EntityView;
