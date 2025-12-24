import { useParams } from "react-router-dom";
import { useMemo, useRef, useState } from "react";
import DashboardLayout from "./DashboardLayout.jsx";
import PrimaryButton from "../../components/PrimaryButton.jsx";
import TextInput from "../../components/TextInput.jsx";
import ChartCard from "../../components/ChartCard.jsx";
import { useClientDetail } from "../../hooks/useClientDetail.js";
import { useBranding } from "../../context/BrandingContext.jsx";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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

const toDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
};

const average = (values) => {
  if (!values.length) return 0;
  const total = values.reduce((sum, value) => sum + value, 0);
  return total / values.length;
};

const getDayKey = (date) => date.toISOString().slice(0, 10);

const buildSeries = (entries, getDate, getValue, aggregate = "sum") => {
  const map = new Map();
  entries.forEach((entry) => {
    const date = getDate(entry);
    if (!date) return;
    const key = getDayKey(date);
    const value = Number(getValue(entry)) || 0;
    if (!map.has(key)) {
      map.set(key, value);
      return;
    }
    if (aggregate === "sum") {
      map.set(key, map.get(key) + value);
    } else {
      map.set(key, value);
    }
  });
  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, value]) => ({
      label: new Date(key).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric"
      }),
      value: Math.round(value * 10) / 10
    }));
};

const ProgressBar = ({ label, current, target, unit }) => {
  const percent = target ? Math.min((current / target) * 100, 100) : 0;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-brand-muted">{label}</span>
        <span className="text-brand-ink font-semibold">
          {Math.round(current)} {unit} / {target} {unit}
        </span>
      </div>
      <div className="h-2 rounded-full bg-brand-secondary/15 overflow-hidden">
        <div
          className="h-full rounded-full bg-brand-primary"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
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
  const { branding } = useBranding();
  const reportRef = useRef(null);
  const chartColor = "#fb923c";

  const [chartVariants, setChartVariants] = useState({
    steps: "line",
    calories: "line",
    weight: "line"
  });
  const [period, setPeriod] = useState("week");
  const [workoutQuery, setWorkoutQuery] = useState("");
  const [workoutResults, setWorkoutResults] = useState([]);
  const [foodQuery, setFoodQuery] = useState("");
  const [foodResults, setFoodResults] = useState([]);
  const [workoutNotes, setWorkoutNotes] = useState("");
  const [workoutDuration, setWorkoutDuration] = useState("");
  const [mealNotes, setMealNotes] = useState("");
  const [actionError, setActionError] = useState("");

  const updateChartVariant = (key, next) => {
    setChartVariants((prev) => ({ ...prev, [key]: next }));
  };

  const rangeDays = period === "month" ? 30 : 7;
  const rangeStart = useMemo(() => {
    const start = new Date();
    start.setDate(start.getDate() - (rangeDays - 1));
    start.setHours(0, 0, 0, 0);
    return start;
  }, [rangeDays]);

  const workouts = health?.logs?.workouts || [];
  const foods = health?.logs?.foods || [];
  const sleeps = health?.logs?.sleeps || [];
  const steps = health?.logs?.steps || [];
  const waters = health?.logs?.waters || [];
  const weights = health?.logs?.weights || [];

  const filteredWorkouts = useMemo(
    () =>
      workouts.filter(
        (entry) =>
          (toDate(entry.dateObj || entry.date) || 0) >= rangeStart
      ),
    [workouts, rangeStart]
  );
  const filteredSteps = useMemo(
    () => steps.filter((entry) => (toDate(entry.date) || 0) >= rangeStart),
    [steps, rangeStart]
  );
  const filteredFoods = useMemo(
    () =>
      foods.filter(
        (entry) => (toDate(entry.date || entry.createdAt) || 0) >= rangeStart
      ),
    [foods, rangeStart]
  );
  const filteredWeights = useMemo(
    () => weights.filter((entry) => (toDate(entry.date) || 0) >= rangeStart),
    [weights, rangeStart]
  );
  const filteredWaters = useMemo(
    () => waters.filter((entry) => (toDate(entry.date) || 0) >= rangeStart),
    [waters, rangeStart]
  );
  const filteredSleeps = useMemo(
    () =>
      sleeps.filter(
        (entry) => (toDate(entry.date || entry.sleep_time) || 0) >= rangeStart
      ),
    [sleeps, rangeStart]
  );

  const stepsSeries = useMemo(
    () =>
      buildSeries(
        filteredSteps,
        (entry) => toDate(entry.date),
        (entry) => entry.totalSteps || 0
      ),
    [filteredSteps]
  );
  const caloriesSeries = useMemo(
    () =>
      buildSeries(
        filteredFoods,
        (entry) => toDate(entry.date || entry.createdAt),
        (entry) => entry.dailyTotals?.calories || 0
      ),
    [filteredFoods]
  );
  const weightSeries = useMemo(
    () =>
      buildSeries(
        filteredWeights,
        (entry) => toDate(entry.date),
        (entry) => entry.weight || 0,
        "last"
      ),
    [filteredWeights]
  );
  const waterSeries = useMemo(
    () =>
      buildSeries(
        filteredWaters,
        (entry) => toDate(entry.date),
        (entry) => entry.amount || 0
      ),
    [filteredWaters]
  );
  const sleepSeries = useMemo(
    () =>
      buildSeries(
        filteredSleeps,
        (entry) => toDate(entry.date || entry.sleep_time),
        (entry) => {
          const start = toDate(entry.sleep_time);
          const end = toDate(entry.wake_time);
          if (!start || !end || end <= start) return 0;
          return (end - start) / (1000 * 60 * 60);
        }
      ),
    [filteredSleeps]
  );

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

  const benchmarks = useMemo(() => {
    const avgSteps = average(stepsSeries.map((item) => item.value));
    const avgCalories = average(caloriesSeries.map((item) => item.value));
    const avgWater = average(waterSeries.map((item) => item.value));
    const avgSleep = average(sleepSeries.map((item) => item.value));
    return [
      { label: "Steps Target", current: avgSteps, target: 10000, unit: "steps" },
      { label: "Sleep Target", current: avgSleep, target: 8, unit: "hrs" },
      { label: "Water Target", current: avgWater, target: 8, unit: "glasses" },
      { label: "Calories Target", current: avgCalories, target: 2000, unit: "kcal" }
    ];
  }, [stepsSeries, caloriesSeries, waterSeries, sleepSeries]);

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

  const handleDownloadReport = async () => {
    if (!client) return;
    const safeName = `${client.firstName || "client"}-${client.lastName || ""}`
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9-_]/g, "")
      .toLowerCase();
    const dateTag = new Date().toISOString().slice(0, 10);
    const node = reportRef.current;
    if (!node) return;
    const canvas = await html2canvas(node, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff"
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "pt", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position -= pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${safeName || "client"}-report-${dateTag}.pdf`);
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
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="bg-brand-card rounded-2xl shadow-card p-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPeriod("week")}
              className={`px-4 py-2 rounded-2xl text-sm font-semibold ${
                period === "week"
                  ? "bg-brand-primary text-brand-buttonText"
                  : "text-brand-muted"
              }`}
            >
              Last 7 Days
            </button>
            <button
              type="button"
              onClick={() => setPeriod("month")}
              className={`px-4 py-2 rounded-2xl text-sm font-semibold ${
                period === "month"
                  ? "bg-brand-primary text-brand-buttonText"
                  : "text-brand-muted"
              }`}
            >
              Last 30 Days
            </button>
          </div>
          <PrimaryButton className="w-auto px-6" onClick={handleDownloadReport}>
            Download Report
          </PrimaryButton>
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <ChartCard
          title="Steps Trend"
          data={stepsSeries}
          color={chartColor}
          xKey="label"
          yKey="value"
          showToggle
          variant={chartVariants.steps}
          onVariantChange={(next) => updateChartVariant("steps", next)}
        />
        <ChartCard
          title="Calories Intake"
          data={caloriesSeries}
          color={chartColor}
          xKey="label"
          yKey="value"
          showToggle
          variant={chartVariants.calories}
          onVariantChange={(next) => updateChartVariant("calories", next)}
        />
        <ChartCard
          title="Weight Trend"
          data={weightSeries}
          color={chartColor}
          xKey="label"
          yKey="value"
          showToggle
          variant={chartVariants.weight}
          onVariantChange={(next) => updateChartVariant("weight", next)}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-brand-card rounded-3xl shadow-card p-6">
            <h3 className="text-lg font-semibold text-brand-ink mb-4">
              Workout Activity
            </h3>
            {filteredWorkouts.length ? (
              <div className="space-y-4 text-sm text-brand-muted">
                {filteredWorkouts.map((workout) => (
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
                        : "-"}{" "}
                      kcal
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
            {filteredFoods.length ? (
              <div className="space-y-4 text-sm text-brand-muted">
                {filteredFoods.map((log) => (
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
                      Protein: {log.dailyTotals?.protein ?? "-"}g - Carbs:{" "}
                      {log.dailyTotals?.carbs ?? "-"}g - Fat:{" "}
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
              {filteredSleeps.length ? (
                <div className="space-y-3 text-sm text-brand-muted">
                  {filteredSleeps.map((entry) => (
                    <div key={entry._id} className="flex flex-col gap-1">
                      <span className="text-brand-ink font-semibold">
                        {formatDate(entry.date || entry.sleep_time)}
                      </span>
                      <span>
                        {formatDateTime(entry.sleep_time)} to{" "}
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
              {filteredSteps.length ? (
                <div className="space-y-3 text-sm text-brand-muted">
                  {filteredSteps.map((entry) => (
                    <div key={entry._id} className="flex justify-between">
                      <span className="text-brand-ink font-semibold">
                        {formatDate(entry.date)}
                      </span>
                      <span>
                        {entry.totalSteps || 0} steps -{" "}
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
              {filteredWaters.length ? (
                <div className="space-y-3 text-sm text-brand-muted">
                  {filteredWaters.map((entry) => (
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
              {filteredWeights.length ? (
                <div className="space-y-3 text-sm text-brand-muted">
                  {filteredWeights.map((entry) => (
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
          <div className="bg-brand-card rounded-3xl shadow-card p-6 space-y-4">
            <h3 className="text-lg font-semibold text-brand-ink">Benchmarks</h3>
            {benchmarks.map((item) => (
              <ProgressBar
                key={item.label}
                label={item.label}
                current={item.current}
                target={item.target}
                unit={item.unit}
              />
            ))}
          </div>

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
                        {workout.category || "Workout"} -{" "}
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
                placeholder="Example: post-workout meal"
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
                          {Math.round(food.energyKcal || 0)} kcal -{" "}
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

      <div
        ref={reportRef}
        style={{ position: "absolute", left: "-10000px", top: 0, width: 900 }}
        className="bg-white text-slate-900 p-10 space-y-6"
      >
        <div className="flex items-center justify-between border-b border-slate-200 pb-6">
          <div className="flex items-center gap-4">
            <img
              src={branding.logoUrl}
              alt={branding.appName}
              className="h-12 w-12 rounded-xl object-contain"
              crossOrigin="anonymous"
            />
            <div>
              <p className="text-sm uppercase tracking-wide text-slate-500">
                {branding.appName}
              </p>
              <h1 className="text-2xl font-semibold">Client Health Report</h1>
              <p className="text-sm text-slate-500">
                Generated {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="text-right text-sm">
            <p className="font-semibold">
              {client.firstName} {client.lastName}
            </p>
            <p>{client.email}</p>
            <p>{client.phone || "-"}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {summaryCards.map((card) => (
            <div key={card.label} className="bg-slate-50 rounded-2xl p-4">
              <p className="text-xs uppercase text-slate-500">{card.label}</p>
              <p className="text-lg font-semibold text-slate-900 mt-2">
                {card.value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <ChartCard
            title="Steps Trend"
            data={stepsSeries}
            color={chartColor}
            xKey="label"
            yKey="value"
            height={200}
          />
          <ChartCard
            title="Calories Intake"
            data={caloriesSeries}
            color={chartColor}
            xKey="label"
            yKey="value"
            height={200}
          />
          <ChartCard
            title="Weight Trend"
            data={weightSeries}
            color={chartColor}
            xKey="label"
            yKey="value"
            height={200}
          />
          <ChartCard
            title="Water Intake"
            data={waterSeries}
            color={chartColor}
            xKey="label"
            yKey="value"
            height={200}
          />
          <ChartCard
            title="Sleep Hours"
            data={sleepSeries}
            color={chartColor}
            xKey="label"
            yKey="value"
            height={200}
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-slate-50 rounded-2xl p-4">
            <h2 className="text-base font-semibold mb-3">Recent Workouts</h2>
            <div className="space-y-2 text-sm text-slate-600">
              {filteredWorkouts.slice(0, 6).map((workout) => (
                <div key={workout._id} className="flex justify-between">
                  <span>{formatDate(workout.dateObj || workout.date)}</span>
                  <span>{workout.workouts?.length || 0} sessions</span>
                </div>
              ))}
              {!filteredWorkouts.length && <p>No workouts logged.</p>}
            </div>
          </div>
          <div className="bg-slate-50 rounded-2xl p-4">
            <h2 className="text-base font-semibold mb-3">Recent Meals</h2>
            <div className="space-y-2 text-sm text-slate-600">
              {filteredFoods.slice(0, 6).map((log) => (
                <div key={log._id} className="flex justify-between">
                  <span>{formatDate(log.date || log.createdAt)}</span>
                  <span>
                    {log.dailyTotals?.calories
                      ? `${Math.round(log.dailyTotals.calories)} kcal`
                      : "-"}
                  </span>
                </div>
              ))}
              {!filteredFoods.length && <p>No meals logged.</p>}
            </div>
          </div>
          <div className="bg-slate-50 rounded-2xl p-4">
            <h2 className="text-base font-semibold mb-3">Recent Sleep</h2>
            <div className="space-y-2 text-sm text-slate-600">
              {filteredSleeps.slice(0, 6).map((entry) => (
                <div key={entry._id} className="flex flex-col">
                  <span>{formatDate(entry.date || entry.sleep_time)}</span>
                  <span className="text-xs">
                    {formatDateTime(entry.sleep_time)} to{" "}
                    {formatDateTime(entry.wake_time)}
                  </span>
                </div>
              ))}
              {!filteredSleeps.length && <p>No sleep logs.</p>}
            </div>
          </div>
          <div className="bg-slate-50 rounded-2xl p-4">
            <h2 className="text-base font-semibold mb-3">Progress Benchmarks</h2>
            <div className="space-y-3">
              {benchmarks.map((item) => (
                <ProgressBar
                  key={item.label}
                  label={item.label}
                  current={item.current}
                  target={item.target}
                  unit={item.unit}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientDetail;
