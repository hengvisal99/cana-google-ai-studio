'use client';

import React from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Check,
  ChevronDown,
  ChevronRight,
  CornerDownLeft,
  CreditCard,
  Loader2,
  MapPin,
  Save,
  Send,
  ShieldCheck,
  User,
  UserPlus,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const ONBOARDING_STEPS = [
  { key: 'personal', label: 'Personal Information', icon: User },
  { key: 'identification', label: 'Identification & Docs', icon: ShieldCheck },
  { key: 'contact', label: 'Contact & Address', icon: MapPin },
  { key: 'employment', label: 'Employment & Banking', icon: Briefcase },
  { key: 'family', label: 'Family & Related Persons', icon: Users },
  { key: 'account', label: 'Account Information', icon: CreditCard },
] as const;

export type OnboardingHeaderProps = {
  activeIdx: number;
  onStep: (idx: number) => void;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
};

type StepState = 'done' | 'current' | 'upcoming';

const steps = ONBOARDING_STEPS;
const total = steps.length;

const stateOf = (idx: number, activeIdx: number): StepState =>
  idx < activeIdx ? 'done' : idx === activeIdx ? 'current' : 'upcoming';

const STATUS_TEXT: Record<StepState, string> = {
  done: 'Completed',
  current: 'In progress',
  upcoming: 'Pending',
};

/* ────────────────────────────────────────────────────────────────────────────
 * 1 · Chevron Flow — arrow-shaped segments that point into the next step
 * ──────────────────────────────────────────────────────────────────────────── */
const NOTCH = 14;

function chevronClip(idx: number) {
  const right = idx === total - 1 ? '100% 0, 100% 100%' : `calc(100% - ${NOTCH}px) 0, 100% 50%, calc(100% - ${NOTCH}px) 100%`;
  const left = idx === 0 ? '0 100%' : `0 100%, ${NOTCH}px 50%`;
  return `polygon(0 0, ${right}, ${left})`;
}

export function OnboardingHeaderChevron({ activeIdx, onStep, onBack, onSubmit, submitting }: OnboardingHeaderProps) {
  return (
    <div className="rounded-[22px] bg-white/90 ring-1 ring-slate-900/[0.06] shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-16px_rgba(15,23,42,0.14)] backdrop-blur-xl">
      <div className="flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
        <div className="space-y-2">
          <button
            type="button"
            onClick={onBack}
            className="group -mx-2 -my-1 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[12.5px] font-semibold text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
            Back to Directory
          </button>
          <h1 className="text-[22px] font-semibold tracking-[-0.025em] text-slate-900 sm:text-2xl">
            New Customer Onboarding
          </h1>
        </div>
        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting}
          className="inline-flex h-10 shrink-0 items-center gap-2 self-start rounded-full bg-blue-500 px-5 text-[13px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_1px_2px_rgba(59,130,246,0.4),0_8px_20px_-8px_rgba(59,130,246,0.7)] transition hover:bg-blue-600 active:scale-[0.98] disabled:opacity-70 sm:self-auto"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {submitting ? 'Submitting…' : 'Submit'}
        </button>
      </div>

      <nav aria-label="Onboarding steps" className="overflow-x-auto border-t border-slate-100 p-2.5">
        <ol className="flex w-full min-w-[1080px]">
          {steps.map((step, idx) => {
            const state = stateOf(idx, activeIdx);
            return (
              <li key={step.key} className="min-w-0 flex-1" style={{ marginLeft: idx === 0 ? 0 : -8 }}>
                <button
                  type="button"
                  onClick={() => onStep(idx)}
                  aria-current={state === 'current' ? 'step' : undefined}
                  style={{ clipPath: chevronClip(idx) }}
                  className={cn(
                    'group flex h-11 w-full items-center gap-2.5 text-left transition-colors',
                    idx === 0 ? 'rounded-l-xl pl-3' : 'pl-[26px]',
                    idx === total - 1 ? 'rounded-r-xl pr-4' : 'pr-6',
                    state === 'current' && 'bg-blue-500 text-white',
                    state === 'done' && 'bg-blue-500 text-white hover:bg-blue-500/90',
                    state === 'upcoming' && 'bg-slate-100/70 text-slate-500 hover:bg-slate-100 hover:text-slate-700',
                  )}
                >
                  <span
                    className={cn(
                      'grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10.5px] font-bold tabular-nums',
                      state === 'current' && 'bg-white text-blue-600 shadow-[0_0_0_3px_rgba(255,255,255,0.25)]',
                      state === 'done' && 'bg-white text-blue-600',
                      state === 'upcoming' && 'bg-white text-slate-500 ring-1 ring-slate-200',
                    )}
                  >
                    {state === 'done' ? <Check className="h-3 w-3" strokeWidth={3} /> : idx + 1}
                  </span>
                  <span
                    className={cn('min-w-0 truncate text-[12.5px]', state === 'current' ? 'font-bold' : 'font-medium')}
                  >
                    {step.label}
                    <span className="sr-only"> ({STATUS_TEXT[state]})</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * 2 · Connected Stepper — numbered nodes with status, joined by filling rails
 * ──────────────────────────────────────────────────────────────────────────── */
export function OnboardingHeaderStepper({ activeIdx, onStep, onBack, onSubmit, submitting }: OnboardingHeaderProps) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_0_rgba(15,23,42,0.03),0_2px_6px_-2px_rgba(15,23,42,0.06)]">
      <div className="flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
        <div className="space-y-1.5">
          <nav className="flex items-center gap-1.5 text-[12px] font-medium">
            <button
              type="button"
              onClick={onBack}
              className="group inline-flex items-center gap-1 text-slate-500 transition hover:text-blue-600"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
              Back to Directory
            </button>
            <span className="text-slate-300">/</span>
            <span className="text-slate-400">Individuals</span>
          </nav>
          <h1 className="text-[22px] font-bold tracking-[-0.025em] text-slate-950 sm:text-2xl">New Customer Onboarding</h1>
        </div>

        <div className="flex items-center gap-4 self-start sm:self-auto">
          <div className="hidden text-right leading-tight md:block">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-slate-400">Step</p>
            <p className="text-[13px] font-bold tabular-nums text-slate-900">
              {activeIdx + 1}
              <span className="font-medium text-slate-400"> / {total}</span>
            </p>
          </div>
          <span className="hidden h-8 w-px bg-slate-200 md:block" />
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting}
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-blue-500 pl-4 pr-2 text-[13px] font-semibold text-white shadow-[0_1px_2px_rgba(59,130,246,0.35),0_6px_16px_-6px_rgba(59,130,246,0.55)] ring-1 ring-inset ring-white/10 transition hover:bg-blue-600 active:scale-[0.98] disabled:opacity-70"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>{submitting ? 'Submitting…' : 'Submit'}</span>
            <kbd className="ml-1 inline-flex h-6 items-center gap-0.5 rounded-md bg-white/15 px-1.5 font-sans text-[10.5px] font-semibold text-white/90">
              Ctrl <CornerDownLeft className="h-3 w-3" />
            </kbd>
          </button>
        </div>
      </div>

      <nav aria-label="Onboarding steps" className="overflow-x-auto border-t border-slate-100 px-4 py-3.5 sm:px-5">
        <ol className="flex w-full min-w-[1100px] items-center">
          {steps.map((step, idx) => {
            const state = stateOf(idx, activeIdx);
            return (
              <li key={step.key} className={cn('flex items-center', idx < total - 1 && 'flex-1')}>
                <button
                  type="button"
                  onClick={() => onStep(idx)}
                  aria-current={state === 'current' ? 'step' : undefined}
                  className="group inline-flex shrink-0 items-center gap-2.5 rounded-lg py-1 pr-1"
                >
                  <span
                    className={cn(
                      'grid h-8 w-8 place-items-center rounded-full text-[12px] font-bold tabular-nums transition-all',
                      state === 'current' && 'bg-blue-500 text-white ring-[5px] ring-blue-500/15',
                      state === 'done' && 'bg-blue-500/10 text-blue-600',
                      state === 'upcoming' &&
                        'border border-slate-300 bg-white text-slate-500 group-hover:border-blue-400 group-hover:text-blue-600',
                    )}
                  >
                    {state === 'done' ? <Check className="h-4 w-4" strokeWidth={3} /> : idx + 1}
                  </span>
                  <span className="text-left leading-tight">
                    <span
                      className={cn(
                        'block text-[12.5px] transition-colors',
                        state === 'current' && 'font-semibold text-slate-950',
                        state === 'done' && 'font-medium text-slate-700',
                        state === 'upcoming' && 'font-medium text-slate-500 group-hover:text-slate-800',
                      )}
                    >
                      {step.label}
                      <span className="sr-only"> ({STATUS_TEXT[state]})</span>
                    </span>
                  </span>
                </button>
                {idx < total - 1 && (
                  <span className="relative mx-3 h-[2px] min-w-6 flex-1 overflow-hidden rounded-full bg-slate-200">
                    <motion.span
                      initial={false}
                      animate={{ scaleX: state === 'done' ? 1 : 0 }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                      className="absolute inset-0 origin-left rounded-full bg-blue-500"
                    />
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * 3 · Track Stepper — one continuous progress track, nodes on it, labels below
 * ──────────────────────────────────────────────────────────────────────────── */
export function OnboardingHeaderTrack({ activeIdx, onStep, onBack, onSubmit, submitting }: OnboardingHeaderProps) {
  const pct = Math.round((activeIdx / total) * 100);
  const r = 15;
  const c = 2 * Math.PI * r;
  const edge = `${100 / (total * 2)}%`;

  return (
    <div className="rounded-3xl bg-white shadow-[0_0_0_1px_rgba(15,23,42,0.05),0_20px_40px_-24px_rgba(30,64,175,0.18)]">
      <div className="flex flex-col justify-between gap-4 px-5 pb-4 pt-5 sm:flex-row sm:items-center sm:px-6">
        <div className="space-y-1">
          <button
            type="button"
            onClick={onBack}
            className="group inline-flex items-center gap-1.5 text-[12px] font-semibold text-blue-600 transition hover:text-blue-700"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            Back to Directory
          </button>
          <h1 className="text-2xl font-semibold tracking-[-0.03em] text-slate-900 sm:text-[26px]">New Customer Onboarding</h1>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="flex items-center gap-2.5 rounded-full bg-slate-50 py-1 pl-1 pr-3.5 ring-1 ring-slate-100">
            <svg viewBox="0 0 36 36" className="h-8 w-8 -rotate-90">
              <circle cx="18" cy="18" r={r} fill="none" strokeWidth="3.5" className="stroke-slate-200" />
              <motion.circle
                cx="18"
                cy="18"
                r={r}
                fill="none"
                strokeWidth="3.5"
                strokeLinecap="round"
                className="stroke-blue-500"
                strokeDasharray={c}
                initial={false}
                animate={{ strokeDashoffset: c - (c * pct) / 100 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </svg>
            <div className="leading-tight">
              <p className="text-[12px] font-bold tabular-nums text-slate-900">{pct}%</p>
              <p className="text-[10.5px] font-medium text-slate-500">complete</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting}
            className="group inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-blue-500 pl-5 pr-4 text-[13px] font-semibold text-white shadow-[0_8px_20px_-8px_rgba(59,130,246,0.65)] transition hover:bg-blue-600 active:scale-[0.98] disabled:opacity-70"
          >
            {submitting ? 'Submitting…' : 'Submit'}
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            )}
          </button>
        </div>
      </div>

      <nav aria-label="Onboarding steps" className="overflow-x-auto border-t border-slate-100 px-4 pb-4 pt-5 sm:px-6">
        <ol className="relative grid min-w-[880px] grid-cols-6">
          <span aria-hidden className="absolute top-[13px] h-[3px] rounded-full bg-slate-100" style={{ left: edge, right: edge }}>
            <motion.span
              initial={false}
              animate={{ width: `${(activeIdx / (total - 1)) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-blue-500 to-blue-400"
            />
          </span>

          {steps.map((step, idx) => {
            const state = stateOf(idx, activeIdx);
            return (
              <li key={step.key} className="relative flex justify-center">
                <button
                  type="button"
                  onClick={() => onStep(idx)}
                  aria-current={state === 'current' ? 'step' : undefined}
                  className="group flex flex-col items-center gap-2.5 px-2 text-center"
                >
                  <span
                    className={cn(
                      'grid h-7 w-7 place-items-center rounded-full text-[11px] font-bold tabular-nums transition-all',
                      state === 'current' && 'bg-white ring-[3px] ring-blue-500 shadow-[0_0_0_7px_rgba(59,130,246,0.12)]',
                      state === 'done' && 'bg-blue-500 text-white',
                      state === 'upcoming' && 'bg-white text-slate-400 ring-2 ring-slate-200 group-hover:ring-blue-300 group-hover:text-blue-600',
                    )}
                  >
                    {state === 'done' && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                    {state === 'current' && <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />}
                    {state === 'upcoming' && idx + 1}
                  </span>
                  <span className="leading-tight">
                    <span
                      className={cn(
                        'block font-mono text-[10px] tracking-[0.08em]',
                        state === 'upcoming' ? 'text-slate-400' : 'text-blue-600',
                      )}
                    >
                      STEP {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span
                      className={cn(
                        'mt-0.5 block text-[12.5px]',
                        state === 'current' && 'font-semibold text-slate-900',
                        state === 'done' && 'font-medium text-slate-700',
                        state === 'upcoming' && 'font-medium text-slate-500 group-hover:text-slate-800',
                      )}
                    >
                      {step.label}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * 4 · Progress Tiles — step cards with progress bars, chained by chevrons
 * ──────────────────────────────────────────────────────────────────────────── */
export function OnboardingHeaderTiles({ activeIdx, onStep, onBack, onSubmit, submitting }: OnboardingHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_16px_36px_-24px_rgba(15,23,42,0.2)]">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-32 h-72 w-[28rem] rounded-full bg-[radial-gradient(closest-side,rgba(59,130,246,0.14),transparent)]"
      />

      <div className="relative flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
        <div className="flex items-center gap-3.5">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-400 to-blue-500 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_8px_18px_-8px_rgba(59,130,246,0.7)]">
            <UserPlus className="h-5 w-5" />
          </span>
          <div className="space-y-0.5">
            <button
              type="button"
              onClick={onBack}
              className="group inline-flex items-center gap-1 text-[11.5px] font-semibold text-slate-500 transition hover:text-blue-600"
            >
              <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" />
              Back to Directory
            </button>
            <h1 className="text-xl font-bold tracking-[-0.02em] text-slate-900 sm:text-[22px]">New Customer Onboarding</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            className="inline-flex h-10 items-center rounded-xl px-3.5 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            Save draft
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting}
            className="group inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-blue-500 px-4 text-[13px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_6px_16px_-6px_rgba(59,130,246,0.6)] transition hover:bg-blue-600 active:scale-[0.98] disabled:opacity-70"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {submitting ? 'Submitting…' : 'Submit'}
            {!submitting && <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />}
          </button>
        </div>
      </div>

      <nav aria-label="Onboarding steps" className="relative overflow-x-auto border-t border-slate-100 p-2">
        <ol className="flex min-w-[1080px] items-stretch">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const state = stateOf(idx, activeIdx);
            return (
              <React.Fragment key={step.key}>
                <li className="min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => onStep(idx)}
                    aria-current={state === 'current' ? 'step' : undefined}
                    className={cn(
                      'group h-full w-full rounded-xl px-3 pb-2.5 pt-2 text-left transition',
                      state === 'current' ? 'bg-blue-50/80 ring-1 ring-inset ring-blue-100' : 'hover:bg-slate-50',
                    )}
                  >
                    <span className="relative block h-1 overflow-hidden rounded-full bg-slate-200/80">
                      <motion.span
                        initial={false}
                        animate={{ scaleX: state === 'upcoming' ? 0 : 1 }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        className={cn(
                          'absolute inset-0 origin-left rounded-full',
                          state === 'current' ? 'bg-blue-500' : 'bg-blue-300',
                        )}
                      />
                    </span>
                    <span className="mt-2 flex items-center gap-2">
                      <span
                        className={cn(
                          'grid h-7 w-7 shrink-0 place-items-center rounded-lg transition',
                          state === 'current' && 'bg-blue-500 text-white shadow-[0_4px_10px_-4px_rgba(59,130,246,0.7)]',
                          state === 'done' && 'bg-blue-100 text-blue-600',
                          state === 'upcoming' && 'bg-slate-100 text-slate-500 group-hover:text-slate-700',
                        )}
                      >
                        {state === 'done' ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <Icon className="h-3.5 w-3.5" />}
                      </span>
                      <span className="min-w-0 leading-tight">
                        <span
                          className={cn(
                            'block text-[9.5px] font-bold uppercase tracking-[0.1em]',
                            state === 'upcoming' ? 'text-slate-400' : 'text-blue-600',
                          )}
                        >
                          Step {idx + 1}
                          <span className="sr-only"> ({STATUS_TEXT[state]})</span>
                        </span>
                        <span
                          className={cn(
                            'block truncate text-[12px] font-semibold',
                            state === 'current' ? 'text-slate-900' : state === 'done' ? 'text-slate-700' : 'text-slate-500',
                          )}
                        >
                          {step.label}
                        </span>
                      </span>
                    </span>
                  </button>
                </li>
                {idx < total - 1 && (
                  <li aria-hidden className="grid w-5 shrink-0 place-items-center">
                    <ChevronRight className={cn('h-4 w-4', state === 'done' ? 'text-blue-400' : 'text-slate-300')} />
                  </li>
                )}
              </React.Fragment>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * 5 · Expanding Pills — icon nodes on a rail; the current step expands to a pill
 * ──────────────────────────────────────────────────────────────────────────── */
export function OnboardingHeaderPills({ activeIdx, onStep, onBack, onSubmit, submitting }: OnboardingHeaderProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <div className="rounded-[24px] bg-gradient-to-br from-blue-200/90 via-slate-200/70 to-slate-100 p-px shadow-[0_18px_40px_-28px_rgba(59,130,246,0.45)]">
      <div className="rounded-[23px] bg-white">
        <div className="flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={onBack}
              className="group inline-flex items-center gap-2 text-[12px] font-medium text-slate-500 transition hover:text-blue-600"
            >
              <span className="grid h-5 w-5 place-items-center rounded-full bg-slate-100 transition group-hover:bg-blue-500 group-hover:text-white">
                <ArrowLeft className="h-3 w-3" />
              </span>
              Back to Directory
            </button>
            <div>
              <h1 className="text-[22px] font-semibold tracking-[-0.025em] text-slate-900 sm:text-2xl">
                New Customer Onboarding
              </h1>
              <p className="mt-0.5 text-[12px] text-slate-500">Individual · Registration request</p>
            </div>
          </div>

          <div className="relative self-start sm:self-auto">
            <div className="inline-flex h-10 overflow-hidden rounded-xl bg-blue-500 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_6px_18px_-6px_rgba(59,130,246,0.6)]">
              <button
                type="button"
                onClick={onSubmit}
                disabled={submitting}
                className="inline-flex items-center gap-2 pl-4 pr-3.5 text-[13px] font-semibold transition hover:bg-blue-600 disabled:opacity-70"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {submitting ? 'Submitting…' : 'Submit'}
              </button>
              <span className="my-2 w-px bg-white/25" />
              <button
                type="button"
                aria-label="More submit options"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((o) => !o)}
                className="grid w-9 place-items-center transition hover:bg-blue-600"
              >
                <ChevronDown className={cn('h-4 w-4 transition-transform', menuOpen && 'rotate-180')} />
              </button>
            </div>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.14 }}
                  className="absolute left-0 top-full z-20 mt-2 w-52 origin-top rounded-xl bg-white p-1 shadow-[0_12px_32px_-12px_rgba(15,23,42,0.25)] ring-1 ring-slate-900/[0.06] sm:left-auto sm:right-0 sm:origin-top-right"
                >
                  {[
                    { label: 'Save as draft', submits: false },
                    { label: 'Submit & add another', submits: true },
                  ].map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        if (item.submits) onSubmit();
                      }}
                      className="flex w-full items-center rounded-lg px-3 py-2 text-left text-[12.5px] font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
                    >
                      {item.label}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </div>
        </div>

        <nav aria-label="Onboarding steps" className="overflow-x-auto border-t border-slate-100 px-4 py-3 sm:px-5">
          <ol className="flex w-full min-w-[760px] items-center">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const state = stateOf(idx, activeIdx);
              return (
                <React.Fragment key={step.key}>
                  <motion.li layout transition={{ type: 'spring', stiffness: 420, damping: 34 }} className="shrink-0">
                    <button
                      type="button"
                      title={step.label}
                      aria-label={`Step ${idx + 1}: ${step.label}`}
                      aria-current={state === 'current' ? 'step' : undefined}
                      onClick={() => onStep(idx)}
                      className={cn(
                        'inline-flex h-9 items-center gap-2 rounded-full text-[12.5px] font-semibold transition-colors',
                        state === 'current' && 'bg-blue-500 pl-1.5 pr-4 text-white shadow-[0_6px_14px_-6px_rgba(59,130,246,0.7)]',
                        state === 'done' && 'w-9 justify-center bg-blue-500 text-white hover:bg-blue-600',
                        state === 'upcoming' &&
                          'w-9 justify-center bg-white text-slate-400 ring-1 ring-inset ring-slate-200 hover:text-blue-600 hover:ring-blue-300',
                      )}
                    >
                      <span
                        className={cn(
                          'grid shrink-0 place-items-center rounded-full',
                          state === 'current' && 'h-6 w-6 bg-white text-blue-600',
                        )}
                      >
                        {state === 'done' ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <Icon className="h-3.5 w-3.5" />}
                      </span>
                      {state === 'current' && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.1 }}
                          className="whitespace-nowrap"
                        >
                          <span className="mr-1.5 tabular-nums text-blue-100">
                            {idx + 1}/{total}
                          </span>
                          {step.label}
                        </motion.span>
                      )}
                    </button>
                  </motion.li>
                  {idx < total - 1 && (
                    <motion.li
                      layout
                      aria-hidden
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      className="relative mx-2 h-[3px] min-w-4 flex-1 overflow-hidden rounded-full bg-slate-100"
                    >
                      <motion.span
                        initial={false}
                        animate={{ scaleX: state === 'done' ? 1 : 0 }}
                        transition={{ duration: 0.35, ease: 'easeOut' }}
                        className="absolute inset-0 origin-left rounded-full bg-gradient-to-r from-blue-500 to-sky-400"
                      />
                    </motion.li>
                  )}
                </React.Fragment>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
}
