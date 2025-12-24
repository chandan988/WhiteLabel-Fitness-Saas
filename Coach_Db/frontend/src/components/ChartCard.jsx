import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const slugifyId = (value) => value.replace(/\s+/g, "-").toLowerCase();

const ChartCard = ({
  title,
  data,
  color = "#0d9488",
  xKey = "_id",
  yKey = "value",
  height = 220
}) => {
  const gradientId = `chart-${slugifyId(title)}`;

  return (
    <div className="bg-brand-card rounded-3xl p-5 shadow-card flex flex-col">
      <p className="font-semibold text-brand-ink mb-4">{title}</p>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.8} />
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
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartCard;
