import React from "react";
import { User, Code, LogOut, Home, BookOpen, Trophy } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { Link, useLocation } from "react-router-dom";
import LogoutButton from "./LogoutButton";

const Navbar = () => {
  const { authUser } = useAuthStore();
  const location = useLocation();

  const isActive = (path) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  return (
    <nav className="sticky top-0 z-50 w-full py-5">
      <div className="flex w-full justify-between mx-auto max-w-6xl bg-black/15 shadow-lg shadow-neutral-600/5 backdrop-blur-lg border border-gray-200/10 p-4 rounded-2xl">
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-3 cursor-pointer">
          <img
            src="/CodingShastra.svg"
            className="h-10 w-10 bg-primary/20 text-primary border-none px-2 py-2 rounded-full"
            alt="LeetLab"
          />
          <span className="text-lg md:text-2xl font-bold tracking-tight text-white hidden md:block">
            LeetLab
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className={`btn btn-ghost btn-sm gap-2 ${
              isActive("/") && location.pathname === "/" ? "btn-active" : ""
            }`}
          >
            <Home className="w-4 h-4" />
            Home
          </Link>
          <Link
            to="/problems"
            className={`btn btn-ghost btn-sm gap-2 ${
              isActive("/problems") ? "btn-active" : ""
            }`}
          >
            <Code className="w-4 h-4" />
            Problems
          </Link>
          <Link
            to="/playlists"
            className={`btn btn-ghost btn-sm gap-2 ${
              isActive("/playlists") ? "btn-active" : ""
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Playlists
          </Link>
        </div>

        {/* User Profile and Dropdown */}
        <div className="flex items-center gap-4">
          <div className="dropdown dropdown-end">
            <label
              tabIndex={0}
              className="btn btn-ghost btn-circle avatar flex flex-row"
            >
              <div className="w-10 rounded-full">
                <img
                  src={
                    authUser?.image ||
                    "https://avatar.iran.liara.run/public/boy"
                  }
                  alt="User Avatar"
                  className="object-cover"
                />
              </div>
            </label>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52 space-y-3"
            >
              <li>
                <p className="text-base font-semibold">{authUser?.name}</p>
                <hr className="border-gray-200/10" />
              </li>
              <li>
                <Link
                  to="/profile"
                  className="hover:bg-primary hover:text-white text-base font-semibold"
                >
                  <User className="w-4 h-4 mr-2" />
                  My Profile
                </Link>
              </li>
              {authUser?.role === "ADMIN" && (
                <li>
                  <Link
                    to="/add-problem"
                    className="hover:bg-primary hover:text-white text-base font-semibold"
                  >
                    <Code className="w-4 h-4 mr-1" />
                    Add Problem
                  </Link>
                </li>
              )}
              <li>
                <LogoutButton className="hover:bg-primary hover:text-white">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </LogoutButton>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
