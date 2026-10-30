import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, XAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { formatNumber } from "@/polymet/lib/format";
import { cn } from "@/lib/utils";

export interface ChartSeries {
  key: string;
  label: string;
  color: string;
}

interface TrendChartProps {
  data: Record<string, string | number>[];
  xKey: string;
  series: ChartSeries[];
  variant?: "line" | "area" | "bar";
  height?: number;
  stacked?: boolean;
}

export function TrendChart({ data, xKey, series, variant = "line", height = 220, stacked }: TrendChartProps) {
  const config = Object.fromEntries(series.map((s) => [s.key, { label: s.label, color: s.color }]));
  return (
    <div className="space-y-2">
      <ChartContainer config={config} className="aspect-[none] w-full" style={{ height }}>
        {variant === "bar" ? (
          <BarChart data={data} margin={{ left: 4, right: 4, top: 8 }}>
            <ChartTooltip content={<ChartTooltipContent />} />
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey={xKey} axisLine={false} tickLine={false} fontSize={11} />
            {series.map((s, i) => (
              <Bar
                key={s.key}
                dataKey={s.key}
                fill={s.color}
                stackId={stacked ? "a" : undefined}
                radius={stacked ? (i === series.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]) : [4, 4, 0, 0]}
                maxBarSize={36}
              />
            ))}
          </BarChart>
        ) : variant === "area" ? (
          <AreaChart data={data} margin={{ left: 4, right: 4, top: 8 }}>
            <ChartTooltip content={<ChartTooltipContent />} />
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey={xKey} axisLine={false} tickLine={false} fontSize={11} />
            {series.map((s) => (
              <Area key={s.key} dataKey={s.key} type="monotone" stroke={s.color} fill={s.color} fillOpacity={0.12} strokeWidth={2} />
            ))}
          </AreaChart>
        ) : (
          <LineChart data={data} margin={{ left: 4, right: 4, top: 8 }}>
            <ChartTooltip content={<ChartTooltipContent />} />
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey={xKey} axisLine={false} tickLine={false} fontSize={11} />
            {series.map((s) => (
              <Line key={s.key} dataKey={s.key} type="monotone" stroke={s.color} strokeWidth={2} dot={false} />
            ))}
          </LineChart>
        )}
      </ChartContainer>
      <div className="flex flex-wrap gap-3">
        {series.map((s) => (
          <span key={s.key} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="size-2 rounded-sm" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Stage-by-stage conversion bars computed from recorded stage counts. */
export function FunnelBars({ steps, className }: { steps: { stage: string; value: number }[]; className?: string }) {
  const max = steps[0]?.value || 1;
  return (
    <ol className={cn("space-y-3", className)}>
      {steps.map((step, i) => {
        const prev = i > 0 ? steps[i - 1].value : null;
        const rate = prev ? (step.value / prev) * 100 : null;
        return (
          <li key={step.stage} className="space-y-1">
            <div className="flex items-baseline justify-between gap-2 text-xs">
              <span className="font-medium text-foreground">{step.stage}</span>
              <span className="tabular-nums text-muted-foreground">
                {formatNumber(step.value)}
                {rate !== null && <span className="ml-2 font-medium text-foreground">{rate.toFixed(1)}%</span>}
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-primary"
                style={{ width: `${Math.max(2, (step.value / max) * 100)}%`, opacity: 1 - i * 0.14 }}
              />
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function BreakdownList({ items, format = formatNumber }: { items: { label: string; value: number; hint?: string }[]; format?: (n: number) => string }) {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item.label} className="space-y-1">
          <div className="flex items-baseline justify-between gap-2 text-xs">
            <span className="truncate">{item.label}</span>
            <span className="shrink-0 tabular-nums text-muted-foreground">
              {format(item.value)}
              {item.hint && <span className="ml-1.5 text-[10px] uppercase">{item.hint}</span>}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-muted">
            <div className="h-1.5 rounded-full bg-[#997fff]" style={{ width: `${(item.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
