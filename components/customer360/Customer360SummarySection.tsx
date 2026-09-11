'use client';

import React, { useState } from 'react';
import { 
  TrendingUp, 
  Wallet, 
  CandlestickChart, 
  Layers, 
  Sparkles,
  Activity,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Customer360SummaryKPI } from '@/lib/customer360Service';
import { DesignTheme } from '@/types';

export type SummaryLayoutVariant = 'reference-image' | 'ultra-glass' | 'horizon-precision' | 'quantum-neo';

interface Customer360SummarySectionProps {
  kpis: Customer360SummaryKPI;
  theme: DesignTheme;
  customerName?: string;
  className?: string;
}

export function Customer360SummarySection({
  kpis,
  theme,
  customerName,
  className,
}: Customer360SummarySectionProps) {
  // Default to 'reference-image' matching the user's exact uploaded image
  const [layoutVariant, setLayoutVariant] = useState<SummaryLayoutVariant>('reference-image');

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
      {/* =======================================================================
          LAYOUT VARIANT SELECTOR PILL (Light Mode Only)
         ======================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
            <TrendingUp className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Summary Overview</h3>
        </div>

        {/* Sleek Pill Toggle Button */}
        <div 
          id="summary-layout-toggle-pill"
          className="inline-flex items-center p-1 rounded-full bg-slate-100 border border-slate-200/80 shadow-2xs text-xs self-start sm:self-auto"
          role="group"
          aria-label="Summary Card Style Variations"
        >
          {/* 1. Exact Reference */}
          <button
            type="button"
            id="btn-style-reference"
            onClick={() => setLayoutVariant('reference-image')}
            className={cn(
              'px-3 py-1 font-bold rounded-full transition-all text-xs cursor-pointer flex items-center gap-1.5',
              layoutVariant === 'reference-image'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            )}
            title="Exact Reference Layout from Image"
          >
            <span>Reference</span>
          </button>

          {/* 2. Ultra Glass */}
          <button
            type="button"
            id="btn-style-glass"
            onClick={() => setLayoutVariant('ultra-glass')}
            className={cn(
              'px-3 py-1 font-bold rounded-full transition-all text-xs cursor-pointer flex items-center gap-1.5',
              layoutVariant === 'ultra-glass'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            )}
            title="Ultra Modern: Cyber Glass (Same Info)"
          >
            <Sparkles className="w-3 h-3 text-blue-600" />
            <span>Ultra Glass</span>
          </button>

          {/* 3. Horizon Precision */}
          <button
            type="button"
            id="btn-style-horizon"
            onClick={() => setLayoutVariant('horizon-precision')}
            className={cn(
              'px-3 py-1 font-bold rounded-full transition-all text-xs cursor-pointer flex items-center gap-1.5',
              layoutVariant === 'horizon-precision'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            )}
            title="Ultra Modern: Horizon Precision (Same Info)"
          >
            <Activity className="w-3 h-3 text-emerald-600" />
            <span>Horizon Precision</span>
          </button>

          {/* 4. Quantum Neo */}
          <button
            type="button"
            id="btn-style-quantum"
            onClick={() => setLayoutVariant('quantum-neo')}
            className={cn(
              'px-3 py-1 font-bold rounded-full transition-all text-xs cursor-pointer flex items-center gap-1.5',
              layoutVariant === 'quantum-neo'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            )}
            title="Ultra Modern: Quantum Neo (Same Info)"
          >
            <Zap className="w-3 h-3 text-indigo-600" />
            <span>Quantum Neo</span>
          </button>
        </div>
      </div>

      {/* =======================================================================
          1. EXACT REFERENCE UI (Identical to the User-Provided Image)
         ======================================================================= */}
      {layoutVariant === 'reference-image' && (
        <div 
          id="summary-cards-reference-view" 
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 animate-in fade-in duration-200"
        >
          {/* Card 1: Portfolio Value */}
          <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-xs flex flex-col justify-between hover:shadow-sm transition-all min-h-[128px]">
            <div className="flex items-start justify-between">
              <span className="text-sm font-normal text-slate-500">Portfolio Value</span>
              <div className="w-10 h-10 rounded-xl bg-blue-100/80 text-blue-500 flex items-center justify-center shrink-0">
                <Wallet className="w-5 h-5 text-blue-500" />
              </div>
            </div>
            <div className="my-1.5">
              <div className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight">
                {portfolioValue}
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm font-semibold text-emerald-500">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span>0.1%</span>
              <span className="text-slate-400 font-normal text-xs ml-0.5">MoM</span>
            </div>
          </div>

          {/* Card 2: Trading Value */}
          <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-xs flex flex-col justify-between hover:shadow-sm transition-all min-h-[128px]">
            <div className="flex items-start justify-between">
              <span className="text-sm font-normal text-slate-500">Trading Value</span>
              <div className="w-10 h-10 rounded-xl bg-emerald-100/80 text-emerald-500 flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
            <div className="my-1.5">
              <div className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight">
                {tradingValue}
              </div>
            </div>
            <div className="text-sm text-slate-400 font-normal">
              {dateRange}
            </div>
          </div>

          {/* Card 3: Total Trading */}
          <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-xs flex flex-col justify-between hover:shadow-sm transition-all min-h-[128px]">
            <div className="flex items-start justify-between">
              <span className="text-sm font-normal text-slate-500">Total Trading</span>
              <div className="w-10 h-10 rounded-xl bg-amber-100/80 text-amber-500 flex items-center justify-center shrink-0">
                <CandlestickChart className="w-5 h-5 text-amber-500" />
              </div>
            </div>
            <div className="my-1.5">
              <div className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight flex items-baseline gap-1.5">
                <span>{totalTradesCount}</span>
                <span className="text-sm font-normal text-slate-400">Trades</span>
              </div>
            </div>
            <div className="text-sm text-slate-400 font-normal">
              {dateRange}
            </div>
          </div>

          {/* Card 4: IPOs Held */}
          <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-xs flex flex-col justify-between hover:shadow-sm transition-all min-h-[128px]">
            <div className="flex items-start justify-between">
              <span className="text-sm font-normal text-slate-500">IPOs Held</span>
              <div className="w-10 h-10 rounded-xl bg-purple-100/80 text-purple-500 flex items-center justify-center shrink-0">
                <Layers className="w-5 h-5 text-purple-500" />
              </div>
            </div>
            <div className="my-1.5">
              <div className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight flex items-baseline gap-1.5">
                <span>{iposHeldCount}</span>
                <span className="text-sm font-normal text-slate-400">IPOs</span>
              </div>
            </div>
            <div className="text-sm text-slate-400 font-normal">
              {subscriptions}
            </div>
          </div>
        </div>
      )}

      {/* =======================================================================
          2. ULTRA MODERN VERSION 1: CYBER GLASS (Same Information)
         ======================================================================= */}
      {layoutVariant === 'ultra-glass' && (
        <div 
          id="summary-cards-ultra-glass-view" 
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 animate-in fade-in duration-200"
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
      )}

      {/* =======================================================================
          3. ULTRA MODERN VERSION 2: HORIZON PRECISION (Same Information)
         ======================================================================= */}
      {layoutVariant === 'horizon-precision' && (
        <div 
          id="summary-cards-horizon-precision-view" 
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 animate-in fade-in duration-200"
        >
          {/* Workstation Card 1: Portfolio Value */}
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-sm transition-all flex flex-col justify-between min-h-[128px]">
            <div className="flex items-start justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Portfolio Value</span>
              <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="my-1.5">
              <div className="text-2xl sm:text-[26px] font-bold font-mono text-slate-900 tracking-tight">
                {portfolioValue}
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>0.1%</span>
              <span className="text-slate-400 font-normal ml-0.5">MoM</span>
            </div>
          </div>

          {/* Workstation Card 2: Trading Value */}
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-emerald-400 hover:shadow-sm transition-all flex flex-col justify-between min-h-[128px]">
            <div className="flex items-start justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Trading Value</span>
              <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="my-1.5">
              <div className="text-2xl sm:text-[26px] font-bold font-mono text-slate-900 tracking-tight">
                {tradingValue}
              </div>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              {dateRange}
            </div>
          </div>

          {/* Workstation Card 3: Total Trading */}
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-amber-400 hover:shadow-sm transition-all flex flex-col justify-between min-h-[128px]">
            <div className="flex items-start justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Trading</span>
              <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
                <CandlestickChart className="w-4 h-4" />
              </div>
            </div>
            <div className="my-1.5">
              <div className="text-2xl sm:text-[26px] font-bold font-mono text-slate-900 tracking-tight flex items-baseline gap-1.5">
                <span>{totalTradesCount}</span>
                <span className="text-xs font-normal text-slate-400 font-sans">Trades</span>
              </div>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              {dateRange}
            </div>
          </div>

          {/* Workstation Card 4: IPOs Held */}
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-purple-400 hover:shadow-sm transition-all flex flex-col justify-between min-h-[128px]">
            <div className="flex items-start justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">IPOs Held</span>
              <div className="w-9 h-9 rounded-lg bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="my-1.5">
              <div className="text-2xl sm:text-[26px] font-bold font-mono text-slate-900 tracking-tight flex items-baseline gap-1.5">
                <span>{iposHeldCount}</span>
                <span className="text-xs font-normal text-slate-400 font-sans">IPOs</span>
              </div>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              {subscriptions}
            </div>
          </div>
        </div>
      )}

      {/* =======================================================================
          4. ULTRA MODERN VERSION 3: QUANTUM NEO (Same Information)
         ======================================================================= */}
      {layoutVariant === 'quantum-neo' && (
        <div 
          id="summary-cards-quantum-neo-view" 
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 animate-in fade-in duration-200"
        >
          {/* Spatial Card 1: Portfolio Value */}
          <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs hover:border-blue-300 hover:shadow-sm transition-all flex flex-col justify-between min-h-[128px]">
            <div className="flex items-start justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Portfolio Value</span>
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            <div className="my-1.5">
              <div className="text-2xl sm:text-[26px] font-black text-slate-900 tracking-tight">
                {portfolioValue}
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-600">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>0.1%</span>
              <span className="text-slate-400 font-normal ml-0.5">MoM</span>
            </div>
          </div>

          {/* Spatial Card 2: Trading Value */}
          <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs hover:border-emerald-300 hover:shadow-sm transition-all flex flex-col justify-between min-h-[128px]">
            <div className="flex items-start justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Trading Value</span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="my-1.5">
              <div className="text-2xl sm:text-[26px] font-black text-slate-900 tracking-tight">
                {tradingValue}
              </div>
            </div>
            <div className="text-xs text-slate-500 font-medium">
              {dateRange}
            </div>
          </div>

          {/* Spatial Card 3: Total Trading */}
          <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs hover:border-amber-300 hover:shadow-sm transition-all flex flex-col justify-between min-h-[128px]">
            <div className="flex items-start justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Trading</span>
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 shadow-2xs">
                <CandlestickChart className="w-5 h-5" />
              </div>
            </div>
            <div className="my-1.5">
              <div className="text-2xl sm:text-[26px] font-black text-slate-900 tracking-tight flex items-baseline gap-1.5">
                <span>{totalTradesCount}</span>
                <span className="text-sm font-normal text-slate-400">Trades</span>
              </div>
            </div>
            <div className="text-xs text-slate-500 font-medium">
              {dateRange}
            </div>
          </div>

          {/* Spatial Card 4: IPOs Held */}
          <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs hover:border-purple-300 hover:shadow-sm transition-all flex flex-col justify-between min-h-[128px]">
            <div className="flex items-start justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">IPOs Held</span>
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 shadow-2xs">
                <Layers className="w-5 h-5" />
              </div>
            </div>
            <div className="my-1.5">
              <div className="text-2xl sm:text-[26px] font-black text-slate-900 tracking-tight flex items-baseline gap-1.5">
                <span>{iposHeldCount}</span>
                <span className="text-sm font-normal text-slate-400">IPOs</span>
              </div>
            </div>
            <div className="text-xs text-slate-500 font-medium">
              {subscriptions}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
