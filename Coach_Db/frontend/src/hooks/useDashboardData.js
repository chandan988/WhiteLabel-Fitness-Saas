import { useEffect, useState } from "react";
import {
  getCaloriesTrend,
  getDashboardSummary,
  getNutritionTrend,
  getStepsTrend,
  getWeightTrend
} from "../services/api";

export const useDashboardData = () => {
  const [summary, setSummary] = useState(null);
  const [steps, setSteps] = useState([]);
  const [calories, setCalories] = useState([]);
  const [weights, setWeights] = useState([]);
  const [nutrition, setNutrition] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [summaryRes, stepsRes, caloriesRes, weightRes, nutritionRes] =
          await Promise.all([
            getDashboardSummary(),
            getStepsTrend(),
            getCaloriesTrend(),
            getWeightTrend(),
            getNutritionTrend()
          ]);
        setSummary(summaryRes.data || summaryRes);
        setSteps(stepsRes.data || stepsRes);
        setCalories(caloriesRes.data || caloriesRes);
        setWeights(weightRes.data || weightRes);
        setNutrition(nutritionRes.data || nutritionRes);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { summary, steps, calories, weights, nutrition, loading };
};
