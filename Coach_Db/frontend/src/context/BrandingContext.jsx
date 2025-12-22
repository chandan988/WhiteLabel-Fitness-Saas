import { createContext, useContext, useEffect, useState } from "react";
import defaultLogo from "../assets/Logo.png";
import { useTenant } from "./TenantContext.jsx";

const BrandingContext = createContext();

const defaultBrand = {
  appName: "Jeevanshaili",
  logoUrl: defaultLogo,
  primaryColor: "#0d9488",
  secondaryColor: "#115e59",
  primaryHoverColor: "#0b7f71",
  secondaryHoverColor: "#0b4f4c",
  surfaceColor: "#f8fafc",
  cardColor: "#ffffff",
  textColor: "#0f172a",
  mutedTextColor: "#64748b",
  borderColor: "#e2e8f0",
  buttonTextColor: "#ffffff",
  shadowColor: "#0f172a"
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
    const toRgb = (value = "") => {
      const hex = value.replace("#", "");
      if (hex.length !== 6) return null;
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      if ([r, g, b].some(Number.isNaN)) return null;
      return { r, g, b };
    };

    const darkenHex = (value = "", ratio = 0.12) => {
      const rgb = toRgb(value);
      if (!rgb) return value;
      const clamp = (val) => Math.max(0, Math.min(255, val));
      const toHex = (val) => clamp(val).toString(16).padStart(2, "0");
      return `#${toHex(rgb.r * (1 - ratio))}${toHex(rgb.g * (1 - ratio))}${toHex(
        rgb.b * (1 - ratio)
      )}`;
    };

    const hexToRgba = (value = "", alpha = 0.08) => {
      const rgb = toRgb(value);
      if (!rgb) return `rgba(15, 23, 42, ${alpha})`;
      return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
    };

    const applyColors = (brand) => {
      const primaryHover =
        brand.primaryHoverColor || darkenHex(brand.primaryColor, 0.12);
      const secondaryHover =
        brand.secondaryHoverColor || darkenHex(brand.secondaryColor, 0.12);
      const shadowColor = brand.shadowColor || brand.textColor;
      const shadowRgba = hexToRgba(shadowColor, 0.12);

      document.documentElement.style.setProperty(
        "--brand-primary",
        brand.primaryColor
      );
      document.documentElement.style.setProperty(
        "--brand-secondary",
        brand.secondaryColor
      );
      document.documentElement.style.setProperty(
        "--brand-primary-hover",
        primaryHover
      );
      document.documentElement.style.setProperty(
        "--brand-secondary-hover",
        secondaryHover
      );
      document.documentElement.style.setProperty(
        "--brand-surface",
        brand.surfaceColor
      );
      document.documentElement.style.setProperty(
        "--brand-card",
        brand.cardColor
      );
      document.documentElement.style.setProperty(
        "--brand-ink",
        brand.textColor
      );
      document.documentElement.style.setProperty(
        "--brand-muted",
        brand.mutedTextColor
      );
      document.documentElement.style.setProperty(
        "--brand-border",
        brand.borderColor
      );
      document.documentElement.style.setProperty(
        "--brand-button-text",
        brand.buttonTextColor
      );
      document.documentElement.style.setProperty("--brand-shadow", shadowRgba);
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
            tenant.branding?.secondaryColor || defaultBrand.secondaryColor,
          primaryHoverColor:
            tenant.branding?.primaryHoverColor || defaultBrand.primaryHoverColor,
          secondaryHoverColor:
            tenant.branding?.secondaryHoverColor ||
            defaultBrand.secondaryHoverColor,
          surfaceColor:
            tenant.branding?.surfaceColor || defaultBrand.surfaceColor,
          cardColor: tenant.branding?.cardColor || defaultBrand.cardColor,
          textColor: tenant.branding?.textColor || defaultBrand.textColor,
          mutedTextColor:
            tenant.branding?.mutedTextColor || defaultBrand.mutedTextColor,
          borderColor: tenant.branding?.borderColor || defaultBrand.borderColor,
          buttonTextColor:
            tenant.branding?.buttonTextColor || defaultBrand.buttonTextColor,
          shadowColor:
            tenant.branding?.shadowColor || defaultBrand.shadowColor
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
    return (
      <div className={`${className} bg-brand-border animate-pulse rounded`} />
    );
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
