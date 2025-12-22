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
      {loading && <p className="text-sm text-gray-500">Loading dashboard...</p>}
      <div className="grid grid-cols-3 gap-5">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-5 mt-8">
        <ChartCard title="Weekly Steps" data={steps} color="#22c55e" />
        <ChartCard title="Weekly Calories" data={calories} color="#0ea5e9" />
        <ChartCard title="Weight Trend" data={weights} color="#f97316" />
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
