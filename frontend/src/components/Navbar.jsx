import React, { useState } from 'react';
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
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
import useScrollPosition from '../hooks/useScrollPosition';
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
 * Clean navigation link
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
      className={`relative flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
        active
          ? 'text-primary bg-primary/10'
          : 'text-base-content/70 hover:text-base-content hover:bg-base-content/5'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
      {active && (
        <motion.div
          layoutId="activeTab"
          className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full"
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
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
 * Main Navbar
 */
const Navbar = () => {
  const { authUser } = useAuthStore();
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { isScrolled } = useScrollPosition(10);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <nav className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled ? 'py-2' : 'py-3 md:py-4'
      }`}>
        <div className={`flex items-center justify-between mx-auto max-w-7xl px-4 transition-all duration-300 ${
          isScrolled
            ? 'bg-base-100/95 backdrop-blur-lg shadow-sm border border-base-content/5 rounded-xl py-2 px-4'
            : 'bg-base-100/80 backdrop-blur-md border border-base-content/5 rounded-2xl py-3 px-5'
        }`}>
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group" onClick={closeMobileMenu}>
            <div className={`bg-primary/10 rounded-lg flex items-center justify-center transition-all ${
              isScrolled ? 'p-1.5' : 'p-2'
            }`}>
              <img
                src="/CodingShastra.svg"
                className={`transition-all ${isScrolled ? 'h-5 w-5' : 'h-6 w-6'}`}
                alt="CodingShastra"
              />
            </div>
            <span className={`font-bold hidden sm:block transition-all ${
              isScrolled ? 'text-base' : 'text-lg'
            }`}>
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
              className={`btn btn-ghost btn-circle ${isScrolled ? 'btn-sm' : ''}`}
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
                <div className={`flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-base-200/50 hover:bg-base-200 transition-colors border border-base-content/5 ${
                  isScrolled ? 'py-0.5 pr-2' : ''
                }`}>
                  <div className={`rounded-full overflow-hidden ${isScrolled ? 'w-7 h-7' : 'w-8 h-8'}`}>
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
              className={`btn btn-ghost btn-circle lg:hidden ${isScrolled ? 'btn-sm' : ''}`}
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
