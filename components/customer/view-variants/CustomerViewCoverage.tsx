'use client';

import React, { useId, useState } from 'react';
import { format } from 'date-fns';
import {
  AlignLeft,
  Calculator,
  CalendarDays,
  Check,
  CircleDot,
  Copy,
  DollarSign,
  Hash,
  ListChecks,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CUSTOMER_TYPES, type CustomerTypeField } from '@/lib/customer-types';
import {
  CustomerHeader,
  EmptyValue,
  ViewFrame,
  daysLeftText,
  fieldDisplay,
  recordLifecycle,
  recordStamp,
  summaryFacts,
  useCustomerView,
  valueClassFor,
  type CustomerViewVariantProps,
  type SummaryFact,
} from './shared';

function iconFor(field: CustomerTypeField): LucideIcon {
  if (field.format === 'currency') return field.type === 'computed' ? Calculator : DollarSign;
  switch (field.type) {
    case 'date':
      return CalendarDays;
    case 'number':
      return Hash;
    case 'select':
      return ListChecks;
    case 'textarea':
      return AlignLeft;
    default:
      return CircleDot;
  }
}

/** V4 Coverage Grid — enrollment cards as tabs, validity bar, icon fields, copyable summary */
export function CustomerViewCoverage(props: CustomerViewVariantProps) {
  const titleId = useId();
  const { customer, name, activeType, activeTypeId, setActiveTypeId, detailFields, statusField, typeRecords, countByType } =
    useCustomerView(props);
  const ActiveIcon = activeType.icon;
  const gridFields = detailFields.filter((field) => field !== statusField);

  return (
    <ViewFrame embedded={props.embedded} onClose={props.onClose} titleId={titleId}>
      <CustomerHeader
        titleId={titleId}
        customer={customer}
        name={name}
        fallbackId={props.record.customerId}
        onClose={props.onClose}
      />

      {/* Enrollment cards */}
      <div className="shrink-0 border-y border-slate-200/70 bg-slate-50/80 px-6 py-4">
        <div className="-mx-1 flex gap-2.5 overflow-x-auto px-1 py-1 [scrollbar-width:none] md:grid md:grid-cols-5 [&::-webkit-scrollbar]:hidden">
          {CUSTOMER_TYPES.map((type) => {
            const Icon = type.icon;
            const isActive = type.id === activeTypeId;
            const count = countByType[type.id];
            return (
              <button
                key={type.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActiveTypeId(type.id)}
                className={cn(
                  'group flex w-40 shrink-0 cursor-pointer flex-col items-start gap-3 rounded-2xl border bg-white p-3 text-left transition md:w-auto',
                  isActive
                    ? 'border-blue-500 shadow-lg shadow-blue-600/10 ring-4 ring-blue-500/10'
                    : 'border-slate-200/80 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md hover:shadow-slate-900/5'
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <span
                    className={cn(
                      'grid h-8 w-8 place-items-center rounded-xl transition',
                      isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25' : 'bg-slate-100 text-slate-500 group-hover:text-slate-700'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  {count > 0 && (
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-50 text-emerald-600" title="Enrolled">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                  )}
                </div>
                <div className="w-full min-w-0">
                  <p className={cn('truncate text-[13px] font-semibold', isActive ? 'text-slate-900' : 'text-slate-700')}>
                    {type.label}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {count > 0 ? `${count} ${count === 1 ? 'record' : 'records'}` : 'Not enrolled'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="min-w-0 space-y-4">
            {typeRecords.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-6 py-12 text-center">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-blue-50 text-blue-500 ring-8 ring-blue-50/50">
                  <ActiveIcon className="h-6 w-6" />
                </span>
                <p className="mt-2 text-sm font-medium text-slate-700">Not enrolled in {activeType.label}</p>
                <p className="-mt-1.5 text-xs text-slate-400">{activeType.description}</p>
              </div>
            ) : (
              typeRecords.map((item) => {
                const life = recordLifecycle(detailFields, item.values);
                return (
                  <article key={item.id} className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
                    <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-3.5">
                      <h3 className="text-[13px] font-semibold text-slate-900">{activeType.label} details</h3>
                      <span className="font-mono text-[11px] text-slate-400">{item.id}</span>
                      <div className="ml-auto">{statusField && fieldDisplay(statusField, item.values[statusField.key])}</div>
                    </div>

                    {life && (
                      <div className="border-b border-slate-100 bg-linear-to-b from-blue-50/70 to-white px-5 py-4">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold uppercase tracking-wider text-slate-400">Validity</span>
                          <span className={cn('font-semibold', life.daysLeft >= 0 ? 'text-blue-700' : 'text-slate-500')}>
                            {daysLeftText(life.daysLeft)}
                          </span>
                        </div>
                        <div className="relative mt-3 h-2 rounded-full bg-slate-200/70">
                          <div
                            className="absolute inset-y-0 left-0 rounded-full bg-linear-to-r from-blue-400 to-blue-600"
                            style={{ width: `${life.progress * 100}%` }}
                          />
                          <span
                            className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white bg-blue-600 shadow-md shadow-blue-600/30"
                            style={{ left: `${life.progress * 100}%` }}
                          />
                        </div>
                        <div className="mt-2 flex justify-between gap-3 text-[11px]">
                          <span className="text-slate-400">
                            {life.startLabel} <span className="font-mono text-slate-600">{format(life.start, 'dd MMM yyyy')}</span>
                          </span>
                          <span className="text-right text-slate-400">
                            {life.endLabel} <span className="font-mono text-slate-600">{format(life.end, 'dd MMM yyyy')}</span>
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 gap-x-6 gap-y-4 p-5 sm:grid-cols-2 xl:grid-cols-3">
                      {gridFields.map((field) => {
                        const Icon = iconFor(field);
                        return (
                          <div
                            key={field.key}
                            className={cn('flex min-w-0 items-start gap-3', field.type === 'textarea' && 'col-span-full')}
                          >
                            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500">
                              <Icon className="h-4 w-4" />
                            </span>
                            <div className="min-w-0">
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{field.label}</p>
                              <p className={cn('mt-0.5 break-words text-[13px] font-medium text-slate-900', valueClassFor(field))}>
                                {fieldDisplay(field, item.values[field.key])}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <p className="border-t border-slate-100 bg-slate-50/50 px-5 py-2.5 text-[11px] text-slate-400">
                      {recordStamp(item)}
                    </p>
                  </article>
                );
              })
            )}
          </div>

          {/* Summary */}
          <aside className="rounded-2xl border border-slate-200/80 bg-white p-4 lg:sticky lg:top-0">
            <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Customer summary</p>
            <ul className="mt-2 space-y-0.5">
              {summaryFacts(customer).map((fact) => (
                <SummaryRow key={fact.key} fact={fact} />
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </ViewFrame>
  );
}

function SummaryRow({ fact }: { fact: SummaryFact }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!fact.text) return;
    try {
      await navigator.clipboard.writeText(fact.text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // Clipboard can be blocked (e.g. insecure origin); nothing to do
    }
  };

  return (
    <li className="group flex items-center gap-2 rounded-xl px-1 py-2 transition hover:bg-slate-50">
      <div className="min-w-0 flex-1 px-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{fact.label}</p>
        <div title={fact.text} className={cn('mt-0.5 truncate text-[13px] font-medium text-slate-900', fact.mono && 'font-mono')}>
          {fact.node ?? fact.text ?? <EmptyValue />}
        </div>
      </div>
      {fact.text && !fact.node && (
        <button
          type="button"
          onClick={copy}
          title={`Copy ${fact.label}`}
          aria-label={`Copy ${fact.label}`}
          className="grid h-7 w-7 shrink-0 cursor-pointer place-items-center rounded-lg text-slate-400 opacity-0 transition hover:bg-white hover:text-blue-600 hover:shadow-sm focus-visible:opacity-100 group-hover:opacity-100"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      )}
    </li>
  );
}
