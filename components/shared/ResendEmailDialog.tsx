'use client';

import React from 'react';
import { X, Mail } from 'lucide-react';

/** Overlay for the real modal, or a plain stage when embedded. */
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

/** Confirms resending the registration email to a customer */
export function ResendEmailDialog({
  customerName,
  email,
  onCancel,
  onConfirm,
  embedded,
}: {
  customerName: string;
  email: string;
  onCancel: () => void;
  onConfirm: () => void;
  embedded?: boolean;
}) {
  return (
    <Frame onCancel={onCancel} embedded={embedded}>
      <div
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
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/20 ring-8 ring-blue-50">
            <Mail className="h-6 w-6 text-white" />
          </div>

          <h3 className="text-center text-[22px] font-semibold leading-tight tracking-tight text-slate-900">
            Resend email?
          </h3>
          <p className="mx-auto mt-2.5 max-w-[19rem] text-center text-[13px] leading-relaxed text-slate-500">
            The registration email will be sent again to this customer.
          </p>

          {/* Subject — one badge carrying both name and email */}
          <div className="mt-6 flex justify-center">
            <span className="inline-flex max-w-full items-center gap-2.5 rounded-full bg-slate-50 px-4 py-2 ring-1 ring-slate-200">
              <span className="truncate text-[13px] font-semibold text-slate-900">
                {customerName}
              </span>
              <span aria-hidden className="h-3.5 w-px shrink-0 bg-slate-300" />
              <span className="truncate font-mono text-[11px] tracking-tight text-slate-500">
                {email}
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
              className="h-11 rounded-xl bg-blue-600 text-[13px] font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 cursor-pointer"
            >
              Resend
            </button>
          </div>
        </div>
      </div>
    </Frame>
  );
}
