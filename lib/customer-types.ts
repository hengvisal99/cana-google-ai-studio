import { format } from 'date-fns';
import { Briefcase, CreditCard, Crown, MonitorSmartphone, TrendingUp, UserCheck, type LucideIcon } from 'lucide-react';
import type { CustomerTypeFieldValue, CustomerTypeId } from '@/types';

export type CustomerTypeValues = Record<string, CustomerTypeFieldValue>;

export type CustomerTypeFieldType =
  | 'text'
  | 'number'
  | 'date'
  | 'select'
  | 'textarea'
  | 'checkbox'
  // Owning customer; stores Individual.id
  | 'customer'
  // Side-by-side option buttons, e.g. Active | Close
  | 'segmented'
  // Read-only value derived from other fields via `compute`
  | 'computed';

export type SegmentTone = 'primary' | 'success' | 'danger';

export interface CustomerTypeField {
  key: string;
  label: string;
  type: CustomerTypeFieldType;
  required?: boolean;
  options?: string[];
  /** Display text per option when the stored value is an id */
  optionLabels?: Record<string, string>;
  /** Colour per option for `segmented` fields (default: primary) */
  optionTones?: Record<string, SegmentTone>;
  defaultValue?: string;
  placeholder?: string;
  compute?: (values: CustomerTypeValues) => number;
  format?: 'currency';
  /** Show as a column on the Customer Type list page */
  showInList?: boolean;
  /** Detail views draw fields sharing a group under one caption */
  group?: string;
  /** Label inside its group's row in forms, where the group caption gives context (e.g. Quantity) */
  shortLabel?: string;
}

export interface CustomerTypeDefinition {
  id: CustomerTypeId;
  label: string;
  /** Record id prefix, e.g. `CSX` gives CSX-000020 */
  idPrefix: string;
  description: string;
  icon: LucideIcon;
  fields: CustomerTypeField[];
  /** Records go through registration approval and can request close account, like a customer */
  requiresApproval?: boolean;
}

const toNumber = (value: CustomerTypeFieldValue | undefined) => Number(value) || 0;

const CUSTOMER_FIELD: CustomerTypeField = {
  key: 'customerId',
  label: 'Customer ID',
  type: 'customer',
  required: true,
  placeholder: 'Choose here',
};

// Registration / renewal lifecycle form shared by Employee Trading and VIP Customer
const MEMBERSHIP_FIELDS: CustomerTypeField[] = [
  CUSTOMER_FIELD,
  { key: 'registeredDate', label: 'Registered Date', type: 'date', required: true, showInList: true },
  { key: 'expiredDate', label: 'Expired Date', type: 'date', required: true, showInList: true },
  { key: 'renewalDate', label: 'Renewal Date', type: 'date', required: true, showInList: true },
  { key: 'renewalExpiredDate', label: 'Renewal Expired Date', type: 'date', required: true, showInList: true },
  { key: 'period', label: 'Period', type: 'date', required: true, showInList: true },
  {
    key: 'status',
    label: 'Status',
    type: 'segmented',
    required: true,
    options: ['Active', 'Inactive'],
    optionTones: { Active: 'success', Inactive: 'danger' },
    defaultValue: 'Active',
    showInList: true,
  },
  { key: 'reason', label: 'Reason', type: 'textarea', required: true, showInList: true },
];

/**
 * IPOs a customer can subscribe to. Placeholder list until the IPO catalogue comes
 * from the backend; records store the id, screens show the name.
 */
export const IPO_LIST = [
  { id: 'IPO-2026-001', name: 'MJQE - Mengly J. Quach Education' },
  { id: 'IPO-2026-002', name: 'CGSM - CamGSM (Cellcard)' },
  { id: 'IPO-2026-003', name: 'CANA - Canadia Bank Plc' },
];

export const ipoName = (id: string) => IPO_LIST.find((ipo) => ipo.id === id)?.name ?? id;

/**
 * Customer type catalog. List columns, forms and detail views are all rendered
 * from `fields`, so adding a type or a field only needs a change here.
 */
export const CUSTOMER_TYPES: CustomerTypeDefinition[] = [
  {
    id: 'personal-representative',
    idPrefix: 'PR',
    label: 'PR Customer',
    description: 'Acts on the customer\'s behalf; needs approval.',
    icon: UserCheck,
    requiresApproval: true,
    fields: [
      CUSTOMER_FIELD,
      {
        key: 'accountCheckedBy',
        label: 'Assigned Reviewer',
        type: 'text',
        required: true,
        placeholder: 'e.g. Dara Vong (SR)',
        showInList: true,
      },
      {
        key: 'accountApprovedBy',
        label: 'Approved By',
        type: 'text',
        required: true,
        placeholder: 'e.g. Vannak Lim (Manager)',
        showInList: true,
      },
    ],
  },
  {
    id: 'csx-screen',
    idPrefix: 'CSX',
    label: 'CSX Screen',
    description: 'Access to the CSX trading screen.',
    icon: MonitorSmartphone,
    fields: [
      CUSTOMER_FIELD,
      { key: 'createdDate', label: 'Created Date', type: 'date', required: true, showInList: true },
      { key: 'closedDate', label: 'Closed Date', type: 'date', required: true, showInList: true },
      {
        key: 'status',
        label: 'Status',
        type: 'segmented',
        required: true,
        options: ['Active', 'Close'],
        optionTones: { Active: 'success', Close: 'danger' },
        defaultValue: 'Active',
        showInList: true,
      },
    ],
  },
  {
    id: 'client-card',
    idPrefix: 'CARD',
    label: 'Client Card',
    description: 'Physical client identification card.',
    icon: CreditCard,
    fields: [CUSTOMER_FIELD, { key: 'takenDate', label: 'Taken Date', type: 'date', required: true, showInList: true }],
  },
  {
    id: 'employee-trading',
    idPrefix: 'EMP',
    label: 'Employee Trading',
    description: 'Staff account trading under compliance rules.',
    icon: Briefcase,
    fields: MEMBERSHIP_FIELDS,
  },
  {
    id: 'vip-customer',
    idPrefix: 'VIP',
    label: 'VIP Customer',
    description: 'Priority service and preferential fees.',
    icon: Crown,
    fields: MEMBERSHIP_FIELDS,
  },
  {
    id: 'ipo-customer',
    idPrefix: 'IPO',
    label: 'IPO Customer',
    description: 'Subscribes to initial public offerings.',
    icon: TrendingUp,
    fields: [
      CUSTOMER_FIELD,
      {
        key: 'ipoNameId',
        label: 'IPO Name',
        type: 'select',
        required: true,
        placeholder: 'Choose here',
        options: IPO_LIST.map((ipo) => ipo.id),
        optionLabels: Object.fromEntries(IPO_LIST.map((ipo) => [ipo.id, ipo.name])),
        showInList: true,
      },
      { key: 'bookBuildingDate', label: 'Book Building Date', type: 'date', required: true },
      {
        key: 'purchaseQuantity',
        label: 'Purchase Quantity',
        shortLabel: 'Quantity',
        type: 'number',
        required: true,
        showInList: true,
        group: 'Purchase',
      },
      {
        key: 'purchasePrice',
        label: 'Purchase Price',
        shortLabel: 'Price',
        type: 'number',
        required: true,
        format: 'currency',
        showInList: true,
        group: 'Purchase',
      },
      {
        key: 'totalAmount',
        label: 'Total Amount',
        shortLabel: 'Total',
        type: 'computed',
        format: 'currency',
        compute: (v) => toNumber(v.purchaseQuantity) * toNumber(v.purchasePrice),
        showInList: true,
        group: 'Purchase',
      },
      {
        key: 'subQuantity',
        label: 'Sub Quantity',
        shortLabel: 'Quantity',
        type: 'number',
        required: true,
        group: 'Subscription',
      },
      {
        key: 'subPrice',
        label: 'Sub Price',
        shortLabel: 'Price',
        type: 'number',
        required: true,
        format: 'currency',
        group: 'Subscription',
      },
      {
        key: 'subTotalAmount',
        label: 'Sub Total Amount',
        shortLabel: 'Total',
        type: 'computed',
        format: 'currency',
        compute: (v) => toNumber(v.subQuantity) * toNumber(v.subPrice),
        group: 'Subscription',
      },
      {
        key: 'subscriptionDate',
        label: 'Subscription Date',
        type: 'date',
        required: true,
        showInList: true,
        group: 'Subscription',
      },
    ],
  },
];

/** Next free record id for a type, zero padded: CSX-000020 */
export function nextRecordId(type: CustomerTypeDefinition, existingIds: string[] = []): string {
  const pattern = new RegExp(`^${type.idPrefix}-(\d+)$`);
  const highest = existingIds.reduce((max, id) => {
    const match = pattern.exec(id);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return `${type.idPrefix}-${String(highest + 1).padStart(6, '0')}`;
}

export function getCustomerType(id: CustomerTypeId): CustomerTypeDefinition {
  return CUSTOMER_TYPES.find((type) => type.id === id) as CustomerTypeDefinition;
}

export function getCustomerFieldKey(type: CustomerTypeDefinition): string | undefined {
  return type.fields.find((field) => field.type === 'customer')?.key;
}

export function getListFields(type: CustomerTypeDefinition): CustomerTypeField[] {
  return type.fields.filter((field) => field.showInList);
}

export function initialValues(type: CustomerTypeDefinition, customerId = ''): CustomerTypeValues {
  return Object.fromEntries(
    type.fields.map((field) => {
      if (field.type === 'checkbox') return [field.key, false];
      if (field.type === 'customer') return [field.key, customerId];
      return [field.key, field.defaultValue ?? ''];
    })
  );
}

/** Keys of required fields that are still empty */
export function findMissingRequired(type: CustomerTypeDefinition, values: CustomerTypeValues): string[] {
  return type.fields
    .filter(
      (field) =>
        field.required &&
        field.type !== 'checkbox' &&
        field.type !== 'computed' &&
        String(values[field.key] ?? '').trim() === ''
    )
    .map((field) => field.key);
}

export function computeFieldValue(field: CustomerTypeField, values: CustomerTypeValues): number {
  const result = field.compute?.(values) ?? 0;
  return Number.isFinite(result) ? Math.round(result * 100) / 100 : 0;
}

/** Values with every computed field filled in, ready to store */
export function withComputedValues(type: CustomerTypeDefinition, values: CustomerTypeValues): CustomerTypeValues {
  const computed = type.fields
    .filter((field) => field.type === 'computed')
    .map((field) => [field.key, String(computeFieldValue(field, values))]);
  return { ...values, ...Object.fromEntries(computed) };
}

/** Display text for a stored value (dates, numbers, currency); `—` when empty */
export function formatFieldValue(field: CustomerTypeField, value: CustomerTypeFieldValue | undefined): string {
  if (value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (field.optionLabels?.[value]) return field.optionLabels[value];

  if (field.type === 'date') {
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? value : format(date, 'dd MMM yyyy');
  }

  if (field.type === 'number' || field.type === 'computed') {
    const number = Number(value);
    if (!Number.isFinite(number)) return value;
    if (field.format === 'currency') {
      // Whole amounts stay short ($2,500); fractional ones get cents ($4.20)
      const cents = Number.isInteger(number) ? 0 : 2;
      return `$${number.toLocaleString('en-US', { minimumFractionDigits: cents, maximumFractionDigits: 2 })}`;
    }
    return number.toLocaleString('en-US', { maximumFractionDigits: 2 });
  }

  return value;
}
