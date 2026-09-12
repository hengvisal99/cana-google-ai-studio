'use client';

import React from 'react';
import { LayoutGrid, Rows3, Command, Columns2, Sparkles, Type, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AuroraRail } from '@/components/individual/list-variants/AuroraRail';
import { CommandDeck } from '@/components/individual/list-variants/CommandDeck';
import { SplitStudio } from '@/components/individual/list-variants/SplitStudio';
import { BentoBoard } from '@/components/individual/list-variants/BentoBoard';
import { EditorialLedger } from '@/components/individual/list-variants/EditorialLedger';
import { PrismGlass } from '@/components/individual/list-variants/PrismGlass';

type Version = {
  id: string;
  n: number;
  name: string;
  icon: React.ElementType;
  layout: string;
  blurb: string;
  Component: React.ComponentType;
};

const VERSIONS: Version[] = [
  {
    id: 'aurora-rail',
    n: 1,
    name: 'Aurora Rail',
    icon: Rows3,
    layout: 'Vertical status rail + list sheet',
    blurb:
      'Queue navigation moves into a left rail so the table gets full width. Soft aurora wash behind the masthead, rounded 26px sheet, avatar rows with inline metrics.',
    Component: AuroraRail,
  },
  {
    id: 'command-deck',
    n: 2,
    name: 'Command Deck',
    icon: Command,
    layout: 'Single command bar + dense table',
    blurb:
      'Operator console. One command bar with ⌘K, removable filter chips, a collapsible filter drawer and a hairline table with monospace identifiers — built to scan hundreds of rows.',
    Component: CommandDeck,
  },
  {
    id: 'split-studio',
    n: 3,
    name: 'Split Studio',
    icon: Columns2,
    layout: 'Master list + detail dossier',
    blurb:
      'Two panes: compact results on the left, the full dossier on the right. Nothing opens in a modal — selection drives the whole right pane, including documents.',
    Component: SplitStudio,
  },
  {
    id: 'bento-board',
    n: 4,
    name: 'Bento Board',
    icon: LayoutGrid,
    layout: 'KPI bento + card grid',
    blurb:
      'Metrics first. A bento of KPI tiles with a live status-distribution bar, then records as portrait cards with gradient caps — the page reads as a portfolio, not a ledger.',
    Component: BentoBoard,
  },
  {
    id: 'editorial-ledger',
    n: 5,
    name: 'Editorial Ledger',
    icon: Type,
    layout: 'Typographic register, grouped',
    blurb:
      'No cards, no boxes. Oversized masthead, underlined inline controls, and records grouped under status headings on hairline rules — a printed register in the browser.',
    Component: EditorialLedger,
  },
  {
    id: 'prism-glass',
    n: 6,
    name: 'Prism Glass',
    icon: Layers,
    layout: 'Frosted layers + floating toolbar',
    blurb:
      'Layered frosted panels over a tinted gradient field. The toolbar detaches and overlaps the header, and every row carries a coloured status ribbon down its left edge.',
    Component: PrismGlass,
  },
];

/** Scratch page: six full-screen design directions for the Individual list. */
export default function ListDesignsPage() {
  const [activeId, setActiveId] = React.useState(VERSIONS[0].id);
  const [compare, setCompare] = React.useState(false);

  const active = VERSIONS.find((v) => v.id === activeId) ?? VERSIONS[0];

  return (
    <main className="min-h-screen bg-slate-100">
      {/* Sticky switcher */}
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto max-w-[92rem] px-5 py-3.5 sm:px-8">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-white">
                <Sparkles className="h-4 w-4" />
              </span>
              <div className="leading-none">
                <h1 className="text-[15px] font-black tracking-tight text-slate-900">Individual list — 6 designs</h1>
                <p className="mt-1.5 text-[11.5px] text-slate-500">
                  Six layouts over the same live records. Light mode, all filters interactive.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {VERSIONS.map((v) => {
                const Icon = v.icon;
                const isActive = !compare && v.id === activeId;
                return (
                  <button
                    key={v.id}
                    onClick={() => {
                      setActiveId(v.id);
                      setCompare(false);
                    }}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[12px] font-bold transition',
                      isActive
                        ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900',
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="tabular-nums">{v.n}.</span>
                    <span className="hidden sm:inline">{v.name}</span>
                  </button>
                );
              })}
              <button
                onClick={() => setCompare((c) => !c)}
                className={cn(
                  'ml-1 rounded-xl border px-3 py-2 text-[12px] font-bold transition',
                  compare
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900',
                )}
              >
                Stack all
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[92rem] px-4 py-6 sm:px-8 sm:py-8">
        {compare ? (
          <div className="space-y-10">
            {VERSIONS.map((v) => (
              <section key={v.id} id={v.id}>
                <Caption version={v} />
                <div className="mt-3">
                  <v.Component />
                </div>
              </section>
            ))}
          </div>
        ) : (
          <section id={active.id}>
            <Caption version={active} />
            <div className="mt-3">
              <active.Component />
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function Caption({ version }: { version: Version }) {
  return (
    <div className="flex flex-wrap items-start gap-x-4 gap-y-1.5">
      <div className="flex items-baseline gap-2">
        <span className="text-[13px] font-black tabular-nums text-slate-400">
          {String(version.n).padStart(2, '0')}
        </span>
        <h2 className="text-[15px] font-black tracking-tight text-slate-900">{version.name}</h2>
        <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
          {version.layout}
        </span>
      </div>
      <p className="max-w-3xl text-[12.5px] leading-relaxed text-slate-500">{version.blurb}</p>
    </div>
  );
}
