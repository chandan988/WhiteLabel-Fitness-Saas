import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import ChartCard from "../../components/ChartCard.jsx";
import {
  getAdminCaloriesTrend,
  getAdminDashboardSummary,
  getAdminStepsTrend,
  getAdminWeightTrend
} from "../../services/api.js";

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [summary, setSummary] = useState(null);
  const [stepsTrend, setStepsTrend] = useState([]);
  const [caloriesTrend, setCaloriesTrend] = useState([]);
  const [weightTrend, setWeightTrend] = useState([]);
  const [chartVariant, setChartVariant] = useState({
    steps: "line",
    calories: "line",
    weight: "line"
  });

  useEffect(() => {
    const fetchDashboard = async () => {
      const [{ data: summaryData }, { data: steps }, { data: calories }, { data: weights }] =
        await Promise.all([
          getAdminDashboardSummary(),
          getAdminStepsTrend(),
          getAdminCaloriesTrend(),
          getAdminWeightTrend()
        ]);
      setSummary(summaryData);
      setStepsTrend(steps || []);
      setCaloriesTrend(calories || []);
      setWeightTrend(weights || []);
    };
    fetchDashboard();
  }, []);

  const summaryCards = useMemo(() => {
    const totals = summary?.totals || {};
    return [
      {
        label: "This Week's Calories Burned",
        value: `${Math.round(totals.caloriesBurned || 0)} kcal`
      },
      {
        label: "This Week's Steps",
        value: `${Math.round(totals.steps || 0)}`
      },
      {
        label: "This Week's Cal Intake",
        value: `${Math.round(totals.caloriesIntake || 0)} kcal`
      },
      {
        label: "This Week's Water Intake",
        value: `${Math.round(totals.waterIntake || 0)} L`
      },
      {
        label: "This Week's Sleep",
        value: `${Math.round((totals.sleepHours || 0) * 10) / 10} hrs`
      },
      {
        label: "This Week's Workout Summary",
        value: `${totals.workoutsCompleted || 0} sessions`
      }
    ];
  }, [summary]);

  const stepsSeries = useMemo(
    () =>
      stepsTrend.map((item) => ({
        label: item._id || item.date,
        value: item.value || 0
      })),
    [stepsTrend]
  );
  const caloriesSeries = useMemo(
    () =>
      caloriesTrend.map((item) => ({
        label: item._id || item.date,
        value: item.value || item.calories || 0
      })),
    [caloriesTrend]
  );
  const weightSeries = useMemo(
    () =>
      weightTrend.map((item) => ({
        label: item._id || item.date,
        value: item.value || 0
      })),
    [weightTrend]
  );

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
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {summaryCards.map((card) => (
            <div key={card.label} className="bg-white rounded-3xl shadow-card p-6">
              <p className="text-xs text-gray-500 uppercase">{card.label}</p>
              <p className="text-2xl font-semibold text-gray-900 mt-3">
                {card.value}
              </p>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <ChartCard
            title="Weekly Steps"
            data={stepsSeries}
            xKey="label"
            yKey="value"
            variant={chartVariant.steps}
            onVariantChange={(next) =>
              setChartVariant((prev) => ({ ...prev, steps: next }))
            }
          />
          <ChartCard
            title="Weekly Calories"
            data={caloriesSeries}
            xKey="label"
            yKey="value"
            variant={chartVariant.calories}
            onVariantChange={(next) =>
              setChartVariant((prev) => ({ ...prev, calories: next }))
            }
          />
          <ChartCard
            title="Weight Trend"
            data={weightSeries}
            xKey="label"
            yKey="value"
            variant={chartVariant.weight}
            onVariantChange={(next) =>
              setChartVariant((prev) => ({ ...prev, weight: next }))
            }
          />
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
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
          <Link
            to="/admin/daily-content"
            className="bg-white rounded-3xl shadow-card p-6 hover:shadow-lg transition"
          >
            <h2 className="text-lg font-semibold text-gray-900">
              Daily Tips and Quotes
            </h2>
            <p className="text-gray-500 mt-2">
              Manage tips and quotes shown in the mobile app.
            </p>
          </Link>
          <Link
            to="/admin/workouts"
            className="bg-white rounded-3xl shadow-card p-6 hover:shadow-lg transition"
          >
            <h2 className="text-lg font-semibold text-gray-900">
              View / Add Workouts
            </h2>
            <p className="text-gray-500 mt-2">
              Curate the master workout library for all coaches.
            </p>
          </Link>
          <Link
            to="/admin/meals"
            className="bg-white rounded-3xl shadow-card p-6 hover:shadow-lg transition"
          >
            <h2 className="text-lg font-semibold text-gray-900">
              View / Add Meals
            </h2>
            <p className="text-gray-500 mt-2">
              Manage the food library available to every coach.
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
