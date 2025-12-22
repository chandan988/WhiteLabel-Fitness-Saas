import clsx from "clsx";
import { BrandLogo } from "../context/BrandingContext.jsx";

const GradientLayout = ({ step, steps = [], children, cardAlign = "right" }) => {
  return (
    <div className="min-h-screen flex items-stretch bg-brand-card">
      <div className="w-1/2 hidden lg:flex">
        <div className="relative flex-1 rounded-[36px] m-6 p-10 bg-gradient-to-br from-[#eef6ee] via-[#d2ede8] to-[#9cc2b1] shadow-card">
          <BrandLogo className="h-14 mb-16" />
          <div className="max-w-sm">
            <p className="text-4xl font-semibold text-brand-ink mb-4">
              Get Started with Us
            </p>
            <p className="text-brand-muted">
              Complete these easy steps to register your account.
            </p>
          </div>

          <div className="absolute bottom-10 left-10 right-10 flex gap-4">
            {steps.map((label, index) => {
              const active = step === index + 1;
              return (
                <div
                  key={label}
                  className={clsx(
                    "flex-1 rounded-2xl px-4 py-3 backdrop-blur bg-brand-card flex items-center gap-3 text-sm",
                    active && "bg-brand-card shadow"
                  )}
                >
                  <span
                    className={clsx(
                      "h-8 w-8 rounded-full border flex items-center justify-center",
                      active
                        ? "border-brand-primary bg-brand-primary text-brand-buttonText"
                        : "border-white/80 text-brand-muted"
                    )}
                  >
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-brand-ink">{label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div
        className={clsx(
          "flex-1 flex items-center justify-center px-4 py-12",
          cardAlign === "center" ? "lg:pl-16" : "lg:pr-16"
        )}
      >
        {children}
      </div>
    </div>
  );
};

export default GradientLayout;
