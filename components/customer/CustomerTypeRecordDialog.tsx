'use client';

import React, { useState } from 'react';
import {
  findMissingRequired,
  getCustomerFieldKey,
  getCustomerType,
  initialValues,
  withComputedValues,
  type CustomerTypeValues,
} from '@/lib/customer-types';
import type { CustomerTypeFieldValue, CustomerTypeId, CustomerTypeRecord, Individual } from '@/types';
import { BTN_GHOST, BTN_PRIMARY, CustomerTypeForm, DialogShell, customerName } from './CustomerTypeForm';

export type RecordDialogMode = 'insert' | 'edit';

interface CustomerTypeRecordDialogProps {
  mode: RecordDialogMode;
  typeId: CustomerTypeId;
  record?: CustomerTypeRecord;
  customers: Individual[];
  /** Pre-select and lock the customer (e.g. opened from a customer's row or view) */
  lockedCustomerId?: string;
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
      <span className="font-mono">{customer.customerId}</span> • {customerName(customer)}
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
    onSave({
      id: record?.id ?? `CTR-${Date.now()}`,
      customerId: customerKey ? String(finalValues[customerKey]) : customerId,
      typeId,
      values: finalValues,
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
      onBack={onBack}
      footer={
        <>
          <button type="button" onClick={onBack ?? onClose} className={BTN_GHOST}>
            {onBack ? 'Back' : 'Cancel'}
          </button>
          <button type="button" onClick={handleSave} className={BTN_PRIMARY}>
            {isEdit ? 'Save Changes' : `Add ${type.label}`}
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
