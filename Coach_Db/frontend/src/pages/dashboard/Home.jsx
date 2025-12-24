import { useMemo, useState } from "react";
import DashboardLayout from "./DashboardLayout.jsx";
import MetricCard from "../../components/MetricCard.jsx";
import ChartCard from "../../components/ChartCard.jsx";
import ActivitiesList from "../../components/ActivitiesList.jsx";
import ClientTable from "../../components/ClientTable.jsx";
import { useDashboardData } from "../../hooks/useDashboardData.js";
import { useClients } from "../../hooks/useClients.js";
import { getClientHealth } from "../../services/api.js";
import { useNavigate } from "react-router-dom";
import { useOrgPath } from "../../hooks/useOrgPath.js";

const DashboardHome = () => {
  const { summary, steps, calories, weights, loading } = useDashboardData();
  const { clients } = useClients();
  const navigate = useNavigate();
  const buildPath = useOrgPath();
  const [chartVariants, setChartVariants] = useState({
    steps: "line",
    calories: "line",
    weight: "line"
  });
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedHealth, setSelectedHealth] = useState(null);

  const updateVariant = (key, next) => {
    setChartVariants((prev) => ({ ...prev, [key]: next }));
  };

  const toDate = (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date;
  };

  const buildSeries = (entries, getDate, getValue) => {
    const map = new Map();
    entries.forEach((entry) => {
      const date = getDate(entry);
      if (!date) return;
      const key = date.toISOString().slice(0, 10);
      const value = Number(getValue(entry)) || 0;
      map.set(key, (map.get(key) || 0) + value);
    });
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, value]) => ({
        label: new Date(key).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric"
        }),
        value
      }));
  };

  const handleSelectClient = async (client) => {
    if (!client?._id) return;
    if (selectedClient?._id === client._id) {
      setSelectedClient(null);
      setSelectedHealth(null);
      return;
    }
    setSelectedClient(client);
    try {
      const { data } = await getClientHealth(client._id, { limit: 30 });
      setSelectedHealth(data);
    } catch (err) {
      setSelectedHealth(null);
    }
  };

  const selectedSummary = selectedHealth?.summary;
  const selectedWorkouts = selectedHealth?.logs?.workouts || [];
  const selectedFoods = selectedHealth?.logs?.foods || [];
  const selectedSteps = selectedHealth?.logs?.steps || [];
  const selectedWeights = selectedHealth?.logs?.weights || [];
  const selectedCaloriesBurned =
    selectedWorkouts?.[0]?.dailyStats?.calories || 0;

  const metrics = [
    {
      label: "Today's Calories Burned",
      value: selectedSummary ? selectedCaloriesBurned : summary?.today?.caloriesBurned || 0,
      unit: "kcal"
    },
    {
      label: "Today's Steps",
      value: selectedSummary ? selectedSummary.latestSteps || 0 : summary?.today?.steps || 0
    },
    {
      label: "Today's Cal Intake",
      value: selectedSummary
        ? selectedSummary.latestFood?.calories || 0
        : summary?.today?.caloriesIntake || 0,
      unit: "kcal"
    },
    {
      label: "Water Intake",
      value: selectedSummary ? selectedSummary.latestWater || 0 : summary?.today?.waterIntake || 0,
      unit: "L"
    },
    {
      label: "Sleep",
      value: selectedSummary ? selectedSummary.latestSleep || 0 : summary?.today?.sleepHours || 0,
      unit: "hrs"
    },
    {
      label: "Workout summary",
      value: selectedSummary
        ? selectedSummary.latestWorkoutCount || 0
        : summary?.today?.workoutsCompleted || 0,
      unit: "sessions"
    }
  ];

  const combinedCharts = {
    steps,
    calories,
    weights,
    stepsKey: "_id",
    caloriesKey: "_id",
    weightsKey: "_id"
  };

  const selectedCharts = selectedSummary
    ? {
        steps: buildSeries(
          selectedSteps,
          (entry) => toDate(entry.date),
          (entry) => entry.totalSteps || 0
        ),
        calories: buildSeries(
          selectedFoods,
          (entry) => toDate(entry.date || entry.createdAt),
          (entry) => entry.dailyTotals?.calories || 0
        ),
        weights: buildSeries(
          selectedWeights,
          (entry) => toDate(entry.date),
          (entry) => entry.weight || 0
        ),
        stepsKey: "label",
        caloriesKey: "label",
        weightsKey: "label"
      }
    : combinedCharts;

  return (
    <DashboardLayout>
      {loading && <p className="text-sm text-brand-muted">Loading dashboard...</p>}
      {selectedClient && (
        <div className="mb-4 flex items-center justify-between bg-brand-card rounded-2xl px-4 py-3 shadow-card">
          <p className="text-sm text-brand-ink">
            Viewing <span className="font-semibold">{selectedClient.firstName} {selectedClient.lastName}</span> metrics
          </p>
          <button
            type="button"
            className="text-sm font-semibold text-brand-primary"
            onClick={() => {
              setSelectedClient(null);
              setSelectedHealth(null);
            }}
          >
            Clear selection
          </button>
        </div>
      )}
      <div className="grid grid-cols-3 gap-5">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-5 mt-8">
        <ChartCard
          title="Weekly Steps"
          data={selectedCharts.steps}
          color="#fb923c"
          showToggle
          variant={chartVariants.steps}
          onVariantChange={(next) => updateVariant("steps", next)}
          xKey={selectedCharts.stepsKey}
          yKey="value"
        />
        <ChartCard
          title="Weekly Calories"
          data={selectedCharts.calories}
          color="#fb923c"
          showToggle
          variant={chartVariants.calories}
          onVariantChange={(next) => updateVariant("calories", next)}
          xKey={selectedCharts.caloriesKey}
          yKey="value"
        />
        <ChartCard
          title="Weight Trend"
          data={selectedCharts.weights}
          color="#fb923c"
          showToggle
          variant={chartVariants.weight}
          onVariantChange={(next) => updateVariant("weight", next)}
          xKey={selectedCharts.weightsKey}
          yKey="value"
        />
      </div>
      <div className="grid grid-cols-2 gap-5 mt-8">
        <ActivitiesList
          activities={[
            { _id: 1, title: "Morning Run", time: "6:00 AM", status: "Done" },
            { _id: 2, title: "Meal Plan Review", time: "9:00 AM", status: "Scheduled" },
            { _id: 3, title: "Client Call", time: "12:00 PM", status: "Pending" }
          ]}
        />
        <ClientTable
          clients={clients}
          selectedClientId={selectedClient?._id}
          onSelectClient={handleSelectClient}
          onViewAll={() => navigate(buildPath("/clients"))}
        />
      </div>
    </DashboardLayout>
  );
};

export default DashboardHome;
