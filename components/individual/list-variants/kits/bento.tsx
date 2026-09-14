'use client';

import React from 'react';
import { ChevronDown, Plus, Search as SearchIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SEARCH_FIELD_OPTIONS } from '../useDirectory';
import {
  Dropdown,
  FIELD_ICONS,
  STATUS_TABS,
  TOOLBAR_ACTIONS,
  optionList,
  type DesignKit,
  type FieldProps,
  type SearchProps,
  type StatusTabsProps,
  type SummaryProps,
  type ToolbarProps,
} from '../kit';

/*
 * V4 — Violet Bento. Tactile tiles: square icon buttons with pop-up labels,
 * progress-bar status chips, a well-style search, and icon tile pickers that
 * open chip menus.
 */

const MENU = 'rounded-3xl border border-slate-100 bg-white p-3 shadow-2xl shadow-blue-900/10';

function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full px-3 py-1.5 text-[11px] font-bold transition',
        selected ? 'bg-blue-500 text-white shadow-md shadow-blue-500/25' : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700',
      )}
    >
      {children}
    </button>
  );
}

function Toolbar({ filterOpen, onToggleFilter, hasActiveFilters }: ToolbarProps) {
  return (
    <div className="flex items-center gap-1.5">
      {TOOLBAR_ACTIONS.map(({ key, label, icon: Icon }) => {
        const active = key === 'filter' && filterOpen;
        return (
          <button
            key={key}
            type="button"
            aria-label={label}
            onClick={key === 'filter' ? onToggleFilter : undefined}
            className={cn(
              'group relative grid h-10 w-10 place-items-center rounded-2xl transition',
              active
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700',
            )}
          >
            <Icon className="h-4 w-4" />
            {key === 'filter' && hasActiveFilters && (
              <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-blue-500 ring-2 ring-white" />
            )}
            <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 scale-95 whitespace-nowrap rounded-xl bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white opacity-0 transition group-hover:scale-100 group-hover:opacity-100">
              {label}
            </span>
          </button>
        );
      })}
      <button
        type="button"
        className="ml-1.5 inline-flex h-10 items-center gap-2 rounded-2xl bg-blue-500 py-1.5 pl-1.5 pr-4 text-xs font-bold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-600"
      >
        <span className="grid h-7 w-7 place-items-center rounded-xl bg-white/20">
          <Plus className="h-4 w-4" />
        </span>
        Add Individual
      </button>
    </div>
  );
}

function StatusTabs({ value, onChange, counts }: StatusTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {STATUS_TABS.map((tab) => {
        const active = value === tab.id;
        const share = counts.ALL ? Math.round((counts[tab.id] / counts.ALL) * 100) : 0;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'min-w-[112px] rounded-2xl border px-3.5 pb-2.5 pt-2 text-left transition',
              active ? 'border-blue-200 bg-white ring-4 ring-blue-100' : 'border-transparent bg-slate-100/80 hover:bg-slate-100',
            )}
          >
            <span className="flex items-center justify-between gap-3">
              <span className={cn('whitespace-nowrap text-[12px] font-bold', active ? 'text-blue-700' : 'text-slate-600')}>
                {tab.label}
              </span>
              <span className={cn('text-[12px] font-black tabular-nums', active ? 'text-slate-900' : 'text-slate-400')}>
                {counts[tab.id]}
              </span>
            </span>
            <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-white">
              <span
                className={cn('block h-full rounded-full transition-all', tab.id === 'ALL' ? 'bg-blue-500' : tab.solid)}
                style={{ width: `${share}%` }}
              />
            </span>
          </button>
        );
      })}
    </div>
  );
}

function Search({ query, onQuery, searchBy, onSearchBy }: SearchProps) {
  const field = SEARCH_FIELD_OPTIONS.find((o) => o.id === searchBy) ?? SEARCH_FIELD_OPTIONS[0];
  return (
    <div className="flex h-12 w-full items-center gap-2 rounded-2xl bg-slate-100 p-1.5 transition focus-within:bg-white focus-within:shadow-sm focus-within:ring-4 focus-within:ring-blue-100">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-500 text-white">
        <SearchIcon className="h-4 w-4" />
      </span>
      <input
        value={query}
        onChange={(e) => onQuery(e.target.value)}
        placeholder={field.placeholder}
        className="min-w-0 flex-1 bg-transparent px-1 text-xs font-bold uppercase tracking-wide text-slate-800 placeholder:text-slate-400 focus:outline-none"
      />
      {query && (
        <button type="button" onClick={() => onQuery('')} className="rounded-lg p-1 text-slate-400 hover:text-slate-600">
          <X className="h-3.5 w-3.5" />
        </button>
      )}
      <Dropdown
        className="h-full shrink-0"
        trigger={({ open, toggle }) => (
          <button
            type="button"
            onClick={toggle}
            className={cn(
              'flex h-full items-center gap-1.5 rounded-xl px-3 text-[11px] font-bold shadow-sm transition',
              open ? 'bg-blue-500 text-white' : 'bg-white text-slate-600 hover:text-blue-700',
            )}
          >
            <span className="opacity-60">in</span>
            {field.label}
            <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')} />
          </button>
        )}
      >
        {(close) => (
          <div className={cn('absolute right-0 top-full z-50 mt-2 w-64', MENU)}>
            <p className="px-1 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Search in</p>
            <div className="flex flex-wrap gap-1.5">
              {SEARCH_FIELD_OPTIONS.map((opt) => (
                <Chip
                  key={opt.id}
                  selected={opt.id === searchBy}
                  onClick={() => {
                    onSearchBy(opt.id);
                    close();
                  }}
                >
                  {opt.label}
                </Chip>
              ))}
            </div>
          </div>
        )}
      </Dropdown>
    </div>
  );
}

function Field({ fieldKey, label, allLabel, value, options, onChange }: FieldProps) {
  const items = optionList(allLabel, options);
  const current = items.find((i) => i.value === value) ?? items[0];
  const Icon = FIELD_ICONS[fieldKey];
  const selected = value !== 'ALL';
  return (
    <Dropdown
      trigger={({ open, toggle }) => (
        <button
          type="button"
          onClick={toggle}
          className={cn(
            'flex w-full items-center gap-3 rounded-2xl p-2 pr-3 text-left transition',
            open ? 'bg-white shadow-lg shadow-blue-900/5 ring-2 ring-blue-300' : 'bg-slate-100/80 hover:bg-slate-100',
          )}
        >
          <span
            className={cn(
              'grid h-10 w-10 shrink-0 place-items-center rounded-xl transition',
              selected ? 'bg-blue-500 text-white' : 'bg-white text-blue-600 shadow-sm',
            )}
          >
            <Icon className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">{label}</span>
            <span className={cn('block truncate text-[13px] font-bold', selected ? 'text-slate-900' : 'text-slate-600')}>
              {current.label}
            </span>
          </span>
          <ChevronDown className={cn('h-4 w-4 shrink-0 text-slate-400 transition-transform', open && 'rotate-180')} />
        </button>
      )}
    >
      {(close) => (
        <div className={cn('absolute left-0 top-full z-50 mt-2 w-full min-w-[240px]', MENU)}>
          <div className="flex flex-wrap gap-1.5">
            {items.map((item) => (
              <Chip
                key={item.value}
                selected={item.value === value}
                onClick={() => {
                  onChange(item.value);
                  close();
                }}
              >
                {item.label}
              </Chip>
            ))}
          </div>
        </div>
      )}
    </Dropdown>
  );
}

function Summary({ shown, total, onReset }: SummaryProps) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-blue-50/80 p-1.5 pl-3">
      <span className="flex items-center gap-2 text-xs font-semibold text-blue-900/70">
        <span className="grid h-6 min-w-6 place-items-center rounded-lg bg-blue-500 px-1.5 text-[11px] font-black text-white">
          {shown}
        </span>
        of {total} records match
      </span>
      <button
        type="button"
        onClick={onReset}
        className="rounded-xl bg-white px-3 py-1.5 text-[11px] font-bold text-blue-700 shadow-sm transition hover:bg-blue-500 hover:text-white"
      >
        Reset filters
      </button>
    </div>
  );
}

export const bentoKit: DesignKit = {
  canvas: 'space-y-3 rounded-[30px] bg-slate-100/80 p-3 sm:p-5',
  headerCard: 'rounded-3xl border border-white bg-white p-6 shadow-sm',
  title: 'text-[26px] font-black tracking-tight text-slate-900',
  subtitle: 'mt-1 text-xs text-slate-500',
  filterCard: 'space-y-4 rounded-3xl border border-white bg-white p-5 shadow-sm sm:p-6',
  fieldGrid: 'gap-3',
  tableWrap: '',
  table: 'bento',
  Toolbar,
  StatusTabs,
  Search,
  Field,
  Summary,
};
