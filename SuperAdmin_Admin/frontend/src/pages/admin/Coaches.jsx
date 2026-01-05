import { useEffect, useState } from "react";
import {
  deleteCoach,
  listCoaches,
  resetCoachPassword
} from "../../services/api.js";
import { Link } from "react-router-dom";

const Coaches = () => {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [actingId, setActingId] = useState("");

  const fetchCoaches = async () => {
    setLoading(true);
    const { data } = await listCoaches();
    setCoaches(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCoaches();
  }, []);

  const handleReset = async (coachId) => {
    setActingId(coachId);
    try {
      const { data } = await resetCoachPassword(coachId);
      setMessage(
        `Temporary password for coach ${coachId}: ${data.password}`
      );
    } finally {
      setActingId("");
    }
  };

  const handleDelete = async (tenantId) => {
    if (!window.confirm("Delete this coach and their tenant data?")) return;
    setActingId(tenantId);
    try {
      await deleteCoach(tenantId);
      setMessage("Coach deleted successfully.");
      await fetchCoaches();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to delete coach");
    } finally {
      setActingId("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex justify-between items-center px-10 py-6 bg-white shadow">
        <div>
          <p className="text-sm text-gray-500">Super Admin</p>
          <h1 className="text-2xl font-semibold text-gray-900">
            Coach Directory
          </h1>
        </div>
        <Link
          to="/admin/coaches/create"
          className="bg-gray-900 text-white px-6 py-3 rounded-2xl font-semibold"
        >
          + Add Coach
        </Link>
      </div>

      <main className="px-10 py-8">
        {message && (
          <div className="mb-4 bg-emerald-50 text-emerald-700 px-4 py-3 rounded-2xl">
            {message}
          </div>
        )}
        <div className="bg-white rounded-3xl shadow-card">
          {loading ? (
            <p className="p-6 text-sm text-gray-500">Loading coaches...</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500">
                  <th className="px-6 py-3">Coach</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">App Name</th>
                  <th className="px-6 py-3">Slug</th>
                  <th className="px-6 py-3">Package</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-700">
                {coaches.map((coach) => (
                  <tr key={coach._id} className="border-t border-gray-100">
                    <td className="px-6 py-4 font-semibold">
                      {coach.owner?.firstName} {coach.owner?.lastName}
                    </td>
                    <td className="px-6 py-4">{coach.owner?.email}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {coach.branding?.logoBase64 || coach.branding?.logoUrl ? (
                          <img
                            src={coach.branding.logoBase64 || coach.branding.logoUrl}
                            alt="brand logo"
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : null}
                        <span>{coach.branding?.appName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
  <p className="text-sm font-semibold text-gray-700">{coach.slug}</p>
  <p className="text-xs text-gray-400">admin.jeevanshaili.com/{coach.slug}/login</p>
</td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {coach.packageName}
                    </td>
                    <td className="px-6 py-4 space-x-3">
                      <button
                        onClick={() => handleReset(coach.owner?._id)}
                        className="text-sm font-semibold text-red-500 disabled:opacity-50"
                        disabled={!coach.owner?._id || actingId === coach.owner?._id}
                      >
                        {actingId === coach.owner?._id ? "Resetting..." : "Reset Password"}
                      </button>
                      <button
                        onClick={() => handleDelete(coach._id)}
                        className="text-sm font-semibold text-gray-500 disabled:opacity-50"
                        disabled={actingId === coach._id}
                      >
                        {actingId === coach._id ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
};

export default Coaches;

