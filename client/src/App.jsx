import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AiPlanner from "./pages/AiPlanner";
import DietLogs from "./pages/DietLogs";
import ManageDiseases from "./pages/ManageDiseases";
import ManageFoods from "./pages/ManageFoods";
import ManageDietLogs from "./pages/ManageDietLogs";

function PrivateRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) return <div className="spinner">Loading...</div>;
  return token ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { user, token, loading } = useAuth();
  if (loading) return <div className="spinner">Loading...</div>;
  if (!token) return <Navigate to="/login" />;
  if (user?.role !== "admin") return <Navigate to="/" />;
  return children;
}

function GuestRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) return <div className="spinner">Loading...</div>;
  return !token ? children : <Navigate to="/" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Guest routes */}
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

        {/* Protected routes */}
        <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/ai-planner" element={<AiPlanner />} />
          <Route path="/diet-logs" element={<DietLogs />} />

          {/* Admin only */}
          <Route path="/admin/diet-logs" element={<AdminRoute><ManageDietLogs /></AdminRoute>} />
          <Route path="/admin/diseases" element={<AdminRoute><ManageDiseases /></AdminRoute>} />
          <Route path="/admin/foods" element={<AdminRoute><ManageFoods /></AdminRoute>} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
