'use client';

import React from 'react';
import { Search, Plus, Filter, X, ArrowUpRight, Command, CircleDot } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  FILTER_ALL_LABELS,
  FILTER_KEYS,
  FILTER_LABELS,
  STATUS_META,
  STATUS_ORDER,
  fullName,
  initials,
  money,
  shortBranch,
  since,
  useDirectory,
} from './shared';

/**
 * V2 — Command Deck.
 * Dense operator console: one command bar, removable filter chips, hairline table
 * with monospace identifiers. Built for scanning hundreds of rows, not eight.
 */
export function CommandDeck() {
  const d = useDirectory();
  const [showFilters, setShowFilters] = React.useState(false);

  const chips = FILTER_KEYS.filter((k) => d.filters[k] !== 'ALL');

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white">
      {/* Command bar */}
      <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3 lg:flex-row lg:items-center">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-900 text-white">
            <Command className="h-4 w-4" />
          </span>
          <div className="leading-none">
            <p className="text-[13px] font-bold tracking-tight text-slate-900">Individuals</p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-400">
              {d.rows.length} / {d.records.length} rows
            </p>
          </div>
        </div>

        <div className="relative min-w-0 flex-1 lg:mx-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            value={d.query}
            onChange={(e) => d.setQuery(e.target.value)}
            placeholder="Filter by name, ID, email or RM…"
            className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-16 font-mono text-[12px] text-slate-800 outline-none transition placeholder:font-sans placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
          />
          <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-400">
            ⌘K
          </kbd>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={cn(
              'inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-[12px] font-semibold transition',
              showFilters || chips.length
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300',
            )}
          >
            <Filter className="h-3.5 w-3.5" />
            Filters
            {chips.length > 0 && (
              <span className="rounded bg-white/20 px-1 font-mono text-[10px]">{chips.length}</span>
            )}
          </button>
          <button className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-blue-600 px-3 text-[12px] font-bold text-white transition hover:bg-blue-700">
            <Plus className="h-3.5 w-3.5" />
            New
          </button>
        </div>
      </div>

      {/* Segmented status strip */}
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-100 px-4 py-2">
        {STATUS_ORDER.map((key) => {
          const meta = STATUS_META[key];
          const active = d.status === key;
          return (
            <button
              key={key}
              onClick={() => d.setStatus(key)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12px] font-semibold transition',
                active ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800',
              )}
            >
              <span className={cn('h-1.5 w-1.5 rounded-full', meta.solid)} />
              {meta.label}
              <span className="font-mono text-[11px] text-slate-400">{d.counts[key]}</span>
            </button>
          );
        })}

        <div className="ml-auto flex items-center gap-1.5">
          {chips.map((key) => (
            <button
              key={key}
              onClick={() => d.setFilter(key, 'ALL')}
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 py-1 pl-2 pr-1.5 text-[11px] font-semibold text-slate-600 transition hover:border-slate-300"
            >
              <span className="text-slate-400">{FILTER_LABELS[key]}:</span>
              {d.filters[key]}
              <X className="h-3 w-3 text-slate-400" />
            </button>
          ))}
          {(chips.length > 0 || d.query) && (
            <button onClick={d.reset} className="px-1 text-[11px] font-bold text-slate-400 hover:text-slate-700">
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Filter drawer */}
      {showFilters && (
        <div className="grid grid-cols-1 gap-3 border-b border-slate-100 bg-slate-50/60 px-4 py-3 sm:grid-cols-2 lg:grid-cols-4">
          {FILTER_KEYS.map((key) => (
            <label key={key} className="block">
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-slate-400">
                {FILTER_LABELS[key]}
              </span>
              <select
                value={d.filters[key]}
                onChange={(e) => d.setFilter(key, e.target.value)}
                className="mt-1 h-9 w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-2.5 text-[12px] font-semibold text-slate-700 outline-none focus:border-slate-400"
              >
                <option value="ALL">{FILTER_ALL_LABELS[key]}</option>
                {d.options[key].map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-100 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-400">
              <th className="py-2.5 pl-4 pr-3 font-semibold">Customer</th>
              <th className="px-3 py-2.5 font-semibold">Request</th>
              <th className="px-3 py-2.5 font-semibold">Stage</th>
              <th className="px-3 py-2.5 font-semibold">Profile</th>
              <th className="px-3 py-2.5 font-semibold">Branch</th>
              <th className="px-3 py-2.5 text-right font-semibold">Deposits</th>
              <th className="px-3 py-2.5 font-semibold">Created</th>
              <th className="py-2.5 pl-3 pr-4" />
            </tr>
          </thead>
          <tbody>
            {d.rows.map((item) => {
              const meta = STATUS_META[item.requestStatus];
              return (
                <tr key={item.id} className="group border-b border-slate-50 transition hover:bg-slate-50/80">
                  <td className="py-2.5 pl-4 pr-3">
                    <div className="flex items-center gap-2.5">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-slate-100 font-mono text-[10px] font-bold text-slate-600">
                        {initials(item)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-semibold text-slate-900">{fullName(item)}</p>
                        <p className="font-mono text-[10.5px] text-slate-400">{item.customerId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={cn('inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-bold', meta.bg, meta.fg)}>
                      <span className={cn('h-1.5 w-1.5 rounded-full', meta.solid)} />
                      {item.requestStatus}
                    </span>
                    <span className="ml-2 text-[11px] text-slate-400">{item.requestType}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-slate-600">
                      <CircleDot className="h-3 w-3 text-slate-300" />
                      {item.currentWorkflowStage}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={cn(
                        'text-[11.5px] font-semibold',
                        item.profileStatus === 'Completed' ? 'text-emerald-600' : 'text-amber-600',
                      )}
                    >
                      {item.profileStatus}
                    </span>
                  </td>
                  <td className="max-w-[180px] truncate px-3 py-2.5 text-[11.5px] text-slate-500">
                    {shortBranch(item.branch)}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-[11.5px] font-semibold tabular-nums text-slate-700">
                    {money(item.totalDeposits)}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-[11px] text-slate-400">{since(item.createdAt)}</td>
                  <td className="py-2.5 pl-3 pr-4 text-right">
                    <button className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-bold text-slate-400 opacity-0 transition group-hover:opacity-100 hover:bg-white hover:text-slate-900">
                      Open
                      <ArrowUpRight className="h-3 w-3" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {d.rows.length === 0 && (
              <tr>
                <td colSpan={8} className="py-14 text-center">
                  <p className="font-mono text-[12px] text-slate-500">0 rows returned</p>
                  <button onClick={d.reset} className="mt-2 text-[12px] font-bold text-blue-600 hover:underline">
                    Clear filters
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-4 py-2.5 font-mono text-[11px] text-slate-400">
        <span>
          {d.rows.length} row{d.rows.length === 1 ? '' : 's'}
          {d.activeFilters > 0 && ` · ${d.activeFilters} filter${d.activeFilters > 1 ? 's' : ''} active`}
        </span>
        <span>Page 1 of 1</span>
      </div>
    </div>
  );
}
