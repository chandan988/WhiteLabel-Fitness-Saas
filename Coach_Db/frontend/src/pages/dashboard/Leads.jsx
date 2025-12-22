import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "./DashboardLayout.jsx";
import PrimaryButton from "../../components/PrimaryButton.jsx";
import TextInput from "../../components/TextInput.jsx";
import { useLeads } from "../../hooks/useLeads.js";

const emptyForm = { name: "", email: "", phone: "" };
const followUpDefaults = {
  asked: "",
  response: "",
  status: "warm",
  callbackAt: ""
};

const formatDate = (date) => {
  if (!date) return "-";
  const instance = new Date(date);
  if (Number.isNaN(instance.getTime())) return "-";
  return instance.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
};

const formatDateTime = (date) => {
  if (!date) return "-";
  const instance = new Date(date);
  if (Number.isNaN(instance.getTime())) return "-";
  return instance.toLocaleString();
};

const Leads = () => {
  const {
    leads,
    loading,
    error,
    saving,
    convertingId,
    filters,
    setFilters,
    addLead,
    editLead,
    convertLead,
    addFollowUp
  } = useLeads();
  const [showForm, setShowForm] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [formValues, setFormValues] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [convertError, setConvertError] = useState("");
  const [followUpModal, setFollowUpModal] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [followForm, setFollowForm] = useState(followUpDefaults);
  const [followSaving, setFollowSaving] = useState(false);
  const [followError, setFollowError] = useState("");

  const openCreateForm = () => {
    setEditingLead(null);
    setFormValues(emptyForm);
    setFormError("");
    setShowForm(true);
  };

  const openEditForm = (lead) => {
    setEditingLead(lead);
    setFormValues({
      name: lead.name || "",
      email: lead.email || "",
      phone: lead.phone || ""
    });
    setFormError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingLead(null);
    setFormValues(emptyForm);
    setFormError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    try {
      if (editingLead) {
        await editLead(editingLead.rawId, formValues);
      } else {
        await addLead(formValues);
      }
      closeForm();
    } catch (err) {
      setFormError(err.response?.data?.message || "Unable to save lead");
    }
  };

  const handleConvert = async (lead) => {
    setConvertError("");
    try {
      await convertLead(lead);
    } catch (err) {
      setConvertError(err.response?.data?.message || "Failed to convert lead");
    }
  };

  const openFollowUps = (lead) => {
    setFollowForm(followUpDefaults);
    setFollowError("");
    setFollowUpModal(lead);
  };

  useEffect(() => {
    if (!followUpModal) return;
    const latest = leads.find((lead) => lead.rawId === followUpModal.rawId);
    if (latest) {
      setFollowUpModal(latest);
    }
  }, [leads, followUpModal?.rawId]);

  const handleAddFollowUp = async () => {
    if (!followUpModal) return;
    if (!followForm.asked.trim() && !followForm.response.trim()) {
      setFollowError("Add at least a follow-up or response note.");
      return;
    }
    setFollowSaving(true);
    setFollowError("");
    try {
      await addFollowUp(followUpModal.rawId, {
        asked: followForm.asked.trim(),
        response: followForm.response.trim(),
        status: followForm.status,
        callbackAt: followForm.callbackAt
      });
      setFollowForm(followUpDefaults);
    } catch (err) {
      setFollowError(err.response?.data?.message || "Failed to add follow-up");
    } finally {
      setFollowSaving(false);
    }
  };

  const filteredLeads = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return leads;
    return leads.filter((lead) => {
      const name = lead.name || "";
      const email = lead.email || "";
      const phone = lead.phone || "";
      return [name, email, phone].some((value) =>
        value.toString().toLowerCase().includes(query)
      );
    });
  }, [leads, searchQuery]);

  const tableRows = useMemo(
    () =>
      filteredLeads.map((lead, index) => ({
        ...lead,
        serial: index + 1
      })),
    [filteredLeads]
  );

  const statusBadge = (status) => {
    const normalized = (status || "new").toLowerCase();
    const label = normalized.charAt(0).toUpperCase() + normalized.slice(1);
    const className = (() => {
      switch (normalized) {
        case "hot":
          return "bg-red-100 text-red-700";
        case "warm":
          return "bg-amber-100 text-amber-700";
        case "cold":
          return "bg-sky-100 text-sky-700";
        default:
          return "bg-brand-surface text-brand-ink";
      }
    })();
    return { label, className };
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-brand-ink">Leads</h2>
          <p className="text-brand-muted">
            Track app users and convert warm prospects into clients.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-brand-muted">Inquiry Date</label>
            <input
              type="date"
              value={filters.inquiryDate || ""}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  inquiryDate: e.target.value
                }))
              }
              className="border border-brand-border rounded-2xl px-3 py-2 text-sm"
            />
            {filters.inquiryDate && (
              <button
                className="text-xs text-brand-muted underline"
                onClick={() =>
                  setFilters((prev) => ({ ...prev, inquiryDate: "" }))
                }
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-brand-muted">Status</label>
            <select
              value={filters.status || ""}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, status: e.target.value }))
              }
              className="border border-brand-border rounded-2xl px-3 py-2 text-sm bg-brand-card"
            >
              <option value="">All</option>
              <option value="hot">Hot</option>
              <option value="warm">Warm</option>
              <option value="cold">Cold</option>
              <option value="new">New</option>
            </select>
            {filters.status && (
              <button
                className="text-xs text-brand-muted underline"
                onClick={() =>
                  setFilters((prev) => ({ ...prev, status: "" }))
                }
              >
                Clear
              </button>
            )}
          </div>
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
          <PrimaryButton className="w-auto px-6 py-2" onClick={openCreateForm}>
            + Add Lead
          </PrimaryButton>
        </div>
      </div>
      <div className="bg-brand-card rounded-3xl shadow-card p-6">
        {loading ? (
          <p className="text-sm text-brand-muted">Loading leads...</p>
        ) : error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-brand-muted">
                  <th className="pb-3">S. No.</th>
                  <th className="pb-3">Inquiry Date</th>
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Phone</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm text-brand-ink">
                {tableRows.map((lead) => (
                  <tr key={lead.rawId || lead.id} className="border-t border-brand-border">
                    <td className="py-4 font-semibold">{lead.serial}</td>
                    <td className="py-4">{formatDate(lead.inquiryDate)}</td>
                    <td className="py-4">{lead.name || "-"}</td>
                    <td className="py-4">{lead.email}</td>
                    <td className="py-4">{lead.phone || "-"}</td>
                    <td className="py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusBadge(lead.leadStatus).className}`}
                      >
                        {statusBadge(lead.leadStatus).label}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-3 justify-end">
                        <button
                          className="text-sm font-semibold text-brand-muted"
                          onClick={() => openFollowUps(lead)}
                        >
                          Follow-ups
                        </button>
                        <button
                          className="text-sm font-semibold text-brand-primary"
                          onClick={() => openEditForm(lead)}
                        >
                          Edit
                        </button>
                        <PrimaryButton
                          className="w-auto px-6 py-2"
                          onClick={() => handleConvert(lead)}
                          disabled={convertingId === lead.rawId}
                        >
                          {convertingId === lead.rawId
                            ? "Converting..."
                            : "Convert to Client"}
                        </PrimaryButton>
                      </div>
                    </td>
                  </tr>
                ))}
                {!tableRows.length && (
                  <tr>
                    <td colSpan="7" className="py-6 text-center text-brand-muted">
                      {searchQuery.trim()
                        ? "No leads match your search."
                        : "No leads pending. Great job!"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {convertError && (
              <p className="text-sm text-red-500 mt-4">{convertError}</p>
            )}
          </>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center px-4">
          <div className="bg-brand-card rounded-3xl shadow-xl w-full max-w-lg p-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-brand-ink">
                  {editingLead ? "Edit Lead" : "Add Lead"}
                </h3>
                <p className="text-sm text-brand-muted">
                  {editingLead
                    ? "Update information for this lead."
                    : "Capture a new prospect to track from the dashboard."}
                </p>
              </div>
              <button
                className="text-sm text-brand-muted hover:text-brand-ink"
                onClick={closeForm}
              >
                Close
              </button>
            </div>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <TextInput
                label="Name"
                placeholder="Lead name"
                value={formValues.name}
                onChange={(e) =>
                  setFormValues((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
              <TextInput
                label="Email"
                type="email"
                placeholder="email@example.com"
                value={formValues.email}
                onChange={(e) =>
                  setFormValues((prev) => ({ ...prev, email: e.target.value }))
                }
                required
              />
              <TextInput
                label="Phone"
                placeholder="Phone number"
                value={formValues.phone}
                onChange={(e) =>
                  setFormValues((prev) => ({ ...prev, phone: e.target.value }))
                }
              />
              {formError && (
                <p className="text-sm text-red-500">{formError}</p>
              )}
              <div className="flex items-center gap-3">
                <PrimaryButton type="submit" className="w-auto px-6" disabled={saving}>
                  {saving ? "Saving..." : editingLead ? "Update Lead" : "Create Lead"}
                </PrimaryButton>
                <button
                  type="button"
                  className="px-6 py-3 rounded-2xl border border-brand-border font-semibold text-brand-muted"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {followUpModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-brand-card rounded-3xl shadow-xl w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-brand-ink">
                  Follow-ups for {followUpModal.name}
                </h3>
                <p className="text-sm text-brand-muted">{followUpModal.email}</p>
              </div>
              <button
                className="text-sm text-brand-muted hover:text-brand-ink"
                onClick={() => {
                  setFollowUpModal(null);
                  setFollowForm(followUpDefaults);
                  setFollowError("");
                }}
              >
                Close
              </button>
            </div>
            <div className="space-y-4">
              <div className="border border-brand-border rounded-2xl p-4 max-h-64 overflow-y-auto">
                {followUpModal.followUps && followUpModal.followUps.length ? (
                  followUpModal.followUps.map((entry, idx) => (
                    <div
                      key={`${entry.createdAt}-${idx}`}
                      className="pb-3 mb-3 border-b border-dashed border-brand-border last:border-b-0 last:mb-0 last:pb-0"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs uppercase text-brand-muted">
                          {formatDateTime(entry.createdAt)}
                        </p>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-[11px] font-semibold ${statusBadge(entry.status).className}`}
                          >
                            {statusBadge(entry.status).label}
                          </span>
                      </div>
                      {entry.asked && (
                        <p className="text-sm text-brand-ink mt-2">
                          <span className="font-semibold text-brand-ink">
                            Follow-up:
                          </span>{" "}
                          {entry.asked}
                        </p>
                      )}
                      {entry.response && (
                        <p className="text-sm text-brand-ink mt-1">
                          <span className="font-semibold text-brand-ink">
                            Response:
                          </span>{" "}
                          {entry.response}
                        </p>
                      )}
                      {entry.callbackAt && (
                        <p className="text-sm text-brand-ink mt-1">
                          <span className="font-semibold text-brand-ink">
                            Call Back:
                          </span>{" "}
                          {formatDateTime(entry.callbackAt)}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-brand-muted">
                    No follow-ups recorded yet.
                  </p>
                )}
              </div>
              <div className="space-y-3">
                <TextInput
                  label="Follow-up Asked"
                  placeholder="What did you ask or discuss?"
                  value={followForm.asked}
                  onChange={(e) =>
                    setFollowForm((prev) => ({ ...prev, asked: e.target.value }))
                  }
                />
                <TextInput
                  label="Client Response"
                  placeholder="Client's reply or requested action"
                  value={followForm.response}
                  onChange={(e) =>
                    setFollowForm((prev) => ({
                      ...prev,
                      response: e.target.value
                    }))
                  }
                />
                <div>
                  <label className="text-sm font-medium text-brand-ink">
                    Lead Status
                  </label>
                  <select
                    value={followForm.status}
                    onChange={(e) =>
                      setFollowForm((prev) => ({
                        ...prev,
                        status: e.target.value
                      }))
                    }
                    className="mt-1 w-full border border-brand-border rounded-2xl px-3 py-3 text-sm bg-brand-card"
                  >
                    <option value="hot">Hot</option>
                    <option value="warm">Warm</option>
                    <option value="cold">Cold</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-brand-ink">
                    Callback Date &amp; Time
                  </label>
                  <input
                    type="datetime-local"
                    value={followForm.callbackAt}
                    onChange={(e) =>
                      setFollowForm((prev) => ({
                        ...prev,
                        callbackAt: e.target.value
                      }))
                    }
                    className="mt-1 w-full border border-brand-border rounded-2xl px-3 py-3 text-sm bg-brand-card"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <PrimaryButton
                    className="px-6"
                    onClick={handleAddFollowUp}
                    disabled={
                      followSaving ||
                      (!followForm.asked.trim() && !followForm.response.trim())
                    }
                  >
                    {followSaving ? "Saving..." : "Add Remark"}
                  </PrimaryButton>
                  {followError && (
                    <p className="text-sm text-red-500">{followError}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Leads;
