'use client';

import React from 'react';
import { ArrowLeft, ChevronLeft, Hash, IdCard } from 'lucide-react';

const TITLE = 'Update Individual Profile';
const CUSTOMER_ID = 'CID-009021';
const BACK_LABEL = 'Back to Individual Directory';

/* ------------------------------------------------------------------ */
/* V1 — Accent rule                                                    */
/* ------------------------------------------------------------------ */

/** A blue bar down the left edge does the work; the ID sits in a plain outline chip. */
function HeaderAccentRule() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex gap-4 p-5 sm:p-6">
        <span aria-hidden className="w-[3px] shrink-0 rounded-full bg-blue-600" />
        <div className="min-w-0 space-y-2">
          <button
            type="button"
            className="group -mx-2 -my-1 inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1 text-[12.5px] font-semibold text-slate-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
            <span>{BACK_LABEL}</span>
          </button>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-[22px] font-semibold tracking-[-0.03em] text-slate-900 sm:text-[26px]">{TITLE}</h1>
            <span className="rounded-lg bg-white px-2.5 py-1 font-mono text-[12px] font-bold text-slate-600 shadow-2xs ring-1 ring-slate-200">
              {CUSTOMER_ID}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* V2 — Split, labelled ID                                             */
/* ------------------------------------------------------------------ */

/** Title left, ID pushed to the right edge with its own label, so the two never compete. */
function HeaderSplitLabelled() {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between gap-4 px-5 pb-3.5 pt-4 sm:px-6">
        <button
          type="button"
          className="group -mx-2 -my-1 inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1 text-[12.5px] font-semibold text-slate-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
          <span>{BACK_LABEL}</span>
        </button>
      </div>
      <div className="flex flex-wrap items-end justify-between gap-4 border-t border-slate-100 px-5 py-4 sm:px-6">
        <h1 className="text-[22px] font-semibold tracking-[-0.03em] text-slate-900 sm:text-[26px]">{TITLE}</h1>
        <div className="text-right">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-slate-400">Customer ID</p>
          <p className="mt-0.5 font-mono text-[15px] font-bold tracking-tight text-blue-600">{CUSTOMER_ID}</p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* V3 — Ghost back button, tinted tag                                  */
/* ------------------------------------------------------------------ */

/** The back link becomes a real bordered button, and the ID a flat blue tag with a hash. */
function HeaderGhostButton() {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-5">
      <button
        type="button"
        className="group inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 bg-white pl-2 pr-3.5 text-[12.5px] font-semibold text-slate-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
      >
        <ChevronLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
        <span>{BACK_LABEL}</span>
      </button>
      <div className="mt-3 flex flex-wrap items-center gap-2.5">
        <h1 className="text-[24px] font-semibold tracking-[-0.03em] text-slate-900 sm:text-[28px]">{TITLE}</h1>
        <span className="inline-flex items-center gap-0.5 rounded-md bg-blue-50 px-2 py-1 font-mono text-[12px] font-bold text-blue-700">
          <Hash className="h-3.5 w-3.5 text-blue-400" />
          {CUSTOMER_ID}
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* V4 — Tinted band with ID card                                       */
/* ------------------------------------------------------------------ */

/** A soft blue wash behind the header, with the ID drawn as a small card and icon. */
function HeaderTintedBand() {
  return (
    <div className="overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/90 via-white to-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="space-y-2">
          <button
            type="button"
            className="group -mx-2 -my-1 inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1 text-[12.5px] font-semibold text-blue-700/80 transition-colors hover:bg-white hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
            <span>{BACK_LABEL}</span>
          </button>
          <h1 className="text-[22px] font-semibold tracking-[-0.03em] text-slate-900 sm:text-[26px]">{TITLE}</h1>
        </div>

        <div className="inline-flex w-fit items-center gap-2.5 rounded-xl border border-blue-100 bg-white/90 px-3 py-2 shadow-2xs backdrop-blur">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-blue-600/10 text-blue-600">
            <IdCard className="h-4 w-4" />
          </span>
          <span className="leading-tight">
            <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Customer</span>
            <span className="block font-mono text-[12.5px] font-bold text-slate-700">{CUSTOMER_ID}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* V5 — Single-row toolbar                                             */
/* ------------------------------------------------------------------ */

/** Everything on one line: a square back button, a divider, the title, then the ID. */
function HeaderToolbarRow() {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white px-3 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:px-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={BACK_LABEL}
          title={BACK_LABEL}
          className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-xl text-slate-500 ring-1 ring-slate-200 transition-colors hover:bg-blue-600 hover:text-white hover:ring-blue-600"
        >
          <ArrowLeft className="h-[18px] w-[18px]" />
        </button>

        <span aria-hidden className="h-7 w-px shrink-0 bg-slate-200" />

        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold text-slate-400">Individual Directory</p>
          <h1 className="truncate text-[19px] font-semibold leading-tight tracking-[-0.03em] text-slate-900 sm:text-[21px]">
            {TITLE}
          </h1>
        </div>

        <span className="shrink-0 rounded-full bg-blue-600 px-3 py-1.5 font-mono text-[12px] font-bold tracking-tight text-white shadow-[0_6px_16px_-10px_rgba(37,99,235,0.9)]">
          {CUSTOMER_ID}
        </span>
      </div>
    </div>
  );
}

const VERSIONS = [
  {
    id: 'accent-rule',
    name: 'V1 · Accent rule',
    hint: 'Blue bar down the left edge, neutral outline chip — the ID reads as data, not status.',
    Header: HeaderAccentRule,
  },
  {
    id: 'split-labelled',
    name: 'V2 · Split + labelled ID',
    hint: 'Back link on its own row; title left, ID right under a small caps label.',
    Header: HeaderSplitLabelled,
  },
  {
    id: 'ghost-button',
    name: 'V3 · Ghost back button',
    hint: 'Back becomes a bordered pill button; larger title, flat blue hash tag.',
    Header: HeaderGhostButton,
  },
  {
    id: 'tinted-band',
    name: 'V4 · Tinted band',
    hint: 'Soft blue wash across the header, ID drawn as a small card with an icon.',
    Header: HeaderTintedBand,
  },
  {
    id: 'toolbar-row',
    name: 'V5 · Toolbar row',
    hint: 'One dense line — square back button, divider, breadcrumb over title, solid blue ID pill.',
    Header: HeaderToolbarRow,
  },
];

/** Scratch page: four light-mode treatments of the update-individual header block. */
export default function IndividualHeaderDesignsPage() {
  return (
    <main className="min-h-screen bg-slate-100 px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-[72rem]">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Update Individual — header versions</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          Only the header block: back link, title and customer ID. Same layout in every one — what changes is the
          internal arrangement and the visual treatment.
        </p>

        <div className="mt-8 space-y-8">
          {VERSIONS.map(({ id, name, hint, Header }) => (
            <section key={id}>
              <div className="mb-2.5 flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                <h2 className="text-[13px] font-bold text-slate-900">{name}</h2>
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
