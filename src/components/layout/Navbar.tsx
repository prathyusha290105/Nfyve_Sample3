import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Phone, 
  Calendar, 
  User as UserIcon, 
  Menu, 
  X, 
  LogOut, 
  LayoutDashboard, 
  CalendarCheck,
  Headphones,
  Building2,
  Sparkles
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Why Us', path: '/why-choose-us' },
    { name: 'Reviews', path: '/reviews' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-[#1E3B2E] text-white shadow-md border-b border-[#2A5140] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Zone 1: Brand Wordmark */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <span className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-white group-hover:text-[#E6EEE7] transition-colors whitespace-nowrap">
              NFYVE <span className="font-sans text-[11px] tracking-widest text-[#A8B8A0] uppercase font-medium">· THE CHANGE</span>
            </span>
          </Link>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium tracking-wide transition-colors whitespace-nowrap py-1 relative ${
                    active
                      ? 'text-[#FAF9F5] font-semibold after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#D4AF37]'
                      : 'text-[#D0D9D3] hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Zone 3: Actions - Phone, Enquire CTA, Profile / Console */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href="tel:+919000023050"
              className="hidden xl:flex items-center gap-1.5 text-xs font-medium text-[#D0D9D3] hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
              title="Call Begumpet Centre Concierge"
            >
              <Phone className="w-3.5 h-3.5 text-[#A8B8A0]" />
              <span className="tabular-nums font-medium">+91 9000023050</span>
            </a>

            {/* Direct Call to Enquire CTA Button */}
            <a
              href="tel:+919000023050"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold tracking-wider uppercase text-[#1E3B2E] bg-[#FAF9F5] hover:bg-[#F0EDE4] active:bg-[#E6EEE7] rounded-lg shadow-sm hover:shadow transition-all whitespace-nowrap"
            >
              <Phone className="w-3.5 h-3.5 text-[#1E3B2E]" />
              <span>Call to Enquire</span>
            </a>

            {/* Profile Dropdown / Login */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-[#2A5140] hover:bg-[#34634E] border border-[#3E7059] rounded-lg transition-colors shadow-xs"
                >
                  <UserIcon className="w-3.5 h-3.5 text-[#A8B8A0]" />
                  <span className="max-w-[110px] truncate">{user.name.split(' ')[0]}</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] uppercase font-semibold bg-white/10 text-[#E6EEE7]">
                    {user.role === 'call_center' ? 'Call Ctr' : user.role === 'front_desk' ? 'Desk' : user.role}
                  </span>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-xl border border-[#E7E5DC] py-2 z-50 text-[#252923]">
                    <div className="px-4 py-2.5 border-b border-[#F0EEE5]">
                      <p className="text-xs font-semibold text-[#252923] truncate">{user.name}</p>
                      <p className="text-[11px] text-[#777A70] truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider text-[#1E3B2E] bg-[#E6EEE7] px-2 py-0.5 rounded">
                        {user.role.replace('_', ' ')} portal
                      </span>
                    </div>

                    {user.role === 'call_center' ? (
                      <Link
                        to="/call-center"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#1E3B2E] hover:bg-[#FAF9F5]"
                      >
                        <Headphones className="w-4 h-4 text-[#1E3B2E]" />
                        Call Center Workspace
                      </Link>
                    ) : user.role === 'front_desk' ? (
                      <Link
                        to="/front-desk"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#1E3B2E] hover:bg-[#FAF9F5]"
                      >
                        <Building2 className="w-4 h-4 text-[#1E3B2E]" />
                        Front Desk Console
                      </Link>
                    ) : user.role === 'admin' ? (
                      <>
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#1E3B2E] hover:bg-[#FAF9F5]"
                        >
                          <LayoutDashboard className="w-4 h-4 text-[#1E3B2E]" />
                          Admin Console
                        </Link>
                        <Link
                          to="/front-desk"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs text-[#252923] hover:bg-[#FAF9F5]"
                        >
                          <Building2 className="w-4 h-4 text-[#585B53]" />
                          Front Desk Reception
                        </Link>
                        <Link
                          to="/call-center"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs text-[#252923] hover:bg-[#FAF9F5]"
                        >
                          <Headphones className="w-4 h-4 text-[#585B53]" />
                          Call Center Console
                        </Link>
                      </>
                    ) : user.role === 'staff' ? (
                      <Link
                        to="/staff"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#1E3B2E] hover:bg-[#FAF9F5]"
                      >
                        <LayoutDashboard className="w-4 h-4 text-[#1E3B2E]" />
                        Staff Workspace
                      </Link>
                    ) : (
                      <>
                        <Link
                          to="/account"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs text-[#252923] hover:bg-[#FAF9F5]"
                        >
                          <UserIcon className="w-3.5 h-3.5 text-[#777A70]" />
                          My Profile
                        </Link>
                        <Link
                          to="/account/appointments"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs text-[#252923] hover:bg-[#FAF9F5]"
                        >
                          <CalendarCheck className="w-3.5 h-3.5 text-[#777A70]" />
                          My Appointments
                        </Link>
                      </>
                    )}

                    <div className="border-t border-[#F0EEE5] mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-700 hover:bg-red-50 text-left"
                      >
                        <LogOut className="w-3.5 h-3.5 text-red-600" />
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="px-3.5 py-2 text-xs font-semibold text-white hover:text-white bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg transition-colors whitespace-nowrap"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex items-center gap-2 sm:hidden">
            <a
              href="tel:+919000023050"
              className="px-3 py-1.5 text-xs font-bold text-[#1E3B2E] bg-[#FAF9F5] rounded-md shadow-xs"
            >
              Enquire
            </a>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-white hover:bg-white/10 rounded-md focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#2A5140] bg-[#183428] px-4 pt-3 pb-6 space-y-3">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-[#2A5140] text-white font-semibold'
                    : 'text-[#D0D9D3] hover:text-white hover:bg-white/5'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="pt-3 border-t border-[#2A5140] space-y-2">
            <a
              href="tel:+919000023050"
              className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#E6EEE7] bg-white/5 rounded-lg"
            >
              <Phone className="w-4 h-4 text-[#A8B8A0]" />
              <span className="tabular-nums font-semibold">+91 9000023050 (Begumpet, Hyderabad)</span>
            </a>

            {user ? (
              <div className="space-y-1 pt-1">
                {user.role === 'call_center' ? (
                  <Link
                    to="/call-center"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-xs font-semibold text-white bg-[#2A5140] rounded-lg"
                  >
                    Open Call Center Console
                  </Link>
                ) : user.role === 'front_desk' ? (
                  <Link
                    to="/front-desk"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-xs font-semibold text-white bg-[#2A5140] rounded-lg"
                  >
                    Open Front Desk Console
                  </Link>
                ) : user.role === 'admin' ? (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-xs font-semibold text-white bg-[#2A5140] rounded-lg"
                  >
                    Open Admin Console
                  </Link>
                ) : user.role === 'staff' ? (
                  <Link
                    to="/staff"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-xs font-semibold text-white bg-[#2A5140] rounded-lg"
                  >
                    Open Staff Workspace
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/account"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 text-xs font-medium text-[#E6EEE7] hover:bg-white/5 rounded-lg"
                    >
                      Account Profile ({user.name})
                    </Link>
                    <Link
                      to="/account/appointments"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 text-xs font-medium text-[#E6EEE7] hover:bg-white/5 rounded-lg"
                    >
                      My Appointments
                    </Link>
                  </>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-red-300 hover:bg-white/5 rounded-lg"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full py-2.5 text-xs font-semibold text-white bg-[#2A5140] hover:bg-[#34634E] rounded-lg border border-[#3E7059]"
              >
                Sign In to Sanctuary Console
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
