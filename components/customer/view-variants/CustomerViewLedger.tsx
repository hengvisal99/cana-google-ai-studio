'use client';

import React, { useId } from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CUSTOMER_TYPES } from '@/lib/customer-types';
import {
  CustomerHeader,
  EmptyValue,
  ViewFrame,
  fieldDisplay,
  summaryFacts,
  useCustomerView,
  valueClassFor,
  type CustomerViewVariantProps,
} from './shared';

/** V3 Ledger Timeline — record history on a timeline, ledger rows, trading account card */
export function CustomerViewLedger(props: CustomerViewVariantProps) {
  const titleId = useId();
  const { customer, name, activeType, activeTypeId, setActiveTypeId, detailFields, typeRecords, countByType } =
    useCustomerView(props);
  const ActiveIcon = activeType.icon;
  const facts = summaryFacts(customer).filter((fact) => fact.key !== 'status' && fact.key !== 'trading');
  const tradingNo = customer?.tradingAccountInfo?.tradingAccountNumber;

  return (
    <ViewFrame embedded={props.embedded} onClose={props.onClose} titleId={titleId}>
      <CustomerHeader
        titleId={titleId}
        customer={customer}
        name={name}
        fallbackId={props.record.customerId}
        onClose={props.onClose}
      />

      {/* Tabs with counts and a gradient indicator */}
      <div className="flex shrink-0 items-center gap-1 overflow-x-auto border-b border-slate-200/80 px-3 [scrollbar-width:none] sm:px-4 [&::-webkit-scrollbar]:hidden">
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
                'group relative flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-t-lg px-3 py-3.5 text-[13px] font-medium transition',
                isActive ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'
              )}
            >
              <Icon className={cn('h-4 w-4 transition', isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600')} />
              {type.label}
              <span
                className={cn(
                  'rounded-md px-1.5 py-px text-[10px] font-semibold tabular-nums transition',
                  isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                )}
              >
                {count}
              </span>
              {isActive && (
                <span className="absolute inset-x-2 -bottom-px h-[3px] rounded-t-full bg-linear-to-r from-blue-500 to-indigo-500" />
              )}
            </button>
          );
        })}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="grid min-h-full grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* Timeline */}
          <section className="p-5 sm:p-6">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="text-[15px] font-semibold tracking-tight text-slate-900">{activeType.label} history</h3>
              <span className="text-xs tabular-nums text-slate-400">
                {typeRecords.length} {typeRecords.length === 1 ? 'record' : 'records'}
              </span>
            </div>

            {typeRecords.length === 0 ? (
              <div className="mt-5 flex items-center gap-4 rounded-2xl border border-dashed border-slate-300 px-5 py-6">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-400">
                  <ActiveIcon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-medium text-slate-700">Nothing on the timeline</p>
                  <p className="text-xs text-slate-400">No {activeType.label} record for this customer yet.</p>
                </div>
              </div>
            ) : (
              <ol className="relative mt-5 space-y-7 before:absolute before:bottom-4 before:left-[15px] before:top-4 before:w-px before:bg-linear-to-b before:from-blue-300 before:via-slate-200 before:to-transparent">
                {typeRecords.map((item, index) => (
                  <li key={item.id} className="relative pl-12">
                    <span
                      className={cn(
                        'absolute left-0 top-0 grid h-8 w-8 place-items-center rounded-full ring-4 ring-white',
                        index === 0
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                          : 'border border-slate-200 bg-white text-slate-400'
                      )}
                    >
                      <ActiveIcon className="h-3.5 w-3.5" />
                    </span>

                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 pt-1.5">
                      <p className="text-[13px] font-semibold text-slate-900">
                        Updated {format(new Date(item.updatedAt), 'dd MMM yyyy, HH:mm')}
                      </p>
                      {index === 0 && (
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-700">
                          Latest
                        </span>
                      )}
                      <span className="ml-auto font-mono text-[11px] text-slate-400">{item.id}</span>
                    </div>

                    <dl className="mt-3 rounded-2xl border border-slate-200/80 bg-white px-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                      {detailFields.map((field) =>
                        field.type === 'textarea' ? (
                          <div key={field.key} className="border-b border-dashed border-slate-200 py-3 last:border-0">
                            <dt className="text-xs text-slate-500">{field.label}</dt>
                            <dd className="mt-1 whitespace-pre-wrap text-[13px] leading-relaxed text-slate-800">
                              {fieldDisplay(field, item.values[field.key])}
                            </dd>
                          </div>
                        ) : (
                          <div
                            key={field.key}
                            className="flex items-center justify-between gap-4 border-b border-dashed border-slate-200 py-2.5 last:border-0"
                          >
                            <dt className="text-xs text-slate-500">{field.label}</dt>
                            <dd
                              className={cn(
                                'text-right text-[13px] font-medium tabular-nums text-slate-900',
                                valueClassFor(field)
                              )}
                            >
                              {fieldDisplay(field, item.values[field.key])}
                            </dd>
                          </div>
                        )
                      )}
                    </dl>
                    <p className="mt-2 text-[11px] text-slate-400">
                      Created {format(new Date(item.createdAt), 'dd MMM yyyy')}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </section>

          {/* Summary */}
          <aside className="border-t border-slate-100 bg-slate-50/70 p-5 sm:p-6 lg:border-l lg:border-t-0">
            <div className="relative aspect-[1.586] overflow-hidden rounded-2xl bg-linear-to-br from-blue-600 via-blue-700 to-indigo-800 p-5 text-white shadow-xl shadow-blue-900/20">
              <div aria-hidden className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full border border-white/10" />
              <div aria-hidden className="pointer-events-none absolute -right-4 -top-4 h-28 w-28 rounded-full border border-white/10" />
              <div aria-hidden className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-sky-400/20 blur-2xl" />

              <div className="relative flex h-full flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-100">Trading account</span>
                  <span className="h-6 w-8 rounded-md bg-white/20 ring-1 ring-white/30" />
                </div>
                <p className="font-mono text-lg tracking-[0.18em]">{tradingNo ?? '—'}</p>
                <div className="flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[9px] uppercase tracking-[0.18em] text-blue-200">Account holder</p>
                    <p className="truncate text-[13px] font-semibold uppercase tracking-wide">{name}</p>
                  </div>
                  {customer?.accountStatus && (
                    <span className="shrink-0 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-white/25">
                      {customer.accountStatus}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Customer summary</p>
            <dl className="mt-2 divide-y divide-slate-200/70">
              {facts.map((fact) => (
                <div key={fact.key} className="py-2.5">
                  <dt className="text-[11px] text-slate-500">{fact.label}</dt>
                  <dd
                    title={fact.text}
                    className={cn('mt-0.5 truncate text-[13px] font-medium text-slate-900', fact.mono && 'font-mono')}
                  >
                    {fact.text ?? <EmptyValue />}
                  </dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>
      </div>
    </ViewFrame>
  );
}
