'use client';

import React, { useEffect, useId, useState } from 'react';
import Image from 'next/image';
import { ChevronRight, ClipboardList, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  CUSTOMER_TYPES,
  getListFields,
  type CustomerTypeDefinition,
  type CustomerTypeField,
} from '@/lib/customer-types';
import type { CustomerTypeRecord } from '@/types';
import {
  ViewFrame,
  fieldDisplay,
  useCustomerView,
  valueClassFor,
  type CustomerTypeViewProps,
} from './view-variants/shared';
import { RecordDetail } from './view-variants/detail-designs';
import { SectionHead } from './view-variants/heading-styles';

/** Record detail pop-up, stacked over the customer dialog */
function RecordDialog({
  type,
  item,
  onClose,
}: {
  type: CustomerTypeDefinition;
  item: CustomerTypeRecord;
  onClose: () => void;
}) {
  const headingId = useId();
  const Icon = type.icon;

  useEffect(() => {
    // Capture phase + stopPropagation, so Escape closes this pop-up without also closing the dialog behind it
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      onClose();
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl shadow-blue-950/20 animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center gap-3 border-b border-slate-100 px-5 py-4">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
            <Icon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <h3 id={headingId} className="truncate text-[15px] font-semibold tracking-tight text-slate-900">
              {type.label} details
            </h3>
            <p className="font-mono text-[11px] text-slate-400">{item.id}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto shrink-0 cursor-pointer rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <RecordDetail type={type} item={item} />
        </div>
      </div>
    </div>
  );
}

/** Numbers and money read best right-aligned, so magnitudes line up down the column */
const isNumeric = (field: CustomerTypeField) => field.type === 'number' || field.type === 'computed';

const HEAD_CELL = 'px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400';

/**
 * One customer's records for a customer type: pill tabs per type, the record's fields
 * below, and a table with a detail pop-up when a type holds several records.
 */
export function CustomerTypeViewDialog(props: CustomerTypeViewProps) {
  const titleId = useId();
  const { customer, name, activeType, activeTypeId, setActiveTypeId, typeRecords } = useCustomerView(props);
  const [openRecordId, setOpenRecordId] = useState<string | null>(null);

  const listFields = getListFields(activeType).slice(0, 5);
  const openRecord = typeRecords.find((item) => item.id === openRecordId);

  return (
    <ViewFrame embedded={props.embedded} onClose={props.onClose} titleId={titleId}>
      {/* Header: identity + pill tab bar */}
      <div className="shrink-0 bg-white px-5 pb-3 pt-5 sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3.5">
            {customer?.avatarUrl ? (
              <Image
                src={customer.avatarUrl}
                alt={name}
                width={48}
                height={48}
                className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-white"
                referrerPolicy="no-referrer"
                unoptimized
              />
            ) : (
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-blue-50 text-base font-semibold text-blue-600">
                {name.charAt(0)}
              </span>
            )}
            <div className="min-w-0">
              <h2 id={titleId} className="truncate text-[19px] font-semibold tracking-tight text-slate-900">
                {name}
              </h2>
              <div className="mt-0.5 flex flex-wrap items-center gap-2">
                {customer?.fullNameKH && <span className="font-khmer text-[13px] text-slate-500">{customer.fullNameKH}</span>}
                <span className="rounded-md bg-blue-50 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-blue-600">
                  {customer?.customerId ?? props.record.customerId}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={props.onClose}
            className="shrink-0 cursor-pointer rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 flex gap-1 overflow-x-auto rounded-2xl bg-slate-50 p-1.5 ring-1 ring-slate-100 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {CUSTOMER_TYPES.map((type) => {
            const Icon = type.icon;
            const isActive = type.id === activeTypeId;
            return (
              <button
                key={type.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => {
                  setActiveTypeId(type.id);
                  setOpenRecordId(null);
                }}
                className={cn(
                  'flex shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-[13px] font-semibold transition',
                  isActive
                    ? 'bg-white text-blue-600 shadow-sm shadow-slate-900/5 ring-1 ring-slate-200/70'
                    : 'text-slate-500 hover:text-slate-800'
                )}
              >
                <Icon className={cn('h-4 w-4', isActive ? 'text-blue-600' : 'text-slate-400')} />
                {type.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Body: one record shows its tiles; several show a table, with details in a pop-up */}
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 pt-2 sm:px-6">
        {typeRecords.length === 0 ? (
          <div className="mt-3 flex flex-col items-center gap-3 rounded-2xl bg-slate-50/80 px-6 py-12 text-center ring-1 ring-slate-100">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-slate-400 shadow-sm ring-1 ring-slate-200">
              <ClipboardList className="h-5 w-5" />
            </span>
            <p className="text-sm font-medium text-slate-700">No {activeType.label} record</p>
          </div>
        ) : typeRecords.length === 1 ? (
          <section className="mt-4">
            <SectionHead title={`${activeType.label} details`} recordId={typeRecords[0].id} />
            <RecordDetail type={activeType} item={typeRecords[0]} />
          </section>
        ) : (
          <section className="mt-4">
            <SectionHead title={`${activeType.label} records`} />
            <div className="overflow-x-auto rounded-2xl ring-1 ring-slate-100">
              <table className="w-full min-w-[560px] border-collapse text-left">
                <thead>
                  <tr className="bg-slate-50/80">
                    {listFields.map((field) => (
                      <th key={field.key} scope="col" className={cn(HEAD_CELL, isNumeric(field) && 'text-right')}>
                        {field.label}
                      </th>
                    ))}
                    <th scope="col" className={cn(HEAD_CELL, 'w-10')}>
                      <span className="sr-only">Open</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {typeRecords.map((item) => (
                    <tr
                      key={item.id}
                      tabIndex={0}
                      onClick={() => setOpenRecordId(item.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setOpenRecordId(item.id);
                        }
                      }}
                      title={`Open ${item.id}`}
                      className="group cursor-pointer bg-white transition hover:bg-blue-50/60"
                    >
                      {listFields.map((field, index) => (
                        <td
                          key={field.key}
                          className={cn(
                            'relative px-4 py-3 text-[13px] text-slate-800',
                            isNumeric(field) && 'text-right tabular-nums',
                            valueClassFor(field)
                          )}
                        >
                          {index === 0 && (
                            <span className="absolute inset-y-0 left-0 w-[3px] bg-blue-600 opacity-0 transition group-hover:opacity-100" />
                          )}
                          {fieldDisplay(field, item.values[field.key])}
                        </td>
                      ))}
                      <td className="px-3 py-3 text-right">
                        <ChevronRight className="ml-auto h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-600" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>

      {openRecord && (
        <RecordDialog type={activeType} item={openRecord} onClose={() => setOpenRecordId(null)} />
      )}
    </ViewFrame>
  );
}
