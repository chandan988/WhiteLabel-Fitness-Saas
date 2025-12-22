import clsx from "clsx";
import { BrandLogo } from "../context/BrandingContext.jsx";

const GradientLayout = ({ step, steps = [], children, cardAlign = "right" }) => {
  return (
    <div className="min-h-screen flex items-stretch bg-white">
      <div className="w-1/2 hidden lg:flex">
        <div className="relative flex-1 rounded-[36px] m-6 p-10 bg-gradient-to-br from-[#eef6ee] via-[#d2ede8] to-[#9cc2b1] shadow-card">
          <BrandLogo className="h-14 mb-16" />
          <div className="max-w-sm">
            <p className="text-4xl font-semibold text-gray-800 mb-4">
              Get Started with Us
            </p>
            <p className="text-gray-600">
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
                    "flex-1 rounded-2xl px-4 py-3 backdrop-blur bg-white/40 flex items-center gap-3 text-sm",
                    active && "bg-white shadow"
                  )}
                >
                  <span
                    className={clsx(
                      "h-8 w-8 rounded-full border flex items-center justify-center",
                      active
                        ? "border-gray-900 bg-gray-900 text-white"
                        : "border-white/80 text-gray-500"
                    )}
                  >
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-gray-800">{label}</p>
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