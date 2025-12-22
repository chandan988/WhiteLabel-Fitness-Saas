import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const ChartCard = ({ title, data, color = "#0d9488" }) => (
  <div className="bg-white rounded-3xl p-5 shadow-card flex flex-col">
    <p className="font-semibold text-gray-900 mb-4">{title}</p>
    <div className="flex-1">
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`color${title}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.8} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="_id" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            fillOpacity={1}
            fill={`url(#color${title})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default ChartCard;
