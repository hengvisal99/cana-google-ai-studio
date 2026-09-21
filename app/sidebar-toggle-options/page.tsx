'use client';

import React, { useState } from 'react';
import { Briefcase, Mail, MapPin, PanelLeftOpen, Phone, Printer, ShieldCheck, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ========================================================================== */
/* Scratch page: where the "show customer list" toggle should sit on          */
/* Customer 360 once the left sidebar is hidden. The profile header is a      */
/* static copy of the live one and does not change between options.          */
/* ========================================================================== */

type PlacementId = 'current' | 'avatarEdge' | 'besidePrint' | 'rail';

const PLACEMENTS: { id: PlacementId; name: string; hint: string; notes: string[] }[] = [
  {
    id: 'current',
    name: '1 · Current',
    hint: 'Outlined "Customer list" pill above the profile card.',
    notes: ['Clear label', 'Costs a row of height above the header'],
  },
  {
    id: 'avatarEdge',
    name: '2 · Inside the card, left edge',
    hint: 'Icon-only button at the far left of the profile card, split from the avatar by a hairline.',
    notes: ['No extra row', 'Sits where the sidebar used to be', 'Icon only — relies on the tooltip'],
  },
  {
    id: 'besidePrint',
    name: '3 · Header actions, beside Print',
    hint: 'Secondary "Customer list" button joins the action group on the right, before Print.',
    notes: ['No extra row', 'Keeps the label', 'Far from where the sidebar opens'],
  },
  {
    id: 'rail',
    name: '4 · Collapsed rail',
    hint: 'Sidebar shrinks to a slim rail instead of vanishing: toggle on top, recent customers as avatars below.',
    notes: ['Toggle stays where the sidebar lives', 'Quick switch between customers', 'Uses ~56px of width'],
  },
];

const RECENT = ['MB', 'SK', 'DV', 'VL', 'CT'];

function ToggleIconButton() {
  return (
    <button
      type="button"
      title="Show customer list"
      aria-label="Show customer list"
      className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-blue-300 hover:text-blue-600"
    >
      <PanelLeftOpen className="h-4 w-4" />
    </button>
  );
}

function ProfileHeader({ leading, extraAction }: { leading?: React.ReactNode; extraAction?: React.ReactNode }) {
  const meta = [
    { icon: Briefcase, label: 'Occupation', value: 'Chief Supply Officer' },
    { icon: Phone, label: 'Phone', value: '+855 12 334 556' },
    { icon: Mail, label: 'Email', value: 'm.brody@brody-logistics.de' },
    { icon: MapPin, label: 'Address', value: 'Kaiserstraße 44, Frankfurt' },
  ];

  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-[0_10px_40px_-28px_rgba(15,23,42,0.35)]">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          {leading}
          <div className="relative grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-slate-200 text-sm font-semibold text-slate-600">
            MB
            <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
          </div>
          <div className="min-w-0 space-y-1.5">
            <h2 className="text-lg font-semibold text-slate-900">
              Marcus Brody <span className="text-sm font-normal text-slate-400">· ម៉ាកឹស ប្រូឌី</span>
            </h2>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="rounded-md border border-blue-200 px-2 py-0.5 font-mono text-[10px] font-semibold text-blue-700">CID-009024</span>
              <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                <ShieldCheck className="h-3 w-3" /> Low Risk
              </span>
              <span className="inline-flex items-center gap-1 rounded-md border border-violet-200 bg-violet-50 px-2 py-0.5 text-[11px] font-semibold uppercase text-violet-700">
                <UserCheck className="h-3 w-3" /> Corporate Officer
              </span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {extraAction}
          <button
            type="button"
            className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg bg-blue-500 px-3.5 text-xs font-semibold text-white transition hover:bg-blue-600"
          >
            <Printer className="h-4 w-4" /> Print
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 lg:grid-cols-4">
        {meta.map(({ icon: Icon, label, value }) => (
          <div key={label} className="min-w-0">
            <span className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-slate-500">
              <Icon className="h-3.5 w-3.5" /> {label}
            </span>
            <p className="mt-1 truncate text-[13px] text-slate-800">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SidebarToggleOptionsPage() {
  const [placement, setPlacement] = useState<PlacementId>('current');
  const active = PLACEMENTS.find((p) => p.id === placement)!;

  return (
    <main className="min-h-screen bg-slate-100/70 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="space-y-3">
          <h1 className="text-xl font-semibold text-slate-900">Customer list toggle — placement</h1>
          <div className="flex flex-wrap gap-1.5">
            {PLACEMENTS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPlacement(p.id)}
                className={cn(
                  'cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition',
                  placement === p.id ? 'bg-blue-500 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:text-slate-900'
                )}
              >
                {p.name}
              </button>
            ))}
          </div>
          <p className="text-[13px] text-slate-600">{active.hint}</p>
          <ul className="flex flex-wrap gap-1.5">
            {active.notes.map((n) => (
              <li key={n} className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200">
                {n}
              </li>
            ))}
          </ul>
        </header>

        <div className="flex gap-4">
          {/* Option 4: slim rail in place of the hidden sidebar */}
          {placement === 'rail' && (
            <aside className="flex w-14 shrink-0 flex-col items-center gap-3 rounded-2xl border border-slate-200/60 bg-white py-3 shadow-[0_10px_40px_-28px_rgba(15,23,42,0.35)]">
              <ToggleIconButton />
              <span className="h-px w-6 bg-slate-100" />
              {RECENT.map((initials, i) => (
                <button
                  key={initials}
                  type="button"
                  title={initials}
                  className={cn(
                    'grid h-9 w-9 cursor-pointer place-items-center rounded-full text-[11px] font-semibold transition',
                    i === 0 ? 'bg-blue-50 text-blue-700 ring-2 ring-blue-500' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  )}
                >
                  {initials}
                </button>
              ))}
            </aside>
          )}

          <div className="min-w-0 flex-1 space-y-3">
            {/* Option 1: pill above the card (what ships today) */}
            {placement === 'current' && (
              <button
                type="button"
                className="group flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white py-1.5 pl-2 pr-2.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:border-blue-300 hover:text-blue-600"
              >
                <PanelLeftOpen className="h-3.5 w-3.5 text-slate-500 transition group-hover:text-blue-600" />
                <span>Customer list</span>
              </button>
            )}

            <ProfileHeader
              leading={
                placement === 'avatarEdge' ? (
                  <>
                    <ToggleIconButton />
                    <span className="h-10 w-px shrink-0 bg-slate-200" />
                  </>
                ) : undefined
              }
              extraAction={
                placement === 'besidePrint' ? (
                  <button
                    type="button"
                    className="group inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-600"
                  >
                    <PanelLeftOpen className="h-4 w-4 text-slate-500 transition group-hover:text-blue-600" />
                    Customer list
                  </button>
                ) : undefined
              }
            />

            {/* A stand-in for the sections below the header */}
            <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-[0_10px_40px_-28px_rgba(15,23,42,0.35)]">
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="h-2.5 w-24 rounded-full bg-slate-100" />
                    <div className="h-2.5 flex-1 rounded-full bg-slate-50" />
                    <div className="h-2.5 w-16 rounded-full bg-slate-100" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
