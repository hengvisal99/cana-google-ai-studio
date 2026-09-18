import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Charts wait this long after their container stops resizing before redrawing. The sidebar
 * slide changes the content width every frame for 300ms; redrawing every chart on each of
 * those frames made the slide stutter.
 */
export const CHART_RESIZE_DEBOUNCE_MS = 200;

export interface TooltipRow {
  label: string;
  value: React.ReactNode;
  /** Series colour; omitted for plain facts like "Share" */
  color?: string;
}

/**
 * The dashboard's one light tooltip card. Recharts tooltips render it as `content`;
 * the hand-built charts (bars, donut) position it themselves.
 */
export function TooltipCard({
  title,
  subtitle,
  rows,
  className,
}: {
  title: React.ReactNode;
  /** Quieter text beside the title, e.g. what the numbers count */
  subtitle?: React.ReactNode;
  rows: TooltipRow[];
  className?: string;
}) {
  return (
    <div
      role="tooltip"
      className={cn(
        'min-w-[200px] rounded-xl border border-slate-200 bg-white/95 backdrop-blur px-3.5 py-3 text-xs shadow-lg shadow-slate-900/10',
        className
      )}
    >
      <div className="flex items-baseline justify-between gap-4 pb-2 mb-2 border-b border-slate-100">
        <span className="text-xs font-semibold text-slate-900">{title}</span>
        {subtitle && <span className="text-[11px] text-slate-400">{subtitle}</span>}
      </div>
      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center gap-2.5 leading-4">
            {row.color && <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: row.color }} />}
            <span className="flex-1 text-slate-700">{row.label}</span>
            <span className="pl-6 min-w-[2.5rem] text-right font-mono font-semibold text-slate-900 tabular-nums">
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Hover card for the hand-built bar rows: absolutely placed above its row, shown on hover or
 * keyboard focus. The row needs `group/tip relative`.
 */
export function RowTooltip({ title, rows }: { title: React.ReactNode; rows: TooltipRow[] }) {
  return (
    <div className="pointer-events-none absolute right-2 bottom-full z-30 mb-1 hidden group-hover/tip:block group-focus-visible/tip:block">
      <TooltipCard title={title} rows={rows} />
    </div>
  );
}
