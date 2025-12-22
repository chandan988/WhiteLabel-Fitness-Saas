import { BellIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useBranding } from "../context/BrandingContext.jsx";
import { useOrgPath } from "../hooks/useOrgPath.js";
import { getDueFollowUps } from "../services/api.js";

const toDateKey = (date) => date.toISOString().split("T")[0];

const formatTime = (value) => {
  if (!value) return "-";
  const instance = new Date(value);
  if (Number.isNaN(instance.getTime())) return "-";
  return instance.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit"
  });
};

const formatShortDate = (value) => {
  if (!value) return "-";
  const instance = new Date(value);
  if (Number.isNaN(instance.getTime())) return "-";
  return instance.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric"
  });
};

const statusClass = (status) => {
  switch ((status || "").toLowerCase()) {
    case "hot":
      return "bg-red-100 text-red-700";
    case "cold":
      return "bg-sky-100 text-sky-700";
    case "warm":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-brand-card text-brand-ink";
  }
};

const TopBar = () => {
  const { user } = useAuth();
  const { branding } = useBranding();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [dueFollowUps, setDueFollowUps] = useState([]);
  const [upcomingFollowUps, setUpcomingFollowUps] = useState([]);
  const [loading, setLoading] = useState(false);
  const buildPath = useOrgPath();
  const navigate = useNavigate();

  const fetchDueFollowUps = async () => {
    setLoading(true);
    try {
      const todayKey = toDateKey(new Date());
      const [todayResponse, upcomingResponse] = await Promise.all([
        getDueFollowUps({ date: todayKey }),
        getDueFollowUps({ date: todayKey, rangeDays: 7 })
      ]);
      const upcoming = upcomingResponse.data.filter(
        (entry) => toDateKey(new Date(entry.callbackAt)) !== todayKey
      );
      setDueFollowUps(todayResponse.data);
      setUpcomingFollowUps(upcoming);
    } catch (err) {
      setDueFollowUps([]);
      setUpcomingFollowUps([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDueFollowUps();
  }, []);

  return (
    <header className="flex items-center justify-between py-6">
      <div>
        <p className="text-sm text-brand-muted">Dashboard</p>
        <h2 className="text-2xl font-semibold text-brand-ink">
          Welcome back, {user?.firstName || "Coach"}
        </h2>
      </div>
      <div className="flex items-center gap-6">
        <img
          src={branding.logoUrl}
          alt="tenant logo"
          className="h-10 w-10 rounded-full bg-brand-card shadow"
        />
        <div className="relative">
          <button
            className="relative bg-brand-card p-3 rounded-full shadow"
            onClick={() => {
              const nextOpen = !notificationsOpen;
              setNotificationsOpen(nextOpen);
              if (nextOpen) {
                fetchDueFollowUps();
              }
            }}
          >
            <BellIcon className="h-5 w-5 text-brand-muted" />
            {dueFollowUps.length > 0 && (
              <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-red-500 rounded-full" />
            )}
          </button>
          {notificationsOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-brand-card shadow-lg rounded-2xl p-4 z-50">
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold text-brand-ink">Today's Calls</p>
                <span className="text-xs text-brand-muted">
                  {dueFollowUps.length} due
                </span>
              </div>
              {loading ? (
                <p className="text-sm text-brand-muted">Loading follow-ups...</p>
              ) : (
                <>
                  {dueFollowUps.length ? (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {dueFollowUps.map((entry) => (
                        <button
                          key={`${entry.leadId}-${entry.callbackAt}`}
                          className="w-full text-left px-3 py-2 rounded-xl border border-brand-border hover:bg-brand-surface"
                          onClick={() => {
                            const dateKey = entry.callbackAt
                              ? toDateKey(new Date(entry.callbackAt))
                              : toDateKey(new Date());
                            navigate(
                              buildPath(
                                `/follow-ups?leadId=${entry.leadId}&date=${dateKey}`
                              )
                            );
                            setNotificationsOpen(false);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-brand-ink">
                              {entry.name}
                            </p>
                            <span
                              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusClass(
                                entry.status || entry.leadStatus
                              )}`}
                            >
                              {(entry.status || entry.leadStatus || "new")
                                .toString()
                                .toUpperCase()}
                            </span>
                          </div>
                          <p className="text-xs text-brand-muted">
                            {formatShortDate(entry.callbackAt)} -{" "}
                            {formatTime(entry.callbackAt)}
                          </p>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-brand-muted">
                      No follow-ups scheduled for today.
                    </p>
                  )}
                  {upcomingFollowUps.length > 0 && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-brand-ink">
                          Upcoming Calls
                        </p>
                        <span className="text-xs text-brand-muted">
                          {upcomingFollowUps.length}
                        </span>
                      </div>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {upcomingFollowUps.map((entry) => (
                          <button
                            key={`upcoming-${entry.leadId}-${entry.callbackAt}`}
                            className="w-full text-left px-3 py-2 rounded-xl border border-brand-border hover:bg-brand-surface"
                            onClick={() => {
                              const dateKey = entry.callbackAt
                                ? toDateKey(new Date(entry.callbackAt))
                                : toDateKey(new Date());
                              navigate(
                                buildPath(
                                  `/follow-ups?leadId=${entry.leadId}&date=${dateKey}`
                                )
                              );
                              setNotificationsOpen(false);
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-semibold text-brand-ink">
                                {entry.name}
                              </p>
                              <span
                                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusClass(
                                  entry.status || entry.leadStatus
                                )}`}
                              >
                                {(entry.status || entry.leadStatus || "new")
                                  .toString()
                                  .toUpperCase()}
                              </span>
                            </div>
                            <p className="text-xs text-brand-muted">
                              {formatShortDate(entry.callbackAt)} -{" "}
                              {formatTime(entry.callbackAt)}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <img
            src={user?.profile?.avatar || "https://i.pravatar.cc/80"}
            alt="avatar"
            className="h-10 w-10 rounded-full object-cover"
          />
          <div>
            <p className="font-semibold text-brand-ink">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-sm text-brand-muted">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
