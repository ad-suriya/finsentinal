import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  AlertTriangle, 
  ShieldCheck, 
  Activity, 
  Building2,
  Cpu,
  LogOut,
  Globe
} from 'lucide-react';
import AIAssistant from './AIAssistant';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: AlertTriangle, label: 'Threat Center', path: '/alerts' },
    { icon: Building2, label: 'Entity Hub', path: '/entities' },
    { icon: Cpu, label: 'Simulation', path: '/simulation' },
  ];

  return (
    <div className="flex h-screen bg-[#FFFFFF] text-[#064E3B] overflow-hidden relative">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[#D1FAE5] flex flex-col bg-[#F0F7F4]">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-[#10B981] p-2 rounded-lg">
            <ShieldCheck size={24} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-[#064E3B]">
            VVFNT_<span className="text-[#10B981]">02</span>
          </span>
        </div>

        <nav className="px-4 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                ${
                  isActive
                    ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20'
                    : 'text-[#64748B] hover:text-[#064E3B] hover:bg-[#FFFFFF]'
                }
              `}
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-[#D1FAE5]">
          <div className="flex items-center gap-3 px-4 py-3 mb-4 bg-[#FFFFFF] rounded-xl border border-[#D1FAE5]">
            <div className="w-8 h-8 rounded-full bg-[#F0F7F4] flex items-center justify-center text-[10px] font-bold border border-[#D1FAE5] text-[#10B981]">
              {user?.role === 'Admin' ? 'AD' : 'AN'}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-medium truncate text-[#064E3B]">
                {user?.email || 'User'}
              </span>
              <span className="text-[9px] text-[#64748B] uppercase tracking-widest">
                {user?.role || 'Analyst'}
              </span>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 w-full rounded-lg text-xs font-semibold text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
          >
            <LogOut size={14} />
            Terminate Session
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative bg-[#FFFFFF]">
        <header className="h-16 border-b border-[#D1FAE5] flex items-center justify-between px-8 bg-[#F0F7F4] z-10">
          <div className="flex items-center gap-4">
            <Globe className="text-[#10B981]" size={16} />
            <div className="flex flex-col">
              <h1 className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest">
                Global Protocol Status
              </h1>
              <span className="text-xs font-semibold text-[#064E3B]">
                Synchronized • Cloud-Native
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 px-4 py-1.5 bg-[#FFFFFF] rounded-full border border-[#D1FAE5]">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                <span className="text-[9px] text-[#10B981] font-mono font-bold">
                  API_SYNC: OK
                </span>
              </div>
              <div className="w-px h-3 bg-[#D1FAE5]"></div>
              <Activity className="text-[#10B981]" size={10} />
            </div>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-8 relative bg-[#FFFFFF]">
          {children}
        </section>

        <AIAssistant />
      </main>
    </div>
  );
};

export default Layout;
