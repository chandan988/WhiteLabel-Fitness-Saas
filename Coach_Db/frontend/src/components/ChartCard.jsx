import { useId } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const ChartCard = ({
  title,
  data,
  color = "#0d9488",
  xKey = "_id",
  yKey = "value",
  height = 220,
  variant = "line",
  showToggle = false,
  onVariantChange
}) => {
  const gradientId = useId().replace(/:/g, "");

  return (
    <div className="bg-brand-card rounded-3xl p-5 shadow-card flex flex-col">
      <div className="flex items-center justify-between mb-4 gap-3">
        <p className="font-semibold text-brand-ink">{title}</p>
        {showToggle && (
          <div className="flex items-center gap-2 bg-brand-border/30 rounded-full p-1">
            {["line", "bar"].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => onVariantChange?.(type)}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition ${
                  variant === type
                    ? "bg-brand-primary text-brand-buttonText"
                    : "text-brand-muted"
                }`}
              >
                {type === "line" ? "Line" : "Bar"}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height={height}>
          {variant === "bar" ? (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey={xKey} stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Bar dataKey={yKey} fill={color} radius={[10, 10, 0, 0]} />
            </BarChart>
          ) : (
            <AreaChart data={data}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey={xKey} stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Area
                type="monotone"
                dataKey={yKey}
                stroke={color}
                fillOpacity={1}
                fill={`url(#${gradientId})`}
              />
              <Line
                type="monotone"
                dataKey={yKey}
                stroke={color}
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartCard;
