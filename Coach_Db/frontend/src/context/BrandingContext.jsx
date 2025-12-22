import { createContext, useContext, useEffect, useState } from "react";
import defaultLogo from "../assets/Logo.png";
import { useTenant } from "./TenantContext.jsx";

const BrandingContext = createContext();

const defaultBrand = {
  appName: "Jeevanshaili",
  logoUrl: defaultLogo,
  primaryColor: "#0d9488",
  secondaryColor: "#115e59"
};

export const BrandingProvider = ({ children }) => {
  const [branding, setBranding] = useState(defaultBrand);
  const [loading, setLoading] = useState(true);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const { tenant, loading: tenantLoading } = useTenant();

  useEffect(() => {
    setLoading(tenantLoading);
  }, [tenantLoading]);

  useEffect(() => {
    const applyColors = (brand) => {
      document.documentElement.style.setProperty(
        "--brand-primary",
        brand.primaryColor
      );
      document.documentElement.style.setProperty(
        "--brand-secondary",
        brand.secondaryColor
      );
    };

    const preloadImage = (url) =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(url);
        img.onerror = reject;
        img.src = url;
      });

    const normalized = tenant
      ? {
          appName:
            tenant.branding?.appName ||
            tenant.name ||
            defaultBrand.appName,
          logoUrl: tenant.branding?.logoUrl || defaultLogo,
          primaryColor:
            tenant.branding?.primaryColor || defaultBrand.primaryColor,
          secondaryColor:
            tenant.branding?.secondaryColor || defaultBrand.secondaryColor
        }
      : defaultBrand;

    applyColors(normalized);

    if (normalized.logoUrl !== defaultLogo) {
      setLogoLoaded(false);
      preloadImage(normalized.logoUrl)
        .then(() => {
          setBranding(normalized);
          setLogoLoaded(true);
        })
        .catch(() => {
          setBranding({ ...normalized, logoUrl: defaultLogo });
          setLogoLoaded(true);
        });
    } else {
      setBranding(normalized);
      setLogoLoaded(true);
    }
  }, [tenant]);

  return (
    <BrandingContext.Provider value={{ branding, loading, logoLoaded }}>
      {children}
    </BrandingContext.Provider>
  );
};

export const useBranding = () => useContext(BrandingContext);

export const BrandLogo = ({ className = "h-14", showPlaceholder = true }) => {
  const { branding, logoLoaded } = useBranding();
  const [imgError, setImgError] = useState(false);

  if (!logoLoaded && showPlaceholder) {
    return <div className={`${className} bg-gray-200 animate-pulse rounded`} />;
  }

  if (imgError) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-brand-primary text-white font-semibold rounded px-4`}
      >
        {branding.appName.charAt(0)}
      </div>
    );
  }

  return (
    <img
      src={branding.logoUrl}
      alt={branding.appName}
      className={`${className} object-contain`}
      onError={() => setImgError(true)}
      style={{ visibility: logoLoaded ? "visible" : "hidden" }}
    />
  );
};
