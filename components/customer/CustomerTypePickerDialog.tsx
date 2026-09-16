'use client';

import React, { useState } from 'react';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import { CUSTOMER_TYPES, getCustomerType } from '@/lib/customer-types';
import type { CustomerTypeId, CustomerTypeRecord, Individual } from '@/types';
import { DialogShell, customerName } from './CustomerTypeForm';
import { CustomerTypeRecordDialog } from './CustomerTypeRecordDialog';

interface CustomerTypePickerDialogProps {
  /** Opened from a customer's row: locks the record to that customer */
  individual?: Individual;
  /** Opened without a customer (Customer Type screen): the form picks one from this list */
  customers?: Individual[];
  /** Ids already in use, so a new record gets the next free one */
  existingIds?: string[];
  onClose: () => void;
  onSaveRecord: (record: CustomerTypeRecord) => void;
}

/**
 * Opened from a customer's row: pick a customer type, then add a record for it with
 * the customer locked. Saving returns to the picker so several types can be added.
 */
export function CustomerTypePickerDialog({
  individual,
  customers,
  existingIds,
  onClose,
  onSaveRecord,
}: CustomerTypePickerDialogProps) {
  const [selectedTypeId, setSelectedTypeId] = useState<CustomerTypeId | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  if (selectedTypeId) {
    return (
      <CustomerTypeRecordDialog
        mode="insert"
        typeId={selectedTypeId}
        customers={individual ? [individual] : (customers ?? [])}
        lockedCustomerId={individual?.id}
        existingIds={existingIds}
        onClose={onClose}
        onBack={() => setSelectedTypeId(null)}
        onSave={(record) => {
          onSaveRecord(record);
          setSavedMessage(`${getCustomerType(record.typeId).label} added.`);
          setSelectedTypeId(null);
        }}
      />
    );
  }

  return (
    <DialogShell
      title="Select Customer Type"
      subtitle={
        individual ? (
          <>
            <span className="font-mono font-medium">{individual.customerId || individual.id}</span>
            <span className="mx-1 text-slate-400">·</span>
            <span className="font-medium text-slate-600">{customerName(individual)}</span>
          </>
        ) : undefined
      }
      onClose={onClose}
    >
      {savedMessage && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          {savedMessage}
        </div>
      )}

      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {CUSTOMER_TYPES.map((type) => {
          const Icon = type.icon;
          return (
            <button
              key={type.id}
              id={`customer-type-option-${type.id}`}
              type="button"
              onClick={() => {
                setSavedMessage(null);
                setSelectedTypeId(type.id);
              }}
              className="group flex h-full cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 text-left transition hover:border-blue-300 hover:bg-blue-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-100"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-100 transition group-hover:bg-blue-100">
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-semibold text-slate-900">{type.label}</span>
                <span className="mt-0.5 block text-[11px] leading-snug text-slate-500">{type.description}</span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-blue-600 transition group-hover:translate-x-0.5" />
            </button>
          );
        })}
      </div>
    </DialogShell>
  );
}
