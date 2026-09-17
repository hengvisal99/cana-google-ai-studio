'use client';

import React from 'react';
import { ArrowUpRight, Bell, PanelsTopLeft, Search, Sparkles } from 'lucide-react';
import {
  SIDEBAR_NAV,
  SidebarAuroraGlow,
  SidebarCobaltRail,
  SidebarDockTiles,
  SidebarEditorialMinimal,
  SidebarFloatingPanel,
  SidebarSectionCards,
  type SidebarVariantProps,
} from '@/components/shell/sidebar-variants/SidebarVariants';
import { SidebarHybridConsole } from '@/components/shell/sidebar-variants/SidebarHybridConsole';
import { cn } from '@/lib/utils';

type Version = {
  id: string;
  n: number;
  name: string;
  blurb: string;
  Sidebar: React.ComponentType<SidebarVariantProps>;
  traits: string[];
  /** page background behind the mock window, so each design sits on its own canvas */
  canvas: string;
};

const VERSIONS: Version[] = [
  {
    id: 'cobalt-rail',
    n: 1,
    name: 'Cobalt Rail',
    blurb: 'Two columns — a 68px app rail beside the nav panel.',
    Sidebar: SidebarCobaltRail,
    traits: ['App rail + nav panel', 'Soft blue active row + 2px bar', 'Threaded sub-items', '⌘K search row'],
    canvas: 'bg-[#f1f5f9]',
  },
  {
    id: 'floating-panel',
    n: 2,
    name: 'Floating Panel',
    blurb: 'The nav floats as an elevated card with a primary action on top.',
    Sidebar: SidebarFloatingPanel,
    traits: ['Detached rounded card', 'Icon tiles per row', 'Gradient New Customer CTA', 'Queue progress footer'],
    canvas: 'bg-slate-100',
  },
  {
    id: 'editorial-minimal',
    n: 3,
    name: 'Editorial Minimal',
    blurb: 'No chrome — hairline rules, type hierarchy and a 2px blue marker.',
    Sidebar: SidebarEditorialMinimal,
    traits: ['Borderless rows', '2px blue active bar', 'Mono shortcut hints', 'Status line footer'],
    canvas: 'bg-[#f8fafc]',
  },
  {
    id: 'aurora-glow',
    n: 4,
    name: 'Aurora Glow',
    blurb: 'Blue gradient wash with glass rows lifted on coloured shadow.',
    Sidebar: SidebarAuroraGlow,
    traits: ['Aurora blue wash', 'White glass active card', 'Gradient icon tiles', 'KYC shield card'],
    canvas: 'bg-[#eef4ff]',
  },
  {
    id: 'dock-tiles',
    n: 5,
    name: 'Dock Tiles',
    blurb: 'Label-under-icon tile dock, with the section opening into a context column.',
    Sidebar: SidebarDockTiles,
    traits: ['Icon-over-label tiles', 'Gradient active tile', 'Context column', 'Pinned records'],
    canvas: 'bg-[#f1f5f9]',
  },
  {
    id: 'section-cards',
    n: 6,
    name: 'Section Cards',
    blurb: 'Dense console — each group is its own collapsible card on a tinted canvas.',
    Sidebar: SidebarSectionCards,
    traits: ['Group cards on tinted canvas', '32px dense rows', '3px blue marker', 'PROD/UAT switcher'],
    canvas: 'bg-white',
  },
  {
    id: 'hybrid-console',
    n: 7,
    name: 'Hybrid Console',
    blurb: 'Editorial rows, a cobalt pill on the parent holding the active child, section cards when collapsed.',
    Sidebar: SidebarHybridConsole,
    traits: [
      'Editorial 2px active bar',
      'Cobalt pill on active parent',
      'Section cards + cobalt tile collapsed',
      'Mono hints & badges',
    ],
    canvas: 'bg-[#f8fafc]',
  },
];

const LABELS = new Map<string, string>();
SIDEBAR_NAV.forEach((group) =>
  group.items.forEach((item) => {
    LABELS.set(item.id, item.label);
    item.children?.forEach((child) => LABELS.set(child.id, `${item.label} · ${child.label}`));
  })
);

/** Scratch page: seven sidebar designs, same menu, light mode, blue primary. */
export default function SidebarDesignsPage() {
  return (
    <main className="min-h-screen bg-[#eef2f7]">
      <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[96rem] flex-col gap-3 px-5 py-3.5 sm:px-8 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/25">
              <PanelsTopLeft className="h-4 w-4" />
            </span>
            <div className="leading-none">
              <h1 className="text-[15px] font-semibold tracking-tight text-slate-900">Sidebar — 7 designs</h1>
              <p className="mt-1.5 text-[11.5px] text-slate-500">
                Same menu and groups in every version; only the design changes. Click the rows, expand Customer,
                collapse each one.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {VERSIONS.map((v) => (
              <a
                key={v.id}
                href={`#${v.id}`}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[12px] font-semibold text-slate-600 transition hover:border-blue-300 hover:text-blue-700"
              >
                <span className="tabular-nums">{v.n}.</span>
                <span className="hidden sm:inline">{v.name}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[96rem] space-y-12 px-4 py-8 sm:px-8">
        {VERSIONS.map((v) => (
          <VersionSection key={v.id} version={v} />
        ))}
      </div>
    </main>
  );
}

function VersionSection({ version }: { version: Version }) {
  const [activeId, setActiveId] = React.useState('customer-list');
  const [collapsed, setCollapsed] = React.useState(false);
  const { Sidebar } = version;

  return (
    <section id={version.id} className="scroll-mt-28">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <div className="flex items-baseline gap-2">
          <span className="text-[13px] font-semibold tabular-nums text-slate-400">
            {String(version.n).padStart(2, '0')}
          </span>
          <h2 className="text-[15px] font-semibold tracking-tight text-slate-900">{version.name}</h2>
        </div>
        <p className="text-[12px] text-slate-500">{version.blurb}</p>
        <div className="flex flex-wrap gap-1.5">
          {version.traits.map((t) => (
            <span
              key={t}
              className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10.5px] font-semibold text-slate-500"
            >
              {t}
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          className="ml-auto inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11.5px] font-semibold text-slate-600 transition hover:border-blue-300 hover:text-blue-700"
        >
          {collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        </button>
      </div>

      {/* App window mock, so each sidebar is read in the context it lives in */}
      <div className="mt-3 overflow-hidden rounded-[22px] bg-white shadow-[0_24px_70px_-40px_rgba(15,23,42,0.5)] ring-1 ring-slate-200/70">
        <div className="flex h-[620px] min-h-0">
          <Sidebar
            activeId={activeId}
            onNavigate={setActiveId}
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed((prev) => !prev)}
          />
          <ContentPane canvas={version.canvas} activeId={activeId} />
        </div>
      </div>
    </section>
  );
}

/** Filler workspace beside the sidebar — deliberately quiet so the nav reads first. */
function ContentPane({ canvas, activeId }: { canvas: string; activeId: string }) {
  const title = LABELS.get(activeId) ?? 'Dashboard';

  return (
    <div className={cn('flex min-h-0 min-w-0 flex-1 flex-col', canvas)}>
      <header className="flex shrink-0 items-center gap-3 border-b border-slate-200/70 bg-white/70 px-5 py-3 backdrop-blur">
        <div className="min-w-0">
          <p className="truncate text-[10.5px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Nexus Core Banking
          </p>
          <p className="truncate text-[14px] font-semibold tracking-tight text-slate-900">{title}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="hidden h-9 items-center gap-2 rounded-xl bg-white px-3 text-[11.5px] font-medium text-slate-400 ring-1 ring-slate-200 sm:flex">
            <Search className="h-3.5 w-3.5" />
            Search records
          </span>
          <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-white text-slate-500 ring-1 ring-slate-200">
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-blue-600" />
          </span>
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-[11px] font-semibold text-white">
            VH
          </span>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: 'Total customers', value: '12,480', delta: '+4.2%' },
            { label: 'Pending review', value: '18', delta: '+3' },
            { label: 'Approved today', value: '96', delta: '+12%' },
          ].map((kpi) => (
            <div key={kpi.label} className="rounded-2xl bg-white p-4 ring-1 ring-slate-200/70">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">{kpi.label}</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-[22px] font-semibold tracking-tight text-slate-900 tabular-nums">
                  {kpi.value}
                </span>
                <span className="inline-flex items-center gap-0.5 rounded-full bg-blue-50 px-1.5 py-0.5 text-[10.5px] font-bold text-blue-700">
                  <ArrowUpRight className="h-3 w-3" />
                  {kpi.delta}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200/70">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <p className="text-[12.5px] font-semibold text-slate-900">Recent activity</p>
            <span className="ml-auto text-[11px] font-semibold text-blue-600">View all</span>
          </div>
          <div className="mt-3 space-y-2.5">
            {[68, 52, 84, 44, 72, 60].map((w, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="h-8 w-8 shrink-0 rounded-xl bg-slate-100" />
                <span className="h-2.5 rounded-full bg-slate-100" style={{ width: `${w}%` }} />
                <span className="ml-auto h-2.5 w-10 shrink-0 rounded-full bg-slate-100" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
