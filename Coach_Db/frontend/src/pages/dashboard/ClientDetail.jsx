import { useParams } from "react-router-dom";
import { useMemo, useState } from "react";
import DashboardLayout from "./DashboardLayout.jsx";
import PrimaryButton from "../../components/PrimaryButton.jsx";
import TextInput from "../../components/TextInput.jsx";
import { useClientDetail } from "../../hooks/useClientDetail.js";

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString();
};

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
};

const ClientDetail = () => {
  const { id } = useParams();
  const {
    client,
    health,
    loading,
    error,
    assigning,
    libraryLoading,
    assignMeal,
    assignWorkout,
    searchFoods,
    searchWorkouts
  } = useClientDetail(id);

  const [workoutQuery, setWorkoutQuery] = useState("");
  const [workoutResults, setWorkoutResults] = useState([]);
  const [foodQuery, setFoodQuery] = useState("");
  const [foodResults, setFoodResults] = useState([]);
  const [workoutNotes, setWorkoutNotes] = useState("");
  const [workoutDuration, setWorkoutDuration] = useState("");
  const [mealNotes, setMealNotes] = useState("");
  const [actionError, setActionError] = useState("");

  const summaryCards = useMemo(() => {
    const summary = health?.summary || {};
    return [
      {
        label: "Latest Weight",
        value: summary.latestWeight ? `${summary.latestWeight} kg` : "-"
      },
      {
        label: "Latest Steps",
        value: summary.latestSteps ? `${summary.latestSteps}` : "-"
      },
      {
        label: "Water Intake",
        value: summary.latestWater ? `${summary.latestWater} glasses` : "-"
      },
      {
        label: "Sleep Hours",
        value: summary.latestSleep ? `${summary.latestSleep} hrs` : "-"
      },
      {
        label: "Calories",
        value: summary.latestFood?.calories
          ? `${Math.round(summary.latestFood.calories)} kcal`
          : "-"
      },
      {
        label: "Workouts",
        value: summary.latestWorkoutCount ?? "-"
      }
    ];
  }, [health]);

  const handleWorkoutSearch = async () => {
    setActionError("");
    try {
      const results = await searchWorkouts({ q: workoutQuery, limit: 8 });
      setWorkoutResults(results);
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to load workouts");
    }
  };

  const handleFoodSearch = async () => {
    setActionError("");
    try {
      const results = await searchFoods({ q: foodQuery, limit: 8 });
      setFoodResults(results);
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to load foods");
    }
  };

  const handleAssignWorkout = async (workout) => {
    setActionError("");
    try {
      await assignWorkout({
        workoutId: workout.id,
        duration: workoutDuration,
        notes: workoutNotes
      });
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to assign workout");
    }
  };

  const handleAssignMeal = async (food) => {
    setActionError("");
    try {
      await assignMeal({ foodId: food.id, notes: mealNotes });
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to assign meal");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <p className="text-brand-muted">Loading client...</p>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <p className="text-brand-muted">{error}</p>
      </DashboardLayout>
    );
  }

  if (!client) {
    return (
      <DashboardLayout>
        <p className="text-brand-muted">Client not found.</p>
      </DashboardLayout>
    );
  }

  const workouts = health?.logs?.workouts || [];
  const foods = health?.logs?.foods || [];
  const sleeps = health?.logs?.sleeps || [];
  const steps = health?.logs?.steps || [];
  const waters = health?.logs?.waters || [];
  const weights = health?.logs?.weights || [];

  return (
    <DashboardLayout>
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
        <div>
          <p className="text-brand-muted text-sm">Client Overview</p>
          <h2 className="text-2xl font-semibold text-brand-ink">
            {client.firstName} {client.lastName}
          </h2>
          <p className="text-brand-muted">{client.email}</p>
          <p className="text-brand-muted">{client.phone || "No phone"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="bg-brand-card rounded-3xl shadow-card p-5"
          >
            <p className="text-xs text-brand-muted uppercase">{card.label}</p>
            <p className="text-xl font-semibold text-brand-ink mt-2">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-brand-card rounded-3xl shadow-card p-6">
            <h3 className="text-lg font-semibold text-brand-ink mb-4">
              Workout Activity
            </h3>
            {workouts.length ? (
              <div className="space-y-4 text-sm text-brand-muted">
                {workouts.map((workout) => (
                  <div
                    key={workout._id}
                    className="border border-brand-border rounded-2xl p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-brand-ink font-semibold">
                        {formatDate(workout.dateObj || workout.date)}
                      </span>
                      <span>
                        {workout.workouts?.length || 0} sessions
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-brand-muted">
                      Calories:{" "}
                      {workout.dailyStats?.calories
                        ? Math.round(workout.dailyStats.calories)
                        : "-"}
                      {" kcal"}
                    </div>
                    <div className="mt-2 text-xs text-brand-muted">
                      {(workout.workouts || [])
                        .slice(0, 3)
                        .map((item) => item.workoutName || item.name)
                        .filter(Boolean)
                        .join(", ") || "No workout names available"}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-brand-muted">
                No workout activity available yet.
              </p>
            )}
          </div>

          <div className="bg-brand-card rounded-3xl shadow-card p-6">
            <h3 className="text-lg font-semibold text-brand-ink mb-4">
              Nutrition Logs
            </h3>
            {foods.length ? (
              <div className="space-y-4 text-sm text-brand-muted">
                {foods.map((log) => (
                  <div
                    key={log._id}
                    className="border border-brand-border rounded-2xl p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-brand-ink font-semibold">
                        {formatDate(log.date || log.createdAt)}
                      </span>
                      <span>
                        {log.dailyTotals?.calories
                          ? `${Math.round(log.dailyTotals.calories)} kcal`
                          : "-"}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-brand-muted">
                      Protein: {log.dailyTotals?.protein ?? "-"}g · Carbs:{" "}
                      {log.dailyTotals?.carbs ?? "-"}g · Fat:{" "}
                      {log.dailyTotals?.fat ?? "-"}g
                    </div>
                    <div className="mt-2 text-xs text-brand-muted">
                      {(log.meals || [])
                        .map((meal) => meal.mealType)
                        .filter(Boolean)
                        .join(", ") || "Meals logged"}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-brand-muted">
                No nutrition logs available yet.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-brand-card rounded-3xl shadow-card p-6">
              <h3 className="text-lg font-semibold text-brand-ink mb-4">
                Sleep
              </h3>
              {sleeps.length ? (
                <div className="space-y-3 text-sm text-brand-muted">
                  {sleeps.map((entry) => (
                    <div key={entry._id} className="flex flex-col gap-1">
                      <span className="text-brand-ink font-semibold">
                        {formatDate(entry.date || entry.sleep_time)}
                      </span>
                      <span>
                        {formatDateTime(entry.sleep_time)} →{" "}
                        {formatDateTime(entry.wake_time)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-brand-muted">
                  No sleep logs recorded yet.
                </p>
              )}
            </div>
            <div className="bg-brand-card rounded-3xl shadow-card p-6">
              <h3 className="text-lg font-semibold text-brand-ink mb-4">
                Steps
              </h3>
              {steps.length ? (
                <div className="space-y-3 text-sm text-brand-muted">
                  {steps.map((entry) => (
                    <div key={entry._id} className="flex justify-between">
                      <span className="text-brand-ink font-semibold">
                        {formatDate(entry.date)}
                      </span>
                      <span>
                        {entry.totalSteps || 0} steps ·{" "}
                        {entry.distanceMeters
                          ? `${Math.round(entry.distanceMeters)} m`
                          : "-"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-brand-muted">
                  No step data available yet.
                </p>
              )}
            </div>
            <div className="bg-brand-card rounded-3xl shadow-card p-6">
              <h3 className="text-lg font-semibold text-brand-ink mb-4">
                Water Intake
              </h3>
              {waters.length ? (
                <div className="space-y-3 text-sm text-brand-muted">
                  {waters.map((entry) => (
                    <div key={entry._id} className="flex justify-between">
                      <span className="text-brand-ink font-semibold">
                        {formatDate(entry.date)}
                      </span>
                      <span>{entry.amount || 0} glasses</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-brand-muted">
                  No water logs available yet.
                </p>
              )}
            </div>
            <div className="bg-brand-card rounded-3xl shadow-card p-6">
              <h3 className="text-lg font-semibold text-brand-ink mb-4">
                Weight Tracking
              </h3>
              {weights.length ? (
                <div className="space-y-3 text-sm text-brand-muted">
                  {weights.map((entry) => (
                    <div
                      key={entry._id}
                      className="flex items-center justify-between gap-3"
                    >
                      <div>
                        <span className="text-brand-ink font-semibold">
                          {formatDate(entry.date)}
                        </span>
                        <p className="text-xs text-brand-muted">
                          {entry.weight || "-"} kg
                        </p>
                      </div>
                      {entry.photo ? (
                        <img
                          src={entry.photo}
                          alt="Weight log"
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-brand-muted">
                  No weight entries yet.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-brand-card rounded-3xl shadow-card p-6">
            <h3 className="text-lg font-semibold text-brand-ink mb-3">
              Assigned Meal Plan
            </h3>
            {client.mealPlan?.name ? (
              <div className="text-sm text-brand-muted space-y-2">
                <p className="text-brand-ink font-semibold">
                  {client.mealPlan.name}
                </p>
                <p>{client.mealPlan.calories || "-"} kcal</p>
                <p>{client.mealPlan.notes || "No notes yet."}</p>
                <p className="text-xs text-brand-muted">
                  Updated {formatDateTime(client.mealPlan.assignedAt)}
                </p>
              </div>
            ) : (
              <p className="text-sm text-brand-muted">
                No meal plan assigned yet.
              </p>
            )}
          </div>

          <div className="bg-brand-card rounded-3xl shadow-card p-6">
            <h3 className="text-lg font-semibold text-brand-ink mb-3">
              Assigned Workout
            </h3>
            {client.workoutPlan?.name ? (
              <div className="text-sm text-brand-muted space-y-2">
                <p className="text-brand-ink font-semibold">
                  {client.workoutPlan.name}
                </p>
                <p>{client.workoutPlan.duration || "-"} mins</p>
                <p>{client.workoutPlan.notes || "No notes yet."}</p>
                <p className="text-xs text-brand-muted">
                  Updated {formatDateTime(client.workoutPlan.assignedAt)}
                </p>
              </div>
            ) : (
              <p className="text-sm text-brand-muted">
                No workout assigned yet.
              </p>
            )}
          </div>

          <div className="bg-brand-card rounded-3xl shadow-card p-6 space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-brand-ink mb-2">
                Assign Workout
              </h4>
              <div className="flex gap-2">
                <TextInput
                  value={workoutQuery}
                  onChange={(event) => setWorkoutQuery(event.target.value)}
                  placeholder="Search workout library"
                />
                <PrimaryButton
                  className="w-auto px-4"
                  onClick={handleWorkoutSearch}
                  disabled={libraryLoading}
                >
                  Search
                </PrimaryButton>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <TextInput
                  label="Duration (mins)"
                  value={workoutDuration}
                  onChange={(event) => setWorkoutDuration(event.target.value)}
                  placeholder="30"
                />
                <TextInput
                  label="Notes"
                  value={workoutNotes}
                  onChange={(event) => setWorkoutNotes(event.target.value)}
                  placeholder="Focus on form"
                />
              </div>
              <div className="mt-4 space-y-2 text-sm text-brand-muted">
                {workoutResults.map((workout) => (
                  <div
                    key={workout.id}
                    className="flex items-center justify-between border border-brand-border rounded-2xl p-3"
                  >
                    <div>
                      <p className="text-brand-ink font-semibold">
                        {workout.workoutName}
                      </p>
                      <p className="text-xs text-brand-muted">
                        {workout.category || "Workout"} ·{" "}
                        {workout.caloriesPerMin || "-"} cal/min
                      </p>
                    </div>
                    <PrimaryButton
                      className="w-auto px-4"
                      onClick={() => handleAssignWorkout(workout)}
                      disabled={assigning}
                    >
                      Assign
                    </PrimaryButton>
                  </div>
                ))}
                {!workoutResults.length && (
                  <p className="text-xs text-brand-muted">
                    Search the workout library to assign a plan.
                  </p>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-brand-border">
              <h4 className="text-sm font-semibold text-brand-ink mb-2">
                Assign Meal Plan
              </h4>
              <div className="flex gap-2">
                <TextInput
                  value={foodQuery}
                  onChange={(event) => setFoodQuery(event.target.value)}
                  placeholder="Search food library"
                />
                <PrimaryButton
                  className="w-auto px-4"
                  onClick={handleFoodSearch}
                  disabled={libraryLoading}
                >
                  Search
                </PrimaryButton>
              </div>
              <TextInput
                label="Notes"
                value={mealNotes}
                onChange={(event) => setMealNotes(event.target.value)}
                placeholder="e.g. post-workout meal"
              />
              <div className="mt-4 space-y-2 text-sm text-brand-muted">
                {foodResults.map((food) => (
                  <div
                    key={food.id}
                    className="flex items-center justify-between border border-brand-border rounded-2xl p-3"
                  >
                    <div className="flex items-center gap-3">
                      {food.foodImage ? (
                        <img
                          src={food.foodImage}
                          alt={food.foodName}
                          className="w-10 h-10 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-brand-secondary/10" />
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
                    <PrimaryButton
                      className="w-auto px-4"
                      onClick={() => handleAssignMeal(food)}
                      disabled={assigning}
                    >
                      Assign
                    </PrimaryButton>
                  </div>
                ))}
                {!foodResults.length && (
                  <p className="text-xs text-brand-muted">
                    Search the food library to assign a meal.
                  </p>
                )}
              </div>
            </div>
            {actionError && (
              <p className="text-xs text-red-500">{actionError}</p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientDetail;
