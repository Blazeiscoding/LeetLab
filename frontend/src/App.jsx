import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import HomePage from "./page/HomePage";
import LoginPage from "./page/LoginPage";
import SignupPage from "./page/SignupPage";
import { useAuthStore } from "./store/useAuthStore";
import { Loader } from "lucide-react";
import AddProblem from "./page/AddProblem";
import AdminRoute from "./components/AdminRoute";
import Layout from "./layout/Layout";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  const location = useLocation();

  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-start">
      <Toaster />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route
            index
            element={authUser ? <HomePage /> : <Navigate to={"/login"} />}
          />
          {/* Add the missing route for AddProblem inside Layout */}
          <Route element={<AdminRoute />}>
            <Route path="/add-problem" element={<AddProblem />} />
          </Route>
        </Route>

        <Route
          path="/login"
          element={
            !authUser ? (
              <LoginPage />
            ) : (
              <Navigate to={location.state?.from?.pathname || "/"} replace />
            )
          }
        />
        <Route
          path="/signup"
          element={!authUser ? <SignupPage /> : <Navigate to="/" />}
        />
      </Routes>
    </div>
  );
};

export default App;
