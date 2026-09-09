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
  X
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
  { group: '18–25', customers: 4, percentage: 7.8 },
  { group: '26–35', customers: 12, percentage: 23.5 },
  { group: '36–45', customers: 15, percentage: 29.4 },
  { group: '46–55', customers: 11, percentage: 21.6 },
  { group: '56–65', customers: 6, percentage: 11.8 },
  { group: '66+', customers: 3, percentage: 5.9 },
];

const RISK_PROFILE_DATA = [
  { category: 'Low', customers: 12, percentage: 23.5, color: '#10B981' },
  { category: 'Moderate', customers: 21, percentage: 41.2, color: '#3B82F6' },
  { category: 'High', customers: 13, percentage: 25.5, color: '#F59E0B' },
  { category: 'Very High', customers: 5, percentage: 9.8, color: '#EF4444' },
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

  const handlePrint = () => {
    window.print();
  };

  const formattedDateRange = '01 Aug 2026 - 31 Aug 2026';

  return (
    <div id="dashboard-screen" className="space-y-6">
      {/* 1. DASHBOARD HEADER */}
      <div
        id="dashboard-header-container"
        className={cn(
          'p-5 sm:p-6 bg-white border border-slate-200 transition-all',
          theme === 'glassmorphism'
            ? 'rounded-3xl bg-white/85 backdrop-blur-xl border-white/80 shadow-lg shadow-blue-950/5'
            : theme === 'aurora'
            ? 'rounded-2xl border-slate-200 shadow-md ring-1 ring-blue-500/10'
            : 'rounded-xl shadow-xs'
        )}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 uppercase tracking-wider">
                Executive Overview
              </span>
              <span className="text-xs text-slate-400">Securities & Exchange Commission Compliance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
              Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Real-time executive metrics on customer growth, demographic risk profiles, portfolio valuation, and product distribution.
            </p>
          </div>

          {/* Filter & Actions Bar */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Date Range Selector */}
            <div className="flex items-center gap-2 bg-slate-50/90 border border-slate-200 px-3.5 py-2 rounded-lg text-xs">
              <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
              <div className="flex items-center gap-1.5 font-medium text-slate-700">
                <span className="text-slate-500 font-normal">Date Range:</span>
                <span className="font-semibold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 font-mono">
                  [{formattedDateRange}]
                </span>
              </div>
            </div>

            {/* Print Action */}
            <button
              id="dashboard-print-btn"
              onClick={handlePrint}
              className={cn(
                'flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition shadow-xs cursor-pointer',
                theme === 'glassmorphism' ? 'rounded-xl' : 'rounded-lg'
              )}
              title="Print executive dashboard report"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Print</span>
            </button>

            {/* Preview Report Action */}
            <button
              id="dashboard-preview-report-btn"
              onClick={() => setShowPreviewModal(true)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white transition shadow-sm cursor-pointer',
                theme === 'glassmorphism'
                  ? 'rounded-xl bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                  : theme === 'aurora'
                  ? 'rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                  : 'rounded-lg bg-blue-600 hover:bg-blue-700'
              )}
            >
              <FileText className="w-4 h-4" />
              <span>Preview Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. SUMMARY CARDS */}
      <div id="dashboard-summary-cards" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
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

        {/* Age Profile: 1 col x 1 row */}
        <div
          id="chart-age-profile"
          className={cn(
            'lg:col-span-1 p-5 bg-white border border-slate-200 flex flex-col',
            theme === 'glassmorphism'
              ? 'rounded-2xl bg-white/85 backdrop-blur-md border-white/80 shadow-sm'
              : 'rounded-xl shadow-xs'
          )}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Age Profile</h2>
              <p className="text-xs text-slate-400">Distribution by age group (Total: 51)</p>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
              6 Tiers
            </span>
          </div>

          <div className="h-[280px] w-full pt-4">
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={AGE_PROFILE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis
                    dataKey="group"
                    tick={{ fill: '#64748B', fontSize: 11 }}
                    axisLine={{ stroke: '#CBD5E1' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#64748B', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    domain={[0, 18]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      borderRadius: '8px',
                      color: '#F8FAFC',
                      border: 'none',
                      fontSize: '12px',
                    }}
                    formatter={(value: any) => [`${value} Customers`, 'Count']}
                  />
                  <Bar
                    dataKey="customers"
                    name="Customers"
                    fill="#3B82F6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">Loading chart...</div>
            )}
          </div>
        </div>
      </div>

      {/* Chart Row 2: Customer Risk Profile (1 Col) + Account Status (1 Col) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Customer Risk Profile: 1 col x 1 row */}
        <div
          id="chart-risk-profile"
          className={cn(
            'p-5 bg-white border border-slate-200 flex flex-col',
            theme === 'glassmorphism'
              ? 'rounded-2xl bg-white/85 backdrop-blur-md border-white/80 shadow-sm'
              : 'rounded-xl shadow-xs'
          )}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Customer Risk Profile</h2>
              <p className="text-xs text-slate-400">Distribution by risk category (Total: 51 • 100%)</p>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span>Risk Matrix</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center pt-4 flex-1">
            <div className="sm:col-span-6 h-[220px]">
              {isMounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={RISK_PROFILE_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="customers"
                      nameKey="category"
                    >
                      {RISK_PROFILE_DATA.map((entry) => (
                        <Cell key={`cell-risk-${entry.category}`} fill={entry.color} />
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
                        item.payload.category,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : null}
            </div>

            <div className="sm:col-span-6 space-y-2.5">
              {RISK_PROFILE_DATA.map((r) => (
                <div key={r.category} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/70">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.color }} />
                      <span className="font-semibold text-slate-800">{r.category}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900">
                      {r.customers} <span className="font-normal text-slate-500 text-[11px]">({r.percentage}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${r.percentage}%`, backgroundColor: r.color }}
                    />
                  </div>
                </div>
              ))}
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
            {/* Modal Bar */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <span className="font-bold text-sm">Executive Report Preview</span>
                <span className="text-xs text-slate-400 font-mono">[{formattedDateRange}]</span>
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
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
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
