'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { format } from 'date-fns';
import { motion } from 'motion/react';
import { AlertTriangle, CheckCircle2, Edit3, Eye, Plus, Search, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LIFTED_ACTIVE } from '@/components/individual/DirectoryControls';
import { CUSTOMER_TYPES, formatFieldValue, getCustomerType, getListFields } from '@/lib/customer-types';
import type { CustomerTypeId, CustomerTypeRecord, Individual } from '@/types';
import { FieldValue, customerName } from './CustomerTypeForm';
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
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<CustomerTypeRecord | null>(null);
  const [toast, setToast] = useState<string | null>(null);

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
        const haystack = [
          customer?.customerId ?? record.customerId,
          customer ? customerName(customer) : '',
          ...listFields.map((field) => formatFieldValue(field, record.values[field.key])),
        ]
          .join(' ')
          .toLowerCase();
        return haystack.includes(query);
      })
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [records, activeTypeId, search, customersById, listFields]);

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

  const ActiveIcon = activeType.icon;

  return (
    <div className="space-y-5">
      {toast && (
        <div className="fixed bottom-6 right-6 z-[70] flex items-center gap-2.5 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-xs font-medium text-white shadow-xl animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className={cn(CARD, 'p-6')}>
        <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h1 className="text-[26px] font-black tracking-tight text-slate-900">Customer Type</h1>
            <p className="mt-1 text-xs text-slate-500">
              Manage CSX screen access, client cards, employee trading, VIP and IPO records for every customer.
            </p>
          </div>
          <button
            id="btn-customer-type-add"
            type="button"
            onClick={() => setDialog({ mode: 'insert', typeId: activeTypeId })}
            className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-blue-500 px-5 text-xs font-bold text-white shadow-md shadow-blue-500/30 transition hover:bg-blue-600"
          >
            <Plus className="h-4 w-4" />
            <span>Add {activeType.label}</span>
          </button>
        </div>
      </div>

      {/* Type tabs + search */}
      <div className={cn(CARD, 'p-5 sm:p-6')}>
        {/* Tabs keep their full width; search fills what's left (capped) and wraps below when there's no room */}
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
                    isActive ? 'font-bold text-blue-600' : 'font-medium text-slate-600 hover:text-slate-900'
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

          <div className="flex h-11 max-w-sm flex-1 basis-64 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 transition focus-within:border-slate-400">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              id="input-customer-type-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customer ID, name or value…"
              className="h-full min-w-0 flex-1 bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-400"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="grid h-6 w-6 place-items-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                title="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
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
                <th className="whitespace-nowrap px-4 py-3 font-bold text-slate-700">Customer ID</th>
                <th className="whitespace-nowrap px-4 py-3 font-bold text-slate-700">Customer Name</th>
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
                  <td colSpan={listFields.length + 5} className="py-14 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <span className="grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-slate-400">
                        <ActiveIcon className="h-5 w-5" />
                      </span>
                      <p className="text-sm font-semibold text-slate-700">
                        {search ? 'No matching records' : `No ${activeType.label} records yet`}
                      </p>
                      <p className="text-xs text-slate-400">
                        {search ? 'Try a different search term.' : activeType.description}
                      </p>
                      {search ? (
                        <button
                          type="button"
                          onClick={() => setSearch('')}
                          className="mt-1 text-xs font-bold text-blue-600 hover:underline"
                        >
                          Clear search
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDialog({ mode: 'insert', typeId: activeTypeId })}
                          className="mt-1 text-xs font-bold text-blue-600 hover:underline"
                        >
                          Add {activeType.label}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                rows.map((record, index) => {
                  const customer = customersById.get(record.customerId);
                  return (
                    <tr key={record.id} id={`customer-type-row-${record.id}`} className="group transition-colors hover:bg-slate-50">
                      <td className="px-3 py-3.5 text-center font-mono text-[11px] text-slate-400">{index + 1}</td>
                      <td className="whitespace-nowrap px-4 py-3.5 font-mono font-bold text-blue-600">
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
                      <td className="whitespace-nowrap px-4 py-3.5 text-slate-500">
                        {format(new Date(record.updatedAt), 'dd MMM yyyy')}
                      </td>
                      <td className="sticky right-0 bg-white px-4 py-3.5 shadow-[-8px_0_12px_-10px_rgba(15,23,42,0.25)] transition-colors group-hover:bg-slate-50">
                        <div className="flex items-center justify-end gap-0.5">
                          <button
                            type="button"
                            onClick={() => setDialog({ mode: 'view', record })}
                            className={cn(ICON_BUTTON, 'hover:bg-blue-50 hover:text-blue-600')}
                            title="View"
                            aria-label={`View ${record.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDialog({ mode: 'edit', record })}
                            className={cn(ICON_BUTTON, 'hover:bg-amber-50 hover:text-amber-600')}
                            title="Edit"
                            aria-label={`Edit ${record.id}`}
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingRecord(record)}
                            className={cn(ICON_BUTTON, 'hover:bg-rose-50 hover:text-rose-600')}
                            title="Delete"
                            aria-label={`Delete ${record.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
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

      {dialog?.mode === 'view' && (
        <CustomerTypeViewDialog
          key={`view-${dialog.record.id}`}
          record={dialog.record}
          records={records}
          customers={customers}
          onClose={() => setDialog(null)}
        />
      )}

      {dialog && dialog.mode !== 'view' && (
        <CustomerTypeRecordDialog
          key={dialog.mode === 'insert' ? `insert-${dialog.typeId}` : `edit-${dialog.record.id}`}
          mode={dialog.mode}
          typeId={dialog.mode === 'insert' ? dialog.typeId : dialog.record.typeId}
          record={dialog.mode === 'edit' ? dialog.record : undefined}
          customers={customers}
          onClose={() => setDialog(null)}
          onSave={handleSave}
        />
      )}

      {deletingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="flex items-center gap-2.5 text-sm font-bold text-rose-600">
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
                className="rounded-lg bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-rose-700"
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
