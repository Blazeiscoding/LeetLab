import React, { useEffect } from "react";
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

// Components
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

function AppContent() {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Only show loading screen if we're checking auth AND we don't have user data yet
  if (isCheckingAuth && authUser === null) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  return (
    <div className="App">
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            !authUser ? (
              <LoginPage />
            ) : (
              <Navigate to={location.state?.from || "/"} replace />
            )
          }
        />
        <Route
          path="/signup"
          element={
            !authUser ? (
              <SignupPage />
            ) : (
              <Navigate to={location.state?.from || "/"} replace />
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
              <Route path="/delete-problem" element={<DeleteProblem />} />
            </Route>
          </Route>
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "var(--fallback-b1,oklch(var(--b1)))",
            color: "var(--fallback-bc,oklch(var(--bc)))",
          },
        }}
      />
    </div>
  );
}

function App() {
  return <AppContent />;
}

export default App;
