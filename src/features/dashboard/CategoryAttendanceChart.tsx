import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CategoryAttendanceRate } from "./dashboardTypes";

interface Props {
  data: CategoryAttendanceRate[];
}

export default function CategoryAttendanceChart({ data }: Props) {
  const chartData = data.map((item) => ({
    categoria: item.category,
    presenca: item.percentage,
    total: item.totalAttendances,
    presentes: item.presentCount,
  }));

  const hasData = chartData.some((item) => item.total > 0);

  if (!hasData) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-500">
        Nenhum registro de treino nos últimos 30 dias para exibir no gráfico.
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis
            dataKey="categoria"
            tick={{ fontSize: 12, fill: "#64748B" }}
            axisLine={{ stroke: "#CBD5E1" }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 12, fill: "#64748B" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(val) => `${val}%`}
          />
          <Tooltip
            formatter={(value) => [
              `${value}% de presença`,
              "Frequência",
            ]}
            labelFormatter={(label) => `Categoria: ${label}`}
            contentStyle={{
              backgroundColor: "#FFFFFF",
              borderColor: "#E2E8F0",
              borderRadius: "0.5rem",
              fontSize: "0.75rem",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
          />
          <Bar
            dataKey="presenca"
            name="Presença"
            fill="#0284C7"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
