'use client';

import React from 'react';
import { Search, Plus, ArrowRight, Minus } from 'lucide-react';
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
import type { RequestStatus } from '@/types';

const GROUPS: RequestStatus[] = ['Pending', 'Resubmit', 'Rejected', 'Approved'];

/**
 * V5 — Editorial Ledger.
 * Typography does the work: no cards, no boxes. Records are grouped under
 * status headings and separated by hairlines, like a printed register.
 */
export function EditorialLedger() {
  const d = useDirectory();

  const groups = (d.status === 'ALL' ? GROUPS : [d.status]).map((status) => ({
    status,
    items: d.rows.filter((r) => r.requestStatus === status),
  }));

  return (
    <div className="rounded-[28px] border border-slate-200/70 bg-[#fcfcfd] px-6 py-9 sm:px-10 sm:py-12">
      {/* Masthead */}
      <header className="border-b-2 border-slate-900 pb-6">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">Nexus 360 — Register</p>
            <h2 className="mt-2.5 text-[40px] font-black leading-[0.95] tracking-[-0.03em] text-slate-900 sm:text-[52px]">
              Individual
              <br />
              Directory
            </h2>
          </div>
          <div className="flex items-end gap-8">
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Records</p>
              <p className="text-[38px] font-black leading-none tabular-nums tracking-tight text-slate-900">
                {String(d.rows.length).padStart(2, '0')}
              </p>
            </div>
            <button className="inline-flex items-center gap-2 border-b-2 border-slate-900 pb-1 text-[13px] font-bold text-slate-900 transition hover:gap-3">
              <Plus className="h-4 w-4" />
              Add individual
            </button>
          </div>
        </div>
      </header>

      {/* Controls — inline, unboxed */}
      <div className="flex flex-col gap-5 border-b border-slate-200 py-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {STATUS_ORDER.map((key) => {
            const active = d.status === key;
            return (
              <button
                key={key}
                onClick={() => d.setStatus(key)}
                className={cn(
                  'group inline-flex items-baseline gap-1.5 text-[13px] font-bold transition',
                  active ? 'text-slate-900' : 'text-slate-400 hover:text-slate-700',
                )}
              >
                <span className={cn('border-b-2 pb-0.5', active ? 'border-slate-900' : 'border-transparent')}>
                  {STATUS_META[key].label}
                </span>
                <sup className="text-[10px] font-bold tabular-nums text-slate-400">{d.counts[key]}</sup>
              </button>
            );
          })}
        </div>

        <div className="relative w-full lg:w-72">
          <Search className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={d.query}
            onChange={(e) => d.setQuery(e.target.value)}
            placeholder="Search the register…"
            className="h-9 w-full border-b border-slate-300 bg-transparent pl-6 text-[13px] outline-none transition placeholder:text-slate-400 focus:border-slate-900"
          />
        </div>
      </div>

      {/* Filter line */}
      <div className="flex flex-wrap items-center gap-x-7 gap-y-3 border-b border-slate-200 py-4">
        {FILTER_KEYS.map((key) => (
          <label key={key} className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              {FILTER_LABELS[key]}
            </span>
            <select
              value={d.filters[key]}
              onChange={(e) => d.setFilter(key, e.target.value)}
              className={cn(
                'cursor-pointer border-b bg-transparent pb-0.5 pr-1 text-[12.5px] font-bold outline-none transition',
                d.filters[key] === 'ALL'
                  ? 'border-slate-300 text-slate-600 hover:border-slate-500'
                  : 'border-slate-900 text-slate-900',
              )}
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
        {d.activeFilters > 0 && (
          <button
            onClick={d.reset}
            className="inline-flex items-center gap-1 text-[11.5px] font-bold text-slate-400 transition hover:text-slate-900"
          >
            <Minus className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>

      {/* Grouped register */}
      <div className="mt-10 space-y-11">
        {groups.map(({ status, items }) => {
          const meta = STATUS_META[status];
          if (!items.length) return null;
          return (
            <section key={status}>
              <div className="flex items-baseline gap-3">
                <span className={cn('h-2 w-2 rounded-full', meta.solid)} />
                <h3 className="text-[13px] font-black uppercase tracking-[0.18em] text-slate-900">{status}</h3>
                <span className="text-[11px] font-bold tabular-nums text-slate-400">
                  {String(items.length).padStart(2, '0')}
                </span>
                <span className="h-px flex-1 bg-slate-200" />
              </div>

              <ul>
                {items.map((item, index) => (
                  <li key={item.id} className="group border-b border-slate-100 last:border-b-0">
                    <div className="grid grid-cols-12 items-baseline gap-4 py-5 transition group-hover:bg-white">
                      <span className="col-span-12 font-mono text-[11px] text-slate-300 sm:col-span-1">
                        {String(index + 1).padStart(2, '0')}
                      </span>

                      <div className="col-span-12 sm:col-span-4">
                        <div className="flex items-baseline gap-2.5">
                          <span className="font-mono text-[10px] font-bold text-slate-400">{initials(item)}</span>
                          <div>
                            <p className="text-[19px] font-bold leading-tight tracking-[-0.015em] text-slate-900">
                              {fullName(item)}
                            </p>
                            <p className="mt-0.5 text-[12px] text-slate-500">{item.email}</p>
                          </div>
                        </div>
                      </div>

                      <div className="col-span-6 sm:col-span-2">
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Customer</p>
                        <p className="mt-0.5 font-mono text-[12.5px] font-semibold text-slate-800">{item.customerId}</p>
                        <p className="text-[11.5px] text-slate-500">{item.requestType}</p>
                      </div>

                      <div className="col-span-6 sm:col-span-2">
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Branch</p>
                        <p className="mt-0.5 text-[12.5px] font-semibold text-slate-800">{shortBranch(item.branch)}</p>
                        <p className="text-[11.5px] text-slate-500">{item.nationality}</p>
                      </div>

                      <div className="col-span-6 text-left sm:col-span-2 sm:text-right">
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Deposits</p>
                        <p className="mt-0.5 text-[15px] font-black tabular-nums tracking-tight text-slate-900">
                          {money(item.totalDeposits)}
                        </p>
                        <p className="text-[11px] text-slate-400">{since(item.createdAt)}</p>
                      </div>

                      <div className="col-span-6 flex justify-start sm:col-span-1 sm:justify-end">
                        <button className="inline-flex items-center gap-1 text-[12px] font-bold text-slate-400 transition group-hover:gap-2 group-hover:text-slate-900">
                          Open
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}

        {d.rows.length === 0 && (
          <p className="border-t border-slate-200 pt-10 text-center text-[13px] text-slate-500">
            The register is empty for these filters.{' '}
            <button onClick={d.reset} className="font-bold text-slate-900 underline underline-offset-4">
              Reset
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
