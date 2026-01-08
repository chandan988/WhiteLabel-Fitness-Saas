import { useCallback, useEffect, useState } from "react";
import {
  addLeadFollowUp as addLeadFollowUpApi,
  assignPricingPlan as assignPricingPlanApi,
  convertLead as convertLeadApi,
  createLead as createLeadApi,
  getLeads,
  updateLead as updateLeadApi
} from "../services/api.js";

export const useLeads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [convertingId, setConvertingId] = useState(null);
  const [filters, setFilters] = useState({
    inquiryDate: "",
    status: "",
    source: ""
  });

  const fetchLeads = useCallback(async (currentFilters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (currentFilters.inquiryDate) {
        params.inquiryDate = currentFilters.inquiryDate;
      }
      if (currentFilters.status) {
        params.status = currentFilters.status;
      }
      if (currentFilters.source) {
        params.source = currentFilters.source;
      }
      const { data } = await getLeads(params);
      setLeads(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load leads");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads(filters);
  }, [filters, fetchLeads]);

  const addLead = async (payload) => {
    setSaving(true);
    try {
      await createLeadApi(payload);
      await fetchLeads(filters);
    } finally {
      setSaving(false);
    }
  };

  const editLead = async (leadId, payload) => {
    setSaving(true);
    try {
      await updateLeadApi(leadId, payload);
      await fetchLeads(filters);
    } finally {
      setSaving(false);
    }
  };

  const convertLead = async (lead) => {
    setConvertingId(lead.rawId);
    try {
      await convertLeadApi(lead.rawId, { source: lead.source });
      setLeads((prev) => prev.filter((item) => item.rawId !== lead.rawId));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to convert lead");
      throw err;
    } finally {
      setConvertingId(null);
    }
  };

  const addFollowUp = async (leadId, payload) => {
    const { data } = await addLeadFollowUpApi(leadId, payload);
    setLeads((prev) =>
      prev.map((lead) =>
        lead.rawId === leadId
          ? { ...lead, followUps: data.followUps, leadStatus: data.leadStatus }
          : lead
      )
    );
    return data.followUps;
  };

  const assignPlan = async ({ userId, planId, endDate }) => {
    await assignPricingPlanApi({ userId, planId, endDate });
    await fetchLeads(filters);
  };

  return {
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
    addFollowUp,
    assignPlan
  };
};
