
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, Users } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('admin@vvfnt.tech');
  const [password, setPassword] = useState('********');
  const [role, setRole] = useState<'Admin' | 'Analyst'>('Admin');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Dummy Auth logic
    localStorage.setItem('token', 'dummy-jwt-token-vvfnt');
    localStorage.setItem('user', JSON.stringify({ email, role }));
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-10">
          <div className="bg-primary p-4 rounded-2xl mb-4 shadow-2xl shadow-primary/20">
            <ShieldCheck size={48} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">VVFNT_<span className="text-primary">02</span></h1>
          <p className="text-muted mt-2 text-sm font-medium uppercase tracking-[0.2em]">Anti-Fraud Infrastructure</p>
        </div>

        <div className="bg-surface border border-border p-8 rounded-2xl backdrop-blur-xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg py-3 pl-10 pr-4 text-primary-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-muted/50"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg py-3 pl-10 pr-4 text-primary-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-muted/50"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Operational Role</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <select 
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full bg-background border border-border rounded-lg py-3 pl-10 pr-4 text-primary-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none"
                >
                  <option value="Admin">System Administrator</option>
                  <option value="Analyst">Financial Analyst</option>
                </select>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-4 rounded-lg transition-all transform active:scale-[0.98] shadow-lg shadow-primary/20"
            >
              Initialize Command Center
            </button>
          </form>
        </div>

        <div className="mt-8 text-center">
          <p className="text-muted text-[10px] uppercase tracking-widest font-mono">
            Secure Session Gateway // Level 4 Encrypted
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
