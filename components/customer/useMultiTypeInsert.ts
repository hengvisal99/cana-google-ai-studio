'use client';

import { useState } from 'react';
import {
  findMissingRequired,
  getCustomerFieldKey,
  getCustomerType,
  initialValues,
  nextRecordId,
  withComputedValues,
  type CustomerTypeValues,
} from '@/lib/customer-types';
import { newRegistration } from '@/lib/customer-type-approval';
import type { CustomerTypeFieldValue, CustomerTypeId, CustomerTypeRecord, Individual } from '@/types';

export interface MultiTypeInsertOptions {
  /** Opened from a customer's row: starts with that customer (it can still be switched) */
  individual?: Individual;
  /** Customers to choose from */
  customers?: Individual[];
  /** Ids already in use, so new records get the next free ones */
  existingIds?: string[];
  onSaveRecords: (records: CustomerTypeRecord[]) => void;
}

/** State for adding several customer types at once; the customer is kept the same across all selected types */
export function useMultiTypeInsert({ individual, customers, existingIds, onSaveRecords }: MultiTypeInsertOptions) {
  const [selectedIds, setSelectedIds] = useState<CustomerTypeId[]>([]);
  const [activeId, setActiveId] = useState<CustomerTypeId | null>(null);
  const [valuesByType, setValuesByType] = useState<Partial<Record<CustomerTypeId, CustomerTypeValues>>>({});
  const [errorsByType, setErrorsByType] = useState<Partial<Record<CustomerTypeId, Record<string, boolean>>>>({});

  const customerList = customers ?? (individual ? [individual] : []);
  /** One customer for every selected type; each form's customer field mirrors it */
  const [customerId, setCustomerIdState] = useState(individual?.id ?? '');
  const customer = customerList.find((item) => item.id === customerId);

  const addType = (id: CustomerTypeId) => {
    if (selectedIds.includes(id)) return;
    const type = getCustomerType(id);
    const customerKey = getCustomerFieldKey(type);
    setValuesByType((prev) => {
      // Re-adding a removed type keeps what was typed, but follows the current customer
      const values = prev[id] ?? initialValues(type, customerId);
      return { ...prev, [id]: customerKey && customerId ? { ...values, [customerKey]: customerId } : values };
    });
    setSelectedIds((prev) => [...prev, id]);
    setActiveId(id);
  };

  const removeType = (id: CustomerTypeId) => {
    const remaining = selectedIds.filter((item) => item !== id);
    setSelectedIds(remaining);
    setErrorsByType((prev) => ({ ...prev, [id]: {} }));
    if (activeId === id) setActiveId(remaining[remaining.length - 1] ?? null);
  };

  /** Sets the customer for every selected type (and any added later) */
  const setCustomer = (value: string) => {
    setCustomerIdState(value);
    setValuesByType((prev) => {
      const next = { ...prev };
      for (const id of selectedIds) {
        const customerKey = getCustomerFieldKey(getCustomerType(id));
        if (customerKey) next[id] = { ...next[id], [customerKey]: value };
      }
      return next;
    });
    setErrorsByType((prev) => {
      const next = { ...prev };
      for (const id of selectedIds) {
        const customerKey = getCustomerFieldKey(getCustomerType(id));
        if (customerKey && next[id]?.[customerKey]) next[id] = { ...next[id], [customerKey]: false };
      }
      return next;
    });
  };

  const setValue = (typeId: CustomerTypeId, key: string, value: CustomerTypeFieldValue) => {
    if (getCustomerFieldKey(getCustomerType(typeId)) === key) return setCustomer(String(value));
    setValuesByType((prev) => ({ ...prev, [typeId]: { ...prev[typeId], [key]: value } }));
    if (errorsByType[typeId]?.[key]) setErrorsByType((prev) => ({ ...prev, [typeId]: { ...prev[typeId], [key]: false } }));
  };

  const missingByType = Object.fromEntries(
    selectedIds.map((id) => [id, findMissingRequired(getCustomerType(id), valuesByType[id] ?? {})])
  ) as Record<CustomerTypeId, string[]>;

  /** Flagged errors on a type's own fields (the customer is picked once, outside the forms) */
  const hasErrors = (id: CustomerTypeId) => {
    const customerKey = getCustomerFieldKey(getCustomerType(id));
    return Object.entries(errorsByType[id] ?? {}).some(([key, flagged]) => flagged && key !== customerKey);
  };
  /** Save was tried without a customer */
  const customerError = !customerId && selectedIds.some((id) => {
    const customerKey = getCustomerFieldKey(getCustomerType(id));
    return !!customerKey && !!errorsByType[id]?.[customerKey];
  });
  const isComplete = (id: CustomerTypeId) => selectedIds.includes(id) && missingByType[id].length === 0;
  const invalidTypes = selectedIds.filter((id) => hasErrors(id));

  /** Saves every selected type, or flags missing fields and opens the first incomplete type */
  const save = () => {
    setErrorsByType(
      Object.fromEntries(
        selectedIds.map((id) => [id, Object.fromEntries(missingByType[id].map((key) => [key, true]))])
      )
    );
    const firstInvalid = selectedIds.find((id) => missingByType[id].length > 0);
    if (firstInvalid) {
      setActiveId(firstInvalid);
      return;
    }

    const now = new Date().toISOString();
    onSaveRecords(
      selectedIds.map((id) => {
        const type = getCustomerType(id);
        const customerKey = getCustomerFieldKey(type);
        const finalValues = withComputedValues(type, valuesByType[id] ?? {});
        return {
          id: nextRecordId(type, existingIds),
          customerId: customerKey ? String(finalValues[customerKey]) : customerId,
          typeId: id,
          values: finalValues,
          approval: type.requiresApproval ? newRegistration() : undefined,
          createdAt: now,
          updatedAt: now,
        };
      })
    );
  };

  return {
    customerList,
    customerId,
    customer,
    setCustomer,
    customerError,
    selectedIds,
    activeId,
    setActiveId,
    valuesByType,
    errorsByType,
    addType,
    removeType,
    setValue,
    missingByType,
    hasErrors,
    isComplete,
    invalidTypes,
    save,
  };
}

export type MultiTypeInsert = ReturnType<typeof useMultiTypeInsert>;
