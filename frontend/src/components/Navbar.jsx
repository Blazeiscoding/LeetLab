import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Code,
  BookOpen,
  Trophy,
  Menu,
  X,
  Sun,
  Moon,
  Trash2,
  Edit,
  User,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
import { getUserAvatar } from '../utils/avatar';
import LogoutButton from './LogoutButton';

// Navigation links
const NAV_LINKS = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/problems', label: 'Problems', icon: Code },
  { path: '/playlists', label: 'Playlists', icon: BookOpen },
  { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
];

const ADMIN_LINKS = [
  { path: '/add-problem', label: 'Add Problem', icon: Code },
  { path: '/update-problem', label: 'Update Problem', icon: Edit },
  { path: '/delete-problem', label: 'Delete Problem', icon: Trash2, danger: true },
];

/**
 * Simple scroll detection hook with debounce
 */
const useScrolled = (threshold = 20) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let timeoutId = null;
    
    const handleScroll = () => {
      if (timeoutId) return;
      
      timeoutId = setTimeout(() => {
        setIsScrolled(window.scrollY > threshold);
        timeoutId = null;
      }, 50); // 50ms debounce
    };

    // Initial check
    setIsScrolled(window.scrollY > threshold);

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [threshold]);

  return isScrolled;
};

/**
 * Navigation link component
 */
const NavLink = ({ to, label, icon: Icon }) => {
  const location = useLocation();
  
  const isActive = () => {
    if (to === '/') return location.pathname === '/';
    return location.pathname === to || location.pathname.startsWith(to + '/');
  };

  const active = isActive();

  return (
    <Link
      to={to}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
        active
          ? 'text-primary bg-primary/10'
          : 'text-base-content/70 hover:text-base-content hover:bg-base-content/5'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </Link>
  );
};

/**
 * Mobile menu
 */
const MobileMenu = ({ isOpen, onClose, authUser }) => {
  const location = useLocation();
  
  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-base-300/80 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-20 left-4 right-4 bg-base-100 rounded-2xl shadow-xl z-50 lg:hidden border border-base-content/10 overflow-hidden"
          >
            {/* User info */}
            <div className="p-4 bg-base-200/50 border-b border-base-content/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <img
                    src={getUserAvatar(authUser)}
                    alt="User"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{authUser?.name}</p>
                  <p className="text-xs text-base-content/60 truncate">{authUser?.email}</p>
                </div>
              </div>
            </div>

            {/* Nav links */}
            <div className="p-2">
              {NAV_LINKS.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                    isActive(path)
                      ? 'bg-primary text-primary-content'
                      : 'text-base-content/70 hover:bg-base-200'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </Link>
              ))}

              {authUser?.role === 'ADMIN' && (
                <>
                  <div className="my-2 px-4">
                    <div className="h-px bg-base-content/10" />
                    <p className="text-xs font-semibold text-base-content/40 uppercase mt-3 mb-1">
                      Admin
                    </p>
                  </div>
                  {ADMIN_LINKS.map(({ path, label, icon: Icon, danger }) => (
                    <Link
                      key={path}
                      to={path}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors text-base-content/70 ${
                        danger ? 'hover:bg-error/10 hover:text-error' : 'hover:bg-base-200'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {label}
                    </Link>
                  ))}
                </>
              )}
            </div>

            {/* Logout */}
            <div className="p-2 border-t border-base-content/5">
              <LogoutButton className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium w-full text-left text-error hover:bg-error/10 transition-colors">
                <LogOut className="w-5 h-5" />
                Sign Out
              </LogoutButton>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

/**
 * Main Navbar with scroll-based styling
 * Uses CSS-only transitions with will-change for smooth performance
 */
const Navbar = () => {
  const { authUser } = useAuthStore();
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const isScrolled = useScrolled(30);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <nav 
        className="sticky top-0 z-50 w-full py-3 md:py-4"
        style={{ willChange: 'auto' }}
      >
        <div 
          className={`
            flex items-center justify-between mx-auto max-w-7xl px-4
            bg-base-100/90 backdrop-blur-lg border border-base-content/5
            transition-[padding,border-radius,box-shadow] duration-300 ease-out
            ${isScrolled 
              ? 'py-2 px-4 rounded-xl shadow-md' 
              : 'py-3 px-5 rounded-2xl shadow-sm'
            }
          `}
          style={{ willChange: 'padding, border-radius, box-shadow' }}
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5" onClick={closeMobileMenu}>
            <div 
              className={`
                bg-primary/10 rounded-lg flex items-center justify-center
                transition-[padding] duration-300 ease-out
                ${isScrolled ? 'p-1.5' : 'p-2'}
              `}
            >
              <img
                src="/CodingShastra.svg"
                className={`transition-[width,height] duration-300 ease-out ${isScrolled ? 'h-5 w-5' : 'h-6 w-6'}`}
                alt="CodingShastra"
              />
            </div>
            <span 
              className={`
                font-bold hidden sm:block
                transition-[font-size] duration-300 ease-out
                ${isScrolled ? 'text-base' : 'text-lg'}
              `}
            >
              CodingShastra
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map(({ path, label, icon }) => (
              <NavLink key={path} to={path} label={label} icon={icon} />
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="btn btn-ghost btn-circle btn-sm"
              title={theme === 'night' ? 'Light mode' : 'Dark mode'}
            >
              {theme === 'night' ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600" />
              )}
            </button>

            {/* User dropdown - Desktop */}
            <div className="dropdown dropdown-end hidden md:block">
              <label tabIndex={0} className="cursor-pointer">
                <div className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-base-200/50 hover:bg-base-200 transition-colors border border-base-content/5">
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    <img
                      src={getUserAvatar(authUser)}
                      alt="User"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-sm font-medium max-w-[80px] truncate">
                    {authUser?.name?.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-base-content/60" />
                </div>
              </label>
              
              <ul tabIndex={0} className="dropdown-content mt-2 z-[100] p-2 shadow-lg bg-base-100 rounded-xl w-56 border border-base-content/10">
                <li className="px-3 py-2 border-b border-base-content/5 mb-1">
                  <p className="font-bold text-sm truncate">{authUser?.name}</p>
                  <p className="text-xs text-base-content/60 truncate">{authUser?.email}</p>
                </li>
                
                <li>
                  <Link to="/profile" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-base-200 transition-colors">
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">Profile</span>
                  </Link>
                </li>

                {authUser?.role === 'ADMIN' && (
                  <>
                    <div className="my-1 h-px bg-base-content/10" />
                    <li>
                      <Link to="/add-problem" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-base-200 transition-colors">
                        <Code className="w-4 h-4" />
                        <span className="text-sm font-medium">Add Problem</span>
                      </Link>
                    </li>
                    <li>
                      <Link to="/update-problem" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-base-200 transition-colors">
                        <Edit className="w-4 h-4" />
                        <span className="text-sm font-medium">Update Problem</span>
                      </Link>
                    </li>
                    <li>
                      <Link to="/delete-problem" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-error/10 text-error transition-colors">
                        <Trash2 className="w-4 h-4" />
                        <span className="text-sm font-medium">Delete Problem</span>
                      </Link>
                    </li>
                  </>
                )}

                <div className="my-1 h-px bg-base-content/10" />
                <li>
                  <LogoutButton className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-error/10 text-error transition-colors w-full text-left">
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-medium">Sign Out</span>
                  </LogoutButton>
                </li>
              </ul>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="btn btn-ghost btn-circle btn-sm lg:hidden"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
        authUser={authUser}
      />
    </>
  );
};

export default Navbar;
