'use client';

import React from 'react';
import { Sun, Command, Snowflake, LayoutGrid, Type, Layers, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DirectoryScreen } from '@/components/individual/list-variants/DirectoryScreen';
import type { DesignKit } from '@/components/individual/list-variants/kit';
import { auroraKit } from '@/components/individual/list-variants/kits/aurora';
import { graphiteKit } from '@/components/individual/list-variants/kits/graphite';
import { frostKit } from '@/components/individual/list-variants/kits/frost';
import { bentoKit } from '@/components/individual/list-variants/kits/bento';
import { editorialKit } from '@/components/individual/list-variants/kits/editorial';
import { prismKit } from '@/components/individual/list-variants/kits/prism';

type Version = {
  id: string;
  n: number;
  name: string;
  icon: React.ElementType;
  kit: DesignKit;
  controls: string[];
};

const VERSIONS: Version[] = [
  {
    id: 'aurora',
    n: 1,
    name: 'Aurora',
    icon: Sun,
    kit: auroraKit,
    controls: ['Pill toolbar', 'Pill tab track', 'Capsule search + field pill', 'Pill listbox fields'],
  },
  {
    id: 'graphite',
    n: 2,
    name: 'Graphite',
    icon: Command,
    kit: graphiteKit,
    controls: ['Icon toolbar + tooltips', 'Sliding underline tabs', 'Command-bar search (⌘K)', 'Inline-label pickers'],
  },
  {
    id: 'frost',
    n: 3,
    name: 'Nordic Frost',
    icon: Snowflake,
    kit: frostKit,
    controls: ['Icon-bubble chips', 'Stat-tile tabs', 'Search with action button', 'Floating-label fields'],
  },
  {
    id: 'bento',
    n: 4,
    name: 'Bento',
    icon: LayoutGrid,
    kit: bentoKit,
    controls: ['Icon tiles + pop-up labels', 'Progress-bar chips', 'Well search', 'Icon tile pickers + chip menus'],
  },
  {
    id: 'editorial',
    n: 5,
    name: 'Editorial',
    icon: Type,
    kit: editorialKit,
    controls: ['Slash text actions', 'Oversized text tabs', 'Underline search', 'Underline fields + numbered menus'],
  },
  {
    id: 'prism',
    n: 6,
    name: 'Prism Glass',
    icon: Layers,
    kit: prismKit,
    controls: ['Labelled toolbar dock', 'Elevated active states', 'Search button', 'Plain fields', 'Filters header + reset'],
  },
];

/** Scratch page: six control designs inside the current Individual list layout. */
export default function ListDesignsPage() {
  const [activeId, setActiveId] = React.useState(VERSIONS[0].id);
  const [stackAll, setStackAll] = React.useState(false);

  const active = VERSIONS.find((v) => v.id === activeId) ?? VERSIONS[0];

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto max-w-[92rem] px-5 py-3.5 sm:px-8">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-white">
                <Sparkles className="h-4 w-4" />
              </span>
              <div className="leading-none">
                <h1 className="text-[15px] font-semibold tracking-tight text-slate-900">Individual list — 6 designs</h1>
                <p className="mt-1.5 text-[11.5px] text-slate-500">
                  Same outer layout as the current screen. Every toolbar, tab, search and field is designed differently.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {VERSIONS.map((v) => {
                const Icon = v.icon;
                const isActive = !stackAll && v.id === activeId;
                return (
                  <button
                    key={v.id}
                    onClick={() => {
                      setActiveId(v.id);
                      setStackAll(false);
                    }}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[12px] font-semibold transition',
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
                onClick={() => setStackAll((c) => !c)}
                className={cn(
                  'ml-1 rounded-xl border px-3 py-2 text-[12px] font-semibold transition',
                  stackAll
                    ? 'border-blue-500 bg-blue-500 text-white'
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
        {stackAll ? (
          <div className="space-y-12">
            {VERSIONS.map((v) => (
              <section key={v.id} id={v.id}>
                <Caption version={v} />
                <div className="mt-3">
                  <DirectoryScreen kit={v.kit} />
                </div>
              </section>
            ))}
          </div>
        ) : (
          <section id={active.id}>
            <Caption version={active} />
            <div className="mt-3">
              <DirectoryScreen key={active.id} kit={active.kit} />
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function Caption({ version }: { version: Version }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <div className="flex items-baseline gap-2">
        <span className="text-[13px] font-semibold tabular-nums text-slate-400">{String(version.n).padStart(2, '0')}</span>
        <h2 className="text-[15px] font-semibold tracking-tight text-slate-900">{version.name}</h2>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {version.controls.map((c) => (
          <span
            key={c}
            className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10.5px] font-semibold text-slate-500"
          >
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}
