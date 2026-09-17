'use client';

import React, { useId } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FormField, fieldControlClass, type FieldSize } from './FormField';

export interface FormInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  size?: FieldSize;
  /** Icon pinned inside the left edge. */
  icon?: LucideIcon;
  /** Static unit or suffix pinned inside the right edge, e.g. "USD". */
  suffix?: React.ReactNode;
  /** Classes for the wrapping field, not the <input>. */
  containerClassName?: string;
}

/** Text-style input (text, email, number, date, password…) with label, hint and error states. */
export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(function FormInput(
  {
    label,
    hint,
    error,
    size = 'md',
    icon: Icon,
    suffix,
    required,
    disabled,
    className,
    containerClassName,
    id,
    ...props
  },
  ref
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const describedById = error || hint ? `${inputId}-desc` : undefined;
  const iconSize = size === 'lg' ? 'h-4 w-4' : 'h-3.5 w-3.5';

  return (
    <FormField
      label={label}
      htmlFor={inputId}
      required={required}
      hint={hint}
      error={error}
      describedById={describedById}
      className={containerClassName}
    >
      <div className="relative">
        {Icon && (
          <Icon
            className={cn(
              'pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400',
              iconSize,
              disabled && 'text-slate-300'
            )}
          />
        )}
        <input
          ref={ref}
          id={inputId}
          required={required}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedById}
          className={fieldControlClass({
            size,
            invalid: Boolean(error),
            disabled,
            className: cn(Icon && 'pl-8', suffix && 'pr-12', className),
          })}
          {...props}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            {suffix}
          </span>
        )}
      </div>
    </FormField>
  );
});
