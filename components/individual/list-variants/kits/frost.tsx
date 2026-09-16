'use client';

import React from 'react';
import { ChevronDown, Plus, RotateCcw, Search as SearchIcon, X } from 'lucide-react';
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
 * V3 — Nordic Frost. Cool and airy: icon-bubble toolbar chips, stat-tile tabs
 * with big counts, search with an explicit action button, and notched
 * floating-label fields with radio menus.
 */

const FROST_SHADOW = 'shadow-[0_10px_30px_-22px_rgba(59,130,246,0.45)]';
const MENU = 'rounded-xl border border-blue-100 bg-white/95 p-2 shadow-[0_20px_40px_-20px_rgba(59,130,246,0.45)] backdrop-blur';

function Radio({ selected }: { selected: boolean }) {
  return (
    <span
      className={cn(
        'grid h-4 w-4 shrink-0 place-items-center rounded-full border transition',
        selected ? 'border-blue-500 bg-blue-500' : 'border-slate-300 bg-white',
      )}
    >
      {selected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
    </span>
  );
}

function Toolbar({ filterOpen, onToggleFilter, hasActiveFilters }: ToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {TOOLBAR_ACTIONS.map(({ key, label, icon: Icon }) => {
        const active = key === 'filter' && filterOpen;
        return (
          <button
            key={key}
            type="button"
            onClick={key === 'filter' ? onToggleFilter : undefined}
            className={cn(
              'inline-flex items-center gap-2 rounded-xl border py-1 pl-1 pr-3 text-xs font-semibold transition',
              active
                ? 'border-blue-300 bg-blue-50 text-blue-800'
                : 'border-blue-100 bg-white/80 text-slate-700 hover:border-blue-200 hover:shadow-[0_6px_16px_-10px_rgba(59,130,246,0.5)]',
            )}
          >
            <span
              className={cn(
                'relative grid h-7 w-7 place-items-center rounded-lg transition',
                active ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-600',
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {key === 'filter' && hasActiveFilters && (
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-blue-400 ring-2 ring-white" />
              )}
            </span>
            {label}
          </button>
        );
      })}
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-xs font-semibold text-white shadow-[0_8px_20px_-10px_rgba(59,130,246,0.6)] transition hover:bg-blue-600"
      >
        <Plus className="h-4 w-4" />
        Add New
      </button>
    </div>
  );
}

function StatusTabs({ value, onChange, counts }: StatusTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {STATUS_TABS.map((tab) => {
        const active = value === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative min-w-[96px] overflow-hidden rounded-xl border px-3 pb-2 pt-2.5 text-left transition',
              active
                ? 'border-blue-300 bg-white shadow-[0_10px_24px_-14px_rgba(59,130,246,0.6)]'
                : 'border-blue-100 bg-white/60 hover:border-blue-200 hover:bg-white',
            )}
          >
            {active && <span className="absolute inset-x-0 top-0 h-0.5 bg-blue-500" />}
            <span className="flex items-center justify-between gap-3">
              <span className={cn('text-[19px] font-semibold leading-none tabular-nums', active ? 'text-slate-900' : 'text-slate-600')}>
                {counts[tab.id]}
              </span>
              <Icon className={cn('h-3.5 w-3.5', tab.id === 'ALL' ? 'text-blue-500' : tab.color)} />
            </span>
            <span className={cn('mt-1.5 block whitespace-nowrap text-[11px] font-semibold', active ? 'text-blue-700' : 'text-slate-500')}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function Search({ query, onQuery, searchBy, onSearchBy }: SearchProps) {
  const field = SEARCH_FIELD_OPTIONS.find((o) => o.id === searchBy) ?? SEARCH_FIELD_OPTIONS[0];
  const inputRef = React.useRef<HTMLInputElement>(null);
  return (
    <div className="flex h-11 w-full items-center gap-1 rounded-xl border border-blue-100 bg-white p-1 transition focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-100">
      <Dropdown
        className="h-full shrink-0"
        trigger={({ open, toggle }) => (
          <button
            type="button"
            onClick={toggle}
            className={cn(
              'flex h-full items-center gap-1.5 rounded-lg px-3 text-[11px] font-semibold uppercase tracking-wider transition',
              open ? 'bg-blue-100 text-blue-800' : 'bg-blue-50 text-blue-700 hover:bg-blue-100',
            )}
          >
            {field.label}
            <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')} />
          </button>
        )}
      >
        {(close) => (
          <div className={cn('absolute left-0 top-full z-50 mt-2 w-60', MENU)}>
            {SEARCH_FIELD_OPTIONS.map((opt) => {
              const selected = opt.id === searchBy;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    onSearchBy(opt.id);
                    close();
                    inputRef.current?.focus();
                  }}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-semibold transition',
                    selected ? 'bg-blue-50 text-blue-800' : 'text-slate-700 hover:bg-blue-50/60',
                  )}
                >
                  <Radio selected={selected} />
                  {opt.label}
                </button>
              );
            })}
          </div>
        )}
      </Dropdown>
      <SearchIcon className="ml-2 h-4 w-4 shrink-0 text-blue-400" />
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => onQuery(e.target.value)}
        placeholder={field.placeholder}
        className="min-w-0 flex-1 bg-transparent px-1 text-xs font-semibold uppercase tracking-wide text-slate-800 placeholder:text-slate-400 focus:outline-none"
      />
      {query && (
        <button type="button" onClick={() => onQuery('')} className="rounded-md p-1 text-slate-400 hover:text-slate-600">
          <X className="h-3.5 w-3.5" />
        </button>
      )}
      <button
        type="button"
        onClick={() => inputRef.current?.focus()}
        className="h-full rounded-lg bg-blue-500 px-4 text-xs font-semibold text-white transition hover:bg-blue-600"
      >
        Search
      </button>
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
      className="pt-2"
      trigger={({ open, toggle }) => (
        <button
          type="button"
          onClick={toggle}
          className={cn(
            'relative flex h-12 w-full items-center gap-2.5 rounded-xl border bg-white px-3.5 text-left transition',
            open ? 'border-blue-400 ring-4 ring-blue-100' : selected ? 'border-blue-300' : 'border-blue-100 hover:border-blue-200',
          )}
        >
          <span
            className={cn(
              'absolute -top-2 left-3 rounded bg-white px-1.5 text-[10px] font-semibold uppercase leading-4 tracking-wider',
              open || selected ? 'text-blue-700' : 'text-slate-400',
            )}
          >
            {label}
          </span>
          <Icon className="h-4 w-4 shrink-0 text-blue-500" />
          <span className={cn('flex-1 truncate text-[13px]', selected ? 'font-semibold text-slate-900' : 'text-slate-500')}>
            {current.label}
          </span>
          <ChevronDown className={cn('h-4 w-4 shrink-0 text-blue-400 transition-transform', open && 'rotate-180')} />
        </button>
      )}
    >
      {(close) => (
        <div className={cn('absolute left-0 right-0 top-full z-50 mt-2 max-h-64 overflow-y-auto', MENU)}>
          {items.map((item) => {
            const isSelected = item.value === value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => {
                  onChange(item.value);
                  close();
                }}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] transition',
                  isSelected ? 'bg-blue-50 font-semibold text-blue-800' : 'text-slate-700 hover:bg-blue-50/60',
                )}
              >
                <Radio selected={isSelected} />
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </Dropdown>
  );
}

function Summary({ shown, total, onReset }: SummaryProps) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-blue-50 px-4 py-2.5">
      <span className="text-xs text-blue-900/70">
        Showing <strong className="font-semibold text-blue-900">{shown}</strong> of {total} records
      </span>
      <button
        type="button"
        onClick={onReset}
        className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-blue-700 transition hover:border-blue-300"
      >
        <RotateCcw className="h-3 w-3" />
        Reset
      </button>
    </div>
  );
}

export const frostKit: DesignKit = {
  canvas: 'space-y-4 rounded-[28px] bg-blue-50/50 p-3 sm:p-5',
  headerCard: cn('rounded-2xl border border-blue-100 bg-white/90 p-5 backdrop-blur', FROST_SHADOW),
  title: 'text-[24px] font-semibold tracking-tight text-slate-900',
  subtitle: 'mt-1 text-xs text-slate-500',
  filterCard: cn('space-y-5 rounded-2xl border border-blue-100 bg-white/90 p-5 backdrop-blur sm:p-6', FROST_SHADOW),
  fieldGrid: 'gap-4 sm:gap-5',
  tableWrap: cn('rounded-2xl', FROST_SHADOW),
  table: 'split',
  Toolbar,
  StatusTabs,
  Search,
  Field,
  Summary,
};
