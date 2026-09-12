'use client';

import React from 'react';
import Image from 'next/image';
import { Search, Plus, Download, RotateCw, Columns3, ChevronDown, Eye, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ACCOUNT_META,
  FILTER_ALL_LABELS,
  FILTER_KEYS,
  FILTER_LABELS,
  STATUS_META,
  STATUS_ORDER,
  fullName,
  money,
  shortBranch,
  since,
  useDirectory,
} from './shared';

/**
 * V6 — Prism Glass.
 * Layered frosted panels over a tinted gradient field, a floating toolbar that
 * detaches from the header, and status ribbons down the left edge of each row.
 */
export function PrismGlass() {
  const d = useDirectory();

  return (
    <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-indigo-50 via-slate-50 to-cyan-50 p-4 sm:p-6">
      <div className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-40 h-80 w-80 rounded-full bg-fuchsia-300/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />

      <div className="relative">
        {/* Header panel */}
        <div className="rounded-[26px] border border-white/70 bg-white/70 px-6 py-5 shadow-[0_10px_40px_-24px_rgba(30,41,59,0.5)] backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="bg-gradient-to-r from-slate-900 via-indigo-800 to-slate-900 bg-clip-text text-[24px] font-black tracking-tight text-transparent">
                Individual Directory
              </h2>
              <p className="mt-1 text-[12.5px] text-slate-500">
                Onboarding, verification and authorization — layered on one glass surface.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center rounded-2xl border border-white/80 bg-white/70 p-1 backdrop-blur">
                {[
                  { icon: RotateCw, label: 'Reload' },
                  { icon: Columns3, label: 'Columns' },
                  { icon: Download, label: 'Export' },
                ].map(({ icon: Icon, label }) => (
                  <button
                    key={label}
                    className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-[12px] font-semibold text-slate-600 transition hover:bg-white hover:text-slate-900"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </button>
                ))}
              </div>
              <button className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/25 transition hover:from-indigo-500 hover:to-blue-500">
                <Plus className="h-4 w-4" />
                Add individual
              </button>
            </div>
          </div>
        </div>

        {/* Floating toolbar — deliberately overlapping the panels */}
        <div className="relative z-10 -mt-3 px-3 sm:px-6">
          <div className="flex flex-col gap-3 rounded-[22px] border border-white/80 bg-white/85 p-3 shadow-[0_18px_50px_-30px_rgba(30,41,59,0.6)] backdrop-blur-xl xl:flex-row xl:items-center">
            <div className="flex flex-1 flex-wrap items-center gap-1">
              {STATUS_ORDER.map((key) => {
                const meta = STATUS_META[key];
                const Icon = meta.icon;
                const active = d.status === key;
                return (
                  <button
                    key={key}
                    onClick={() => d.setStatus(key)}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[12px] font-bold transition',
                      active
                        ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-600/25'
                        : 'text-slate-500 hover:bg-white hover:text-slate-900',
                    )}
                  >
                    <Icon className={cn('h-3.5 w-3.5', active ? 'text-white' : meta.fg)} />
                    {meta.label}
                    <span
                      className={cn(
                        'rounded-full px-1.5 text-[10.5px] tabular-nums',
                        active ? 'bg-white/20' : 'bg-slate-100 text-slate-500',
                      )}
                    >
                      {d.counts[key]}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="relative w-full xl:w-80">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={d.query}
                onChange={(e) => d.setQuery(e.target.value)}
                placeholder="Search records…"
                className="h-10 w-full rounded-full border border-slate-200/80 bg-white/80 pl-10 pr-4 text-[13px] outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
              />
            </div>
          </div>
        </div>

        {/* Filter panel */}
        <div className="mt-3 rounded-[26px] border border-white/70 bg-white/60 px-4 py-4 backdrop-blur-xl sm:px-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {FILTER_KEYS.map((key) => (
              <label key={key} className="block">
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                  {FILTER_LABELS[key]}
                </span>
                <div className="relative mt-1.5">
                  <select
                    value={d.filters[key]}
                    onChange={(e) => d.setFilter(key, e.target.value)}
                    className={cn(
                      'h-11 w-full cursor-pointer appearance-none rounded-2xl border px-3.5 pr-9 text-[12.5px] font-semibold outline-none transition',
                      d.filters[key] === 'ALL'
                        ? 'border-white/90 bg-white/80 text-slate-600'
                        : 'border-indigo-200 bg-indigo-50/80 text-indigo-700',
                    )}
                  >
                    <option value="ALL">{FILTER_ALL_LABELS[key]}</option>
                    {d.options[key].map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </label>
            ))}
          </div>

          {(d.activeFilters > 0 || d.status !== 'ALL') && (
            <div className="mt-3 flex items-center justify-between border-t border-white/80 pt-3">
              <p className="text-[11.5px] text-slate-500">
                Showing <strong className="font-bold text-slate-800">{d.rows.length}</strong> of {d.records.length} records
              </p>
              <button onClick={d.reset} className="text-[11.5px] font-bold text-indigo-600 hover:underline">
                Reset filters
              </button>
            </div>
          )}
        </div>

        {/* Rows as stacked glass cards */}
        <div className="mt-3 space-y-2">
          {d.rows.map((item) => {
            const meta = STATUS_META[item.requestStatus];
            const account = ACCOUNT_META[item.accountStatus];
            const Icon = meta.icon;
            return (
              <div
                key={item.id}
                className="group relative flex flex-col gap-4 overflow-hidden rounded-[22px] border border-white/80 bg-white/75 py-4 pl-6 pr-4 backdrop-blur-xl transition hover:bg-white hover:shadow-[0_18px_40px_-28px_rgba(30,41,59,0.55)] lg:flex-row lg:items-center"
              >
                {/* Status ribbon */}
                <span className={cn('absolute inset-y-3 left-2.5 w-1.5 rounded-full', meta.solid)} />

                <div className="flex min-w-0 flex-1 items-center gap-3.5">
                  <Image
                    src={item.avatarUrl}
                    alt=""
                    width={42}
                    height={42}
                    className="h-10.5 w-10.5 shrink-0 rounded-2xl object-cover ring-2 ring-white"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-bold tracking-tight text-slate-900">{fullName(item)}</p>
                    <p className="truncate text-[11.5px] text-slate-500">
                      <span className="font-mono font-semibold text-slate-600">{item.customerId}</span> · {item.nationality} ·{' '}
                      {item.gender}
                    </p>
                  </div>
                </div>

                <div className="grid flex-1 grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
                  <Field label="Request" value={item.requestType} />
                  <Field label="Stage" value={item.currentWorkflowStage} />
                  <Field label="Branch" value={shortBranch(item.branch)} />
                  <Field label="Deposits" value={money(item.totalDeposits)} strong />
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold', meta.bg, meta.border, meta.fg)}>
                    <Icon className="h-3 w-3" />
                    {item.requestStatus}
                  </span>
                  <span className={cn('hidden items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold sm:inline-flex', account.bg, account.border, account.fg)}>
                    <span className={cn('h-1.5 w-1.5 rounded-full', account.solid)} />
                    {item.accountStatus}
                  </span>
                  <span className="hidden text-[11px] text-slate-400 xl:inline">{since(item.createdAt)}</span>

                  <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                    <button className="grid h-8 w-8 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:text-indigo-600">
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button className="grid h-8 w-8 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:text-indigo-600">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {d.rows.length === 0 && (
            <div className="rounded-[22px] border border-white/80 bg-white/70 py-16 text-center backdrop-blur-xl">
              <p className="text-[13px] font-semibold text-slate-700">Nothing to show under these filters</p>
              <button onClick={d.reset} className="mt-2 text-[12px] font-bold text-indigo-600 hover:underline">
                Reset filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p
        className={cn(
          'mt-0.5 truncate text-[12px] text-slate-700',
          strong ? 'font-black tabular-nums text-slate-900' : 'font-semibold',
        )}
      >
        {value}
      </p>
    </div>
  );
}
