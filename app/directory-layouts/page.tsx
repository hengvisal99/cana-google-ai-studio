'use client';

import React from 'react';
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
  Ruler,
  RotateCw,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CheckBadge, FilterSelect, LIFTED_ACTIVE, MENU_SURFACE, Popover } from '@/components/individual/DirectoryControls';
import { DirectoryTable } from '@/components/individual/list-variants/DirectoryTable';
import {
  FILTER_KEYS,
  FILTER_LABELS,
  SEARCH_FIELD_OPTIONS,
  useDirectory,
  type StatusKey,
} from '@/components/individual/list-variants/useDirectory';

const TITLE = 'Individual Directory';
const SUBTITLE =
  'Manage individual client onboarding, document verification, authorization lifecycle, and trading profiles.';

/** Same tabs, order and colours as the production list screen. */
const STATUS_TABS: { id: StatusKey; label: string; icon: React.ElementType; iconColor: string }[] = [
  { id: 'ALL', label: 'All', icon: LayoutList, iconColor: 'text-blue-600' },
  { id: 'Pending', label: 'Pending', icon: Clock, iconColor: 'text-yellow-500' },
  { id: 'Resubmit', label: 'Resubmit', icon: AlertCircle, iconColor: 'text-orange-600' },
  { id: 'Approved', label: 'Approved', icon: CheckCircle2, iconColor: 'text-emerald-500' },
  { id: 'Rejected', label: 'Rejected', icon: AlertTriangle, iconColor: 'text-rose-500' },
];

type Directory = ReturnType<typeof useDirectory>;

/* ================================================================== */
/* Shared controls — identical in all three layouts, so only the       */
/* arrangement differs between them.                                   */
/* ================================================================== */

/** Page title and subtitle, identical in all three layouts. */
function Heading() {
  return (
    <div>
      <h1 className="text-[26px] font-semibold tracking-tight text-slate-900">{TITLE}</h1>
      <p className="mt-1 text-xs text-slate-500">{SUBTITLE}</p>
    </div>
  );
}

/** The grouped Reload / Filter / Columns / Export dock from the current header. */
function ToolbarDock({
  filterOpen,
  onToggleFilter,
  activeFilterCount,
}: {
  filterOpen: boolean;
  onToggleFilter: () => void;
  activeFilterCount: number;
}) {
  return (
    <div className="inline-flex h-10 items-center gap-1 rounded-xl border border-slate-200/70 bg-slate-50 p-1">
      <DockButton icon={RotateCw} label="Reload" />
      <button
        type="button"
        onClick={onToggleFilter}
        aria-expanded={filterOpen}
        className={cn(
          'inline-flex h-[30px] cursor-pointer items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-all',
          filterOpen
            ? cn(LIFTED_ACTIVE, 'text-blue-600')
            : activeFilterCount > 0
              ? 'bg-white text-blue-700 ring-1 ring-inset ring-blue-200 hover:ring-blue-300'
              : 'text-slate-600 hover:bg-white hover:text-slate-900',
        )}
      >
        <Filter className="h-4 w-4 shrink-0" />
        <span>Filter</span>
        {activeFilterCount > 0 && (
          <span className="rounded-full bg-blue-100 px-1.5 text-[10px] font-bold tabular-nums text-blue-700">
            {activeFilterCount}
          </span>
        )}
      </button>
      <DockButton icon={Columns} label="Columns" />
      <DockButton icon={Download} label="Export" />
    </div>
  );
}

function DockButton({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <button
      type="button"
      className="inline-flex h-[30px] cursor-pointer items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-slate-600 transition hover:bg-white hover:text-slate-900"
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>{label}</span>
    </button>
  );
}

function AddNewButton() {
  return (
    <button
      type="button"
      className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700"
    >
      <Plus className="h-4 w-4" />
      Add New
    </button>
  );
}

function StatusTabs({ d }: { d: Directory }) {
  return (
    <div className="inline-flex max-w-full flex-wrap items-center gap-1 rounded-xl border border-slate-200/60 bg-slate-50 p-1">
      {STATUS_TABS.map((tab) => {
        const isActive = d.status === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => d.setStatus(tab.id)}
            className={cn(
              'group inline-flex h-[30px] cursor-pointer select-none items-center gap-2 whitespace-nowrap rounded-lg px-3.5 text-[13px] transition-colors',
              isActive ? cn(LIFTED_ACTIVE, 'font-semibold text-blue-600') : 'font-medium text-slate-600 hover:text-slate-900',
            )}
          >
            <Icon
              className={cn(
                'h-4 w-4 shrink-0 stroke-[2.2] transition-colors',
                isActive || tab.id !== 'ALL' ? tab.iconColor : 'text-slate-400 group-hover:text-slate-600',
              )}
            />
            <span>{tab.label}</span>
            <span
              className={cn(
                'min-w-[22px] rounded-full px-1.5 py-[3px] text-center text-[11px] font-semibold leading-none tabular-nums transition-colors',
                isActive ? 'bg-blue-50 text-blue-600' : 'bg-slate-200/60 text-slate-500 group-hover:bg-slate-200',
              )}
            >
              {d.counts[tab.id]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function SearchBox({ d, className }: { d: Directory; className?: string }) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const field = SEARCH_FIELD_OPTIONS.find((o) => o.id === d.searchBy) ?? SEARCH_FIELD_OPTIONS[0];

  return (
    <div
      className={cn(
        'flex h-11 items-center gap-1.5 rounded-xl border border-slate-200 bg-white pl-2 pr-1.5 transition focus-within:border-slate-400',
        className,
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
            {field.label}
            <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')} />
          </button>
        )}
      >
        {(close) => (
          <div className={cn('absolute left-0 top-full z-50 mt-3 w-60', MENU_SURFACE)}>
            {SEARCH_FIELD_OPTIONS.map((opt) => {
              const isSelected = d.searchBy === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    d.setSearchBy(opt.id);
                    close();
                    inputRef.current?.focus();
                  }}
                  className={cn(
                    'flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider transition',
                    isSelected ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50',
                  )}
                >
                  {opt.label}
                  {isSelected && <CheckBadge />}
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
        value={d.query}
        onChange={(e) => d.setQuery(e.target.value)}
        placeholder={field.placeholder}
        className="min-w-0 flex-1 bg-transparent px-1.5 text-xs font-semibold uppercase tracking-wide text-slate-800 placeholder:text-slate-400 focus:outline-none"
      />
      {d.query && (
        <button
          type="button"
          onClick={() => d.setQuery('')}
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
        className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
      >
        <Search className="h-4 w-4" />
      </button>
    </div>
  );
}

/** The four always-visible dropdowns, as they appear today. */
function FilterRow({ d }: { d: Directory }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {FILTER_KEYS.map((key) => (
        <FilterSelect
          key={key}
          label={FILTER_LABELS[key]}
          value={d.filters[key]}
          options={d.options[key]}
          onChange={(value) => d.setFilter(key, value)}
        />
      ))}
    </div>
  );
}

/* ================================================================== */
/* Option C only — filters in a popover, applied filters as chips      */
/* ================================================================== */

function FilterPopover({ d }: { d: Directory }) {
  return (
    <Popover
      trigger={({ open, toggle }) => (
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          className={cn(
            'inline-flex h-11 cursor-pointer items-center gap-1.5 rounded-xl border px-3.5 text-xs font-semibold transition',
            open || d.activeFilterCount > 0
              ? 'border-blue-200 bg-blue-50 text-blue-700'
              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900',
          )}
        >
          <Filter className="h-4 w-4 shrink-0" />
          <span>Filter</span>
          {d.activeFilterCount > 0 && (
            <span className="rounded-full bg-blue-100 px-1.5 text-[10px] font-bold tabular-nums text-blue-700">
              {d.activeFilterCount}
            </span>
          )}
        </button>
      )}
    >
      {(close) => (
        <div className={cn('absolute right-0 top-full z-50 mt-2 w-[320px] space-y-3 p-4', MENU_SURFACE)}>
          {FILTER_KEYS.map((key) => (
            <div key={key} className="space-y-1.5">
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                {FILTER_LABELS[key]}
              </p>
              <FilterSelect
                label={FILTER_LABELS[key]}
                value={d.filters[key]}
                options={d.options[key]}
                onChange={(value) => d.setFilter(key, value)}
              />
            </div>
          ))}
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                d.reset();
                close();
              }}
              className="h-9 cursor-pointer rounded-lg px-3 text-xs font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={close}
              className="h-9 cursor-pointer rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white transition hover:bg-blue-700"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </Popover>
  );
}

/** Only the filters actually set, each removable. Renders nothing when none are. */
function FilterChips({ d }: { d: Directory }) {
  const active = FILTER_KEYS.filter((k) => d.filters[k] !== 'ALL');
  if (active.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 px-5 py-3 sm:px-6">
      <span className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-slate-400">Filtered by</span>
      {active.map((key) => (
        <span
          key={key}
          className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 py-1 pl-3 pr-1.5 text-[12px] font-medium text-blue-700"
        >
          {FILTER_LABELS[key]}: <b className="font-semibold">{d.filters[key]}</b>
          <button
            type="button"
            onClick={() => d.setFilter(key, 'ALL')}
            aria-label={`Remove ${FILTER_LABELS[key]} filter`}
            className="grid h-4 w-4 cursor-pointer place-items-center rounded-full text-blue-500 transition hover:bg-blue-100 hover:text-blue-700"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={d.reset}
        className="cursor-pointer text-[12px] text-slate-500 underline underline-offset-4 transition hover:text-slate-800"
      >
        Clear all
      </button>
    </div>
  );
}

/* ================================================================== */
/* A — two cards (current)                                             */
/* ================================================================== */

function LayoutTwoCards({ d }: { d: Directory }) {
  const [filterOpen, setFilterOpen] = React.useState(true);

  return (
    <div className="space-y-5">
      <div className="relative z-30 rounded-[20px] border border-slate-200/60 bg-white p-6 shadow-[0_10px_40px_-28px_rgba(15,23,42,0.35)]">
        <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
          <Heading />
          <div className="flex flex-wrap items-center gap-2">
            <ToolbarDock
              filterOpen={filterOpen}
              onToggleFilter={() => setFilterOpen((v) => !v)}
              activeFilterCount={d.activeFilterCount}
            />
            <AddNewButton />
          </div>
        </div>
      </div>

      <div className="relative z-20 space-y-5 rounded-[20px] border border-slate-200/60 bg-white p-5 shadow-[0_10px_40px_-28px_rgba(15,23,42,0.35)] sm:p-6">
        <div className="flex flex-col items-stretch justify-between gap-3 lg:flex-row lg:items-center">
          <StatusTabs d={d} />
          <SearchBox d={d} className="w-full lg:max-w-lg" />
        </div>
        {filterOpen && <FilterRow d={d} />}
      </div>

      <div className="relative z-10" data-table-anchor>
        <DirectoryTable rows={d.rows} skin="prism" />
      </div>
    </div>
  );
}

/* ================================================================== */
/* B — one card holding header + controls                              */
/* ================================================================== */

function LayoutOneCard({ d }: { d: Directory }) {
  const [filterOpen, setFilterOpen] = React.useState(true);

  return (
    <div className="space-y-5">
      <div className="relative z-20 space-y-5 rounded-[20px] border border-slate-200/60 bg-white p-6 shadow-[0_10px_40px_-28px_rgba(15,23,42,0.35)]">
        <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
          <Heading />
          <div className="flex flex-wrap items-center gap-2">
            <ToolbarDock
              filterOpen={filterOpen}
              onToggleFilter={() => setFilterOpen((v) => !v)}
              activeFilterCount={d.activeFilterCount}
            />
            <AddNewButton />
          </div>
        </div>

        <div className="border-t border-slate-100" />

        <div className="flex flex-col items-stretch justify-between gap-3 lg:flex-row lg:items-center">
          <StatusTabs d={d} />
          <SearchBox d={d} className="w-full lg:max-w-lg" />
        </div>
        {filterOpen && <FilterRow d={d} />}
      </div>

      <div className="relative z-10" data-table-anchor>
        <DirectoryTable rows={d.rows} skin="prism" />
      </div>
    </div>
  );
}

/* ================================================================== */
/* C — bare page header, one card for toolbar + table                  */
/* ================================================================== */

function LayoutToolbar({ d }: { d: Directory }) {
  return (
    <div className="space-y-5">
      {/* Page identity sits on the page background, not in a card */}
      <div className="flex flex-col items-start justify-between gap-4 px-1 lg:flex-row lg:items-center">
        <Heading />
        <AddNewButton />
      </div>

      <div className="overflow-hidden rounded-[20px] border border-slate-200/60 bg-white shadow-[0_10px_40px_-28px_rgba(15,23,42,0.35)]">
        <div className="flex flex-col items-stretch justify-between gap-3 px-5 py-4 sm:px-6 lg:flex-row lg:items-center">
          <StatusTabs d={d} />
          <div className="flex items-center gap-2">
            <SearchBox d={d} className="w-full lg:w-[320px]" />
            <FilterPopover d={d} />
            <div className="hidden items-center gap-1 sm:flex">
              <IconButton icon={RotateCw} label="Reload" />
              <IconButton icon={Columns} label="Columns" />
              <IconButton icon={Download} label="Export" />
            </div>
          </div>
        </div>

        <FilterChips d={d} />

        <div data-table-anchor>
          <DirectoryTable rows={d.rows} skin="aurora" />
        </div>
      </div>
    </div>
  );
}

function IconButton({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className="grid h-11 w-11 cursor-pointer place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

/* ================================================================== */
/* Page                                                                */
/* ================================================================== */

type Option = {
  id: string;
  letter: string;
  name: string;
  verdict: 'Current' | 'Not recommended' | 'Recommended';
  note: string;
  render: (d: Directory) => React.ReactNode;
};

const OPTIONS: Option[] = [
  {
    id: 'a',
    letter: 'A',
    name: 'Keep two cards',
    verdict: 'Current',
    note: 'Header card, filter card, table card. Clear separation — three shadows and three sets of padding before any data.',
    render: (d) => <LayoutTwoCards d={d} />,
  },
  {
    id: 'b',
    letter: 'B',
    name: 'Combine into one card',
    verdict: 'Not recommended',
    note: 'One box for title, actions, tabs, search and filters. Removes a border, but "Add New" ends up reading like a filter control.',
    render: (d) => <LayoutOneCard d={d} />,
  },
  {
    id: 'c',
    letter: 'C',
    name: 'Header on page, toolbar on table',
    verdict: 'Recommended',
    note: 'Title and Add New sit on the page background. One card owns tabs, search, filters and rows. Filters live in the Filter popover and come back as removable chips.',
    render: (d) => <LayoutToolbar d={d} />,
  },
];

const VERDICT_STYLE: Record<Option['verdict'], string> = {
  Current: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-100',
  'Not recommended': 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-100',
  Recommended: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-100',
};

/** Scratch page: three ways to arrange the chrome above the Individual list table. */
export default function DirectoryLayoutsPage() {
  const [activeId, setActiveId] = React.useState(OPTIONS[0].id);
  const [stackAll, setStackAll] = React.useState(false);
  const [measure, setMeasure] = React.useState(false);

  const active = OPTIONS.find((o) => o.id === activeId) ?? OPTIONS[0];
  const shown = stackAll ? OPTIONS : [active];

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="sticky top-0 z-50 border-b border-slate-200 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto max-w-[92rem] px-5 py-3.5 sm:px-8">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-white">
                <Sparkles className="h-4 w-4" />
              </span>
              <div className="leading-none">
                <h1 className="text-[15px] font-semibold tracking-tight text-slate-900">
                  Individual list — 3 layouts
                </h1>
                <p className="mt-1.5 text-[11.5px] text-slate-500">
                  Same controls and the same records in each. Only the arrangement above the table changes.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {OPTIONS.map((o) => {
                const isActive = !stackAll && o.id === activeId;
                return (
                  <button
                    key={o.id}
                    onClick={() => {
                      setActiveId(o.id);
                      setStackAll(false);
                    }}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[12px] font-semibold transition',
                      isActive
                        ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900',
                    )}
                  >
                    <span className="tabular-nums">{o.letter}.</span>
                    <span className="hidden sm:inline">{o.name}</span>
                  </button>
                );
              })}
              <button
                onClick={() => setStackAll((v) => !v)}
                className={cn(
                  'ml-1 rounded-xl border px-3 py-2 text-[12px] font-semibold transition',
                  stackAll
                    ? 'border-blue-500 bg-blue-500 text-white'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900',
                )}
              >
                Stack all
              </button>
              <button
                onClick={() => setMeasure((v) => !v)}
                title="Measure the height between the top of the screen and the table"
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[12px] font-semibold transition',
                  measure
                    ? 'border-orange-500 bg-orange-500 text-white'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900',
                )}
              >
                <Ruler className="h-3.5 w-3.5" />
                Measure chrome
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[92rem] space-y-12 px-4 py-6 sm:px-8 sm:py-8">
        {shown.map((o) => (
          <OptionSection key={o.id} option={o} measure={measure} />
        ))}
      </div>
    </main>
  );
}

function OptionSection({ option, measure }: { option: Option; measure: boolean }) {
  // Each layout owns its filtering state, so stacking them keeps the options independent.
  const d = useDirectory();

  return (
    <section id={option.id}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="text-[13px] font-semibold tabular-nums text-slate-400">{option.letter}</span>
        <h2 className="text-[15px] font-semibold tracking-tight text-slate-900">{option.name}</h2>
        <span className={cn('rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider', VERDICT_STYLE[option.verdict])}>
          {option.verdict}
        </span>
      </div>
      <p className="mt-1.5 max-w-3xl text-[12.5px] leading-relaxed text-slate-500">{option.note}</p>

      <div className="mt-4">
        <ChromeGauge enabled={measure}>{option.render(d)}</ChromeGauge>
      </div>
    </section>
  );
}

/**
 * Overlays the distance from the top of a layout to its table, so the three
 * options can be compared on the one thing that separates them: vertical cost.
 */
function ChromeGauge({ enabled, children }: { enabled: boolean; children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [height, setHeight] = React.useState(0);

  React.useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const read = () => {
      const anchor = root.querySelector('[data-table-anchor]');
      if (!anchor) return;
      setHeight(Math.round(anchor.getBoundingClientRect().top - root.getBoundingClientRect().top));
    };

    read();
    const observer = new ResizeObserver(read);
    observer.observe(root);
    return () => observer.disconnect();
  }, [children]);

  return (
    <div ref={ref} className="relative">
      {children}
      {enabled && height > 0 && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-40 rounded-t-[20px] border-b-2 border-dashed border-orange-500 bg-orange-500/10"
          style={{ height }}
        >
          <span className="absolute bottom-2 right-3 rounded-md bg-orange-500 px-2 py-1 text-[11px] font-semibold tabular-nums text-white shadow-sm">
            {height}px before the table
          </span>
        </div>
      )}
    </div>
  );
}
