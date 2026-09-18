'use client';

import React, { useState } from 'react';
import { X, AlertTriangle, RotateCcw, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Designs for the reject / resubmit decision dialog used by
 * ViewIndividualDialog. These are reason-capture dialogs, not confirmations:
 * the decision is already made, so there is no "are you sure" question, no
 * customer badge and no canned reasons — the field is the point of the dialog.
 *
 * Pass `embedded` to drop the fixed overlay and render the card in flow.
 */
export type DecisionAction = 'reject' | 'resubmit';

export interface DecisionDialogProps {
  action: DecisionAction;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
  /** Render the card inline instead of as a fixed-position modal. */
  embedded?: boolean;
}

/** Every tone-dependent string and class, kept literal so Tailwind can see them. */
const TONE = {
  reject: {
    Icon: AlertTriangle,
    title: 'Reject application',
    lede: 'The application will be rejected and returned to the originator.',
    short: 'Reject',
    placeholder: 'Explain why this application is being rejected…',
    error: 'Please provide a reason for rejection.',
    mark: 'bg-rose-600 shadow-lg shadow-rose-600/20 ring-8 ring-rose-50',
    banner: 'bg-rose-50 border-rose-100',
    bar: 'bg-rose-500',
    accentText: 'text-rose-700',
    focus: 'focus:border-rose-400 focus:ring-4 focus:ring-rose-500/10',
    button: 'bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-600/20',
  },
  resubmit: {
    Icon: RotateCcw,
    title: 'Request resubmission',
    lede: 'The application will be sent back for correction and resubmission.',
    short: 'Resubmit',
    placeholder: 'Explain what needs to be corrected before resubmitting…',
    error: 'Please provide a reason for resubmission.',
    mark: 'bg-amber-500 shadow-lg shadow-amber-500/20 ring-8 ring-amber-50',
    banner: 'bg-amber-50 border-amber-100',
    bar: 'bg-amber-500',
    accentText: 'text-amber-700',
    focus: 'focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10',
    button: 'bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/20',
  },
} as const;

const MAX_REASON = 500;

/** Overlay for the real modal, or a plain stage when embedded in the gallery. */
function Frame({
  children,
  onCancel,
  embedded,
}: {
  children: React.ReactNode;
  onCancel: () => void;
  embedded?: boolean;
}) {
  if (embedded) {
    return (
      <div className="flex w-full items-center justify-center rounded-2xl bg-slate-200/60 p-6">
        {children}
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-70 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in duration-200"
    >
      {children}
    </div>
  );
}

/** Shared close button, positioned by the caller. */
function CloseButton({ onCancel, className }: { onCancel: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onCancel}
      title="Close dialog"
      className={cn(
        'absolute rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 cursor-pointer',
        className
      )}
    >
      <X className="h-4 w-4" />
    </button>
  );
}

function ErrorLine({ message }: { message: string }) {
  return (
    <p className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-rose-600">
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      {message}
    </p>
  );
}

/** Reason state plus the validation every variant repeats. */
function useReason(action: DecisionAction, onConfirm: (reason: string) => void) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const update = (value: string) => {
    setReason(value.slice(0, MAX_REASON));
    if (error) setError(null);
  };

  const submit = () => {
    if (!reason.trim()) {
      setError(TONE[action].error);
      return;
    }
    onConfirm(reason.trim());
  };

  return { reason, setReason: update, error, submit };
}

/* ------------------------------------------------------------------ */
/* D1 - Matched Mark, header-row layout                                */
/* ------------------------------------------------------------------ */
export function DecisionDialogMatchedMark({
  action,
  onCancel,
  onConfirm,
  embedded,
}: DecisionDialogProps) {
  const tone = TONE[action];
  const { reason, setReason, error, submit } = useReason(action, onConfirm);

  return (
    <Frame onCancel={onCancel} embedded={embedded}>
      <div
        className="relative w-full max-w-[29rem] overflow-hidden rounded-[26px] bg-white shadow-[0_24px_60px_-20px_rgba(15,23,42,0.3)] ring-1 ring-slate-900/10 animate-in zoom-in-95 slide-in-from-bottom-2 duration-200"
      >
        <CloseButton onCancel={onCancel} className="right-4 top-4 z-10" />

        <div className="px-7 pb-7 pt-7">
          {/* Mark and heading share the left edge with the field below */}
          <div className="flex items-start gap-4 pr-8">
            <div
              className={cn(
                'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
                tone.mark
              )}
            >
              <tone.Icon className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="text-[18px] font-semibold leading-tight tracking-tight text-slate-900">
                {tone.title}
              </h3>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-slate-500">{tone.lede}</p>
            </div>
          </div>

          <textarea
            rows={4}
            autoFocus
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={tone.placeholder}
            className={cn(
              'mt-5 w-full resize-none rounded-xl border px-3.5 py-2.5 text-[13px] text-slate-800 outline-none transition placeholder:text-slate-400',
              error ? 'border-rose-400 ring-4 ring-rose-500/10' : cn('border-slate-200', tone.focus)
            )}
          />
          <div className="mt-1.5 flex items-center justify-between gap-3">
            {error ? <ErrorLine message={error} /> : <span aria-hidden />}
            <span className="shrink-0 font-mono text-[10px] text-slate-400">
              {reason.length}/{MAX_REASON}
            </span>
          </div>

          <div className="mt-5 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onCancel}
              className="h-11 rounded-xl px-5 text-[13px] font-semibold text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submit}
              className={cn(
                'h-11 rounded-xl px-6 text-[13px] font-semibold text-white transition cursor-pointer',
                tone.button
              )}
            >
              {tone.short}
            </button>
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* D2 — Banner Head: tinted header strip, counted field, footer bar    */
/* ------------------------------------------------------------------ */
export function DecisionDialogBannerHead({
  action,
  onCancel,
  onConfirm,
  embedded,
}: DecisionDialogProps) {
  const tone = TONE[action];
  const { reason, setReason, error, submit } = useReason(action, onConfirm);

  return (
    <Frame onCancel={onCancel} embedded={embedded}>
      <div
        className="relative w-full max-w-[28rem] overflow-hidden rounded-2xl bg-white shadow-[0_24px_60px_-20px_rgba(15,23,42,0.3)] ring-1 ring-slate-900/10 animate-in zoom-in-95 duration-200"
      >
        {/* Tinted banner */}
        <div className={cn('flex items-start gap-3.5 border-b px-6 py-5', tone.banner)}>
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-2xs',
              tone.accentText
            )}
          >
            <tone.Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1 pr-6">
            <h3 className="text-[16px] font-semibold leading-tight text-slate-900">{tone.title}</h3>
            <p className="mt-1 text-[12px] leading-relaxed text-slate-600">{tone.lede}</p>
          </div>
          <CloseButton onCancel={onCancel} className="right-3 top-3" />
        </div>

        <div className="px-6 py-5">
          <div className="flex justify-end">
            <span className="font-mono text-[10px] text-slate-400">
              {reason.length}/{MAX_REASON}
            </span>
          </div>
          <textarea
            rows={5}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={tone.placeholder}
            className={cn(
              'mt-2 w-full resize-none rounded-xl border px-3.5 py-3 text-[13px] text-slate-800 outline-none transition placeholder:text-slate-400',
              error ? 'border-rose-400 ring-4 ring-rose-500/10' : cn('border-slate-200', tone.focus)
            )}
          />
          {error && <ErrorLine message={error} />}
        </div>

        <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 bg-slate-50 px-6 py-3.5">
          <button
            type="button"
            onClick={onCancel}
            className="h-9 rounded-lg px-4 text-[12px] font-semibold text-slate-500 transition hover:bg-slate-200/70 hover:text-slate-900 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            className={cn(
              'h-9 rounded-lg px-4 text-[12px] font-semibold text-white transition cursor-pointer',
              tone.button
            )}
          >
            {tone.short}
          </button>
        </div>
      </div>
    </Frame>
  );
}
