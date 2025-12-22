const TextInput = ({
  label,
  type = "text",
  placeholder,
  register,
  name,
  required,
  icon,
  ...rest
}) => (
  <label className="block">
    {label && (
      <span className="text-sm font-medium text-brand-ink">{label}</span>
    )}
    <div className="mt-1 relative">
      <input
        type={type}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-brand-border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-primary placeholder:text-brand-muted"
        {...(register ? register(name, { required }) : {})}
        {...rest}
      />
      {icon && <span className="absolute right-4 top-1/2 -translate-y-1/2">{icon}</span>}
    </div>
  </label>
);

export default TextInput;
