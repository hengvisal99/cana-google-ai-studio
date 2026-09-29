'use client';

import React from 'react';
import { 
  TrendingUp, 
  Wallet, 
  CandlestickChart, 
  Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Customer360SummaryKPI } from '@/lib/customer360Service';

interface Customer360SummarySectionProps {
  kpis: Customer360SummaryKPI;
  customerName?: string;
  className?: string;
}

export function Customer360SummarySection({
  kpis,
  className,
}: Customer360SummarySectionProps) {
  // Exact data from user's image with dynamic fallback
  const portfolioValue = kpis?.portfolioValue?.formatted || '$1,404,807';
  const totalTradesCount = kpis?.totalTrading?.count ?? 4;
  const iposHeldCount = kpis?.iposHeld?.count ?? 4;
  const dateRange = kpis?.tradingValue?.dateRange || 'Jan–Sep 2026';
  const topIpoName = kpis?.topIpoSubscription?.ipoName || 'MJQE - Mengly J. Quach Education';
  const topIpoAmount = kpis?.topIpoSubscription?.formatted || '$10,500';
  const subscriptions = kpis?.iposHeld?.subscriptionFormatted || '120 subscriptions';

  return (
    <section 
      id="c360-summary-kpi-section" 
      aria-label="Summary KPIs" 
      className={cn('space-y-3', className)}
    >
      {/* =======================================================================
          ULTRA GLASS SUMMARY CARDS
         ======================================================================= */}
      <div 
        id="summary-cards-ultra-glass-view" 
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
      >
        {/* Glass Card 1: Total IPO */}
        <div className="relative p-5 rounded-2xl bg-gradient-to-br from-white/95 to-white/70 backdrop-blur-2xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col gap-2 hover:border-blue-200 hover:shadow-blue-900/5 hover:-translate-y-0.5 transition-all overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-400/20 to-transparent rounded-full blur-2xl pointer-events-none group-hover:scale-110 transition-transform duration-500" />
          <div className="relative z-10 flex items-start justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total IPO</span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20 flex items-center justify-center shrink-0">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="relative z-10 mt-2">
            <div className="text-[26px] sm:text-3xl font-black text-slate-900 tracking-tighter">
              {portfolioValue}
            </div>
          </div>
          <div className="relative z-10 flex items-center gap-1.5 text-sm font-semibold text-emerald-600 bg-emerald-50 w-fit px-2 py-0.5 rounded-full mt-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>0.1%</span>
            <span className="text-emerald-700/70 font-medium text-[10px] ml-0.5 uppercase tracking-wide">MoM</span>
          </div>
        </div>

        {/* Glass Card 2: Top IPO Subscription */}
        <div className="relative p-5 rounded-2xl bg-gradient-to-br from-white/95 to-white/70 backdrop-blur-2xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col gap-2 hover:border-emerald-200 hover:shadow-emerald-900/5 hover:-translate-y-0.5 transition-all overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-400/20 to-transparent rounded-full blur-2xl pointer-events-none group-hover:scale-110 transition-transform duration-500" />
          <div className="relative z-10 flex items-start justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Top Subscription</span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-md shadow-emerald-500/20 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="relative z-10 mt-2">
            <div className="text-[26px] sm:text-3xl font-black text-slate-900 tracking-tighter">
              {topIpoAmount}
            </div>
          </div>
          <div className="relative z-10 text-xs text-slate-600 font-medium truncate mt-1 bg-slate-100/80 w-fit px-2.5 py-1 rounded-lg" title={topIpoName}>
            {topIpoName}
          </div>
        </div>

        {/* Glass Card 3: Total Trading */}
        <div className="relative p-5 rounded-2xl bg-gradient-to-br from-white/95 to-white/70 backdrop-blur-2xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col gap-2 hover:border-amber-200 hover:shadow-amber-900/5 hover:-translate-y-0.5 transition-all overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-400/20 to-transparent rounded-full blur-2xl pointer-events-none group-hover:scale-110 transition-transform duration-500" />
          <div className="relative z-10 flex items-start justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Trading</span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md shadow-amber-500/20 flex items-center justify-center shrink-0">
              <CandlestickChart className="w-4 h-4" />
            </div>
          </div>
          <div className="relative z-10 mt-2">
            <div className="text-[26px] sm:text-3xl font-black text-slate-900 tracking-tighter flex items-baseline gap-1.5">
              <span>{totalTradesCount}</span>
              <span className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Trades</span>
            </div>
          </div>
          <div className="relative z-10 text-xs text-slate-500 font-medium mt-1 uppercase tracking-wider">
            {dateRange}
          </div>
        </div>

        {/* Glass Card 4: IPOs Held */}
        <div className="relative p-5 rounded-2xl bg-gradient-to-br from-white/95 to-white/70 backdrop-blur-2xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col gap-2 hover:border-purple-200 hover:shadow-purple-900/5 hover:-translate-y-0.5 transition-all overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-400/20 to-transparent rounded-full blur-2xl pointer-events-none group-hover:scale-110 transition-transform duration-500" />
          <div className="relative z-10 flex items-start justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">IPOs Held</span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-md shadow-purple-500/20 flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="relative z-10 mt-2">
            <div className="text-[26px] sm:text-3xl font-black text-slate-900 tracking-tighter flex items-baseline gap-1.5">
              <span>{iposHeldCount}</span>
              <span className="text-sm font-semibold text-slate-400 uppercase tracking-wide">IPOs</span>
            </div>
          </div>
          <div className="relative z-10 text-xs text-slate-500 font-medium mt-1">
            {subscriptions}
          </div>
        </div>
      </div>
    </section>
  );
}
