'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  CUSTOMER_TYPES,
  formatFieldValue,
  getCustomerType,
  type CustomerTypeField,
  type SegmentTone,
} from '@/lib/customer-types';
import { DossierCard, Field } from '@/components/shared/DossierCard';
import type { CustomerTypeFieldValue, CustomerTypeId, CustomerTypeRecord, Individual } from '@/types';
import { customerName } from './CustomerTypeForm';

// Same pill treatment as the customer view (ViewIndividualDialog)
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

function displayValue(field: CustomerTypeField, value: CustomerTypeFieldValue | undefined): React.ReactNode {
  if (value === undefined || value === '') return undefined;

  if (field.type === 'segmented' && typeof value === 'string') {
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

function valueClassFor(field: CustomerTypeField): string | undefined {
  if (field.type === 'date' || field.type === 'number' || field.type === 'computed') return 'font-mono';
  if (field.type === 'textarea') return 'whitespace-pre-wrap';
  return undefined;
}

interface CustomerTypeViewDialogProps {
  /** Record the view was opened from; identifies the customer */
  record: CustomerTypeRecord;
  /** Tab to open on (defaults to the record's type) */
  initialTypeId?: CustomerTypeId;
  /** All records; the view shows this customer's records per type tab */
  records: CustomerTypeRecord[];
  customers: Individual[];
  onClose: () => void;
}

/** One customer's customer type records, a tab per type, laid out like the customer view dialog */
export function CustomerTypeViewDialog({
  record,
  initialTypeId,
  records,
  customers,
  onClose,
}: CustomerTypeViewDialogProps) {
  const [activeTypeId, setActiveTypeId] = useState<CustomerTypeId>(initialTypeId ?? record.typeId);

  const customer = customers.find((item) => item.id === record.customerId);
  const name = customer ? customerName(customer) : 'Unknown customer';

  const activeType = getCustomerType(activeTypeId);
  const ActiveIcon = activeType.icon;
  const detailFields = activeType.fields.filter((field) => field.type !== 'customer');

  const typeRecords = useMemo(
    () =>
      records
        .filter((item) => item.customerId === record.customerId && item.typeId === activeTypeId)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [records, record.customerId, activeTypeId]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      id="customer-type-view-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-3 backdrop-blur-sm animate-in fade-in sm:p-5"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="customer-type-view-title"
        className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-white/80 bg-white/95 text-slate-800 shadow-2xl shadow-blue-950/15 backdrop-blur-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: customer identity */}
        <div className="flex shrink-0 items-start justify-between gap-4 bg-white px-6 py-5">
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
              <h2 id="customer-type-view-title" className="truncate text-xl font-bold tracking-tight text-slate-900">
                {name}
              </h2>
              <div className="mt-1 flex flex-wrap items-center gap-2.5">
                {customer?.fullNameKH && <span className="font-khmer text-sm text-slate-500">{customer.fullNameKH}</span>}
                <span className="rounded-md bg-blue-50 px-2 py-0.5 font-mono text-xs font-semibold text-blue-600">
                  {customer?.customerId ?? record.customerId}
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

        {/* A tab per customer type, styled like the customer view tabs */}
        <div className="flex shrink-0 items-center gap-4 overflow-x-auto border-b border-slate-200 bg-white px-6 text-sm [scrollbar-width:none] lg:gap-6 [&::-webkit-scrollbar]:hidden">
          {CUSTOMER_TYPES.map((type) => {
            const TabIcon = type.icon;
            const isActive = type.id === activeTypeId;
            return (
              <button
                key={type.id}
                id={`view-tab-${type.id}`}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActiveTypeId(type.id)}
                className={cn(
                  'flex cursor-pointer items-center gap-2 whitespace-nowrap border-b-2 py-3 font-medium transition',
                  isActive ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
                )}
              >
                <TabIcon className="h-4 w-4" />
                {type.label}
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto bg-slate-50/70 p-6 text-xs">
          <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-3">
            <div className="space-y-5 lg:col-span-2">
              {typeRecords.length === 0 ? (
                <DossierCard title={`${activeType.label} Details`} plain>
                  <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                      <ActiveIcon className="h-7 w-7" />
                    </div>
                    <p className="text-sm text-slate-500">No {activeType.label} record for this customer yet.</p>
                  </div>
                </DossierCard>
              ) : (
                typeRecords.map((item) => (
                  <DossierCard
                    key={item.id}
                    title={`${activeType.label} Details`}
                    action={<span className="font-mono text-[11px] text-slate-400">{item.id}</span>}
                  >
                    {detailFields.map((field) => (
                      <Field
                        key={field.key}
                        label={field.label}
                        value={displayValue(field, item.values[field.key])}
                        valueClassName={valueClassFor(field)}
                        className={cn(field.type === 'textarea' && 'col-span-full')}
                      />
                    ))}
                    <p className="col-span-full border-t border-slate-100 pt-3 text-[11px] text-slate-400">
                      Created {format(new Date(item.createdAt), 'dd MMM yyyy')} · Last updated{' '}
                      {format(new Date(item.updatedAt), 'dd MMM yyyy, HH:mm')}
                    </p>
                  </DossierCard>
                ))
              )}
            </div>

            {/* Key facts to confirm the right customer; the full profile is one click away */}
            <DossierCard title="Customer Summary" bodyClassName="lg:grid-cols-1">
              <Field
                label="Account Status"
                value={
                  customer?.accountStatus && (
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                        customer.accountStatus === 'Active'
                          ? 'bg-emerald-50 text-emerald-700'
                          : customer.accountStatus === 'Closed'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-slate-100 text-slate-600'
                      )}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {customer.accountStatus}
                    </span>
                  )
                }
              />
              <Field
                label="Trading Account No."
                value={customer?.tradingAccountInfo?.tradingAccountNumber}
                valueClassName="font-mono"
              />
              <Field label="ID Number" value={customer?.idNumber} valueClassName="font-mono" />
              <Field label="Mobile" value={customer?.mobile || customer?.phone} />
              <Field label="Email" value={customer?.email} />
              <Field
                label="Assigned SR"
                value={customer?.tradingAccountInfo?.currentAssignedSR || customer?.relationshipManager}
              />
            </DossierCard>
          </div>
        </div>
      </div>
    </div>
  );
}
