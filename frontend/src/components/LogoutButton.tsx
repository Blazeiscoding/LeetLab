import { type ReactNode } from "react";
import { useAuthStore } from "../store/useAuthStore";

interface LogoutButtonProps {
  children: ReactNode;
  className?: string;
}

const LogoutButton = ({ children, className }: LogoutButtonProps) => {
  const { logout } = useAuthStore();
  const onLogout = async () => {
    await logout();
  };
  return (
    <button className={className ?? "btn btn-primary"} onClick={onLogout}>
      {children}
    </button>
  );
};

export default LogoutButton;
