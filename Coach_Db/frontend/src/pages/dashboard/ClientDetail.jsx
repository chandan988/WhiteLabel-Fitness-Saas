import { useParams } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
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

const formatShortDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

const loadWatermarkDataUrl = (src, alpha = 0.06) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const maxSize = 600;
      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;
      if (width > maxSize || height > maxSize) {
        const ratio = Math.min(maxSize / width, maxSize / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      const imageData = ctx.getImageData(0, 0, width, height);
      for (let i = 0; i < imageData.data.length; i += 4) {
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];
        const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
        imageData.data[i] = gray;
        imageData.data[i + 1] = gray;
        imageData.data[i + 2] = gray;
        imageData.data[i + 3] = Math.round(imageData.data[i + 3] * alpha);
      }
      ctx.putImageData(imageData, 0, 0);
      resolve({ dataUrl: canvas.toDataURL("image/png"), width, height });
    };
    img.onerror = reject;
    img.src = src;
  });

const getObjectIdDate = (value) => {
  if (!value) return null;
  const hex = value.toString().slice(0, 8);
  if (hex.length < 8) return null;
  const seconds = parseInt(hex, 16);
  if (Number.isNaN(seconds)) return null;
  return new Date(seconds * 1000);
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
const dayLabels = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];
const mealTypeLabels = {
  breakfast: "Breakfast",
  morning_snack: "Morning Snack",
  lunch: "Lunch",
  evening_snack: "Evening Snack",
  dinner: "Dinner",
  snacks: "Snacks",
  other: "Other"
};
const mealTypeOrder = {
  breakfast: 1,
  morning_snack: 2,
  lunch: 3,
  evening_snack: 4,
  dinner: 5,
  snacks: 6,
  other: 7
};
const mealPlannerTypes = [
  "breakfast",
  "morning_snack",
  "lunch",
  "evening_snack",
  "dinner",
  "snacks",
  "other"
];

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

const buildSeriesStats = (series = []) => {
  const values = series.map((item) => Number(item.value) || 0);
  if (!values.length) {
    return { min: 0, max: 0, avg: 0, change: 0 };
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = average(values);
  const change = values[values.length - 1] - values[0];
  return { min, max, avg, change };
};

const formatDelta = (value, unit = "") => {
  const rounded = Math.round(value * 10) / 10;
  const sign = rounded > 0 ? "+" : "";
  return `${sign}${rounded}${unit}`;
};

const getWeekStartString = (value) => {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) {
    return getWeekStartString();
  }
  const day = date.getDay();
  const start = new Date(date);
  start.setDate(start.getDate() - day);
  start.setHours(0, 0, 0, 0);
  return start.toISOString().slice(0, 10);
};

const parseDateInput = (value) => {
  if (!value) return new Date();
  const parts = value.split("-").map(Number);
  if (parts.length === 3 && parts.every((part) => !Number.isNaN(part))) {
    const [year, month, day] = parts;
    return new Date(year, month - 1, day);
  }
  return new Date(value);
};

const toDateInputValue = (value) => {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const groupItemsByDay = (items = []) => {
  const map = new Map();
  items.forEach((item) => {
    const day =
      Number.isFinite(Number(item.dayOfWeek)) && item.dayOfWeek >= 0
        ? Number(item.dayOfWeek)
        : new Date(item.assignedAt || Date.now()).getDay();
    if (!map.has(day)) {
      map.set(day, []);
    }
    map.get(day).push(item);
  });
  return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
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
    updateWorkoutStatus,
    updateMealStatus,
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
  const [selectedWorkoutIds, setSelectedWorkoutIds] = useState([]);
  const [foodQuery, setFoodQuery] = useState("");
  const [foodResults, setFoodResults] = useState([]);
  const [selectedFoodIds, setSelectedFoodIds] = useState([]);
  const [mealType, setMealType] = useState("breakfast");
  const [showMealPlanner, setShowMealPlanner] = useState(false);
  const [showWorkoutPlanner, setShowWorkoutPlanner] = useState(false);
  const [mealPlanDate, setMealPlanDate] = useState(toDateInputValue());
  const [workoutPlanDate, setWorkoutPlanDate] = useState(toDateInputValue());
  const [workoutNotes, setWorkoutNotes] = useState("");
  const [workoutDuration, setWorkoutDuration] = useState("");
  const [mealNotes, setMealNotes] = useState("");
  const [actionError, setActionError] = useState("");

  const updateChartVariant = (key, next) => {
    setChartVariants((prev) => ({ ...prev, [key]: next }));
  };

  const openMealPlanner = () => {
    if (!mealPlanDate) {
      setMealPlanDate(toDateInputValue());
    }
    setShowMealPlanner(true);
  };

  const openWorkoutPlanner = () => {
    if (!workoutPlanDate) {
      setWorkoutPlanDate(toDateInputValue());
    }
    setShowWorkoutPlanner(true);
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

  const stepsStats = useMemo(() => buildSeriesStats(stepsSeries), [stepsSeries]);
  const caloriesStats = useMemo(
    () => buildSeriesStats(caloriesSeries),
    [caloriesSeries]
  );
  const weightStats = useMemo(
    () => buildSeriesStats(weightSeries),
    [weightSeries]
  );
  const waterStats = useMemo(() => buildSeriesStats(waterSeries), [waterSeries]);
  const sleepStats = useMemo(() => buildSeriesStats(sleepSeries), [sleepSeries]);

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

  const benchmarkScore = useMemo(() => {
    if (!benchmarks.length) return 0;
    const score =
      benchmarks.reduce((sum, item) => {
        if (!item.target) return sum;
        return sum + Math.min(item.current / item.target, 1);
      }, 0) / benchmarks.length;
    return Math.round(score * 10 * 10) / 10;
  }, [benchmarks]);

  const scorePercent = Math.min(Math.max(benchmarkScore / 10, 0), 1);
  const scoreLabel = period === "month" ? "30 Day Score" : "Weekly Score";

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

  const toggleWorkoutSelection = (workoutId) => {
    setSelectedWorkoutIds((prev) =>
      prev.includes(workoutId)
        ? prev.filter((idValue) => idValue !== workoutId)
        : [...prev, workoutId]
    );
  };

  const toggleFoodSelection = (foodId) => {
    setSelectedFoodIds((prev) =>
      prev.includes(foodId)
        ? prev.filter((idValue) => idValue !== foodId)
        : [...prev, foodId]
    );
  };

  const handleAssignWorkout = async (workoutId) => {
    setActionError("");
    try {
      const workoutDate = parseDateInput(workoutPlanDate);
      const workoutWeekStart = getWeekStartString(workoutDate);
      await assignWorkout({
        workoutId,
        workoutIds: workoutId ? undefined : selectedWorkoutIds,
        duration: workoutDuration,
        notes: workoutNotes,
        weekStart: workoutWeekStart,
        dayOfWeek: workoutDate.getDay(),
        applyToWeek: false
      });
      setSelectedWorkoutIds([]);
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to assign workout");
    }
  };

  const handleAssignMeal = async (foodId) => {
    setActionError("");
    try {
      const mealDateValue = parseDateInput(mealPlanDate);
      const mealWeekStart = getWeekStartString(mealDateValue);
      await assignMeal({
        foodId,
        foodIds: foodId ? undefined : selectedFoodIds,
        mealType,
        notes: mealNotes,
        weekStart: mealWeekStart,
        dayOfWeek: mealDateValue.getDay(),
        applyToWeek: false
      });
      setSelectedFoodIds([]);
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to assign meal");
    }
  };

  const handleWorkoutCompletion = async (itemId) => {
    setActionError("");
    try {
      await updateWorkoutStatus({ status: "completed", itemId });
    } catch (err) {
      setActionError(
        err.response?.data?.message || "Failed to update workout status"
      );
    }
  };

  const handleMealCompletion = async (itemId) => {
    setActionError("");
    try {
      await updateMealStatus({ status: "completed", itemId });
    } catch (err) {
      setActionError(
        err.response?.data?.message || "Failed to update meal status"
      );
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
    const header = node.querySelector("[data-report-header]");
    const body = node.querySelector("[data-report-body]");
    if (!header || !body) return;

    const headerCanvas = await html2canvas(header, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff"
    });
    const headerImg = headerCanvas.toDataURL("image/png");

    let watermark = null;
    try {
      watermark = await loadWatermarkDataUrl(branding.logoUrl, 0.08);
    } catch (err) {
      watermark = null;
    }

    const pdf = new jsPDF("p", "pt", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 24;
    const headerHeight = 90;
    const availableHeight = pageHeight - headerHeight - margin * 2;
    const imgWidth = pageWidth - margin * 2;

    const addHeader = () => {
      pdf.addImage(headerImg, "PNG", margin, 16, imgWidth, headerHeight - 24);
    };

    const sections = Array.from(
      body.querySelectorAll("[data-report-section]")
    );

    let cursorY = headerHeight + margin;
    addHeader();

    const addWatermark = () => {
      if (!watermark?.dataUrl) return;
      const watermarkWidth = pageWidth * 0.55;
      const ratio = watermark.height / watermark.width || 1;
      const watermarkHeight = watermarkWidth * ratio;
      pdf.addImage(
        watermark.dataUrl,
        "PNG",
        (pageWidth - watermarkWidth) / 2,
        (pageHeight - watermarkHeight) / 2,
        watermarkWidth,
        watermarkHeight
      );
    };

    for (const section of sections) {
      const sectionCanvas = await html2canvas(section, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff"
      });
      const sectionImg = sectionCanvas.toDataURL("image/png");
      const baseHeight =
        (sectionCanvas.height * imgWidth) / sectionCanvas.width;
      let renderWidth = imgWidth;
      let renderHeight = baseHeight;
      let renderX = margin;

      if (baseHeight > availableHeight) {
        const scale = availableHeight / baseHeight;
        renderWidth = imgWidth * scale;
        renderHeight = baseHeight * scale;
        renderX = margin + (imgWidth - renderWidth) / 2;
      }

      if (cursorY + renderHeight > pageHeight - margin) {
        addWatermark();
        pdf.addPage();
        addHeader();
        cursorY = headerHeight + margin;
      }

      pdf.addImage(
        sectionImg,
        "PNG",
        renderX,
        cursorY,
        renderWidth,
        renderHeight
      );
      cursorY += renderHeight + 16;
    }

    addWatermark();

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

  const planWeekKey = (value) => {
    if (!value) return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed.toISOString().slice(0, 10);
  };
  const mealPlanDateValue = parseDateInput(mealPlanDate);
  const workoutPlanDateValue = parseDateInput(workoutPlanDate);
  const mealPlanWeekKey = planWeekKey(client.mealPlan?.weekStart);
  const workoutPlanWeekKey = planWeekKey(client.workoutPlan?.weekStart);
  const selectedMealWeekKey = planWeekKey(
    getWeekStartString(mealPlanDateValue)
  );
  const selectedWorkoutWeekKey = planWeekKey(
    getWeekStartString(workoutPlanDateValue)
  );
  const visibleMealItems =
    mealPlanWeekKey && selectedMealWeekKey && mealPlanWeekKey === selectedMealWeekKey
      ? client.mealPlan?.items || []
      : [];
  const visibleWorkoutItems =
    workoutPlanWeekKey &&
    selectedWorkoutWeekKey &&
    workoutPlanWeekKey === selectedWorkoutWeekKey
      ? client.workoutPlan?.items || []
      : [];
  const mealDayIndex = mealPlanDateValue.getDay();
  const workoutDayIndex = workoutPlanDateValue.getDay();
  const getMealItemsForCell = (dayIndex, type) =>
    visibleMealItems
      .filter((item) => {
        const mealKey = item.mealType || "other";
        const day =
          Number.isFinite(Number(item.dayOfWeek)) && item.dayOfWeek >= 0
            ? Number(item.dayOfWeek)
            : new Date(item.assignedAt || Date.now()).getDay();
        return day === dayIndex && mealKey === type;
      })
      .sort((a, b) => new Date(a.assignedAt) - new Date(b.assignedAt));
  const getWorkoutItemsForDay = (dayIndex) =>
    visibleWorkoutItems
      .filter((item) => {
        const day =
          Number.isFinite(Number(item.dayOfWeek)) && item.dayOfWeek >= 0
            ? Number(item.dayOfWeek)
            : new Date(item.assignedAt || Date.now()).getDay();
        return day === dayIndex;
      })
      .sort((a, b) => new Date(a.assignedAt) - new Date(b.assignedAt));
  const mealItemsForSelectedDate = mealPlannerTypes.flatMap((type) =>
    getMealItemsForCell(mealDayIndex, type)
  );
  const mealGroups = mealItemsForSelectedDate.reduce((acc, item) => {
    const key = item.mealType || "other";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
  const mealGroupKeys = Object.keys(mealGroups).sort(
    (a, b) => (mealTypeOrder[a] || 99) - (mealTypeOrder[b] || 99)
  );
  const workoutItemsForSelectedDate = getWorkoutItemsForDay(workoutDayIndex);
  const mealDateLabel = formatShortDate(mealPlanDateValue);
  const workoutDateLabel = formatShortDate(workoutPlanDateValue);

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
            <div>
              <h4 className="text-sm font-semibold text-brand-ink">
                Daily Plan Builder
              </h4>
              <p className="text-sm text-brand-muted">
                Assign meals or workouts for a specific date.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <PrimaryButton
                  className="w-auto px-5"
                  onClick={openMealPlanner}
                >
                  Open Meal Planner
                </PrimaryButton>
                <PrimaryButton
                  className="w-auto px-5"
                  onClick={openWorkoutPlanner}
                >
                  Open Workout Planner
                </PrimaryButton>
              </div>
              <p className="text-xs text-brand-muted mt-3">
                Pick a date, then search and assign items.
              </p>
            </div>
            {actionError && (
              <p className="text-xs text-red-500">{actionError}</p>
            )}
          </div>

          <div className="bg-brand-card rounded-3xl shadow-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-semibold text-brand-ink">
                  Assigned Meals
                </h4>
                <p className="text-xs text-brand-muted">
                  {dayLabels[mealDayIndex]} · {mealDateLabel}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={mealPlanDate}
                  onChange={(event) => setMealPlanDate(event.target.value)}
                  className="px-3 py-2 rounded-xl border border-brand-border text-xs"
                />
                <button
                  type="button"
                  className="text-xs font-semibold text-brand-primary"
                  onClick={openMealPlanner}
                >
                  Plan Meals
                </button>
              </div>
            </div>
            <div className="border border-brand-border rounded-2xl p-4 space-y-3">
              {mealGroupKeys.length ? (
                mealGroupKeys.map((mealKey) => (
                  <div key={mealKey} className="space-y-2">
                    <p className="text-xs font-semibold text-brand-muted uppercase tracking-wide">
                      {mealTypeLabels[mealKey] || "Other"}
                    </p>
                    <div className="space-y-2">
                      {mealGroups[mealKey].map((item) => (
                        <div
                          key={item._id}
                          className="flex items-center justify-between text-xs"
                        >
                          <span className="text-brand-ink">
                            {item.foodName || "Meal"}
                          </span>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-1 rounded-full text-[10px] font-semibold ${
                                item.status === "completed"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {item.status === "completed"
                                ? "Completed"
                                : "Assigned"}
                            </span>
                            {item.status !== "completed" && (
                              <button
                                type="button"
                                className="text-[10px] font-semibold text-brand-primary"
                                onClick={() => handleMealCompletion(item._id)}
                                disabled={assigning}
                              >
                                Mark as Eaten
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-brand-muted">
                  No meals assigned for this date.
                </p>
              )}
            </div>
          </div>

          <div className="bg-brand-card rounded-3xl shadow-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-semibold text-brand-ink">
                  Assigned Workouts
                </h4>
                <p className="text-xs text-brand-muted">
                  {dayLabels[workoutDayIndex]} · {workoutDateLabel}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={workoutPlanDate}
                  onChange={(event) => setWorkoutPlanDate(event.target.value)}
                  className="px-3 py-2 rounded-xl border border-brand-border text-xs"
                />
                <button
                  type="button"
                  className="text-xs font-semibold text-brand-primary"
                  onClick={openWorkoutPlanner}
                >
                  Plan Workouts
                </button>
              </div>
            </div>
            <div className="border border-brand-border rounded-2xl p-4 space-y-2">
              {workoutItemsForSelectedDate.length ? (
                workoutItemsForSelectedDate.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-brand-ink">
                      {item.workoutName || item.name || "Workout"}
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-[10px] font-semibold ${
                          item.status === "completed"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {item.status === "completed" ? "Completed" : "Assigned"}
                      </span>
                      {item.status !== "completed" && (
                        <button
                          type="button"
                          className="text-[10px] font-semibold text-brand-primary"
                          onClick={() => handleWorkoutCompletion(item._id)}
                          disabled={assigning}
                        >
                          Mark as Done
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-brand-muted">
                  No workouts assigned for this date.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {showMealPlanner && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-7xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-brand-ink">
                  Daily Meal Planner
                </h3>
                <p className="text-sm text-brand-muted">
                  Assign meals for a specific date.
                </p>
              </div>
              <button
                type="button"
                className="text-sm text-brand-muted"
                onClick={() => setShowMealPlanner(false)}
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.8fr)_minmax(320px,1fr)] gap-6">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-4">
                  <label className="text-sm text-brand-muted">
                    Plan date
                  </label>
                  <input
                    type="date"
                    value={mealPlanDate}
                    onChange={(event) => setMealPlanDate(event.target.value)}
                    className="px-3 py-2 rounded-xl border border-brand-border text-sm"
                  />
                  <span className="text-xs text-brand-muted">
                    {dayLabels[mealDayIndex]}
                  </span>
                </div>

                <div className="border border-brand-border rounded-2xl p-4 space-y-3">
                  {mealPlannerTypes.map((mealKey) => {
                    const items = getMealItemsForCell(mealDayIndex, mealKey);
                    const isSelected = mealType === mealKey;
                    return (
                      <button
                        key={mealKey}
                        type="button"
                        onClick={() => setMealType(mealKey)}
                        className={`w-full rounded-2xl border p-3 text-left transition ${
                          isSelected
                            ? "border-brand-primary bg-brand-primary/10"
                            : "border-brand-border"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-brand-ink">
                            {mealTypeLabels[mealKey] || "Other"}
                          </span>
                          <span className="text-xs text-brand-muted">
                            {items.length} item{items.length === 1 ? "" : "s"}
                          </span>
                        </div>
                        {items.length ? (
                          <div className="mt-2 space-y-1">
                            {items.slice(0, 2).map((item) => (
                              <div
                                key={item._id}
                                className="text-xs text-brand-muted truncate"
                              >
                                {item.foodName}
                              </div>
                            ))}
                            {items.length > 2 && (
                              <div className="text-[10px] text-brand-muted">
                                +{items.length - 2} more
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="mt-2 text-xs text-brand-muted">
                            No meals assigned yet.
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-brand-subtle rounded-2xl p-4 text-sm text-brand-muted">
                  <p className="font-semibold text-brand-ink">
                    Selected: {mealTypeLabels[mealType] || "Other"} ·{" "}
                    {mealDateLabel}
                  </p>
                  <p className="text-xs mt-1">
                    Assign meals for this date.
                  </p>
                </div>

                <TextInput
                  label="Search foods"
                  placeholder="Search meal items"
                  value={foodQuery}
                  onChange={(event) => setFoodQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      handleFoodSearch();
                    }
                  }}
                />
                <PrimaryButton
                  type="button"
                  className="w-full"
                  onClick={handleFoodSearch}
                  disabled={libraryLoading}
                >
                  {libraryLoading ? "Searching..." : "Search Foods"}
                </PrimaryButton>

                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {foodResults.map((food) => {
                    const id = food._id || food.id;
                    const isSelected = selectedFoodIds.includes(id);
                    return (
                      <div
                        key={id}
                        className={`border rounded-2xl p-3 ${
                          isSelected
                            ? "border-brand-primary bg-brand-primary/5"
                            : "border-brand-border"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-brand-ink">
                              {food.food_name || food.foodName}
                            </p>
                            <p className="text-xs text-brand-muted">
                              {Math.round(food.energy_kcal || 0)} kcal -{" "}
                              {food.servings_unit || food.servingsUnit || "-"}
                            </p>
                          </div>
                          <button
                            type="button"
                            className="text-xs font-semibold text-brand-primary"
                            onClick={() => toggleFoodSelection(id)}
                          >
                            {isSelected ? "Selected" : "Select"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {!foodResults.length && (
                    <p className="text-xs text-brand-muted">
                      Search for meals to assign.
                    </p>
                  )}
                </div>

                <TextInput
                  label="Notes"
                  placeholder="Optional notes for this plan"
                  value={mealNotes}
                  onChange={(event) => setMealNotes(event.target.value)}
                />

                <PrimaryButton
                  type="button"
                  className="w-full"
                  onClick={() => handleAssignMeal()}
                  disabled={
                    assigning || !selectedFoodIds.length
                  }
                >
                  {assigning ? "Assigning..." : "Assign Selected Meals"}
                </PrimaryButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {showWorkoutPlanner && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-7xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-brand-ink">
                  Daily Workout Planner
                </h3>
                <p className="text-sm text-brand-muted">
                  Assign workouts for a specific date.
                </p>
              </div>
              <button
                type="button"
                className="text-sm text-brand-muted"
                onClick={() => setShowWorkoutPlanner(false)}
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.8fr)_minmax(320px,1fr)] gap-6">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-4">
                  <label className="text-sm text-brand-muted">
                    Plan date
                  </label>
                  <input
                    type="date"
                    value={workoutPlanDate}
                    onChange={(event) => setWorkoutPlanDate(event.target.value)}
                    className="px-3 py-2 rounded-xl border border-brand-border text-sm"
                  />
                  <span className="text-xs text-brand-muted">
                    {dayLabels[workoutDayIndex]}
                  </span>
                </div>

                <div className="border border-brand-border rounded-2xl p-4 space-y-2">
                  {workoutItemsForSelectedDate.length ? (
                    workoutItemsForSelectedDate.map((item) => (
                      <div key={item._id} className="flex items-center justify-between text-xs">
                        <span className="text-brand-ink">
                          {item.workoutName || item.name}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-[10px] font-semibold ${
                            item.status === "completed"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {item.status === "completed" ? "Completed" : "Assigned"}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-brand-muted">
                      No workouts assigned for this date.
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-brand-subtle rounded-2xl p-4 text-sm text-brand-muted">
                  <p className="font-semibold text-brand-ink">
                    Selected: {workoutDateLabel}
                  </p>
                  <p className="text-xs mt-1">
                    Assign workouts for this date.
                  </p>
                </div>

                <TextInput
                  label="Search workouts"
                  placeholder="Search workout library"
                  value={workoutQuery}
                  onChange={(event) => setWorkoutQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      handleWorkoutSearch();
                    }
                  }}
                />
                <PrimaryButton
                  type="button"
                  className="w-full"
                  onClick={handleWorkoutSearch}
                  disabled={libraryLoading}
                >
                  {libraryLoading ? "Searching..." : "Search Workouts"}
                </PrimaryButton>

                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {workoutResults.map((workout) => {
                    const id = workout._id || workout.id;
                    const name =
                      workout.workoutName ||
                      workout.workout_name ||
                      workout.name;
                    const isSelected = selectedWorkoutIds.includes(id);
                    return (
                      <div
                        key={id}
                        className={`border rounded-2xl p-3 ${
                          isSelected
                            ? "border-brand-primary bg-brand-primary/5"
                            : "border-brand-border"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-brand-ink">
                              {name}
                            </p>
                            <p className="text-xs text-brand-muted">
                              {workout.category || workout.type || "Workout"}
                            </p>
                          </div>
                          <button
                            type="button"
                            className="text-xs font-semibold text-brand-primary"
                            onClick={() => toggleWorkoutSelection(id)}
                          >
                            {isSelected ? "Selected" : "Select"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {!workoutResults.length && (
                    <p className="text-xs text-brand-muted">
                      Search for workouts to assign.
                    </p>
                  )}
                </div>

                <TextInput
                  label="Duration (minutes)"
                  placeholder="30"
                  value={workoutDuration}
                  onChange={(event) => setWorkoutDuration(event.target.value)}
                />
                <TextInput
                  label="Notes"
                  placeholder="Optional workout notes"
                  value={workoutNotes}
                  onChange={(event) => setWorkoutNotes(event.target.value)}
                />

                <PrimaryButton
                  type="button"
                  className="w-full"
                  onClick={() => handleAssignWorkout()}
                  disabled={
                    assigning || !selectedWorkoutIds.length
                  }
                >
                  {assigning ? "Assigning..." : "Assign Selected Workouts"}
                </PrimaryButton>
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        ref={reportRef}
        style={{ position: "absolute", left: "-10000px", top: 0, width: 900 }}
        className="bg-white text-slate-900 p-10 space-y-6"
      >
        <div
          data-report-header
          className="flex items-center justify-between border-b border-slate-200 pb-6"
        >
          <div className="flex items-center gap-4">
            <img
              src={branding.logoUrl}
              alt={branding.appName}
              className="h-10 w-24 object-contain"
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
          </div>
        </div>

        <div data-report-body className="space-y-6">
          <div
            data-report-section
            className="bg-slate-50 rounded-2xl p-5 flex items-center justify-between gap-6"
          >
            <div className="flex-1">
              <p className="text-xs uppercase text-slate-500">{scoreLabel}</p>
              <p className="text-3xl font-semibold text-slate-900">
                {benchmarkScore}/10
              </p>
              <p className="text-xs text-slate-500">
                Benchmarks achieved this period
              </p>
              <div className="mt-3 text-xs text-slate-600 space-y-1">
                <p>
                  Avg Steps:{" "}
                  <span className="font-semibold text-slate-900">
                    {Math.round(stepsStats.avg)}
                  </span>
                </p>
                <p>
                  Avg Sleep:{" "}
                  <span className="font-semibold text-slate-900">
                    {Math.round(sleepStats.avg * 10) / 10} hrs
                  </span>
                </p>
                <p>
                  Avg Water:{" "}
                  <span className="font-semibold text-slate-900">
                    {Math.round(waterStats.avg * 10) / 10} glasses
                  </span>
                </p>
                <p>
                  Avg Calories:{" "}
                  <span className="font-semibold text-slate-900">
                    {Math.round(caloriesStats.avg)} kcal
                  </span>
                </p>
              </div>
            </div>
            <div className="shrink-0">
              <div
                className="h-28 w-28 rounded-full flex items-center justify-center"
                style={{
                  background: `conic-gradient(${chartColor} ${Math.round(
                    scorePercent * 360
                  )}deg, #e2e8f0 0deg)`
                }}
              >
                <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center">
                  <span className="text-lg font-semibold text-slate-900">
                    {benchmarkScore}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div data-report-section className="grid grid-cols-3 gap-4">
            {summaryCards.map((card) => (
              <div key={card.label} className="bg-slate-50 rounded-2xl p-4">
                <p className="text-xs uppercase text-slate-500">{card.label}</p>
                <p className="text-lg font-semibold text-slate-900 mt-2">
                  {card.value}
                </p>
              </div>
            ))}
          </div>

          <div data-report-section className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <ChartCard
                title="Steps Trend"
                data={stepsSeries}
                color={chartColor}
                xKey="label"
                yKey="value"
                height={200}
              />
              <div className="bg-slate-50 rounded-2xl p-4 text-xs text-slate-600">
                <p className="text-sm font-semibold text-slate-700 mb-2">
                  Weekly Steps Summary
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <p>
                    Avg:{" "}
                    <span className="font-semibold text-slate-900">
                      {Math.round(stepsStats.avg)}
                    </span>
                  </p>
                  <p>
                    Max:{" "}
                    <span className="font-semibold text-slate-900">
                      {Math.round(stepsStats.max)}
                    </span>
                  </p>
                  <p>
                    Min:{" "}
                    <span className="font-semibold text-slate-900">
                      {Math.round(stepsStats.min)}
                    </span>
                  </p>
                  <p>
                    Change:{" "}
                    <span className="font-semibold text-slate-900">
                      {formatDelta(stepsStats.change)}
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <ChartCard
                title="Calories Intake"
                data={caloriesSeries}
                color={chartColor}
                xKey="label"
                yKey="value"
                height={200}
              />
              <div className="bg-slate-50 rounded-2xl p-4 text-xs text-slate-600">
                <p className="text-sm font-semibold text-slate-700 mb-2">
                  Weekly Calories Summary
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <p>
                    Avg:{" "}
                    <span className="font-semibold text-slate-900">
                      {Math.round(caloriesStats.avg)} kcal
                    </span>
                  </p>
                  <p>
                    Max:{" "}
                    <span className="font-semibold text-slate-900">
                      {Math.round(caloriesStats.max)} kcal
                    </span>
                  </p>
                  <p>
                    Min:{" "}
                    <span className="font-semibold text-slate-900">
                      {Math.round(caloriesStats.min)} kcal
                    </span>
                  </p>
                  <p>
                    Change:{" "}
                    <span className="font-semibold text-slate-900">
                      {formatDelta(caloriesStats.change, " kcal")}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div data-report-section className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <ChartCard
                title="Weight Trend"
                data={weightSeries}
                color={chartColor}
                xKey="label"
                yKey="value"
                height={200}
              />
              <div className="bg-slate-50 rounded-2xl p-4 text-xs text-slate-600">
                <p className="text-sm font-semibold text-slate-700 mb-2">
                  Weekly Weight Summary
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <p>
                    Avg:{" "}
                    <span className="font-semibold text-slate-900">
                      {Math.round(weightStats.avg * 10) / 10} kg
                    </span>
                  </p>
                  <p>
                    Max:{" "}
                    <span className="font-semibold text-slate-900">
                      {Math.round(weightStats.max * 10) / 10} kg
                    </span>
                  </p>
                  <p>
                    Min:{" "}
                    <span className="font-semibold text-slate-900">
                      {Math.round(weightStats.min * 10) / 10} kg
                    </span>
                  </p>
                  <p>
                    Change:{" "}
                    <span className="font-semibold text-slate-900">
                      {formatDelta(weightStats.change, " kg")}
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <ChartCard
                title="Water Intake"
                data={waterSeries}
                color={chartColor}
                xKey="label"
                yKey="value"
                height={200}
              />
              <div className="bg-slate-50 rounded-2xl p-4 text-xs text-slate-600">
                <p className="text-sm font-semibold text-slate-700 mb-2">
                  Weekly Water Summary
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <p>
                    Avg:{" "}
                    <span className="font-semibold text-slate-900">
                      {Math.round(waterStats.avg * 10) / 10} glasses
                    </span>
                  </p>
                  <p>
                    Max:{" "}
                    <span className="font-semibold text-slate-900">
                      {Math.round(waterStats.max * 10) / 10} glasses
                    </span>
                  </p>
                  <p>
                    Min:{" "}
                    <span className="font-semibold text-slate-900">
                      {Math.round(waterStats.min * 10) / 10} glasses
                    </span>
                  </p>
                  <p>
                    Change:{" "}
                    <span className="font-semibold text-slate-900">
                      {formatDelta(waterStats.change)}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div data-report-section className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <ChartCard
                title="Sleep Hours"
                data={sleepSeries}
                color={chartColor}
                xKey="label"
                yKey="value"
                height={200}
              />
              <div className="bg-slate-50 rounded-2xl p-4 text-xs text-slate-600">
                <p className="text-sm font-semibold text-slate-700 mb-2">
                  Weekly Sleep Summary
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <p>
                    Avg:{" "}
                    <span className="font-semibold text-slate-900">
                      {Math.round(sleepStats.avg * 10) / 10} hrs
                    </span>
                  </p>
                  <p>
                    Max:{" "}
                    <span className="font-semibold text-slate-900">
                      {Math.round(sleepStats.max * 10) / 10} hrs
                    </span>
                  </p>
                  <p>
                    Min:{" "}
                    <span className="font-semibold text-slate-900">
                      {Math.round(sleepStats.min * 10) / 10} hrs
                    </span>
                  </p>
                  <p>
                    Change:{" "}
                    <span className="font-semibold text-slate-900">
                      {formatDelta(sleepStats.change, " hrs")}
                    </span>
                  </p>
                </div>
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
          </div>

          <div data-report-section className="grid grid-cols-2 gap-6">
            <div className="bg-slate-50 rounded-2xl p-4">
              <h2 className="text-base font-semibold mb-3">Recent Workouts</h2>
              <div className="space-y-3 text-sm text-slate-600">
                {filteredWorkouts.slice(0, 6).map((workout) => (
                  <div key={workout._id} className="space-y-1">
                    <div className="flex justify-between">
                      <span>{formatDate(workout.dateObj || workout.date)}</span>
                      <span>{workout.workouts?.length || 0} sessions</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {(workout.workouts || [])
                        .map(
                          (item) =>
                            item.workoutName ||
                            item.activity ||
                            item.name ||
                            item.type
                        )
                        .filter(Boolean)
                        .slice(0, 4)
                        .join(", ") || "Workout logged"}
                    </p>
                  </div>
                ))}
                {!filteredWorkouts.length && <p>No workouts logged.</p>}
              </div>
            </div>
                        <div className="bg-slate-50 rounded-2xl p-4">
              <h2 className="text-base font-semibold mb-3">Recent Meals</h2>
              <div className="text-sm text-slate-600">
                <div className="grid grid-cols-[1.4fr_0.6fr_0.5fr] gap-3 text-[11px] uppercase text-slate-400 mb-2">
                  <span>Meals</span>
                  <span>Date</span>
                  <span className="text-right">Kcal</span>
                </div>
                <div className="space-y-3">
                  {filteredFoods.slice(0, 6).map((log) => {
                    const mealSummary =
                      (log.meals || [])
                        .map((meal) => {
                          const label = meal.mealType || meal.name || "Meal";
                          const items = (meal.items || [])
                            .map(
                              (item) =>
                                item.name ||
                                item.foodName ||
                                item.food_name ||
                                item.title
                            )
                            .filter(Boolean)
                            .slice(0, 3);
                          if (items.length) {
                            return `${label}: ${items.join(", ")}`;
                          }
                          return label;
                        })
                        .filter(Boolean)
                        .join(", ") || "Meals logged";

                    return (
                      <div
                        key={log._id}
                        className="grid grid-cols-[1.4fr_0.6fr_0.5fr] gap-3 text-sm"
                      >
                        <span className="text-slate-700 font-medium">
                          {mealSummary}
                        </span>
                        <span className="text-slate-500">
                          {formatDate(log.date || log.createdAt)}
                        </span>
                        <span className="text-right text-slate-700 font-semibold">
                          {log.dailyTotals?.calories
                            ? `${Math.round(log.dailyTotals.calories)}`
                            : "-"}
                        </span>
                      </div>
                    );
                  })}
                  {!filteredFoods.length && <p>No meals logged.</p>}
                </div>
              </div>
            </div><div className="bg-slate-50 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-semibold">Progress Benchmarks</h2>
                <span className="text-sm font-semibold text-slate-700">
                  Score: {benchmarkScore}/10
                </span>
              </div>
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
      </div>
    </DashboardLayout>
  );
};

export default ClientDetail;


