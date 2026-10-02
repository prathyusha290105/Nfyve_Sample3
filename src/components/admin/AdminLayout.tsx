import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  CalendarCheck, 
  Users, 
  Sparkles, 
  TrendingUp, 
  Inbox, 
  Star, 
  Settings, 
  LogOut, 
  ExternalLink,
  Menu,
  X,
  UserCheck
} from 'lucide-react';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard Overview', path: '/admin', icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: 'Sales & Revenue Analytics', path: '/admin/analytics', icon: <TrendingUp className="w-4 h-4" /> },
    { name: 'Appointments Table', path: '/admin/appointments', icon: <CalendarCheck className="w-4 h-4" /> },
    { name: 'Customer Database', path: '/admin/customers', icon: <Users className="w-4 h-4" /> },
    { name: 'Services & Pricing', path: '/admin/services', icon: <Sparkles className="w-4 h-4" /> },
    { name: 'Contact Inquiries', path: '/admin/inquiries', icon: <Inbox className="w-4 h-4" /> },
    { name: 'Review Moderation', path: '/admin/reviews', icon: <Star className="w-4 h-4" /> },
    { name: 'Business Settings', path: '/admin/settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] flex flex-col lg:flex-row">
      
      {/* Mobile Top Bar */}
      <div className="lg:hidden bg-white border-b border-[#E7E5DC] p-4 flex items-center justify-between">
        <Link to="/admin" className="font-serif text-lg font-semibold text-[#244B3A]">
          NFYVE <span className="font-sans text-[10px] text-[#777A70] uppercase">Admin</span>
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-[#244B3A] hover:bg-[#F0EEE5] rounded-md"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-[#E7E5DC] flex flex-col justify-between transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Brand header */}
          <div className="p-6 border-b border-[#F0EEE5]">
            <Link to="/admin" className="block">
              <span className="font-serif text-2xl font-bold tracking-tight text-[#244B3A]">
                NFYVE
              </span>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#777A70] mt-0.5">
                Staff & Admin Console
              </p>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-smooth ${
                  isActive(item.path)
                    ? 'bg-[#244B3A] text-white shadow-xs font-semibold'
                    : 'text-[#585B53] hover:bg-[#F0EEE5] hover:text-[#252923]'
                }`}
              >
                {item.icon}
                <span className="truncate">{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* User profile & Actions */}
          <div className="p-4 border-t border-[#F0EEE5] space-y-3 bg-[#FAF9F5]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#E5E2D6] text-[#244B3A] font-serif font-semibold text-xs flex items-center justify-center">
                {user?.name.charAt(0) || 'A'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-[#252923] truncate">{user?.name}</p>
                <p className="text-[10px] text-[#777A70] uppercase font-medium">{user?.role} Access</p>
              </div>
            </div>

            <div className="pt-2 border-t border-[#E7E5DC] flex flex-col gap-1 text-xs">
              <Link
                to="/"
                className="flex items-center gap-2 text-[#585B53] hover:text-[#244B3A] py-1 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>View Public Website</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-700 hover:text-red-900 py-1 transition-colors text-left"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {children}
      </main>

    </div>
  );
};
