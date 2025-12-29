import { useEffect, useState } from "react";
import DashboardLayout from "./DashboardLayout.jsx";
import PrimaryButton from "../../components/PrimaryButton.jsx";
import TextInput from "../../components/TextInput.jsx";
import { searchWorkoutLibrary } from "../../services/api.js";

const Workouts = () => {
  const [query, setQuery] = useState("");
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadWorkouts = async (search = "") => {
    setLoading(true);
    const { data } = await searchWorkoutLibrary({ q: search, limit: 48 });
    setWorkouts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadWorkouts();
  }, []);

  return (
    <DashboardLayout>
      <div className="bg-brand-card rounded-3xl p-8 shadow-card">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-brand-ink">
              Workout Library
            </h2>
            <p className="text-brand-muted">
              Browse workouts available for assigning weekly plans.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <TextInput
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search workouts"
            />
            <PrimaryButton
              className="w-auto px-6"
              onClick={() => loadWorkouts(query)}
            >
              Search
            </PrimaryButton>
          </div>
        </div>

        <div className="mt-6">
          {loading ? (
            <p className="text-sm text-brand-muted">Loading workouts...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {workouts.map((workout) => (
                <div
                  key={workout.id}
                  className="border border-brand-border rounded-2xl p-4"
                >
                  <p className="text-brand-ink font-semibold">
                    {workout.workoutName}
                  </p>
                  <p className="text-xs text-brand-muted">
                    {workout.category || "Workout"} · {workout.unit || "-"}
                  </p>
                  <p className="text-xs text-brand-muted mt-2">
                    Calories/min: {workout.caloriesPerMin || "-"}
                  </p>
                </div>
              ))}
              {!workouts.length && (
                <p className="text-sm text-brand-muted">
                  No workouts found for this search.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Workouts;
