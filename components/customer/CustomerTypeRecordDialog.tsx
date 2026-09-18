'use client';

import React, { useState } from 'react';
import {
  findMissingRequired,
  getCustomerFieldKey,
  getCustomerType,
  initialValues,
  nextRecordId,
  withComputedValues,
  type CustomerTypeValues,
} from '@/lib/customer-types';
import { newRegistration, resubmitted } from '@/lib/customer-type-approval';
import type { CustomerTypeFieldValue, CustomerTypeId, CustomerTypeRecord, Individual } from '@/types';
import { BTN_PRIMARY, BTN_SECONDARY, CustomerTypeForm, DialogShell, customerName } from './CustomerTypeForm';

export type RecordDialogMode = 'insert' | 'edit';

interface CustomerTypeRecordDialogProps {
  mode: RecordDialogMode;
  typeId: CustomerTypeId;
  record?: CustomerTypeRecord;
  customers: Individual[];
  /** Pre-select and lock the customer (e.g. opened from a customer's row or view) */
  lockedCustomerId?: string;
  /** Ids already in use, so a new record gets the next free one */
  existingIds?: string[];
  onClose: () => void;
  onSave: (record: CustomerTypeRecord) => void;
  onBack?: () => void;
}

/** Insert and edit for any customer type, rendered from its field config */
export function CustomerTypeRecordDialog({
  mode,
  typeId,
  record,
  customers,
  lockedCustomerId,
  existingIds,
  onClose,
  onSave,
  onBack,
}: CustomerTypeRecordDialogProps) {
  const type = getCustomerType(typeId);
  const customerKey = getCustomerFieldKey(type);

  const [values, setValues] = useState<CustomerTypeValues>(() =>
    record ? { ...initialValues(type), ...record.values } : initialValues(type, lockedCustomerId)
  );
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const customerId = record?.customerId ?? (customerKey ? String(values[customerKey] ?? '') : lockedCustomerId ?? '');
  const customer = customers.find((item) => item.id === customerId);
  const isEdit = mode === 'edit' && !!record;

  const subtitle = customer ? (
    <>
      <span className="font-mono font-medium">{customer.customerId}</span>
      <span className="mx-1 text-slate-400">·</span>
      <span className="font-medium text-slate-600">{customerName(customer)}</span>
    </>
  ) : (
    type.description
  );

  const setValue = (key: string, value: CustomerTypeFieldValue) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: false }));
  };

  const handleSave = () => {
    const missing = findMissingRequired(type, values);
    setErrors(Object.fromEntries(missing.map((key) => [key, true])));
    if (missing.length > 0) return;

    const now = new Date().toISOString();
    const finalValues = withComputedValues(type, values);
    // Correcting a record sent back for resubmission puts it up for review again
    const approval = record?.approval
      ? record.approval.requestStatus === 'Resubmit'
        ? resubmitted(record.approval)
        : record.approval
      : type.requiresApproval
        ? newRegistration()
        : undefined;
    onSave({
      id: record?.id ?? nextRecordId(type, existingIds),
      customerId: customerKey ? String(finalValues[customerKey]) : customerId,
      typeId,
      values: finalValues,
      approval,
      createdAt: record?.createdAt ?? now,
      updatedAt: now,
    });
  };

  return (
    <DialogShell
      title={`${isEdit ? 'Edit' : 'Add'} ${type.label}`}
      subtitle={subtitle}
      icon={type.icon}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onBack ?? onClose} className={BTN_SECONDARY}>
            {onBack ? 'Back' : 'Cancel'}
          </button>
          <button type="button" onClick={handleSave} className={BTN_PRIMARY}>
            {isEdit ? 'Save' : 'Add'}
          </button>
        </>
      }
    >
      <CustomerTypeForm
        type={type}
        values={values}
        errors={errors}
        customers={customers}
        customerLocked={!!lockedCustomerId || isEdit}
        onChange={setValue}
      />
    </DialogShell>
  );
}
