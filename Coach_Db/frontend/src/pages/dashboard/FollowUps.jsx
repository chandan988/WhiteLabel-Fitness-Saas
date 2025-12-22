import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DashboardLayout from "./DashboardLayout.jsx";
import PrimaryButton from "../../components/PrimaryButton.jsx";
import TextInput from "../../components/TextInput.jsx";
import { useFollowUps } from "../../hooks/useFollowUps.js";
import { addLeadFollowUp, getLeadById } from "../../services/api.js";
import { useOrgPath } from "../../hooks/useOrgPath.js";

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

const FollowUps = () => {
  const {
    date,
    setDate,
    followUps,
    upcomingFollowUps,
    loading,
    error,
    refresh
  } = useFollowUps();
  const [searchParams] = useSearchParams();
  const [selectedLead, setSelectedLead] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [followForm, setFollowForm] = useState(followUpDefaults);
  const [followSaving, setFollowSaving] = useState(false);
  const [followError, setFollowError] = useState("");
  const [leadLoading, setLeadLoading] = useState(false);
  const navigate = useNavigate();
  const buildPath = useOrgPath();

  const leadIdFromQuery = searchParams.get("leadId");
  const dateFromQuery = searchParams.get("date");

  useEffect(() => {
    if (dateFromQuery) {
      setDate(dateFromQuery);
    }
  }, [dateFromQuery, setDate]);

  useEffect(() => {
    if (!leadIdFromQuery) return;
    setLeadLoading(true);
    getLeadById(leadIdFromQuery)
      .then(({ data }) => {
        setSelectedLead(data);
        setFollowForm(followUpDefaults);
        setFollowError("");
      })
      .catch((err) => {
        setFollowError(
          err.response?.data?.message || "Unable to load lead details"
        );
      })
      .finally(() => setLeadLoading(false));
  }, [leadIdFromQuery]);

  const openLeadModal = async (leadId) => {
    setLeadLoading(true);
    setFollowError("");
    try {
      const { data } = await getLeadById(leadId);
      setSelectedLead(data);
      setFollowForm(followUpDefaults);
    } catch (err) {
      setFollowError(err.response?.data?.message || "Unable to load lead details");
    } finally {
      setLeadLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedLead(null);
    setFollowForm(followUpDefaults);
    setFollowError("");
    if (leadIdFromQuery) {
      navigate(buildPath("/follow-ups"), { replace: true });
    }
  };

  const handleAddFollowUp = async () => {
    if (!selectedLead) return;
    if (!followForm.asked.trim() && !followForm.response.trim()) {
      setFollowError("Add at least a follow-up or response note.");
      return;
    }
    setFollowSaving(true);
    setFollowError("");
    try {
      const { data } = await addLeadFollowUp(selectedLead.rawId, {
        asked: followForm.asked.trim(),
        response: followForm.response.trim(),
        status: followForm.status,
        callbackAt: followForm.callbackAt
      });
      setSelectedLead((prev) =>
        prev
          ? { ...prev, followUps: data.followUps, leadStatus: data.leadStatus }
          : prev
      );
      setFollowForm(followUpDefaults);
      refresh();
    } catch (err) {
      setFollowError(err.response?.data?.message || "Failed to add follow-up");
    } finally {
      setFollowSaving(false);
    }
  };

  const filteredFollowUps = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return followUps;
    return followUps.filter((entry) => {
      const name = entry.name || "";
      const email = entry.email || "";
      const phone = entry.phone || "";
      return [name, email, phone].some((value) =>
        value.toString().toLowerCase().includes(query)
      );
    });
  }, [followUps, searchQuery]);

  const filteredUpcoming = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return upcomingFollowUps;
    return upcomingFollowUps.filter((entry) => {
      const name = entry.name || "";
      const email = entry.email || "";
      const phone = entry.phone || "";
      return [name, email, phone].some((value) =>
        value.toString().toLowerCase().includes(query)
      );
    });
  }, [upcomingFollowUps, searchQuery]);

  const rows = useMemo(
    () =>
      filteredFollowUps.map((entry, index) => ({
        ...entry,
        serial: index + 1
      })),
    [filteredFollowUps]
  );
  const upcomingRows = useMemo(
    () =>
      filteredUpcoming.map((entry, index) => ({
        ...entry,
        serial: index + 1
      })),
    [filteredUpcoming]
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-brand-ink">Follow-ups</h2>
          <p className="text-brand-muted">
            Schedule callbacks and keep track of every conversation.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-brand-muted">Call Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border border-brand-border rounded-2xl px-3 py-2 text-sm"
            />
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
        </div>
      </div>
      <div className="bg-brand-card rounded-3xl shadow-card p-6">
        {loading ? (
          <p className="text-sm text-brand-muted">Loading follow-ups...</p>
        ) : error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-brand-muted">
                  <th className="pb-3">S. No.</th>
                  <th className="pb-3">Lead</th>
                  <th className="pb-3">Phone</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Callback</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm text-brand-ink">
                {rows.map((entry) => (
                  <tr key={`${entry.leadId}-${entry.callbackAt}`} className="border-t border-brand-border">
                    <td className="py-4 font-semibold">{entry.serial}</td>
                    <td className="py-4">
                      <p className="font-semibold text-brand-ink">{entry.name}</p>
                      <p className="text-xs text-brand-muted">{entry.email}</p>
                    </td>
                    <td className="py-4">{entry.phone || "-"}</td>
                    <td className="py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusBadge(entry.status || entry.leadStatus).className}`}
                      >
                        {statusBadge(entry.status || entry.leadStatus).label}
                      </span>
                    </td>
                    <td className="py-4">{formatDateTime(entry.callbackAt)}</td>
                    <td className="py-4">
                      <div className="flex justify-end">
                        <PrimaryButton
                          className="w-auto px-5 py-2"
                          onClick={() => openLeadModal(entry.leadId)}
                        >
                          Open Lead
                        </PrimaryButton>
                      </div>
                    </td>
                  </tr>
                ))}
                {!rows.length && (
                  <tr>
                    <td colSpan="6" className="py-6 text-center text-brand-muted">
                      {searchQuery.trim()
                        ? "No follow-ups match your search."
                        : `No follow-ups scheduled for ${formatDate(date)}.`}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </>
        )}
      </div>

      {!loading && !error && upcomingRows.length > 0 && (
        <div className="bg-brand-card rounded-3xl shadow-card p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-brand-ink">
                Upcoming (Next 7 Days)
              </h3>
              <p className="text-sm text-brand-muted">
                Scheduled callbacks after {formatDate(date)}.
              </p>
            </div>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-brand-muted">
                <th className="pb-3">S. No.</th>
                <th className="pb-3">Lead</th>
                <th className="pb-3">Phone</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Callback</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm text-brand-ink">
              {upcomingRows.map((entry) => (
                <tr
                  key={`upcoming-${entry.leadId}-${entry.callbackAt}`}
                  className="border-t border-brand-border"
                >
                  <td className="py-4 font-semibold">{entry.serial}</td>
                  <td className="py-4">
                    <p className="font-semibold text-brand-ink">{entry.name}</p>
                    <p className="text-xs text-brand-muted">{entry.email}</p>
                  </td>
                  <td className="py-4">{entry.phone || "-"}</td>
                  <td className="py-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusBadge(entry.status || entry.leadStatus).className}`}
                    >
                      {statusBadge(entry.status || entry.leadStatus).label}
                    </span>
                  </td>
                  <td className="py-4">{formatDateTime(entry.callbackAt)}</td>
                  <td className="py-4">
                    <div className="flex justify-end">
                      <PrimaryButton
                        className="w-auto px-5 py-2"
                        onClick={() => openLeadModal(entry.leadId)}
                      >
                        Open Lead
                      </PrimaryButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedLead && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-brand-card rounded-3xl shadow-xl w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-brand-ink">
                  Follow-ups for {selectedLead.name}
                </h3>
                <p className="text-sm text-brand-muted">{selectedLead.email}</p>
              </div>
              <button
                className="text-sm text-brand-muted hover:text-brand-ink"
                onClick={closeModal}
              >
                Close
              </button>
            </div>
            {leadLoading ? (
              <p className="text-sm text-brand-muted">Loading lead details...</p>
            ) : (
              <div className="space-y-4">
                <div className="border border-brand-border rounded-2xl p-4 max-h-64 overflow-y-auto">
                  {selectedLead.followUps && selectedLead.followUps.length ? (
                    selectedLead.followUps.map((entry, idx) => (
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
                      {followSaving ? "Saving..." : "Add Follow-up"}
                    </PrimaryButton>
                    {followError && (
                      <p className="text-sm text-red-500">{followError}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default FollowUps;
