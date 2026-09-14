'use client';

import React from 'react';
import { Check, ChevronDown, Plus, Search as SearchIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SEARCH_FIELD_OPTIONS } from '../useDirectory';
import {
  Dropdown,
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
 * V1 — Aurora. Soft glow and pills: segmented pill toolbar, pill tab track,
 * capsule search with a field pill, and pill-shaped listbox fields.
 */

const CARD_SHADOW = 'shadow-[0_20px_50px_-36px_rgba(15,23,42,0.45)]';

function Toolbar({ filterOpen, onToggleFilter, hasActiveFilters }: ToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="inline-flex items-center gap-0.5 rounded-full border border-slate-200/80 bg-white/80 p-1 backdrop-blur">
        {TOOLBAR_ACTIONS.map(({ key, label, icon: Icon }) => {
          const active = key === 'filter' && filterOpen;
          return (
            <button
              key={key}
              type="button"
              onClick={key === 'filter' ? onToggleFilter : undefined}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition',
                active ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
              )}
            >
              <Icon className={cn('h-3.5 w-3.5', active ? 'text-blue-600' : 'text-slate-500')} />
              {label}
              {key === 'filter' && hasActiveFilters && <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        className="inline-flex items-center gap-1.5 rounded-full bg-blue-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-600"
      >
        <Plus className="h-4 w-4" />
        Add Individual
      </button>
    </div>
  );
}

function StatusTabs({ value, onChange, counts }: StatusTabsProps) {
  return (
    <div className="inline-flex max-w-full flex-wrap items-center gap-1 rounded-[22px] bg-slate-100/80 p-1.5">
      {STATUS_TABS.map((tab) => {
        const active = value === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-full px-4 text-[13px] transition-all',
              active
                ? 'bg-white font-bold text-blue-600 shadow-[0_2px_10px_-2px_rgba(59,130,246,0.25)]'
                : 'font-medium text-slate-600 hover:bg-white/60 hover:text-slate-900',
            )}
          >
            {tab.id !== 'ALL' && <Icon className={cn('h-4 w-4 stroke-[2.2]', tab.color)} />}
            {tab.label}
            <span
              className={cn(
                'min-w-[20px] rounded-full px-2 py-0.5 text-center text-[11px] font-semibold leading-none',
                active ? 'bg-blue-50 text-blue-600' : 'bg-slate-200/70 text-slate-600',
              )}
            >
              {counts[tab.id]}
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
    <div className="flex w-full items-center rounded-full border border-slate-200 bg-white p-1 transition focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100">
      <Dropdown
        className="shrink-0"
        trigger={({ open, toggle }) => (
          <button
            type="button"
            onClick={toggle}
            className="flex h-8 items-center gap-1.5 rounded-full border border-blue-200/80 bg-blue-50 px-3.5 text-xs font-bold text-blue-700 transition hover:bg-blue-100"
          >
            {field.label}
            <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')} />
          </button>
        )}
      >
        {(close) => (
          <div className="absolute left-0 top-full z-50 mt-2 w-60 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl">
            {SEARCH_FIELD_OPTIONS.map((opt) => {
              const selected = opt.id === searchBy;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    onSearchBy(opt.id);
                    close();
                  }}
                  className={cn(
                    'flex w-full items-center justify-between rounded-xl px-3.5 py-2 text-left text-xs font-bold uppercase tracking-wider transition',
                    selected ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50',
                  )}
                >
                  {opt.label}
                  {selected && <Check className="h-4 w-4" />}
                </button>
              );
            })}
          </div>
        )}
      </Dropdown>
      <div className="flex flex-1 items-center px-3">
        <SearchIcon className="mr-2 h-4 w-4 shrink-0 text-slate-400" />
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder={field.placeholder}
          className="w-full bg-transparent text-xs font-semibold uppercase tracking-wide text-slate-800 placeholder:text-slate-400 focus:outline-none"
        />
        {query && (
          <button type="button" onClick={() => onQuery('')} className="rounded-full p-1 text-slate-400 hover:text-slate-600">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

function Field({ label, allLabel, value, options, onChange }: FieldProps) {
  const items = optionList(allLabel, options);
  const current = items.find((i) => i.value === value) ?? items[0];
  return (
    <div>
      <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-700">{label}</p>
      <Dropdown
        trigger={({ open, toggle }) => (
          <button
            type="button"
            onClick={toggle}
            className={cn(
              'flex h-11 w-full items-center justify-between rounded-full border px-4 text-left text-xs font-medium transition',
              open
                ? 'border-blue-400 bg-white text-slate-800 ring-4 ring-blue-100'
                : value === 'ALL'
                  ? 'border-slate-200 bg-slate-50/60 text-slate-700 hover:border-slate-300'
                  : 'border-blue-200 bg-blue-50/60 font-semibold text-blue-700',
            )}
          >
            <span className="truncate">{current.label}</span>
            <ChevronDown className={cn('h-4 w-4 text-slate-400 transition-transform', open && 'rotate-180')} />
          </button>
        )}
      >
        {(close) => (
          <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-64 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl">
            {items.map((item) => {
              const selected = item.value === value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => {
                    onChange(item.value);
                    close();
                  }}
                  className={cn(
                    'flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition',
                    selected ? 'bg-blue-50 font-bold text-blue-600' : 'font-medium text-slate-700 hover:bg-slate-50',
                  )}
                >
                  {item.label}
                  {selected && <Check className="h-3.5 w-3.5" />}
                </button>
              );
            })}
          </div>
        )}
      </Dropdown>
    </div>
  );
}

function Summary({ shown, total, onReset }: SummaryProps) {
  return (
    <div className="flex items-center justify-between border-t border-slate-100 pt-4">
      <span className="text-xs text-slate-500">
        Filtered: <strong className="text-slate-800">{shown}</strong> of {total} records
      </span>
      <button type="button" onClick={onReset} className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline">
        Reset Filters
      </button>
    </div>
  );
}

export const auroraKit: DesignKit = {
  canvas: 'space-y-4 rounded-[32px] bg-[#f3f6fb] p-3 sm:p-5',
  headerCard: cn('overflow-hidden rounded-[26px] border border-white bg-white p-6', CARD_SHADOW),
  title: 'text-[26px] font-black tracking-tight text-slate-900',
  subtitle: 'mt-1 text-xs text-slate-500',
  filterCard: cn('space-y-5 rounded-[26px] border border-white bg-white p-5 sm:p-6', CARD_SHADOW),
  fieldGrid: 'gap-4 sm:gap-6',
  tableWrap: cn('overflow-hidden rounded-[26px] border border-white', CARD_SHADOW),
  table: 'aurora',
  Toolbar,
  StatusTabs,
  Search,
  Field,
  Summary,
};
