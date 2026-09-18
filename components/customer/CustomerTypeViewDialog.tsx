'use client';

import React, { useEffect, useId, useState } from 'react';
import Image from 'next/image';
import { AlertTriangle, CheckCircle2, ChevronRight, ClipboardList, RotateCcw, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { STAGE_AUTHORIZER, reviewerRole, type ApprovalAction } from '@/lib/customer-type-approval';
import { WorkflowTimelineRow } from '@/components/shared/ViewIndividualDialog';
import { DossierCard } from '@/components/shared/DossierCard';
import {
  CUSTOMER_TYPES,
  getListFields,
  type CustomerTypeDefinition,
  type CustomerTypeField,
} from '@/lib/customer-types';
import type { AuthorizationTimelineItem, CustomerTypeRecord } from '@/types';
import {
  ViewFrame,
  fieldDisplay,
  useCustomerView,
  valueClassFor,
  type CustomerTypeViewProps,
} from './view-variants/shared';
import { RecordDetail } from './view-variants/detail-designs';
import { SectionHead } from './view-variants/heading-styles';

/** Same buttons as the customer view's authorization footer */
const DECISION_BUTTON =
  'inline-flex h-[35px] cursor-pointer items-center gap-1.5 rounded-lg text-xs font-semibold transition-all';

/** Approve / Resubmit / Reject for a record awaiting review; nothing otherwise */
function ApprovalActions({
  item,
  onDecide,
}: {
  item: CustomerTypeRecord;
  onDecide?: (record: CustomerTypeRecord, action: ApprovalAction) => void;
}) {
  const approval = item.approval;
  if (!onDecide || !approval || approval.requestStatus !== 'Pending' || !reviewerRole(approval.currentWorkflowStage)) {
    return null;
  }
  return (
    <div className="flex shrink-0 items-center justify-end gap-3 p-3.5 sm:p-4">
      <div className="flex flex-wrap items-center justify-end gap-2.5">
        <button
          type="button"
          onClick={() => onDecide(item, 'reject')}
          className={cn(DECISION_BUTTON, 'border border-rose-300 bg-white px-3.5 text-rose-600 shadow-2xs hover:border-rose-400 hover:bg-rose-50')}
          title="Reject application"
        >
          <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
          <span>Reject</span>
        </button>
        <button
          type="button"
          onClick={() => onDecide(item, 'resubmit')}
          className={cn(DECISION_BUTTON, 'border border-amber-300 bg-white px-3.5 text-amber-700 shadow-2xs hover:border-amber-400 hover:bg-amber-50')}
          title="Request resubmission"
        >
          <RotateCcw className="h-3.5 w-3.5 text-amber-600" />
          <span>Resubmit</span>
        </button>
        <button
          type="button"
          onClick={() => onDecide(item, 'authorize')}
          className={cn(DECISION_BUTTON, 'bg-emerald-600 px-4 text-white shadow-xs hover:bg-emerald-700')}
          title="Approve & advance workflow"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>Approve</span>
        </button>
      </div>
    </div>
  );
}

/** Static placeholders shown until real workflow data exists for a stage group */
const STATIC_REGISTRATION_HISTORY: AuthorizationTimelineItem[] = [
  {
    id: 'pr-reg-static-1',
    stage: 'Registration Submitted — CSO',
    status: 'Submitted',
    dateTime: '2026-09-10 09:00',
    processedBy: STAGE_AUTHORIZER.CSO,
    role: 'CSO',
    requestType: 'Registration',
  },
  {
    id: 'pr-reg-static-2',
    stage: 'Registration Review — SR',
    status: 'Approved',
    dateTime: '2026-09-11 02:30',
    processedBy: STAGE_AUTHORIZER.SR,
    role: 'SR',
    requestType: 'Registration',
  },
  {
    id: 'pr-reg-static-3',
    stage: 'Registration Approval — Manager',
    status: 'Queue',
    dateTime: 'Queue',
    processedBy: STAGE_AUTHORIZER.Manager,
    role: 'Manager',
    requestType: 'Registration',
  },
];

const STATIC_CANCEL_DATE = '2026-09-12';

const STATIC_CLOSE_HISTORY: AuthorizationTimelineItem[] = [
  {
    id: 'pr-close-static-1',
    stage: 'Close Request — CSO',
    status: 'Submitted',
    dateTime: '2026-09-12 10:20',
    processedBy: STAGE_AUTHORIZER.CSO,
    role: 'CSO',
    requestType: 'Close Account',
  },
  {
    id: 'pr-close-static-2',
    stage: 'Close Review — SR',
    status: 'Approved',
    dateTime: '2026-09-13 03:45',
    processedBy: STAGE_AUTHORIZER.SR,
    role: 'SR',
    requestType: 'Close Account',
  },
  {
    id: 'pr-close-static-3',
    stage: 'Close Approval — Manager',
    status: 'Queue',
    dateTime: 'Queue',
    processedBy: STAGE_AUTHORIZER.Manager,
    role: 'Manager',
    requestType: 'Close Account',
  },
];

/** Vertical registration / close-account timeline, same rows as the customer's Workflow History */
function WorkflowHistory({ item }: { item: CustomerTypeRecord }) {
  const approval = item.approval;
  if (!approval) return null;

  // The stage waiting on a reviewer isn't in the history yet; show it as the open step
  const waitingRole = approval.requestStatus === 'Pending' ? reviewerRole(approval.currentWorkflowStage) : null;
  const steps: AuthorizationTimelineItem[] = waitingRole
    ? [
        ...approval.history,
        {
          id: `${item.id}-pending`,
          stage: `${approval.requestType} — ${waitingRole}`,
          status: 'Pending',
          dateTime: '',
          processedBy: STAGE_AUTHORIZER[waitingRole],
          role: waitingRole,
          requestType: approval.requestType,
        },
        // Later reviewers still to act, queued like the customer timeline
        ...(waitingRole === 'Manager' ? [] : (['Manager'] as const)).map((role) => ({
          id: `${item.id}-queue-${role}`,
          stage: `${approval.requestType} — ${role}`,
          status: 'Queue' as const,
          dateTime: 'Queue',
          processedBy: STAGE_AUTHORIZER[role],
          role,
          requestType: approval.requestType,
        })),
      ]
    : approval.history;

  const registration = steps.filter((step) => step.requestType !== 'Close Account');
  const close = steps.filter((step) => step.requestType === 'Close Account');
  const groups = [
    { title: 'Registration', items: registration.length > 0 ? registration : STATIC_REGISTRATION_HISTORY },
    { title: 'PR Cancel', items: close.length > 0 ? close : STATIC_CLOSE_HISTORY },
  ];

  return (
    <section>
      <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-2">
        {groups.map((group) => (
          <DossierCard
            key={group.title}
            title={group.title}
            plain
            // The record id is issued at registration, so it sits on that card
            action={
              group.title === 'Registration' ? (
                // Negative margin keeps the badge from making this heading taller than the PR Cancel one
                <span className="-my-1 block rounded-md bg-slate-100 px-2.5 py-1 font-mono text-[11px] leading-4 text-slate-600">{item.id}</span>
              ) : undefined
            }
          >
            <ol>
              {group.items.map((step, index) => (
                <WorkflowTimelineRow
                  key={step.id}
                  // The row already prints "· role", so drop the "(role)" suffix from the officer name
                  item={{ ...step, processedBy: step.processedBy.replace(/\s*\((CSO|SR|Manager)\)$/, '') }}
                  isLast={index === group.items.length - 1}
                  // The CSO submits the cancel request, so its step carries the cancel date
                  details={
                    step.requestType === 'Close Account' && step.role === 'CSO'
                      ? [{ label: 'Cancel Date', value: close.length > 0 ? approval.cancelledDate ?? '-' : STATIC_CANCEL_DATE }]
                      : undefined
                  }
                />
              ))}
            </ol>
          </DossierCard>
        ))}
      </div>
    </section>
  );
}

/** Record detail pop-up, stacked over the customer dialog */
function RecordDialog({
  type,
  item,
  onClose,
  onDecide,
}: {
  type: CustomerTypeDefinition;
  item: CustomerTypeRecord;
  onClose: () => void;
  onDecide?: (record: CustomerTypeRecord, action: ApprovalAction) => void;
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
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl shadow-blue-950/20 animate-in fade-in zoom-in-95"
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
          {/* Approval types show only their workflow; their fields just repeat who checked / approved */}
          {type.requiresApproval ? <WorkflowHistory item={item} /> : <RecordDetail type={type} item={item} />}
        </div>
        <ApprovalActions item={item} onDecide={onDecide} />
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
            {activeType.requiresApproval ? (
              <WorkflowHistory item={typeRecords[0]} />
            ) : (
              <>
                <SectionHead title={`${activeType.label} details`} recordId={typeRecords[0].id} />
                <RecordDetail type={activeType} item={typeRecords[0]} />
              </>
            )}
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

      {typeRecords.length === 1 && <ApprovalActions item={typeRecords[0]} onDecide={props.onDecide} />}

      {openRecord && (
        <RecordDialog
          type={activeType}
          item={openRecord}
          onClose={() => setOpenRecordId(null)}
          onDecide={props.onDecide}
        />
      )}
    </ViewFrame>
  );
}
