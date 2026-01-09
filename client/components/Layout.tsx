
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
import ApiMonitor from './ApiMonitor';

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
    <div className="flex h-screen bg-background text-primary-text overflow-hidden relative">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border flex flex-col bg-surface/50 backdrop-blur-xl">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-primary p-2 rounded-lg shadow-lg shadow-primary/20">
            <ShieldCheck size={24} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">VVFNT_<span className="text-primary">02</span></span>
        </div>

        <nav className="px-4 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                ${isActive 
                  ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm' 
                  : 'text-muted hover:text-primary-text hover:bg-surface'}
              `}
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <ApiMonitor />

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-4 py-3 mb-4 bg-surface rounded-xl border border-border/50">
            <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center text-[10px] font-bold border border-border text-primary">
              {user?.role === 'Admin' ? 'AD' : 'AN'}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-medium truncate text-primary-text">{user?.email || 'User'}</span>
              <span className="text-[9px] text-muted uppercase tracking-widest">{user?.role || 'Analyst'}</span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 w-full rounded-lg text-xs font-semibold text-critical hover:bg-critical/10 hover:text-red-300 transition-colors"
          >
            <LogOut size={14} />
            Termination Session
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
        <header className="h-16 border-b border-border flex items-center justify-between px-8 bg-surface/50 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <Globe className="text-secondary animate-pulse" size={16} />
            <div className="flex flex-col">
              <h1 className="text-[10px] font-bold text-muted uppercase tracking-widest">Global Protocol Status</h1>
              <span className="text-xs font-semibold text-secondary-text">Synchronized // Cloud-Native</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 px-4 py-1.5 bg-surface rounded-full border border-border">
               <div className="flex items-center gap-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-success shadow-[0_0_8px_#22c55e]"></span>
                 <span className="text-[9px] text-success font-mono font-bold">API_SYNC: OK</span>
               </div>
               <div className="w-px h-3 bg-muted/50"></div>
               <div className="flex items-center gap-2">
                 <Activity className="text-primary" size={10} />
                 <span className="text-[9px] text-muted font-mono">LATENCY: 42ms</span>
               </div>
            </div>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
          {children}
        </section>
        
        <AIAssistant />
      </main>
    </div>
  );
};

export default Layout;
