'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import {
  OnboardingHeaderChevron,
  OnboardingHeaderPills,
  OnboardingHeaderStepper,
  OnboardingHeaderTiles,
  OnboardingHeaderTrack,
  type OnboardingHeaderProps,
} from '@/components/individual/onboarding-variants/OnboardingHeaders';

type Version = {
  id: string;
  n: number;
  name: string;
  Header: React.ComponentType<OnboardingHeaderProps>;
  traits: string[];
};

const VERSIONS: Version[] = [
  {
    id: 'chevron',
    n: 1,
    name: 'Chevron Flow',
    Header: OnboardingHeaderChevron,
    traits: ['Arrow segments point to the next step', 'Single-line labels', 'Gradient pill CTA'],
  },
  {
    id: 'stepper',
    n: 2,
    name: 'Connected Stepper',
    Header: OnboardingHeaderStepper,
    traits: ['Numbered nodes + filling rails', 'Single-line labels', 'Step counter + shortcut CTA'],
  },
  {
    id: 'track',
    n: 3,
    name: 'Track Stepper',
    Header: OnboardingHeaderTrack,
    traits: ['One continuous progress track', 'Labels below nodes', 'Progress ring'],
  },
  {
    id: 'tiles',
    n: 4,
    name: 'Progress Tiles',
    Header: OnboardingHeaderTiles,
    traits: ['Step cards chained by chevrons', 'Per-step progress bar', 'Draft + submit pair'],
  },
  {
    id: 'pills',
    n: 5,
    name: 'Expanding Pills',
    Header: OnboardingHeaderPills,
    traits: ['Icon nodes on a rail', 'Current step expands to a pill', 'Split submit + menu'],
  },
];

/** Scratch page: four designs of the New Customer Onboarding header + stepper card. */
export default function OnboardingDesignsPage() {
  return (
    <main className="min-h-screen bg-[#eef2f7]">
      <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[92rem] flex-col gap-3 px-5 py-3.5 sm:px-8 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-white">
              <Sparkles className="h-4 w-4" />
            </span>
            <div className="leading-none">
              <h1 className="text-[15px] font-semibold tracking-tight text-slate-900">Onboarding header — 5 designs</h1>
              <p className="mt-1.5 text-[11.5px] text-slate-500">
                Same outer layout: back link, title and Submit on top, a stepper below. Click the steps and Submit.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {VERSIONS.map((v) => (
              <a
                key={v.id}
                href={`#${v.id}`}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[12px] font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
              >
                <span className="tabular-nums">{v.n}.</span>
                <span className="hidden sm:inline">{v.name}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[92rem] space-y-12 px-4 py-8 sm:px-8">
        {VERSIONS.map((v) => (
          <VersionSection key={v.id} version={v} />
        ))}
      </div>
    </main>
  );
}

function VersionSection({ version }: { version: Version }) {
  const [activeIdx, setActiveIdx] = React.useState(1);
  const [submitting, setSubmitting] = React.useState(false);
  const { Header } = version;

  const handleSubmit = () => {
    setSubmitting(true);
    window.setTimeout(() => setSubmitting(false), 1400);
  };

  return (
    <section id={version.id} className="scroll-mt-28">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <div className="flex items-baseline gap-2">
          <span className="text-[13px] font-semibold tabular-nums text-slate-400">{String(version.n).padStart(2, '0')}</span>
          <h2 className="text-[15px] font-semibold tracking-tight text-slate-900">{version.name}</h2>
        </div>
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
      </div>
      <div className="mt-3">
        <Header
          activeIdx={activeIdx}
          onStep={setActiveIdx}
          onBack={() => setActiveIdx(0)}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      </div>
    </section>
  );
}
