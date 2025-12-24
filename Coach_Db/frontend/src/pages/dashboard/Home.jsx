import { useState } from "react";
import DashboardLayout from "./DashboardLayout.jsx";
import MetricCard from "../../components/MetricCard.jsx";
import ChartCard from "../../components/ChartCard.jsx";
import ActivitiesList from "../../components/ActivitiesList.jsx";
import ClientTable from "../../components/ClientTable.jsx";
import { useDashboardData } from "../../hooks/useDashboardData.js";
import { useClients } from "../../hooks/useClients.js";

const DashboardHome = () => {
  const { summary, steps, calories, weights, loading } = useDashboardData();
  const { clients } = useClients();
  const [chartVariants, setChartVariants] = useState({
    steps: "line",
    calories: "line",
    weight: "line"
  });

  const updateVariant = (key, next) => {
    setChartVariants((prev) => ({ ...prev, [key]: next }));
  };

  const metrics = [
    {
      label: "Today's Calories Burned",
      value: summary?.today?.caloriesBurned || 0,
      unit: "kcal"
    },
    {
      label: "Today's Steps",
      value: summary?.today?.steps || 0
    },
    {
      label: "Today's Cal Intake",
      value: summary?.today?.caloriesIntake || 0,
      unit: "kcal"
    },
    {
      label: "Water Intake",
      value: summary?.today?.waterIntake || 0,
      unit: "L"
    },
    {
      label: "Sleep",
      value: summary?.today?.sleepHours || 0,
      unit: "hrs"
    },
    {
      label: "Workout summary",
      value: summary?.today?.workoutsCompleted || 0,
      unit: "sessions"
    }
  ];

  return (
    <DashboardLayout>
      {loading && <p className="text-sm text-brand-muted">Loading dashboard...</p>}
      <div className="grid grid-cols-3 gap-5">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-5 mt-8">
        <ChartCard
          title="Weekly Steps"
          data={steps}
          color="#fb923c"
          showToggle
          variant={chartVariants.steps}
          onVariantChange={(next) => updateVariant("steps", next)}
        />
        <ChartCard
          title="Weekly Calories"
          data={calories}
          color="#fb923c"
          showToggle
          variant={chartVariants.calories}
          onVariantChange={(next) => updateVariant("calories", next)}
        />
        <ChartCard
          title="Weight Trend"
          data={weights}
          color="#fb923c"
          showToggle
          variant={chartVariants.weight}
          onVariantChange={(next) => updateVariant("weight", next)}
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
        <ClientTable clients={clients} />
      </div>
    </DashboardLayout>
  );
};

export default DashboardHome;
