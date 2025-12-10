import React, { useState } from "react";
import {
  User,
  Code,
  LogOut,
  Home,
  BookOpen,
  Trophy,
  Menu,
  X,
  Trash2,
  Edit,
  Sun,
  Moon,
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import { Link, useLocation } from "react-router-dom";
import LogoutButton from "./LogoutButton";

const Navbar = () => {
  const { authUser } = useAuthStore();
  const { toggleTheme, isDarkTheme } = useThemeStore();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { path: "/", label: "Home", icon: Home },
    { path: "/problems", label: "Problems", icon: Code },
    { path: "/playlists", label: "Playlists", icon: BookOpen },
    { path: "/leaderboard", label: "Leaderboard", icon: Trophy },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full py-3 md:py-5">
      <div className="flex w-full justify-between items-center mx-auto max-w-7xl bg-base-100/80 shadow-lg backdrop-blur-xl border border-base-content/5 p-3 md:p-4 rounded-2xl transition-all duration-300">
        {/* Logo Section */}
        <Link
          to="/"
          className="flex items-center gap-3 cursor-pointer group transition-transform duration-200 hover:scale-105"
          onClick={closeMobileMenu}
        >
          <div className="relative">
            <img
              src="/CodingShastra.svg"
              className="h-8 w-8 md:h-10 md:w-10 bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 px-2 py-2 rounded-xl transition-all duration-300 group-hover:rotate-12 group-hover:bg-primary/20"
              alt="CodingShastra"
            />
            <div className="absolute inset-0 bg-primary/20 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
          </div>
          <span className="text-lg md:text-2xl font-black tracking-tight bg-gradient-to-r from-base-content to-base-content/60 bg-clip-text text-transparent hidden sm:block group-hover:from-primary group-hover:to-primary/70 transition-all duration-300">
            CodingShastra
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`group relative px-4 py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 hover:scale-105 ${
                isActive(path) && (path !== "/" || location.pathname === "/")
                  ? "bg-primary text-primary-content shadow-lg shadow-primary/25"
                  : "text-base-content/70 hover:text-base-content hover:bg-base-content/5"
              }`}
            >
              <Icon className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
              <span className="text-sm font-bold">{label}</span>
            </Link>
          ))}
        </div>

        {/* Right Side - Theme Toggle, User Profile and Mobile Menu */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle Button - Simple Light/Dark switch */}
          <button
            onClick={toggleTheme}
            className="btn btn-ghost btn-circle hover:bg-base-content/5 transition-all duration-300"
            title={isDarkTheme() ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkTheme() ? (
              <Sun className="w-5 h-5 text-warning" />
            ) : (
              <Moon className="w-5 h-5 text-primary" />
            )}
          </button>

          {/* User Profile Dropdown */}
          <div className="dropdown dropdown-end">
            <label
              tabIndex={0}
              className="btn btn-ghost btn-circle avatar group hover:scale-105 transition-all duration-300 border border-transparent hover:border-base-content/10 hover:bg-base-content/5"
            >
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-full ring-2 ring-base-content/10 group-hover:ring-primary/50 transition-all duration-300 p-0.5">
                <img
                  src={
                    authUser?.image ||
                    "https://avatar.iran.liara.run/public/boy"
                  }
                  alt="User Avatar"
                  className="object-cover rounded-full w-full h-full"
                />
              </div>
            </label>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow-2xl bg-base-100/95 backdrop-blur-xl rounded-2xl w-60 space-y-1 border border-base-content/10"
            >
              <li className="mb-2 px-2 pt-2">
                <div className="p-3 rounded-xl bg-base-200/50 border border-base-content/5">
                  <p className="text-sm font-bold truncate text-base-content">
                    {authUser?.name}
                  </p>
                  <p className="text-xs text-base-content/60 truncate">
                    {authUser?.email}
                  </p>
                </div>
              </li>
              <li>
                <Link
                  to="/profile"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/10 hover:text-primary font-semibold transition-all duration-300 group"
                >
                  <User className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                  My Profile
                </Link>
              </li>
              {authUser?.role === "ADMIN" && (
                <>
                  <div className="divider my-1 opacity-50"></div>
                  <li>
                    <Link
                      to="/add-problem"
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/10 hover:text-primary font-semibold transition-all duration-300 group"
                    >
                      <Code className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                      Add Problem
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/update-problem"
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/10 hover:text-primary font-semibold transition-all duration-300 group"
                    >
                      <Edit className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                      Update Problem
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/delete-problem"
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-error/10 hover:text-error font-semibold transition-all duration-300 group"
                    >
                      <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                      Delete Problem
                    </Link>
                  </li>
                </>
              )}
              <div className="divider my-1 opacity-50"></div>
              <li>
                <LogoutButton className="flex items-center gap-3 p-3 rounded-xl hover:bg-error/10 hover:text-error font-semibold transition-all duration-300 group w-full text-left">
                  <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                  Logout
                </LogoutButton>
              </li>
            </ul>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden btn btn-ghost btn-circle hover:bg-base-content/5 transition-all duration-300"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-base-content" />
            ) : (
              <Menu className="w-6 h-6 text-base-content" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={closeMobileMenu}
          ></div>
          <div className="fixed top-24 left-4 right-4 bg-base-100/95 backdrop-blur-xl border border-base-content/10 rounded-2xl shadow-2xl z-50 lg:hidden overflow-hidden">
            <div className="p-2 space-y-1">
              {navLinks.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={closeMobileMenu}
                  className={`flex items-center gap-3 p-4 rounded-xl font-bold transition-all duration-300 ${
                    isActive(path) &&
                    (path !== "/" || location.pathname === "/")
                      ? "bg-primary text-primary-content shadow-md"
                      : "text-base-content/70 hover:text-base-content hover:bg-base-content/5"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </Link>
              ))}

              {/* Admin options in mobile menu */}
              {authUser?.role === "ADMIN" && (
                <>
                  <div className="divider my-2 opacity-50"></div>
                  <p className="text-xs font-bold text-base-content/40 px-4 py-2 uppercase tracking-wider">
                    Admin Panel
                  </p>
                  <Link
                    to="/add-problem"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 p-4 rounded-xl font-medium transition-all duration-300 text-base-content/70 hover:text-base-content hover:bg-base-content/5"
                  >
                    <Code className="w-5 h-5" />
                    Add Problem
                  </Link>
                  <Link
                    to="/update-problem"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 p-4 rounded-xl font-medium transition-all duration-300 text-base-content/70 hover:text-base-content hover:bg-base-content/5"
                  >
                    <Edit className="w-5 h-5" />
                    Update Problem
                  </Link>
                  <Link
                    to="/delete-problem"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 p-4 rounded-xl font-medium transition-all duration-300 text-base-content/70 hover:text-error hover:bg-error/10"
                  >
                    <Trash2 className="w-5 h-5" />
                    Delete Problem
                  </Link>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;
