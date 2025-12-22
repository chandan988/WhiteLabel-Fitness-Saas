import { useCallback } from "react";
import { useTenant } from "../context/TenantContext.jsx";

export const useOrgPath = () => {
  const { orgId } = useTenant();
  return useCallback(
    (path = "") => {
      const normalized = path.startsWith("/") ? path : `/${path}`;
      return `/${orgId}${normalized}`;
    },
    [orgId]
  );
};
