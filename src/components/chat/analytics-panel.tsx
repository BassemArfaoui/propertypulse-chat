import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TrendingUp } from "lucide-react";
import type { AnalyticsPayload } from "@/lib/agent-types";

export function AnalyticsPanel({ data }: { data: AnalyticsPayload }) {
  return (
    <div className="animate-rise-in w-full rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="flex items-center gap-2">
        <TrendingUp className="size-4 text-primary" />
        <h3 className="font-display text-base">{data.title}</h3>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {data.kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-xl border border-border bg-surface-2 p-3">
            <p className="text-xs text-muted-foreground">{kpi.label}</p>
            <p className="mt-1 font-display text-lg">{kpi.value}</p>
            {kpi.delta ? <p className="text-xs text-primary">{kpi.delta}</p> : null}
          </div>
        ))}
      </div>

      <div className="mt-4 h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.series} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
            <defs>
              <linearGradient id="area-primary" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} stroke="var(--color-muted-foreground)" />
            <YAxis tickLine={false} axisLine={false} fontSize={11} stroke="var(--color-muted-foreground)" width={48} />
            <Tooltip
              cursor={{ stroke: "var(--color-border)" }}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid var(--color-border)",
                background: "var(--color-popover)",
                color: "var(--color-popover-foreground)",
                fontSize: 12,
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="var(--color-primary)"
              strokeWidth={2}
              fill="url(#area-primary)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
