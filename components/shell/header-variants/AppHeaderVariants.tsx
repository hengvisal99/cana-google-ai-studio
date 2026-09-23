'use client';

import React from 'react';
import Image from 'next/image';
import { Globe, LayoutGrid, Menu, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

const USER = {
  name: 'Marcus Aurelius',
  role: 'Chief Risk Officer',
  avatar:
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80',
};

const LANG = 'EN';

/** Same person in every variant — only the frame around them changes. */
function Avatar({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <Image
      src={USER.avatar}
      alt=""
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className={cn('shrink-0 object-cover', className)}
      referrerPolicy="no-referrer"
      unoptimized
    />
  );
}

/* ================================================================== */
/* V1 — Paper                                                          */
/* Swiss minimal: hairline rule, no fills, air between everything.     */
/* ================================================================== */

export function HeaderPaper() {
  const icon =
    'grid h-9 w-9 cursor-pointer place-items-center rounded-full text-slate-400 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-900';

  return (
    <header className="flex items-center justify-between gap-6 rounded-[20px] border border-slate-200/70 bg-white px-5 py-3.5 sm:px-6">
      <button
        type="button"
        aria-label="Toggle sidebar"
        title="Toggle sidebar"
        className={icon}
      >
        <Menu className="h-[18px] w-[18px]" strokeWidth={1.75} />
      </button>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <button type="button" aria-label="Switch application" className={icon}>
            <LayoutGrid className="h-[18px] w-[18px]" strokeWidth={1.75} />
          </button>

          {/* Language reads as a word, not a badge — the only blue in the row */}
          <button
            type="button"
            aria-label="Language"
            className="flex h-9 cursor-pointer items-center gap-1.5 rounded-full px-3 text-slate-400 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-900"
          >
            <Globe className="h-[18px] w-[18px]" strokeWidth={1.75} />
            <span className="text-[11px] font-semibold tracking-[0.08em] text-slate-500">
              {LANG}
            </span>
          </button>

          <button type="button" aria-label="Appearance" className={icon}>
            <Sun className="h-[18px] w-[18px]" strokeWidth={1.75} />
          </button>
        </div>

        <span aria-hidden className="h-9 w-px bg-slate-200/80" />

        <button type="button" className="group flex cursor-pointer items-center gap-3">
          <span className="hidden text-right leading-[1.3] sm:block">
            <span className="block text-[13px] font-medium tracking-[-0.01em] text-slate-900">
              {USER.name}
            </span>
            <span className="block text-[11px] text-slate-400">{USER.role}</span>
          </span>
          <Avatar
            size={34}
            className="rounded-full ring-1 ring-slate-200 transition-all duration-200 group-hover:ring-blue-500"
          />
        </button>
      </div>
    </header>
  );
}

/* ================================================================== */
/* V2 — Aurora glass                                                   */
/* Frosted depth: translucent circles, layered blue-cast shadows.      */
/* ================================================================== */

export function HeaderAuroraGlass() {
  const orb =
    'grid h-10 w-10 cursor-pointer place-items-center rounded-full bg-white/70 text-slate-600 ring-1 ring-white/90 shadow-[0_2px_8px_-2px_rgba(37,99,235,0.18)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:text-blue-600 hover:shadow-[0_8px_18px_-6px_rgba(37,99,235,0.35)]';

  return (
    <header className="relative flex items-center justify-between gap-4 overflow-hidden rounded-[26px] border border-white/80 bg-white/70 px-4 py-3 shadow-[0_18px_40px_-24px_rgba(37,99,235,0.45)] backdrop-blur-2xl sm:px-5">
      {/* Aurora bloom behind the glass */}
      <span
        aria-hidden
        className="pointer-events-none absolute -left-16 -top-24 h-52 w-52 rounded-full bg-blue-400/25 blur-3xl"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -right-10 -bottom-28 h-52 w-52 rounded-full bg-sky-300/25 blur-3xl"
      />

      <button
        type="button"
        aria-label="Toggle sidebar"
        title="Toggle sidebar"
        className={cn('relative', orb)}
      >
        <Menu className="h-[18px] w-[18px]" />
      </button>

      <div className="relative flex items-center gap-2">
        <button type="button" aria-label="Switch application" className={orb}>
          <LayoutGrid className="h-[18px] w-[18px]" />
        </button>

        <button type="button" aria-label="Language" className={cn('relative', orb)}>
          <Globe className="h-[18px] w-[18px]" />
          <span className="absolute -bottom-0.5 rounded-full bg-gradient-to-b from-blue-500 to-blue-600 px-1.5 py-0.5 text-[8px] font-bold leading-none tracking-wide text-white shadow-[0_2px_6px_-1px_rgba(37,99,235,0.6)]">
            {LANG}
          </span>
        </button>

        <button type="button" aria-label="Appearance" className={orb}>
          <Sun className="h-[18px] w-[18px]" />
        </button>

        <button
          type="button"
          className="ml-1.5 flex cursor-pointer items-center gap-3 rounded-full bg-white/80 py-1.5 pl-1.5 pr-4 ring-1 ring-white/90 shadow-[0_2px_10px_-3px_rgba(37,99,235,0.25)] backdrop-blur-xl transition-all duration-200 hover:bg-white hover:shadow-[0_10px_22px_-8px_rgba(37,99,235,0.4)]"
        >
          <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-sky-400 p-[2px]">
            <Avatar size={32} className="rounded-full ring-2 ring-white" />
          </span>
          <span className="hidden text-left leading-[1.3] sm:block">
            <span className="block text-[13px] font-semibold text-slate-900">{USER.name}</span>
            <span className="block text-[11px] font-medium text-blue-600">{USER.role}</span>
          </span>
        </button>
      </div>
    </header>
  );
}

/* ================================================================== */
/* V3 — Command bar                                                    */
/* Dense and technical: one divided group, square corners, blue block. */
/* ================================================================== */

export function HeaderCommandBar() {
  const cell =
    'grid h-9 w-10 cursor-pointer place-items-center text-slate-500 transition-colors duration-150 hover:bg-blue-50 hover:text-blue-600';

  return (
    <header className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-[0_1px_0_rgba(15,23,42,0.04)]">
      <button
        type="button"
        aria-label="Toggle sidebar"
        title="Toggle sidebar"
        className="grid h-9 w-9 cursor-pointer place-items-center rounded-md border border-slate-200 text-slate-600 transition-colors duration-150 hover:border-blue-600 hover:bg-blue-600 hover:text-white"
      >
        <Menu className="h-4 w-4" strokeWidth={2.25} />
      </button>

      <div className="flex items-center gap-3">
        {/* One bordered group, hairline-divided — reads as a single control */}
        <div className="flex items-center divide-x divide-slate-200 overflow-hidden rounded-md border border-slate-200">
          <button type="button" aria-label="Switch application" className={cell}>
            <LayoutGrid className="h-4 w-4" strokeWidth={2} />
          </button>

          <button type="button" aria-label="Language" className={cn(cell, 'w-auto gap-1.5 px-2.5')}>
            <Globe className="h-4 w-4" strokeWidth={2} />
            <span className="font-mono text-[10px] font-bold tracking-[0.1em] text-slate-600">
              {LANG}
            </span>
          </button>

          <button
            type="button"
            aria-label="Appearance"
            className="grid h-9 w-10 cursor-pointer place-items-center bg-blue-50 text-blue-600"
          >
            <Sun className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        {/* The only saturated surface in the bar */}
        <button
          type="button"
          className="flex cursor-pointer items-center gap-2.5 rounded-md bg-blue-600 py-1 pl-1 pr-3 transition-colors duration-150 hover:bg-blue-700"
        >
          <Avatar className="rounded-[5px]" />
          <span className="hidden text-left leading-[1.25] sm:block">
            <span className="block text-[12.5px] font-semibold text-white">{USER.name}</span>
            <span className="block font-mono text-[9.5px] font-medium uppercase tracking-[0.12em] text-blue-100">
              {USER.role}
            </span>
          </span>
        </button>
      </div>
    </header>
  );
}

/* ================================================================== */
/* V4 — Accent edge                                                    */
/* Editorial: flat squares, big name, a blue gradient rule underneath. */
/* ================================================================== */

export function HeaderAccentEdge() {
  const square =
    'grid h-10 w-10 cursor-pointer place-items-center rounded-lg bg-slate-100/80 text-slate-500 transition-colors duration-200 hover:bg-blue-600 hover:text-white';

  return (
    <header className="relative overflow-hidden rounded-2xl bg-white pb-[3px] shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
      <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-5">
        <button
          type="button"
          aria-label="Toggle sidebar"
          title="Toggle sidebar"
          className={square}
        >
          <Menu className="h-[18px] w-[18px]" />
        </button>

        <div className="flex items-center gap-2">
          <button type="button" aria-label="Switch application" className={square}>
            <LayoutGrid className="h-[18px] w-[18px]" />
          </button>

          <button type="button" aria-label="Language" className={cn('relative', square)}>
            <Globe className="h-[18px] w-[18px]" />
            <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-md bg-blue-600 px-1 text-[8px] font-bold leading-none text-white">
              {LANG}
            </span>
          </button>

          <button type="button" aria-label="Appearance" className={square}>
            <Sun className="h-[18px] w-[18px]" />
          </button>

          <span aria-hidden className="mx-2 h-10 w-px bg-slate-100" />

          {/* Square avatar and oversized name — the type does the work */}
          <button type="button" className="group flex cursor-pointer items-center gap-3">
            <Avatar
              size={38}
              className="rounded-lg transition-transform duration-200 group-hover:scale-[1.04]"
            />
            <span className="hidden text-left leading-[1.2] sm:block">
              <span className="block text-[14px] font-bold tracking-[-0.02em] text-slate-900">
                {USER.name}
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                {USER.role}
              </span>
            </span>
          </button>
        </div>
      </div>

      {/* The edge the variant is named for */}
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r from-blue-600 via-blue-500 to-sky-300"
      />
    </header>
  );
}

/* ================================================================== */
/* V5 — Soft inset                                                     */
/* Soft-UI: a recessed tray, controls raised out of it, light pressed. */
/* ================================================================== */

export function HeaderSoftInset() {
  const raised =
    'grid h-9 w-9 cursor-pointer place-items-center rounded-xl bg-white text-slate-500 shadow-[0_1px_2px_rgba(15,23,42,0.08),0_6px_12px_-8px_rgba(15,23,42,0.25)] transition-all duration-200 hover:-translate-y-px hover:text-blue-600 hover:shadow-[0_2px_4px_rgba(15,23,42,0.08),0_10px_18px_-10px_rgba(37,99,235,0.45)]';

  return (
    <header className="flex items-center justify-between gap-4 rounded-[22px] border border-white bg-slate-50 px-4 py-3 shadow-[inset_0_2px_6px_rgba(15,23,42,0.07)] ring-1 ring-slate-200/70 sm:px-5">
      <button type="button" aria-label="Toggle sidebar" title="Toggle sidebar" className={raised}>
        <Menu className="h-[18px] w-[18px]" />
      </button>

      <div className="flex items-center gap-2.5">
        <button type="button" aria-label="Switch application" className={raised}>
          <LayoutGrid className="h-[18px] w-[18px]" />
        </button>

        <button type="button" aria-label="Language" className={cn('relative', raised)}>
          <Globe className="h-[18px] w-[18px]" />
          <span className="absolute -bottom-1 rounded-full bg-blue-600 px-1.5 py-px text-[8px] font-bold leading-none tracking-wide text-white shadow-[0_2px_5px_-1px_rgba(37,99,235,0.6)]">
            {LANG}
          </span>
        </button>

        {/* Light mode is the current choice — drawn as a pressed key */}
        <button
          type="button"
          aria-label="Appearance"
          className="grid h-9 w-9 cursor-pointer place-items-center rounded-xl bg-slate-100 text-blue-600 shadow-[inset_0_2px_5px_rgba(15,23,42,0.14)]"
        >
          <Sun className="h-[18px] w-[18px]" />
        </button>

        <button
          type="button"
          className="ml-1 flex cursor-pointer items-center gap-2.5 rounded-2xl bg-white py-1.5 pl-1.5 pr-4 shadow-[0_1px_2px_rgba(15,23,42,0.08),0_6px_12px_-8px_rgba(15,23,42,0.25)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_2px_4px_rgba(15,23,42,0.08),0_12px_20px_-10px_rgba(37,99,235,0.4)]"
        >
          <Avatar size={30} className="rounded-xl shadow-[0_2px_6px_-2px_rgba(15,23,42,0.35)]" />
          <span className="hidden text-left leading-[1.3] sm:block">
            <span className="block text-[12.5px] font-semibold text-slate-800">{USER.name}</span>
            <span className="block text-[10.5px] font-medium text-slate-400">{USER.role}</span>
          </span>
        </button>
      </div>
    </header>
  );
}

/* ================================================================== */
/* V6 — Floating islands                                               */
/* No bar at all: two detached cards, the canvas showing between them. */
/* ================================================================== */

export function HeaderFloatingIslands() {
  const ghost =
    'grid h-9 w-9 cursor-pointer place-items-center rounded-full text-slate-500 transition-colors duration-200 hover:bg-blue-50 hover:text-blue-600';

  return (
    <header className="flex items-center justify-between gap-3">
      {/* Island one — the toggle, alone */}
      <button
        type="button"
        aria-label="Toggle sidebar"
        title="Toggle sidebar"
        className="grid h-12 w-12 shrink-0 cursor-pointer place-items-center rounded-2xl bg-white text-slate-600 shadow-[0_10px_30px_-14px_rgba(15,23,42,0.45)] transition-all duration-200 hover:text-blue-600 hover:shadow-[0_14px_32px_-14px_rgba(37,99,235,0.5)]"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Island two — everything else, in one capsule */}
      <div className="flex items-center gap-1 rounded-full bg-white p-1.5 pr-1.5 shadow-[0_10px_30px_-14px_rgba(15,23,42,0.45)]">
        <button type="button" aria-label="Switch application" className={ghost}>
          <LayoutGrid className="h-[18px] w-[18px]" />
        </button>

        <button type="button" aria-label="Language" className={cn('relative', ghost)}>
          <Globe className="h-[18px] w-[18px]" />
          <span className="absolute -bottom-0.5 text-[8px] font-bold leading-none tracking-wide text-blue-600">
            {LANG}
          </span>
        </button>

        <button type="button" aria-label="Appearance" className={ghost}>
          <Sun className="h-[18px] w-[18px]" />
        </button>

        <span aria-hidden className="mx-1.5 h-6 w-px bg-slate-100" />

        <button
          type="button"
          className="flex cursor-pointer items-center gap-2.5 rounded-full py-0.5 pl-0.5 pr-3 transition-colors duration-200 hover:bg-slate-50"
        >
          <span className="relative shrink-0">
            <Avatar size={32} className="rounded-full" />
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-blue-600 ring-2 ring-white" />
          </span>
          <span className="hidden text-left leading-[1.25] sm:block">
            <span className="block text-[12.5px] font-semibold tracking-[-0.01em] text-slate-900">
              {USER.name}
            </span>
            <span className="block text-[10.5px] font-medium text-slate-400">{USER.role}</span>
          </span>
        </button>
      </div>
    </header>
  );
}
