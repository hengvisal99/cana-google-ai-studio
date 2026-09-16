'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Check, ChevronDown, Plus, RotateCcw, Search as SearchIcon, X } from 'lucide-react';
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
 * V6 — Prism Glass. Clean white cards: a labelled toolbar dock and status tabs
 * whose active state lifts as white with a soft shadow (blue only in text, so
 * Add New stays the one solid button), a search box with a search
 * button, plain fields, and a "Filters" header line holding Reset filters.
 */

const CARD_SHADOW = 'shadow-[0_10px_40px_-28px_rgba(15,23,42,0.35)]';
const MENU = 'rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10';
/** Elevated active state: raised white with a soft shadow. */
const LIFT = 'bg-white shadow-[0_4px_14px_-4px_rgba(15,23,42,0.18)]';

function CheckBadge() {
  return (
    <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-blue-500 text-white">
      <Check className="h-2.5 w-2.5" strokeWidth={3} />
    </span>
  );
}

function Toolbar({ filterOpen, onToggleFilter, activeFilterCount }: ToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="inline-flex items-center gap-1 rounded-xl border border-slate-200/70 bg-slate-50 p-1.5">
        {TOOLBAR_ACTIONS.map(({ key, label, icon: Icon }) => {
          const active = key === 'filter' && filterOpen;
          const filtered = key === 'filter' && activeFilterCount > 0;
          return (
            <button
              key={key}
              type="button"
              onClick={key === 'filter' ? onToggleFilter : undefined}
              className={cn(
                'relative inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-all',
                active
                  ? cn(LIFT, 'text-blue-600')
                  : filtered
                    ? // Panel closed but filters applied: outlined, so it reads as "on" without a second solid button.
                      'bg-white text-blue-700 ring-1 ring-inset ring-blue-200 hover:ring-blue-300'
                    : 'text-slate-600 hover:bg-white hover:text-slate-900',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="whitespace-nowrap">{label}</span>
              {filtered && (
                // Inline count: part of the button, so it reads the same with the panel open or closed.
                <span
                  aria-label={`${activeFilterCount} active filter${activeFilterCount === 1 ? '' : 's'}`}
                  className="grid h-[18px] min-w-[18px] place-items-center rounded-full bg-blue-100 px-1 text-[10px] font-semibold leading-none tabular-nums text-blue-700"
                >
                  {activeFilterCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        className="relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-blue-500 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:shadow-blue-500/50"
      >
        <Plus className="relative h-4 w-4" />
        <span className="relative">Add New</span>
      </button>
    </div>
  );
}

function StatusTabs({ value, onChange, counts }: StatusTabsProps) {
  const id = React.useId();
  return (
    // 34px tabs + 4px padding + 1px border each side = 44px, matching the search box and fields.
    <div className="inline-flex max-w-full flex-wrap items-center gap-1 rounded-xl border border-slate-200/60 bg-slate-50 p-1">
      {STATUS_TABS.map((tab) => {
        const active = value === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'group relative inline-flex h-[34px] items-center gap-2 whitespace-nowrap rounded-lg px-3.5 text-[13px] transition-colors',
              active ? 'font-semibold text-blue-600' : 'font-medium text-slate-600 hover:text-slate-900',
            )}
          >
            {active && (
              <motion.span
                layoutId={`prism-tab-${id}`}
                className={cn('absolute inset-0 rounded-lg', LIFT)}
                transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
              />
            )}
            <Icon className={cn('relative h-4 w-4 stroke-[2.2]', tab.color)} />
            <span className="relative">{tab.label}</span>
            <span
              className={cn(
                'relative min-w-[22px] rounded-full px-1.5 py-[3px] text-center text-[11px] font-semibold tabular-nums leading-none transition-colors',
                // Inactive: flat and quiet on the grey track, firming up on hover.
                active
                  ? 'bg-blue-50 text-blue-600'
                  : 'bg-slate-200/60 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700',
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
  const inputRef = React.useRef<HTMLInputElement>(null);
  return (
    // Plain search: same white box as the filter fields, no ring or pill emphasis.
    <div className="w-full">
      <div className="flex h-11 items-center gap-1.5 rounded-xl border border-slate-200 bg-white pl-2 pr-1.5 transition focus-within:border-slate-400">
        <Dropdown
          className="shrink-0"
          trigger={({ open, toggle }) => (
            <button
              type="button"
              onClick={toggle}
              className="inline-flex h-8 items-center gap-1 rounded-lg px-2.5 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              {field.label}
              <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')} />
            </button>
          )}
        >
          {(close) => (
            <div className={cn('absolute left-0 top-full z-50 mt-3 w-60', MENU)}>
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
                      'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider transition',
                      selected ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50',
                    )}
                  >
                    {opt.label}
                    {selected && <CheckBadge />}
                  </button>
                );
              })}
            </div>
          )}
        </Dropdown>
        <span className="h-5 w-px shrink-0 bg-slate-200" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder={field.placeholder}
          enterKeyHint="search"
          className="min-w-0 flex-1 bg-transparent px-1.5 text-xs font-semibold uppercase tracking-wide text-slate-800 placeholder:text-slate-400 focus:outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              onQuery('');
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            title="Clear search"
            className="grid h-7 w-7 shrink-0 cursor-pointer place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        {/* Results filter as you type; the button puts the cursor in the field. */}
        <button
          type="button"
          onClick={() => inputRef.current?.focus()}
          aria-label="Search"
          title="Search"
          className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-lg bg-slate-100 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600 active:scale-95"
        >
          <SearchIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function Field({ label, allLabel, value, options, onChange }: FieldProps) {
  const items = optionList(allLabel, options);
  const current = items.find((i) => i.value === value) ?? items[0];
  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-600">{label}</p>
      <Dropdown
        trigger={({ open, toggle }) => (
          // Plain field: looks the same whether or not a value is chosen.
          <button
            type="button"
            onClick={toggle}
            className={cn(
              'flex h-11 w-full items-center justify-between gap-2 rounded-xl border bg-white px-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40',
              open ? 'border-slate-400' : 'border-slate-200 hover:border-slate-300',
            )}
          >
            <span className="truncate text-xs font-medium text-slate-800">{current.label}</span>
            <ChevronDown className={cn('h-4 w-4 shrink-0 text-slate-400 transition-transform', open && 'rotate-180')} />
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
                    'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition',
                    isSelected ? 'bg-blue-50 font-semibold text-blue-700' : 'font-medium text-slate-700 hover:bg-slate-50',
                  )}
                >
                  {item.label}
                  {isSelected && <CheckBadge />}
                </button>
              );
            })}
          </div>
        )}
      </Dropdown>
    </div>
  );
}

/** "Filters" header line above the fields; Reset filters appears only when something is set. */
function Summary({ onReset, active }: SummaryProps) {
  // Fixed-height line: the label holds the space, so reset can appear without a jump.
  return (
    <div className="flex h-8 items-center justify-between">
      <p className="text-[13px] font-semibold text-slate-900">Filters</p>
      {active && (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 hover:text-rose-700"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset filters
        </button>
      )}
    </div>
  );
}

export const prismKit: DesignKit = {
  canvas: 'space-y-4 rounded-[24px] bg-slate-100/70 p-3 sm:p-6',
  headerCard: cn('rounded-[20px] border border-slate-200/60 bg-white p-6', CARD_SHADOW),
  title: 'text-[26px] font-semibold tracking-tight text-slate-900',
  subtitle: 'mt-1 text-xs text-slate-500',
  filterCard: cn('space-y-5 rounded-[20px] border border-slate-200/60 bg-white p-5 sm:p-6', CARD_SHADOW),
  fieldGrid: 'gap-4 sm:gap-6',
  resetPlacement: 'header',
  tableWrap: '',
  table: 'prism',
  Toolbar,
  StatusTabs,
  Search,
  Field,
  Summary,
};
