import React, { Suspense, lazy, useEffect } from "react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";
import CommandPalette from "./components/CommandPalette";
import Loader from "./components/Loader";
import ErrorBoundary from "./components/ErrorBoundary";

// Layout
import Layout from "./layout/Layout";

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center h-screen bg-base-100">
    <Loader size="xl" />
  </div>
);

// Lazy load all pages
const LoginPage = lazy(() => import("./page/LoginPage"));
const SignupPage = lazy(() => import("./page/SignupPage"));
const HomePage = lazy(() => import("./page/HomePage"));
const ProblemsPage = lazy(() => import("./page/ProblemsPage"));
const ProblemDetailPage = lazy(() => import("./page/ProblemDetailPage"));
const ProfilePage = lazy(() => import("./page/ProfilePage"));
const PlaylistsPage = lazy(() => import("./page/PlaylistsPage"));
const PlaylistDetailPage = lazy(() => import("./page/PlaylistDetailPage"));
const UpdatePlaylist = lazy(() => import("./page/UpdatePlaylist"));
const AddProblem = lazy(() => import("./page/AddProblem"));
const DeleteProblem = lazy(() => import("./page/DeleteProblem"));
const UpdateProblem = lazy(() => import("./page/UpdateProblem"));
const LeaderboardPage = lazy(() => import("./page/LeaderboardPage"));

// Lazy load components
const ProtectedRoute = lazy(() => import("./components/ProtectedRoute"));
const AdminRoute = lazy(() => import("./components/AdminRoute"));

function AppContent() {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const { initTheme } = useThemeStore();
  const location = useLocation();

  // Initialize theme on mount
  useEffect(() => {
    initTheme();
  }, [initTheme]);

  React.useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) {
    return <PageLoader />;
  }

  return (
    <div
      className="App min-h-screen bg-base-100 text-base-content font-sans transition-colors duration-300"
    >
      {/* Global Command Palette */}
      <CommandPalette />
      
      <Suspense fallback={<PageLoader />}>
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
            <Route element={<ErrorBoundary><Layout /></ErrorBoundary>}>
              <Route path="/" element={<HomePage />} />
              <Route path="/problems" element={<ProblemsPage />} />
              <Route path="/problems/:id" element={
                <ErrorBoundary minimal>
                  <ProblemDetailPage />
                </ErrorBoundary>
              } />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/playlists" element={<PlaylistsPage />} />
              <Route path="/playlists/:id" element={<PlaylistDetailPage />} />
              <Route path="/playlists/:id/edit" element={<UpdatePlaylist />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />

              {/* Admin Routes */}
              <Route element={<AdminRoute />}>
                <Route path="/add-problem" element={<AddProblem />} />
                <Route path="/update-problem" element={<UpdateProblem />} />
                <Route path="/delete-problem" element={<DeleteProblem />} />
              </Route>
            </Route>
          </Route>

          {/* Catch all */}
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
      </Suspense>

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
      <SpeedInsights />
    </div>
  );
}

function App() {
  return <AppContent />;
}

export default App;
