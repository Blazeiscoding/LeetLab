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
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { Link, useLocation } from "react-router-dom";
import LogoutButton from "./LogoutButton";

const Navbar = () => {
  const { authUser } = useAuthStore();
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
  ];

  return (
    <nav className="sticky top-0 z-50 w-full py-3 md:py-5">
      <div className="flex w-full justify-between items-center mx-auto max-w-7xl bg-black/20 shadow-xl shadow-neutral-600/10 backdrop-blur-xl border border-gray-200/20 p-3 md:p-4 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-neutral-600/15">
        {/* Logo Section */}
        <Link
          to="/"
          className="flex items-center gap-3 cursor-pointer group transition-transform duration-200 hover:scale-105"
          onClick={closeMobileMenu}
        >
          <div className="relative">
            <img
              src="/CodingShastra.svg"
              className="h-8 w-8 md:h-10 md:w-10 bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/20 px-2 py-2 rounded-xl transition-all duration-300 group-hover:rotate-12 group-hover:bg-primary/40"
              alt="CodingShastra"
            />
            <div className="absolute inset-0 bg-primary/20 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
          </div>
          <span className="text-lg md:text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent hidden sm:block group-hover:from-primary group-hover:to-primary-light transition-all duration-300">
            CodingShastra
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-2">
          {navLinks.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`group relative px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 hover:scale-105 ${
                isActive(path) && (path !== "/" || location.pathname === "/")
                  ? "bg-primary/20 text-primary border border-primary/30 shadow-lg shadow-primary/20"
                  : "text-gray-300 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20"
              }`}
            >
              <Icon className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
              <span className="text-sm font-semibold">{label}</span>
              {isActive(path) &&
                (path !== "/" || location.pathname === "/") && (
                  <div className="absolute inset-0 bg-primary/10 rounded-xl blur-sm -z-10"></div>
                )}
            </Link>
          ))}
        </div>

        {/* Right Side - User Profile and Mobile Menu */}
        <div className="flex items-center gap-3">
          {/* User Profile Dropdown */}
          <div className="dropdown dropdown-end">
            <label
              tabIndex={0}
              className="btn btn-ghost btn-circle avatar group hover:scale-105 transition-all duration-300 border border-transparent hover:border-white/20 hover:bg-white/10"
            >
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full ring-2 ring-transparent group-hover:ring-primary/50 transition-all duration-300">
                <img
                  src={
                    authUser?.image ||
                    "https://avatar.iran.liara.run/public/boy"
                  }
                  alt="User Avatar"
                  className="object-cover rounded-full"
                />
              </div>
            </label>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 z-[1] p-3 shadow-2xl bg-base-100/95 backdrop-blur-xl rounded-2xl w-56 space-y-2 border border-gray-200/20"
            >
              <li className="mb-2">
                <div className="p-2 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5">
                  <p className="text-base font-bold text-white truncate">
                    {authUser?.name}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {authUser?.email}
                  </p>
                </div>
              </li>
              <li>
                <Link
                  to="/profile"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/20 hover:text-primary text-base font-semibold transition-all duration-300 group"
                >
                  <User className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                  My Profile
                </Link>
              </li>
              {authUser?.role === "ADMIN" && (
                <>
                  <li>
                    <Link
                      to="/add-problem"
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/20 hover:text-primary text-base font-semibold transition-all duration-300 group"
                    >
                      <Code className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                      Add Problem
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/update-problem"
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/20 hover:text-primary text-base font-semibold transition-all duration-300 group"
                    >
                      <Edit className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                      Update Problem
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/delete-problem"
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/20 hover:text-red-400 text-base font-semibold transition-all duration-300 group"
                    >
                      <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                      Delete Problem
                    </Link>
                  </li>
                </>
              )}
              <li className="pt-2 border-t border-gray-200/10">
                <LogoutButton className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/20 hover:text-red-400 text-base font-semibold transition-all duration-300 group w-full text-left">
                  <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                  Logout
                </LogoutButton>
              </li>
            </ul>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden btn btn-ghost btn-circle hover:bg-white/10 border border-transparent hover:border-white/20 transition-all duration-300"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-white" />
            ) : (
              <Menu className="w-5 h-5 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={closeMobileMenu}
          ></div>
          <div className="fixed top-20 left-4 right-4 bg-base-100/95 backdrop-blur-xl border border-gray-200/20 rounded-2xl shadow-2xl z-50 lg:hidden">
            <div className="p-4 space-y-2">
              {navLinks.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={closeMobileMenu}
                  className={`flex items-center gap-3 p-4 rounded-xl font-semibold transition-all duration-300 ${
                    isActive(path) &&
                    (path !== "/" || location.pathname === "/")
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "text-gray-300 hover:text-white hover:bg-white/10 border border-transparent"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </Link>
              ))}

              {/* Admin options in mobile menu */}
              {authUser?.role === "ADMIN" && (
                <>
                  <div className="border-t border-gray-200/10 pt-2 mt-2">
                    <p className="text-xs text-gray-400 px-4 py-2">
                      Admin Panel
                    </p>
                  </div>
                  <Link
                    to="/add-problem"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 p-4 rounded-xl font-semibold transition-all duration-300 text-gray-300 hover:text-white hover:bg-white/10 border border-transparent"
                  >
                    <Code className="w-5 h-5" />
                    Add Problem
                  </Link>
                  <Link
                    to="/update-problem"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 p-4 rounded-xl font-semibold transition-all duration-300 text-gray-300 hover:text-white hover:bg-white/10 border border-transparent"
                  >
                    <Edit className="w-5 h-5" />
                    Update Problem
                  </Link>
                  <Link
                    to="/delete-problem"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 p-4 rounded-xl font-semibold transition-all duration-300 text-gray-300 hover:text-red-400 hover:bg-red-500/10 border border-transparent"
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
