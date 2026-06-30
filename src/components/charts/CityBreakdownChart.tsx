import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

type CitySlice = {
  name: string
  value: number
  pct: number
  color: string
}

type CityBreakdownChartProps = {
  slices: CitySlice[]
  total: number
}

export function CityBreakdownChart({ slices, total }: CityBreakdownChartProps) {
  if (slices.length === 0) {
    return <p className="py-4 text-center text-[11px] text-text-secondary">Sin datos por ciudad</p>
  }

  return (
    <div className="flex items-center gap-3">
      <div className="relative h-[110px] w-[110px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <Pie
              data={slices}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={32}
              outerRadius={46}
              paddingAngle={2}
              stroke="none"
              label={false}
              labelLine={false}
              isAnimationActive={false}
            >
              {slices.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [value ?? 0, 'NIDs']}
              contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <div className="flex flex-col items-center justify-center">
            <span className="text-base font-bold leading-none tabular-nums text-text-primary">{total}</span>
            <span className="mt-0.5 text-[9px] font-medium uppercase tracking-wide text-text-secondary">
              Total
            </span>
          </div>
        </div>
      </div>

      <ul className="min-w-0 flex-1 space-y-1.5">
        {slices.map((city) => (
          <li key={city.name} className="flex items-center justify-between gap-1 text-[11px]">
            <span className="flex min-w-0 items-center gap-1.5">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ background: city.color }}
              />
              <span className="truncate text-text-secondary">{city.name}</span>
            </span>
            <span className="shrink-0 tabular-nums font-medium">
              {city.pct}% <span className="text-text-secondary">({city.value})</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
