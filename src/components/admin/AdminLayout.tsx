import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { SystemNotification } from '../../types';
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
  Bell,
  CheckCircle2,
  UserCheck,
  ChevronDown,
  Building2,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { FirebaseSetupNotice } from '../common/FirebaseSetupNotice';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);

  useEffect(() => {
    api.getNotifications().then(setNotifications).catch(console.error);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    notifications.forEach(n => {
      if (!n.read) api.markNotificationRead(n.id);
    });
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const navSections = [
    {
      title: 'Analytics & Overview',
      items: [
        { name: 'Dashboard Overview', path: '/admin', icon: <LayoutDashboard className="w-4 h-4" /> },
        { name: 'Sales & Revenue Analytics', path: '/admin/analytics', icon: <TrendingUp className="w-4 h-4" /> },
      ]
    },
    {
      title: 'Sanctuary Operations',
      items: [
        { name: 'Appointments Register', path: '/admin/appointments', icon: <CalendarCheck className="w-4 h-4" /> },
        { name: 'Customer Dossiers', path: '/admin/customers', icon: <Users className="w-4 h-4" /> },
        { name: 'Staff Management', path: '/admin/staff', icon: <UserCheck className="w-4 h-4" /> },
        { name: 'Services & Pricing', path: '/admin/services', icon: <Sparkles className="w-4 h-4" /> },
      ]
    },
    {
      title: 'Governance & Inbox',
      items: [
        { name: 'Contact Inquiries', path: '/admin/inquiries', icon: <Inbox className="w-4 h-4" /> },
        { name: 'Review Moderation', path: '/admin/reviews', icon: <Star className="w-4 h-4" /> },
        { name: 'Sanctuary Settings', path: '/admin/settings', icon: <Settings className="w-4 h-4" /> },
      ]
    }
  ];

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F8F7F2] flex flex-col">
      
      {/* Top Navigation Bar in Deep Forest Green with Gold Accents */}
      <header className="sticky top-0 z-50 bg-[#214D3B] text-white shadow-md border-b border-[#1b3e30]">
        <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Left: Mobile hamburger & Brand */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 text-white/90 hover:text-white hover:bg-[#2c654e] rounded-lg transition-colors"
                aria-label="Toggle navigation drawer"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <Link to="/admin" className="flex items-center gap-2 group">
                <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white">
                  NFYVE <span className="font-sans text-[10px] tracking-widest text-[#D4AF37] uppercase font-semibold">· ADMIN PORTAL</span>
                </span>
              </Link>
            </div>

            {/* Right: Quick actions, notifications, user dropdown */}
            <div className="flex items-center gap-3 sm:gap-4">
              
              {/* Back to public site */}
              <Link
                to="/"
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white/90 hover:text-white bg-[#285d47] hover:bg-[#307056] border border-white/15 transition-smooth"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Public Sanctuary</span>
              </Link>

              {/* Notification icon with unread badge */}
              <div className="relative">
                <button
                  onClick={() => {
                    setNotificationsOpen(!notificationsOpen);
                    setProfileDropdownOpen(false);
                  }}
                  className="p-2 text-white/90 hover:text-white hover:bg-[#2c654e] rounded-lg relative transition-colors"
                  aria-label="View notifications"
                >
                  <Bell className="w-4 h-4 text-white" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#D4AF37] ring-2 ring-[#214D3B]" />
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-[#E7E5DC] py-2 z-50 text-[#252923]">
                    <div className="px-4 py-2.5 border-b border-[#F0EEE5] flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-serif text-sm font-semibold text-[#214D3B]">
                          Sanctuary Alerts
                        </span>
                        {unreadCount > 0 && (
                          <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-[#214D3B] text-white rounded">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="text-[11px] text-[#2E6B50] font-medium hover:underline"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-[#F0EEE5]">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-3 text-xs transition-colors ${notif.read ? 'bg-white' : 'bg-[#F4F9F6]'}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-semibold text-[#214D3B]">{notif.title}</p>
                            <span className="text-[10px] text-[#777A70] whitespace-nowrap">{notif.time}</span>
                          </div>
                          <p className="text-[#585B53] text-[11px] mt-0.5 leading-relaxed">{notif.message}</p>
                          {notif.link && (
                            <Link
                              to={notif.link}
                              onClick={() => setNotificationsOpen(false)}
                              className="inline-block mt-1 text-[11px] font-semibold text-[#2E6B50] hover:underline"
                            >
                              Review Details →
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* User profile dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setProfileDropdownOpen(!profileDropdownOpen);
                    setNotificationsOpen(false);
                  }}
                  className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-[#2c654e] transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[#D4AF37] text-[#214D3B] font-serif font-bold text-xs flex items-center justify-center shadow-xs">
                    {user?.name.charAt(0) || 'A'}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-semibold text-white leading-tight truncate max-w-[120px]">
                      {user?.name.split(' ')[0]}
                    </p>
                    <p className="text-[10px] text-[#D4AF37] font-medium uppercase tracking-wider">
                      Administrator
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-white/80" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-[#E7E5DC] py-2 z-50 text-[#252923]">
                    <div className="px-4 py-2.5 border-b border-[#F0EEE5]">
                      <p className="text-xs font-semibold text-[#214D3B] truncate">{user?.name}</p>
                      <p className="text-[11px] text-[#777A70] truncate">{user?.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider text-[#D4AF37] bg-[#214D3B] px-2 py-0.5 rounded">
                        Full Administrator
                      </span>
                    </div>

                    <Link
                      to="/admin/settings"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#252923] hover:bg-[#F8F7F2]"
                    >
                      <Settings className="w-3.5 h-3.5 text-[#2E6B50]" />
                      <span>Account & Sanctuary Settings</span>
                    </Link>

                    <Link
                      to="/staff"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#214D3B] font-semibold hover:bg-[#F8F7F2]"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Switch to Practitioner Portal</span>
                    </Link>

                    <Link
                      to="/"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#252923] hover:bg-[#F8F7F2]"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-[#2E6B50]" />
                      <span>View Public Website</span>
                    </Link>

                    <div className="border-t border-[#F0EEE5] mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-700 hover:bg-red-50 text-left font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5 text-red-600" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      </header>

      {/* Main Layout Area: Sidebar + Viewport */}
      <div className="flex-1 flex max-w-[1700px] w-full mx-auto">
        
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-[#E7E5DC] flex flex-col justify-between transition-transform duration-300 lg:static lg:translate-x-0 pt-16 lg:pt-0 ${
            sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
          }`}
        >
          <div className="p-4 space-y-6 flex-1 overflow-y-auto">
            {navSections.map((sec, secIdx) => (
              <div key={secIdx} className="space-y-1">
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#777A70] mb-2">
                  {sec.title}
                </p>
                {sec.items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-smooth ${
                      isActive(item.path)
                        ? 'bg-[#214D3B] text-white shadow-sm font-semibold'
                        : 'text-[#484B43] hover:bg-[#F0EEE5] hover:text-[#214D3B]'
                    }`}
                  >
                    <span className={isActive(item.path) ? 'text-[#D4AF37]' : 'text-[#2E6B50]'}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.name}</span>
                  </Link>
                ))}
              </div>
            ))}
          </div>

          {/* Sidebar bottom location card */}
          <div className="p-4 border-t border-[#F0EEE5] bg-[#F8F7F2] m-3 rounded-xl border border-[#E7E5DC]">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#214D3B]">
              <Building2 className="w-3.5 h-3.5 text-[#2E6B50]" />
              <span>Begumpet Sanctuary</span>
            </div>
            <p className="text-[11px] text-[#777A70] mt-0.5">
              4th Floor, Kura Towers · Hyderabad
            </p>
            <div className="flex items-center gap-1.5 mt-2 text-[10px] text-emerald-800 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Operational Systems Online</span>
            </div>
          </div>
        </aside>

        {/* Main Content Viewport */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-4">
          <FirebaseSetupNotice />
          {children}
        </main>

      </div>

    </div>
  );
};
