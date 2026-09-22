'use client';

import React, { useState, useSyncExternalStore } from 'react';
import Image from 'next/image';
import { Individual, CustomerType, CustomerTypeRecord } from '@/types';
import {
  Users,
  DollarSign,
  UserCheck,
  UserPlus,
  Printer,
  FileText,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  Layers,
  ExternalLink,
  X,
  ChevronDown,
  Filter,
  SlidersHorizontal,
  Sparkles,
  Clock,
  Check,
  RotateCcw,
  LayoutGrid,
  Eye,
  CheckCircle2,
  TrendingUp,
  Activity,
  Wallet,
  Percent,
  ArrowUp,
  ArrowDown,
  Target,
  Zap,
  BarChart3,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ComposedChart,
  Line
} from 'recharts';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { FormDatePicker } from '@/components/ui/form';
import { ProductAdoptionTrendChart } from './ProductAdoptionTrendChart';
import { CHART_RESIZE_DEBOUNCE_MS, RowTooltip, TooltipCard } from './ChartTooltip';
import {
  ipoTotals,
  segmentSummary,
  toIpoSubscriptions,
  topIpoCustomers,
  topIpos,
} from '@/lib/product-holdings';

interface DashboardScreenProps {
  individuals: Individual[];
  onNavigateToInsert: () => void;
  onNavigateToList: () => void;
  onNavigateToCustomer360: (individual?: Individual) => void;
  onViewIndividual: (individual: Individual) => void;
  onNavigateToUpdate: (individual: Individual) => void;
  customerTypeRecords: CustomerTypeRecord[];
}

// 1. Data Definitions from specification
const CUSTOMER_GROWTH_DATA = [
  { month: 'Jan 2026', totalCustomers: 32, newCustomers: 4 },
  { month: 'Feb 2026', totalCustomers: 35, newCustomers: 3 },
  { month: 'Mar 2026', totalCustomers: 37, newCustomers: 2 },
  { month: 'Apr 2026', totalCustomers: 39, newCustomers: 4 },
  { month: 'May 2026', totalCustomers: 41, newCustomers: 3 },
  { month: 'Jun 2026', totalCustomers: 43, newCustomers: 2 },
  { month: 'Jul 2026', totalCustomers: 45, newCustomers: 3 },
  { month: 'Aug 2026', totalCustomers: 51, newCustomers: 8 },
];

/** Room kept beside the longest Age Profile bar for its percentage label. */
const AGE_LABEL_ROOM = '3rem';

const AGE_PROFILE_DATA = [
  { group: '18–24', customers: 12, percentage: 24 },
  { group: '25–34', customers: 18, percentage: 36 },
  { group: '35–44', customers: 12, percentage: 24 },
  { group: '45–54', customers: 6, percentage: 12 },
  { group: '55+', customers: 3, percentage: 4 },
];

const AGE_PROFILE_MAX = Math.max(...AGE_PROFILE_DATA.map((d) => d.percentage));

const RISK_PROFILE_DATA = [
  { category: 'Low', customers: 12, percentage: 34.3, color: '#10B981' },
  { category: 'Medium', customers: 12, percentage: 34.3, color: '#F59E0B' },
  { category: 'High', customers: 11, percentage: 31.4, color: '#EF4444' },
];

const ACCOUNT_STATUS_DATA = [
  { status: 'Active', customers: 44, percentage: 86.3 },
  { status: 'Not Opened', customers: 4, percentage: 7.8 },
  { status: 'Closed', customers: 3, percentage: 5.9 },
];

const ACCOUNT_STATUS_TOTAL = ACCOUNT_STATUS_DATA.reduce((sum, s) => sum + s.customers, 0);
const ACCOUNT_STATUS_SUMMARY = ACCOUNT_STATUS_DATA.map(
  (s) => `${s.status}: ${s.customers} (${s.percentage}%)`
).join(', ');

/**
 * "Not Opened" moves off red — it is a pending state, not a failure — and the two
 * old reds (#EB5757 / #EF4444) sat ΔE 3.0 apart, which nobody can tell apart.
 * These three clear the lightness, chroma, CVD and normal-vision checks on a light
 * surface; all three are under 3:1 against it, which the legend's visible labels
 * and counts cover.
 */
const ACCOUNT_STATUS_COLORS: Record<string, string> = {
  Active: '#10b981',
  'Not Opened': '#3b82f6',
  Closed: '#f87171',
};

const DONUT_RADIUS = 65;
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;
const DONUT_GAP = 12; // blank arc between segments, in user units

/**
 * Arc length and start offset per status, accumulated once rather than during render.
 * Gaps come out of the ring *before* the split, so each arc stays proportional to its
 * share — subtracting a flat gap per segment would shrink the small ones far more.
 */
const ACCOUNT_STATUS_ARCS = (() => {
  const drawable = DONUT_CIRCUMFERENCE - DONUT_GAP * ACCOUNT_STATUS_DATA.length;

  return ACCOUNT_STATUS_DATA.reduce<{ status: string; dash: number; offset: number }[]>(
    (arcs, item) => {
      const previous = arcs[arcs.length - 1];
      const offset = previous ? previous.offset + previous.dash + DONUT_GAP : 0;
      const dash = (item.customers / ACCOUNT_STATUS_TOTAL) * drawable;
      arcs.push({ status: item.status, dash, offset });
      return arcs;
    },
    []
  );
})();

/** Donut built from ACCOUNT_STATUS_DATA: one arc per status, butt caps, even gaps. */
function AccountStatusDonut() {
  const radius = DONUT_RADIUS;
  const circumference = DONUT_CIRCUMFERENCE;

  return (
    <svg
      viewBox="0 0 180 180"
      role="img"
      aria-label={`Account status of ${ACCOUNT_STATUS_TOTAL} accounts. ${ACCOUNT_STATUS_SUMMARY}`}
      className="w-full h-full max-w-[180px] max-h-[180px]"
    >
      {ACCOUNT_STATUS_DATA.map((item, index) => {
        const { dash, offset } = ACCOUNT_STATUS_ARCS[index];

        return (
          <circle
            key={item.status}
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke={ACCOUNT_STATUS_COLORS[item.status]}
            strokeWidth="15"
            strokeLinecap="butt"
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeDashoffset={-offset}
            transform="rotate(-90 90 90)"
          />
        );
      })}
    </svg>
  );
}

/** Shared legend: label, count and share on one row each, so identity is never colour-alone. */
function AccountStatusLegend() {
  return (
    <div className="pt-3 border-t border-slate-100 space-y-1.5">
      {ACCOUNT_STATUS_DATA.map((item) => (
        <div key={item.status} className="flex items-center gap-2 text-xs">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: ACCOUNT_STATUS_COLORS[item.status] }}
          />
          <span className="text-slate-600 font-medium flex-1">{item.status}</span>
          <span className="font-semibold text-slate-900 font-mono">{item.customers}</span>
          <span className="text-slate-400 font-mono w-11 text-right">{item.percentage}%</span>
        </div>
      ))}
    </div>
  );
}

const INVESTMENT_EXPERIENCE_DATA = [
  { product: 'Stock', count: 22, percentage: 43, color: '#3B82F6' },
  { product: 'Bond', count: 15, percentage: 29, color: '#EA580C' },
  { product: 'Treasury Bill', count: 14, percentage: 27, color: '#0D9488' },
  { product: 'Other Securities', count: 7, percentage: 14, color: '#8B5CF6' },
  { product: 'Nothing', count: 7, percentage: 14, color: '#64748B' },
];

const SEGMENT_BADGE: Record<CustomerType, string> = {
  Retail: 'bg-blue-50 text-blue-700 border-blue-200',
  'High Net Worth': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Institutional: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Corporate Officer': 'bg-purple-50 text-purple-700 border-purple-200',
};

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
/**
 * "$18K", "$1.2M". Built by hand rather than with Intl's compact notation: Node and the
 * browser ship different ICU data ("$18.0K" vs "$18K"), which broke hydration.
 */
function usdCompact(value: number) {
  const units: [number, string][] = [
    [1e9, 'B'],
    [1e6, 'M'],
    [1e3, 'K'],
  ];
  for (const [size, suffix] of units) {
    if (Math.abs(value) >= size) return `$${(value / size).toFixed(1).replace(/\.0$/, '')}${suffix}`;
  }
  return usd.format(value);
}

const tenureText = (years: number | null) => (years === null ? '—' : `${years.toFixed(1)} Years`);

/** "+12.5%" style change; "New" when there was nothing last month to compare against. */
const momText = (change: number | null) =>
  change === null ? 'New' : `${change > 0 ? '+' : change < 0 ? '−' : ''}${Math.abs(change).toFixed(1)}%`;

/** Month-over-month chip: green up, red down, grey flat, blue for a first subscription this month. */
function MomChip({ change }: { change: number | null }) {
  const Icon = change === null || change === 0 ? null : change > 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 font-semibold font-mono px-1.5 py-0.5 rounded text-[11px]',
        change === null
          ? 'text-blue-700 bg-blue-50'
          : change > 0
            ? 'text-emerald-600 bg-emerald-50'
            : change < 0
              ? 'text-red-600 bg-red-50'
              : 'text-slate-500 bg-slate-100'
      )}
      title={change === null ? 'First IPO subscription this month' : 'IPO subscribed vs the end of last month'}
    >
      {Icon && <Icon className="w-3 h-3" />}
      {momText(change)}
    </span>
  );
}

/** "↑ 4.2% vs last month" for the report; null means there was nothing to compare against. */
function changeText(change: number | null) {
  if (change === null) return 'No prior month';
  if (change === 0) return 'No change vs last month';
  return `${change > 0 ? '↑' : '↓'} ${Math.abs(change).toFixed(1)}% vs last month`;
}

const SUMMARY_CARDS: {
  label: string;
  value: string;
  change: number | null;
  icon: typeof Users;
  outline: string;
  iconStyle: string;
}[] = [
  {
    label: 'Total Customers',
    value: '51',
    change: 18.6,
    icon: Users,
    outline: 'border-blue-200/90 hover:border-blue-400 hover:shadow-blue-500/10',
    iconStyle: 'bg-blue-50 text-blue-600',
  },
  {
    label: 'Active Accounts',
    value: '44',
    change: 22.2,
    icon: UserCheck,
    outline: 'border-sky-200/90 hover:border-sky-400 hover:shadow-sky-500/10',
    iconStyle: 'bg-sky-50 text-sky-600',
  },
  {
    label: 'New Customers',
    value: '8',
    change: 33.3,
    icon: UserPlus,
    outline: 'border-cyan-200/90 hover:border-cyan-400 hover:shadow-cyan-500/10',
    iconStyle: 'bg-cyan-50 text-cyan-600',
  },
];

type ChartSlot = 'growth' | 'age' | 'risk' | 'account' | 'investment' | 'product';

/**
 * Chart grid: 4 columns and 2 rows on xl, with the trend charts stacked on the left and the
 * breakdown cards on the right; 2 columns below xl, one column on small screens.
 * Top row: who the customers are. Bottom row: what they hold.
 * min-w-0 lets a card shrink below its chart's rendered width, so charts resize instead of overflowing.
 */
const CHART_SLOTS: Record<ChartSlot, string> = {
  growth: 'min-w-0 order-1 lg:col-span-2',
  age: 'min-w-0 order-2',
  risk: 'min-w-0 order-3',
  product: 'min-w-0 order-4 lg:col-span-2',
  account: 'min-w-0 order-5',
  investment: 'min-w-0 order-6',
};

const subscribeNoop = () => () => {};

export function DashboardScreen({
  individuals,
  onNavigateToList,
  customerTypeRecords,
}: DashboardScreenProps) {
  const isMounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  );
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [hoveredAgeGroup, setHoveredAgeGroup] = useState<string | null>('18–24');
  const [selectedDatePreset, setSelectedDatePreset] = useState<string>('MTD');
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('2026-08-01');
  const [customEndDate, setCustomEndDate] = useState('2026-08-31');
  const slot = (card: ChartSlot) => CHART_SLOTS[card];

  // IPO subscriptions are the only money in the customer records, so they stand in for portfolio value.
  const ipo = React.useMemo(() => {
    const subs = toIpoSubscriptions(customerTypeRecords);
    const segments = segmentSummary(individuals, subs);
    const topCustomers = topIpoCustomers(subs, individuals);
    return {
      totals: ipoTotals(subs),
      topCustomers,
      topCustomersTotal: topCustomers.reduce((sum, c) => sum + c.amount, 0),
      segments,
      segmentsTotal: segments.reduce(
        (t, r) => ({ customers: t.customers + r.customers, active: t.active + r.active, ipoAmount: t.ipoAmount + r.ipoAmount }),
        { customers: 0, active: 0, ipoAmount: 0 }
      ),
      ipos: topIpos(subs),
    };
  }, [customerTypeRecords, individuals]);

  const summaryCards = [
    ...SUMMARY_CARDS,
    {
      label: 'Total IPO Subscribed',
      value: usdCompact(ipo.totals.total),
      change: ipo.totals.changePercent,
      icon: DollarSign,
      outline: 'border-blue-300/80 hover:border-blue-500 hover:shadow-blue-500/10',
      iconStyle: 'bg-blue-100 text-blue-800',
    },
  ];

  const customerName = (c: (typeof ipo.topCustomers)[number]) =>
    c.individual ? c.individual.fullNameEN ?? `${c.individual.firstName} ${c.individual.lastName}` : c.customerId;

  const handlePrint = () => {
    window.print();
  };

  const formattedDateRange = React.useMemo(() => {
    switch (selectedDatePreset) {
      case 'TODAY':
        return '31 Aug 2026';
      case '7D':
        return '24 Aug 2026 - 31 Aug 2026';
      case '30D':
        return '01 Aug 2026 - 31 Aug 2026';
      case 'MTD':
        return '01 Aug 2026 - 31 Aug 2026';
      case 'Q3_2026':
        return '01 Jul 2026 - 30 Sep 2026';
      case 'YTD':
        return '01 Jan 2026 - 31 Aug 2026';
      case 'CUSTOM':
        return `${customStartDate} - ${customEndDate}`;
      default:
        return '01 Aug 2026 - 31 Aug 2026';
    }
  }, [selectedDatePreset, customStartDate, customEndDate]);

  // Shared Date Picker Popover Panel
  const renderDatePopover = () => {
    if (!isDatePopoverOpen) return null;
    return (
      <>
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDatePopoverOpen(false)}
        />
        <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 space-y-3.5 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Select Date Period</span>
            </div>
            <button
              type="button"
              onClick={() => setIsDatePopoverOpen(false)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Presets Grid */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Quick Presets</span>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: '7D', label: 'Last 7 Days' },
                { id: '30D', label: 'Last 30 Days' },
                { id: 'MTD', label: 'This Month (Aug)' },
                { id: 'Q3_2026', label: 'Q3 2026' },
                { id: 'YTD', label: 'Year to Date' },
                { id: 'CUSTOM', label: 'Custom Range' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setSelectedDatePreset(p.id);
                    if (p.id !== 'CUSTOM') setIsDatePopoverOpen(false);
                  }}
                  className={cn(
                    'px-2.5 py-1.5 text-left text-xs rounded-lg font-semibold transition border cursor-pointer',
                    selectedDatePreset === p.id
                      ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-2xs'
                      : 'bg-slate-50 hover:bg-slate-100/80 text-slate-700 border-slate-100'
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Date Inputs */}
          {selectedDatePreset === 'CUSTOM' && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Custom Date Range</span>
              <div className="grid grid-cols-2 gap-2">
                <FormDatePicker
                  label="From"
                  size="sm"
                  value={customStartDate}
                  onChange={setCustomStartDate}
                  max={customEndDate || undefined}
                  displayFormat="dd MMM yy"
                />
                <FormDatePicker
                  label="To"
                  size="sm"
                  value={customEndDate}
                  onChange={setCustomEndDate}
                  min={customStartDate || undefined}
                  displayFormat="dd MMM yy"
                />
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-500 font-medium truncate max-w-[170px]">
              {formattedDateRange}
            </span>
            <button
              type="button"
              onClick={() => setIsDatePopoverOpen(false)}
              className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-lg shadow-2xs cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </>
    );
  };

  return (
    <div id="dashboard-screen" className="space-y-4">
      {/* =========================================================================
          DASHBOARD HEADER: FINTECH DOCK
         ========================================================================= */}
      <div
        id="dashboard-header-fintech-dock"
        className="p-5 sm:p-6 border border-blue-200/90 rounded-2xl shadow-2xs bg-[linear-gradient(90deg,var(--color-blue-50)_0%,var(--color-white)_32%)]"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-xs shadow-blue-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-semibold text-blue-950 tracking-tight leading-tight">
                Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-normal">
                Executive overview of customers, risk, IPO subscriptions and products.
              </p>
            </div>
          </div>

          {/* Filter & Actions Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Date Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDatePopoverOpen(!isDatePopoverOpen)}
                className="flex items-center gap-2 bg-white hover:bg-blue-50/50 border border-blue-200 h-9 px-3.5 rounded-xl text-xs font-medium text-blue-950 shadow-2xs hover:shadow-xs transition cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-slate-500">Date Range:</span>
                <span className="font-mono font-semibold text-blue-950 text-[11px] leading-none bg-blue-50/80 px-2 py-1 rounded border border-blue-200">
                  {formattedDateRange}
                </span>
                <ChevronDown className={cn('w-3.5 h-3.5 text-blue-600 transition-transform', isDatePopoverOpen && 'rotate-180')} />
              </button>
              {renderDatePopover()}
            </div>

            {/* Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 h-9 px-3.5 text-xs font-semibold text-blue-900 bg-white hover:bg-blue-50 border border-blue-200 rounded-xl shadow-2xs hover:shadow-xs transition cursor-pointer"
              title="Print Dashboard"
            >
              <Printer className="w-3.5 h-3.5 text-blue-700" />
              <span>Print</span>
            </button>

            {/* Vivid Ocean Blue Preview Report Button */}
            <button
              type="button"
              onClick={() => setShowPreviewModal(true)}
              className="flex items-center gap-1.5 h-9 px-4 text-xs font-semibold text-white bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 rounded-xl shadow-xs shadow-blue-500/30 transition cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Preview Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SUMMARY CARDS
         ========================================================================= */}
      <div id="dashboard-summary-cards" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {summaryCards.map(({ label, value, change, icon: Icon, outline, iconStyle }) => (
          <div
            key={label}
            className={cn(
              'p-5 bg-white border rounded-2xl shadow-2xs hover:shadow-md transition-all duration-200',
              outline
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="block text-xs font-medium text-slate-500">{label}</span>
                <span className="block text-3xl font-semibold text-slate-900 font-mono tracking-tight">{value}</span>
              </div>
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', iconStyle)}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs">
              {change === null ? (
                <span className="text-slate-400">No prior month to compare</span>
              ) : (
                <>
                  <span
                    className={cn(
                      'inline-flex items-center gap-0.5 font-mono font-semibold',
                      change > 0 ? 'text-emerald-600' : change < 0 ? 'text-red-600' : 'text-slate-500'
                    )}
                  >
                    {change > 0 && <ArrowUp className="w-3 h-3" />}
                    {change < 0 && <ArrowDown className="w-3 h-3" />}
                    {Math.abs(change).toFixed(1)}%
                  </span>
                  <span className="text-slate-400">vs last month</span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 3. ANALYTICS CHARTS: one grid; CHART_SLOTS sets each card's span and order */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-5">
        {/* Customer Growth: 2 cols x 1 row */}
        <div
          id="chart-customer-growth"
          className={cn(
            slot('growth'),
            'p-5 bg-white border border-slate-200 flex flex-col',
            'rounded-2xl bg-white/85 border-white/80 shadow-sm'
          )}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Customer Growth</h2>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
                <span className="text-slate-600">Total Customers</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-cyan-400 inline-block" />
                <span className="text-slate-600">New Customers</span>
              </div>
            </div>
          </div>

          <div className="h-[280px] w-full pt-4 overflow-hidden">
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%" debounce={CHART_RESIZE_DEBOUNCE_MS}>
                <AreaChart data={CUSTOMER_GROWTH_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="totalGrowthGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="newGrowthGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis
                    dataKey="month"
                    // "Jan 2026" → "Jan": every point is in the same year, like Product Performance's axis
                    tickFormatter={(month: string) => month.split(' ')[0]}
                    tick={{ fill: '#64748B', fontSize: 11 }}
                    axisLine={{ stroke: '#CBD5E1' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#64748B', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    domain={[0, 60]}
                  />
                  <Tooltip
                    cursor={{ stroke: '#CBD5E1', strokeWidth: 1 }}
                    content={({ active, payload, label }) =>
                      active && payload?.length ? (
                        <TooltipCard
                          title={String(label).split(' ')[0]}
                          rows={payload.map((entry) => ({
                            label: String(entry.name),
                            value: Number(entry.value),
                            color: entry.color,
                          }))}
                        />
                      ) : null
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="totalCustomers"
                    name="Total Customers"
                    stroke="#3B82F6"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#totalGrowthGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="newCustomers"
                    name="New Customers"
                    stroke="#06B6D4"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#newGrowthGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">Loading chart...</div>
            )}
          </div>
        </div>

        {/* Age Profile: 1 col x 1 row (Custom Single-Color Horizontal Bar Chart) */}
        <div
          id="chart-age-profile"
          className={cn(
            slot('age'),
            'p-5 bg-white border border-slate-200 flex flex-col justify-between',
            'rounded-2xl bg-white/85 border-white/80 shadow-sm'
          )}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Age Profile</h2>
            </div>
          </div>

          {/* Single-Color Horizontal Bar Chart */}
          <div className="pt-4 pb-2 flex-1 flex flex-col justify-center space-y-2.5">
            {AGE_PROFILE_DATA.map((item) => {
              const isHovered = hoveredAgeGroup === item.group;
              // Longest bar fills the track, less room for its label; every bar keeps a visible minimum
              const barWidth = `max(0.75rem, calc((100% - ${AGE_LABEL_ROOM}) * ${item.percentage / AGE_PROFILE_MAX}))`;

              return (
                <div
                  key={item.group}
                  tabIndex={0}
                  onMouseEnter={() => setHoveredAgeGroup(item.group)}
                  onFocus={() => setHoveredAgeGroup(item.group)}
                  className="group/row group/tip relative flex items-center gap-2.5 py-1 cursor-pointer select-none outline-none"
                >
                  <RowTooltip
                    title={`Age ${item.group}`}
                    rows={[
                      { label: 'Customers', value: item.customers, color: '#3B82F6' },
                    ]}
                  />
                  {/* Category Label */}
                  <span
                    className={cn(
                      'w-11 text-left text-xs font-mono tracking-tight shrink-0 transition-colors',
                      isHovered ? 'font-semibold text-blue-950' : 'font-semibold text-slate-600'
                    )}
                  >
                    {item.group}
                  </span>

                  {/* Vertical Axis Line */}
                  <div className="w-0.5 h-7 bg-slate-200 shrink-0" />

                  {/* Single-Color Bar Track & Fill */}
                  <div className="flex-1 flex items-center">
                    <div
                      className={cn(
                        'h-6 sm:h-7 rounded-md bg-blue-500 shadow-2xs transition-all duration-200 relative flex items-center',
                        isHovered ? 'bg-blue-600 shadow-xs scale-y-105' : 'hover:bg-blue-500/90'
                      )}
                      style={{
                        width: barWidth,
                      }}
                    />

                    {/* Percentage Label directly adjacent to bar */}
                    <span
                      className={cn(
                        'ml-3 font-mono text-xs sm:text-sm tracking-tight shrink-0 transition-colors',
                        isHovered ? 'font-semibold text-blue-950 scale-105' : 'font-semibold text-slate-700'
                      )}
                    >
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card 1: Customer Risk Profile (Semi-Circle Gauge Arc UI) */}
        <div
          id="chart-risk-profile"
          className={cn(
            slot('risk'),
            'p-5 bg-white border border-slate-200 flex flex-col justify-between',
            'rounded-2xl bg-white/85 border-white/80 shadow-sm'
          )}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Customer Risk Profile</h2>
            </div>
          </div>

          {/* Semi-Circle Gauge Arc UI matching reference */}
          <div className="pt-2 pb-2 flex-1 flex flex-col items-center justify-center min-h-[200px]">
            <div className="w-full h-[180px] relative flex items-center justify-center overflow-hidden">
              {isMounted ? (
                <ResponsiveContainer width="100%" height="100%" debounce={CHART_RESIZE_DEBOUNCE_MS}>
                  <PieChart>
                    <Pie
                      data={RISK_PROFILE_DATA}
                      cx="50%"
                      cy="82%"
                      startAngle={180}
                      endAngle={0}
                      innerRadius={65}
                      outerRadius={92}
                      paddingAngle={4}
                      dataKey="customers"
                      nameKey="category"
                    >
                      {RISK_PROFILE_DATA.map((entry) => (
                        <Cell key={`cell-risk-${entry.category}`} fill={entry.color} stroke="#FFFFFF" strokeWidth={2} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              ) : null}

              {/* Centered Stat under Arc */}
              {/* Extra bottom padding keeps the number where it sat when a caption was below it */}
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-7 pointer-events-none">
                <span className="text-3xl font-semibold text-slate-900 font-mono tracking-tight">35</span>
              </div>
            </div>
          </div>

          {/* Bottom 3-Column Legend Footer */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 text-xs px-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shrink-0" />
              <span className="text-slate-600 font-medium text-xs">Low</span>
              <span className="font-semibold text-slate-900 font-mono text-xs ml-0.5">12</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] shrink-0" />
              <span className="text-slate-600 font-medium text-xs">Medium</span>
              <span className="font-semibold text-slate-900 font-mono text-xs ml-0.5">12</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] shrink-0" />
              <span className="text-slate-600 font-medium text-xs">High</span>
              <span className="font-semibold text-slate-900 font-mono text-xs ml-0.5">11</span>
            </div>
          </div>
        </div>

        {/* Card 2: Account Status (Donut Ring, driven by ACCOUNT_STATUS_DATA) */}
        <div
          id="chart-account-status"
          className={cn(
            slot('account'),
            'p-5 bg-white border border-slate-200 flex flex-col justify-between',
            'rounded-2xl bg-white/85 border-white/80 shadow-sm'
          )}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">Account Status</h2>
          </div>

          <div className="pt-2 pb-2 flex-1 flex items-center justify-center min-h-[200px]">
            <div className="w-full max-w-[220px] h-[190px] relative flex items-center justify-center">
              <AccountStatusDonut />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                <span className="text-xs font-medium text-slate-500 tracking-tight">Accounts</span>
                <span className="text-3xl font-semibold text-slate-900 tracking-tight mt-0.5">
                  {ACCOUNT_STATUS_TOTAL}
                </span>
              </div>
            </div>
          </div>

          <AccountStatusLegend />
        </div>

        {/* Card 3: Investment Experience Overview (Horizontal Bars UI matching image) */}
        <div
          id="chart-investment-experience"
          className={cn(
            slot('investment'),
            'p-5 bg-white border border-slate-200 flex flex-col justify-between',
            'rounded-2xl bg-white/85 border-white/80 shadow-sm'
          )}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Investment Experience Overview</h2>
            </div>
          </div>

          {/* Product Experience Horizontal Progress Bars matching reference image */}
          <div className="py-2.5 flex-1 flex flex-col justify-center space-y-2.5 min-h-[200px]">
            {INVESTMENT_EXPERIENCE_DATA.map((item) => (
              <div key={item.product} className="space-y-1">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="font-medium text-slate-700">{item.product}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 font-mono">{item.count}</span>
                    <span className="text-xs text-slate-400 font-medium w-7 text-right font-mono">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
                <div className="w-full h-1.5 sm:h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Product Performance: follows the header date range */}
        <div className={slot('product')}>
          <ProductAdoptionTrendChart
            customerTypeRecords={customerTypeRecords}
            datePreset={selectedDatePreset}
            customStartDate={customStartDate}
            customEndDate={customEndDate}
            periodLabel={formattedDateRange}
            isMounted={isMounted}
          />
        </div>
      </div>

      {/* 4. PERFORMANCE TABLES (4-Column Grid, Ratio 2 : 1 : 1 — one row, equal heights; all from real records) */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
        {/* Table 1: Top Customers by IPO Subscription (2 Columns) */}
        <div
          id="table-top-customers"
          className={cn(
            'xl:col-span-2 bg-white border border-slate-200 overflow-hidden flex flex-col',
            'rounded-2xl bg-white/85 border-white/80 shadow-md'
          )}
        >
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Top Customers by IPO Subscription</h2>
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full h-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 uppercase text-[10px] font-semibold tracking-wider">
                  <th className="py-2.5 px-4">Customer</th>
                  <th className="py-2.5 px-3">Customer Type</th>
                  <th className="py-2.5 px-3 text-right">IPO Subscribed</th>
                  <th className="py-2.5 px-3 text-right">Customer Tenure</th>
                  <th className="py-2.5 px-4 text-right">MoM Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ipo.topCustomers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No IPO subscriptions yet.
                    </td>
                  </tr>
                )}
                {ipo.topCustomers.map((c) => {
                  const name = customerName(c);
                  return (
                    <tr key={c.customerId} className="hover:bg-slate-50/90 transition">
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-200 shrink-0 bg-slate-100 flex items-center justify-center text-[11px] font-semibold text-slate-500">
                            {c.individual?.avatarUrl ? (
                              <Image
                                src={c.individual.avatarUrl}
                                alt={name}
                                fill
                                sizes="32px"
                                className="object-cover"
                                referrerPolicy="no-referrer"
                                unoptimized
                              />
                            ) : (
                              name.charAt(0)
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 block">
                              {name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {c.individual?.customerId ?? c.customerId}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-2.5 px-3">
                        {c.individual ? (
                          <span
                            className={cn(
                              'px-2 py-0.5 rounded text-[10px] font-semibold border',
                              SEGMENT_BADGE[c.individual.customerType]
                            )}
                          >
                            {c.individual.customerType}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900">
                        {usd.format(c.amount)}
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-700">
                        {tenureText(c.tenureYears)}
                      </td>

                      <td className="py-2.5 px-4 text-right">
                        <MomChip change={c.changePercent} />
                      </td>
                    </tr>
                  );
                })}
                {/* Absorbs leftover card height so the Total row sits at the bottom */}
                <tr aria-hidden="true" className="h-full">
                  <td colSpan={5} className="p-0" />
                </tr>
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200 bg-slate-50/90 font-semibold text-slate-900">
                  <td className="py-2.5 px-4 font-semibold">Total</td>
                  <td className="py-2.5 px-3 text-slate-400 font-normal">—</td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-blue-700">
                    {usd.format(ipo.topCustomersTotal)}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 font-normal text-right">—</td>
                  <td className="py-2.5 px-4 text-slate-400 font-normal text-right">—</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Table 2: Customer Segment (1 Column) — by the customer's Customer Type */}
        <div
          id="table-customer-segment"
          className={cn(
            'xl:col-span-1 bg-white border border-slate-200 overflow-hidden flex flex-col',
            'rounded-2xl bg-white/85 border-white/80 shadow-md'
          )}
        >
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Customer Segment</h2>
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full h-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 uppercase text-[10px] font-semibold tracking-wider">
                  <th className="py-2.5 px-4">Customer Type</th>
                  <th className="py-2.5 px-2 text-right">Customers</th>
                  <th className="py-2.5 px-2 text-right">Active</th>
                  <th className="py-2.5 px-4 text-right">IPO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ipo.segments.map((s) => (
                  <tr key={s.segment} className="hover:bg-slate-50/70 transition">
                    <td className="py-2.5 px-4 font-semibold text-slate-900">{s.segment}</td>
                    <td className="py-2.5 px-2 text-right font-mono font-medium text-slate-700">{s.customers}</td>
                    <td className="py-2.5 px-2 text-right font-mono font-medium text-slate-700">{s.active}</td>
                    <td
                      className={cn(
                        'py-2.5 px-4 text-right font-mono',
                        s.ipoAmount > 0 ? 'font-semibold text-slate-900' : 'font-normal text-slate-400'
                      )}
                    >
                      {usd.format(s.ipoAmount)}
                    </td>
                  </tr>
                ))}
                {/* Absorbs leftover card height so the Total row sits at the bottom */}
                <tr aria-hidden="true" className="h-full">
                  <td colSpan={4} className="p-0" />
                </tr>
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200 bg-slate-50/90 font-semibold text-slate-900">
                  <td className="py-2.5 px-4 font-semibold">Total</td>
                  <td className="py-2.5 px-2 text-right font-mono font-semibold text-slate-900">
                    {ipo.segmentsTotal.customers}
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono font-semibold text-slate-900">
                    {ipo.segmentsTotal.active}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-semibold text-blue-700">
                    {usd.format(ipo.segmentsTotal.ipoAmount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Table 3: Top IPOs by Subscription (1 Column) */}
        <div
          id="table-top-ipos"
          className={cn(
            'xl:col-span-1 bg-white border border-slate-200 overflow-hidden flex flex-col',
            'rounded-2xl bg-white/85 border-white/80 shadow-md'
          )}
        >
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Top IPOs by Subscription</h2>
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full h-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 uppercase text-[10px] font-semibold tracking-wider">
                  <th className="py-2.5 px-4">IPO</th>
                  <th className="py-2.5 px-2 text-right">Subscribers</th>
                  <th className="py-2.5 px-4 text-right">Subscribed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ipo.ipos.rows.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-slate-400">
                      No IPO subscriptions yet.
                    </td>
                  </tr>
                )}
                {ipo.ipos.rows.map((row) => (
                  <tr key={row.ipoNameId} className="hover:bg-slate-50/70 transition">
                    <td className="py-2.5 px-4 font-semibold text-slate-900" title={row.ipoNameId}>
                      {row.name}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono font-medium text-slate-700">{row.subscribers}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-semibold text-slate-900">
                      {usd.format(row.subscribed)}
                    </td>
                  </tr>
                ))}
                {/* Absorbs leftover card height so the Total row sits at the bottom */}
                <tr aria-hidden="true" className="h-full">
                  <td colSpan={3} className="p-0" />
                </tr>
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200 bg-slate-50/90 font-semibold text-slate-900">
                  <td className="py-2.5 px-4 font-semibold">Total</td>
                  <td
                    className="py-2.5 px-2 text-right font-mono font-semibold text-slate-900"
                    title="Distinct customers — one customer can subscribe to several IPOs"
                  >
                    {ipo.ipos.total.subscribers}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-semibold text-blue-700">
                    {usd.format(ipo.ipos.total.subscribed)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* PREVIEW REPORT MODAL */}
      {showPreviewModal && (
        <div
          id="preview-report-modal-backdrop"
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div
            id="preview-report-modal"
            className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8"
          >
            {/* Modal Bar - Light Mode */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 text-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-sm text-slate-900">Executive Report Preview</span>
                <span className="text-xs text-slate-500 font-mono">[{formattedDateRange}]</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Dossier</span>
                </button>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Document Body */}
            <div className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto print:max-h-none">
              <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
                <div>
                  <span className="text-xs uppercase font-mono tracking-wider font-semibold text-blue-600">
                    Cambodia Securities Exchange (CSX) • Member Firm
                  </span>
                  <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mt-1">
                    Monthly Executive Performance & Customer Summary
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Official Audit Dossier • Reference Period: {formattedDateRange}
                  </p>
                </div>
                <div className="text-right font-mono text-xs text-slate-500">
                  <div>Generated: 09 Sep 2026, 08:00 AM</div>
                  <div className="font-semibold text-slate-900">Status: Verified Official</div>
                </div>
              </div>

              {/* KPI Grid in Report */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
                  <div className="text-[11px] text-slate-500 font-medium uppercase">Total Customers</div>
                  <div className="text-xl font-semibold font-mono text-slate-900 mt-1">51</div>
                  <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">↑ 18.6% vs last month</div>
                </div>
                <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
                  <div className="text-[11px] text-slate-500 font-medium uppercase">Active Accounts</div>
                  <div className="text-xl font-semibold font-mono text-slate-900 mt-1">44</div>
                  <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">↑ 22.2% vs last month</div>
                </div>
                <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
                  <div className="text-[11px] text-slate-500 font-medium uppercase">New Customers</div>
                  <div className="text-xl font-semibold font-mono text-slate-900 mt-1">8</div>
                  <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">↑ 33.3% vs last month</div>
                </div>
                <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
                  <div className="text-[11px] text-slate-500 font-medium uppercase">Total IPO Subscribed</div>
                  <div className="text-xl font-semibold font-mono text-blue-700 mt-1">{usdCompact(ipo.totals.total)}</div>
                  <div
                    className={cn(
                      'text-[10px] font-semibold mt-0.5',
                      (ipo.totals.changePercent ?? 0) > 0
                        ? 'text-emerald-600'
                        : (ipo.totals.changePercent ?? 0) < 0
                          ? 'text-red-600'
                          : 'text-slate-500'
                    )}
                  >
                    {changeText(ipo.totals.changePercent)}
                  </div>
                </div>
              </div>

              {/* Top Customers Section in Report */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                  1. Top Customers by IPO Subscription
                </h3>
                <table className="w-full text-xs border border-slate-200">
                  <thead className="bg-slate-100 text-slate-600">
                    <tr>
                      <th className="p-2 text-left">Customer</th>
                      <th className="p-2 text-left">Customer Type</th>
                      <th className="p-2 text-right">IPO Subscribed</th>
                      <th className="p-2 text-right">Customer Tenure</th>
                      <th className="p-2 text-right">MoM Change</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {ipo.topCustomers.map((c) => (
                      <tr key={c.customerId}>
                        <td className="p-2 font-semibold text-slate-900">{customerName(c)}</td>
                        <td className="p-2 text-slate-600">{c.individual?.customerType ?? '—'}</td>
                        <td className="p-2 text-right font-mono font-semibold">{usd.format(c.amount)}</td>
                        <td className="p-2 text-right font-mono text-slate-600">{tenureText(c.tenureYears)}</td>
                        <td className="p-2 text-right font-mono text-slate-600">{momText(c.changePercent)}</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50 font-semibold">
                      <td className="p-2">Total (Top {ipo.topCustomers.length})</td>
                      <td className="p-2">—</td>
                      <td className="p-2 text-right font-mono text-blue-700">{usd.format(ipo.topCustomersTotal)}</td>
                      <td className="p-2 text-right">—</td>
                      <td className="p-2 text-right">—</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Breakdown Grid in Report */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                    2. Customer Segment Performance
                  </h3>
                  <table className="w-full text-xs border border-slate-200">
                    <thead className="bg-slate-100 text-slate-600">
                      <tr>
                        <th className="p-2 text-left">Customer Type</th>
                        <th className="p-2 text-right">Customers</th>
                        <th className="p-2 text-right">Active</th>
                        <th className="p-2 text-right">IPO</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {ipo.segments.map((s) => (
                        <tr key={s.segment}>
                          <td className="p-2 font-medium">{s.segment}</td>
                          <td className="p-2 text-right font-mono">{s.customers}</td>
                          <td className="p-2 text-right font-mono">{s.active}</td>
                          <td className="p-2 text-right font-mono font-semibold">{usd.format(s.ipoAmount)}</td>
                        </tr>
                      ))}
                      <tr className="bg-slate-50 font-semibold">
                        <td className="p-2">Total</td>
                        <td className="p-2 text-right font-mono">{ipo.segmentsTotal.customers}</td>
                        <td className="p-2 text-right font-mono">{ipo.segmentsTotal.active}</td>
                        <td className="p-2 text-right font-mono text-blue-700">{usd.format(ipo.segmentsTotal.ipoAmount)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                    3. Top IPOs by Subscription
                  </h3>
                  <table className="w-full text-xs border border-slate-200">
                    <thead className="bg-slate-100 text-slate-600">
                      <tr>
                        <th className="p-2 text-left">IPO</th>
                        <th className="p-2 text-right">Subscribers</th>
                        <th className="p-2 text-right">Subscribed</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {ipo.ipos.rows.map((row) => (
                        <tr key={row.ipoNameId}>
                          <td className="p-2 font-medium">{row.name}</td>
                          <td className="p-2 text-right font-mono">{row.subscribers}</td>
                          <td className="p-2 text-right font-mono font-semibold">{usd.format(row.subscribed)}</td>
                        </tr>
                      ))}
                      <tr className="bg-slate-50 font-semibold">
                        <td className="p-2">Total</td>
                        <td className="p-2 text-right font-mono">{ipo.ipos.total.subscribers}</td>
                        <td className="p-2 text-right font-mono text-blue-700">{usd.format(ipo.ipos.total.subscribed)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Footer Sign-off */}
              <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-xs text-slate-400">
                <span>Dossier Hash: 8F7E-2026-AUG-CSX</span>
                <span>Authorized Signatory: Sok Dara (Managing Director)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
