import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "./DashboardLayout.jsx";
import { useClients } from "../../hooks/useClients.js";
import PrimaryButton from "../../components/PrimaryButton.jsx";
import { Link, useNavigate } from "react-router-dom";
import { useOrgPath } from "../../hooks/useOrgPath.js";
import { getPricingPlans } from "../../services/api.js";

const Clients = () => {
  const { clients, loading, assignPlan } = useClients();
  const buildPath = useOrgPath();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [pricingPlans, setPricingPlans] = useState([]);
  const [planLoading, setPlanLoading] = useState(true);
  const [planError, setPlanError] = useState("");
  const [planModal, setPlanModal] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [planEndDate, setPlanEndDate] = useState("");
  const [planSaving, setPlanSaving] = useState(false);

  useEffect(() => {
    const loadPlans = async () => {
      setPlanLoading(true);
      try {
        const { data } = await getPricingPlans();
        setPricingPlans(data || []);
      } catch (err) {
        setPlanError(
          err.response?.data?.message || "Failed to load pricing plans"
        );
      } finally {
        setPlanLoading(false);
      }
    };
    loadPlans();
  }, []);

  const openPlanModal = (client) => {
    setPlanError("");
    setPlanEndDate("");
    const match =
      pricingPlans.find((plan) => plan.tier === client.pricingTier) ||
      pricingPlans[0];
    setSelectedPlanId(match?._id || "");
    setPlanModal(client);
  };

  const closePlanModal = () => {
    setPlanModal(null);
    setPlanError("");
    setPlanEndDate("");
  };

  const handleAssignPlan = async () => {
    if (!planModal) return;
    const plan = pricingPlans.find((entry) => entry._id === selectedPlanId);
    if (!plan) {
      setPlanError("Select a pricing plan.");
      return;
    }
    if (plan.tier !== "standard" && !planEndDate) {
      setPlanError("Select an end date for paid tiers.");
      return;
    }
    setPlanSaving(true);
    setPlanError("");
    try {
      await assignPlan({
        clientId: planModal._id,
        planId: selectedPlanId,
        endDate: plan.tier === "standard" ? null : planEndDate
      });
      closePlanModal();
    } catch (err) {
      setPlanError(err.response?.data?.message || "Failed to assign plan");
    } finally {
      setPlanSaving(false);
    }
  };

  const filteredClients = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return clients;
    return clients.filter((client) => {
      const name = `${client.firstName || ""} ${client.lastName || ""}`.trim();
      const email = client.email || "";
      const phone = client.phone || "";
      return [name, email, phone].some((value) =>
        value.toString().toLowerCase().includes(query)
      );
    });
  }, [clients, searchQuery]);

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-brand-ink">Clients</h2>
          <p className="text-brand-muted">Manage all of your client profiles</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-brand-muted">Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Name, email, phone"
              className="border border-brand-border rounded-2xl px-3 py-2 text-sm"
            />
          </div>
          <Link to={buildPath("/clients/new")} className="w-48">
            <PrimaryButton>Add New Client</PrimaryButton>
          </Link>
        </div>
      </div>
      <div className="bg-brand-card rounded-3xl shadow-card p-6">
        {loading ? (
          <p>Loading clients...</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-brand-muted">
                <th className="pb-4">Client</th>
                <th className="pb-4">Email</th>
                <th className="pb-4">Goal</th>
                <th className="pb-4">Plan</th>
                <th className="pb-4">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm text-brand-ink">
              {filteredClients.map((client) => (
                <tr
                  key={client._id}
                  className="border-t border-brand-border cursor-pointer"
                  onClick={() => navigate(buildPath(`/clients/${client._id}`))}
                >
                  <td className="py-4 font-semibold">
                    {client.firstName} {client.lastName}
                  </td>
                  <td className="py-4">{client.email}</td>
                  <td className="py-4">{client.goals?.join(", ") || "-"}</td>
                  <td className="py-4">
                    <span className="font-semibold">
                      {client.pricingPlanName || "Standard"}
                    </span>
                    {client.pricingExpiresAt && (
                      <p className="text-xs text-brand-muted">
                        Ends{" "}
                        {new Date(client.pricingExpiresAt).toLocaleDateString()}
                      </p>
                    )}
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-4">
                      <Link
                        to={buildPath(`/clients/${client._id}`)}
                        className="text-brand-primary font-semibold"
                        onClick={(event) => event.stopPropagation()}
                      >
                        View
                      </Link>
                      <button
                        className="text-sm font-semibold text-brand-muted"
                        onClick={(event) => {
                          event.stopPropagation();
                          openPlanModal(client);
                        }}
                      >
                        Set Plan
                      </button>
                      {/* <button
                        className="text-sm font-semibold text-red-500 hover:text-red-600"
                        onClick={() => convertBackToLead(client._id)}
                        disabled={revertingId === client._id}
                      >
                        {revertingId === client._id
                          ? "Sending..."
                          : "Convert back to Lead"}
                      </button> */}
                    </div>
                  </td>
                </tr>
              ))}
              {!filteredClients.length && (
                <tr>
                  <td
                    colSpan="5"
                    className="py-6 text-center text-brand-muted font-medium"
                  >
                    {searchQuery.trim()
                      ? "No clients match your search."
                      : "No clients yet. Convert a lead or add one manually."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {planModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-brand-card rounded-3xl shadow-xl w-full max-w-lg p-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-brand-ink">
                  Set Pricing Plan
                </h3>
                <p className="text-sm text-brand-muted">
                  {planModal.firstName} {planModal.lastName}
                </p>
              </div>
              <button
                className="text-sm text-brand-muted hover:text-brand-ink"
                onClick={closePlanModal}
              >
                Close
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-brand-ink">Plan</label>
                <select
                  value={selectedPlanId}
                  onChange={(event) => setSelectedPlanId(event.target.value)}
                  className="mt-1 w-full border border-brand-border rounded-2xl px-3 py-3 text-sm bg-brand-card"
                  disabled={planLoading}
                >
                  {pricingPlans.map((plan) => (
                    <option key={plan._id} value={plan._id}>
                      {plan.name} ({plan.tier})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-brand-ink">
                  Plan End Date
                </label>
                <input
                  type="date"
                  value={planEndDate}
                  onChange={(event) => setPlanEndDate(event.target.value)}
                  className="mt-1 w-full border border-brand-border rounded-2xl px-3 py-3 text-sm bg-brand-card"
                />
                <p className="text-xs text-brand-muted mt-1">
                  Standard tier does not require an end date.
                </p>
              </div>
              {planError && (
                <p className="text-sm text-red-500">{planError}</p>
              )}
              <PrimaryButton
                className="w-full"
                onClick={handleAssignPlan}
                disabled={planSaving}
              >
                {planSaving ? "Saving..." : "Assign Plan"}
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Clients;
