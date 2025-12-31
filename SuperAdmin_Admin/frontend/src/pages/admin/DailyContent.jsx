import { useEffect, useState } from "react";
import {
  createDailyOverride,
  deleteDailyOverride,
  getAdminDailyContent,
  listDailyOverrides,
  updateDailyOverride
} from "../../services/api.js";

const todayKey = () => new Date().toISOString().slice(0, 10);

const emptyForm = {
  tipTitle: "",
  tipBody: "",
  quoteText: "",
  quoteAuthor: ""
};

const DailyContent = () => {
  const [dateKey, setDateKey] = useState(todayKey());
  const [defaultContent, setDefaultContent] = useState(null);
  const [override, setOverride] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [overrides, setOverrides] = useState([]);
  const [error, setError] = useState("");

  const loadOverrides = async () => {
    const { data } = await listDailyOverrides();
    setOverrides(data.data || []);
  };

  const loadContent = async (key) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await getAdminDailyContent({ date: key });
      setDefaultContent(data.defaultContent || null);
      setOverride(data.override || null);
      if (data.override) {
        setForm({
          tipTitle: data.override.tipTitle || "",
          tipBody: data.override.tipBody || "",
          quoteText: data.override.quoteText || "",
          quoteAuthor: data.override.quoteAuthor || ""
        });
      } else {
        setForm(emptyForm);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load daily content");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent(dateKey);
    loadOverrides();
  }, [dateKey]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      if (override?._id) {
        await updateDailyOverride(override._id, form);
      } else {
        await createDailyOverride({ dateKey, ...form });
      }
      await loadContent(dateKey);
      await loadOverrides();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save override");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!override?._id) return;
    setSaving(true);
    setError("");
    try {
      await deleteDailyOverride(override._id);
      await loadContent(dateKey);
      await loadOverrides();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete override");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow px-10 py-6">
        <p className="text-sm text-gray-500">Super Admin</p>
        <h1 className="text-2xl font-semibold text-gray-900">
          Daily Tips and Quotes
        </h1>
      </header>

      <main className="px-10 py-8 space-y-6">
        <div className="bg-white rounded-3xl shadow-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Select a day
              </h2>
              <p className="text-sm text-gray-500">
                Override the default tip and quote for special occasions.
              </p>
            </div>
            <input
              type="date"
              value={dateKey}
              onChange={(event) => setDateKey(event.target.value)}
              className="px-4 py-2 border rounded-xl text-sm"
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-6">
          <div className="bg-white rounded-3xl shadow-card p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Custom Override
            </h3>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Tip title
                </label>
                <input
                  className="mt-2 w-full rounded-2xl border px-4 py-3"
                  value={form.tipTitle}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      tipTitle: event.target.value
                    }))
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Tip body
                </label>
                <textarea
                  className="mt-2 w-full rounded-2xl border px-4 py-3 min-h-[120px]"
                  value={form.tipBody}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      tipBody: event.target.value
                    }))
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Quote
                </label>
                <textarea
                  className="mt-2 w-full rounded-2xl border px-4 py-3 min-h-[100px]"
                  value={form.quoteText}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      quoteText: event.target.value
                    }))
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Quote author
                </label>
                <input
                  className="mt-2 w-full rounded-2xl border px-4 py-3"
                  value={form.quoteAuthor}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      quoteAuthor: event.target.value
                    }))
                  }
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                className="bg-black text-white px-6 py-3 rounded-2xl font-semibold"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Override"}
              </button>
              {override?._id && (
                <button
                  className="text-sm font-semibold text-red-500"
                  onClick={handleDelete}
                  disabled={saving}
                >
                  Remove Override
                </button>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-card p-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Default Content
              </h3>
              {loading ? (
                <p className="text-sm text-gray-500">Loading...</p>
              ) : defaultContent ? (
                <div className="mt-4 space-y-3 text-sm text-gray-600">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {defaultContent.tipTitle}
                    </p>
                    <p>{defaultContent.tipBody}</p>
                  </div>
                  <div className="border-t pt-3">
                    <p className="italic">"{defaultContent.quoteText}"</p>
                    {defaultContent.quoteAuthor && (
                      <p className="mt-1 font-semibold">
                        - {defaultContent.quoteAuthor}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No default content found.
                </p>
              )}
            </div>

            <div className="bg-white rounded-3xl shadow-card p-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Upcoming Overrides
              </h3>
              {overrides.length ? (
                <div className="mt-4 space-y-3 text-sm text-gray-600">
                  {overrides.slice(0, 8).map((item) => (
                    <div
                      key={item._id}
                      className="border border-gray-100 rounded-2xl p-3"
                    >
                      <p className="text-xs text-gray-500">{item.dateKey}</p>
                      <p className="font-semibold text-gray-900">
                        {item.tipTitle}
                      </p>
                      <p className="text-xs italic mt-1">
                        "{item.quoteText}"
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No overrides scheduled.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DailyContent;
