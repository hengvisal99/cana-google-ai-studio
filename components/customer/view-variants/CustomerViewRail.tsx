'use client';

import React, { useId } from 'react';
import { cn } from '@/lib/utils';
import { CUSTOMER_TYPES } from '@/lib/customer-types';
import {
  CustomerHeader,
  EmptyValue,
  ViewFrame,
  fieldDisplay,
  recordStamp,
  summaryFacts,
  useCustomerView,
  valueClassFor,
  type CustomerViewVariantProps,
} from './shared';

/** V1 Rail Navigator — vertical type rail, key-fact strip, fields as soft tiles */
export function CustomerViewRail(props: CustomerViewVariantProps) {
  const titleId = useId();
  const { customer, name, activeType, activeTypeId, setActiveTypeId, detailFields, statusField, typeRecords, countByType } =
    useCustomerView(props);
  const ActiveIcon = activeType.icon;
  const tileFields = detailFields.filter((field) => field !== statusField);

  return (
    <ViewFrame embedded={props.embedded} onClose={props.onClose} titleId={titleId}>
      <CustomerHeader
        titleId={titleId}
        customer={customer}
        name={name}
        fallbackId={props.record.customerId}
        onClose={props.onClose}
        className="border-b border-slate-200/80"
      />

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        {/* Type rail */}
        <nav
          aria-label="Customer types"
          className="flex shrink-0 gap-1 overflow-x-auto border-b border-slate-200/80 bg-slate-50/80 p-3 [scrollbar-width:none] md:w-60 md:flex-col md:overflow-y-auto md:border-b-0 md:border-r [&::-webkit-scrollbar]:hidden"
        >
          <p className="hidden px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400 md:block">
            Customer types
          </p>
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
                  'group relative flex shrink-0 cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-left text-[13px] font-medium transition',
                  isActive
                    ? 'bg-white text-slate-900 shadow-sm shadow-slate-900/5 ring-1 ring-slate-200/80'
                    : 'text-slate-500 hover:bg-white/70 hover:text-slate-800'
                )}
              >
                {isActive && <span className="absolute inset-y-2.5 -left-3 hidden w-[3px] rounded-r-full bg-blue-600 md:block" />}
                <span
                  className={cn(
                    'grid h-8 w-8 shrink-0 place-items-center rounded-lg transition',
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                      : 'bg-white text-slate-400 ring-1 ring-slate-200 group-hover:text-slate-600'
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="whitespace-nowrap md:flex-1">{type.label}</span>
                <span
                  className={cn(
                    'min-w-5 rounded-full px-1.5 py-0.5 text-center text-[10px] font-semibold tabular-nums',
                    count === 0 ? 'text-slate-300' : isActive ? 'bg-blue-50 text-blue-700' : 'bg-slate-200/70 text-slate-600'
                  )}
                >
                  {count || '—'}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
          {/* Key facts */}
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-200/60 sm:grid-cols-3">
            {summaryFacts(customer).map((fact) => (
              <div key={fact.key} className="min-w-0 bg-white px-4 py-3">
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">{fact.label}</span>
                <div
                  title={fact.text}
                  className={cn('mt-1 truncate text-[13px] font-medium text-slate-900', fact.mono && 'font-mono')}
                >
                  {fact.node ?? fact.text ?? <EmptyValue />}
                </div>
              </div>
            ))}
          </div>

          {/* Active type */}
          <div className="mt-6 flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
              <ActiveIcon className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="text-[15px] font-semibold tracking-tight text-slate-900">{activeType.label}</h3>
              <p className="truncate text-xs text-slate-500">{activeType.description}</p>
            </div>
            <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold tabular-nums text-slate-600">
              {typeRecords.length} {typeRecords.length === 1 ? 'record' : 'records'}
            </span>
          </div>

          <div className="mt-4 space-y-4">
            {typeRecords.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 px-6 py-12 text-center">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-slate-400 shadow-sm ring-1 ring-slate-200">
                  <ActiveIcon className="h-5 w-5" />
                </span>
                <p className="text-sm text-slate-500">No {activeType.label} record for this customer yet.</p>
              </div>
            ) : (
              typeRecords.map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                >
                  <div className="flex items-center justify-between gap-3 px-1.5 pb-3 pt-1">
                    <span className="font-mono text-[11px] font-semibold text-slate-400">{item.id}</span>
                    {statusField && fieldDisplay(statusField, item.values[statusField.key])}
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {tileFields.map((field) => (
                      <div
                        key={field.key}
                        className={cn(
                          'min-w-0 rounded-xl bg-slate-50 px-3.5 py-3',
                          field.type === 'textarea' && 'sm:col-span-2 lg:col-span-3'
                        )}
                      >
                        <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          {field.label}
                        </span>
                        <div className={cn('mt-1 break-words text-[13px] font-medium text-slate-900', valueClassFor(field))}>
                          {fieldDisplay(field, item.values[field.key])}
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="px-1.5 pb-0.5 pt-3 text-[11px] text-slate-400">{recordStamp(item)}</p>
                </article>
              ))
            )}
          </div>
        </div>
      </div>
    </ViewFrame>
  );
}
