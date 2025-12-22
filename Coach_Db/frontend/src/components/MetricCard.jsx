const MetricCard = ({ label, value, unit, accent }) => (
  <div className="bg-brand-card rounded-3xl p-5 shadow-card">
    <p className="text-sm text-brand-muted">{label}</p>
    <p className="text-3xl font-semibold text-brand-ink mt-2">
      {value}
      {unit && <span className="text-base text-brand-muted ml-1">{unit}</span>}
    </p>
    {accent && <p className="text-sm text-emerald-600 mt-1">{accent}</p>}
  </div>
);

export default MetricCard;
