'use client';
import React from 'react';
import { Pencil, Users, Wallet, Gauge, CalendarClock, CalendarX, CalendarCheck, Rocket, Layers, Flame, ArrowDownToLine, ArrowUpToLine } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { IpoMaster } from '@/types';
import { StatusChip as Chip, formatUSD, fillPercent, STATUS_CONFIG } from './IPOCard';

function formatShares(n: number) { return n>=1_000_000?`${(n/1_000_000).toFixed(1)}M`:n>=1_000?`${(n/1_000).toFixed(0)}K`:`${n}`; }

interface Field { label: string; value: string; icon: React.ElementType }

/* ---------- header pieces ---------- */

function EditButton({ onClick, className }: { onClick: () => void; className?: string }) {
  return (
    <button onClick={onClick} className={cn('inline-flex items-center justify-center gap-1 h-7 px-3 rounded-full text-xs font-medium transition-all cursor-pointer bg-white text-slate-700 ring-1 ring-slate-200 shadow-sm hover:shadow-md hover:text-blue-700 hover:ring-blue-200 shrink-0', className)}>
      <Pencil className="w-3 h-3" /> Edit Details
    </button>
  );
}

const priceCls = 'font-semibold tracking-tight tabular-nums text-blue-600';

/** Ticker avatar matching the list card. */
function Avatar({ ipo, className }: { ipo: IpoMaster; className?: string }) {
  const sc = STATUS_CONFIG[ipo.status]||STATUS_CONFIG.Upcoming;
  return <span className={cn('w-12 h-12 shrink-0 rounded-full bg-gradient-to-br text-white flex items-center justify-center text-[11px] font-semibold tracking-wide shadow-sm', sc.grad, className)}>{ipo.ticker}</span>;
}

/** Hero fill donut: the headline figure of the detail panel. */
function FillRing({ fill, size = 128, className }: { fill: number; size?: number; className?: string }) {
  const R = 52, C = 2 * Math.PI * R;
  return (
    <div className={cn('relative shrink-0', className)} style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r={R} fill="none" strokeWidth="10" className="stroke-slate-100" />
        <circle cx="60" cy="60" r={R} fill="none" strokeWidth="10" strokeLinecap="round" className="stroke-blue-600 transition-all duration-700" strokeDasharray={C} strokeDashoffset={C - (fill / 100) * C} />
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('font-semibold text-slate-900 tabular-nums leading-none', size >= 150 ? 'text-4xl' : size >= 120 ? 'text-3xl' : 'text-2xl')}>{fill.toFixed(0)}%</span>
        <span className="mt-1 text-[11px] text-slate-500">Filled</span>
      </span>
    </div>
  );
}

const noFill = (rows: Field[]) => rows.filter(r => r.label !== 'Filled');

const frame = 'relative flex flex-col flex-1 min-h-0 overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200/70 shadow-[0_20px_50px_-20px_rgba(15,23,42,0.18)]';

type LayoutProps = { ipo: IpoMaster; onEdit: () => void; dates: Field[]; terms: Field[]; subscription: Field[]; fill: number };

/* ---------- Modern term sheet: fill ring hero card, then gradient-border section cards ---------- */
function SheetGroup({ title, rows, className }: { title: string; rows: Field[]; className?: string }) {
  return (
    <div className={cn('rounded-2xl p-px bg-blue-100 min-w-0', className)}>
      <div className="h-full flex flex-col rounded-[15px] bg-white px-4 pt-3 pb-1.5">
        <div className="flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />{title}
          </p>
        </div>
        <div className="mt-1.5">
          {rows.map(r => (
            <div key={r.label} className="group flex items-center justify-between gap-3 -mx-2 px-2 py-2 rounded-lg hover:bg-slate-50 transition-colors">
              <span className="flex items-center gap-2.5 text-sm text-slate-500 min-w-0">
                <span className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors"><r.icon className="w-3.5 h-3.5" /></span>
                <span className="truncate">{r.label}</span>
              </span>
              <span className="text-sm font-medium text-slate-900 tabular-nums whitespace-nowrap">{r.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DetailSheet({ ipo, onEdit, dates, terms, subscription, fill }: LayoutProps) {
  return (
    <div className={frame}>
      <div className="relative flex-1 min-h-0 flex flex-col overflow-y-auto custom-scrollbar px-6 py-5">
        <div className="flex items-center gap-4">
          <Avatar ipo={ipo} className="w-14 h-14 text-xs ring-4 ring-white shadow-lg" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 min-w-0">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900 truncate">{ipo.name}</h2>
              <Chip status={ipo.status} className="px-2 py-0.5" />
            </div>
            <p className="mt-0.5 text-xs text-slate-500">{ipo.sector} · {ipo.currency}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[11px] font-medium uppercase tracking-widest text-slate-400">Offer price</p>
            <p className={cn('text-4xl leading-tight', priceCls)}>{formatUSD(ipo.offerPrice)}</p>
          </div>
          <EditButton onClick={onEdit} className="self-start" />
        </div>
        <div className="mt-8 flex-1 grid grid-cols-1 md:grid-cols-2 md:grid-rows-[auto_1fr] gap-x-3 gap-y-6">
          <div className="md:col-span-2 flex rounded-2xl p-px bg-blue-200">
            <div className="flex-1 rounded-[15px] bg-white p-5 flex items-center gap-8">
              <FillRing fill={fill} size={160} />
              <div className="flex-1 min-w-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {noFill(subscription).map(r => (
                    <div key={r.label} className="rounded-xl bg-slate-50 px-5 py-4">
                      <p className="flex items-center gap-1.5 text-xs text-slate-500"><r.icon className="w-3.5 h-3.5 text-blue-600" />{r.label}</p>
                      <p className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-900 tabular-nums">{r.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <SheetGroup title="Dates" rows={dates} className="md:self-end" />
          <SheetGroup title="Share terms" rows={terms} className="md:self-end" />
        </div>
      </div>
    </div>
  );
}

/** Selected IPO detail: header with price, subscription fill hero, then Dates and Share terms. */
export function IPODetail({ ipo, onEdit, subscriberCount, totalSubscribed }: { ipo: IpoMaster; onEdit: () => void; subscriberCount: number; totalSubscribed: number }) {
  const fill = fillPercent(ipo, totalSubscribed);
  const subscription: Field[] = [
    { label: 'Subscribers', value: subscriberCount.toLocaleString('en-US'), icon: Users },
    { label: 'Subscribed', value: formatUSD(totalSubscribed), icon: Wallet },
    { label: 'Filled', value: `${fill.toFixed(0)}%`, icon: Gauge },
  ];
  const dates: Field[] = [
    { label: 'Open date', value: ipo.openDate, icon: CalendarClock },
    { label: 'Close date', value: ipo.closeDate, icon: CalendarX },
    { label: 'Allotment date', value: ipo.allotmentDate, icon: CalendarCheck },
    { label: 'Listing date', value: ipo.listingDate, icon: Rocket },
  ];
  const terms: Field[] = [
    { label: 'Total shares', value: formatShares(ipo.totalShares), icon: Layers },
    { label: 'Oversubscription', value: ipo.oversubscriptionRate ? `${ipo.oversubscriptionRate}x` : '—', icon: Flame },
    { label: 'Min. subscription', value: `${ipo.minSubscription} shares`, icon: ArrowDownToLine },
    { label: 'Max. subscription', value: `${formatShares(ipo.maxSubscription)} shares`, icon: ArrowUpToLine },
  ];
  return <DetailSheet ipo={ipo} onEdit={onEdit} dates={dates} terms={terms} subscription={subscription} fill={fill} />;
}
