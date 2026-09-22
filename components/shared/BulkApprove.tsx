'use client';

import React from 'react';
import { ShieldCheck, X } from 'lucide-react';

export const ROW_CHECKBOX = 'h-4 w-4 cursor-pointer rounded border-slate-300 accent-blue-600 disabled:cursor-not-allowed disabled:opacity-30';

/** Floating so it stays in reach while scrolling a long list */
export function BulkApproveBar({
  idPrefix,
  count,
  onClear,
  onApprove,
}: {
  idPrefix: string;
  count: number;
  onClear: () => void;
  onApprove: () => void;
}) {
  return (
    <div
      role="toolbar"
      aria-label="Bulk actions"
      className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-4 rounded-2xl border border-slate-200 bg-white py-2 pl-4 pr-2 shadow-[0_18px_40px_-12px_rgba(15,23,42,0.35)] animate-in fade-in slide-in-from-bottom-3"
    >
      <span className="text-xs font-semibold text-slate-900">{count} selected</span>
      <span aria-hidden className="h-5 w-px bg-slate-200" />
      <button
        id={`btn-${idPrefix}-clear-selection`}
        type="button"
        onClick={onClear}
        className="cursor-pointer text-xs font-semibold text-slate-500 transition hover:text-slate-800"
      >
        Clear
      </button>
      <button
        id={`btn-${idPrefix}-bulk-approve`}
        type="button"
        onClick={onApprove}
        className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 text-xs font-semibold text-white shadow-sm shadow-emerald-600/20 transition hover:bg-emerald-700"
      >
        <ShieldCheck className="h-3.5 w-3.5" />
        Bulk Approve
      </button>
    </div>
  );
}

export function BulkApproveDialog({
  idPrefix,
  count,
  noun,
  onCancel,
  onConfirm,
}: {
  idPrefix: string;
  count: number;
  /** Singular and plural name of what's approved, e.g. ['application', 'applications'] */
  noun: [string, string];
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-[26px] bg-white shadow-[0_24px_60px_-20px_rgba(15,23,42,0.3)] ring-1 ring-slate-900/10 animate-in zoom-in-95 slide-in-from-bottom-2 duration-200">
        <button
          type="button"
          onClick={onCancel}
          title="Close dialog"
          className="absolute right-4 top-4 z-10 cursor-pointer rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="px-8 pb-7 pt-10">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 shadow-lg shadow-emerald-600/20 ring-8 ring-emerald-50">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>

          <h3 className="text-center text-[22px] font-semibold leading-tight tracking-tight text-slate-900">
            Bulk approve requests?
          </h3>
          <p className="mx-auto mt-2.5 max-w-[20rem] text-center text-[13px] leading-relaxed text-slate-500">
            {/* The count is what gets checked before confirming, so it reads darker than the sentence */}
            The <span className="font-semibold text-slate-900">{count} selected {count === 1 ? noun[0] : noun[1]}</span> will
            be approved and advanced to the next review stage.
          </p>

          <div className="mt-7 grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onCancel}
              className="h-11 cursor-pointer rounded-xl text-[13px] font-semibold text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              id={`btn-${idPrefix}-bulk-approve-confirm`}
              type="button"
              onClick={onConfirm}
              className="h-11 cursor-pointer rounded-xl bg-emerald-600 text-[13px] font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
            >
              Bulk Approve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
