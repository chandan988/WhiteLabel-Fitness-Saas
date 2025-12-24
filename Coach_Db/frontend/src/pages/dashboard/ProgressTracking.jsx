import { useState } from "react";
import DashboardLayout from "./DashboardLayout.jsx";
import ChartCard from "../../components/ChartCard.jsx";
import { useDashboardData } from "../../hooks/useDashboardData.js";

const ProgressTracking = () => {
  const { steps, calories, weights, nutrition } = useDashboardData();
  const [chartVariants, setChartVariants] = useState({
    steps: "line",
    calories: "line",
    weight: "line",
    nutrition: "line"
  });

  const updateVariant = (key, next) => {
    setChartVariants((prev) => ({ ...prev, [key]: next }));
  };
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-brand-ink">
          Progress Tracking
        </h2>
        <p className="text-brand-muted">
          Compare weight, steps, sleep and calorie trends.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-5">
        <ChartCard
          title="Steps Trend"
          data={steps}
          color="#fb923c"
          showToggle
          variant={chartVariants.steps}
          onVariantChange={(next) => updateVariant("steps", next)}
        />
        <ChartCard
          title="Calories Trend"
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
        <ChartCard
          title="Nutrition Overview"
          data={nutrition}
          color="#fb923c"
          showToggle
          variant={chartVariants.nutrition}
          onVariantChange={(next) => updateVariant("nutrition", next)}
        />
      </div>
    </DashboardLayout>
  );
};

export default ProgressTracking;
