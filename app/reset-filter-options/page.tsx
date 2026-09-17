'use client';

import React, { useState } from 'react';
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
import {
  CheckBadge,
  FilterSelect,
  LIFTED_ACTIVE,
  MENU_SURFACE,
  Popover,
} from '@/components/individual/DirectoryControls';

/* ========================================================================== */
/* Scratch page: where the Reset filters button should sit.                   */
/* Everything else — search box, tabs, toolbar dock, filter row — is a copy   */
/* of the live directory and does not change between options.                 */
/* ========================================================================== */

type PlacementId = 'current' | 'compact' | 'dock' | 'pairedWithFilter' | 'filterRow' | 'summary';

const PLACEMENTS: {
  id: PlacementId;
  name: string;
  hint: string;
  /** Still reachable while the filter panel is collapsed? */
  reachableWhenCollapsed: boolean;
  notes: string[];
}[] = [
  {
    id: 'current',
    name: '1 · Current',
    hint: 'Right of the search box, full rose outline. Mounts only once a filter or search term is set.',
    reachableWhenCollapsed: true,
    notes: ['Steals ~130px from the search box when it appears'],
  },
  {
    id: 'compact',
    name: '2 · Same spot, icon only',
    hint: 'Identical position, but the label is dropped below xl so it is a 44px square with a tooltip.',
    reachableWhenCollapsed: true,
    notes: ['Gives the search box ~90px back', 'Label returns on wide screens'],
  },
  {
    id: 'dock',
    name: '3 · Toolbar dock',
    hint: 'Joins Reload / Filter / Columns / Export as the last item, always rendered and disabled when there is nothing to clear.',
    reachableWhenCollapsed: true,
    notes: ['Search box never resizes', 'Sits with the other verbs', 'Dock gets wider'],
  },
  {
    id: 'pairedWithFilter',
    name: '4 · Paired with Filter',
    hint: 'Icon-only, directly after the Filter button behind a hairline divider — set filters and undo them in one place.',
    reachableWhenCollapsed: true,
    notes: ['Shortest travel from Filter', 'Costs only 30px of dock width'],
  },
  {
    id: 'filterRow',
    name: '5 · End of the filter row',
    hint: 'Right-aligned under the four selects, next to the controls it actually clears.',
    reachableWhenCollapsed: false,
    notes: ['Closest to what it resets', 'Unreachable while the panel is collapsed'],
  },
  {
    id: 'summary',
    name: '6 · Result summary line',
    hint: 'A thin line under the tabs that only appears when filters bite: what is applied, and Reset at the end.',
    reachableWhenCollapsed: true,
    notes: ['States how many filters are on', 'Adds a row when filtering'],
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

const GENDER_OPTIONS = ['Male', 'Female'];
const MARITAL_OPTIONS = ['Single', 'Married', 'Divorced'];
const NATIONALITY_OPTIONS = ['Cambodian', 'British', 'Japanese', 'Singaporean'];
const REQUEST_TYPE_OPTIONS = ['New Account', 'Update Profile', 'Close Account'];

/* -------------------------------------------------------------------------- */
/* Unchanged pieces, copied from the live directory                           */
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
                layoutId="reset-options-tab"
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

/** The search group exactly as it ships today — identical in every option. */
function SearchGroup({
  term,
  onTerm,
  field,
  onField,
}: {
  term: string;
  onTerm: (v: string) => void;
  field: string;
  onField: (v: string) => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const active = SEARCH_FIELDS.find((f) => f.id === field) ?? SEARCH_FIELDS[0];

  return (
    <div className="flex h-11 w-full items-center gap-1.5 rounded-xl border border-slate-200 bg-white pl-2 pr-1.5 transition focus-within:border-slate-400 lg:max-w-lg">
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

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function ResetFilterOptionsPage() {
  const [placement, setPlacement] = useState<PlacementId>('current');

  // Seeded to match the screenshot, so Reset is live the moment the page loads
  const [gender, setGender] = useState('Female');
  const [marital, setMarital] = useState('ALL');
  const [nationality, setNationality] = useState('British');
  const [requestType, setRequestType] = useState('Close Account');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState('all');
  const [statusTab, setStatusTab] = useState('ALL');
  const [showFilterPanel, setShowFilterPanel] = useState(true);

  const filters = [
    { id: 'gender', label: 'Gender', value: gender, set: setGender, options: GENDER_OPTIONS },
    { id: 'marital', label: 'Marital Status', value: marital, set: setMarital, options: MARITAL_OPTIONS },
    { id: 'nationality', label: 'Nationality', value: nationality, set: setNationality, options: NATIONALITY_OPTIONS },
    { id: 'requestType', label: 'Request Type', value: requestType, set: setRequestType, options: REQUEST_TYPE_OPTIONS },
  ];

  const activeFilterCount = filters.filter((f) => f.value !== 'ALL').length;
  const hasActiveFilters = activeFilterCount > 0;
  const canReset = hasActiveFilters || searchTerm.length > 0;

  const resetAll = () => {
    setGender('ALL');
    setMarital('ALL');
    setNationality('ALL');
    setRequestType('ALL');
    setSearchTerm('');
  };

  const current = PLACEMENTS.find((p) => p.id === placement) ?? PLACEMENTS[0];

  /* --- The Reset button, drawn to suit wherever it is standing --- */

  /** Option 1 — today's button: 44px tall, rose outline, beside the search box. */
  const resetBesideSearch = (iconOnly: boolean) =>
    canReset ? (
      <button
        type="button"
        onClick={resetAll}
        title="Reset filters"
        aria-label="Reset filters"
        className={cn(
          'inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-rose-200 bg-white text-xs font-semibold text-rose-600 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700',
          iconOnly ? 'w-11 xl:w-auto xl:px-3.5' : 'px-3.5'
        )}
      >
        <RotateCcw className="h-3.5 w-3.5" />
        <span className={iconOnly ? 'hidden xl:inline' : undefined}>Reset filters</span>
      </button>
    ) : null;

  /** Options 3 and 4 — inside the dock, so it never resizes the search box. */
  const resetInDock = (iconOnly: boolean) => (
    <button
      type="button"
      onClick={resetAll}
      disabled={!canReset}
      title="Reset filters"
      aria-label="Reset filters"
      className={cn(
        'inline-flex h-[30px] cursor-pointer items-center gap-1.5 rounded-lg text-xs font-semibold text-rose-600 transition hover:bg-white hover:text-rose-700 disabled:cursor-default disabled:text-slate-400 disabled:hover:bg-transparent',
        iconOnly ? 'w-[30px] justify-center px-0' : 'px-3'
      )}
    >
      <RotateCcw className="h-4 w-4 shrink-0" />
      {!iconOnly && <span>Reset</span>}
    </button>
  );

  /** Options 5 and 6 — a quiet text button, since it is already next to its context. */
  const resetAsLink = (
    <button
      type="button"
      onClick={resetAll}
      disabled={!canReset}
      className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 hover:text-rose-700 disabled:cursor-default disabled:text-slate-400 disabled:hover:bg-transparent"
    >
      <RotateCcw className="h-3.5 w-3.5" />
      Reset filters
    </button>
  );

  const shownCount = Math.max(1, 18 - activeFilterCount * 2 - (searchTerm ? 3 : 0));

  return (
    <main className="min-h-screen bg-[#eef2f7] px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-[1400px]">
        <h1 className="text-[15px] font-semibold tracking-tight text-slate-900">
          Reset filters — keep it, or move it
        </h1>
        <p className="mt-1.5 text-[11.5px] text-slate-500">
          Only the Reset button changes between options. The search box, tabs, toolbar and filter row are the live ones,
          untouched. Change a filter or type in the box to make Reset live.
        </p>

        {/* Placement switcher */}
        <div className="mt-5 flex flex-wrap gap-1 rounded-2xl bg-white p-1 shadow-sm ring-1 ring-slate-200">
          {PLACEMENTS.map((item) => {
            const isOn = item.id === placement;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={isOn}
                onClick={() => setPlacement(item.id)}
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

        <div className="mt-3 flex flex-wrap items-start gap-x-4 gap-y-1.5">
          <p className="max-w-2xl text-[11.5px] text-slate-500">{current.hint}</p>
          <div className="flex flex-wrap gap-1.5">
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2.5 py-1 text-[10.5px] font-semibold ring-1',
                current.reachableWhenCollapsed
                  ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                  : 'bg-amber-50 text-amber-700 ring-amber-200'
              )}
            >
              {current.reachableWhenCollapsed ? 'Reachable with panel closed' : 'Hidden when panel is closed'}
            </span>
            {current.notes.map((n) => (
              <span
                key={n}
                className="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-[10.5px] font-semibold text-slate-600 ring-1 ring-slate-200"
              >
                {n}
              </span>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowFilterPanel((v) => !v)}
          className="mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200 transition hover:text-slate-900"
        >
          {showFilterPanel ? 'Collapse the filter panel' : 'Expand the filter panel'} — to check Reset is still reachable
        </button>

        {/* ===================== The directory card ===================== */}
        <div className="relative z-30 mt-5 space-y-5 rounded-[20px] border border-slate-200/60 bg-white p-5 shadow-[0_10px_40px_-28px_rgba(15,23,42,0.35)] sm:p-6">
          {/* Row 1: identity + toolbar dock + primary action */}
          <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-[26px] font-semibold tracking-tight text-slate-900">Individual Directory</h2>
              <p className="mt-1 text-xs text-slate-500">
                Manage individual client onboarding, document verification, authorization lifecycle, and trading
                profiles.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
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
                  onClick={() => setShowFilterPanel(!showFilterPanel)}
                  aria-expanded={showFilterPanel}
                  className={cn(
                    'inline-flex h-[30px] cursor-pointer items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-all',
                    showFilterPanel
                      ? cn(LIFTED_ACTIVE, 'text-blue-600')
                      : hasActiveFilters
                        ? 'bg-white text-blue-700 ring-1 ring-inset ring-blue-200 hover:ring-blue-300'
                        : 'text-slate-600 hover:bg-white hover:text-slate-900'
                  )}
                >
                  <Filter className="h-4 w-4 shrink-0" />
                  <span>Filter</span>
                  {hasActiveFilters && (
                    <span className="grid h-[18px] min-w-[18px] place-items-center rounded-full bg-blue-100 px-1 text-[10px] font-semibold leading-none tabular-nums text-blue-700">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                {/* Option 4: Reset tucked in right after Filter, behind a hairline */}
                {placement === 'pairedWithFilter' && (
                  <>
                    <span className="h-5 w-px shrink-0 bg-slate-200" />
                    {resetInDock(true)}
                  </>
                )}

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

                {/* Option 3: Reset as the dock's last item */}
                {placement === 'dock' && (
                  <>
                    <span className="h-5 w-px shrink-0 bg-slate-200" />
                    {resetInDock(false)}
                  </>
                )}
              </div>

              <button
                type="button"
                className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-xl bg-blue-500 px-3.5 text-xs font-semibold text-white shadow-md shadow-blue-500/30 transition hover:bg-blue-600"
              >
                <Plus className="h-5 w-5" />
                <span>Add New</span>
              </button>
            </div>
          </div>

          {/* Row 2: status tabs + search (+ Reset, for options 1 and 2) */}
          <div className="flex flex-col items-stretch justify-between gap-3 lg:flex-row lg:items-center">
            <StatusTabs value={statusTab} onChange={setStatusTab} />

            <div className="flex w-full flex-col items-stretch gap-2 sm:flex-row sm:items-center lg:w-auto lg:flex-1 lg:justify-end">
              <SearchGroup term={searchTerm} onTerm={setSearchTerm} field={searchBy} onField={setSearchBy} />
              {placement === 'current' && resetBesideSearch(false)}
              {placement === 'compact' && resetBesideSearch(true)}
            </div>
          </div>

          {/* Option 6: a result summary line that only shows while filters bite */}
          {placement === 'summary' && canReset && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 px-3.5 py-2">
              <p className="text-[11.5px] font-medium text-slate-600">
                Showing <span className="font-semibold tabular-nums text-slate-900">{shownCount}</span> of 18 ·{' '}
                <span className="font-semibold tabular-nums text-slate-900">{activeFilterCount}</span>{' '}
                {activeFilterCount === 1 ? 'filter' : 'filters'} applied
                {searchTerm ? ' · search active' : ''}
              </p>
              {resetAsLink}
            </div>
          )}

          {/* Row 3: the four selects (+ Reset, for option 5) */}
          {showFilterPanel && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
                {filters.map((f) => (
                  <FilterSelect key={f.id} label={f.label} value={f.value} options={f.options} onChange={f.set} />
                ))}
              </div>
              {placement === 'filterRow' && <div className="flex justify-end">{resetAsLink}</div>}
            </div>
          )}
        </div>

        {/* A stand-in for the table, so the card is not floating on its own */}
        <div className="mt-5 rounded-[20px] border border-slate-200/60 bg-white p-6 shadow-[0_10px_40px_-28px_rgba(15,23,42,0.35)]">
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-2.5 w-10 rounded-full bg-slate-100" />
                <div className="h-2.5 w-40 rounded-full bg-slate-100" />
                <div className="h-2.5 flex-1 rounded-full bg-slate-50" />
                <div className="h-2.5 w-24 rounded-full bg-slate-100" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
