import { useEffect, useState } from "react";
import { createFood, listFoods } from "../../services/api.js";

const emptyForm = {
  food_code: "",
  food_name: "",
  food_image: "",
  primarysource: "manual",
  energy_kj: "",
  energy_kcal: "",
  carb_g: "",
  protein_g: "",
  fat_g: "",
  fibre_g: "",
  freesugar_g: "",
  servings_unit: ""
};

const Meals = () => {
  const [foods, setFoods] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploadPreview, setUploadPreview] = useState("");
  const [uploadError, setUploadError] = useState("");

  const fetchFoods = async (query = "") => {
    setLoading(true);
    setError("");
    try {
      const { data } = await listFoods({ search: query });
      setFoods(data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load meals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadError("");
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      if (!result) {
        setUploadError("Unable to read image file.");
        return;
      }
      setForm((prev) => ({ ...prev, food_image: result }));
      setUploadPreview(result);
    };
    reader.onerror = () => {
      setUploadError("Unable to read image file.");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        food_code: form.food_code,
        food_name: form.food_name,
        food_image: form.food_image,
        primarysource: form.primarysource || "manual",
        energy_kj: form.energy_kj ? Number(form.energy_kj) : null,
        energy_kcal: form.energy_kcal ? Number(form.energy_kcal) : null,
        carb_g: form.carb_g ? Number(form.carb_g) : null,
        protein_g: form.protein_g ? Number(form.protein_g) : null,
        fat_g: form.fat_g ? Number(form.fat_g) : null,
        fibre_g: form.fibre_g ? Number(form.fibre_g) : null,
        freesugar_g: form.freesugar_g ? Number(form.freesugar_g) : null,
        servings_unit: form.servings_unit
      };
      await createFood(payload);
      setForm(emptyForm);
      setUploadPreview("");
      fetchFoods(search);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save meal");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow px-10 py-6">
        <h1 className="text-2xl font-semibold text-gray-900">Meal Library</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage the master food catalog available to all coaches.
        </p>
      </header>

      <main className="px-10 py-8 grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-8">
        <section className="space-y-4">
          <div className="bg-white rounded-3xl shadow-card p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <h2 className="text-lg font-semibold text-gray-900">
                All Meals
              </h2>
              <div className="flex items-center gap-3">
                <input
                  className="w-full md:w-64 border border-gray-200 rounded-2xl px-4 py-2 text-sm"
                  placeholder="Search meal name or code"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
                <button
                  type="button"
                  className="px-4 py-2 rounded-2xl bg-gray-900 text-white text-sm"
                  onClick={() => fetchFoods(search)}
                >
                  Search
                </button>
              </div>
            </div>

            {loading ? (
              <p className="text-sm text-gray-500 mt-6">Loading meals...</p>
            ) : (
              <div className="mt-6 overflow-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="py-3 pr-4">Meal</th>
                      <th className="py-3 pr-4">Code</th>
                      <th className="py-3 pr-4">Kcal</th>
                      <th className="py-3 pr-4">Carbs</th>
                      <th className="py-3 pr-4">Protein</th>
                      <th className="py-3 pr-4">Fat</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700">
                    {foods.map((food) => (
                      <tr key={food._id} className="border-b last:border-b-0">
                        <td className="py-3 pr-4 font-medium text-gray-900">
                          {food.food_name}
                        </td>
                        <td className="py-3 pr-4">{food.food_code || "-"}</td>
                        <td className="py-3 pr-4">
                          {food.energy_kcal ?? "-"}
                        </td>
                        <td className="py-3 pr-4">{food.carb_g ?? "-"}</td>
                        <td className="py-3 pr-4">{food.protein_g ?? "-"}</td>
                        <td className="py-3 pr-4">{food.fat_g ?? "-"}</td>
                      </tr>
                    ))}
                    {!foods.length && (
                      <tr>
                        <td
                          colSpan="6"
                          className="py-6 text-center text-gray-500"
                        >
                          No meals found.
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
          <h2 className="text-lg font-semibold text-gray-900">Add Meal</h2>
          <p className="text-sm text-gray-500 mt-1">
            Add a food item to the global food library.
          </p>
          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            <input
              className="w-full border border-gray-200 rounded-2xl px-4 py-2 text-sm"
              placeholder="Food name"
              value={form.food_name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, food_name: event.target.value }))
              }
              required
            />
            <input
              className="w-full border border-gray-200 rounded-2xl px-4 py-2 text-sm"
              placeholder="Food code (ASC001)"
              value={form.food_code}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, food_code: event.target.value }))
              }
            />
            <input
              className="w-full border border-gray-200 rounded-2xl px-4 py-2 text-sm"
              placeholder="Image URL"
              value={form.food_image}
              onChange={(event) => {
                const value = event.target.value;
                setForm((prev) => ({ ...prev, food_image: value }));
                setUploadPreview(value);
              }}
            />
            <div className="border border-dashed border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-500 flex flex-col gap-2">
              <label className="text-xs uppercase text-gray-400">
                Or Upload Image (stored as base64)
              </label>
              <input type="file" accept="image/*" onChange={handleImageUpload} />
              <span className="text-xs text-gray-400">
                Keep images small for faster loading.
              </span>
              {uploadError && (
                <span className="text-xs text-red-500">{uploadError}</span>
              )}
              {uploadPreview && (
                <img
                  src={uploadPreview}
                  alt="Meal preview"
                  className="w-20 h-20 rounded-xl object-cover border border-gray-200"
                />
              )}
            </div>
            <input
              className="w-full border border-gray-200 rounded-2xl px-4 py-2 text-sm"
              placeholder="Serving unit (cup, bowl)"
              value={form.servings_unit}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, servings_unit: event.target.value }))
              }
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                step="0.01"
                className="w-full border border-gray-200 rounded-2xl px-4 py-2 text-sm"
                placeholder="Energy (kcal)"
                value={form.energy_kcal}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, energy_kcal: event.target.value }))
                }
              />
              <input
                type="number"
                step="0.01"
                className="w-full border border-gray-200 rounded-2xl px-4 py-2 text-sm"
                placeholder="Energy (kj)"
                value={form.energy_kj}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, energy_kj: event.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <input
                type="number"
                step="0.01"
                className="w-full border border-gray-200 rounded-2xl px-4 py-2 text-sm"
                placeholder="Carbs (g)"
                value={form.carb_g}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, carb_g: event.target.value }))
                }
              />
              <input
                type="number"
                step="0.01"
                className="w-full border border-gray-200 rounded-2xl px-4 py-2 text-sm"
                placeholder="Protein (g)"
                value={form.protein_g}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, protein_g: event.target.value }))
                }
              />
              <input
                type="number"
                step="0.01"
                className="w-full border border-gray-200 rounded-2xl px-4 py-2 text-sm"
                placeholder="Fat (g)"
                value={form.fat_g}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, fat_g: event.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                step="0.01"
                className="w-full border border-gray-200 rounded-2xl px-4 py-2 text-sm"
                placeholder="Fibre (g)"
                value={form.fibre_g}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, fibre_g: event.target.value }))
                }
              />
              <input
                type="number"
                step="0.01"
                className="w-full border border-gray-200 rounded-2xl px-4 py-2 text-sm"
                placeholder="Free sugar (g)"
                value={form.freesugar_g}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    freesugar_g: event.target.value
                  }))
                }
              />
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-gray-900 text-white text-sm font-semibold"
              disabled={saving}
            >
              {saving ? "Saving..." : "Add Meal"}
            </button>
          </form>
        </aside>
      </main>
    </div>
  );
};

export default Meals;
