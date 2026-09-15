'use client';

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, Check, Search, X, type LucideIcon } from 'lucide-react';
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

export const BTN_SECONDARY =
  'inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200';
export const BTN_PRIMARY =
  'inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg bg-blue-500 px-5 text-xs font-bold text-white shadow-md shadow-blue-500/25 transition hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 active:scale-[0.98]';

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

const inputClass = (invalid: boolean) =>
  cn(
    'h-9 w-full rounded-lg border bg-white px-2.5 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-2',
    invalid ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:border-blue-400 focus:ring-blue-100'
  );

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95"
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="flex min-w-0 items-center gap-2.5">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                title="Back"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            {Icon && (
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600">
                <Icon className="h-4 w-4" />
              </span>
            )}
            <div className="min-w-0">
              <h3 id={titleId} className="truncate text-sm font-bold text-slate-900">
                {title}
              </h3>
              {subtitle && <div className="mt-0.5 truncate text-xs text-slate-500">{subtitle}</div>}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer && (
          <div className="flex items-center justify-end gap-2 px-5 pb-4 pt-1">{footer}</div>
        )}
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
  onChange,
}: {
  type: CustomerTypeDefinition;
  values: CustomerTypeValues;
  errors: Record<string, boolean>;
  customers: Individual[];
  customerLocked?: boolean;
  onChange: (key: string, value: CustomerTypeFieldValue) => void;
}) {
  return (
    <div className="grid gap-x-4 gap-y-3.5 sm:grid-cols-2 lg:grid-cols-3">
      {type.fields.map((field) => {
        const id = `ct-${type.id}-${field.key}`;
        const invalid = !!errors[field.key];
        return (
          <div
            key={field.key}
            className={cn((field.type === 'textarea' || field.type === 'checkbox') && 'col-span-full')}
          >
            {field.type !== 'checkbox' && (
              <label htmlFor={id} className="mb-1 block text-[11px] font-bold text-slate-600">
                {field.label}
                {field.required && <span className="text-rose-500"> *</span>}
              </label>
            )}

            {field.type === 'customer' ? (
              <CustomerPicker
                id={id}
                value={typeof values[field.key] === 'string' ? (values[field.key] as string) : ''}
                customers={customers}
                locked={customerLocked}
                invalid={invalid}
                placeholder={field.placeholder}
                onChange={(value) => onChange(field.key, value)}
              />
            ) : (
              <FieldInput
                id={id}
                field={field}
                value={
                  field.type === 'computed'
                    ? formatFieldValue(field, String(computeFieldValue(field, values)))
                    : values[field.key]
                }
                invalid={invalid}
                onChange={(value) => onChange(field.key, value)}
              />
            )}

            {invalid && <p className="mt-1 text-[11px] font-medium text-rose-600">{field.label} is required</p>}
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
    case 'computed':
      return (
        <input
          id={id}
          type="text"
          value={text}
          readOnly
          tabIndex={-1}
          className={cn(inputClass(false), 'cursor-default bg-slate-100 tabular-nums text-slate-500')}
        />
      );
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
    case 'select':
      return (
        <select
          id={id}
          value={text}
          onChange={(e) => onChange(e.target.value)}
          className={cn(inputClass(invalid), !text && 'text-slate-400')}
        >
          <option value="">{field.placeholder ?? 'Select…'}</option>
          {field.options?.map((option) => (
            <option key={option} value={option} className="text-slate-800">
              {option}
            </option>
          ))}
        </select>
      );
    case 'textarea':
      return (
        <textarea
          id={id}
          rows={3}
          value={text}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={cn(inputClass(invalid), 'h-auto resize-none py-2')}
        />
      );
    default:
      return (
        <input
          id={id}
          type={field.type}
          value={text}
          placeholder={field.placeholder}
          min={field.type === 'number' ? 0 : undefined}
          step={field.type === 'number' ? 'any' : undefined}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass(invalid)}
        />
      );
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
            className="fixed z-[60] max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl shadow-slate-900/10"
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
                    <span className="block font-mono font-bold text-blue-600">{customer.customerId}</span>
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
          <span className="font-mono font-bold text-blue-600">{customer.customerId}</span>
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
