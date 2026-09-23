'use client';

import React from 'react';
import {
  HeaderAccentEdge,
  HeaderAuroraGlass,
  HeaderCommandBar,
  HeaderFloatingIslands,
  HeaderPaper,
  HeaderSoftInset,
} from '@/components/shell/header-variants/AppHeaderVariants';

const VERSIONS = [
  {
    id: 'paper',
    name: 'V1 · Paper',
    hint: 'Swiss minimal — hairline rule, no fills, wide air. Blue appears only on hover.',
    Header: HeaderPaper,
  },
  {
    id: 'aurora-glass',
    name: 'V2 · Aurora glass',
    hint: 'Frosted depth — translucent orbs, a blue bloom behind the glass, gradient avatar ring.',
    Header: HeaderAuroraGlass,
  },
  {
    id: 'command-bar',
    name: 'V3 · Command bar',
    hint: 'Dense and technical — one hairline-divided control group, mono labels, solid blue profile block.',
    Header: HeaderCommandBar,
  },
  {
    id: 'accent-edge',
    name: 'V4 · Accent edge',
    hint: 'Editorial — flat squares, oversized name, a blue gradient rule running along the bottom edge.',
    Header: HeaderAccentEdge,
  },
  {
    id: 'soft-inset',
    name: 'V5 · Soft inset',
    hint: 'Soft-UI — a recessed tray with the controls raised out of it; light mode sits pressed in.',
    Header: HeaderSoftInset,
  },
  {
    id: 'floating-islands',
    name: 'V6 · Floating islands',
    hint: 'No bar at all — the toggle and the action capsule detach into two cards, canvas showing between.',
    Header: HeaderFloatingIslands,
  },
];

/** Scratch page: four light-mode treatments of the app shell header bar. */
export default function HeaderDesignsPage() {
  return (
    <main className="min-h-screen bg-slate-100 px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-[84rem]">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          App header — six versions
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          Same layout every time: sidebar toggle on the left, then application, language, appearance
          and the profile on the right. What changes is the visual language — surface, radius,
          shadow, type and where the blue lands. Light mode throughout; hover to compare states.
        </p>

        <div className="mt-8 space-y-9">
          {VERSIONS.map(({ id, name, hint, Header }) => (
            <section key={id}>
              <div className="mb-2.5 flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                <h2 className="text-[13px] font-semibold text-slate-900">{name}</h2>
                <p className="text-[12px] text-slate-500">{hint}</p>
              </div>
              <Header />
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
