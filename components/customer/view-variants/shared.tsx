'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  CUSTOMER_TYPES,
  formatFieldValue,
  getCustomerType,
  type CustomerTypeField,
  type SegmentTone,
} from '@/lib/customer-types';
import type { CustomerTypeFieldValue, CustomerTypeId, CustomerTypeRecord, Individual } from '@/types';
import { customerName } from '../CustomerTypeForm';

export interface CustomerTypeViewProps {
  /** Record the view was opened from; identifies the customer */
  record: CustomerTypeRecord;
  /** Tab to open on (defaults to the record's type) */
  initialTypeId?: CustomerTypeId;
  records: CustomerTypeRecord[];
  customers: Individual[];
  onClose: () => void;
  /** Render inline (scratch page) instead of as a modal overlay */
  embedded?: boolean;
}

/** Active tab, the customer, and their records per type */
export function useCustomerView({ record, initialTypeId, records, customers }: CustomerTypeViewProps) {
  const [activeTypeId, setActiveTypeId] = useState<CustomerTypeId>(initialTypeId ?? record.typeId);

  const customer = customers.find((item) => item.id === record.customerId);
  const name = customer ? customerName(customer) : 'Unknown customer';
  const activeType = getCustomerType(activeTypeId);

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

  return { customer, name, activeType, activeTypeId, setActiveTypeId, typeRecords, countByType };
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

const PILL: Record<SegmentTone, string> = {
  primary: 'bg-blue-50 text-blue-700',
  success: 'bg-emerald-50 text-emerald-700',
  danger: 'bg-rose-50 text-rose-700',
};

const DOT: Record<SegmentTone, string> = {
  primary: 'bg-blue-500',
  success: 'bg-emerald-600',
  danger: 'bg-rose-600',
};

/** Display node for a stored value; segmented values render as a status pill */
export function fieldDisplay(field: CustomerTypeField, value: CustomerTypeFieldValue | undefined): React.ReactNode {
  if (field.type === 'segmented' && typeof value === 'string' && value !== '') {
    const tone = field.optionTones?.[value] ?? 'primary';
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
          PILL[tone]
        )}
      >
        <span className={cn('h-1.5 w-1.5 rounded-full', DOT[tone])} />
        {value}
      </span>
    );
  }
  return formatFieldValue(field, value);
}

export function valueClassFor(field: CustomerTypeField): string | undefined {
  if (field.type === 'date' || field.type === 'number' || field.type === 'computed') return 'font-mono';
  if (field.type === 'textarea') return 'whitespace-pre-wrap';
  return undefined;
}
