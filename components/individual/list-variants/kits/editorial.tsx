'use client';

import React from 'react';
import { ArrowRight, ChevronDown, Minus, Plus, Search as SearchIcon } from 'lucide-react';
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
 * V5 — Editorial. Typography instead of chrome: slash-separated text actions,
 * oversized text tabs with superscript counts, an underline search, and
 * underline fields with numbered, ink-bordered menus.
 */

const MENU = 'border-2 border-slate-900 bg-white';

function MenuItem({
  index,
  selected,
  onClick,
  children,
}: {
  index: number;
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 border-b border-slate-100 px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.14em] transition last:border-b-0',
        selected ? 'bg-blue-500 text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
      )}
    >
      <span className={cn('font-mono text-[10px]', selected ? 'text-white/50' : 'text-slate-300')}>
        {String(index + 1).padStart(2, '0')}
      </span>
      {children}
    </button>
  );
}

function Toolbar({ filterOpen, onToggleFilter, hasActiveFilters }: ToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <nav className="flex items-center text-[13px] font-semibold">
        {TOOLBAR_ACTIONS.map(({ key, label }, i) => {
          const active = key === 'filter' && filterOpen;
          return (
            <React.Fragment key={key}>
              {i > 0 && <span className="px-2.5 text-slate-300">/</span>}
              <button
                type="button"
                onClick={key === 'filter' ? onToggleFilter : undefined}
                className={cn(
                  'relative transition',
                  active ? 'text-blue-600 underline decoration-2 underline-offset-[6px]' : 'text-slate-400 hover:text-slate-900',
                )}
              >
                {label}
                {key === 'filter' && hasActiveFilters && (
                  <span className="absolute -right-2 top-0 h-1.5 w-1.5 rounded-full bg-blue-500" />
                )}
              </button>
            </React.Fragment>
          );
        })}
      </nav>
      <button
        type="button"
        className="group inline-flex items-center gap-2 bg-blue-500 px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-blue-600"
      >
        Add New
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </button>
    </div>
  );
}

function StatusTabs({ value, onChange, counts }: StatusTabsProps) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-7 gap-y-2">
      {STATUS_TABS.map((tab) => {
        const active = value === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative whitespace-nowrap pb-1.5 text-[17px] font-semibold tracking-tight transition',
              active ? 'text-blue-600' : 'text-slate-300 hover:text-slate-600',
            )}
          >
            {tab.label}
            <sup className="ml-1 text-[11px] font-semibold tabular-nums">{String(counts[tab.id]).padStart(2, '0')}</sup>
            <span
              className={cn(
                'absolute inset-x-0 bottom-0 h-[3px] origin-left bg-blue-500 transition-transform duration-300',
                active ? 'scale-x-100' : 'scale-x-0',
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

function Search({ query, onQuery, searchBy, onSearchBy }: SearchProps) {
  const field = SEARCH_FIELD_OPTIONS.find((o) => o.id === searchBy) ?? SEARCH_FIELD_OPTIONS[0];
  return (
    <div className="flex w-full items-end gap-4 border-b-2 border-slate-900 pb-2 transition focus-within:border-blue-500">
      <Dropdown
        className="shrink-0"
        trigger={({ open, toggle }) => (
          <button
            type="button"
            onClick={toggle}
            className="flex items-center gap-1.5 pb-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 transition hover:text-slate-900"
          >
            By <span className="text-blue-600">{field.label}</span>
            <ChevronDown className={cn('h-3 w-3 transition-transform', open && 'rotate-180')} />
          </button>
        )}
      >
        {(close) => (
          <div className={cn('absolute left-0 top-full z-50 mt-3 w-56', MENU)}>
            {SEARCH_FIELD_OPTIONS.map((opt, i) => (
              <MenuItem
                key={opt.id}
                index={i}
                selected={opt.id === searchBy}
                onClick={() => {
                  onSearchBy(opt.id);
                  close();
                }}
              >
                {opt.label}
              </MenuItem>
            ))}
          </div>
        )}
      </Dropdown>
      <input
        value={query}
        onChange={(e) => onQuery(e.target.value)}
        placeholder={`Search by ${field.label.toLowerCase()}…`}
        className="min-w-0 flex-1 bg-transparent text-[15px] font-medium text-slate-900 placeholder:italic placeholder:text-slate-400 focus:outline-none"
      />
      {query && (
        <button
          type="button"
          onClick={() => onQuery('')}
          className="pb-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 hover:text-slate-900"
        >
          Clear
        </button>
      )}
      <SearchIcon className="mb-0.5 h-4 w-4 shrink-0 text-slate-900" />
    </div>
  );
}

function Field({ label, allLabel, value, options, onChange }: FieldProps) {
  const items = optionList(allLabel, options);
  const current = items.find((i) => i.value === value) ?? items[0];
  return (
    <Dropdown
      trigger={({ open, toggle }) => (
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
          <button
            type="button"
            onClick={toggle}
            className={cn(
              'flex w-full items-baseline justify-between gap-3 border-b pb-1.5 text-left transition',
              open ? 'border-blue-500' : 'border-slate-300 hover:border-blue-500',
            )}
          >
            <span
              className={cn(
                'truncate text-[17px] tracking-tight',
                value === 'ALL' ? 'font-medium text-slate-400' : 'font-semibold text-slate-900',
              )}
            >
              {current.label}
            </span>
            {open ? <Minus className="h-3.5 w-3.5 shrink-0 text-slate-900" /> : <Plus className="h-3.5 w-3.5 shrink-0 text-slate-900" />}
          </button>
        </div>
      )}
    >
      {(close) => (
        <div className={cn('absolute left-0 right-0 top-full z-50 mt-2 max-h-64 overflow-y-auto', MENU)}>
          {items.map((item, i) => (
            <MenuItem
              key={item.value}
              index={i}
              selected={item.value === value}
              onClick={() => {
                onChange(item.value);
                close();
              }}
            >
              {item.label}
            </MenuItem>
          ))}
        </div>
      )}
    </Dropdown>
  );
}

function Summary({ shown, total, onReset }: SummaryProps) {
  return (
    <p className="border-t border-slate-200 pt-4 text-[13px] text-slate-500">
      <span className="font-semibold text-slate-900">{shown}</span> of {total} records shown —{' '}
      <button
        type="button"
        onClick={onReset}
        className="font-semibold text-blue-600 underline decoration-blue-200 underline-offset-4 transition hover:decoration-blue-600"
      >
        reset filters
      </button>
    </p>
  );
}

export const editorialKit: DesignKit = {
  canvas: 'rounded-[28px] border border-slate-200/70 bg-[#fcfcfd] px-5 py-8 sm:px-10 sm:py-10',
  headerCard: 'border-b-2 border-slate-900 pb-7',
  title: 'text-[40px] font-semibold leading-[0.95] tracking-[-0.035em] text-slate-900 sm:text-[48px]',
  subtitle: 'mt-3 max-w-xl text-[13px] text-slate-500',
  filterCard: 'space-y-8 border-b border-slate-200 py-8',
  fieldGrid: 'gap-8',
  tableWrap: 'pt-8',
  table: 'editorial',
  Toolbar,
  StatusTabs,
  Search,
  Field,
  Summary,
};
