import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Phone, Calendar, User as UserIcon, Menu, X, LogOut, LayoutDashboard, CalendarCheck } from 'lucide-react';

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
    <header className="sticky top-0 z-50 bg-[#FAF9F5]/95 backdrop-blur-md border-b border-[#E7E5DC] transition-smooth">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Zone 1: Single text element wordmark */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-[#244B3A] group-hover:text-[#193529] transition-smooth whitespace-nowrap">
              NFYVE <span className="font-sans text-xs tracking-widest text-[#777A70] uppercase font-medium">· THE CHANGE</span>
            </span>
          </Link>

          {/* Zone 2: Clean text navigation links */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-[#244B3A] whitespace-nowrap py-1 relative ${
                  isActive(link.path)
                    ? 'text-[#244B3A] font-semibold after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#244B3A]'
                    : 'text-[#585B53]'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Zone 3: Actions - Phone, Book CTA, Account */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href="tel:+919000023050"
              className="hidden xl:flex items-center gap-1.5 text-xs font-medium text-[#585B53] hover:text-[#244B3A] px-2.5 py-1.5 rounded-md transition-colors"
              title="Call Begumpet Centre"
            >
              <Phone className="w-3.5 h-3.5 text-[#244B3A]" />
              <span className="tabular-nums">+91 9000023050</span>
            </a>

            <Link
              to="/book-appointment"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold tracking-wide uppercase text-white bg-[#244B3A] hover:bg-[#1a372a] rounded-lg shadow-sm hover:shadow transition-smooth whitespace-nowrap"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book Appointment</span>
            </Link>

            {/* Profile Dropdown / Login */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-[#244B3A] bg-[#F0EEE5] hover:bg-[#E6E3D8] border border-[#DDD9CE] rounded-lg transition-smooth"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span className="max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-[#E7E5DC] py-2 z-50">
                    <div className="px-4 py-2 border-b border-[#F0EEE5]">
                      <p className="text-xs font-semibold text-[#252923] truncate">{user.name}</p>
                      <p className="text-[11px] text-[#777A70] truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-medium uppercase tracking-wider text-[#244B3A]">
                        {user.role} Account
                      </span>
                    </div>

                    {user.role === 'customer' ? (
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
                    ) : user.role === 'staff' ? (
                      <Link
                        to="/staff"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#244B3A] hover:bg-[#FAF9F5]"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-[#244B3A]" />
                        Staff Workspace
                      </Link>
                    ) : (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#244B3A] hover:bg-[#FAF9F5]"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-[#244B3A]" />
                        Admin Console
                      </Link>
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
                className="px-3 py-1.5 text-xs font-medium text-[#244B3A] hover:text-[#193529] border border-[#244B3A]/30 hover:border-[#244B3A] rounded-lg transition-smooth whitespace-nowrap"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 sm:hidden">
            <Link
              to="/book-appointment"
              className="px-2.5 py-1.5 text-xs font-semibold text-white bg-[#244B3A] rounded-md"
            >
              Book
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#244B3A] hover:bg-[#F0EEE5] rounded-md focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E7E5DC] bg-[#FAF9F5] px-4 pt-3 pb-6 space-y-3">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive(link.path)
                    ? 'bg-[#F0EEE5] text-[#244B3A] font-semibold'
                    : 'text-[#585B53] hover:bg-[#F0EEE5]'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="pt-3 border-t border-[#E7E5DC] space-y-2">
            <a
              href="tel:+919000023050"
              className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#585B53]"
            >
              <Phone className="w-4 h-4 text-[#244B3A]" />
              <span className="tabular-nums">+91 9000023050 (Begumpet, Hyderabad)</span>
            </a>

            {user ? (
              <div className="space-y-1">
                {user.role === 'customer' ? (
                  <>
                    <Link
                      to="/account"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 text-xs font-medium text-[#244B3A] hover:bg-[#F0EEE5] rounded-md"
                    >
                      Account Profile ({user.name})
                    </Link>
                    <Link
                      to="/account/appointments"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 text-xs font-medium text-[#244B3A] hover:bg-[#F0EEE5] rounded-md"
                    >
                      My Appointments
                    </Link>
                  </>
                ) : user.role === 'staff' ? (
                  <Link
                    to="/staff"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-xs font-semibold text-[#244B3A] bg-[#F0EEE5] rounded-md"
                  >
                    Open Staff Workspace
                  </Link>
                ) : (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-xs font-semibold text-[#244B3A] bg-[#F0EEE5] rounded-md"
                  >
                    Open Admin Console
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-md"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full py-2 text-xs font-semibold text-[#244B3A] border border-[#244B3A] rounded-lg"
              >
                Customer & Staff Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
