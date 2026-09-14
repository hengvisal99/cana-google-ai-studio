'use client';

import React, { useId } from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CUSTOMER_TYPES, formatFieldValue } from '@/lib/customer-types';
import {
  CustomerHeader,
  DOT,
  EmptyValue,
  ViewFrame,
  recordLifecycle,
  recordStamp,
  statusTone,
  summaryFacts,
  useCustomerView,
  valueClassFor,
  type CustomerViewVariantProps,
} from './shared';

/** V2 Bento Spotlight — segmented tabs, blue hero tile per record, bento field tiles */
export function CustomerViewBento(props: CustomerViewVariantProps) {
  const titleId = useId();
  const { customer, name, activeType, activeTypeId, setActiveTypeId, detailFields, statusField, typeRecords, countByType } =
    useCustomerView(props);
  const ActiveIcon = activeType.icon;
  const infoFields = detailFields.filter((field) => field !== statusField);

  return (
    <ViewFrame embedded={props.embedded} onClose={props.onClose} titleId={titleId}>
      <CustomerHeader
        titleId={titleId}
        customer={customer}
        name={name}
        fallbackId={props.record.customerId}
        onClose={props.onClose}
      />

      {/* Segmented type control */}
      <div className="shrink-0 px-6 pb-4">
        <div className="flex gap-1 overflow-x-auto rounded-2xl bg-slate-100/90 p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
                  'flex flex-1 shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-[13px] font-medium transition',
                  isActive
                    ? 'bg-white text-blue-700 shadow-sm shadow-slate-900/5 ring-1 ring-slate-900/5'
                    : 'text-slate-500 hover:text-slate-800'
                )}
              >
                <Icon className="h-4 w-4" />
                {type.label}
                {count > 0 && (
                  <span
                    className={cn(
                      'grid h-4 min-w-4 place-items-center rounded-full px-1 text-[10px] font-bold tabular-nums',
                      isActive ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto border-t border-slate-100 bg-slate-50/70 p-5 sm:p-6">
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
          <div className="min-w-0 space-y-6 lg:col-span-2">
            {typeRecords.length === 0 ? (
              <div className="relative flex flex-col items-center gap-3 overflow-hidden rounded-3xl border border-slate-200/70 bg-white px-6 py-14 text-center">
                <div aria-hidden className="pointer-events-none absolute -top-24 left-1/2 h-48 w-72 -translate-x-1/2 rounded-full bg-blue-100/60 blur-3xl" />
                <span className="relative grid h-14 w-14 place-items-center rounded-2xl bg-linear-to-br from-blue-50 to-white text-blue-500 shadow-sm ring-1 ring-blue-100">
                  <ActiveIcon className="h-6 w-6" />
                </span>
                <p className="relative text-sm font-medium text-slate-700">No {activeType.label} record yet</p>
                <p className="relative -mt-2 text-xs text-slate-400">{activeType.description}</p>
              </div>
            ) : (
              typeRecords.map((item) => {
                const life = recordLifecycle(detailFields, item.values);
                const statusValue = statusField ? item.values[statusField.key] : undefined;
                // Without a date span, spotlight the total (IPO) or the first field
                const headline = life ? undefined : (infoFields.find((field) => field.type === 'computed') ?? infoFields[0]);
                const tileFields = infoFields.filter((field) => field !== headline);

                return (
                  <div key={item.id} className="grid grid-cols-2 gap-3">
                    {/* Hero */}
                    <div className="relative col-span-full overflow-hidden rounded-3xl bg-linear-to-br from-blue-600 via-blue-600 to-indigo-600 p-5 text-white shadow-lg shadow-blue-600/20">
                      <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
                      <div aria-hidden className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-sky-300/25 blur-3xl" />

                      <div className="relative flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/15 ring-1 ring-white/25 backdrop-blur">
                            <ActiveIcon className="h-5 w-5" />
                          </span>
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-100">{activeType.label}</p>
                            <p className="font-mono text-xs text-white/75">{item.id}</p>
                          </div>
                        </div>
                        {statusField && typeof statusValue === 'string' && statusValue !== '' && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-800 shadow-sm">
                            <span className={cn('h-1.5 w-1.5 rounded-full', DOT[statusTone(statusField, statusValue)])} />
                            {statusValue}
                          </span>
                        )}
                      </div>

                      {life ? (
                        <div className="relative mt-7">
                          <div className="flex items-end justify-between gap-4">
                            <p className="text-4xl font-semibold tracking-tight tabular-nums">
                              {Math.abs(life.daysLeft)}
                              <span className="ml-2 text-sm font-medium tracking-normal text-blue-100">
                                {life.daysLeft >= 0 ? 'days left' : 'days since end'}
                              </span>
                            </p>
                            <p className="pb-1 text-xs font-medium tabular-nums text-blue-100">
                              {Math.round(life.progress * 100)}% elapsed
                            </p>
                          </div>
                          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/20">
                            <div className="h-full rounded-full bg-white" style={{ width: `${life.progress * 100}%` }} />
                          </div>
                          <div className="mt-2 flex justify-between gap-3 text-[11px] text-blue-100">
                            <span>
                              {life.startLabel} · <span className="font-mono">{format(life.start, 'dd MMM yyyy')}</span>
                            </span>
                            <span className="text-right">
                              {life.endLabel} · <span className="font-mono">{format(life.end, 'dd MMM yyyy')}</span>
                            </span>
                          </div>
                        </div>
                      ) : (
                        headline && (
                          <div className="relative mt-7">
                            <p className="text-[11px] font-medium uppercase tracking-wider text-blue-100">{headline.label}</p>
                            <p className="mt-1 text-4xl font-semibold tracking-tight tabular-nums">
                              {formatFieldValue(headline, item.values[headline.key])}
                            </p>
                          </div>
                        )
                      )}
                    </div>

                    {tileFields.map((field) => (
                      <div
                        key={field.key}
                        className={cn(
                          'min-w-0 rounded-2xl border border-slate-200/70 bg-white p-4 transition hover:border-blue-200 hover:shadow-md hover:shadow-blue-900/5',
                          field.type === 'textarea' && 'col-span-full'
                        )}
                      >
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{field.label}</p>
                        <p className={cn('mt-2 break-words text-sm font-semibold text-slate-900', valueClassFor(field))}>
                          {formatFieldValue(field, item.values[field.key])}
                        </p>
                      </div>
                    ))}

                    <p className="col-span-full px-1 text-[11px] text-slate-400">{recordStamp(item)}</p>
                  </div>
                );
              })
            )}
          </div>

          {/* Summary */}
          <aside className="rounded-3xl border border-slate-200/70 bg-white p-2">
            <p className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              Customer summary
            </p>
            <ul>
              {summaryFacts(customer).map((fact) => {
                const Icon = fact.icon;
                return (
                  <li key={fact.key} className="flex items-center gap-3 rounded-2xl px-3 py-2.5 transition hover:bg-slate-50">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{fact.label}</p>
                      <div
                        title={fact.text}
                        className={cn('mt-0.5 truncate text-[13px] font-medium text-slate-900', fact.mono && 'font-mono')}
                      >
                        {fact.node ?? fact.text ?? <EmptyValue />}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </aside>
        </div>
      </div>
    </ViewFrame>
  );
}
