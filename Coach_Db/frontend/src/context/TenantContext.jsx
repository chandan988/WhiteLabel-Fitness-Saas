import { createContext, useContext, useEffect, useState } from "react";
import { getTenantBySlug } from "../services/api.js";

const TenantContext = createContext();

export const TenantProvider = ({ orgId, children }) => {
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orgId) {
      setTenant(null);
      setError("Organization ID missing");
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    setError("");
    getTenantBySlug(orgId)
      .then(({ data }) => {
        if (!active) return;
        setTenant(data);
        setError("");
      })
      .catch((err) => {
        if (!active) return;
        setTenant(null);
        setError(err.response?.data?.message || "Organization not found");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [orgId]);

  return (
    <TenantContext.Provider value={{ orgId, tenant, loading, error, setTenant }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => useContext(TenantContext);
