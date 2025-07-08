import React, { useEffect } from "react";
import { Analytics } from "@vercel/analytics/react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/useAuthStore";
import { Loader } from "lucide-react";

// Layout
import Layout from "./layout/Layout";

// Auth Pages
import LoginPage from "./page/LoginPage";
import SignupPage from "./page/SignupPage";

// Main Pages
import HomePage from "./page/HomePage";
import { ProblemsPage } from "./page/ProblemsPage";
import ProblemDetailPage from "./page/ProblemDetailPage";
import ProfilePage from "./page/ProfilePage";
import PlaylistsPage from "./page/PlaylistsPage";
import PlaylistDetailPage from "./page/PlaylistDetailPage";
import AddProblem from "./page/AddProblem";
import DeleteProblem from "./page/DeleteProblem";
import UpdateProblem from "./page/UpdateProblem";

// Components
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

function AppContent() {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Show loading screen while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen bg-base-100">
        <div className="text-center">
          <Loader className="size-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-base-content/60">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App min-h-screen bg-base-100">
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            !authUser ? (
              <LoginPage />
            ) : (
              <Navigate 
                to={location.state?.from?.pathname || "/"} 
                replace 
                state={{ from: location.state?.from }}
              />
            )
          }
        />
        <Route
          path="/signup"
          element={
            !authUser ? (
              <SignupPage />
            ) : (
              <Navigate 
                to={location.state?.from?.pathname || "/"} 
                replace 
                state={{ from: location.state?.from }}
              />
            )
          }
        />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/problems" element={<ProblemsPage />} />
            <Route path="/problems/:id" element={<ProblemDetailPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/playlists" element={<PlaylistsPage />} />
            <Route path="/playlists/:id" element={<PlaylistDetailPage />} />

            {/* Admin Routes */}
            <Route element={<AdminRoute />}>
              <Route path="/add-problem" element={<AddProblem />} />
              <Route path="/update-problem" element={<UpdateProblem />} />
              <Route path="/delete-problem" element={<DeleteProblem />} />
            </Route>
          </Route>
        </Route>

        {/* Catch all route - redirect to home if authenticated, login if not */}
        <Route 
          path="*" 
          element={
            authUser ? (
              <Navigate to="/" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
      </Routes>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "var(--fallback-b1,oklch(var(--b1)))",
            color: "var(--fallback-bc,oklch(var(--bc)))",
            border: "1px solid var(--fallback-b3,oklch(var(--b3)))",
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: "var(--fallback-su,oklch(var(--su)))",
              secondary: "var(--fallback-suc,oklch(var(--suc)))",
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: "var(--fallback-er,oklch(var(--er)))",
              secondary: "var(--fallback-erc,oklch(var(--erc)))",
            },
          },
        }}
      />
      <Analytics />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;