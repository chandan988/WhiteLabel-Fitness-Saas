const MetricCard = ({ label, value, unit, accent }) => (
  <div className="bg-white rounded-3xl p-5 shadow-card">
    <p className="text-sm text-gray-500">{label}</p>
    <p className="text-3xl font-semibold text-gray-900 mt-2">
      {value}
      {unit && <span className="text-base text-gray-500 ml-1">{unit}</span>}
    </p>
    {accent && <p className="text-sm text-emerald-600 mt-1">{accent}</p>}
  </div>
);

export default MetricCard;
