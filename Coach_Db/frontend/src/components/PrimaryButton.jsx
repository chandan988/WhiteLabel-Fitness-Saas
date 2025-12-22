import clsx from "clsx";

const PrimaryButton = ({ children, className, type = "button", ...props }) => (
  <button
    className={clsx(
      "w-full rounded-2xl bg-brand-primary text-brand-buttonText py-3 font-semibold shadow-soft hover:bg-brand-primaryHover transition",
      className
    )}
    type={type}
    {...props}
  >
    {children}
  </button>
);

export default PrimaryButton;
