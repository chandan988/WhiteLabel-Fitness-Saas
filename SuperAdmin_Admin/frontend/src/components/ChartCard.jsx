import {
  LineChart,
  Line,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  Tooltip
} from "recharts";

const ChartCard = ({
  title,
  data,
  xKey = "_id",
  yKey = "value",
  color = "#0f172a",
  variant = "line",
  onVariantChange
}) => {
  const hasToggle = typeof onVariantChange === "function";

  return (
    <div className="bg-white rounded-3xl shadow-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {hasToggle ? (
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              className={`px-3 py-1 rounded-full border ${
                variant === "line"
                  ? "bg-gray-900 text-white border-gray-900"
                  : "border-gray-200 text-gray-500"
              }`}
              onClick={() => onVariantChange("line")}
            >
              Line
            </button>
            <button
              type="button"
              className={`px-3 py-1 rounded-full border ${
                variant === "bar"
                  ? "bg-gray-900 text-white border-gray-900"
                  : "border-gray-200 text-gray-500"
              }`}
              onClick={() => onVariantChange("bar")}
            >
              Bar
            </button>
          </div>
        ) : null}
      </div>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          {variant === "bar" ? (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey={xKey} tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey={yKey} fill={color} radius={[6, 6, 0, 0]} />
            </BarChart>
          ) : (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey={xKey} tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey={yKey}
                stroke={color}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartCard;
