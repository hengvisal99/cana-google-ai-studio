'use client';

import React, { useId } from 'react';
import { format } from 'date-fns';
import { Clock3, FilePlus2, PencilLine, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CUSTOMER_TYPES, formatFieldValue } from '@/lib/customer-types';
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
} from './shared';

const CARD = 'rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]';
const EYEBROW = 'text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400';

/** V5 Standard Detail — the common detail-page pattern: tabs, key stats, description list, activity, sidebar, action footer */
export function CustomerViewStandard(props: CustomerViewVariantProps) {
  const titleId = useId();
  const { customer, name, activeType, activeTypeId, setActiveTypeId, detailFields, statusField, typeRecords, countByType } =
    useCustomerView(props);
  const ActiveIcon = activeType.icon;
  const listFields = detailFields.filter((field) => field !== statusField);

  const latest = typeRecords[0];
  const life = latest ? recordLifecycle(detailFields, latest.values) : null;
  const headline = latest && !life ? (listFields.find((field) => field.type === 'computed') ?? listFields[0]) : undefined;

  // Created / updated events across this type's records, newest first
  const activity = typeRecords
    .flatMap((item) => [
      { key: `${item.id}-created`, id: item.id, at: item.createdAt, kind: 'created' as const },
      ...(item.updatedAt !== item.createdAt
        ? [{ key: `${item.id}-updated`, id: item.id, at: item.updatedAt, kind: 'updated' as const }]
        : []),
    ])
    .sort((a, b) => b.at.localeCompare(a.at));

  return (
    <ViewFrame embedded={props.embedded} onClose={props.onClose} titleId={titleId}>
      <CustomerHeader
        titleId={titleId}
        customer={customer}
        name={name}
        fallbackId={props.record.customerId}
        onClose={props.onClose}
      />

      {/* Underline tabs */}
      <div className="flex shrink-0 items-center gap-5 overflow-x-auto border-b border-slate-200 px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
                'relative flex cursor-pointer items-center gap-2 whitespace-nowrap py-3 text-[13px] font-medium transition',
                isActive ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
              )}
            >
              <Icon className="h-4 w-4" />
              {type.label}
              {count > 0 && (
                <span
                  className={cn(
                    'rounded-full px-1.5 text-[10px] font-semibold leading-4 tabular-nums',
                    isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                  )}
                >
                  {count}
                </span>
              )}
              {isActive && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-blue-600" />}
            </button>
          );
        })}
      </div>

      {/* Body */}
      <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/70 p-5 sm:p-6">
        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="min-w-0 space-y-5">
            {!latest ? (
              <div className={cn(CARD, 'flex flex-col items-center gap-3 px-6 py-14 text-center')}>
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                  <ActiveIcon className="h-6 w-6" />
                </span>
                <p className="text-sm font-semibold text-slate-800">No {activeType.label} record</p>
                <p className="-mt-2 max-w-xs text-xs text-slate-500">{activeType.description}</p>
              </div>
            ) : (
              <>
                {/* Key stats for the latest record */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className={cn(CARD, 'p-4')}>
                    <p className={EYEBROW}>{statusField ? 'Status' : 'Records'}</p>
                    <div className="mt-2.5">
                      {statusField ? (
                        fieldDisplay(statusField, latest.values[statusField.key])
                      ) : (
                        <p className="text-xl font-semibold tabular-nums text-slate-900">{typeRecords.length}</p>
                      )}
                    </div>
                  </div>

                  <div className={cn(CARD, 'p-4')}>
                    <p className={EYEBROW}>{life ? 'Validity' : headline?.label}</p>
                    {life ? (
                      <>
                        <p className="mt-2 text-sm font-semibold text-slate-900">{daysLeftText(life.daysLeft)}</p>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-linear-to-r from-blue-400 to-blue-600"
                            style={{ width: `${life.progress * 100}%` }}
                          />
                        </div>
                      </>
                    ) : (
                      headline && (
                        <p className="mt-2 font-mono text-xl font-semibold tracking-tight text-slate-900">
                          {formatFieldValue(headline, latest.values[headline.key])}
                        </p>
                      )
                    )}
                  </div>

                  <div className={cn(CARD, 'p-4')}>
                    <p className={EYEBROW}>Last updated</p>
                    <p className="mt-2 font-mono text-sm font-semibold text-slate-900">
                      {format(new Date(latest.updatedAt), 'dd MMM yyyy')}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400">
                      <Clock3 className="h-3 w-3" />
                      {format(new Date(latest.updatedAt), 'HH:mm')}
                    </p>
                  </div>
                </div>

                {/* Description list per record */}
                {typeRecords.map((item) => (
                  <section key={item.id} className={CARD}>
                    <div className="flex items-center gap-2.5 border-b border-slate-100 px-5 py-3.5">
                      <span className="h-4 w-1 rounded-full bg-blue-600" />
                      <h3 className="text-[13px] font-semibold text-slate-900">{activeType.label} details</h3>
                      <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-500">
                        {item.id}
                      </span>
                      {statusField && (
                        <span className="ml-auto">{fieldDisplay(statusField, item.values[statusField.key])}</span>
                      )}
                    </div>
                    <dl className="divide-y divide-slate-100 px-5">
                      {listFields.map((field) => (
                        <div key={field.key} className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-4">
                          <dt className="text-xs text-slate-500">{field.label}</dt>
                          <dd className={cn('break-words text-[13px] font-medium text-slate-900', valueClassFor(field))}>
                            {fieldDisplay(field, item.values[field.key])}
                          </dd>
                        </div>
                      ))}
                    </dl>
                    <p className="rounded-b-2xl border-t border-slate-100 bg-slate-50/60 px-5 py-2.5 text-[11px] text-slate-400">
                      {recordStamp(item)}
                    </p>
                  </section>
                ))}

                {/* Activity */}
                <section className={cn(CARD, 'px-5 py-4')}>
                  <p className={EYEBROW}>Activity</p>
                  <ol className="mt-3 space-y-3">
                    {activity.map((event) => {
                      const Icon = event.kind === 'created' ? FilePlus2 : RefreshCw;
                      return (
                        <li key={event.key} className="flex items-center gap-3">
                          <span
                            className={cn(
                              'grid h-7 w-7 shrink-0 place-items-center rounded-full',
                              event.kind === 'created' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'
                            )}
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </span>
                          <p className="min-w-0 flex-1 truncate text-[13px] text-slate-700">
                            <span className="font-mono text-[11px] font-semibold text-slate-900">{event.id}</span>{' '}
                            {event.kind === 'created' ? 'was created' : 'was updated'}
                          </p>
                          <time className="shrink-0 font-mono text-[11px] text-slate-400">
                            {format(new Date(event.at), 'dd MMM yyyy, HH:mm')}
                          </time>
                        </li>
                      );
                    })}
                  </ol>
                </section>
              </>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-4 lg:sticky lg:top-0">
            <section className={cn(CARD, 'p-4')}>
              <p className={EYEBROW}>Customer summary</p>
              <dl className="mt-3 space-y-3.5">
                {summaryFacts(customer).map((fact) => {
                  const Icon = fact.icon;
                  return (
                    <div key={fact.key} className="flex min-w-0 items-start gap-3">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-50 text-slate-500 ring-1 ring-slate-200/70">
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <div className="min-w-0">
                        <dt className="text-[11px] text-slate-500">{fact.label}</dt>
                        <dd
                          title={fact.text}
                          className={cn('mt-0.5 truncate text-[13px] font-medium text-slate-900', fact.mono && 'font-mono')}
                        >
                          {fact.node ?? fact.text ?? <EmptyValue />}
                        </dd>
                      </div>
                    </div>
                  );
                })}
              </dl>
            </section>

            <section className={cn(CARD, 'p-4')}>
              <p className={EYEBROW}>Customer types</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {CUSTOMER_TYPES.map((type) => {
                  const Icon = type.icon;
                  const count = countByType[type.id];
                  const isActive = type.id === activeTypeId;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setActiveTypeId(type.id)}
                      className={cn(
                        'inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-2 py-1 text-[11px] font-medium transition',
                        isActive
                          ? 'border-blue-200 bg-blue-50 text-blue-700'
                          : count > 0
                            ? 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                            : 'border-dashed border-slate-200 bg-white text-slate-400 hover:text-slate-600'
                      )}
                    >
                      <Icon className="h-3 w-3" />
                      {type.label}
                    </button>
                  );
                })}
              </div>
            </section>
          </aside>
        </div>
      </div>

      {/* Action footer */}
      <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-200 bg-white px-6 py-3">
        <p className="hidden truncate text-[11px] text-slate-400 sm:block">
          {typeRecords.length} {activeType.label} {typeRecords.length === 1 ? 'record' : 'records'}
        </p>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={props.onClose}
            className="inline-flex h-9 cursor-pointer items-center rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Close
          </button>
          <button
            type="button"
            disabled={!latest}
            className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
          >
            <PencilLine className="h-3.5 w-3.5" />
            Edit {activeType.label}
          </button>
        </div>
      </div>
    </ViewFrame>
  );
}
