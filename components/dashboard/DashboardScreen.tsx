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
  { status: 'Active', customers: 44, percentage: 86.3, color: '#2563EB' },
  { status: 'Not Opened', customers: 4, percentage: 7.8, color: '#94A3B8' },
  { status: 'Closed', customers: 3, percentage: 5.9, color: '#F43F5E' },
];

const INVESTMENT_EXPERIENCE_DATA = [
  { experience: 'None', customers: 7, portfolioValue: 0.42, formattedValue: '$420K' },
  { experience: 'Beginner', customers: 14, portfolioValue: 1.85, formattedValue: '$1.85M' },
  { experience: 'Intermediate', customers: 18, portfolioValue: 4.72, formattedValue: '$4.72M' },
  { experience: 'Experienced', customers: 9, portfolioValue: 4.18, formattedValue: '$4.18M' },
  { experience: 'Expert', customers: 3, portfolioValue: 1.68, formattedValue: '$1.68M' },
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

  // Dashboard Header UI Variant State (V1: Classic, V2: Neo-Glass, V3: Fintech Dock)
  const [headerVariant, setHeaderVariant] = useState<'classic' | 'bento' | 'command'>('classic');
  // Summary Cards UI Variant State (V1: Classic Grid, V2: Neo-Vibrant, V3: Glass Accent, V4: Minimalist Stark)
  const [summaryCardVariant, setSummaryCardVariant] = useState<'classic' | 'vibrant' | 'glass' | 'stark'>('classic');
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
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-2xs cursor-pointer"
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
          0. DEDICATED LAYOUT TOGGLE BAR (OUTSIDE OF DASHBOARD CARD)
         ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1 py-0.5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-2xs">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900">Dashboard Layout Preview</span>
              <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80">
                Light Mode
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Switch between 3 ultra-modern light mode header & filter designs (classic layout)
            </p>
          </div>
        </div>

        {/* Clean Outer Segmented Switcher */}
        <div className="flex items-center bg-white p-1 rounded-xl text-xs font-semibold border border-slate-200/90 shadow-2xs shrink-0 self-start sm:self-auto">
          {[
            { id: 'classic', label: 'V1: Classic' },
            { id: 'bento', label: 'V2: Neo-Glass' },
            { id: 'command', label: 'V3: Fintech Dock' },
          ].map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setHeaderVariant(v.id as 'classic' | 'bento' | 'command')}
              className={cn(
                'py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all text-center cursor-pointer',
                headerVariant === v.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              )}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* =========================================================================
          1. DASHBOARD HEADER & FILTER SECTION (3 TOGGLEABLE ULTRA-MODERN LIGHT DESIGNS)
         ========================================================================= */}

      {/* -------------------------------------------------------------------------
          VARIANT 1: CLASSIC INLINE BAR (ROYAL BLUE & CRISP WHITE BASELINE)
         ------------------------------------------------------------------------- */}
      {headerVariant === 'classic' && (
        <div
          id="dashboard-header-container"
          className="p-5 sm:p-6 bg-white border border-slate-200 rounded-xl shadow-2xs transition-all"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  Dashboard
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
                Real-time executive metrics on customer growth, demographic risk profiles, portfolio valuation, and product distribution.
              </p>
            </div>

            {/* Filter & Actions Bar */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Date Range Selector */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDatePopoverOpen(!isDatePopoverOpen)}
                  className="flex items-center gap-2 bg-slate-50/90 hover:bg-slate-100 border border-slate-200 px-3.5 py-2 rounded-lg text-xs transition cursor-pointer shadow-2xs"
                >
                  <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                  <div className="flex items-center gap-1.5 font-medium text-slate-700">
                    <span className="text-slate-500 font-normal">Date Range:</span>
                    <span className="font-semibold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 font-mono text-[11px]">
                      [{formattedDateRange}]
                    </span>
                  </div>
                  <ChevronDown className={cn('w-3.5 h-3.5 text-slate-400 transition-transform', isDatePopoverOpen && 'rotate-180')} />
                </button>
                {renderDatePopover()}
              </div>

              {/* Print Action */}
              <button
                id="dashboard-print-btn"
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition shadow-xs cursor-pointer"
                title="Print executive dashboard report"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span>Print</span>
              </button>

              {/* Preview Report Action */}
              <button
                id="dashboard-preview-report-btn"
                onClick={() => setShowPreviewModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>Preview Report</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------------
          VARIANT 2: NEO-GLASS HORIZON (ELECTRIC AZURE & CYAN GLASS LIGHT ARCHITECTURE)
         ------------------------------------------------------------------------- */}
      {headerVariant === 'bento' && (
        <div
          id="dashboard-header-neo-glass"
          className="p-5 sm:p-6 bg-gradient-to-r from-sky-50/80 via-blue-50/60 to-indigo-50/50 border border-blue-200/80 rounded-2xl shadow-sm relative overflow-hidden backdrop-blur-md"
        >
          {/* Top glowing electric azure horizon hairline accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600" />

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-blue-600 ring-4 ring-blue-200 animate-pulse" />
                <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-950 tracking-tight">
                  Dashboard
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-blue-900/70 mt-1 max-w-2xl font-normal leading-relaxed">
                Real-time executive metrics on customer growth, demographic risk profiles, portfolio valuation, and product distribution.
              </p>
            </div>

            {/* Filter & Actions Bar */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Floating Frosted Azure Date Pill */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDatePopoverOpen(!isDatePopoverOpen)}
                  className="flex items-center gap-2.5 bg-white/95 hover:bg-white border border-blue-200/90 hover:border-blue-400 px-3.5 py-2 rounded-xl text-xs transition-all shadow-2xs hover:shadow-xs cursor-pointer group"
                >
                  <div className="w-6 h-6 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex items-center gap-1.5 font-medium text-slate-700">
                    <span className="text-slate-500">Date Range:</span>
                    <span className="font-mono font-bold text-blue-950 bg-blue-50/90 px-2 py-0.5 rounded-md border border-blue-200/80 text-[11px]">
                      {formattedDateRange}
                    </span>
                  </div>
                  <ChevronDown className={cn('w-3.5 h-3.5 text-blue-400 group-hover:text-blue-600 transition-transform', isDatePopoverOpen && 'rotate-180')} />
                </button>
                {renderDatePopover()}
              </div>

              {/* Frosted Azure Print Button */}
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-blue-900 bg-white/90 hover:bg-white border border-blue-200 hover:border-blue-300 rounded-xl shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                title="Print Report"
              >
                <Printer className="w-4 h-4 text-blue-600" />
                <span>Print</span>
              </button>

              {/* Radiant Azure-to-Cobalt Gradient Preview Button */}
              <button
                type="button"
                onClick={() => setShowPreviewModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:opacity-95 rounded-xl shadow-sm shadow-blue-500/25 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Preview Report</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------------
          VARIANT 3: FINTECH DOCK (OCEAN BLUE & ICE-BLUE SCULPTED CONTROL BAR)
         ------------------------------------------------------------------------- */}
      {headerVariant === 'command' && (
        <div
          id="dashboard-header-fintech-dock"
          className="p-5 sm:p-6 bg-gradient-to-br from-blue-50/70 via-sky-50/40 to-slate-50 border border-blue-200/80 rounded-3xl shadow-sm"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shadow-blue-600/30">
                  <Layers className="w-4 h-4" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-950 tracking-tight">
                  Dashboard
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-blue-900/70 mt-1.5 max-w-2xl font-normal leading-relaxed">
                Real-time executive metrics on customer growth, demographic risk profiles, portfolio valuation, and product distribution.
              </p>
            </div>

            {/* Filter & Actions Bar (Clean without enclosing wrapper card) */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Date Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDatePopoverOpen(!isDatePopoverOpen)}
                  className="flex items-center gap-2 bg-white hover:bg-blue-50/50 border border-blue-200 px-3.5 py-2 rounded-xl text-xs font-medium text-blue-950 shadow-2xs hover:shadow-xs transition cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-slate-500">Date Range:</span>
                  <span className="font-mono font-bold text-blue-950 text-[11px] bg-blue-50/80 px-2 py-0.5 rounded border border-blue-200">
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
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-blue-900 bg-white hover:bg-blue-50 border border-blue-200 rounded-xl shadow-2xs hover:shadow-xs transition cursor-pointer"
                title="Print Dashboard"
              >
                <Printer className="w-3.5 h-3.5 text-blue-700" />
                <span>Print</span>
              </button>

              {/* Vivid Ocean Blue Preview Report Button */}
              <button
                type="button"
                onClick={() => setShowPreviewModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 rounded-xl shadow-xs shadow-blue-600/30 transition cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Preview Report</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          2. DEDICATED SUMMARY CARDS LAYOUT SWITCHER (OUTSIDE OF SUMMARY CARDS)
         ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1 pt-1">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs">
            <LayoutGrid className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900">Summary Cards Layout Preview</span>
              <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                Light Mode
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Switch between 4 ultra-modern metric card architectures & visual representations
            </p>
          </div>
        </div>

        {/* Outer Segmented Switcher for Summary Cards */}
        <div className="flex items-center bg-white p-1 rounded-xl text-xs font-semibold border border-slate-200/90 shadow-2xs shrink-0 self-start sm:self-auto">
          {[
            { id: 'classic', label: 'V1: Classic Grid' },
            { id: 'vibrant', label: 'V2: Neo-Vibrant' },
            { id: 'glass', label: 'V3: Glass Accent' },
            { id: 'stark', label: 'V4: Minimalist Stark' },
          ].map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setSummaryCardVariant(v.id as 'classic' | 'vibrant' | 'glass' | 'stark')}
              className={cn(
                'py-1.5 px-3 rounded-lg text-xs font-bold transition-all text-center cursor-pointer',
                summaryCardVariant === v.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              )}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* =========================================================================
          SUMMARY CARDS: 4 DISTINCT ULTRA-MODERN LIGHT MODE LAYOUTS (EXACT INFO)
         ========================================================================= */}

      {/* -------------------------------------------------------------------------
          VARIANT 1: CLASSIC 4-GRID CARDS (ORIGINAL BASELINE REFERENCE)
         ------------------------------------------------------------------------- */}
      {summaryCardVariant === 'classic' && (
        <div id="dashboard-summary-cards-classic" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Customers */}
          <div
            id="summary-card-total-customers"
            className={cn(
              'p-5 bg-white border border-slate-200 transition-all hover:border-blue-300',
              theme === 'glassmorphism'
                ? 'rounded-2xl bg-white/85 backdrop-blur-md border-white/80 shadow-sm hover:shadow-md'
                : 'rounded-xl shadow-xs'
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Customers</span>
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">51</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-emerald-600">
              <span className="flex items-center gap-0.5 bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-mono">
                ↑ 18.6%
              </span>
              <span className="text-slate-400 font-normal">vs last month</span>
            </div>
          </div>

          {/* Card 2: Active Accounts */}
          <div
            id="summary-card-active-accounts"
            className={cn(
              'p-5 bg-white border border-slate-200 transition-all hover:border-blue-300',
              theme === 'glassmorphism'
                ? 'rounded-2xl bg-white/85 backdrop-blur-md border-white/80 shadow-sm hover:shadow-md'
                : 'rounded-xl shadow-xs'
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Accounts</span>
              <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">44</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-emerald-600">
              <span className="flex items-center gap-0.5 bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-mono">
                ↑ 22.2%
              </span>
              <span className="text-slate-400 font-normal">vs last month</span>
            </div>
          </div>

          {/* Card 3: New Customers */}
          <div
            id="summary-card-new-customers"
            className={cn(
              'p-5 bg-white border border-slate-200 transition-all hover:border-blue-300',
              theme === 'glassmorphism'
                ? 'rounded-2xl bg-white/85 backdrop-blur-md border-white/80 shadow-sm hover:shadow-md'
                : 'rounded-xl shadow-xs'
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">New Customers</span>
              <div className="w-9 h-9 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-700">
                <UserPlus className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">8</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-emerald-600">
              <span className="flex items-center gap-0.5 bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-mono">
                ↑ 33.3%
              </span>
              <span className="text-slate-400 font-normal">vs last month</span>
            </div>
          </div>

          {/* Card 4: Total Portfolio Value */}
          <div
            id="summary-card-portfolio-value"
            className={cn(
              'p-5 bg-white border border-slate-200 transition-all hover:border-blue-300',
              theme === 'glassmorphism'
                ? 'rounded-2xl bg-white/85 backdrop-blur-md border-white/80 shadow-sm hover:shadow-md'
                : 'rounded-xl shadow-xs'
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Portfolio Value</span>
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-700">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">$12.85M</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-emerald-600">
              <span className="flex items-center gap-0.5 bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-mono">
                ↑ 14.8%
              </span>
              <span className="text-slate-400 font-normal">vs last month</span>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------------
          VARIANT 2: NEO-VIBRANT GRID (ULTRA-MODERN COLOR TINTS & SQUIRCLE ICONS)
         ------------------------------------------------------------------------- */}
      {summaryCardVariant === 'vibrant' && (
        <div id="dashboard-summary-cards-vibrant" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Vibrant Card 1: Total Customers */}
          <div className="p-5 bg-gradient-to-b from-blue-50/60 via-white to-white border border-blue-200/90 hover:border-blue-400 rounded-2xl shadow-xs hover:shadow-md hover:shadow-blue-500/10 transition-all duration-200 space-y-3 group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Total Customers</span>
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shadow-blue-500/40 group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div>
              <span className="text-3xl font-black text-slate-900 font-mono tracking-tight">51</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2 py-0.5 rounded-full font-mono font-bold">
                <ArrowUp className="w-3 h-3" />
                18.6%
              </span>
              <span className="text-slate-400 font-normal">vs last month</span>
            </div>
          </div>

          {/* Vibrant Card 2: Active Accounts */}
          <div className="p-5 bg-gradient-to-b from-sky-50/60 via-white to-white border border-sky-200/90 hover:border-sky-400 rounded-2xl shadow-xs hover:shadow-md hover:shadow-sky-500/10 transition-all duration-200 space-y-3 group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Active Accounts</span>
              <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-xs shadow-sky-500/40 group-hover:scale-105 transition-transform">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>
            <div>
              <span className="text-3xl font-black text-slate-900 font-mono tracking-tight">44</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2 py-0.5 rounded-full font-mono font-bold">
                <ArrowUp className="w-3 h-3" />
                22.2%
              </span>
              <span className="text-slate-400 font-normal">vs last month</span>
            </div>
          </div>

          {/* Vibrant Card 3: New Customers */}
          <div className="p-5 bg-gradient-to-b from-cyan-50/60 via-white to-white border border-cyan-200/90 hover:border-cyan-400 rounded-2xl shadow-xs hover:shadow-md hover:shadow-cyan-500/10 transition-all duration-200 space-y-3 group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">New Customers</span>
              <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center shadow-xs shadow-cyan-500/40 group-hover:scale-105 transition-transform">
                <UserPlus className="w-5 h-5" />
              </div>
            </div>
            <div>
              <span className="text-3xl font-black text-slate-900 font-mono tracking-tight">8</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2 py-0.5 rounded-full font-mono font-bold">
                <ArrowUp className="w-3 h-3" />
                33.3%
              </span>
              <span className="text-slate-400 font-normal">vs last month</span>
            </div>
          </div>

          {/* Vibrant Card 4: Total Portfolio Value */}
          <div className="p-5 bg-gradient-to-b from-blue-100/40 via-white to-white border border-blue-300/80 hover:border-blue-500 rounded-2xl shadow-xs hover:shadow-md hover:shadow-blue-600/10 transition-all duration-200 space-y-3 group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Total Portfolio Value</span>
              <div className="w-10 h-10 rounded-xl bg-blue-800 text-white flex items-center justify-center shadow-xs shadow-blue-800/40 group-hover:scale-105 transition-transform">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div>
              <span className="text-3xl font-black text-slate-900 font-mono tracking-tight">$12.85M</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2 py-0.5 rounded-full font-mono font-bold">
                <ArrowUp className="w-3 h-3" />
                14.8%
              </span>
              <span className="text-slate-400 font-normal">vs last month</span>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------------
          VARIANT 3: GLASS ACCENT (HORIZON GRADIENT ACCENT & DUAL-RING ICONS)
         ------------------------------------------------------------------------- */}
      {summaryCardVariant === 'glass' && (
        <div id="dashboard-summary-cards-glass" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Glass Card 1 */}
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs hover:shadow-sm transition-all overflow-hidden flex flex-col justify-between group">
            <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500 w-full" />
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400">Total Customers</span>
                <div className="w-9 h-9 rounded-xl bg-blue-50 ring-4 ring-blue-50/50 flex items-center justify-center text-blue-600">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className="text-3xl font-black text-slate-900 font-mono tracking-tight">51</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold pt-1 border-t border-slate-100">
                <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                  ↑ 18.6%
                </span>
                <span className="text-slate-400 text-[11px] font-normal">vs last month</span>
              </div>
            </div>
          </div>

          {/* Glass Card 2 */}
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs hover:shadow-sm transition-all overflow-hidden flex flex-col justify-between group">
            <div className="h-1 bg-gradient-to-r from-sky-500 to-blue-600 w-full" />
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400">Active Accounts</span>
                <div className="w-9 h-9 rounded-xl bg-sky-50 ring-4 ring-sky-50/50 flex items-center justify-center text-sky-600">
                  <UserCheck className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className="text-3xl font-black text-slate-900 font-mono tracking-tight">44</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold pt-1 border-t border-slate-100">
                <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                  ↑ 22.2%
                </span>
                <span className="text-slate-400 text-[11px] font-normal">vs last month</span>
              </div>
            </div>
          </div>

          {/* Glass Card 3 */}
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs hover:shadow-sm transition-all overflow-hidden flex flex-col justify-between group">
            <div className="h-1 bg-gradient-to-r from-cyan-500 to-blue-500 w-full" />
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400">New Customers</span>
                <div className="w-9 h-9 rounded-xl bg-cyan-50 ring-4 ring-cyan-50/50 flex items-center justify-center text-cyan-700">
                  <UserPlus className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className="text-3xl font-black text-slate-900 font-mono tracking-tight">8</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold pt-1 border-t border-slate-100">
                <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                  ↑ 33.3%
                </span>
                <span className="text-slate-400 text-[11px] font-normal">vs last month</span>
              </div>
            </div>
          </div>

          {/* Glass Card 4 */}
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs hover:shadow-sm transition-all overflow-hidden flex flex-col justify-between group">
            <div className="h-1 bg-gradient-to-r from-blue-600 to-indigo-700 w-full" />
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400">Total Portfolio Value</span>
                <div className="w-9 h-9 rounded-xl bg-blue-50 ring-4 ring-blue-50/50 flex items-center justify-center text-blue-800">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className="text-3xl font-black text-slate-900 font-mono tracking-tight">$12.85M</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold pt-1 border-t border-slate-100">
                <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                  ↑ 14.8%
                </span>
                <span className="text-slate-400 text-[11px] font-normal">vs last month</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------------
          VARIANT 4: MINIMALIST STARK (HIGH-CONTRAST MONOCHROME & ACCENT BARS)
         ------------------------------------------------------------------------- */}
      {summaryCardVariant === 'stark' && (
        <div id="dashboard-summary-cards-stark" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Stark Card 1 */}
          <div className="p-5 bg-white border-2 border-slate-200/90 hover:border-slate-800 rounded-xl transition-all duration-150 flex items-stretch gap-3.5">
            <div className="w-1.5 rounded-full bg-blue-600 shrink-0 self-stretch my-0.5" />
            <div className="flex-1 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Total Customers</span>
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <span className="text-3xl font-black text-slate-900 tracking-tighter font-mono">51</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  ↑ 18.6%
                </span>
                <span className="text-slate-500 font-medium text-[11px]">vs last month</span>
              </div>
            </div>
          </div>

          {/* Stark Card 2 */}
          <div className="p-5 bg-white border-2 border-slate-200/90 hover:border-slate-800 rounded-xl transition-all duration-150 flex items-stretch gap-3.5">
            <div className="w-1.5 rounded-full bg-sky-600 shrink-0 self-stretch my-0.5" />
            <div className="flex-1 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Active Accounts</span>
                <UserCheck className="w-4 h-4 text-sky-600" />
              </div>
              <div>
                <span className="text-3xl font-black text-slate-900 tracking-tighter font-mono">44</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  ↑ 22.2%
                </span>
                <span className="text-slate-500 font-medium text-[11px]">vs last month</span>
              </div>
            </div>
          </div>

          {/* Stark Card 3 */}
          <div className="p-5 bg-white border-2 border-slate-200/90 hover:border-slate-800 rounded-xl transition-all duration-150 flex items-stretch gap-3.5">
            <div className="w-1.5 rounded-full bg-cyan-600 shrink-0 self-stretch my-0.5" />
            <div className="flex-1 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">New Customers</span>
                <UserPlus className="w-4 h-4 text-cyan-600" />
              </div>
              <div>
                <span className="text-3xl font-black text-slate-900 tracking-tighter font-mono">8</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  ↑ 33.3%
                </span>
                <span className="text-slate-500 font-medium text-[11px]">vs last month</span>
              </div>
            </div>
          </div>

          {/* Stark Card 4 */}
          <div className="p-5 bg-white border-2 border-slate-200/90 hover:border-slate-800 rounded-xl transition-all duration-150 flex items-stretch gap-3.5">
            <div className="w-1.5 rounded-full bg-blue-800 shrink-0 self-stretch my-0.5" />
            <div className="flex-1 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Total Portfolio Value</span>
                <DollarSign className="w-4 h-4 text-blue-800" />
              </div>
              <div>
                <span className="text-3xl font-black text-slate-900 tracking-tighter font-mono">$12.85M</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  ↑ 14.8%
                </span>
                <span className="text-slate-500 font-medium text-[11px]">vs last month</span>
              </div>
            </div>
          </div>
        </div>
      )}

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
                <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" />
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
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
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
                    stroke="#2563EB"
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
                        'h-6 sm:h-7 rounded-md bg-blue-600 shadow-2xs transition-all duration-200 relative flex items-center',
                        isHovered ? 'bg-blue-700 shadow-xs scale-y-105' : 'hover:bg-blue-600/90'
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

      {/* Chart Row 2: Customer Risk Profile (1 Col) + Account Status (1 Col) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Customer Risk Profile: 1 col x 1 row (Semi-Circle Gauge Arc UI) */}
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
              <p className="text-xs text-slate-400">Distribution by risk category (Total: 35 • 100%)</p>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono">
              3 Tiers
            </span>
          </div>

          {/* Semi-Circle Gauge Arc UI matching reference */}
          <div className="pt-2 pb-2 flex-1 flex flex-col items-center justify-center">
            <div className="w-full h-[180px] sm:h-[190px] relative flex items-center justify-center">
              {isMounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={RISK_PROFILE_DATA}
                      cx="50%"
                      cy="82%"
                      startAngle={180}
                      endAngle={0}
                      innerRadius={68}
                      outerRadius={98}
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
                <span className="text-3xl sm:text-4xl font-black text-slate-900 font-mono tracking-tight">35</span>
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
                  INDIVIDUAL ACCOUNTS
                </span>
              </div>
            </div>
          </div>

          {/* Bottom 3-Column Legend Footer matching uploaded reference */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm px-2">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shrink-0" />
              <span className="text-slate-600 font-medium text-xs sm:text-sm">Low</span>
              <span className="font-bold text-slate-900 font-mono text-xs sm:text-sm ml-0.5">12</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] shrink-0" />
              <span className="text-slate-600 font-medium text-xs sm:text-sm">Medium</span>
              <span className="font-bold text-slate-900 font-mono text-xs sm:text-sm ml-0.5">12</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] shrink-0" />
              <span className="text-slate-600 font-medium text-xs sm:text-sm">High</span>
              <span className="font-bold text-slate-900 font-mono text-xs sm:text-sm ml-0.5">11</span>
            </div>
          </div>
        </div>

        {/* Account Status: 1 col x 1 row (Donut Chart) */}
        <div
          id="chart-account-status"
          className={cn(
            'p-5 bg-white border border-slate-200 flex flex-col',
            theme === 'glassmorphism'
              ? 'rounded-2xl bg-white/85 backdrop-blur-md border-white/80 shadow-sm'
              : 'rounded-xl shadow-xs'
          )}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Account Status</h2>
              <p className="text-xs text-slate-400">Customer account status distribution (Total: 51)</p>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
              86.3% Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center pt-4 flex-1">
            <div className="sm:col-span-6 h-[220px] relative">
              {isMounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ACCOUNT_STATUS_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="customers"
                      nameKey="status"
                    >
                      {ACCOUNT_STATUS_DATA.map((entry) => (
                        <Cell key={`cell-status-${entry.status}`} fill={entry.color} />
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
                        `${val} Customers (${item.payload.percentage}%)`,
                        item.payload.status,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : null}
              {/* Centered Donut Stat */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-extrabold text-slate-900 font-mono">51</span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total</span>
              </div>
            </div>

            <div className="sm:col-span-6 space-y-3">
              {ACCOUNT_STATUS_DATA.map((item) => (
                <div key={item.status} className="p-3 rounded-lg border border-slate-100 bg-slate-50/70 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <div>
                      <span className="font-semibold text-xs text-slate-900 block">{item.status}</span>
                      <span className="text-[11px] text-slate-500">{item.percentage}% of database</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-sm text-slate-900 font-mono">{item.customers}</span>
                    <span className="text-[10px] text-slate-400 block">accounts</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Chart Row 3: Investment Experience Overview (2 columns x 1 row) */}
      <div
        id="chart-investment-experience"
        className={cn(
          'p-5 bg-white border border-slate-200 flex flex-col',
          theme === 'glassmorphism'
            ? 'rounded-2xl bg-white/85 backdrop-blur-md border-white/80 shadow-sm'
            : 'rounded-xl shadow-xs'
        )}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">Investment Experience Overview</h2>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                Mixed Chart
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Correlation between customer investment experience level and total portfolio value (Total: 51 Customers • $12.85M)
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-blue-600 inline-block" />
              <span className="text-slate-600">Customers (Count)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-emerald-500 inline-block" />
              <span className="w-2 h-2 rounded-full bg-emerald-500 -ml-2 inline-block" />
              <span className="text-slate-600">Portfolio Value ($M)</span>
            </div>
          </div>
        </div>

        <div className="h-[300px] w-full pt-4">
          {isMounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={INVESTMENT_EXPERIENCE_DATA}
                margin={{ top: 15, right: 20, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="experience"
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  axisLine={{ stroke: '#CBD5E1' }}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 22]}
                  label={{ value: 'Customers', angle: -90, position: 'insideLeft', fill: '#94A3B8', fontSize: 10 }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: '#10B981', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 6]}
                  unit="M"
                  label={{ value: 'Portfolio ($M)', angle: 90, position: 'insideRight', fill: '#10B981', fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    borderRadius: '8px',
                    color: '#F8FAFC',
                    border: 'none',
                    fontSize: '12px',
                  }}
                  formatter={(value: any, name: any) => {
                    if (name === 'Portfolio Value') return [`$${value}M`, name];
                    return [`${value} Customers`, name];
                  }}
                />
                <Bar
                  yAxisId="left"
                  dataKey="customers"
                  name="Customers"
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                  barSize={42}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="portfolioValue"
                  name="Portfolio Value"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#10B981', strokeWidth: 2, stroke: '#FFFFFF' }}
                  activeDot={{ r: 7 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">Loading chart...</div>
          )}
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
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">Top Customers by Portfolio Value</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                  Primary Leaderboard
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Top 5 capital allocators by aggregate asset balance</p>
            </div>
            <button
              onClick={onNavigateToList}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition cursor-pointer"
            >
              <span>View All</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
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
            <Users className="w-4 h-4 text-slate-400" />
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
            <Layers className="w-4 h-4 text-slate-400" />
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
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition cursor-pointer"
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
