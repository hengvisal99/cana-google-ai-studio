'use client';

import React, { useMemo, useState } from 'react';
import {
  addMonths,
  endOfMonth,
  format,
  isValid,
  min as minDate,
  parseISO,
  startOfDay,
  startOfMonth,
} from 'date-fns';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  TooltipContentProps,
} from 'recharts';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { CustomerTypeId, CustomerTypeRecord, DesignTheme } from '@/types';
import { CUSTOMER_TYPES } from '@/lib/customer-types';
import { cn } from '@/lib/utils';
import { DATA_END, customersHolding, customersJoining, toHoldings } from '@/lib/product-holdings';
import { CHART_RESIZE_DEBOUNCE_MS, TooltipCard } from './ChartTooltip';

const YEAR_START = parseISO('2026-01-01');

/** Fewest months plotted, so a one-month preset (e.g. MTD) still reads as a trend. */
const MIN_TREND_MONTHS = 6;

/**
 * One colour per product, keyed by id so a product keeps its colour whatever its rank.
 * Validated as a set (all pairs, light surface): every pair stays apart under colour-blind
 * simulation (worst ΔE 8.2), so each line is solid with no dash needed as a second cue.
 */
const PRODUCT_COLORS: Record<CustomerTypeId, string> = {
  'csx-screen': '#2a78d6',
  'client-card': '#eda100',
  'employee-trading': '#0e9f8f',
  'vip-customer': '#4a3aa7',
  'ipo-customer': '#e34948',
  'personal-representative': '#b3368a',
};

const colorFor = (index: number) => PRODUCT_COLORS[CUSTOMER_TYPES[index].id];

const AXIS_TICK = { fill: '#64748B', fontSize: 11 };

interface Bucket {
  label: string;
  month: Date;
  end: Date;
}

/** One row per month; counts live under index keys so product names never become data keys. */
type TrendPoint = { label: string } & Record<string, number | string>;

const productKey = (index: number) => `p${index}`;

/** Resolves the dashboard's date preset into a range, clipped to DATA_END. */
function resolveRange(preset: string, customStart: string, customEnd: string) {
  switch (preset) {
    case 'TODAY':
    case '7D':
      return { start: parseISO('2026-08-24'), end: DATA_END };
    case '30D':
    case 'MTD':
      return { start: parseISO('2026-08-01'), end: DATA_END };
    case 'Q3_2026':
      return { start: parseISO('2026-07-01'), end: DATA_END };
    case 'YTD':
      return { start: YEAR_START, end: DATA_END };
    case 'CUSTOM': {
      const start = parseISO(customStart);
      const end = parseISO(customEnd);
      if (!isValid(start) || !isValid(end)) return null;
      const clippedEnd = minDate([end, DATA_END]);
      return clippedEnd > start ? { start, end: clippedEnd } : null;
    }
    default:
      return { start: parseISO('2026-08-01'), end: DATA_END };
  }
}

/** Whole months ending with the period's last month, reaching back at least MIN_TREND_MONTHS. */
function buildMonthBuckets(start: Date, end: Date): Bucket[] {
  const earliest = addMonths(startOfMonth(end), -(MIN_TREND_MONTHS - 1));
  const buckets: Bucket[] = [];
  for (let m = minDate([startOfMonth(start), earliest]); m <= end; m = addMonths(m, 1)) {
    buckets.push({ label: format(m, 'MMM'), month: m, end: minDate([startOfDay(endOfMonth(m)), end]) });
  }
  return buckets;
}

interface ProductAdoptionTrendChartProps {
  customerTypeRecords: CustomerTypeRecord[];
  datePreset: string;
  customStartDate: string;
  customEndDate: string;
  periodLabel: string;
  isMounted: boolean;
  theme: DesignTheme;
}

export function ProductAdoptionTrendChart({
  customerTypeRecords,
  datePreset,
  customStartDate,
  customEndDate,
  periodLabel,
  isMounted,
  theme,
}: ProductAdoptionTrendChartProps) {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const trend = useMemo(() => {
    const range = resolveRange(datePreset, customStartDate, customEndDate);
    if (!range) return null;

    const { start, end } = range;
    const holdings = toHoldings(customerTypeRecords);
    const atEnd = customersHolding(holdings, end);
    const newInPeriod = customersJoining(holdings, start, end);

    // Most-held at period end; ties go to the product that gained more customers in the period.
    const topIndex = CUSTOMER_TYPES.reduce(
      (best, _, i) =>
        atEnd[i] > atEnd[best] ||
        (atEnd[i] === atEnd[best] && newInPeriod[i] > newInPeriod[best])
          ? i
          : best,
      0
    );

    const buckets = buildMonthBuckets(start, end);
    const points: TrendPoint[] = buckets.map((b) => {
      const counts = customersHolding(holdings, b.end);
      const point: TrendPoint = { label: b.label };
      counts.forEach((count, i) => {
        point[productKey(i)] = count;
      });
      return point;
    });

    return {
      topIndex,
      product: CUSTOMER_TYPES[topIndex].label,
      trendRange: `${format(buckets[0].month, 'MMM yyyy')} – ${format(buckets[buckets.length - 1].month, 'MMM yyyy')}`,
      points,
      customers: atEnd[topIndex],
      hasHoldings: points.some((p) => CUSTOMER_TYPES.some((_, i) => Number(p[productKey(i)]) > 0)),
    };
  }, [customerTypeRecords, datePreset, customStartDate, customEndDate]);

  // Paint order: the focused product last, so it sits on top of any line it overlaps.
  const drawOrder = CUSTOMER_TYPES.map((_, i) => i).sort(
    (a, b) => Number(a === focusedIndex) - Number(b === focusedIndex)
  );
  const isDimmed = (i: number) => focusedIndex !== null && focusedIndex !== i;
  const lastIndex = trend ? trend.points.length - 1 : -1;

  return (
    <div
      id="chart-product-adoption-trend"
      className={cn(
        'h-full p-5 bg-white border border-slate-200 flex flex-col',
        theme === 'glassmorphism'
          ? 'rounded-2xl bg-white/85 border-white/80 shadow-sm'
          : 'rounded-xl shadow-xs'
      )}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-900 whitespace-nowrap">Product Performance</h2>
        {trend?.hasHoldings && (
          <ul
            className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs font-medium"
            onMouseLeave={() => setFocusedIndex(null)}
          >
            {CUSTOMER_TYPES.map((type, i) => (
              <li key={type.id}>
                <button
                  type="button"
                  onMouseEnter={() => setFocusedIndex(i)}
                  onFocus={() => setFocusedIndex(i)}
                  onBlur={() => setFocusedIndex(null)}
                  className={cn(
                    'flex items-center gap-1.5 px-1.5 py-0.5 rounded-md transition-colors cursor-default',
                    focusedIndex === i ? 'bg-slate-100' : 'hover:bg-slate-50'
                  )}
                >
                  <span className="w-4 h-0.5 rounded-full inline-block shrink-0" style={{ backgroundColor: colorFor(i) }} />
                  <span className={i === trend.topIndex ? 'text-slate-900 font-semibold' : 'text-slate-600'}>
                    {type.label}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {!trend || !trend.hasHoldings ? (
        <div className="h-[280px] flex items-center justify-center text-xs text-slate-400 text-center px-4">
          {!trend
            ? 'Select a valid date range ending on or before 31 Aug 2026 to see product performance.'
            : 'No customer holds a product in this period yet.'}
        </div>
      ) : (
        <>
          <div
            className="h-[280px] w-full pt-4 overflow-hidden"
            role="img"
            aria-label={`Customers holding each of ${CUSTOMER_TYPES.length} products at month end, ${trend.trendRange}. Most held: ${trend.product}, ${trend.customers} customers at the end of ${periodLabel}.`}
          >
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%" debounce={CHART_RESIZE_DEBOUNCE_MS}>
                <LineChart data={trend.points} margin={{ top: 10, right: 28, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="label" tick={AXIS_TICK} axisLine={{ stroke: '#CBD5E1' }} tickLine={false} minTickGap={16} />
                  <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} width={32} allowDecimals={false} />
                  <Tooltip
                    cursor={{ stroke: '#CBD5E1', strokeWidth: 1 }}
                    content={(props) => <AdoptionTooltip {...props} />}
                  />
                  {drawOrder.map((i) => {
                    const color = colorFor(i);
                    const opacity = isDimmed(i) ? 0.2 : 1;
                    return (
                      <Line
                        key={CUSTOMER_TYPES[i].id}
                        type="linear"
                        dataKey={productKey(i)}
                        name={CUSTOMER_TYPES[i].label}
                        stroke={color}
                        strokeWidth={focusedIndex === i ? 3 : 2}
                        strokeOpacity={opacity}
                        dot={{ r: 4, fill: color, stroke: '#FFFFFF', strokeWidth: 1.5, fillOpacity: opacity, strokeOpacity: opacity }}
                        activeDot={{ r: 5, fill: color, stroke: '#FFFFFF', strokeWidth: 2 }}
                        isAnimationActive={false}
                        label={({ x, y, index, value }) =>
                          index === lastIndex ? (
                            <text x={Number(x) + 9} y={Number(y)} dy={4} fontSize={11} fontWeight={600} fill="#0F172A" fillOpacity={opacity}>
                              {value}
                            </text>
                          ) : null
                        }
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">Loading chart...</div>
            )}
          </div>

          <table className="sr-only">
            <caption>{`Customers holding each product at month end, ${trend.trendRange}`}</caption>
            <thead>
              <tr>
                <th scope="col">Month</th>
                {CUSTOMER_TYPES.map((type) => (
                  <th key={type.id} scope="col">{type.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trend.points.map((p, index) => (
                <tr key={index}>
                  <td>{p.label}</td>
                  {CUSTOMER_TYPES.map((type, i) => (
                    <td key={type.id}>{p[productKey(i)]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

/** Lists every product for the hovered month, highest first. */
function AdoptionTooltip({
  active,
  payload,
  label,
}: TooltipContentProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null;

  const row = payload[0].payload as TrendPoint;
  const rows = CUSTOMER_TYPES.map((type, i) => ({
    label: type.label,
    color: colorFor(i),
    value: Number(row[productKey(i)]),
  })).sort((a, b) => b.value - a.value);

  return <TooltipCard title={label} subtitle="Customers holding" rows={rows} />;
}
