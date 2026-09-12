'use client';

import React from 'react';
import { X, Check, ShieldCheck, Sparkles, Hash } from 'lucide-react';

/**
 * Alternative designs for the "Approve Application" confirmation dialog used by
 * ViewIndividualDialog. Both are light-themed, centre their information in the
 * body, share the same props, and are drop-in interchangeable.
 *
 * Pass `embedded` to drop the fixed overlay and render the card in flow — used
 * by the /approve-dialog-variants gallery.
 */
export interface ApproveDialogProps {
  customerName: string;
  customerId: string;
  /** Stage the application moves into once approved. */
  nextStage?: string;
  onCancel: () => void;
  onConfirm: () => void;
  /** Render the card inline instead of as a fixed-position modal. */
  embedded?: boolean;
}

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
      onClick={onCancel}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* V1 — Aurora Light: frosted white card lit by a soft emerald glow    */
/* ------------------------------------------------------------------ */
export function ApproveDialogAuroraGlass({
  customerName,
  customerId,
  nextStage = 'Senior Review',
  onCancel,
  onConfirm,
  embedded,
}: ApproveDialogProps) {
  return (
    <Frame onCancel={onCancel} embedded={embedded}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md overflow-hidden rounded-[26px] bg-white shadow-[0_24px_60px_-20px_rgba(15,23,42,0.3)] ring-1 ring-slate-900/10 animate-in zoom-in-95 slide-in-from-bottom-2 duration-200"
      >
        <button
          type="button"
          onClick={onCancel}
          title="Close dialog"
          className="absolute right-4 top-4 z-10 rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="px-8 pb-7 pt-10">
          {/* Solid mark inside a flat halo — no gradient, no blur */}
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 shadow-lg shadow-emerald-600/20 ring-8 ring-emerald-50">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>

          <h3 className="text-center text-[22px] font-bold leading-tight tracking-tight text-slate-900">
            Approve this application?
          </h3>
          <p className="mx-auto mt-2.5 max-w-[19rem] text-center text-[13px] leading-relaxed text-slate-500">
            The application will be authorized and advanced to {nextStage}.
          </p>

          {/* Subject — one badge carrying both name and ID */}
          <div className="mt-6 flex justify-center">
            <span className="inline-flex max-w-full items-center gap-2.5 rounded-full bg-slate-50 px-4 py-2 ring-1 ring-slate-200">
              <span className="truncate text-[13px] font-semibold text-slate-900">
                {customerName}
              </span>
              <span aria-hidden className="h-3.5 w-px shrink-0 bg-slate-300" />
              <span className="shrink-0 font-mono text-[11px] tracking-tight text-slate-500">
                {customerId}
              </span>
            </span>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onCancel}
              className="h-11 rounded-xl text-[13px] font-semibold text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="h-11 rounded-xl bg-emerald-600 text-[13px] font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 cursor-pointer"
            >
              Approve
            </button>
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* V2 — Quiet Focus: airy, centred, ripple rings, stacked actions      */
/* ------------------------------------------------------------------ */
export function ApproveDialogQuietFocus({
  customerName,
  customerId,
  nextStage = 'Senior Review',
  onCancel,
  onConfirm,
  embedded,
}: ApproveDialogProps) {
  return (
    <Frame onCancel={onCancel} embedded={embedded}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[26rem] overflow-hidden rounded-[32px] bg-white px-8 pb-7 pt-11 text-center shadow-[0_30px_70px_-22px_rgba(15,23,42,0.35)] ring-1 ring-slate-900/5 animate-in zoom-in-95 duration-200"
      >
        {/* Gradient hairline */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400"
        />

        <button
          type="button"
          onClick={onCancel}
          title="Close dialog"
          className="absolute right-5 top-5 rounded-full p-1.5 text-slate-300 transition hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Concentric rings */}
        <div className="relative mx-auto mb-7 flex h-20 w-20 items-center justify-center">
          <span
            aria-hidden
            className="absolute h-20 w-20 rounded-full bg-emerald-500/5 ring-1 ring-emerald-500/10"
          />
          <span
            aria-hidden
            className="absolute h-14 w-14 rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/15"
          />
          <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30">
            <Check className="h-5 w-5 text-white" strokeWidth={3} />
          </span>
        </div>

        <h3 className="text-[21px] font-bold leading-tight tracking-tight text-slate-900">
          Approve application
        </h3>
        <p className="mx-auto mt-3 max-w-[20rem] text-[13px] leading-relaxed text-slate-500">
          You are approving the application for{' '}
          <span className="font-semibold text-slate-900">{customerName}</span>. It moves to{' '}
          <span className="font-semibold text-slate-900">{nextStage}</span> once confirmed.
        </p>

        <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3.5 py-1.5 font-mono text-[11px] tracking-tight text-slate-600">
          <Hash className="h-3 w-3 text-slate-400" />
          {customerId}
        </div>

        <div className="mt-7 space-y-2.5">
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 text-[14px] font-bold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-700 hover:shadow-emerald-700/30 cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            Yes, approve it
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="h-11 w-full rounded-2xl text-[13px] font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 cursor-pointer"
          >
            Not now
          </button>
        </div>
      </div>
    </Frame>
  );
}
