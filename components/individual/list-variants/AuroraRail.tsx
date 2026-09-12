'use client';

import React from 'react';
import Image from 'next/image';
import { Search, Plus, Download, SlidersHorizontal, ChevronDown, MoreHorizontal, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ACCOUNT_META,
  FILTER_ALL_LABELS,
  FILTER_KEYS,
  STATUS_META,
  STATUS_ORDER,
  fullName,
  money,
  shortBranch,
  since,
  useDirectory,
} from './shared';

/**
 * V1 — Aurora Rail.
 * Status navigation lives in a vertical rail on the left; the working surface is a
 * single airy sheet with a soft aurora wash behind the masthead.
 */
export function AuroraRail() {
  const d = useDirectory();

  return (
    <div className="rounded-[32px] bg-[#f6f8fc] p-3 sm:p-4">
      <div className="overflow-hidden rounded-[26px] border border-white bg-white shadow-[0_24px_60px_-40px_rgba(15,23,42,0.45)]">
        {/* Masthead with aurora wash */}
        <div className="relative overflow-hidden border-b border-slate-100 px-6 py-7 sm:px-9">
          <div className="pointer-events-none absolute -left-24 -top-32 h-64 w-64 rounded-full bg-blue-300/35 blur-3xl" />
          <div className="pointer-events-none absolute -top-24 left-1/3 h-56 w-72 rounded-full bg-violet-300/30 blur-3xl" />
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-teal-200/40 blur-3xl" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/70 bg-white/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-blue-700 backdrop-blur">
                <Sparkles className="h-3 w-3" />
                Onboarding desk
              </span>
              <h2 className="mt-3 text-[28px] font-black leading-none tracking-tight text-slate-900">
                Individual Directory
              </h2>
              <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-slate-500">
                Client onboarding, document verification and the authorization lifecycle — one surface.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-2xs backdrop-blur transition hover:border-slate-300 hover:text-slate-900">
                <Download className="h-3.5 w-3.5" />
                Export
              </button>
              <button className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-slate-900/15 transition hover:bg-slate-800">
                <Plus className="h-4 w-4" />
                Add individual
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Vertical status rail */}
          <aside className="shrink-0 border-b border-slate-100 px-5 py-5 lg:w-[236px] lg:border-b-0 lg:border-r">
            <p className="px-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Queue</p>
            <nav className="mt-3 space-y-1">
              {STATUS_ORDER.map((key) => {
                const meta = STATUS_META[key];
                const Icon = meta.icon;
                const active = d.status === key;
                return (
                  <button
                    key={key}
                    onClick={() => d.setStatus(key)}
                    className={cn(
                      'group flex w-full items-center gap-2.5 rounded-2xl px-3 py-2.5 text-left text-[13px] font-semibold transition',
                      active ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10' : 'text-slate-600 hover:bg-slate-50',
                    )}
                  >
                    <Icon className={cn('h-4 w-4', active ? 'text-white' : meta.fg)} />
                    <span className="flex-1 truncate">{meta.label}</span>
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums',
                        active ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-500',
                      )}
                    >
                      {d.counts[key]}
                    </span>
                  </button>
                );
              })}
            </nav>

            <div className="mt-6 rounded-2xl border border-slate-100 bg-gradient-to-b from-slate-50 to-white p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">In view</p>
              <p className="mt-1.5 text-3xl font-black tabular-nums tracking-tight text-slate-900">{d.rows.length}</p>
              <p className="text-[11px] text-slate-500">of {d.records.length} records</p>
              {d.activeFilters > 0 && (
                <button
                  onClick={d.reset}
                  className="mt-3 w-full rounded-xl border border-slate-200 bg-white py-1.5 text-[11px] font-bold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                >
                  Clear {d.activeFilters} filter{d.activeFilters > 1 ? 's' : ''}
                </button>
              )}
            </div>
          </aside>

          {/* Working surface */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:px-6 xl:flex-row xl:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={d.query}
                  onChange={(e) => d.setQuery(e.target.value)}
                  placeholder="Search name, customer ID, email…"
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50/70 pl-11 pr-4 text-[13px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {FILTER_KEYS.map((key) => (
                  <div key={key} className="relative">
                    <select
                      value={d.filters[key]}
                      onChange={(e) => d.setFilter(key, e.target.value)}
                      className={cn(
                        'h-11 cursor-pointer appearance-none rounded-2xl border py-0 pl-3.5 pr-9 text-xs font-semibold outline-none transition',
                        d.filters[key] === 'ALL'
                          ? 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                          : 'border-blue-200 bg-blue-50 text-blue-700',
                      )}
                    >
                      <option value="ALL">{FILTER_ALL_LABELS[key]}</option>
                      {d.options[key].map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  </div>
                ))}
                <button className="inline-flex h-11 items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  More
                </button>
              </div>
            </div>

            <ul className="divide-y divide-slate-100">
              {d.rows.map((item) => {
                const meta = STATUS_META[item.requestStatus];
                const account = ACCOUNT_META[item.accountStatus];
                const Icon = meta.icon;
                return (
                  <li
                    key={item.id}
                    className="group flex flex-col gap-4 px-5 py-4 transition hover:bg-slate-50/70 sm:px-6 xl:flex-row xl:items-center"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3.5">
                      <div className="relative shrink-0">
                        <Image
                          src={item.avatarUrl}
                          alt=""
                          width={44}
                          height={44}
                          className="h-11 w-11 rounded-2xl object-cover ring-1 ring-slate-200"
                        />
                        <span className={cn('absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white', meta.solid)} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[14px] font-bold tracking-tight text-slate-900">{fullName(item)}</p>
                        <p className="mt-0.5 truncate text-[12px] text-slate-500">
                          <span className="font-mono text-[11px] font-semibold text-slate-600">{item.customerId}</span>
                          <span className="mx-1.5 text-slate-300">·</span>
                          {item.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 xl:w-[520px] xl:shrink-0">
                      <div className="w-[104px]">
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Nationality</p>
                        <p className="mt-0.5 text-[12px] font-semibold text-slate-700">{item.nationality}</p>
                      </div>
                      <div className="w-[132px]">
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Branch</p>
                        <p className="mt-0.5 truncate text-[12px] font-semibold text-slate-700">{shortBranch(item.branch)}</p>
                      </div>
                      <div className="w-[92px]">
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Deposits</p>
                        <p className="mt-0.5 text-[12px] font-bold tabular-nums text-slate-800">{money(item.totalDeposits)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold', meta.bg, meta.border, meta.fg)}>
                          <Icon className="h-3 w-3" />
                          {item.requestStatus}
                        </span>
                        <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold', account.bg, account.border, account.fg)}>
                          <span className={cn('h-1.5 w-1.5 rounded-full', account.solid)} />
                          {item.accountStatus}
                        </span>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2 xl:justify-end">
                      <span className="hidden text-[11px] text-slate-400 sm:inline">{since(item.createdAt)}</span>
                      <button className="rounded-xl border border-transparent p-2 text-slate-400 transition group-hover:border-slate-200 group-hover:bg-white hover:text-slate-700">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
              {d.rows.length === 0 && (
                <li className="px-6 py-16 text-center">
                  <p className="text-[13px] font-semibold text-slate-700">No records match these filters</p>
                  <button onClick={d.reset} className="mt-2 text-[12px] font-bold text-blue-600 hover:underline">
                    Reset filters
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
