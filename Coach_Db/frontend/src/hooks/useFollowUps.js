import { useCallback, useEffect, useMemo, useState } from "react";
import { getDueFollowUps } from "../services/api.js";

const toDateKey = (date) => date.toISOString().split("T")[0];

export const useFollowUps = () => {
  const [date, setDate] = useState(toDateKey(new Date()));
  const [followUps, setFollowUps] = useState([]);
  const [upcomingFollowUps, setUpcomingFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFollowUps = useCallback(async (selectedDate) => {
    setLoading(true);
    setError(null);
    try {
      const [{ data: due }, { data: range }] = await Promise.all([
        getDueFollowUps({ date: selectedDate }),
        getDueFollowUps({ date: selectedDate, rangeDays: 7 })
      ]);
      setFollowUps(due);
      const upcoming = range.filter(
        (entry) => toDateKey(new Date(entry.callbackAt)) !== selectedDate
      );
      setUpcomingFollowUps(upcoming);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load follow-ups");
      setUpcomingFollowUps([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFollowUps(date);
  }, [date, fetchFollowUps]);

  const groupedByLead = useMemo(() => {
    const map = new Map();
    followUps.forEach((entry) => {
      const key = entry.leadId;
      if (!map.has(key)) {
        map.set(key, { leadId: key, name: entry.name, email: entry.email, phone: entry.phone, leadStatus: entry.leadStatus, items: [] });
      }
      map.get(key).items.push(entry);
    });
    return Array.from(map.values());
  }, [followUps]);

  return {
    date,
    setDate,
    followUps,
    upcomingFollowUps,
    groupedByLead,
    loading,
    error,
    refresh: () => fetchFollowUps(date)
  };
};
