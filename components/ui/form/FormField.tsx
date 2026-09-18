'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export type FieldSize = 'sm' | 'md' | 'lg';

/** One option shape for every choice control; a bare string is shorthand for { value, label }. */
export type FieldOption = string | { value: string; label: string; description?: string; disabled?: boolean };

export function normalizeOption(option: FieldOption): {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
} {
  return typeof option === 'string' ? { value: option, label: option } : option;
}

const SIZE_CLASS: Record<FieldSize, string> = {
  sm: 'h-8 text-[11px]',
  md: 'h-9 text-xs',
  lg: 'h-10 text-sm',
};

/** Same rhythm as SIZE_CLASS, but growing with its content — for controls that wrap chips. */
const AUTO_SIZE_CLASS: Record<FieldSize, string> = {
  sm: 'min-h-8 py-1 text-[11px]',
  md: 'min-h-9 py-1.5 text-xs',
  lg: 'min-h-10 py-2 text-sm',
};

/** Shared border/focus treatment so inputs, selects and multi-selects read as one system. */
export function fieldControlClass({
  size = 'md',
  invalid = false,
  disabled = false,
  autoHeight = false,
  focusWithin = false,
  className,
}: {
  size?: FieldSize;
  invalid?: boolean;
  disabled?: boolean;
  /** Grow with the content instead of holding a fixed row height. */
  autoHeight?: boolean;
  /** Light the border when something inside takes focus — for composite controls. */
  focusWithin?: boolean;
  className?: string;
} = {}) {
  return cn(
    'w-full rounded-lg border bg-white px-2.5 font-medium text-slate-900 outline-none transition placeholder:font-normal placeholder:text-slate-400',
    // Written out rather than composed, so Tailwind can see the class names.
    focusWithin ? 'focus-within:ring-2' : 'focus:ring-2',
    autoHeight ? AUTO_SIZE_CLASS[size] : SIZE_CLASS[size],
    invalid
      ? focusWithin
        ? 'border-rose-300 focus-within:border-rose-400 focus-within:ring-rose-100'
        : 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
      : focusWithin
        ? 'border-slate-200 focus-within:border-blue-500 focus-within:ring-blue-100'
        : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100',
    disabled && 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400',
    className
  );
}

export interface FormFieldProps {
  /** Rendered above the control; omit for controls that carry their own label. */
  label?: React.ReactNode;
  /** id of the control the label points at. */
  htmlFor?: string;
  required?: boolean;
  /** Helper text; hidden while an error is showing. */
  hint?: React.ReactNode;
  error?: React.ReactNode;
  /** id given to the hint/error node so the control can reference it with aria-describedby. */
  describedById?: string;
  /** Right-aligned note on the hint row, e.g. a character counter. */
  aside?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

/** Label + control + hint/error layout every form control in this kit shares. */
export function FormField({
  label,
  htmlFor,
  required,
  hint,
  error,
  describedById,
  aside,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={htmlFor} className="text-xs font-medium text-slate-500">
          {label}
          {required && <span className="ml-0.5 text-rose-500">*</span>}
        </label>
      )}
      {children}
      {(error || hint || aside) && (
        <div className="flex items-start justify-between gap-2">
          {error ? (
            <p id={describedById} role="alert" className="text-xs font-medium text-rose-600">
              {error}
            </p>
          ) : hint ? (
            <p id={describedById} className="text-[10px] text-slate-400">
              {hint}
            </p>
          ) : (
            <span />
          )}
          {aside && <span className="shrink-0 text-[10px] tabular-nums text-slate-400">{aside}</span>}
        </div>
      )}
    </div>
  );
}
