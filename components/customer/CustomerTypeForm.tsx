'use client';

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, Check, DollarSign, Search, X, AlertTriangle, CheckCircle2, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  computeFieldValue,
  formatFieldValue,
  type CustomerTypeDefinition,
  type CustomerTypeField,
  type CustomerTypeValues,
  type SegmentTone,
} from '@/lib/customer-types';
import type { CustomerTypeFieldValue, Individual } from '@/types';
import {
  FormDatePicker,
  FormField,
  FormInput,
  FormSelect,
  FormTextarea,
  fieldControlClass,
} from '@/components/ui/form';

export const BTN_SECONDARY =
  'inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20';
export const BTN_PRIMARY =
  'inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-xl bg-indigo-600 px-6 text-sm font-bold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 active:scale-[0.98]';

const SEGMENT_SELECTED: Record<SegmentTone, string> = {
  primary: 'bg-blue-500 text-white',
  success: 'bg-emerald-500 text-white',
  danger: 'bg-rose-500 text-white',
};

const BADGE_TONE: Record<SegmentTone, string> = {
  primary: 'bg-blue-50 text-blue-700 ring-blue-200',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  danger: 'bg-rose-50 text-rose-700 ring-rose-200',
};

const DOT_TONE: Record<SegmentTone, string> = {
  primary: 'bg-blue-500',
  success: 'bg-emerald-500',
  danger: 'bg-rose-500',
};

export function customerName(individual: Individual): string {
  return individual.fullNameEN || `${individual.firstName} ${individual.lastName}`;
}

/** Same control style as the form kit (components/ui/form) */
const inputClass = (invalid: boolean) => fieldControlClass({ invalid });

/* -------------------------------------------------------------------------- */
/* Dialog shell                                                               */
/* -------------------------------------------------------------------------- */

export function DialogShell({
  title,
  subtitle,
  icon: Icon,
  onClose,
  onBack,
  footer,
  children,
}: {
  title: string;
  subtitle?: React.ReactNode;
  icon?: LucideIcon;
  onClose: () => void;
  onBack?: () => void;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  const titleId = useId();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 sm:p-6 backdrop-blur-md">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex max-h-[90vh] w-full max-w-5xl flex-col rounded-[24px] border border-white/60 bg-white/95 backdrop-blur-xl shadow-2xl shadow-indigo-900/10 animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-200/60 px-6 py-5 bg-white/50 rounded-t-[24px]">
          <div className="flex min-w-0 items-center gap-3">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                title="Back"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            {Icon && (
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-md shadow-indigo-500/20">
                <Icon className="h-5 w-5" />
              </div>
            )}
            <div className="min-w-0">
              <h3 id={titleId} className="truncate text-lg font-bold text-slate-900">
                {title}
              </h3>
              {subtitle && <div className="mt-0.5 truncate text-sm text-slate-500 font-medium">{subtitle}</div>}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 scrollbar-thin scrollbar-thumb-slate-200">{children}</div>

        {footer && <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-slate-200/60 bg-slate-50/50 rounded-b-[24px]">{footer}</div>}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Form                                                                       */
/* -------------------------------------------------------------------------- */

export function CustomerTypeForm({
  type,
  values,
  errors,
  customers,
  customerLocked = false,
  hideCustomer = false,
  columns = 3,
  onChange,
}: {
  type: CustomerTypeDefinition;
  values: CustomerTypeValues;
  errors: Record<string, boolean>;
  customers: Individual[];
  customerLocked?: boolean;
  /** The customer is picked outside the form (e.g. once for several types) */
  hideCustomer?: boolean;
  /** Fields per row on wide screens; 2 keeps start/end date pairs side by side */
  columns?: 2 | 3;
  onChange: (key: string, value: CustomerTypeFieldValue) => void;
}) {
  const fields = hideCustomer ? type.fields.filter((field) => field.type !== 'customer') : type.fields;

  // Consecutive fields sharing a group (e.g. Purchase: quantity, price, total) render as one row
  const sections: { group?: string; fields: CustomerTypeField[] }[] = [];
  for (const field of fields) {
    const last = sections[sections.length - 1];
    if (last && last.group === field.group) last.fields.push(field);
    else sections.push({ group: field.group, fields: [field] });
  }

  const renderField = (field: CustomerTypeField, inGroup = false) => {
    const id = `ct-${type.id}-${field.key}`;
    const invalid = !!errors[field.key];
    const label = (inGroup && field.shortLabel) || field.label;

    const error = invalid ? `${label} is required` : undefined;
    const text = typeof values[field.key] === 'string' ? (values[field.key] as string) : '';
    const set = (value: CustomerTypeFieldValue) => onChange(field.key, value);

    switch (field.type) {
      case 'text':
      case 'number':
        return (
          <FormInput
            key={field.key}
            id={id}
            label={label}
            required={field.required}
            error={error}
            type={field.type}
            value={text}
            placeholder={field.placeholder}
            min={field.type === 'number' ? 0 : undefined}
            step={field.type === 'number' ? 'any' : undefined}
            icon={field.format === 'currency' ? DollarSign : undefined}
            onChange={(e) => set(e.target.value)}
          />
        );
      case 'computed':
        return (
          <FormInput
            key={field.key}
            id={id}
            label={label}
            value={formatFieldValue(field, String(computeFieldValue(field, values)))}
            readOnly
            tabIndex={-1}
            className="cursor-default bg-slate-100 tabular-nums text-slate-500"
          />
        );
      case 'date':
        return (
          <FormDatePicker
            key={field.key}
            id={id}
            label={label}
            required={field.required}
            error={error}
            value={text}
            onChange={set}
          />
        );
      case 'select':
        return (
          <FormSelect
            key={field.key}
            id={id}
            label={label}
            required={field.required}
            error={error}
            value={text}
            placeholder={field.placeholder}
            options={(field.options ?? []).map((option) => ({
              value: option,
              label: field.optionLabels?.[option] ?? option,
            }))}
            onChange={set}
          />
        );
      case 'textarea':
        return (
          <FormTextarea
            key={field.key}
            id={id}
            label={label}
            required={field.required}
            error={error}
            rows={3}
            value={text}
            placeholder={field.placeholder}
            onChange={(e) => set(e.target.value)}
            containerClassName="col-span-full"
          />
        );
      case 'checkbox':
        return (
          <div key={field.key} className="col-span-full">
            <FieldInput id={id} field={field} value={values[field.key]} invalid={invalid} onChange={set} />
          </div>
        );
      default:
        // No kit control for these; FormField keeps the same label / error layout
        return (
          <FormField key={field.key} label={label} htmlFor={id} required={field.required} error={error}>
            {field.type === 'customer' ? (
              <div className="space-y-2">
                <CustomerPicker
                  id={id}
                  value={text}
                  customers={customers}
                  locked={customerLocked}
                  invalid={invalid}
                  placeholder={field.placeholder}
                  onChange={set}
                />
                {text && type.id === 'ipo-customer' && (
                  (() => {
                    const cust = customers.find(c => c.id === text);
                    if (!cust) return null;
                    const today = new Date();
                    
                    const kycExpired = cust.expiredDate && new Date(cust.expiredDate) < today;
                    const noSeccId = !cust.investorIdInfo?.investorIdNumber;
                    const seccExpired = cust.investorIdInfo?.investorIdExpiredDate && new Date(cust.investorIdInfo.investorIdExpiredDate) < today;

                    if (noSeccId) {
                      return (
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-50 border border-rose-200">
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-rose-800">Ineligible for IPO</p>
                            <p className="text-xs text-rose-600 mt-0.5">Customer is missing an SECC Investor ID. Please apply for one before subscribing.</p>
                          </div>
                        </div>
                      );
                    }
                    if (kycExpired || seccExpired) {
                      return (
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-amber-800">Eligibility Warning</p>
                            <p className="text-xs text-amber-600 mt-0.5">
                              {kycExpired ? "Customer KYC/ID has expired. " : ""}
                              {seccExpired ? "SECC Investor ID has expired. " : ""}
                              This must be renewed for allotment.
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div className="flex items-start gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-emerald-800">Eligible for IPO</p>
                          <p className="text-xs text-emerald-600 mt-0.5">Customer KYC and SECC ID are valid.</p>
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>
            ) : (
              <FieldInput id={id} field={field} value={values[field.key]} invalid={invalid} onChange={set} />
            )}
          </FormField>
        );
    }
  };

  return (
    <div className="space-y-4">
      {sections.map((section, sectionIndex) => {
        if (!section.group) {
          return (
            <div
              key={`fields-${sectionIndex}`}
              className={cn('grid gap-x-4 gap-y-3.5 sm:grid-cols-2', columns === 3 && 'lg:grid-cols-3')}
            >
              {section.fields.map((field) => renderField(field))}
            </div>
          );
        }

        // Quantity × Price = Total when the group has a computed value; its other fields (e.g. a date) sit below
        const calculated = section.fields.some((field) => field.type === 'computed');
        const isCalcField = (field: CustomerTypeField) => field.type === 'number' || field.type === 'computed';
        const rowFields = calculated ? section.fields.filter(isCalcField) : section.fields;
        const otherFields = calculated ? section.fields.filter((field) => !isCalcField(field)) : [];
        return (
          <div key={section.group} className="pt-1">
            <p className="mb-2.5 text-[10.5px] font-semibold uppercase tracking-wider text-slate-400">{section.group}</p>
            <div className="flex flex-col gap-3.5 sm:flex-row sm:items-start sm:gap-2">
              {rowFields.map((field, index) => (
                <React.Fragment key={field.key}>
                  {index > 0 && calculated && (
                    <span
                      aria-hidden
                      className="hidden h-9 w-4 shrink-0 items-center justify-center text-sm font-semibold text-slate-400 sm:mt-5 sm:flex"
                    >
                      {field.type === 'computed' ? '=' : '×'}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">{renderField(field, true)}</div>
                </React.Fragment>
              ))}
            </div>
            {/* Same columns as the row above, so e.g. a date lines up with Quantity */}
            {otherFields.map((field) => (
              <div key={field.key} className="mt-3.5 flex flex-col sm:flex-row sm:gap-2">
                <div className="min-w-0 flex-1">{renderField(field, true)}</div>
                {rowFields.slice(1).map((spacer) => (
                  <React.Fragment key={spacer.key}>
                    <span aria-hidden className="hidden w-4 shrink-0 sm:block" />
                    <span aria-hidden className="hidden min-w-0 flex-1 sm:block" />
                  </React.Fragment>
                ))}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function FieldInput({
  id,
  field,
  value,
  invalid,
  onChange,
}: {
  id: string;
  field: CustomerTypeField;
  value: CustomerTypeFieldValue | undefined;
  invalid: boolean;
  onChange: (value: CustomerTypeFieldValue) => void;
}) {
  const text = typeof value === 'string' ? value : '';

  switch (field.type) {
    case 'segmented':
      return (
        <div
          role="radiogroup"
          aria-label={field.label}
          className={cn('grid overflow-hidden rounded-lg border', invalid ? 'border-rose-300' : 'border-slate-200')}
          style={{ gridTemplateColumns: `repeat(${field.options?.length ?? 1}, minmax(0, 1fr))` }}
        >
          {field.options?.map((option, index) => {
            const selected = text === option;
            return (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onChange(option)}
                className={cn(
                  'h-9 text-xs font-semibold transition',
                  index > 0 && 'border-l border-slate-200',
                  selected
                    ? SEGMENT_SELECTED[field.optionTones?.[option] ?? 'primary']
                    : 'bg-white text-slate-600 hover:bg-slate-50'
                )}
              >
                {option}
              </button>
            );
          })}
        </div>
      );
    case 'checkbox':
      return (
        <label
          htmlFor={id}
          className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <input
            id={id}
            type="checkbox"
            checked={value === true}
            onChange={(e) => onChange(e.target.checked)}
            className="h-3.5 w-3.5 accent-blue-500"
          />
          {field.label}
        </label>
      );
    default:
      return null;
  }
}

/** Searchable customer combobox; the list is portalled so the dialog's scroll area can't clip it */
function CustomerPicker({
  id,
  value,
  customers,
  locked,
  invalid,
  placeholder,
  onChange,
}: {
  id: string;
  value: string;
  customers: Individual[];
  locked: boolean;
  invalid: boolean;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [rect, setRect] = useState<DOMRect | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selected = customers.find((customer) => customer.id === value);
  const selectedLabel = selected ? `${selected.customerId} · ${customerName(selected)}` : '';

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return customers
      .filter((customer) => !q || `${customer.customerId} ${customerName(customer)}`.toLowerCase().includes(q))
      .slice(0, 8);
  }, [customers, query]);

  useEffect(() => {
    if (!open) return;
    const updateRect = () => setRect(inputRef.current?.getBoundingClientRect() ?? null);
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!inputRef.current?.contains(target) && !listRef.current?.contains(target)) setOpen(false);
    };
    updateRect();
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);
    document.addEventListener('mousedown', handleMouseDown);
    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [open]);

  if (locked) {
    return (
      <div className="relative">
        <input
          id={id}
          type="text"
          value={selectedLabel || value}
          readOnly
          className={cn(inputClass(false), 'cursor-default bg-slate-50 pr-9 text-slate-700')}
        />
        <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
      </div>
    );
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        id={id}
        type="text"
        role="combobox"
        aria-expanded={open}
        autoComplete="off"
        value={open ? query : selectedLabel}
        placeholder={selectedLabel || placeholder}
        onFocus={() => {
          setQuery('');
          setOpen(true);
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape' && open) {
            e.stopPropagation();
            setOpen(false);
          }
          if (e.key === 'Enter' && open && matches[0]) {
            e.preventDefault();
            onChange(matches[0].id);
            setOpen(false);
          }
        }}
        className={cn(inputClass(invalid), 'pr-9')}
      />
      <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-500" />

      {open &&
        rect &&
        createPortal(
          <div
            ref={listRef}
            className="fixed z-[110] max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl shadow-slate-900/10"
            style={{ top: rect.bottom + 4, left: rect.left, width: rect.width }}
          >
            {matches.length === 0 ? (
              <p className="px-3 py-2 text-xs text-slate-400">No customers found</p>
            ) : (
              matches.map((customer) => (
                <button
                  key={customer.id}
                  type="button"
                  onClick={() => {
                    onChange(customer.id);
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition hover:bg-slate-50"
                >
                  <span className="min-w-0">
                    <span className="block font-mono font-semibold text-blue-600">{customer.customerId}</span>
                    <span className="block truncate text-slate-600">{customerName(customer)}</span>
                  </span>
                  {customer.id === value && <Check className="h-3.5 w-3.5 shrink-0 text-blue-600" />}
                </button>
              ))
            )}
          </div>,
          document.body
        )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Read-only value                                                            */
/* -------------------------------------------------------------------------- */

export function FieldValue({
  field,
  value,
  customers = [],
}: {
  field: CustomerTypeField;
  value: CustomerTypeFieldValue | undefined;
  customers?: Individual[];
}) {
  if (field.type === 'customer') {
    const customer = customers.find((item) => item.id === value);
    if (customer) {
      return (
        <span className="flex flex-col">
          <span className="font-mono font-semibold text-blue-600">{customer.customerId}</span>
          <span className="text-slate-600">{customerName(customer)}</span>
        </span>
      );
    }
  }

  if (field.type === 'segmented' && typeof value === 'string' && value) {
    const tone = field.optionTones?.[value] ?? 'primary';
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset',
          BADGE_TONE[tone]
        )}
      >
        <span className={cn('h-1.5 w-1.5 rounded-full', DOT_TONE[tone])} />
        {value}
      </span>
    );
  }

  return (
    <span className={cn('tabular-nums', field.type === 'textarea' && 'whitespace-pre-wrap')}>
      {formatFieldValue(field, value)}
    </span>
  );
}
