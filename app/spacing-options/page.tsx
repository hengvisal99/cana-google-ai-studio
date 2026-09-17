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
  RotateCcw,
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

const CARD = 'rounded-[20px] border border-slate-200/60 bg-white shadow-[0_10px_40px_-28px_rgba(15,23,42,0.35)]';

const STATUS_TABS: { id: StatusKey; label: string; icon: React.ElementType; iconColor: string }[] = [
  { id: 'ALL', label: 'All', icon: LayoutList, iconColor: 'text-blue-600' },
  { id: 'Pending', label: 'Pending', icon: Clock, iconColor: 'text-yellow-500' },
  { id: 'Resubmit', label: 'Resubmit', icon: AlertCircle, iconColor: 'text-orange-600' },
  { id: 'Approved', label: 'Approved', icon: CheckCircle2, iconColor: 'text-emerald-500' },
  { id: 'Rejected', label: 'Rejected', icon: AlertTriangle, iconColor: 'text-rose-500' },
];

type Directory = ReturnType<typeof useDirectory>;

/* ================================================================== */
/* The three rows — identical markup in every preset, so only the      */
/* spacing between them differs.                                       */
/* ================================================================== */

/** Row 1: title, toolbar dock, primary action. */
function RowIdentity() {
  return (
    <div data-row className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
      <div>
        <h1 className="text-[26px] font-semibold tracking-tight text-slate-900">Individual Directory</h1>
        <p className="mt-1 text-xs text-slate-500">
          Manage individual client onboarding, document verification, authorization lifecycle, and trading profiles.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex h-10 items-center gap-1 rounded-xl border border-slate-200/70 bg-slate-50 p-1">
          <DockButton icon={RotateCw} label="Reload" />
          <button
            type="button"
            className={cn(
              'inline-flex h-[30px] items-center gap-1.5 rounded-lg px-3 text-xs font-semibold',
              LIFTED_ACTIVE,
              'text-blue-600',
            )}
          >
            <Filter className="h-4 w-4 shrink-0" />
            <span>Filter</span>
          </button>
          <DockButton icon={Columns} label="Columns" />
          <DockButton icon={Download} label="Export" />
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

/** Row 2: status tabs, search, and the reset button that now sits beside it. */
function RowControls({ d }: { d: Directory }) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const field = SEARCH_FIELD_OPTIONS.find((o) => o.id === d.searchBy) ?? SEARCH_FIELD_OPTIONS[0];
  const canReset = d.activeFilterCount > 0 || d.query.length > 0;

  return (
    <div data-row className="flex flex-col items-stretch justify-between gap-3 lg:flex-row lg:items-center">
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
                  'h-4 w-4 shrink-0 stroke-[2.2]',
                  isActive || tab.id !== 'ALL' ? tab.iconColor : 'text-slate-400 group-hover:text-slate-600',
                )}
              />
              <span>{tab.label}</span>
              <span
                className={cn(
                  'min-w-[22px] rounded-full px-1.5 py-[3px] text-center text-[11px] font-semibold leading-none tabular-nums',
                  isActive ? 'bg-blue-50 text-blue-600' : 'bg-slate-200/60 text-slate-500',
                )}
              >
                {d.counts[tab.id]}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex w-full flex-col items-stretch gap-2 sm:flex-row sm:items-center lg:w-auto lg:flex-1 lg:justify-end">
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
            className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-lg bg-slate-100 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>

        {canReset && (
          <button
            type="button"
            onClick={d.reset}
            className="inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-rose-200 bg-white px-3.5 text-xs font-semibold text-rose-600 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset filters
          </button>
        )}
      </div>
    </div>
  );
}

/** Row 3: the four filter selects. */
function RowFilters({ d }: { d: Directory }) {
  return (
    <div data-row className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
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
/* Presets                                                             */
/* ================================================================== */

type Preset = {
  id: string;
  label: string;
  name: string;
  verdict: 'Current' | 'Recommended' | 'Too loose';
  gaps: string;
  note: string;
  /** Classes on the card itself. */
  card: string;
  /** Wrapper around rows 2 and 3, or null to leave them as direct children. */
  group: string | null;
};

const PRESETS: Preset[] = [
  {
    id: 'current',
    label: 'Flat',
    name: 'Flat — what is shipped now',
    verdict: 'Current',
    gaps: '20 / 20',
    note: 'space-y-5 on the card. Every row sits 20px from the next inside 24px of padding, so the rows are almost as far from each other as they are from the card edge — and nothing marks the title as a different kind of thing.',
    card: 'space-y-5 p-5 sm:p-6',
    group: null,
  },
  {
    id: 'grouped',
    label: 'Grouped',
    name: 'Grouped — one bigger gap under the title',
    verdict: 'Recommended',
    gaps: '28 / 20',
    note: 'Rows 2 and 3 move into their own space-y-5 wrapper with mt-7, and the card goes to p-6 sm:p-7. Tabs and filters stay tight because they are the same kind of thing; the title gets air instead of a divider. Costs 8px of height.',
    card: 'p-6 sm:p-7',
    group: 'mt-7 space-y-5',
  },
  {
    id: 'loose',
    label: 'Uniform loose',
    name: 'Uniform loose — every gap widened',
    verdict: 'Too loose',
    gaps: '28 / 28',
    note: 'space-y-7 everywhere. This is the option worth rejecting: widening all the gaps restores the air but keeps the rows rhythmically identical, so the grouping is still missing — and it costs 16px of height instead of 8px.',
    card: 'space-y-7 p-6 sm:p-7',
    group: null,
  },
];

const VERDICT_STYLE: Record<Preset['verdict'], string> = {
  Current: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-100',
  Recommended: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-100',
  'Too loose': 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-100',
};

/* ================================================================== */
/* Page                                                                */
/* ================================================================== */

/** Scratch page: three spacing scales for the merged directory card. */
export default function SpacingOptionsPage() {
  const [activeId, setActiveId] = React.useState(PRESETS[1].id);
  const [stackAll, setStackAll] = React.useState(false);
  const [showGaps, setShowGaps] = React.useState(true);

  const active = PRESETS.find((p) => p.id === activeId) ?? PRESETS[0];
  const shown = stackAll ? PRESETS : [active];

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
                  Directory card — spacing options
                </h1>
                <p className="mt-1 text-[11.5px] text-slate-500">
                  The same layout B card three times. Only the gaps between the rows change.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
                {PRESETS.map((p) => {
                  const isActive = !stackAll && p.id === activeId;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setActiveId(p.id);
                        setStackAll(false);
                      }}
                      className={cn(
                        'inline-flex h-[30px] cursor-pointer items-center gap-2 rounded-lg px-3 text-[12px] font-semibold transition',
                        isActive ? cn(LIFTED_ACTIVE, 'text-blue-600') : 'text-slate-600 hover:bg-white hover:text-slate-900',
                      )}
                    >
                      {p.label}
                      <span
                        className={cn(
                          'rounded-full px-1.5 py-[2px] text-[10px] font-bold tabular-nums',
                          isActive ? 'bg-blue-50 text-blue-600' : 'bg-slate-200/70 text-slate-500',
                        )}
                      >
                        {p.gaps}
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setStackAll((v) => !v)}
                className={cn(
                  'inline-flex cursor-pointer items-center rounded-xl border px-3 py-2 text-[12px] font-semibold transition',
                  stackAll
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900',
                )}
              >
                Stack all
              </button>

              <button
                type="button"
                onClick={() => setShowGaps((v) => !v)}
                title="Overlay the measured gap between each row"
                className={cn(
                  'inline-flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-2 text-[12px] font-semibold transition',
                  showGaps
                    ? 'border-orange-500 bg-orange-500 text-white'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900',
                )}
              >
                <Ruler className="h-3.5 w-3.5" />
                Show gaps
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[92rem] space-y-12 px-4 py-6 sm:px-8 sm:py-8">
        {shown.map((p) => (
          <PresetSection key={p.id} preset={p} showGaps={showGaps} />
        ))}
      </div>
    </main>
  );
}

function PresetSection({ preset, showGaps }: { preset: Preset; showGaps: boolean }) {
  // Each preset owns its filtering state, so stacking them keeps the presets independent.
  const d = useDirectory();

  return (
    <section id={preset.id}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <h2 className="text-[15px] font-semibold tracking-tight text-slate-900">{preset.name}</h2>
        <span
          className={cn(
            'rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider',
            VERDICT_STYLE[preset.verdict],
          )}
        >
          {preset.verdict}
        </span>
        <code className="rounded-md bg-slate-200/70 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
          {preset.card}
          {preset.group ? ` › ${preset.group}` : ''}
        </code>
      </div>
      <p className="mt-1.5 max-w-3xl text-[12.5px] leading-relaxed text-slate-500">{preset.note}</p>

      <div className="mt-4 space-y-5">
        <GapRuler enabled={showGaps}>
          <div className={cn(CARD, 'relative z-20', preset.card)}>
            <RowIdentity />
            {preset.group ? (
              <div className={preset.group}>
                <RowControls d={d} />
                <RowFilters d={d} />
              </div>
            ) : (
              <>
                <RowControls d={d} />
                <RowFilters d={d} />
              </>
            )}
          </div>
        </GapRuler>

        <div className="relative z-10">
          <DirectoryTable rows={d.rows} skin="prism" />
        </div>
      </div>
    </section>
  );
}

/**
 * Overlays the measured distance between consecutive rows, so the presets can be
 * compared on the one thing that separates them.
 */
function GapRuler({ enabled, children }: { enabled: boolean; children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [bands, setBands] = React.useState<{ top: number; height: number }[]>([]);

  React.useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const read = () => {
      const rows = Array.from(root.querySelectorAll('[data-row]'));
      const base = root.getBoundingClientRect().top;
      const next: { top: number; height: number }[] = [];
      for (let i = 0; i < rows.length - 1; i += 1) {
        const a = rows[i].getBoundingClientRect();
        const b = rows[i + 1].getBoundingClientRect();
        next.push({ top: Math.round(a.bottom - base), height: Math.round(b.top - a.bottom) });
      }
      setBands(next);
    };

    read();
    const observer = new ResizeObserver(read);
    observer.observe(root);
    root.querySelectorAll('[data-row]').forEach((row) => observer.observe(row));
    return () => observer.disconnect();
  }, [children]);

  return (
    <div ref={ref} className="relative">
      {children}
      {enabled &&
        bands.map((band, i) => (
          <div
            key={i}
            aria-hidden
            className="pointer-events-none absolute inset-x-0 z-40 border-y border-dashed border-orange-400 bg-orange-400/20"
            style={{ top: band.top, height: band.height }}
          >
            <span className="absolute right-4 top-1/2 -translate-y-1/2 rounded-md bg-orange-500 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-white shadow-sm">
              {band.height}px
            </span>
          </div>
        ))}
    </div>
  );
}
