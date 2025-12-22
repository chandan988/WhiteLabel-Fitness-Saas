const OnboardingCard = ({ title, subtitle, children }) => (
  <div className="w-full max-w-md bg-brand-card rounded-[32px] shadow-card p-10">
    <div className="mb-8 text-center space-y-1">
      <h1 className="text-3xl font-semibold text-brand-ink">{title}</h1>
      {subtitle && <p className="text-brand-muted">{subtitle}</p>}
    </div>
    {children}
  </div>
);

export default OnboardingCard;
