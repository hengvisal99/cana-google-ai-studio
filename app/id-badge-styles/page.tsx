'use client';

import React, { useState } from 'react';
import { ArrowLeft, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';

const CUSTOMER_ID = 'CID-009021';
const TITLE = 'Update Individual Profile';

type VariantId = 'outline' | 'divider' | 'hash' | 'subline' | 'right' | 'tint';

const VARIANTS: { id: VariantId; name: string; hint: string }[] = [
  { id: 'outline', name: 'Outline', hint: 'White chip with a grey border, so the ID reads as data, not status' },
  { id: 'divider', name: 'Divider', hint: 'A thin rule between the title and the ID, no chip at all' },
  { id: 'hash', name: 'Hash', hint: 'Just #CID-009021 in blue, the lightest possible mark' },
  { id: 'subline', name: 'Subline', hint: 'ID on its own line under the title, so the title stands alone' },
  { id: 'right', name: 'Right', hint: 'Title left, ID pushed to the right edge of the header' },
  { id: 'tint', name: 'Tint', hint: 'Soft blue tag with no border, flatter than the current pill' },
];

function BackLink() {
  return (
    <button
      type="button"
      className="group -mx-2 -my-1 inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1 text-[12.5px] font-semibold text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-600"
    >
      <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
      <span>Back to Individual Directory</span>
    </button>
  );
}

function Title() {
  return <h1 className="text-[22px] font-semibold tracking-[-0.025em] text-slate-900 sm:text-2xl">{TITLE}</h1>;
}

/** The customer ID, drawn in whichever style is selected. */
function CustomerId({ variant }: { variant: VariantId }) {
  if (variant === 'divider') {
    return (
      <span className="inline-flex items-center gap-3">
        <span className="h-5 w-px bg-slate-200" />
        <span className="font-mono text-[13px] font-semibold text-slate-500">{CUSTOMER_ID}</span>
      </span>
    );
  }

  if (variant === 'hash') {
    return (
      <span className="inline-flex items-center gap-0.5 font-mono text-[13px] font-bold text-blue-600">
        <Hash className="h-3.5 w-3.5 text-blue-400" />
        {CUSTOMER_ID}
      </span>
    );
  }

  if (variant === 'tint') {
    return (
      <span className="rounded-md bg-blue-50 px-2 py-1 font-mono text-[12px] font-bold text-blue-600">
        {CUSTOMER_ID}
      </span>
    );
  }

  // outline, subline and right all use the neutral chip
  return (
    <span className="rounded-lg bg-white px-2.5 py-1 font-mono text-[12px] font-bold text-slate-600 shadow-2xs ring-1 ring-slate-200">
      {CUSTOMER_ID}
    </span>
  );
}

/** The header card, holding only the back link, the title and the ID. */
function Header({ variant }: { variant: VariantId }) {
  const card =
    'rounded-[22px] bg-white/90 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-16px_rgba(15,23,42,0.14)] ring-1 ring-slate-900/[0.06] sm:p-5';

  if (variant === 'subline') {
    return (
      <div className={card}>
        <BackLink />
        <div className="mt-2 space-y-1.5">
          <Title />
          <span className="block font-mono text-[12px] font-semibold text-slate-400">{CUSTOMER_ID}</span>
        </div>
      </div>
    );
  }

  if (variant === 'right') {
    return (
      <div className={card}>
        <BackLink />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <Title />
          <CustomerId variant={variant} />
        </div>
      </div>
    );
  }

  return (
    <div className={card}>
      <BackLink />
      <div className="mt-2 flex flex-wrap items-center gap-2.5">
        <Title />
        <CustomerId variant={variant} />
      </div>
    </div>
  );
}

/** Scratch page: the update header redrawn, with only the back link, title and customer ID. */
export default function IdBadgeStylesPage() {
  const [variant, setVariant] = useState<VariantId>('outline');
  const active = VARIANTS.find((item) => item.id === variant) ?? VARIANTS[0];

  return (
    <main className="min-h-screen bg-[#eef2f7] px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-[15px] font-black tracking-tight text-slate-900">Update screen header</h1>
        <p className="mt-1.5 text-[11.5px] text-slate-500">
          Same three things as today — back link, title, customer ID — drawn six ways.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <div className="inline-flex flex-wrap gap-1 rounded-2xl bg-white p-1 shadow-sm ring-1 ring-slate-200">
            {VARIANTS.map((item) => {
              const isOn = item.id === variant;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={isOn}
                  onClick={() => setVariant(item.id)}
                  className={cn(
                    'cursor-pointer rounded-xl px-4 py-2 text-[12px] font-bold transition',
                    isOn ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-slate-500 hover:text-slate-900'
                  )}
                >
                  {item.name}
                </button>
              );
            })}
          </div>
        </div>
        <p className="mt-2.5 text-[11.5px] text-slate-500">{active.hint}</p>

        <div className="mt-4">
          <Header variant={variant} />
        </div>

        {/* The step bar underneath, so each header is judged against what follows it */}
        <div className="mt-4 rounded-[22px] bg-white/90 p-2.5 ring-1 ring-slate-900/[0.06]">
          <div className="flex gap-1">
            {['Personal Information', 'Identification & Docs', 'Contact & Address', 'Employment & Banking'].map(
              (label, idx) => (
                <span
                  key={label}
                  className={cn(
                    'flex h-11 flex-1 items-center gap-2.5 rounded-xl px-3 text-[12.5px]',
                    idx === 0 ? 'bg-blue-500 font-bold text-white' : 'bg-slate-100/70 font-medium text-slate-500'
                  )}
                >
                  <span
                    className={cn(
                      'grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10.5px] font-bold',
                      idx === 0 ? 'bg-white text-blue-600' : 'bg-white text-slate-500 ring-1 ring-slate-200'
                    )}
                  >
                    {idx + 1}
                  </span>
                  <span className="truncate">{label}</span>
                </span>
              )
            )}
          </div>
        </div>

        {/* All six together */}
        <div className="mt-4 rounded-[22px] bg-white p-5 ring-1 ring-slate-200/70 sm:p-6">
          <p className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">All six together</p>
          <div className="mt-4 space-y-4">
            {VARIANTS.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center gap-2.5 border-b border-slate-100 pb-4 last:border-0 last:pb-0"
              >
                <span className="w-16 shrink-0 text-[11px] font-semibold text-slate-400">{item.name}</span>
                <h2 className="text-[18px] font-semibold tracking-[-0.02em] text-slate-900">{TITLE}</h2>
                {item.id === 'subline' ? (
                  <span className="basis-full pl-[4.5rem] font-mono text-[12px] font-semibold text-slate-400">
                    {CUSTOMER_ID}
                  </span>
                ) : (
                  <CustomerId variant={item.id} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
