'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Clock,
  Columns,
  Download,
  Filter,
  LayoutList,
  Plus,
  RotateCcw,
  RotateCw,
  Search,
  X,
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { CheckBadge, LIFTED_ACTIVE, MENU_SURFACE, Popover } from '@/components/individual/DirectoryControls';

/* ========================================================================== */
/* Scratch page: should the search + Reset row match the width of the toolbar  */
/* row above it? Each option is measured live, so the gap is a number rather   */
/* than a guess. Only the widths and the badge behaviour change between them.  */
/* ========================================================================== */

type OptionId = 'shipped' | 'nudge' | 'reserved' | 'block';

const OPTIONS: { id: OptionId; name: string; hint: string; cost: string }[] = [
  {
    id: 'shipped',
    name: 'A · As shipped',
    hint: 'Search fixed at 380px. Right edges align, left edges do not. The dock also grows when the Filter badge appears.',
    cost: 'No change',
  },
  {
    id: 'nudge',
    name: 'B · 400px nudge',
    hint: 'Search widened to 400px so the two rows land within a couple of px at xl — by coincidence, not by construction.',
    cost: 'One class',
  },
  {
    id: 'reserved',
    name: 'C · 400px + reserved badge',
    hint: 'Same 400px, but the Filter count badge always occupies its space, so the dock stops jumping when filters apply.',
    cost: 'One class + badge tweak',
  },
  {
    id: 'block',
    name: 'D · One block (grid)',
    hint: 'Both rows become items of one fit-content grid, so the narrower row stretches to the wider one. Tabs move to their own row.',
    cost: 'Restructure — tabs move',
  },
];

const SEARCH_FIELDS = [
  { id: 'all', label: 'ALL FIELDS', placeholder: 'RUN ID SEARCH' },
  { id: 'customerName', label: 'CUSTOMER NAME', placeholder: 'SEARCH CUSTOMER NAME' },
  { id: 'accountNo', label: 'ACCOUNT NO', placeholder: 'SEARCH ACCOUNT NO' },
];

const STATUS_TABS = [
  { id: 'ALL', label: 'All', count: 18, icon: LayoutList, iconColor: 'text-blue-600' },
  { id: 'Pending', label: 'Pending', count: 2, icon: Clock, iconColor: 'text-yellow-500' },
  { id: 'Resubmit', label: 'Resubmit', count: 1, icon: AlertCircle, iconColor: 'text-orange-600' },
  { id: 'Approved', label: 'Approved', count: 12, icon: CheckCircle2, iconColor: 'text-emerald-500' },
  { id: 'Rejected', label: 'Rejected', count: 3, icon: AlertTriangle, iconColor: 'text-rose-500' },
];

/* -------------------------------------------------------------------------- */
/* Pieces                                                                     */
/* -------------------------------------------------------------------------- */

function StatusTabs({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  return (
    <div className="inline-flex max-w-full flex-wrap items-center gap-1 rounded-xl border border-slate-200/60 bg-slate-50 p-1">
      {STATUS_TABS.map((tab) => {
        const isActive = value === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'group relative inline-flex h-[30px] cursor-pointer select-none items-center gap-2 whitespace-nowrap rounded-lg px-3.5 text-[13px] transition-colors',
              isActive ? 'font-semibold text-blue-600' : 'font-medium text-slate-600 hover:text-slate-900'
            )}
          >
            {isActive && (
              <motion.span
                layoutId="align-options-tab"
                className={cn('absolute inset-0 rounded-lg', LIFTED_ACTIVE)}
                transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
              />
            )}
            <Icon
              className={cn(
                'relative h-4 w-4 shrink-0 stroke-[2.2] transition-colors',
                isActive || tab.id !== 'ALL' ? tab.iconColor : 'text-slate-400 group-hover:text-slate-600'
              )}
            />
            <span className="relative">{tab.label}</span>
            <span
              className={cn(
                'relative min-w-[22px] rounded-full px-1.5 py-[3px] text-center text-[11px] font-semibold tabular-nums leading-none transition-colors',
                isActive ? 'bg-blue-50 text-blue-600' : 'bg-slate-200/60 text-slate-500 group-hover:bg-slate-200'
              )}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** The toolbar dock. `reserveBadge` keeps the count's space even when it is hidden. */
function ToolbarDock({
  filtersOn,
  filterOpen,
  onToggleFilter,
  reserveBadge,
}: {
  filtersOn: boolean;
  filterOpen: boolean;
  onToggleFilter: () => void;
  reserveBadge: boolean;
}) {
  const badge = (
    <span
      aria-hidden={!filtersOn}
      className={cn(
        'grid h-[18px] min-w-[18px] place-items-center rounded-full bg-blue-100 px-1 text-[10px] font-semibold leading-none tabular-nums text-blue-700 transition-opacity',
        !filtersOn && 'opacity-0'
      )}
    >
      {filtersOn ? 3 : 0}
    </span>
  );

  return (
    <div className="inline-flex h-10 items-center gap-1 rounded-xl border border-slate-200/70 bg-slate-50 p-1">
      <button
        type="button"
        className="inline-flex h-[30px] cursor-pointer items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-slate-600 transition hover:bg-white hover:text-slate-900"
      >
        <RotateCw className="h-4 w-4 shrink-0" />
        <span>Reload</span>
      </button>

      <button
        type="button"
        onClick={onToggleFilter}
        aria-expanded={filterOpen}
        className={cn(
          'inline-flex h-[30px] cursor-pointer items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-all',
          filterOpen
            ? cn(LIFTED_ACTIVE, 'text-blue-600')
            : filtersOn
              ? 'bg-white text-blue-700 ring-1 ring-inset ring-blue-200 hover:ring-blue-300'
              : 'text-slate-600 hover:bg-white hover:text-slate-900'
        )}
      >
        <Filter className="h-4 w-4 shrink-0" />
        <span>Filter</span>
        {/* The 24px that makes the dock an unstable ruler — unless its space is reserved */}
        {reserveBadge ? badge : filtersOn ? badge : null}
      </button>

      <button
        type="button"
        className="inline-flex h-[30px] cursor-pointer items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-slate-600 transition hover:bg-white hover:text-slate-900"
      >
        <Columns className="h-4 w-4 shrink-0" />
        <span>Columns</span>
      </button>

      <button
        type="button"
        className="inline-flex h-[30px] cursor-pointer items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-slate-600 transition hover:bg-white hover:text-slate-900"
      >
        <Download className="h-4 w-4 shrink-0" />
        <span>Export</span>
      </button>
    </div>
  );
}

function AddNewButton() {
  return (
    <button
      type="button"
      className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-xl bg-blue-500 px-3.5 text-xs font-semibold text-white shadow-md shadow-blue-500/30 transition hover:bg-blue-600"
    >
      <Plus className="h-5 w-5" />
      <span>Add New</span>
    </button>
  );
}

/** The live search group; `widthClass` is the only thing the options change. */
function SearchGroup({
  widthClass,
  term,
  onTerm,
  field,
  onField,
}: {
  widthClass: string;
  term: string;
  onTerm: (v: string) => void;
  field: string;
  onField: (v: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const active = SEARCH_FIELDS.find((f) => f.id === field) ?? SEARCH_FIELDS[0];

  return (
    <div
      className={cn(
        'flex h-11 w-full items-center gap-1.5 rounded-xl border border-slate-200 bg-white pl-2 pr-1.5 transition focus-within:border-slate-400',
        widthClass
      )}
    >
      <Popover
        className="shrink-0"
        trigger={({ open, toggle }) => (
          <button
            type="button"
            onClick={toggle}
            aria-expanded={open}
            className="inline-flex h-8 cursor-pointer select-none items-center gap-1 rounded-lg px-2.5 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            {active.label}
            <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')} />
          </button>
        )}
      >
        {(close) => (
          <div className={cn('absolute left-0 top-full z-50 mt-3 w-60', MENU_SURFACE)}>
            {SEARCH_FIELDS.map((opt) => {
              const selected = field === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    onField(opt.id);
                    close();
                    inputRef.current?.focus();
                  }}
                  className={cn(
                    'flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider transition',
                    selected ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
                  )}
                >
                  {opt.label}
                  {selected && <CheckBadge />}
                </button>
              );
            })}
          </div>
        )}
      </Popover>

      <span className="h-5 w-px shrink-0 bg-slate-200" />

      <input
        ref={inputRef}
        type="text"
        size={1}
        value={term}
        onChange={(e) => onTerm(e.target.value)}
        placeholder={active.placeholder}
        enterKeyHint="search"
        className="min-w-0 flex-1 bg-transparent px-1.5 text-xs font-semibold uppercase tracking-wide text-slate-800 placeholder:text-slate-400 focus:outline-none"
      />

      {term && (
        <button
          type="button"
          onClick={() => {
            onTerm('');
            inputRef.current?.focus();
          }}
          aria-label="Clear search"
          className="grid h-7 w-7 shrink-0 cursor-pointer place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.focus()}
        aria-label="Search"
        className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-lg bg-slate-100 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600 active:scale-95"
      >
        <Search className="h-4 w-4" />
      </button>
    </div>
  );
}

/** Reset as it now ships: square below xl, labelled from xl up. */
function ResetButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Reset filters"
      aria-label="Reset filters"
      className="inline-flex h-11 w-full shrink-0 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-rose-200 bg-white px-3.5 text-xs font-semibold text-rose-600 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 sm:w-11 sm:px-0 xl:w-auto xl:px-3.5"
    >
      <RotateCcw className="h-3.5 w-3.5" />
      <span className="inline sm:hidden xl:inline">Reset filters</span>
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function RowAlignmentOptionsPage() {
  const [option, setOption] = useState<OptionId>('shipped');
  const [filtersOn, setFiltersOn] = useState(true);
  const [guides, setGuides] = useState(true);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState('all');
  const [statusTab, setStatusTab] = useState('ALL');

  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [sizes, setSizes] = useState({ top: 0, bottom: 0 });

  // Measure both rows so the gap is a number, not a judgement call
  useEffect(() => {
    const measure = () => {
      setSizes({
        top: topRef.current?.getBoundingClientRect().width ?? 0,
        bottom: bottomRef.current?.getBoundingClientRect().width ?? 0,
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (topRef.current) ro.observe(topRef.current);
    if (bottomRef.current) ro.observe(bottomRef.current);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [option, filtersOn, searchTerm]);

  const delta = Math.abs(Math.round(sizes.top) - Math.round(sizes.bottom));
  const aligned = delta <= 2;
  const current = OPTIONS.find((o) => o.id === option) ?? OPTIONS[0];

  const searchWidthClass =
    option === 'shipped'
      ? 'lg:w-[380px] lg:flex-none'
      : option === 'block'
        ? 'lg:min-w-[280px] lg:flex-1'
        : 'lg:w-[400px] lg:flex-none';

  const guideRing = guides ? 'outline outline-1 outline-dashed outline-blue-400/70 outline-offset-4' : '';

  const toolbarRow = (
    <div ref={topRef} className={cn('flex flex-wrap items-center gap-2', guideRing)}>
      <ToolbarDock
        filtersOn={filtersOn}
        filterOpen={showFilterPanel}
        onToggleFilter={() => setShowFilterPanel((v) => !v)}
        reserveBadge={option === 'reserved'}
      />
      <AddNewButton />
    </div>
  );

  const searchRow = (
    <div
      ref={bottomRef}
      className={cn(
        'flex w-full flex-col items-stretch gap-2 sm:flex-row sm:items-center lg:w-auto',
        guideRing
      )}
    >
      <SearchGroup
        widthClass={searchWidthClass}
        term={searchTerm}
        onTerm={setSearchTerm}
        field={searchBy}
        onField={setSearchBy}
      />
      <ResetButton onClick={() => setSearchTerm('')} />
    </div>
  );

  return (
    <main className="min-h-screen bg-[#eef2f7] px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-[1400px]">
        <h1 className="text-[15px] font-semibold tracking-tight text-slate-900">
          Toolbar row vs search row — width alignment
        </h1>
        <p className="mt-1.5 text-[11.5px] text-slate-500">
          Both rows are measured live. Toggle the Filter badge on and off to see which options survive it.
        </p>

        {/* Option switcher */}
        <div className="mt-5 flex flex-wrap gap-1 rounded-2xl bg-white p-1 shadow-sm ring-1 ring-slate-200">
          {OPTIONS.map((item) => {
            const isOn = item.id === option;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={isOn}
                onClick={() => setOption(item.id)}
                className={cn(
                  'cursor-pointer rounded-xl px-4 py-2 text-[12px] font-semibold transition',
                  isOn ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-slate-500 hover:text-slate-900'
                )}
              >
                {item.name}
              </button>
            );
          })}
        </div>

        {/* Live measurement + switches */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200">
            Toolbar row <span className="tabular-nums text-slate-900">{Math.round(sizes.top)}px</span>
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200">
            Search row <span className="tabular-nums text-slate-900">{Math.round(sizes.bottom)}px</span>
          </span>
          <span
            className={cn(
              'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold ring-1',
              aligned ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-amber-50 text-amber-700 ring-amber-200'
            )}
          >
            {aligned ? 'Aligned' : 'Off by'} <span className="tabular-nums">{delta}px</span>
          </span>

          <button
            type="button"
            onClick={() => setFiltersOn((v) => !v)}
            className={cn(
              'cursor-pointer rounded-full px-3 py-1.5 text-[11px] font-semibold ring-1 transition',
              filtersOn ? 'bg-blue-50 text-blue-700 ring-blue-200' : 'bg-white text-slate-500 ring-slate-200'
            )}
          >
            Filter badge: {filtersOn ? 'on' : 'off'}
          </button>
          <button
            type="button"
            onClick={() => setGuides((v) => !v)}
            className={cn(
              'cursor-pointer rounded-full px-3 py-1.5 text-[11px] font-semibold ring-1 transition',
              guides ? 'bg-slate-900 text-white ring-slate-900' : 'bg-white text-slate-500 ring-slate-200'
            )}
          >
            Guides: {guides ? 'on' : 'off'}
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <p className="max-w-3xl text-[11.5px] text-slate-500">{current.hint}</p>
          <span className="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-[10.5px] font-semibold text-slate-600 ring-1 ring-slate-200">
            {current.cost}
          </span>
        </div>

        {/* ===================== The directory card ===================== */}
        <div className="relative z-30 mt-6 space-y-5 rounded-[20px] border border-slate-200/60 bg-white p-5 shadow-[0_10px_40px_-28px_rgba(15,23,42,0.35)] sm:p-6">
          {option === 'block' ? (
            <>
              {/* One fit-content grid: the narrower row stretches to the wider one */}
              <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-start">
                <div>
                  <h2 className="text-[26px] font-semibold tracking-tight text-slate-900">Individual Directory</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Manage individual client onboarding, document verification, authorization lifecycle, and trading
                    profiles.
                  </p>
                </div>
                <div className="grid w-full gap-2 lg:w-fit lg:justify-items-stretch">
                  {toolbarRow}
                  {searchRow}
                </div>
              </div>
              <StatusTabs value={statusTab} onChange={setStatusTab} />
            </>
          ) : (
            <>
              {/* Row 1: identity + toolbar + primary action */}
              <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                  <h2 className="text-[26px] font-semibold tracking-tight text-slate-900">Individual Directory</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Manage individual client onboarding, document verification, authorization lifecycle, and trading
                    profiles.
                  </p>
                </div>
                {toolbarRow}
              </div>

              {/* Row 2: tabs + search + reset */}
              <div className="flex flex-col items-stretch justify-between gap-3 lg:flex-row lg:items-center">
                <StatusTabs value={statusTab} onChange={setStatusTab} />
                {searchRow}
              </div>
            </>
          )}

          {/* Table stand-in, so the rows are not floating */}
          <div className="space-y-3 rounded-2xl bg-slate-50/60 p-5">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-2.5 w-10 rounded-full bg-slate-200/70" />
                <div className="h-2.5 w-40 rounded-full bg-slate-200/70" />
                <div className="h-2.5 flex-1 rounded-full bg-slate-200/40" />
                <div className="h-2.5 w-24 rounded-full bg-slate-200/70" />
              </div>
            ))}
          </div>
        </div>

        <p className="mt-4 text-[11px] text-slate-400">
          Widths are measured at the current viewport. The Reset label only appears from xl up, so below that the search
          row is always the shorter of the two.
        </p>
      </div>
    </main>
  );
}
