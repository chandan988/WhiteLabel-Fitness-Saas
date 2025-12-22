import {
  CalendarDaysIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  HomeIcon,
  UsersIcon
} from "@heroicons/react/24/outline";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useBranding } from "../context/BrandingContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useTenant } from "../context/TenantContext.jsx";
import { useOrgPath } from "../hooks/useOrgPath.js";
import clsx from "clsx";

const navItems = [
  { label: "Home", path: "/dashboard", icon: HomeIcon },
  { label: "Clients", path: "/clients", icon: UsersIcon },
  { label: "Leads", path: "/leads", icon: UsersIcon },
  { label: "Follow-ups", path: "/follow-ups", icon: CalendarDaysIcon },
  { label: "Workouts", path: "/workouts", icon: ChartBarIcon },
  { label: "Nutrition Plans", path: "/nutrition", icon: ChartBarIcon },
  { label: "Recipes", path: "/recipes", icon: ChartBarIcon },
  { label: "Progress Tracking", path: "/progress", icon: ChartBarIcon },
  { label: "Settings", path: "/settings", icon: Cog6ToothIcon }
];

const Sidebar = () => {
  const location = useLocation();
  const { branding } = useBranding();
  const { logout } = useAuth();
  const { orgId } = useTenant();
  const buildPath = useOrgPath();
  const navigate = useNavigate();

  return (
    <aside className="w-64 bg-brand-secondary text-brand-buttonText min-h-screen py-10 px-6 flex flex-col gap-10">
      <div className="flex items-center gap-3">
        <img
          src={branding.logoUrl}
          alt="brand"
          className="h-8 w-8 rounded-full"
        />
        <span className="font-semibold">{branding.appName}</span>
      </div>
      <nav className="space-y-2 flex-1">
        {navItems.map(({ label, path, icon: Icon }) => {
          const target = buildPath(path);
          const active = location.pathname.startsWith(target);
          return (
            <Link
              key={path}
              to={target}
              className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-2xl transition",
                active
                  ? "bg-brand-card text-brand-ink font-semibold"
                  : "text-brand-buttonText opacity-80 hover:opacity-100 hover:bg-brand-card"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </nav>
      <button
        className="text-left text-brand-buttonText opacity-60 hover:opacity-100"
        onClick={() => {
          logout();
          navigate(`/${orgId}/login`);
        }}
      >
        Logout
      </button>
    </aside>
  );
};

export default Sidebar;
