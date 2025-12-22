import { Navigate, Route, Routes, useParams } from "react-router-dom";
import DashboardHome from "./pages/dashboard/Home.jsx";
import Clients from "./pages/dashboard/Clients.jsx";
import Leads from "./pages/dashboard/Leads.jsx";
import FollowUps from "./pages/dashboard/FollowUps.jsx";
import AddClient from "./pages/dashboard/AddClient.jsx";
import ClientDetail from "./pages/dashboard/ClientDetail.jsx";
import AssignMeal from "./pages/dashboard/AssignMeal.jsx";
import AssignWorkout from "./pages/dashboard/AssignWorkout.jsx";
import ProgressTracking from "./pages/dashboard/ProgressTracking.jsx";
import Workouts from "./pages/dashboard/Workouts.jsx";
import NutritionPlans from "./pages/dashboard/NutritionPlans.jsx";
import Recipes from "./pages/dashboard/Recipes.jsx";
import Settings from "./pages/dashboard/Settings.jsx";
import Login from "./pages/Login.jsx";
import { BrandingProvider } from "./context/BrandingContext.jsx";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { TenantProvider, useTenant } from "./context/TenantContext.jsx";

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  const { orgId, tenant, loading, error } = useTenant();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-brand-muted">
        Loading organization...
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-brand-muted">
        <p className="text-xl font-semibold">Organization unavailable</p>
        <p>{error || "Please confirm the link shared by your Super Admin."}</p>
        <a
          href="/"
          className="text-brand-primary font-semibold underline underline-offset-2"
        >
          Go back
        </a>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`/${orgId}/login`} replace />;
  }

  if (
    user.role !== "superadmin" &&
    user.tenantSlug &&
    user.tenantSlug !== orgId
  ) {
    return <Navigate to={`/${user.tenantSlug}/dashboard`} replace />;
  }

  return children;
};

const OrgScopedRoutes = () => {
  const { orgId } = useParams();
  if (!orgId) {
    return <Navigate to="/" replace />;
  }

  return (
    <TenantProvider orgId={orgId}>
      <BrandingProvider>
        <Routes>
          <Route path="login" element={<Login />} />
          <Route
            path="dashboard"
            element={
              <PrivateRoute>
                <DashboardHome />
              </PrivateRoute>
            }
          />
          <Route
            path="clients"
            element={
              <PrivateRoute>
                <Clients />
              </PrivateRoute>
            }
          />
          <Route
            path="leads"
            element={
              <PrivateRoute>
                <Leads />
              </PrivateRoute>
            }
          />
          <Route
            path="follow-ups"
            element={
              <PrivateRoute>
                <FollowUps />
              </PrivateRoute>
            }
          />
          <Route
            path="clients/new"
            element={
              <PrivateRoute>
                <AddClient />
              </PrivateRoute>
            }
          />
          <Route
            path="clients/:id"
            element={
              <PrivateRoute>
                <ClientDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="clients/:id/assign-meal"
            element={
              <PrivateRoute>
                <AssignMeal />
              </PrivateRoute>
            }
          />
          <Route
            path="clients/:id/assign-workout"
            element={
              <PrivateRoute>
                <AssignWorkout />
              </PrivateRoute>
            }
          />
          <Route
            path="progress"
            element={
              <PrivateRoute>
                <ProgressTracking />
              </PrivateRoute>
            }
          />
          <Route
            path="workouts"
            element={
              <PrivateRoute>
                <Workouts />
              </PrivateRoute>
            }
          />
          <Route
            path="nutrition"
            element={
              <PrivateRoute>
                <NutritionPlans />
              </PrivateRoute>
            }
          />
          <Route
            path="recipes"
            element={
              <PrivateRoute>
                <Recipes />
              </PrivateRoute>
            }
          />
          <Route
            path="settings"
            element={
              <PrivateRoute>
                <Settings />
              </PrivateRoute>
            }
          />
          <Route
            path="*"
            element={<Navigate to={`/${orgId}/dashboard`} replace />}
          />
        </Routes>
      </BrandingProvider>
    </TenantProvider>
  );
};

const Landing = () => (
  <div className="min-h-screen bg-brand-surface flex flex-col items-center justify-center gap-6 text-center px-6">
    <div>
      <p className="text-sm uppercase tracking-widest text-brand-primary font-semibold">
        Coach Admin Portal
      </p>
      <h1 className="text-4xl font-bold text-brand-ink mt-2">
        Enter your organization link to continue
      </h1>
    </div>
    <p className="text-brand-muted max-w-2xl">
      Each coach gets a unique URL from the Super Admin. Visit that link
      (example: <span className="font-mono text-brand-ink">coachdb.com/your-org-id/login</span>) to
      access your branded dashboard, clients, and leads. This landing page is
      intentionally blank for security.
    </p>
  </div>
);

const App = () => (
  <AuthProvider>
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/:orgId/*" element={<OrgScopedRoutes />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </AuthProvider>
);

export default App;
