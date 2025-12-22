import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const AdminDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow px-10 py-6 flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500">Super Admin</p>
          <h1 className="text-2xl font-semibold text-gray-900">
            Welcome back, {user?.firstName}
          </h1>
        </div>
        <button
          className="text-sm font-semibold text-red-500"
          onClick={logout}
        >
          Logout
        </button>
      </header>

      <main className="px-10 py-8 space-y-6">
        <div className="grid grid-cols-3 gap-6">
          <Link
            to="/admin/coaches"
            className="bg-white rounded-3xl shadow-card p-6 hover:shadow-lg transition"
          >
            <h2 className="text-lg font-semibold text-gray-900">
              Manage Coaches
            </h2>
            <p className="text-gray-500 mt-2">
              Create white-label apps, reset passwords, edit branding.
            </p>
          </Link>
          <div className="bg-white rounded-3xl shadow-card p-6">
            <h2 className="text-lg font-semibold text-gray-900">Mobile Apps</h2>
            <p className="text-gray-500 mt-2">
              Each coach receives a unique package + API key.
            </p>
          </div>
          <div className="bg-white rounded-3xl shadow-card p-6">
            <h2 className="text-lg font-semibold text-gray-900">Sync Status</h2>
            <p className="text-gray-500 mt-2">
              Mobile data sync runs every 30 minutes.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
