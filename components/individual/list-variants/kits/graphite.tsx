'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Check, ChevronsUpDown, Plus, Search as SearchIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SEARCH_FIELD_OPTIONS } from '../useDirectory';
import {
  Dropdown,
  STATUS_TABS,
  TOOLBAR_ACTIONS,
  optionList,
  sentenceCase,
  type DesignKit,
  type FieldProps,
  type SearchProps,
  type StatusTabsProps,
  type SummaryProps,
  type ToolbarProps,
} from '../kit';

/*
 * V2 — Graphite. Operator-console precision: icon-only toolbar with tooltips,
 * sliding underline tabs, a command-bar search, and inline-label pickers.
 */

function Toolbar({ filterOpen, onToggleFilter, hasActiveFilters }: ToolbarProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {TOOLBAR_ACTIONS.map(({ key, label, icon: Icon }) => {
          const active = key === 'filter' && filterOpen;
          return (
            <button
              key={key}
              type="button"
              aria-label={label}
              onClick={key === 'filter' ? onToggleFilter : undefined}
              className={cn(
                'group relative grid h-9 w-9 place-items-center rounded-lg border transition',
                active
                  ? 'border-blue-500 bg-blue-500 text-white'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-900',
              )}
            >
              <Icon className="h-4 w-4" />
              {key === 'filter' && hasActiveFilters && (
                <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 ring-2 ring-white" />
              )}
              <span className="pointer-events-none absolute left-1/2 top-full z-30 mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[10px] font-medium text-white opacity-0 transition group-hover:opacity-100">
                {label}
              </span>
            </button>
          );
        })}
      </div>
      <span className="mx-1 h-6 w-px bg-slate-200" />
      <button
        type="button"
        className="inline-flex h-9 items-center gap-2 rounded-lg bg-blue-500 pl-3 pr-2 text-[13px] font-semibold text-white transition hover:bg-blue-600"
      >
        <Plus className="h-4 w-4" />
        Add Individual
        <kbd className="rounded bg-white/15 px-1.5 py-0.5 font-mono text-[10px] text-white/80">N</kbd>
      </button>
    </div>
  );
}

function StatusTabs({ value, onChange, counts }: StatusTabsProps) {
  const id = React.useId();
  return (
    <div className="flex flex-wrap items-center gap-x-5 border-b border-slate-200">
      {STATUS_TABS.map((tab) => {
        const active = value === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative flex h-10 items-center gap-2 whitespace-nowrap text-[13px] transition-colors',
              active ? 'font-semibold text-blue-600' : 'font-medium text-slate-500 hover:text-slate-900',
            )}
          >
            <span className={cn('h-1.5 w-1.5 rounded-full', tab.solid)} />
            {tab.label}
            <span className={cn('font-mono text-[11px] tabular-nums', active ? 'text-blue-600' : 'text-slate-400')}>
              {counts[tab.id]}
            </span>
            {active && (
              <motion.span
                layoutId={`graphite-tab-${id}`}
                className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-blue-500"
                transition={{ type: 'spring', bounce: 0.15, duration: 0.45 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

function Search({ query, onQuery, searchBy, onSearchBy }: SearchProps) {
  const field = SEARCH_FIELD_OPTIONS.find((o) => o.id === searchBy) ?? SEARCH_FIELD_OPTIONS[0];
  return (
    <div className="flex h-10 w-full items-center gap-2 rounded-lg border border-slate-200 bg-white pl-3 pr-1.5 transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10">
      <SearchIcon className="h-4 w-4 shrink-0 text-slate-400" />
      <input
        value={query}
        onChange={(e) => onQuery(e.target.value)}
        placeholder={`Search ${sentenceCase(field.label).toLowerCase()}…`}
        className="min-w-0 flex-1 bg-transparent text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none"
      />
      {query && (
        <button type="button" onClick={() => onQuery('')} className="rounded p-1 text-slate-400 hover:text-slate-700">
          <X className="h-3.5 w-3.5" />
        </button>
      )}
      <Dropdown
        className="shrink-0"
        trigger={({ open, toggle }) => (
          <button
            type="button"
            onClick={toggle}
            className={cn(
              'flex h-7 items-center gap-1 rounded-md px-2 font-mono text-[11px] transition',
              open ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900',
            )}
          >
            <span className="text-slate-400">in:</span>
            {sentenceCase(field.label)}
            <ChevronsUpDown className="h-3 w-3" />
          </button>
        )}
      >
        {(close) => (
          <div className="absolute right-0 top-full z-50 mt-2 w-52 rounded-lg border border-slate-200 bg-white p-1 shadow-lg shadow-slate-900/5">
            <p className="px-2 pb-1 pt-1.5 font-mono text-[10px] uppercase tracking-wider text-slate-400">Search in</p>
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
                    'flex h-8 w-full items-center justify-between rounded-md px-2 text-left text-[13px] transition',
                    selected ? 'bg-blue-50 font-medium text-blue-700' : 'text-slate-600 hover:bg-slate-50',
                  )}
                >
                  {sentenceCase(opt.label)}
                  {selected && <Check className="h-3.5 w-3.5" />}
                </button>
              );
            })}
          </div>
        )}
      </Dropdown>
      <kbd className="hidden rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] text-slate-400 sm:block">
        ⌘K
      </kbd>
    </div>
  );
}

function Field({ label, allLabel, value, options, onChange }: FieldProps) {
  const items = optionList(allLabel, options);
  return (
    <Dropdown
      trigger={({ open, toggle }) => (
        <button
          type="button"
          onClick={toggle}
          className={cn(
            'flex h-10 w-full items-center gap-2.5 rounded-lg border bg-white px-3 text-left transition',
            open ? 'border-blue-500 ring-4 ring-blue-500/10' : 'border-slate-200 hover:border-slate-300',
          )}
        >
          <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-slate-400">{label}</span>
          <span className="h-4 w-px shrink-0 bg-slate-200" />
          <span className={cn('flex-1 truncate text-[13px]', value === 'ALL' ? 'text-slate-400' : 'font-medium text-slate-900')}>
            {value === 'ALL' ? 'Any' : value}
          </span>
          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-slate-400" />
        </button>
      )}
    >
      {(close) => (
        <div className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-64 overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-lg shadow-slate-900/5">
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
                  'flex h-8 w-full items-center justify-between rounded-md px-2 text-left text-[13px] transition',
                  selected ? 'bg-blue-50 font-medium text-blue-700' : 'text-slate-600 hover:bg-slate-50',
                )}
              >
                {item.value === 'ALL' ? 'Any' : item.label}
                {selected && <Check className="h-3.5 w-3.5" />}
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
    <div className="flex items-center justify-between rounded-lg border border-dashed border-slate-200 bg-slate-50/60 px-3 py-2 font-mono text-[11px] text-slate-500">
      <span>
        <span className="text-blue-600">{shown}</span>/{total} rows match
      </span>
      <button
        type="button"
        onClick={onReset}
        className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-slate-600 transition hover:bg-white hover:text-slate-900"
      >
        <X className="h-3 w-3" />
        Clear filters
      </button>
    </div>
  );
}

export const graphiteKit: DesignKit = {
  canvas: 'space-y-3 rounded-[20px] bg-slate-50 p-3 sm:p-4',
  headerCard: 'rounded-xl border border-slate-200 bg-white px-5 py-4',
  title: 'text-xl font-semibold tracking-tight text-slate-900',
  subtitle: 'mt-1 text-[13px] text-slate-500',
  filterCard: 'space-y-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-5',
  fieldGrid: 'gap-3',
  tableWrap: 'overflow-hidden rounded-xl border border-slate-200',
  table: 'command',
  Toolbar,
  StatusTabs,
  Search,
  Field,
  Summary,
};
