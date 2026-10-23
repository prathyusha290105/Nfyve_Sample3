import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Building2, 
  Calendar, 
  CalendarCheck, 
  UserPlus, 
  CheckSquare, 
  Stethoscope, 
  Sparkles, 
  CreditCard, 
  ClockAlert, 
  Search, 
  LogOut, 
  Menu, 
  X, 
  LayoutDashboard,
  Users
} from 'lucide-react';

export const FrontDeskLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Operations Overview', path: '/front-desk', icon: LayoutDashboard },
    { name: '5-Room Schedule Grid', path: '/front-desk/calendar', icon: Calendar },
    { name: 'Walk-in Registration', path: '/front-desk/walk-in', icon: UserPlus },
    { name: 'Check-in Queue', path: '/front-desk/check-in', icon: CheckSquare },
    { name: 'Doctor Consultations', path: '/front-desk/consultations', icon: Stethoscope },
    { name: 'Session Completion', path: '/front-desk/sessions', icon: Sparkles },
    { name: 'Billing & Invoices', path: '/front-desk/billing', icon: CreditCard },
    { name: 'Payment Follow-ups', path: '/front-desk/payment-follow-ups', icon: ClockAlert },
  ];

  const isActive = (path: string) => {
    if (path === '/front-desk' && location.pathname === '/front-desk') return true;
    if (path !== '/front-desk' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] flex flex-col lg:flex-row text-[#252923]">
      
      {/* Mobile Top Bar */}
      <header className="lg:hidden bg-[#1E3B2E] text-white p-4 flex items-center justify-between sticky top-0 z-40 border-b border-[#2A5140]">
        <Link to="/front-desk" className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-[#E6EEE7]" />
          <span className="font-serif font-bold text-lg tracking-wide">NFYVE <span className="font-sans text-xs font-normal text-[#A8B8A0]">FRONT DESK</span></span>
        </Link>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
          className="p-1.5 rounded-lg text-white hover:bg-white/10"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-[#1E3B2E] text-white flex flex-col justify-between transition-transform duration-300 ease-in-out border-r border-[#2A5140]
        lg:static lg:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo & Portal Badge */}
          <div className="p-6 border-b border-[#2A5140]">
            <Link to="/" className="inline-block group">
              <span className="font-serif text-2xl font-bold tracking-tight text-white">
                NFYVE <span className="font-sans text-[10px] tracking-widest text-[#A8B8A0] uppercase font-medium">· THE CHANGE</span>
              </span>
            </Link>
            <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#244B3A] text-xs font-medium text-[#E6EEE7] border border-[#34634E]">
              <Building2 className="w-3.5 h-3.5" />
              <span>Front Desk Console</span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const active = isActive(item.path);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                    active
                      ? 'bg-[#2A5140] text-white font-semibold shadow-xs'
                      : 'text-[#C5C9BF] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-[#E6EEE7]' : 'text-[#A8B8A0]'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User profile & Cross Workspace Switcher */}
          <div className="p-4 border-t border-[#2A5140] space-y-3 bg-[#183327]">
            <div className="flex items-center justify-between">
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">{user?.name || 'Reception Lead'}</p>
                <p className="text-[11px] text-[#A8B8A0] truncate">{user?.email}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="p-1.5 text-[#C5C9BF] hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Workspace Switch if Admin */}
            {user?.role === 'admin' && (
              <div className="pt-2 border-t border-white/10 flex items-center gap-2 text-[11px]">
                <span className="text-[#A8B8A0]">Switch:</span>
                <Link to="/admin" className="text-white hover:underline">Admin</Link>
                <span className="text-white/30">·</span>
                <Link to="/call-center" className="text-white hover:underline">Call Center</Link>
                <span className="text-white/30">·</span>
                <Link to="/staff" className="text-white hover:underline">Staff</Link>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {children}
      </main>

    </div>
  );
};
