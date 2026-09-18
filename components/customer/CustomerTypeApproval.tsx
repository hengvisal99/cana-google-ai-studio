'use client';

import React, { useEffect, useId, useState } from 'react';
import { format } from 'date-fns';
import { AlertCircle, AlertTriangle, CalendarX2, CheckCircle2, Clock, X, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CustomerTypeApproval, RequestStatus } from '@/types';
import { FormDatePicker } from '@/components/ui/form';

/** Same icons and colours as the Request column in the customer list */
const STATUS_ICON: Record<RequestStatus, { icon: LucideIcon; color: string }> = {
  Pending: { icon: Clock, color: 'text-yellow-500' },
  Resubmit: { icon: AlertCircle, color: 'text-orange-600' },
  Approved: { icon: CheckCircle2, color: 'text-emerald-500' },
  Rejected: { icon: AlertTriangle, color: 'text-rose-500' },
};

const isReviewer = (role?: string): role is 'SR' | 'Manager' => role === 'SR' || role === 'Manager';

/** Status + reviewer, request type below; matches the customer list's Request column */
export function ApprovalStatus({ approval }: { approval?: CustomerTypeApproval }) {
  if (!approval) return <span className="text-slate-400">—</span>;
  const { icon: Icon, color } = STATUS_ICON[approval.requestStatus];
  // Reviewer after the dot: the current stage while in review, otherwise whoever last acted on it
  const reviewer =
    approval.requestStatus === 'Approved'
      ? undefined
      : isReviewer(approval.currentWorkflowStage)
        ? approval.currentWorkflowStage
        : [...approval.history].reverse().find((item) => isReviewer(item.role))?.role;

  return (
    <div className="flex select-none items-start gap-2.5 py-0.5 text-left">
      <Icon className={cn('mt-0.5 h-4 w-4 shrink-0 stroke-[2.2]', color)} />
      <div className="flex flex-col">
        <div className="flex items-center gap-1 leading-tight">
          <span className="text-[13px] font-semibold text-slate-900">{approval.requestStatus}</span>
          {reviewer && (
            <>
              <span className="text-xs font-semibold text-slate-400">·</span>
              <span className="text-xs font-semibold text-slate-600">{reviewer}</span>
            </>
          )}
        </div>
        <span className="mt-0.5 text-[11px] font-normal leading-tight text-slate-500">
          {approval.currentWorkflowStage === 'Closed' ? 'Closed' : approval.requestType}
        </span>
      </div>
    </div>
  );
}

/** Close account for a customer type record: only the cancelled date is captured */
export function CloseAccountDialog({
  recordId,
  customerLabel,
  onCancel,
  onSubmit,
}: {
  recordId: string;
  customerLabel: string;
  onCancel: () => void;
  onSubmit: (cancelledDate: string) => void;
}) {
  const titleId = useId();
  const [cancelledDate, setCancelledDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [error, setError] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  const submit = () => {
    if (!cancelledDate) {
      setError(true);
      return;
    }
    onSubmit(cancelledDate);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl animate-in fade-in zoom-in-95"
      >
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-rose-50 text-rose-600">
            <CalendarX2 className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 id={titleId} className="text-sm font-semibold text-slate-900">
              Close Account
            </h3>
            <p className="mt-0.5 truncate text-xs text-slate-500">
              <span className="font-mono">{recordId}</span> · {customerLabel}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            title="Close"
            className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4">
          <label htmlFor="close-account-cancelled-date" className="mb-1 block text-[11px] font-semibold text-slate-600">
            Cancelled Date<span className="text-rose-500"> *</span>
          </label>
          <FormDatePicker
            id="close-account-cancelled-date"
            value={cancelledDate}
            onChange={(value) => {
              setCancelledDate(value);
              setError(false);
            }}
            className={cn(error && 'border-rose-300 focus:border-rose-400 focus:ring-rose-100')}
          />
          {error && (
            <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-rose-600">
              <AlertCircle className="h-3.5 w-3.5" />
              Cancelled Date is required
            </p>
          )}
          <p className="mt-2 text-[11px] text-slate-500">The request goes to SR and Manager for approval.</p>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            className="cursor-pointer rounded-lg bg-rose-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
          >
            Submit request
          </button>
        </div>
      </div>
    </div>
  );
}
