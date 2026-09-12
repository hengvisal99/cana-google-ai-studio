'use client';

import React from 'react';
import Image from 'next/image';
import { Search, Plus, TrendingUp, Users, Wallet, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ACCOUNT_META,
  FILTER_ALL_LABELS,
  FILTER_KEYS,
  STATUS_META,
  STATUS_ORDER,
  accentFor,
  fullName,
  money,
  shortBranch,
  since,
  useDirectory,
} from './shared';

/**
 * V4 — Bento Board.
 * Metrics first: a bento of KPI tiles above a card grid. Rows become portrait
 * cards, so the page reads as a portfolio rather than a ledger.
 */
export function BentoBoard() {
  const d = useDirectory();

  const totalDeposits = d.rows.reduce((sum, r) => sum + r.totalDeposits, 0);
  const verified = d.rows.filter((r) => r.kycStatus === 'verified').length;
  const completed = d.rows.filter((r) => r.profileStatus === 'Completed').length;
  const completionPct = d.rows.length ? Math.round((completed / d.rows.length) * 100) : 0;

  return (
    <div className="rounded-[30px] bg-gradient-to-b from-slate-100/80 to-slate-50 p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[26px] font-black tracking-tight text-slate-900">Individual Directory</h2>
          <p className="mt-1 text-[13px] text-slate-500">Portfolio view of every onboarding request in flight.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={d.query}
              onChange={(e) => d.setQuery(e.target.value)}
              placeholder="Search…"
              className="h-11 w-56 rounded-2xl border border-white bg-white/90 pl-10 pr-3 text-[13px] shadow-sm outline-none transition placeholder:text-slate-400 focus:w-64 focus:ring-4 focus:ring-blue-100"
            />
          </div>
          <button className="inline-flex h-11 items-center gap-2 rounded-2xl bg-slate-900 px-4 text-xs font-bold text-white shadow-lg shadow-slate-900/15 transition hover:bg-slate-800">
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
      </div>

      {/* Bento KPI grid */}
      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="col-span-2 overflow-hidden rounded-3xl border border-white bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Assets under review</p>
              <p className="mt-2 text-[34px] font-black leading-none tracking-tight text-slate-900">
                {money(totalDeposits)}
              </p>
              <p className="mt-2 inline-flex items-center gap-1 text-[12px] font-semibold text-emerald-600">
                <TrendingUp className="h-3.5 w-3.5" />
                Across {d.rows.length} active record{d.rows.length === 1 ? '' : 's'}
              </p>
            </div>
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-50 text-blue-600">
              <Wallet className="h-5 w-5" />
            </span>
          </div>

          {/* Status distribution bar */}
          <div className="mt-5 flex h-2 gap-1 overflow-hidden rounded-full">
            {STATUS_ORDER.filter((s) => s !== 'ALL').map((key) => {
              const share = d.counts.ALL ? (d.counts[key] / d.counts.ALL) * 100 : 0;
              return (
                <span
                  key={key}
                  className={cn('h-full rounded-full', STATUS_META[key].solid)}
                  style={{ width: `${Math.max(share, 3)}%` }}
                />
              );
            })}
          </div>
          <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1">
            {STATUS_ORDER.filter((s) => s !== 'ALL').map((key) => (
              <span key={key} className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                <span className={cn('h-1.5 w-1.5 rounded-full', STATUS_META[key].solid)} />
                {key} <span className="tabular-nums text-slate-400">{d.counts[key]}</span>
              </span>
            ))}
          </div>
        </div>

        <KpiTile icon={Users} tone="violet" label="In view" value={String(d.rows.length)} sub={`of ${d.records.length} total`} />
        <KpiTile
          icon={ShieldCheck}
          tone="emerald"
          label="KYC verified"
          value={String(verified)}
          sub={`${completionPct}% profiles complete`}
        />
      </div>

      {/* Filter rail */}
      <div className="mt-4 flex flex-col gap-3 rounded-3xl border border-white bg-white/80 p-3 backdrop-blur lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {STATUS_ORDER.map((key) => {
            const meta = STATUS_META[key];
            const active = d.status === key;
            return (
              <button
                key={key}
                onClick={() => d.setStatus(key)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-bold transition',
                  active ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10' : 'text-slate-500 hover:bg-slate-100',
                )}
              >
                {meta.label}
                <span className={cn('tabular-nums', active ? 'text-white/60' : 'text-slate-400')}>{d.counts[key]}</span>
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTER_KEYS.map((key) => (
            <select
              key={key}
              value={d.filters[key]}
              onChange={(e) => d.setFilter(key, e.target.value)}
              className={cn(
                'h-9 cursor-pointer rounded-full border px-3 text-[11.5px] font-bold outline-none transition',
                d.filters[key] === 'ALL'
                  ? 'border-slate-200 bg-white text-slate-500'
                  : 'border-slate-900 bg-slate-900 text-white',
              )}
            >
              <option value="ALL">{FILTER_ALL_LABELS[key]}</option>
              {d.options[key].map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          ))}
        </div>
      </div>

      {/* Card grid */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {d.rows.map((item) => {
          const meta = STATUS_META[item.requestStatus];
          const account = ACCOUNT_META[item.accountStatus];
          const Icon = meta.icon;
          return (
            <article
              key={item.id}
              className="group relative overflow-hidden rounded-3xl border border-white bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-900/5"
            >
              <div className={cn('absolute inset-x-0 top-0 h-1 bg-gradient-to-r', accentFor(item))} />

              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Image
                    src={item.avatarUrl}
                    alt=""
                    width={46}
                    height={46}
                    className="h-11.5 w-11.5 rounded-2xl object-cover ring-1 ring-slate-200"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-bold tracking-tight text-slate-900">{fullName(item)}</p>
                    <p className="font-mono text-[11px] text-slate-400">{item.customerId}</p>
                  </div>
                </div>
                <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10.5px] font-bold', meta.bg, meta.fg)}>
                  <Icon className="h-3 w-3" />
                  {item.requestStatus}
                </span>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3">
                <Cell label="Deposits" value={money(item.totalDeposits)} strong />
                <Cell label="Risk" value={String(item.riskCategory)} />
                <Cell label="Nationality" value={item.nationality} />
                <Cell label="Request" value={item.requestType} />
              </dl>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3.5">
                <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10.5px] font-semibold', account.bg, account.border, account.fg)}>
                  <span className={cn('h-1.5 w-1.5 rounded-full', account.solid)} />
                  {item.accountStatus}
                </span>
                <span className="text-[11px] text-slate-400">{shortBranch(item.branch).split(' ').slice(0, 2).join(' ')}</span>
                <button className="inline-flex items-center gap-1 text-[11.5px] font-bold text-slate-500 transition group-hover:text-blue-600">
                  Open
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <p className="mt-2 text-[10.5px] text-slate-400">Onboarded {since(item.createdAt)}</p>
            </article>
          );
        })}

        {d.rows.length === 0 && (
          <div className="col-span-full rounded-3xl border border-dashed border-slate-300 bg-white/60 py-16 text-center">
            <p className="text-[13px] font-semibold text-slate-700">No records match these filters</p>
            <button onClick={d.reset} className="mt-2 text-[12px] font-bold text-blue-600 hover:underline">
              Reset filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function KpiTile({
  icon: Icon,
  tone,
  label,
  value,
  sub,
}: {
  icon: React.ElementType;
  tone: 'violet' | 'emerald';
  label: string;
  value: string;
  sub: string;
}) {
  const tones = {
    violet: 'bg-violet-50 text-violet-600',
    emerald: 'bg-emerald-50 text-emerald-600',
  } as const;
  return (
    <div className="rounded-3xl border border-white bg-white p-5 shadow-sm">
      <span className={cn('grid h-10 w-10 place-items-center rounded-2xl', tones[tone])}>
        <Icon className="h-4.5 w-4.5" />
      </span>
      <p className="mt-3.5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-1 text-[28px] font-black leading-none tabular-nums tracking-tight text-slate-900">{value}</p>
      <p className="mt-1.5 text-[11.5px] text-slate-500">{sub}</p>
    </div>
  );
}

function Cell({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div>
      <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">{label}</dt>
      <dd
        className={cn(
          'mt-0.5 truncate text-[12.5px] text-slate-700',
          strong ? 'font-black tabular-nums text-slate-900' : 'font-semibold',
        )}
      >
        {value}
      </dd>
    </div>
  );
}
