import { Navigate, Route, Routes } from "react-router-dom";
import AdminLogin from "./pages/admin/Login.jsx";
import AdminDashboard from "./pages/admin/Dashboard.jsx";
import Coaches from "./pages/admin/Coaches.jsx";
import CreateCoach from "./pages/admin/CreateCoach.jsx";
import DailyContent from "./pages/admin/DailyContent.jsx";
import Workouts from "./pages/admin/Workouts.jsx";
import Meals from "./pages/admin/Meals.jsx";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";

const PrivateRoute = ({ children, allowedRole }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/admin/login" replace />;
  if (allowedRole && user.role !== allowedRole) return <Navigate to="/admin/login" replace />;
  return children;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/admin/login" element={<AdminLogin />} />
    <Route
      path="/admin"
      element={
        <PrivateRoute allowedRole="superadmin">
          <AdminDashboard />
        </PrivateRoute>
      }
    />
    <Route
      path="/admin/coaches"
      element={
        <PrivateRoute allowedRole="superadmin">
          <Coaches />
        </PrivateRoute>
      }
    />
    <Route
      path="/admin/coaches/create"
      element={
        <PrivateRoute allowedRole="superadmin">
          <CreateCoach />
        </PrivateRoute>
      }
    />
    <Route
      path="/admin/daily-content"
      element={
        <PrivateRoute allowedRole="superadmin">
          <DailyContent />
        </PrivateRoute>
      }
    />
    <Route
      path="/admin/workouts"
      element={
        <PrivateRoute allowedRole="superadmin">
          <Workouts />
        </PrivateRoute>
      }
    />
    <Route
      path="/admin/meals"
      element={
        <PrivateRoute allowedRole="superadmin">
          <Meals />
        </PrivateRoute>
      }
    />
    <Route path="*" element={<Navigate to="/admin/login" replace />} />
  </Routes>
);

const App = () => (
  <AuthProvider>
    <AppRoutes />
  </AuthProvider>
);

export default App;
