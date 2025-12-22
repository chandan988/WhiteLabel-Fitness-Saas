import DashboardLayout from "./DashboardLayout.jsx";
import ChartCard from "../../components/ChartCard.jsx";
import { useDashboardData } from "../../hooks/useDashboardData.js";

const ProgressTracking = () => {
  const { steps, calories, weights, nutrition } = useDashboardData();
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          Progress Tracking
        </h2>
        <p className="text-gray-500">
          Compare weight, steps, sleep and calorie trends.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-5">
        <ChartCard title="Steps Trend" data={steps} color="#84cc16" />
        <ChartCard title="Calories Trend" data={calories} color="#f97316" />
        <ChartCard title="Weight Trend" data={weights} color="#22d3ee" />
        <ChartCard title="Nutrition Overview" data={nutrition} color="#a855f7" />
      </div>
    </DashboardLayout>
  );
};

export default ProgressTracking;
