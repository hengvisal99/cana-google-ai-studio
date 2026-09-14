'use client';

import React, { useState, useSyncExternalStore } from 'react';
import Image from 'next/image';
import { Individual, DesignTheme } from '@/types';
import {
  Users,
  DollarSign,
  UserCheck,
  UserPlus,
  Printer,
  FileText,
  Calendar,
  ArrowUpRight,
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
  Target,
  Zap,
  BarChart3
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
import { cn } from '@/lib/utils';

interface DashboardScreenProps {
  individuals: Individual[];
  onNavigateToInsert: () => void;
  onNavigateToList: () => void;
  onNavigateToCustomer360: (individual?: Individual) => void;
  onViewIndividual: (individual: Individual) => void;
  onNavigateToUpdate: (individual: Individual) => void;
  theme: DesignTheme;
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

const AGE_PROFILE_DATA = [
  { group: '18–24', customers: 12, percentage: 24 },
  { group: '25–34', customers: 18, percentage: 36 },
  { group: '35–44', customers: 12, percentage: 24 },
  { group: '45–54', customers: 6, percentage: 12 },
  { group: '55+', customers: 3, percentage: 4 },
];

const RISK_PROFILE_DATA = [
  { category: 'Low', customers: 12, percentage: 34.3, color: '#10B981' },
  { category: 'Medium', customers: 12, percentage: 34.3, color: '#F59E0B' },
  { category: 'High', customers: 11, percentage: 31.4, color: '#EF4444' },
];

const ACCOUNT_STATUS_DATA = [
  { status: 'Active', customers: 44, percentage: 86.3, color: '#00B074' },
  { status: 'Not Opened', customers: 4, percentage: 7.8, color: '#EB5757' },
  { status: 'Closed', customers: 3, percentage: 5.9, color: '#EF4444' },
];

const INVESTMENT_EXPERIENCE_DATA = [
  { product: 'Stock', count: 22, percentage: 43, color: '#3B82F6' },
  { product: 'Bond', count: 15, percentage: 29, color: '#EA580C' },
  { product: 'Treasury Bill', count: 14, percentage: 27, color: '#0D9488' },
  { product: 'Other Securities', count: 7, percentage: 14, color: '#8B5CF6' },
  { product: 'Nothing', count: 7, percentage: 14, color: '#64748B' },
];

const TOP_CUSTOMERS_DATA = [
  {
    name: 'Sok Dara',
    type: 'VIP',
    typeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    portfolioValue: '$2,850,000',
    tenure: '8.4 Years',
    momChange: '+12.5%',
    cid: 'CID-000001',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Chan Sophea',
    type: 'Corporate',
    typeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    portfolioValue: '$1,920,000',
    tenure: '6.7 Years',
    momChange: '+8.2%',
    cid: 'CID-000002',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Ly Chanthy',
    type: 'Premium',
    typeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    portfolioValue: '$1,580,000',
    tenure: '5.3 Years',
    momChange: '+15.7%',
    cid: 'CID-000003',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Kim Sopheak',
    type: 'Individual',
    typeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    portfolioValue: '$1,240,000',
    tenure: '4.8 Years',
    momChange: '+6.4%',
    cid: 'CID-000004',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Heng Visal',
    type: 'Individual',
    typeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    portfolioValue: '$980,000',
    tenure: '3.9 Years',
    momChange: '+10.1%',
    cid: 'CID-000005',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  },
];

const CUSTOMER_SEGMENT_DATA = [
  { type: 'Individual', customers: 28, activeAccounts: 24, portfolioValue: '$4.35M' },
  { type: 'Premium', customers: 10, activeAccounts: 9, portfolioValue: '$2.48M' },
  { type: 'VIP', customers: 7, activeAccounts: 7, portfolioValue: '$3.92M' },
  { type: 'Corporate', customers: 6, activeAccounts: 4, portfolioValue: '$2.10M' },
];

const PRODUCT_PERFORMANCE_DATA = [
  { product: 'CSX Screen', customers: 32, active: 29, portfolioValue: '$6.25M' },
  { product: 'Client Card', customers: 27, active: 24, portfolioValue: '$4.18M' },
  { product: 'Employee Trading', customers: 14, active: 12, portfolioValue: '$1.72M' },
  { product: 'VIP Customer', customers: 7, active: 7, portfolioValue: '$3.92M' },
];

const SUMMARY_CARDS = [
  {
    label: 'Total Customers',
    value: '51',
    change: '18.6%',
    icon: Users,
    outline: 'border-blue-200/90 hover:border-blue-400 hover:shadow-blue-500/10',
    iconStyle: 'bg-blue-50 text-blue-600',
  },
  {
    label: 'Active Accounts',
    value: '44',
    change: '22.2%',
    icon: UserCheck,
    outline: 'border-sky-200/90 hover:border-sky-400 hover:shadow-sky-500/10',
    iconStyle: 'bg-sky-50 text-sky-600',
  },
  {
    label: 'New Customers',
    value: '8',
    change: '33.3%',
    icon: UserPlus,
    outline: 'border-cyan-200/90 hover:border-cyan-400 hover:shadow-cyan-500/10',
    iconStyle: 'bg-cyan-50 text-cyan-600',
  },
  {
    label: 'Total Portfolio Value',
    value: '$12.85M',
    change: '14.8%',
    icon: DollarSign,
    outline: 'border-blue-300/80 hover:border-blue-500 hover:shadow-blue-500/10',
    iconStyle: 'bg-blue-100 text-blue-800',
  },
];

const subscribeNoop = () => () => {};

export function DashboardScreen({
  individuals,
  onNavigateToList,
  onNavigateToCustomer360,
  theme,
}: DashboardScreenProps) {
  const isMounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  );
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  // Design preview: compare header styles (remove once a style is chosen)
  const [headerVariant, setHeaderVariant] = useState<'classic' | 'gradient'>('classic');

  const [hoveredAgeGroup, setHoveredAgeGroup] = useState<string | null>('18–24');
  const [selectedDatePreset, setSelectedDatePreset] = useState<string>('MTD');
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('2026-08-01');
  const [customEndDate, setCustomEndDate] = useState('2026-08-31');

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
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
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
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Quick Presets</span>
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
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Custom Date Range</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 font-medium block mb-1">From</label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full text-xs p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-medium block mb-1">To</label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full text-xs p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
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
              className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-lg shadow-2xs cursor-pointer"
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
      {/* Header style toggle (design preview) */}
      <div className="fixed bottom-5 right-5 z-50 flex items-center gap-1 p-1 bg-white border border-blue-200 rounded-xl shadow-md print:hidden">
        {(['classic', 'gradient'] as const).map((variant) => (
          <button
            key={variant}
            type="button"
            onClick={() => setHeaderVariant(variant)}
            className={cn(
              'h-8 px-3 rounded-lg text-xs font-semibold capitalize transition cursor-pointer',
              headerVariant === variant
                ? 'bg-blue-500 text-white shadow-xs shadow-blue-500/30'
                : 'text-blue-900 hover:bg-blue-50'
            )}
          >
            {variant}
          </button>
        ))}
      </div>

      {/* =========================================================================
          DASHBOARD HEADER: FINTECH DOCK
         ========================================================================= */}
      <div
        id="dashboard-header-fintech-dock"
        className={cn(
          'p-5 sm:p-6 border border-blue-200/90 rounded-2xl shadow-2xs',
          headerVariant === 'gradient'
            ? 'bg-[linear-gradient(90deg,var(--color-blue-50)_0%,var(--color-white)_32%)]'
            : 'bg-white'
        )}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-xs shadow-blue-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-extrabold text-blue-950 tracking-tight leading-tight">
                Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-normal">
                Executive overview of customers, risk, portfolio and products.
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
                <span className="font-mono font-bold text-blue-950 text-[11px] leading-none bg-blue-50/80 px-2 py-1 rounded border border-blue-200">
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
              className="flex items-center gap-1.5 h-9 px-4 text-xs font-bold text-white bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 rounded-xl shadow-xs shadow-blue-500/30 transition cursor-pointer"
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
      <div id="dashboard-summary-cards" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {SUMMARY_CARDS.map(({ label, value, change, icon: Icon, outline, iconStyle }) => (
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
                <span className="block text-3xl font-bold text-slate-900 font-mono tracking-tight">{value}</span>
              </div>
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', iconStyle)}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs">
              <span className="inline-flex items-center gap-0.5 text-emerald-600 font-mono font-bold">
                <ArrowUp className="w-3 h-3" />
                {change}
              </span>
              <span className="text-slate-400">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* 3. ANALYTICS CHARTS */}
      {/* Chart Row 1: Customer Growth (2 Cols) + Age Profile (1 Col) in 3-col grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Customer Growth: 2 cols x 1 row */}
        <div
          id="chart-customer-growth"
          className={cn(
            'lg:col-span-2 p-5 bg-white border border-slate-200 flex flex-col',
            theme === 'glassmorphism'
              ? 'rounded-2xl bg-white/85 backdrop-blur-md border-white/80 shadow-sm'
              : 'rounded-xl shadow-xs'
          )}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Customer Growth</h2>
              <p className="text-xs text-slate-400">Total vs New Customer trajectory over time (Jan – Aug 2026)</p>
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

          <div className="h-[280px] w-full pt-4">
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
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
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      borderRadius: '8px',
                      color: '#F8FAFC',
                      border: 'none',
                      fontSize: '12px',
                    }}
                    itemStyle={{ color: '#F8FAFC' }}
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
            'lg:col-span-1 p-5 bg-white border border-slate-200 flex flex-col justify-between',
            theme === 'glassmorphism'
              ? 'rounded-2xl bg-white/85 backdrop-blur-md border-white/80 shadow-sm'
              : 'rounded-xl shadow-xs'
          )}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Age Profile</h2>
              <p className="text-xs text-slate-400">Distribution by age group (Total: 51 • 100%)</p>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono">
              5 Tiers
            </span>
          </div>

          {/* Single-Color Horizontal Bar Chart */}
          <div className="pt-4 pb-2 flex-1 flex flex-col justify-center space-y-2.5">
            {AGE_PROFILE_DATA.map((item) => {
              const isHovered = hoveredAgeGroup === item.group;
              const barWidthPercent = Math.max((item.percentage / 45) * 80, 8);

              return (
                <div
                  key={item.group}
                  onMouseEnter={() => setHoveredAgeGroup(item.group)}
                  className={cn(
                    'group/row flex items-center gap-2.5 py-1 px-1.5 rounded-lg transition-colors cursor-pointer select-none',
                    isHovered ? 'bg-blue-50/70 shadow-2xs' : 'hover:bg-slate-50'
                  )}
                  title={`${item.group}: ${item.customers} Customers (${item.percentage}%)`}
                >
                  {/* Category Label */}
                  <span
                    className={cn(
                      'w-12 text-right text-xs font-mono tracking-tight shrink-0 transition-colors',
                      isHovered ? 'font-bold text-blue-950' : 'font-semibold text-slate-600'
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
                        width: `${barWidthPercent}%`,
                      }}
                    />

                    {/* Percentage Label directly adjacent to bar */}
                    <span
                      className={cn(
                        'ml-3 font-mono text-xs sm:text-sm tracking-tight shrink-0 transition-colors',
                        isHovered ? 'font-black text-blue-950 scale-105' : 'font-bold text-slate-700'
                      )}
                    >
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Highlight Info Strip */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400 text-[11px]">
              Active: <span className="font-bold text-blue-700 font-mono">{hoveredAgeGroup || '18–24'}</span>
            </span>
            <span className="font-mono text-slate-600 font-medium text-[11px]">
              {AGE_PROFILE_DATA.find((a) => a.group === (hoveredAgeGroup || '18–24'))?.customers || 12} Customers (
              {AGE_PROFILE_DATA.find((a) => a.group === (hoveredAgeGroup || '18–24'))?.percentage || 24}%)
            </span>
          </div>
        </div>
      </div>

      {/* Chart Row 2: Customer Risk Profile, Account Status, and Investment Experience Overview (All in the same row) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Card 1: Customer Risk Profile (Semi-Circle Gauge Arc UI) */}
        <div
          id="chart-risk-profile"
          className={cn(
            'p-5 bg-white border border-slate-200 flex flex-col justify-between',
            theme === 'glassmorphism'
              ? 'rounded-2xl bg-white/85 backdrop-blur-md border-white/80 shadow-sm'
              : 'rounded-xl shadow-xs'
          )}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Customer Risk Profile</h2>
              <p className="text-xs text-slate-400">Distribution by risk category (Total: 35)</p>
            </div>
          </div>

          {/* Semi-Circle Gauge Arc UI matching reference */}
          <div className="pt-2 pb-2 flex-1 flex flex-col items-center justify-center min-h-[200px]">
            <div className="w-full h-[180px] relative flex items-center justify-center">
              {isMounted ? (
                <ResponsiveContainer width="100%" height="100%">
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
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1E293B',
                        borderRadius: '8px',
                        color: '#F8FAFC',
                        border: 'none',
                        fontSize: '12px',
                      }}
                      formatter={(val: any, name: any, item: any) => [
                        `${val} Accounts (${item.payload.percentage}%)`,
                        item.payload.category,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : null}

              {/* Centered Stat under Arc */}
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-3 pointer-events-none">
                <span className="text-3xl font-black text-slate-900 font-mono tracking-tight">35</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
                  INDIVIDUAL ACCOUNTS
                </span>
              </div>
            </div>
          </div>

          {/* Bottom 3-Column Legend Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs px-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shrink-0" />
              <span className="text-slate-600 font-medium text-xs">Low</span>
              <span className="font-bold text-slate-900 font-mono text-xs ml-0.5">12</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] shrink-0" />
              <span className="text-slate-600 font-medium text-xs">Medium</span>
              <span className="font-bold text-slate-900 font-mono text-xs ml-0.5">12</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] shrink-0" />
              <span className="text-slate-600 font-medium text-xs">High</span>
              <span className="font-bold text-slate-900 font-mono text-xs ml-0.5">11</span>
            </div>
          </div>
        </div>

        {/* Card 2: Account Status (Donut Ring Chart with Rounded Caps matching UI) */}
        <div
          id="chart-account-status"
          className={cn(
            'p-5 bg-white border border-slate-200 flex flex-col justify-between',
            theme === 'glassmorphism'
              ? 'rounded-2xl bg-white/85 backdrop-blur-md border-white/80 shadow-sm'
              : 'rounded-xl shadow-xs'
          )}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Account Status</h2>
              <p className="text-xs text-slate-400">Account status distribution (Total: 51)</p>
            </div>
          </div>

          {/* Donut Chart Area Matching Image */}
          <div className="pt-2 pb-2 flex-1 flex flex-col items-center justify-center min-h-[200px]">
            <div className="w-full max-w-[220px] h-[190px] relative flex items-center justify-center">
              <svg viewBox="0 0 180 180" className="w-full h-full max-w-[180px] max-h-[180px] overflow-visible">
                {/* Active Accounts Arc (Lush Green with Rounded Caps) */}
                <path
                  d="M 105.72 26.93 A 65 65 0 1 1 29.73 114.35"
                  fill="none"
                  stroke="#00B074"
                  strokeWidth="15"
                  strokeLinecap="round"
                  className="transition-all duration-300 hover:opacity-90 hover:stroke-[16.5] cursor-pointer"
                >
                  <title>Active Accounts: 44 (86.3%)</title>
                </path>

                {/* Inactive / Closed Arc (Coral Red with Rounded Caps) */}
                <path
                  d="M 46.51 41.70 A 65 65 0 0 1 74.28 26.93"
                  fill="none"
                  stroke="#EB5757"
                  strokeWidth="15"
                  strokeLinecap="round"
                  className="transition-all duration-300 hover:opacity-90 hover:stroke-[16.5] cursor-pointer"
                >
                  <title>Inactive / Closed Accounts: 7 (13.7%)</title>
                </path>
              </svg>

              {/* Centered Ring Text matching image */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                <span className="text-xs sm:text-sm font-medium text-[#5A6A85] tracking-tight">Accounts</span>
                <span className="text-2xl sm:text-3xl font-bold text-[#1E293B] tracking-tight mt-0.5 font-sans">51</span>
              </div>
            </div>
          </div>

          {/* Bottom Status Breakdown */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs px-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00B074] shrink-0" />
              <span className="text-slate-600 font-medium text-xs">Active</span>
              <span className="font-bold text-slate-900 font-mono text-xs ml-0.5">44</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EB5757] shrink-0" />
              <span className="text-slate-600 font-medium text-xs">Not Opened</span>
              <span className="font-bold text-slate-900 font-mono text-xs ml-0.5">4</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] shrink-0" />
              <span className="text-slate-600 font-medium text-xs">Closed</span>
              <span className="font-bold text-slate-900 font-mono text-xs ml-0.5">3</span>
            </div>
          </div>
        </div>

        {/* Card 3: Investment Experience Overview (Horizontal Bars UI matching image) */}
        <div
          id="chart-investment-experience"
          className={cn(
            'p-5 bg-white border border-slate-200 flex flex-col justify-between',
            theme === 'glassmorphism'
              ? 'rounded-2xl bg-white/85 backdrop-blur-md border-white/80 shadow-sm'
              : 'rounded-xl shadow-xs'
          )}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Investment Experience Overview</h2>
              <p className="text-xs text-slate-400">Share of customers holding each product experience</p>
            </div>
          </div>

          {/* Product Experience Horizontal Progress Bars matching reference image */}
          <div className="py-2.5 flex-1 flex flex-col justify-center space-y-2.5 min-h-[200px]">
            {INVESTMENT_EXPERIENCE_DATA.map((item) => (
              <div key={item.product} className="space-y-1">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="font-medium text-slate-700">{item.product}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 font-mono">{item.count}</span>
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

          {/* Bottom Summary Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs px-1">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium text-xs">Total Product Records</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 font-mono text-xs">65</span>
              <span className="text-slate-400 text-[11px]">(51 Active Profiles)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. PERFORMANCE TABLES (4-Column Grid, Ratio 2 : 1 : 1) */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-5 items-start">
        {/* Table 1: Top Customers by Portfolio Value (2 Columns x 2 Rows) */}
        <div
          id="table-top-customers"
          className={cn(
            'xl:col-span-2 xl:row-span-2 bg-white border border-slate-200 overflow-hidden flex flex-col',
            theme === 'glassmorphism'
              ? 'rounded-2xl bg-white/85 backdrop-blur-md border-white/80 shadow-md'
              : 'rounded-xl shadow-xs'
          )}
        >
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Top Customers by Portfolio Value</h2>
              <p className="text-xs text-slate-400 mt-0.5">Top 5 capital allocators by aggregate asset balance</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-3">Customer Type</th>
                  <th className="py-3 px-3 text-right">Portfolio Value</th>
                  <th className="py-3 px-3 text-right">Customer Tenure</th>
                  <th className="py-3 px-4 text-right">MoM Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {TOP_CUSTOMERS_DATA.map((c) => (
                  <tr
                    key={c.name}
                    className="hover:bg-slate-50/90 transition group cursor-pointer"
                    onClick={() => {
                      const matched = individuals.find(
                        (i) =>
                          `${i.firstName} ${i.lastName}` === c.name ||
                          i.lastName === c.name ||
                          i.firstName === c.name
                      );
                      if (matched) {
                        onNavigateToCustomer360(matched);
                      } else {
                        onNavigateToCustomer360();
                      }
                    }}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-200 shrink-0">
                          <Image
                            src={c.avatar}
                            alt={c.name}
                            fill
                            sizes="32px"
                            className="object-cover"
                            referrerPolicy="no-referrer"
                            unoptimized
                          />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 group-hover:text-blue-600 transition block">
                            {c.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{c.cid}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className={cn('px-2 py-0.5 rounded text-[10px] font-semibold border', c.typeColor)}>
                        {c.type}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      {c.portfolioValue}
                    </td>

                    <td className="py-3 px-3 text-right text-slate-600 font-medium font-mono">
                      {c.tenure}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center gap-0.5 font-bold font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded text-[11px]">
                        <ArrowUpRight className="w-3 h-3" />
                        {c.momChange}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200 bg-slate-50/90 font-bold text-slate-900">
                  <td className="py-3 px-4 font-bold">Total</td>
                  <td className="py-3 px-3 text-slate-400 font-normal">—</td>
                  <td className="py-3 px-3 text-right font-mono font-extrabold text-blue-700 text-sm">
                    $8,570,000
                  </td>
                  <td className="py-3 px-3 text-slate-400 text-right">—</td>
                  <td className="py-3 px-4 text-slate-400 text-right">—</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Table 2: Customer Segment Performance (1 Column x 1 Row, flex-col) */}
        <div
          id="table-customer-segment"
          className={cn(
            'xl:col-span-1 xl:row-span-1 bg-white border border-slate-200 overflow-hidden flex flex-col',
            theme === 'glassmorphism'
              ? 'rounded-2xl bg-white/85 backdrop-blur-md border-white/80 shadow-md'
              : 'rounded-xl shadow-xs'
          )}
        >
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Customer Segment</h2>
              <p className="text-[11px] text-slate-400">Classification distribution</p>
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                  <th className="py-2.5 px-3">Customer Type</th>
                  <th className="py-2.5 px-2 text-right">Customers</th>
                  <th className="py-2.5 px-2 text-right">Active</th>
                  <th className="py-2.5 px-3 text-right">Portfolio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {CUSTOMER_SEGMENT_DATA.map((s) => (
                  <tr key={s.type} className="hover:bg-slate-50/70 transition">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {s.type}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono font-medium text-slate-700">
                      {s.customers}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono font-medium text-slate-700">
                      {s.activeAccounts}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      {s.portfolioValue}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200 bg-slate-50/90 font-bold text-slate-900">
                  <td className="py-2.5 px-3 font-bold">Total</td>
                  <td className="py-2.5 px-2 text-right font-mono font-extrabold text-slate-900">
                    51
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono font-extrabold text-slate-900">
                    44
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-extrabold text-blue-700">
                    $12.85M
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Table 3: Product Performance (1 Column x 1 Row, flex-col) */}
        <div
          id="table-product-performance"
          className={cn(
            'xl:col-span-1 xl:row-span-1 bg-white border border-slate-200 overflow-hidden flex flex-col',
            theme === 'glassmorphism'
              ? 'rounded-2xl bg-white/85 backdrop-blur-md border-white/80 shadow-md'
              : 'rounded-xl shadow-xs'
          )}
        >
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Product Performance</h2>
              <p className="text-[11px] text-slate-400">CSX securities product uptake</p>
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-2 text-right">Customers</th>
                  <th className="py-2.5 px-2 text-right">Active</th>
                  <th className="py-2.5 px-3 text-right">Portfolio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {PRODUCT_PERFORMANCE_DATA.map((p) => (
                  <tr key={p.product} className="hover:bg-slate-50/70 transition">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {p.product}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono font-medium text-slate-700">
                      {p.customers}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono font-medium text-slate-700">
                      {p.active}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      {p.portfolioValue}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200 bg-slate-50/90 font-bold text-slate-900">
                  <td className="py-2.5 px-3 font-bold">Total</td>
                  <td className="py-2.5 px-2 text-right font-mono font-extrabold text-slate-900">
                    80
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono font-extrabold text-slate-900">
                    72
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-extrabold text-blue-700">
                    $16.07M
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="p-2.5 bg-slate-50/80 border-t border-slate-100 text-[10px] text-slate-400 italic">
            * Product totals exceed 51 because customers can hold multiple active products concurrently.
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
                <span className="font-bold text-sm text-slate-900">Executive Report Preview</span>
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
                  <span className="text-xs uppercase font-mono tracking-wider font-bold text-blue-600">
                    Cambodia Securities Exchange (CSX) • Member Firm
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                    Monthly Executive Performance & Customer Summary
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Official Audit Dossier • Reference Period: {formattedDateRange}
                  </p>
                </div>
                <div className="text-right font-mono text-xs text-slate-500">
                  <div>Generated: 09 Sep 2026, 08:00 AM</div>
                  <div className="font-bold text-slate-900">Status: Verified Official</div>
                </div>
              </div>

              {/* KPI Grid in Report */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
                  <div className="text-[11px] text-slate-500 font-medium uppercase">Total Customers</div>
                  <div className="text-xl font-bold font-mono text-slate-900 mt-1">51</div>
                  <div className="text-[10px] text-emerald-600 font-bold mt-0.5">↑ 18.6% vs last month</div>
                </div>
                <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
                  <div className="text-[11px] text-slate-500 font-medium uppercase">Active Accounts</div>
                  <div className="text-xl font-bold font-mono text-slate-900 mt-1">44</div>
                  <div className="text-[10px] text-emerald-600 font-bold mt-0.5">↑ 22.2% vs last month</div>
                </div>
                <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
                  <div className="text-[11px] text-slate-500 font-medium uppercase">New Customers</div>
                  <div className="text-xl font-bold font-mono text-slate-900 mt-1">8</div>
                  <div className="text-[10px] text-emerald-600 font-bold mt-0.5">↑ 33.3% vs last month</div>
                </div>
                <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
                  <div className="text-[11px] text-slate-500 font-medium uppercase">Total Portfolio</div>
                  <div className="text-xl font-bold font-mono text-blue-700 mt-1">$12.85M</div>
                  <div className="text-[10px] text-emerald-600 font-bold mt-0.5">↑ 14.8% vs last month</div>
                </div>
              </div>

              {/* Top Customers Section in Report */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  1. Top Customers by Portfolio Value
                </h3>
                <table className="w-full text-xs border border-slate-200">
                  <thead className="bg-slate-100 text-slate-600">
                    <tr>
                      <th className="p-2 text-left">Customer</th>
                      <th className="p-2 text-left">Customer Type</th>
                      <th className="p-2 text-right">Portfolio Value</th>
                      <th className="p-2 text-right">Customer Tenure</th>
                      <th className="p-2 text-right">MoM Change</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {TOP_CUSTOMERS_DATA.map((c) => (
                      <tr key={c.name}>
                        <td className="p-2 font-semibold text-slate-900">{c.name}</td>
                        <td className="p-2 text-slate-600">{c.type}</td>
                        <td className="p-2 text-right font-mono font-bold">{c.portfolioValue}</td>
                        <td className="p-2 text-right font-mono text-slate-600">{c.tenure}</td>
                        <td className="p-2 text-right font-mono text-emerald-600 font-bold">{c.momChange}</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50 font-bold">
                      <td className="p-2">Total (Top 5)</td>
                      <td className="p-2">—</td>
                      <td className="p-2 text-right font-mono text-blue-700">$8,570,000</td>
                      <td className="p-2 text-right">—</td>
                      <td className="p-2 text-right">—</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Breakdown Grid in Report */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    2. Customer Segment Performance
                  </h3>
                  <table className="w-full text-xs border border-slate-200">
                    <thead className="bg-slate-100 text-slate-600">
                      <tr>
                        <th className="p-2 text-left">Segment</th>
                        <th className="p-2 text-right">Customers</th>
                        <th className="p-2 text-right">Active</th>
                        <th className="p-2 text-right">Portfolio</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {CUSTOMER_SEGMENT_DATA.map((s) => (
                        <tr key={s.type}>
                          <td className="p-2 font-medium">{s.type}</td>
                          <td className="p-2 text-right font-mono">{s.customers}</td>
                          <td className="p-2 text-right font-mono">{s.activeAccounts}</td>
                          <td className="p-2 text-right font-mono font-bold">{s.portfolioValue}</td>
                        </tr>
                      ))}
                      <tr className="bg-slate-50 font-bold">
                        <td className="p-2">Total</td>
                        <td className="p-2 text-right font-mono">51</td>
                        <td className="p-2 text-right font-mono">44</td>
                        <td className="p-2 text-right font-mono text-blue-700">$12.85M</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    3. Product Performance
                  </h3>
                  <table className="w-full text-xs border border-slate-200">
                    <thead className="bg-slate-100 text-slate-600">
                      <tr>
                        <th className="p-2 text-left">Product</th>
                        <th className="p-2 text-right">Customers</th>
                        <th className="p-2 text-right">Active</th>
                        <th className="p-2 text-right">Portfolio</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {PRODUCT_PERFORMANCE_DATA.map((p) => (
                        <tr key={p.product}>
                          <td className="p-2 font-medium">{p.product}</td>
                          <td className="p-2 text-right font-mono">{p.customers}</td>
                          <td className="p-2 text-right font-mono">{p.active}</td>
                          <td className="p-2 text-right font-mono font-bold">{p.portfolioValue}</td>
                        </tr>
                      ))}
                      <tr className="bg-slate-50 font-bold">
                        <td className="p-2">Total</td>
                        <td className="p-2 text-right font-mono">80</td>
                        <td className="p-2 text-right font-mono">72</td>
                        <td className="p-2 text-right font-mono text-blue-700">$16.07M</td>
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
