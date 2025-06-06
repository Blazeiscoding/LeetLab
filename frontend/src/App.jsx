import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from "react";
import toast from "react-hot-toast";

// Import all your authentication pages
import LoginPage from "./page/LoginPage";
import SignupPage from "./page/SignupPage";

// Import your protected components
import ProfilePage from "./page/ProfilePage";
import { ProblemsPage } from "./page/ProblemsPage";
import HomePage from "./page/HomePage";

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-base-100">
    <div className="flex flex-col items-center gap-4">
      <span className="loading loading-spinner loading-lg text-primary"></span>
      <p className="text-base-content/60">Loading...</p>
    </div>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { authUser, isCheckingAuth } = useAuthStore();

  if (isCheckingAuth) {
    return <LoadingSpinner />;
  }

  if (!authUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Route Component (redirect authenticated users)
const PublicRoute = ({ children }) => {
  const { authUser, isCheckingAuth } = useAuthStore();
  const location = useLocation();

  if (isCheckingAuth) {
    return <LoadingSpinner />;
  }

  // If user is authenticated, redirect to home
  if (authUser) {
    return <Navigate to="/" replace />;
  }

  // Show success message if coming from signup
  useEffect(() => {
    if (location.state?.message) {
      toast.success(location.state.message);
      // Clear the state to prevent showing message again
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  return children;
};

// App Routes Component
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <SignupPage />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/problems"
        element={
          <ProtectedRoute>
            <ProblemsPage />
          </ProtectedRoute>
        }
      />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  const { checkAuth, isCheckingAuth, authUser } = useAuthStore();

  // Check authentication status on app load
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Show loading spinner while checking auth
  if (isCheckingAuth) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-base-100">
      <AppRoutes />
    </div>
  );
}

export default App;
