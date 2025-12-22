import clsx from "clsx";

const PrimaryButton = ({ children, className, type = "button", ...props }) => (
  <button
    className={clsx(
      "w-full rounded-2xl bg-brand-primary text-white py-3 font-semibold hover:bg-brand-secondary transition",
      className
    )}
    type={type}
    {...props}
  >
    {children}
  </button>
);

export default PrimaryButton;
