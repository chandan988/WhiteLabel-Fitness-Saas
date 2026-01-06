import { useEffect, useState } from "react";
import { createWorkout, listWorkouts } from "../../services/api.js";

const emptyForm = {
  workoutName: "",
  category: "",
  subcategory: "",
  unit: "min",
  caloriesPerMin: "",
  caloriesPerRep: "",
  typicalRepsPerMin: "",
  notes: ""
};

const Workouts = () => {
  const [workouts, setWorkouts] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchWorkouts = async (query = "") => {
    setLoading(true);
    setError("");
    try {
      const { data } = await listWorkouts({ search: query });
      setWorkouts(data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load workouts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        workoutName: form.workoutName,
        category: form.category,
        subcategory: form.subcategory || null,
        unit: form.unit,
        caloriesPerMin: form.caloriesPerMin ? Number(form.caloriesPerMin) : null,
        caloriesPerRep: form.caloriesPerRep ? Number(form.caloriesPerRep) : null,
        typicalRepsPerMin: form.typicalRepsPerMin
          ? Number(form.typicalRepsPerMin)
          : null,
        notes: form.notes || null
      };
      await createWorkout(payload);
      setForm(emptyForm);
      fetchWorkouts(search);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save workout");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow px-10 py-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Workout Library
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage the master workout catalog used by all coaches.
        </p>
      </header>

      <main className="px-10 py-8 grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-8">
        <section className="space-y-4">
          <div className="bg-white rounded-3xl shadow-card p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <h2 className="text-lg font-semibold text-gray-900">
                All Workouts
              </h2>
              <div className="flex items-center gap-3">
                <input
                  className="w-full md:w-64 border border-gray-200 rounded-2xl px-4 py-2 text-sm"
                  placeholder="Search name or category"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
                <button
                  type="button"
                  className="px-4 py-2 rounded-2xl bg-gray-900 text-white text-sm"
                  onClick={() => fetchWorkouts(search)}
                >
                  Search
                </button>
              </div>
            </div>

            {loading ? (
              <p className="text-sm text-gray-500 mt-6">Loading workouts...</p>
            ) : (
              <div className="mt-6 overflow-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="py-3 pr-4">Workout</th>
                      <th className="py-3 pr-4">Category</th>
                      <th className="py-3 pr-4">Unit</th>
                      <th className="py-3 pr-4">Calories / min</th>
                      <th className="py-3 pr-4">Calories / rep</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700">
                    {workouts.map((workout) => (
                      <tr key={workout._id} className="border-b last:border-b-0">
                        <td className="py-3 pr-4 font-medium text-gray-900">
                          {workout.workoutName}
                        </td>
                        <td className="py-3 pr-4">
                          {workout.category || "-"}
                        </td>
                        <td className="py-3 pr-4">{workout.unit || "-"}</td>
                        <td className="py-3 pr-4">
                          {workout.caloriesPerMin ?? "-"}
                        </td>
                        <td className="py-3 pr-4">
                          {workout.caloriesPerRep ?? "-"}
                        </td>
                      </tr>
                    ))}
                    {!workouts.length && (
                      <tr>
                        <td
                          colSpan="5"
                          className="py-6 text-center text-gray-500"
                        >
                          No workouts found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        <aside className="bg-white rounded-3xl shadow-card p-6 h-fit">
          <h2 className="text-lg font-semibold text-gray-900">Add Workout</h2>
          <p className="text-sm text-gray-500 mt-1">
            Add a new movement to the global workout catalog.
          </p>
          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            <input
              className="w-full border border-gray-200 rounded-2xl px-4 py-2 text-sm"
              placeholder="Workout name"
              value={form.workoutName}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, workoutName: event.target.value }))
              }
              required
            />
            <input
              className="w-full border border-gray-200 rounded-2xl px-4 py-2 text-sm"
              placeholder="Category (Cardio, Strength)"
              value={form.category}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, category: event.target.value }))
              }
              required
            />
            <input
              className="w-full border border-gray-200 rounded-2xl px-4 py-2 text-sm"
              placeholder="Subcategory (optional)"
              value={form.subcategory}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, subcategory: event.target.value }))
              }
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                className="w-full border border-gray-200 rounded-2xl px-4 py-2 text-sm"
                placeholder="Unit (min/rep)"
                value={form.unit}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, unit: event.target.value }))
                }
              />
              <input
                type="number"
                step="0.01"
                className="w-full border border-gray-200 rounded-2xl px-4 py-2 text-sm"
                placeholder="Calories/min"
                value={form.caloriesPerMin}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    caloriesPerMin: event.target.value
                  }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                step="0.01"
                className="w-full border border-gray-200 rounded-2xl px-4 py-2 text-sm"
                placeholder="Calories/rep"
                value={form.caloriesPerRep}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    caloriesPerRep: event.target.value
                  }))
                }
              />
              <input
                type="number"
                className="w-full border border-gray-200 rounded-2xl px-4 py-2 text-sm"
                placeholder="Typical reps/min"
                value={form.typicalRepsPerMin}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    typicalRepsPerMin: event.target.value
                  }))
                }
              />
            </div>
            <textarea
              className="w-full border border-gray-200 rounded-2xl px-4 py-2 text-sm"
              placeholder="Notes (optional)"
              rows="3"
              value={form.notes}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, notes: event.target.value }))
              }
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-gray-900 text-white text-sm font-semibold"
              disabled={saving}
            >
              {saving ? "Saving..." : "Add Workout"}
            </button>
          </form>
        </aside>
      </main>
    </div>
  );
};

export default Workouts;
