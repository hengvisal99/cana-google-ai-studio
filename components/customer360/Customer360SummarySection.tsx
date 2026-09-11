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
import { DesignTheme } from '@/types';

interface Customer360SummarySectionProps {
  kpis: Customer360SummaryKPI;
  theme?: DesignTheme;
  customerName?: string;
  className?: string;
}

export function Customer360SummarySection({
  kpis,
  className,
}: Customer360SummarySectionProps) {
  // Exact data from user's image with dynamic fallback
  const portfolioValue = kpis?.portfolioValue?.formatted || '$1,404,807';
  const tradingValue = kpis?.tradingValue?.formatted || '$44,287';
  const totalTradesCount = kpis?.totalTrading?.count ?? 4;
  const iposHeldCount = kpis?.iposHeld?.count ?? 4;
  const dateRange = kpis?.tradingValue?.dateRange || 'Jan–Sep 2026';
  const subscriptions = kpis?.iposHeld?.subscriptionFormatted || '120 subscriptions';

  return (
    <section 
      id="c360-summary-kpi-section" 
      aria-label="Summary KPIs" 
      className={cn('space-y-3', className)}
    >
      {/* Section Title Header */}
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
          <TrendingUp className="w-4 h-4" />
        </div>
        <h3 className="text-sm font-bold text-slate-900">Summary Overview</h3>
      </div>

      {/* =======================================================================
          ULTRA GLASS SUMMARY CARDS
         ======================================================================= */}
      <div 
        id="summary-cards-ultra-glass-view" 
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
      >
        {/* Glass Card 1: Portfolio Value */}
        <div className="relative p-5 rounded-2xl bg-white/90 backdrop-blur-xl border border-blue-100/80 shadow-md shadow-blue-950/5 flex flex-col justify-between hover:border-blue-300 hover:shadow-lg transition-all min-h-[128px] overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-400/10 rounded-full blur-xl pointer-events-none group-hover:bg-blue-400/20 transition-all" />
          <div className="relative z-10 flex items-start justify-between">
            <span className="text-sm font-medium text-slate-500">Portfolio Value</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/60 text-blue-600 flex items-center justify-center shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="relative z-10 my-1.5">
            <div className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight">
              {portfolioValue}
            </div>
          </div>
          <div className="relative z-10 flex items-center gap-1 text-sm font-semibold text-emerald-500">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span>0.1%</span>
            <span className="text-slate-400 font-normal text-xs ml-0.5">MoM</span>
          </div>
        </div>

        {/* Glass Card 2: Trading Value */}
        <div className="relative p-5 rounded-2xl bg-white/90 backdrop-blur-xl border border-emerald-100/80 shadow-md shadow-emerald-950/5 flex flex-col justify-between hover:border-emerald-300 hover:shadow-lg transition-all min-h-[128px] overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-400/10 rounded-full blur-xl pointer-events-none group-hover:bg-emerald-400/20 transition-all" />
          <div className="relative z-10 flex items-start justify-between">
            <span className="text-sm font-medium text-slate-500">Trading Value</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/60 text-emerald-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="relative z-10 my-1.5">
            <div className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight">
              {tradingValue}
            </div>
          </div>
          <div className="relative z-10 text-sm text-slate-400 font-normal">
            {dateRange}
          </div>
        </div>

        {/* Glass Card 3: Total Trading */}
        <div className="relative p-5 rounded-2xl bg-white/90 backdrop-blur-xl border border-amber-100/80 shadow-md shadow-amber-950/5 flex flex-col justify-between hover:border-amber-300 hover:shadow-lg transition-all min-h-[128px] overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/10 rounded-full blur-xl pointer-events-none group-hover:bg-amber-400/20 transition-all" />
          <div className="relative z-10 flex items-start justify-between">
            <span className="text-sm font-medium text-slate-500">Total Trading</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 text-amber-600 flex items-center justify-center shrink-0">
              <CandlestickChart className="w-5 h-5" />
            </div>
          </div>
          <div className="relative z-10 my-1.5">
            <div className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight flex items-baseline gap-1.5">
              <span>{totalTradesCount}</span>
              <span className="text-sm font-normal text-slate-400">Trades</span>
            </div>
          </div>
          <div className="relative z-10 text-sm text-slate-400 font-normal">
            {dateRange}
          </div>
        </div>

        {/* Glass Card 4: IPOs Held */}
        <div className="relative p-5 rounded-2xl bg-white/90 backdrop-blur-xl border border-purple-100/80 shadow-md shadow-purple-950/5 flex flex-col justify-between hover:border-purple-300 hover:shadow-lg transition-all min-h-[128px] overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-400/10 rounded-full blur-xl pointer-events-none group-hover:bg-purple-400/20 transition-all" />
          <div className="relative z-10 flex items-start justify-between">
            <span className="text-sm font-medium text-slate-500">IPOs Held</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200/60 text-purple-600 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="relative z-10 my-1.5">
            <div className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight flex items-baseline gap-1.5">
              <span>{iposHeldCount}</span>
              <span className="text-sm font-normal text-slate-400">IPOs</span>
            </div>
          </div>
          <div className="relative z-10 text-sm text-slate-400 font-normal">
            {subscriptions}
          </div>
        </div>
      </div>
    </section>
  );
}
