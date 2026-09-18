'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { format } from 'date-fns';
import { motion } from 'motion/react';
import {
  AlertTriangle,
  CalendarX2,
  CheckCircle2,
  ChevronDown,
  Edit3,
  Eye,
  MoreVertical,
  Plus,
  Search,
  Trash2,
  X,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CheckBadge, LIFTED_ACTIVE, MENU_SURFACE, Popover } from '@/components/individual/DirectoryControls';
import { CUSTOMER_TYPES, formatFieldValue, getCustomerType, getListFields } from '@/lib/customer-types';
import {
  canRequestClose,
  decide,
  nextStageLabel,
  requestClose,
  type ApprovalAction,
} from '@/lib/customer-type-approval';
import type { CustomerTypeApproval, CustomerTypeId, CustomerTypeRecord, Individual } from '@/types';
import { ApproveDialogAuroraGlass } from '@/components/shared/ApproveDialogVariants';
import { DecisionDialogMatchedMark } from '@/components/shared/DecisionDialogVariants';
import { ApprovalStatus, CloseAccountDialog } from './CustomerTypeApproval';
import { FieldValue, customerName } from './CustomerTypeForm';
import { CustomerTypePickerDialog } from './CustomerTypePickerDialog';
import { CustomerTypeRecordDialog } from './CustomerTypeRecordDialog';
import { CustomerTypeViewDialog } from './CustomerTypeViewDialog';

interface CustomerTypeScreenProps {
  records: CustomerTypeRecord[];
  customers: Individual[];
  onSaveRecord: (record: CustomerTypeRecord) => void;
  onDeleteRecord: (id: string) => void;
}

type DialogState =
  | { mode: 'view'; record: CustomerTypeRecord }
  | { mode: 'insert'; typeId: CustomerTypeId }
  | { mode: 'edit'; record: CustomerTypeRecord };

type SearchByField = 'all' | 'customer' | 'recordId';

const SEARCH_FIELD_OPTIONS: { id: SearchByField; label: string }[] = [
  { id: 'all', label: 'ALL FIELDS' },
  { id: 'customer', label: 'CUSTOMER' },
  { id: 'recordId', label: 'RECORD ID' },
];

const CARD = 'rounded-[20px] border border-slate-200/60 bg-white shadow-[0_10px_40px_-28px_rgba(15,23,42,0.35)]';
const ICON_BUTTON = 'grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition';

/** One list page for every customer type: a tab per type, columns from that type's config */
export function CustomerTypeScreen({
  records,
  customers,
  onSaveRecord,
  onDeleteRecord,
}: CustomerTypeScreenProps) {
  const [activeTypeId, setActiveTypeId] = useState<CustomerTypeId>(CUSTOMER_TYPES[0].id);
  const [search, setSearch] = useState('');
  const [searchBy, setSearchBy] = useState<SearchByField>('all');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<CustomerTypeRecord | null>(null);
  const [picking, setPicking] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  // Approval workflow (types with requiresApproval, e.g. Personal Representative)
  const [decision, setDecision] = useState<{ record: CustomerTypeRecord; action: ApprovalAction } | null>(null);
  const [closingRecord, setClosingRecord] = useState<CustomerTypeRecord | null>(null);

  // Keep the selected tab visible when the tab row is scrolled on narrow screens
  const activeTabRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    activeTabRef.current?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [activeTypeId]);

  const activeType = getCustomerType(activeTypeId);
  const listFields = useMemo(() => getListFields(activeType), [activeType]);
  const customersById = useMemo(() => new Map(customers.map((customer) => [customer.id, customer])), [customers]);

  const counts = useMemo(() => {
    const result: Partial<Record<CustomerTypeId, number>> = {};
    records.forEach((record) => {
      result[record.typeId] = (result[record.typeId] ?? 0) + 1;
    });
    return result;
  }, [records]);

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return records
      .filter((record) => record.typeId === activeTypeId)
      .filter((record) => {
        if (!query) return true;
        const customer = customersById.get(record.customerId);
        const customerText = [customer?.customerId ?? record.customerId, customer ? customerName(customer) : ''];
        const haystack =
          searchBy === 'customer'
            ? customerText
            : searchBy === 'recordId'
              ? [record.id]
              : [
                  record.id,
                  ...customerText,
                  ...listFields.map((field) => formatFieldValue(field, record.values[field.key])),
                ];
        return haystack.join(' ').toLowerCase().includes(query);
      })
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [records, activeTypeId, search, searchBy, customersById, listFields]);

  const activeSearchField = SEARCH_FIELD_OPTIONS.find((option) => option.id === searchBy) ?? SEARCH_FIELD_OPTIONS[0];

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = (record: CustomerTypeRecord) => {
    const isNew = !records.some((item) => item.id === record.id);
    onSaveRecord(record);
    setDialog(null);
    showToast(`${getCustomerType(record.typeId).label} record ${isNew ? 'added' : 'updated'}.`);
  };

  const handleSaveMany = (newRecords: CustomerTypeRecord[]) => {
    newRecords.forEach(onSaveRecord);
    setPicking(false);
    showToast(
      newRecords.length === 1
        ? `${getCustomerType(newRecords[0].typeId).label} record added.`
        : `${newRecords.length} customer type records added.`
    );
  };

  const updateApproval = (record: CustomerTypeRecord, approval: CustomerTypeApproval, message: string) => {
    onSaveRecord({ ...record, approval, updatedAt: new Date().toISOString() });
    showToast(message);
  };

  const handleDecision = (reason = '') => {
    if (!decision?.record.approval) return;
    const { record, action } = decision;
    const next = decide(record.approval!, action, reason);
    setDecision(null);
    updateApproval(
      record,
      next,
      action === 'authorize'
        ? next.requestStatus === 'Approved'
          ? `${record.id} ${next.requestType === 'Close Account' ? 'closed' : 'approved'}.`
          : `${record.id} sent to ${next.currentWorkflowStage} review.`
        : action === 'resubmit'
          ? `${record.id} sent back for resubmission.`
          : `${record.id} rejected.`
    );
  };

  /** Row menu items for the record's current workflow step (approve / resubmit / reject live in the view dialog) */
  const approvalMenuItems = (record: CustomerTypeRecord): RowMenuItem[] => {
    const approval = record.approval;
    if (!approval) return [];
    if (canRequestClose(approval)) {
      return [{ label: 'Close Account', icon: CalendarX2, tone: 'rose', onSelect: () => setClosingRecord(record) }];
    }
    return [];
  };

  const decisionCustomer = decision ? customersById.get(decision.record.customerId) : undefined;
  const closingCustomer = closingRecord ? customersById.get(closingRecord.customerId) : undefined;

  const ActiveIcon = activeType.icon;

  return (
    <div className="space-y-5">
      {toast && (
        <div className="fixed bottom-6 right-6 z-[70] flex items-center gap-2.5 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-xs font-medium text-white shadow-xl animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Identity, tabs and search share one card */}
      <div className={cn(CARD, 'space-y-5 p-5 sm:p-6')}>
        {/* Row 1: identity + primary action */}
        <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h1 className="text-[26px] font-semibold tracking-tight text-slate-900">Customer Type</h1>
            <p className="mt-1 text-xs text-slate-500">
              Manage CSX screen access, client cards, employee trading, VIP, IPO and PR customer records for every customer.
            </p>
          </div>
          <button
            id="btn-customer-type-add"
            type="button"
            onClick={() => setPicking(true)}
            className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-xl bg-blue-500 px-3.5 text-xs font-semibold text-white shadow-md shadow-blue-500/30 transition hover:bg-blue-600"
          >
            <Plus className="h-5 w-5" />
            <span>Add New</span>
          </button>
        </div>

        {/* Row 2: tabs keep their full width; search fills what's left (capped) and wraps below when there's no room */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* One row of tabs; scrolls sideways instead of wrapping when space runs out */}
          <div
            id="customer-type-tabs"
            className="flex max-w-full shrink-0 items-center gap-1 overflow-x-auto rounded-xl border border-slate-200/60 bg-slate-50 p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {CUSTOMER_TYPES.map((type) => {
              const isActive = type.id === activeTypeId;
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  ref={isActive ? activeTabRef : undefined}
                  id={`tab-customer-type-${type.id}`}
                  type="button"
                  onClick={() => setActiveTypeId(type.id)}
                  className={cn(
                    'group relative inline-flex h-[34px] shrink-0 cursor-pointer select-none items-center gap-2 whitespace-nowrap rounded-lg px-3 text-[13px] transition-colors',
                    isActive ? 'font-semibold text-blue-600' : 'font-medium text-slate-600 hover:text-slate-900'
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="customer-type-tab"
                      className={cn('absolute inset-0 rounded-lg', LIFTED_ACTIVE)}
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                    />
                  )}
                  <Icon className={cn('relative h-4 w-4 shrink-0', isActive ? 'text-blue-600' : 'text-slate-400')} />
                  <span className="relative">{type.label}</span>
                  <span
                    className={cn(
                      'relative min-w-[22px] rounded-full px-1.5 py-[3px] text-center text-[11px] font-semibold tabular-nums leading-none transition-colors',
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'bg-slate-200/60 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700'
                    )}
                  >
                    {counts[type.id] ?? 0}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Same search group as the customer directory: field picker, then the query */}
          <div className="flex h-11 max-w-md flex-1 basis-72 items-center gap-1.5 rounded-xl border border-slate-200 bg-white pl-2 pr-1.5 transition focus-within:border-slate-400">
            <Popover
              className="shrink-0"
              trigger={({ open, toggle }) => (
                <button
                  id="btn-customer-type-search-by"
                  type="button"
                  onClick={toggle}
                  aria-expanded={open}
                  className="inline-flex h-8 cursor-pointer select-none items-center gap-1 rounded-lg px-2.5 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                >
                  {activeSearchField.label}
                  <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')} />
                </button>
              )}
            >
              {(close) => (
                <div className={cn('absolute left-0 top-full z-50 mt-3 w-60', MENU_SURFACE)}>
                  {SEARCH_FIELD_OPTIONS.map((option) => {
                    const isSelected = searchBy === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                          setSearchBy(option.id);
                          close();
                          searchInputRef.current?.focus();
                        }}
                        className={cn(
                          'flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider transition',
                          isSelected ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
                        )}
                      >
                        {option.label}
                        {isSelected && <CheckBadge />}
                      </button>
                    );
                  })}
                </div>
              )}
            </Popover>
            <span className="h-5 w-px shrink-0 bg-slate-200" />
            <input
              id="input-customer-type-search"
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="SEARCH RECORDS"
              enterKeyHint="search"
              className="min-w-0 flex-1 bg-transparent px-1.5 text-xs font-semibold uppercase tracking-wide text-slate-800 placeholder:text-slate-400 focus:outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  searchInputRef.current?.focus();
                }}
                aria-label="Clear search"
                title="Clear search"
                className="grid h-7 w-7 shrink-0 cursor-pointer place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => searchInputRef.current?.focus()}
              aria-label="Search"
              title="Search"
              className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-lg bg-slate-100 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600 active:scale-95"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className={cn(CARD, 'overflow-hidden')}>
        <div className="overflow-x-auto">
          <table id="customer-type-table" className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="w-12 px-3 py-3 text-center">No</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-700">Customer ID</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-700">Customer Name</th>
                {listFields.map((field) => (
                  <th
                    key={field.key}
                    className={cn(
                      'whitespace-nowrap px-4 py-3',
                      (field.type === 'number' || field.type === 'computed') && 'text-right'
                    )}
                  >
                    {field.label}
                  </th>
                ))}
                {activeType.requiresApproval && <th className="min-w-[160px] whitespace-nowrap px-4 py-3 font-semibold text-slate-700">Request</th>}
                <th className="whitespace-nowrap px-4 py-3">Last Updated</th>
                {/* Pinned so actions stay reachable when a type has many columns */}
                <th className="sticky right-0 bg-slate-50 px-4 py-3 text-right shadow-[-8px_0_12px_-10px_rgba(15,23,42,0.25)]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={listFields.length + (activeType.requiresApproval ? 6 : 5)} className="py-14 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <span className="grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-slate-400">
                        <ActiveIcon className="h-5 w-5" />
                      </span>
                      <p className="text-sm font-semibold text-slate-700">No record found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                rows.map((record, index) => {
                  const customer = customersById.get(record.customerId);
                  return (
                    <tr key={record.id} id={`customer-type-row-${record.id}`} className="group transition-colors hover:bg-slate-50">
                      <td className="px-3 py-3.5 text-center font-mono text-[11px] text-slate-400">{index + 1}</td>
                      <td className="whitespace-nowrap px-4 py-3.5 font-mono font-semibold text-blue-600">
                        <button
                          type="button"
                          onClick={() => setDialog({ mode: 'view', record })}
                          className="cursor-pointer hover:underline"
                        >
                          {customer?.customerId ?? record.customerId}
                        </button>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 font-semibold text-slate-900">
                        {customer ? customerName(customer) : <span className="text-slate-400">Unknown customer</span>}
                      </td>
                      {listFields.map((field) => (
                        <td
                          key={field.key}
                          className={cn(
                            'whitespace-nowrap px-4 py-3.5 text-slate-600',
                            (field.type === 'number' || field.type === 'computed') && 'text-right',
                            // Long free text stays on one line; full text on hover and in the view dialog
                            field.type === 'textarea' && 'max-w-60 truncate'
                          )}
                          title={field.type === 'textarea' ? formatFieldValue(field, record.values[field.key]) : undefined}
                        >
                          <FieldValue field={field} value={record.values[field.key]} />
                        </td>
                      ))}
                      {activeType.requiresApproval && (
                        <td className="whitespace-nowrap px-4 py-3.5">
                          <ApprovalStatus approval={record.approval} />
                        </td>
                      )}
                      <td className="whitespace-nowrap px-4 py-3.5 text-slate-500">
                        {format(new Date(record.updatedAt), 'dd MMM yyyy')}
                      </td>
                      <td className="sticky right-0 bg-white px-4 py-3.5 shadow-[-8px_0_12px_-10px_rgba(15,23,42,0.25)] transition-colors group-hover:bg-slate-50">
                        <div className="flex items-center justify-end">
                          <RowActionsMenu
                            recordId={record.id}
                            onView={() => setDialog({ mode: 'view', record })}
                            onEdit={() => setDialog({ mode: 'edit', record })}
                            onDelete={() => setDeletingRecord(record)}
                            extraItems={approvalMenuItems(record)}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {picking && (
        <CustomerTypePickerDialog
          customers={customers}
          existingIds={records.map((item) => item.id)}
          onClose={() => setPicking(false)}
          onSaveRecords={handleSaveMany}
        />
      )}

      {dialog?.mode === 'view' && (
        <CustomerTypeViewDialog
          key={`view-${dialog.record.id}`}
          record={dialog.record}
          records={records}
          customers={customers}
          onClose={() => setDialog(null)}
          onDecide={(record, action) => setDecision({ record, action })}
        />
      )}

      {dialog && dialog.mode !== 'view' && (
        <CustomerTypeRecordDialog
          key={dialog.mode === 'insert' ? `insert-${dialog.typeId}` : `edit-${dialog.record.id}`}
          mode={dialog.mode}
          typeId={dialog.mode === 'insert' ? dialog.typeId : dialog.record.typeId}
          record={dialog.mode === 'edit' ? dialog.record : undefined}
          customers={customers}
          existingIds={records.map((item) => item.id)}
          onClose={() => setDialog(null)}
          onSave={handleSave}
        />
      )}

      {decision &&
        (decision.action === 'authorize' ? (
          <ApproveDialogAuroraGlass
            customerName={decisionCustomer ? customerName(decisionCustomer) : decision.record.id}
            customerId={decision.record.id}
            nextStage={nextStageLabel(decision.record.approval?.currentWorkflowStage ?? 'Manager')}
            onCancel={() => setDecision(null)}
            onConfirm={() => handleDecision()}
          />
        ) : (
          <DecisionDialogMatchedMark
            action={decision.action}
            onCancel={() => setDecision(null)}
            onConfirm={(reason) => handleDecision(reason)}
          />
        ))}

      {closingRecord?.approval && (
        <CloseAccountDialog
          recordId={closingRecord.id}
          customerLabel={closingCustomer ? customerName(closingCustomer) : closingRecord.customerId}
          onCancel={() => setClosingRecord(null)}
          onSubmit={(cancelledDate) => {
            const record = closingRecord;
            setClosingRecord(null);
            updateApproval(record, requestClose(record.approval!, cancelledDate), `Close account requested for ${record.id}.`);
          }}
        />
      )}

      {deletingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="flex items-center gap-2.5 text-sm font-semibold text-rose-600">
              <AlertTriangle className="h-5 w-5" />
              <span>Delete {activeType.label} record?</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-600">
              This removes record <span className="font-mono font-semibold">{deletingRecord.id}</span> for{' '}
              {customersById.get(deletingRecord.customerId)
                ? customerName(customersById.get(deletingRecord.customerId) as Individual)
                : 'this customer'}
              . This can’t be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingRecord(null)}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteRecord(deletingRecord.id);
                  setDeletingRecord(null);
                  showToast('Record deleted.');
                }}
                className="rounded-lg bg-rose-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const ROW_MENU_HEIGHT = 132;
const ROW_MENU_ITEM_HEIGHT = 34;
const ROW_MENU_ITEM = 'flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium transition';

/** Workflow actions shown above View / Edit / Delete */
interface RowMenuItem {
  label: string;
  icon: LucideIcon;
  tone: 'emerald' | 'amber' | 'rose';
  onSelect: () => void;
}

const ROW_MENU_TONE: Record<RowMenuItem['tone'], string> = {
  emerald: 'text-emerald-600',
  amber: 'text-amber-600',
  rose: 'text-rose-500',
};

type MenuAnchor = { top: number; right: number; up: boolean };

/**
 * Three-dot row menu. Portaled to <body>: each sticky Action cell is its own stacking context,
 * so a menu rendered inside one gets painted over by the next row's cell.
 */
function RowActionsMenu({
  recordId,
  onView,
  onEdit,
  onDelete,
  extraItems = [],
}: {
  recordId: string;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  extraItems?: RowMenuItem[];
}) {
  const [anchor, setAnchor] = useState<MenuAnchor | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const open = anchor !== null;

  useEffect(() => {
    if (!open) return;
    const close = () => setAnchor(null);
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!menuRef.current?.contains(target) && !triggerRef.current?.contains(target)) close();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    // A fixed menu would drift away from its row, so close it on any scroll or resize
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  const toggle = () => {
    if (open || !triggerRef.current) {
      setAnchor(null);
      return;
    }
    const rect = triggerRef.current.getBoundingClientRect();
    const menuHeight = ROW_MENU_HEIGHT + (extraItems.length ? extraItems.length * ROW_MENU_ITEM_HEIGHT + 9 : 0);
    const up = window.innerHeight - rect.bottom < menuHeight + 16;
    setAnchor({ top: up ? rect.top - 4 : rect.bottom + 4, right: window.innerWidth - rect.right, up });
  };

  const run = (action: () => void) => () => {
    setAnchor(null);
    action();
  };

  return (
    <>
      <button
        ref={triggerRef}
        id={`btn-customer-type-actions-${recordId}`}
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Actions for ${recordId}`}
        title="Actions"
        className={cn(ICON_BUTTON, 'cursor-pointer hover:bg-slate-100 hover:text-slate-700', open && 'bg-slate-100 text-slate-700')}
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {anchor && createPortal(
        <RowActionsPanel
          ref={menuRef}
          anchor={anchor}
          run={run}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          extraItems={extraItems}
        />,
        document.body
      )}
    </>
  );
}

const RowActionsPanel = React.forwardRef<
  HTMLDivElement,
  {
    anchor: MenuAnchor;
    run: (action: () => void) => () => void;
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
    extraItems: RowMenuItem[];
  }
>(function RowActionsPanel({ anchor, run, onView, onEdit, onDelete, extraItems }, ref) {
  return (
    <div
      ref={ref}
      role="menu"
      style={{ right: anchor.right, ...(anchor.up ? { bottom: window.innerHeight - anchor.top } : { top: anchor.top }) }}
      className={cn('fixed z-[60] w-40 animate-in fade-in zoom-in-95', MENU_SURFACE)}
    >
      {extraItems.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.label}
            type="button"
            role="menuitem"
            onClick={run(item.onSelect)}
            className={cn(ROW_MENU_ITEM, 'text-slate-700 hover:bg-slate-50')}
          >
            <Icon className={cn('h-3.5 w-3.5', ROW_MENU_TONE[item.tone])} />
            {item.label}
          </button>
        );
      })}
      {extraItems.length > 0 && <div className="my-1 border-t border-slate-100" />}
      <button type="button" role="menuitem" onClick={run(onView)} className={cn(ROW_MENU_ITEM, 'text-slate-700 hover:bg-slate-50')}>
        <Eye className="h-3.5 w-3.5 text-blue-600" />
        View
      </button>
      <button type="button" role="menuitem" onClick={run(onEdit)} className={cn(ROW_MENU_ITEM, 'text-slate-700 hover:bg-slate-50')}>
        <Edit3 className="h-3.5 w-3.5 text-amber-600" />
        Edit
      </button>
      <div className="my-1 border-t border-slate-100" />
      <button type="button" role="menuitem" onClick={run(onDelete)} className={cn(ROW_MENU_ITEM, 'text-rose-600 hover:bg-rose-50')}>
        <Trash2 className="h-3.5 w-3.5 text-rose-500" />
        Delete
      </button>
    </div>
  );
});
