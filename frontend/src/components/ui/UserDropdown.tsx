import { Link } from 'react-router-dom';
import { IconCode, IconEdit, IconLogout, IconTrash, IconUser } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import LogoutButton from '../LogoutButton';
import { getUserAvatar } from '../../utils/avatar';
import { type User } from '../../types';

/**
 * IconUser dropdown menu component for navbar
 */
const UserDropdown = ({
  authUser,
  isScrolled = false,
}: {
  authUser: User | null;
  isScrolled?: boolean;
}) => {
  const isAdmin = authUser?.role === 'ADMIN';

  const menuItemClass = "flex items-center gap-3 p-3 rounded-xl font-semibold transition-all duration-300 group";

  return (
    <div className="dropdown dropdown-end">
      <label
        tabIndex={0}
        className={`btn btn-ghost btn-circle avatar group transition-all duration-300 border border-transparent hover:border-base-content/10 hover:bg-base-content/5 ${
          isScrolled ? 'hover:scale-105' : 'hover:scale-110'
        }`}
      >
        <motion.div 
          className={`rounded-full ring-2 ring-base-content/10 group-hover:ring-primary/50 transition-all duration-300 p-0.5 ${
            isScrolled ? 'w-8 h-8' : 'w-9 h-9 md:w-10 md:h-10'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <img
            src={getUserAvatar(authUser)}
            alt="User Avatar"
            className="object-cover rounded-full w-full h-full"
          />
        </motion.div>
      </label>
      
      <ul
        tabIndex={0}
        className="menu menu-sm dropdown-content mt-3 z-[100] p-2 shadow-2xl bg-base-100/95 backdrop-blur-xl rounded-2xl w-64 space-y-1 border border-base-content/10"
      >
        {/* IconUser Info Header */}
        <li className="mb-2 px-2 pt-2">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-base-content/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-primary/20">
                <img
                  src={getUserAvatar(authUser)}
                  alt="User"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate text-base-content">
                  {authUser?.name}
                </p>
                <p className="text-xs text-base-content/60 truncate">
                  {authUser?.email}
                </p>
              </div>
            </div>
            {isAdmin && (
              <div className="mt-2 pt-2 border-t border-base-content/10">
                <span className="badge badge-primary badge-sm">Admin</span>
              </div>
            )}
          </div>
        </li>

        {/* Profile Link */}
        <li>
          <Link
            to="/profile"
            className={`${menuItemClass} hover:bg-primary/10 hover:text-primary`}
          >
            <IconUser className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
            My Profile
          </Link>
        </li>

        {/* Admin Section */}
        {isAdmin && (
          <>
            <div className="divider my-1 opacity-50 text-xs">Admin</div>
            <li>
              <Link
                to="/add-problem"
                className={`${menuItemClass} hover:bg-primary/10 hover:text-primary`}
              >
                <IconCode className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                Add Problem
              </Link>
            </li>
            <li>
              <Link
                to="/update-problem"
                className={`${menuItemClass} hover:bg-primary/10 hover:text-primary`}
              >
                <IconEdit className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                Update Problem
              </Link>
            </li>
            <li>
              <Link
                to="/delete-problem"
                className={`${menuItemClass} hover:bg-error/10 hover:text-error`}
              >
                <IconTrash className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                Delete Problem
              </Link>
            </li>
          </>
        )}

        {/* Logout */}
        <div className="divider my-1 opacity-50"></div>
        <li>
          <LogoutButton className={`${menuItemClass} hover:bg-error/10 hover:text-error w-full text-left`}>
            <IconLogout className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
            Logout
          </LogoutButton>
        </li>
      </ul>
    </div>
  );
};

export default UserDropdown;
