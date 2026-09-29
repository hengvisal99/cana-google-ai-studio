'use client';

import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { 
  Users, DollarSign, Target, Award, ArrowUpRight, ArrowDownRight, 
  TrendingUp, Activity, UserCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

const formatUSD = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

const SR_DATA = [
  { name: 'Victoria Sterling', accountsOpened: 24, aum: 1250000, targetAum: 1000000, churn: 1, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { name: 'Julian Thorne', accountsOpened: 18, aum: 850000, targetAum: 1000000, churn: 2, color: 'text-blue-600', bg: 'bg-blue-50' },
  { name: 'Helena Winter', accountsOpened: 32, aum: 2100000, targetAum: 1500000, churn: 0, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { name: 'Antoine Laurent', accountsOpened: 15, aum: 620000, targetAum: 800000, churn: 1, color: 'text-amber-600', bg: 'bg-amber-50' },
  { name: 'Kenichi Sato', accountsOpened: 28, aum: 1800000, targetAum: 1500000, churn: 3, color: 'text-purple-600', bg: 'bg-purple-50' },
];

const MONTHLY_TREND = [
  { month: 'Jan', newAccounts: 12, aumGrowth: 150000 },
  { month: 'Feb', newAccounts: 15, aumGrowth: 220000 },
  { month: 'Mar', newAccounts: 18, aumGrowth: 280000 },
  { month: 'Apr', newAccounts: 22, aumGrowth: 350000 },
  { month: 'May', newAccounts: 25, aumGrowth: 410000 },
  { month: 'Jun', newAccounts: 20, aumGrowth: 320000 },
];

export function SRPerformanceScreen() {
  const totalAUM = SR_DATA.reduce((s, d) => s + d.aum, 0);
  const totalTarget = SR_DATA.reduce((s, d) => s + d.targetAum, 0);
  const totalAccounts = SR_DATA.reduce((s, d) => s + d.accountsOpened, 0);

  return (
    <div className="h-full flex flex-col space-y-6 py-2 pb-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-200">
              <Award className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">SR Performance</h1>
          </div>
          <p className="text-sm text-slate-500 ml-12">Relationship Manager KPI tracking and AUM goals.</p>
        </div>
      </div>

      {/* High-Level Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total Team AUM</p>
            <p className="text-3xl font-bold text-slate-900">{formatUSD(totalAUM)}</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(totalAUM / totalTarget) * 100}%` }} />
              </div>
              <span className="text-xs font-semibold text-slate-500">{((totalAUM / totalTarget) * 100).toFixed(1)}% of Target</span>
            </div>
          </div>
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-indigo-600" />
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total Accounts Opened</p>
            <p className="text-3xl font-bold text-slate-900">{totalAccounts}</p>
            <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-2">
              <ArrowUpRight className="w-3.5 h-3.5" /> +15% vs last quarter
            </p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
            <UserCheck className="w-6 h-6 text-emerald-600" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Avg. Churn Rate</p>
            <p className="text-3xl font-bold text-slate-900">
              {((SR_DATA.reduce((s,d)=>s+d.churn,0) / totalAccounts) * 100).toFixed(1)}%
            </p>
            <p className="text-xs font-semibold text-rose-600 flex items-center gap-1 mt-2">
              <ArrowUpRight className="w-3.5 h-3.5" /> Needs attention
            </p>
          </div>
          <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center">
            <Activity className="w-6 h-6 text-rose-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SR Leaderboard Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-500" /> Individual SR Targets
            </h2>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left text-sm border-collapse min-w-[600px]">
              <thead className="bg-slate-50/80">
                <tr>
                  <th className="px-5 py-3 font-semibold text-slate-500 border-b border-slate-200">Senior Rep</th>
                  <th className="px-5 py-3 font-semibold text-slate-500 border-b border-slate-200 text-right">Accounts</th>
                  <th className="px-5 py-3 font-semibold text-slate-500 border-b border-slate-200 text-right">Current AUM</th>
                  <th className="px-5 py-3 font-semibold text-slate-500 border-b border-slate-200">Target Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {SR_DATA.sort((a,b) => b.aum - a.aum).map((sr) => {
                  const progress = (sr.aum / sr.targetAum) * 100;
                  return (
                    <tr key={sr.name} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border", sr.bg, sr.color, sr.color.replace('text-', 'border-').replace('600', '200'))}>
                            {sr.name.split(' ').map(n=>n[0]).join('')}
                          </div>
                          <span className="font-bold text-slate-800">{sr.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right font-mono font-medium text-slate-700">{sr.accountsOpened}</td>
                      <td className="px-5 py-4 text-right font-mono font-bold text-slate-800">{formatUSD(sr.aum)}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className={cn("h-full rounded-full transition-all duration-1000", progress >= 100 ? "bg-emerald-500" : progress >= 80 ? "bg-indigo-500" : "bg-amber-500")} style={{ width: `${Math.min(progress, 100)}%` }} />
                          </div>
                          <span className={cn("text-xs font-bold w-12 text-right", progress >= 100 ? "text-emerald-600" : "text-slate-600")}>
                            {progress.toFixed(0)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Charts */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 h-[240px] flex flex-col">
            <h3 className="font-bold text-slate-800 mb-4 text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" /> AUM Growth Trend
            </h3>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={MONTHLY_TREND}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                  <RechartsTooltip 
                    cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line type="monotone" dataKey="aumGrowth" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 h-[240px] flex flex-col">
            <h3 className="font-bold text-slate-800 mb-4 text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" /> New Accounts Added
            </h3>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MONTHLY_TREND}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                  <RechartsTooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="newAccounts" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
