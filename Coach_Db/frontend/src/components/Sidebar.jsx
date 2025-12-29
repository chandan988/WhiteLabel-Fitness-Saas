import {
  ArrowRightOnRectangleIcon,
  BoltIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  HomeIcon,
  UsersIcon,
  XMarkIcon
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
  { label: "Workouts", path: "/workouts", icon: BoltIcon },
  { label: "Meals", path: "/meals", icon: ClipboardDocumentListIcon },
  { label: "Settings", path: "/settings", icon: Cog6ToothIcon }
];

const Sidebar = ({ collapsed, mobileOpen, onClose }) => {
  const location = useLocation();
  const { branding } = useBranding();
  const { logout } = useAuth();
  const { orgId } = useTenant();
  const buildPath = useOrgPath();
  const navigate = useNavigate();

  return (
    <>
      <div
        className={clsx(
          "fixed inset-0 bg-black/30 z-30 lg:hidden transition-opacity",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />
      <aside
        className={clsx(
          "fixed z-40 inset-y-0 left-0 bg-brand-sidebar text-brand-buttonText flex flex-col gap-10 py-10 transition-transform lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          collapsed ? "w-20 px-4" : "w-64 px-6"
        )}
      >
        <div className="flex items-center justify-between">
          <div className={clsx("flex items-center gap-3", collapsed && "justify-center w-full")}>
            <img
              src={branding.logoUrl}
              alt="brand"
              className="h-8 w-8 rounded-full"
            />
            {!collapsed && <span className="font-semibold">{branding.appName}</span>}
          </div>
          <button
            type="button"
            className="lg:hidden text-brand-buttonText"
            onClick={onClose}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <nav className="space-y-2 flex-1 overflow-y-auto">
          {navItems.map(({ label, path, icon: Icon }) => {
            const target = buildPath(path);
            const active = location.pathname.startsWith(target);
            return (
              <Link
                key={path}
                to={target}
                onClick={onClose}
                className={clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl transition",
                  active
                    ? "bg-brand-card text-brand-ink font-semibold"
                    : "text-brand-buttonText opacity-80 hover:opacity-100 hover:bg-brand-card",
                  collapsed && "justify-center px-0"
                )}
                title={collapsed ? label : undefined}
              >
                <Icon className="h-5 w-5" />
                {!collapsed && label}
              </Link>
            );
          })}
        </nav>
        <button
          type="button"
          className={clsx(
            "mt-auto text-left text-brand-buttonText opacity-80 hover:opacity-100 flex items-center gap-3 px-4 py-3 rounded-2xl",
            collapsed && "justify-center px-0"
          )}
          onClick={() => {
            logout();
            navigate(`/${orgId}/login`);
          }}
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
          {!collapsed && (
            <span className="text-sm font-semibold">Logout</span>
          )}
        </button>
      </aside>
    </>
  );
};

export default Sidebar;
