import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "./DashboardLayout.jsx";
import PrimaryButton from "../../components/PrimaryButton.jsx";
import TextInput from "../../components/TextInput.jsx";
import {
  createPricingPlan,
  deletePricingPlan,
  getPricingPlans,
  updatePricingPlan
} from "../../services/api.js";

const emptyForm = {
  tier: "standard",
  name: "Standard",
  price: "0",
  currency: "INR",
  description: "",
  features: ""
};

const tierLabels = {
  standard: "Standard",
  silver: "Silver",
  gold: "Gold",
  diamond: "Diamond"
};

const PricingPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingPlan, setEditingPlan] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetchPlans = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await getPricingPlans();
      setPlans(data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load pricing plans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const usedTiers = useMemo(
    () => new Set(plans.map((plan) => plan.tier)),
    [plans]
  );

  const planCount = plans.length;
  const canAddMore = planCount < 4 || editingPlan;

  const resetForm = () => {
    setEditingPlan(null);
    setForm(emptyForm);
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setForm({
      tier: plan.tier || "standard",
      name: plan.name || "",
      price: plan.price?.toString?.() || "0",
      currency: plan.currency || "INR",
      description: plan.description || "",
      features: (plan.features || []).join("\n")
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    const tierLabel = tierLabels[form.tier] || form.tier;
    const tierAlreadyUsed =
      usedTiers.has(form.tier) &&
      (!editingPlan || editingPlan.tier !== form.tier);
    if (tierAlreadyUsed) {
      setError(`${tierLabel} already exists. Edit the existing plan instead.`);
      setSaving(false);
      return;
    }
    const payload = {
      tier: form.tier,
      name: form.name,
      price: form.price ? Number(form.price) : 0,
      currency: form.currency || "INR",
      description: form.description,
      features: form.features
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
    };
    try {
      if (editingPlan) {
        await updatePricingPlan(editingPlan._id, payload);
      } else {
        await createPricingPlan(payload);
      }
      resetForm();
      await fetchPlans();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save plan");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (plan) => {
    if (plan.tier === "standard") return;
    setSaving(true);
    setError("");
    try {
      await deletePricingPlan(plan._id);
      await fetchPlans();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete plan");
    } finally {
      setSaving(false);
    }
  };

  const displayPlans = useMemo(
    () =>
      plans.sort((a, b) => {
        const order = { standard: 0, silver: 1, gold: 2, diamond: 3 };
        return (order[a.tier] ?? 9) - (order[b.tier] ?? 9);
      }),
    [plans]
  );

  const featuredTier = "gold";

  return (
    <DashboardLayout>
      <section className="rounded-3xl bg-gradient-to-br from-brand-primary/10 via-white to-brand-secondary/10 p-6">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-[0.3em] text-brand-muted">
            Pricing Plan
          </p>
          <h2 className="text-3xl font-semibold text-brand-ink mt-2">
            Choose Your Best Plan
          </h2>
          <p className="text-brand-muted mt-2">
            Create up to 4 tiers and assign them to your clients.
          </p>
          {!canAddMore && (
            <span className="inline-flex mt-3 text-xs font-semibold text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
              You have reached the 4-plan limit.
            </span>
          )}
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {loading ? (
            <p className="text-sm text-brand-muted">Loading plans...</p>
          ) : (
            <>
              {displayPlans.map((plan) => {
                const isFeatured = plan.tier === featuredTier;
                const isDefault = plan.tier === "standard";
                const priceLabel = plan.price
                  ? `${plan.currency || "INR"} ${plan.price}`
                  : "Free";
                return (
                  <div
                    key={plan._id}
                    className={`relative overflow-hidden rounded-[32px] border bg-white p-6 flex flex-col gap-4 shadow-sm transition ${
                      isFeatured
                        ? "border-brand-primary shadow-lg"
                        : "border-brand-border"
                    }`}
                  >
                    <div className="absolute -top-10 -right-10 h-24 w-24 rounded-full bg-brand-primary/10" />
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-wide text-brand-muted">
                        {tierLabels[plan.tier] || plan.tier}
                      </span>
                      {isDefault && (
                        <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
                          Default
                        </span>
                      )}
                      {isFeatured && !isDefault && (
                        <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-brand-primary/10 text-brand-primary">
                          Most Popular
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-brand-ink">
                        {plan.name || tierLabels[plan.tier]}
                      </h3>
                      <div className="mt-3 flex items-end gap-2">
                        <span className="text-4xl font-semibold text-brand-ink">
                          {priceLabel}
                        </span>
                        <span className="text-xs text-brand-muted">
                          per plan
                        </span>
                      </div>
                      <p className="text-sm text-brand-muted mt-2">
                        {plan.description ||
                          "Define the benefits included in this tier."}
                      </p>
                    </div>
                    <ul className="mt-2 space-y-2 text-sm text-brand-ink">
                      {(plan.features || []).length ? (
                        (plan.features || []).map((feature, index) => (
                          <li
                            key={`${plan._id}-${index}`}
                            className="flex items-start gap-2"
                          >
                            <span className="mt-1 h-2 w-2 rounded-full bg-brand-primary" />
                            <span>{feature}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-sm text-brand-muted">
                          Add features to describe this tier.
                        </li>
                      )}
                    </ul>
                    <PrimaryButton
                      type="button"
                      className={`mt-2 w-full ${
                        isDefault
                          ? "bg-transparent text-brand-primary border border-brand-primary"
                          : ""
                      }`}
                      onClick={() => handleEdit(plan)}
                    >
                      {isDefault ? "Edit Standard" : "Edit Plan"}
                    </PrimaryButton>
                    <div className="flex items-center justify-between text-xs text-brand-muted">
                      <button
                        type="button"
                        className="font-semibold text-brand-primary"
                        onClick={() => handleEdit(plan)}
                      >
                        Edit
                      </button>
                      {plan.tier !== "standard" && (
                        <button
                          type="button"
                          className="font-semibold text-red-500"
                          onClick={() => handleDelete(plan)}
                          disabled={saving}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {!displayPlans.length && (
                <p className="text-sm text-brand-muted">
                  No plans yet. Start by creating your first plan.
                </p>
              )}
            </>
          )}
        </div>
      </section>

      <section className="mt-8 bg-brand-card rounded-3xl shadow-card p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-brand-ink">
              {editingPlan ? "Update Plan" : "Add New Plan"}
            </h3>
            <p className="text-sm text-brand-muted mt-1">
              Customize tiers, pricing, and the included features.
            </p>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <form className="mt-5 grid gap-4 lg:grid-cols-2" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-medium text-brand-ink">Tier</label>
            <select
              className="mt-1 w-full border border-brand-border rounded-2xl px-3 py-3 text-sm bg-brand-card"
              value={form.tier}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, tier: event.target.value }))
              }
              disabled={editingPlan?.tier === "standard"}
            >
              {Object.keys(tierLabels).map((tier) => (
                <option
                  key={tier}
                  value={tier}
                  disabled={
                    usedTiers.has(tier) &&
                    (!editingPlan || editingPlan.tier !== tier)
                  }
                >
                  {tierLabels[tier]}
                </option>
              ))}
            </select>
          </div>
          <TextInput
            label="Plan name"
            placeholder="Standard Plan"
            value={form.name}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, name: event.target.value }))
            }
            required
          />
          <TextInput
            label="Price"
            type="number"
            placeholder="0"
            value={form.price}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, price: event.target.value }))
            }
          />
          <TextInput
            label="Currency"
            placeholder="INR"
            value={form.currency}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, currency: event.target.value }))
            }
          />
          <TextInput
            label="Description"
            placeholder="Short summary of the plan"
            value={form.description}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                description: event.target.value
              }))
            }
          />
          <div className="lg:col-span-2">
            <label className="text-sm font-medium text-brand-ink">
              Features (one per line)
            </label>
            <textarea
              rows="5"
              className="mt-1 w-full border border-brand-border rounded-2xl px-3 py-3 text-sm bg-brand-card"
              placeholder="Unlimited check-ins&#10;Custom plans&#10;Weekly calls"
              value={form.features}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, features: event.target.value }))
              }
            />
          </div>
          <div className="lg:col-span-2 flex flex-col sm:flex-row gap-3">
            <PrimaryButton
              type="submit"
              className="w-full sm:w-auto px-8"
              disabled={saving || !canAddMore}
            >
              {saving
                ? "Saving..."
                : editingPlan
                ? "Update Plan"
                : "Create Plan"}
            </PrimaryButton>
            {editingPlan && (
              <button
                type="button"
                className="w-full sm:w-auto px-8 py-3 rounded-2xl border border-brand-border text-sm font-semibold text-brand-muted"
                onClick={resetForm}
                disabled={saving}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>
    </DashboardLayout>
  );
};

export default PricingPlans;

