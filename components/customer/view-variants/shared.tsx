'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import { AtSign, BadgeCheck, CreditCard, Fingerprint, Phone, UserRound, X, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  CUSTOMER_TYPES,
  formatFieldValue,
  getCustomerType,
  type CustomerTypeField,
  type CustomerTypeValues,
  type SegmentTone,
} from '@/lib/customer-types';
import type { CustomerTypeFieldValue, CustomerTypeId, CustomerTypeRecord, Individual } from '@/types';
import { customerName } from '../CustomerTypeForm';

export interface CustomerViewVariantProps {
  /** Record the view was opened from; identifies the customer */
  record: CustomerTypeRecord;
  /** Tab to open on (defaults to the record's type) */
  initialTypeId?: CustomerTypeId;
  records: CustomerTypeRecord[];
  customers: Individual[];
  onClose: () => void;
  /** Render inline (designs page) instead of as a modal overlay */
  embedded?: boolean;
}

/** State and derived data every variant shares */
export function useCustomerView({ record, initialTypeId, records, customers }: CustomerViewVariantProps) {
  const [activeTypeId, setActiveTypeId] = useState<CustomerTypeId>(initialTypeId ?? record.typeId);

  const customer = customers.find((item) => item.id === record.customerId);
  const name = customer ? customerName(customer) : 'Unknown customer';
  const activeType = getCustomerType(activeTypeId);
  const detailFields = activeType.fields.filter((field) => field.type !== 'customer');
  const statusField = detailFields.find((field) => field.type === 'segmented');

  const customerRecords = useMemo(
    () => records.filter((item) => item.customerId === record.customerId),
    [records, record.customerId]
  );

  const countByType = useMemo(() => {
    const counts = Object.fromEntries(CUSTOMER_TYPES.map((type) => [type.id, 0])) as Record<CustomerTypeId, number>;
    customerRecords.forEach((item) => {
      counts[item.typeId] += 1;
    });
    return counts;
  }, [customerRecords]);

  const typeRecords = useMemo(
    () =>
      customerRecords
        .filter((item) => item.typeId === activeTypeId)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [customerRecords, activeTypeId]
  );

  return {
    customer,
    name,
    activeType,
    activeTypeId,
    setActiveTypeId,
    detailFields,
    statusField,
    typeRecords,
    countByType,
  };
}

/** Modal overlay + panel; inline panel when `embedded` */
export function ViewFrame({
  embedded = false,
  onClose,
  titleId,
  className,
  children,
}: {
  embedded?: boolean;
  onClose: () => void;
  titleId: string;
  className?: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (embedded) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [embedded, onClose]);

  const panel = (
    <div
      role="dialog"
      aria-modal={embedded ? undefined : true}
      aria-labelledby={titleId}
      className={cn(
        'flex w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white text-slate-800',
        embedded
          ? 'mx-auto h-[680px] border border-slate-200/80 shadow-xl shadow-slate-900/[0.04]'
          : 'max-h-[92vh] shadow-2xl shadow-blue-950/15 animate-in fade-in zoom-in-95',
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );

  if (embedded) return panel;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-3 backdrop-blur-sm animate-in fade-in sm:p-5"
      onClick={onClose}
    >
      {panel}
    </div>
  );
}

/** Customer identity header — identical across every variant */
export function CustomerHeader({
  titleId,
  customer,
  name,
  fallbackId,
  onClose,
  className,
}: {
  titleId: string;
  customer?: Individual;
  name: string;
  fallbackId: string;
  onClose: () => void;
  className?: string;
}) {
  return (
    <div className={cn('flex shrink-0 items-start justify-between gap-4 bg-white px-6 py-5', className)}>
      <div className="flex min-w-0 items-center gap-4">
        {customer?.avatarUrl ? (
          <Image
            src={customer.avatarUrl}
            alt={name}
            width={56}
            height={56}
            className="h-14 w-14 shrink-0 rounded-full object-cover"
            referrerPolicy="no-referrer"
            unoptimized
          />
        ) : (
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-blue-50 text-lg font-bold text-blue-600">
            {name.charAt(0)}
          </span>
        )}
        <div className="min-w-0">
          <h2 id={titleId} className="truncate text-xl font-bold tracking-tight text-slate-900">
            {name}
          </h2>
          <div className="mt-1 flex flex-wrap items-center gap-2.5">
            {customer?.fullNameKH && <span className="font-khmer text-sm text-slate-500">{customer.fullNameKH}</span>}
            <span className="rounded-md bg-blue-50 px-2 py-0.5 font-mono text-xs font-semibold text-blue-600">
              {customer?.customerId ?? fallbackId}
            </span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="shrink-0 cursor-pointer rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        title="Close"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}

export const PILL: Record<SegmentTone, string> = {
  primary: 'bg-blue-50 text-blue-700',
  success: 'bg-emerald-50 text-emerald-700',
  danger: 'bg-rose-50 text-rose-700',
};

export const DOT: Record<SegmentTone, string> = {
  primary: 'bg-blue-500',
  success: 'bg-emerald-600',
  danger: 'bg-rose-600',
};

export function statusTone(field: CustomerTypeField, value: CustomerTypeFieldValue | undefined): SegmentTone {
  return (typeof value === 'string' && field.optionTones?.[value]) || 'primary';
}

export function Pill({ tone, children, className }: { tone: SegmentTone; children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
        PILL[tone],
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', DOT[tone])} />
      {children}
    </span>
  );
}

export function AccountStatusPill({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
        status === 'Active'
          ? 'bg-emerald-50 text-emerald-700'
          : status === 'Closed'
            ? 'bg-rose-50 text-rose-700'
            : 'bg-slate-100 text-slate-600'
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

/** Display node for a stored value; segmented values render as a pill */
export function fieldDisplay(field: CustomerTypeField, value: CustomerTypeFieldValue | undefined): React.ReactNode {
  if (field.type === 'segmented' && typeof value === 'string' && value !== '') {
    return <Pill tone={statusTone(field, value)}>{value}</Pill>;
  }
  return formatFieldValue(field, value);
}

export function valueClassFor(field: CustomerTypeField): string | undefined {
  if (field.type === 'date' || field.type === 'number' || field.type === 'computed') return 'font-mono';
  if (field.type === 'textarea') return 'whitespace-pre-wrap';
  return undefined;
}

export function recordStamp(item: CustomerTypeRecord): string {
  return `Created ${format(new Date(item.createdAt), 'dd MMM yyyy')} · Last updated ${format(
    new Date(item.updatedAt),
    'dd MMM yyyy, HH:mm'
  )}`;
}

export function EmptyValue() {
  return <span className="text-slate-300">—</span>;
}

export interface SummaryFact {
  key: string;
  label: string;
  icon: LucideIcon;
  /** Plain text (copyable) */
  text?: string;
  /** Rich node, rendered instead of `text` */
  node?: React.ReactNode;
  mono?: boolean;
}

/** Key facts to confirm the right customer */
export function summaryFacts(customer?: Individual): SummaryFact[] {
  return [
    {
      key: 'status',
      label: 'Account Status',
      icon: BadgeCheck,
      text: customer?.accountStatus,
      node: customer?.accountStatus ? <AccountStatusPill status={customer.accountStatus} /> : undefined,
    },
    {
      key: 'trading',
      label: 'Trading Account No.',
      icon: CreditCard,
      text: customer?.tradingAccountInfo?.tradingAccountNumber,
      mono: true,
    },
    { key: 'id', label: 'ID Number', icon: Fingerprint, text: customer?.idNumber, mono: true },
    { key: 'mobile', label: 'Mobile', icon: Phone, text: customer?.mobile || customer?.phone },
    { key: 'email', label: 'Email', icon: AtSign, text: customer?.email },
    {
      key: 'sr',
      label: 'Assigned SR',
      icon: UserRound,
      text: customer?.tradingAccountInfo?.currentAssignedSR || customer?.relationshipManager,
    },
  ];
}

export interface Lifecycle {
  start: Date;
  end: Date;
  startLabel: string;
  endLabel: string;
  /** 0–1 share of the span already elapsed */
  progress: number;
  /** Negative once the end date has passed */
  daysLeft: number;
}

const DAY_MS = 86_400_000;

/** Span from the first date field to the latest one; null when a record has fewer than two dates */
export function recordLifecycle(fields: CustomerTypeField[], values: CustomerTypeValues): Lifecycle | null {
  const dated = fields
    .filter((field) => field.type === 'date')
    .map((field) => ({ field, date: new Date(`${values[field.key]}T00:00:00`) }))
    .filter((item) => !Number.isNaN(item.date.getTime()));
  if (dated.length < 2) return null;

  const first = dated[0];
  const last = dated.slice(1).reduce((latest, item) => (item.date > latest.date ? item : latest));
  const span = last.date.getTime() - first.date.getTime();
  if (span <= 0) return null;

  const now = Date.now();
  return {
    start: first.date,
    end: last.date,
    startLabel: first.field.label,
    endLabel: last.field.label,
    progress: Math.min(1, Math.max(0, (now - first.date.getTime()) / span)),
    daysLeft: Math.ceil((last.date.getTime() - now) / DAY_MS),
  };
}

export function daysLeftText(days: number): string {
  if (days > 0) return `${days} ${days === 1 ? 'day' : 'days'} left`;
  if (days === 0) return 'Ends today';
  return `Ended ${-days} ${days === -1 ? 'day' : 'days'} ago`;
}
