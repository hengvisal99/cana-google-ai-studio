'use client';
import React from 'react';
import { CalendarClock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { IpoMaster } from '@/types';
import { differenceInDays, parseISO, isValid } from 'date-fns';

export const STATUS_CONFIG: Record<string,{dot:string;soft:string;grad:string}> = {
  Upcoming: {dot:'bg-amber-500',soft:'bg-amber-50 text-amber-700',grad:'from-amber-400 to-orange-500'},
  Open:     {dot:'bg-emerald-500',soft:'bg-emerald-50 text-emerald-700',grad:'from-emerald-400 to-green-600'},
  Closed:   {dot:'bg-slate-400',soft:'bg-slate-100 text-slate-600',grad:'from-slate-400 to-slate-600'},
  Allotted: {dot:'bg-cyan-500',soft:'bg-cyan-50 text-cyan-700',grad:'from-cyan-400 to-cyan-600'},
  Listed:   {dot:'bg-purple-500',soft:'bg-violet-50 text-violet-700',grad:'from-violet-500 to-fuchsia-500'},
};

export function formatUSD(n: number) { return `$${n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}`; }

interface IPOCardProps {
  ipo: IpoMaster;
  totalSubscribed: number;
  onSelect: () => void;
  selected: boolean;
}

export function StatusChip({ status, className }: { status: string; className?: string }) {
  const sc = STATUS_CONFIG[status]||STATUS_CONFIG.Upcoming;
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium shrink-0',sc.soft,className)}>
      <span className={cn('w-1.5 h-1.5 rounded-full',sc.dot)}/>{status}
    </span>
  );
}

/** Share of the offering subscribed, 0–100. */
export function fillPercent(ipo: IpoMaster, totalSubscribed: number) {
  return ipo.totalShares>0 && ipo.offerPrice>0 ? Math.min(100,(totalSubscribed/ipo.offerPrice)/ipo.totalShares*100) : 0;
}

/** IPO list row: ticker avatar, name with fill bar (or open countdown while Upcoming), status chip above price. */
export function IPOCard({ ipo, totalSubscribed, onSelect, selected }: IPOCardProps) {
  // Countdown to the open date, shown only while the IPO is Upcoming
  const openDate = parseISO(ipo.openDate);
  const daysLeft = isValid(openDate) ? differenceInDays(openDate, new Date()) : null;
  const showDays = ipo.status==='Upcoming' && daysLeft!==null && daysLeft>=0;
  const fill = fillPercent(ipo, totalSubscribed);
  const sc = STATUS_CONFIG[ipo.status]||STATUS_CONFIG.Upcoming;

  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full text-left rounded-2xl px-4 py-3.5 flex items-center gap-4 transition-all duration-200 cursor-pointer',
        selected ? 'bg-blue-50/70 ring-1 ring-blue-200' : 'bg-white ring-1 ring-slate-200/70 hover:bg-slate-50'
      )}
    >
      <span className={cn('w-12 h-12 shrink-0 rounded-full bg-gradient-to-br text-white flex items-center justify-center text-[10px] font-semibold tracking-wide shadow-sm', sc.grad)}>{ipo.ticker}</span>

      <div className="min-w-0 flex-1">
        <p className={cn('text-[15px] font-semibold leading-snug truncate', selected ? 'text-blue-700' : 'text-slate-900')}>{ipo.name}</p>
        {showDays ? (
          <p className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-slate-50 ring-1 ring-slate-200/70 px-2 py-1 text-xs text-slate-500">
            <CalendarClock className="w-3.5 h-3.5 text-slate-400" />
            Opens in <span className="font-medium text-slate-800 tabular-nums">{daysLeft} {daysLeft===1 ? 'day' : 'days'}</span>
          </p>
        ) : (
          <div className="mt-2.5 flex items-center gap-3 max-w-[260px]">
            <span className="flex-1 h-1.5 rounded-full bg-slate-200/70 overflow-hidden">
              {/* One fill colour for every IPO so bar lengths compare at a glance */}
              <span className="block h-full rounded-full bg-blue-600 transition-all duration-700" style={{ width: `${fill}%` }} />
            </span>
            <span className="w-9 text-right text-xs font-semibold text-slate-700 tabular-nums">{fill.toFixed(0)}%</span>
          </div>
        )}
      </div>

      <div className="flex flex-col items-end gap-2 shrink-0">
        <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium', sc.soft)}>
          <span className={cn('w-1.5 h-1.5 rounded-full', sc.dot)} />{ipo.status}
        </span>
        <p className="text-base font-semibold tracking-tight text-slate-900 tabular-nums leading-none">{formatUSD(ipo.offerPrice)}</p>
      </div>
    </button>
  );
}
