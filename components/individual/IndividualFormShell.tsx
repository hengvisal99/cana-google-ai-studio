'use client';

import React from 'react';
import { ArrowLeft, ArrowRight, Check, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

// Arrow-shaped step segment: notched on the left (except first), pointed on the right (except last).
const STEP_NOTCH = 14;
const stepClipPath = (idx: number, count: number) => {
  const right =
    idx === count - 1
      ? '100% 0, 100% 100%'
      : `calc(100% - ${STEP_NOTCH}px) 0, 100% 50%, calc(100% - ${STEP_NOTCH}px) 100%`;
  const left = idx === 0 ? '0 100%' : `0 100%, ${STEP_NOTCH}px 50%`;
  return `polygon(0 0, ${right}, ${left})`;
};

export type FormStep<K extends string> = { key: K; label: string };

/**
 * The shell both individual forms sit in: back link and title, the arrow step bar,
 * the form card, and the previous / next / submit footer.
 */
export function IndividualFormShell<K extends string>({
  screenId,
  backLabel,
  onBack,
  title,
  badge,
  steps,
  activeStep,
  onStepChange,
  submitLabel,
  submittingLabel,
  isSubmitting,
  onSubmit,
  children,
}: {
  screenId: string;
  backLabel: string;
  onBack: () => void;
  title: string;
  badge?: React.ReactNode;
  steps: FormStep<K>[];
  activeStep: K;
  onStepChange: (key: K) => void;
  submitLabel: string;
  submittingLabel: string;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
}) {
  const activeIdx = steps.findIndex((step) => step.key === activeStep);
  const isLastStep = activeIdx === steps.length - 1;

  return (
    <div id={screenId} className="space-y-5 pb-12 animate-in fade-in duration-200">
      {/* Header + stepper card */}
      <div className="rounded-[22px] bg-white/90 ring-1 ring-slate-900/[0.06] shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-16px_rgba(15,23,42,0.14)] backdrop-blur-xl">
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <button
              type="button"
              onClick={onBack}
              className="group -mx-2 -my-1 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[12.5px] font-semibold text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
              <span>{backLabel}</span>
            </button>
            <div className="flex items-center gap-2.5">
              <h1 className="text-[22px] font-semibold tracking-[-0.025em] text-slate-900 sm:text-2xl">{title}</h1>
              {badge}
            </div>
          </div>
        </div>

        <nav aria-label="Form steps" className="border-t border-slate-100 p-2.5 overflow-x-auto">
          <ol className="flex w-full min-w-[1080px]">
            {steps.map((step, idx) => {
              const isActive = idx === activeIdx;
              const isPassed = idx < activeIdx;
              return (
                <li key={step.key} className="min-w-0 flex-1" style={{ marginLeft: idx === 0 ? 0 : -8 }}>
                  <button
                    type="button"
                    onClick={() => onStepChange(step.key)}
                    aria-current={isActive ? 'step' : undefined}
                    style={{ clipPath: stepClipPath(idx, steps.length) }}
                    className={cn(
                      'flex h-11 w-full items-center gap-2.5 text-left transition-colors cursor-pointer',
                      idx === 0 ? 'rounded-l-xl pl-3' : 'pl-[26px]',
                      idx === steps.length - 1 ? 'rounded-r-xl pr-4' : 'pr-6',
                      isActive && 'bg-blue-500 text-white',
                      isPassed && 'bg-blue-500 text-white hover:bg-blue-500/90',
                      !isActive && !isPassed && 'bg-slate-100/70 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                    )}
                  >
                    <span
                      className={cn(
                        'grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10.5px] font-bold tabular-nums',
                        isActive && 'bg-white text-blue-600 shadow-[0_0_0_3px_rgba(255,255,255,0.25)]',
                        isPassed && 'bg-white text-blue-600',
                        !isActive && !isPassed && 'bg-white text-slate-500 ring-1 ring-slate-200'
                      )}
                    >
                      {isPassed ? <Check className="h-3 w-3" strokeWidth={3} /> : idx + 1}
                    </span>
                    <span className={cn('min-w-0 truncate text-[12.5px]', isActive ? 'font-bold' : 'font-medium')}>
                      {step.label}
                      <span className="sr-only">
                        {isActive ? ' (current step)' : isPassed ? ' (completed)' : ' (upcoming)'}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      {/* Glass Form Card */}
      <div className="p-5 sm:p-7 bg-white/90 backdrop-blur-xl border border-slate-200/90 shadow-sm rounded-2xl">
        {children}

        {/* Footer navigation: sticks to the viewport bottom so Next / Submit stay reachable on long steps */}
        <div className="sticky bottom-0 z-10 -mx-5 -mb-5 mt-8 flex items-center justify-between gap-4 rounded-b-2xl border-t border-slate-100 bg-white/95 px-5 py-4 backdrop-blur sm:-mx-7 sm:-mb-7 sm:px-7">
          <button
            type="button"
            onClick={() => {
              if (activeIdx > 0) onStepChange(steps[activeIdx - 1].key);
            }}
            disabled={activeIdx <= 0}
            className="h-10 px-3 rounded-xl text-[13px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition disabled:opacity-40 cursor-pointer flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous Step</span>
          </button>

          <div className="flex items-center gap-2">
            {!isLastStep ? (
              <button
                type="button"
                onClick={() => {
                  if (activeIdx < steps.length - 1) onStepChange(steps[activeIdx + 1].key);
                }}
                className="h-10 px-3 rounded-xl text-[13px] font-bold text-white bg-blue-500 hover:bg-blue-600 shadow-xs transition cursor-pointer flex items-center gap-2"
              >
                <span>Next Step</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              // Last step: the only submit action, in the same spot and colour as Next
              <button
                type="button"
                onClick={onSubmit}
                disabled={isSubmitting}
                className="h-10 px-3 rounded-xl text-[13px] font-bold text-white bg-blue-500 hover:bg-blue-600 shadow-xs transition cursor-pointer disabled:opacity-70 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{isSubmitting ? submittingLabel : submitLabel}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
