import { useEffect, useState } from "react";
import DashboardLayout from "./DashboardLayout.jsx";
import PrimaryButton from "../../components/PrimaryButton.jsx";
import TextInput from "../../components/TextInput.jsx";
import { searchFoodLibrary } from "../../services/api.js";

const Meals = () => {
  const [query, setQuery] = useState("");
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFoods = async (search = "") => {
    setLoading(true);
    const { data } = await searchFoodLibrary({ q: search, limit: 48 });
    setFoods(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadFoods();
  }, []);

  return (
    <DashboardLayout>
      <div className="bg-brand-card rounded-3xl p-8 shadow-card">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-brand-ink">
              Meal Library
            </h2>
            <p className="text-brand-muted">
              Browse meals to build weekly nutrition plans.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <TextInput
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search meals"
            />
            <PrimaryButton
              className="w-auto px-6"
              onClick={() => loadFoods(query)}
            >
              Search
            </PrimaryButton>
          </div>
        </div>

        <div className="mt-6">
          {loading ? (
            <p className="text-sm text-brand-muted">Loading meals...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {foods.map((food) => (
                <div
                  key={food.id}
                  className="border border-brand-border rounded-2xl p-4 flex gap-3"
                >
                  {food.foodImage ? (
                    <img
                      src={food.foodImage}
                      alt={food.foodName}
                      className="h-14 w-14 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="h-14 w-14 rounded-xl bg-brand-border/40" />
                  )}
                  <div>
                    <p className="text-brand-ink font-semibold">
                      {food.foodName}
                    </p>
                    <p className="text-xs text-brand-muted">
                      {Math.round(food.energyKcal || 0)} kcal ·{" "}
                      {food.servingsUnit || "serving"}
                    </p>
                  </div>
                </div>
              ))}
              {!foods.length && (
                <p className="text-sm text-brand-muted">
                  No meals found for this search.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Meals;
