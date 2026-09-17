'use client';

import React, { useEffect, useId, useRef } from 'react';
import { cn } from '@/lib/utils';
import { FormField, fieldControlClass, type FieldSize } from './FormField';

export interface FormTextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  size?: FieldSize;
  /** Starting height in lines (default 3). */
  rows?: number;
  /** Grow with the text instead of scrolling; turns off the manual resize handle. */
  autoGrow?: boolean;
  /** Show a "n / maxLength" counter on the hint row. Needs maxLength to show the limit. */
  showCount?: boolean;
  containerClassName?: string;
}

/** Multi-line text with the same label, hint and error contract as the rest of the kit. */
export const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(function FormTextarea(
  {
    label,
    hint,
    error,
    size = 'md',
    rows = 3,
    autoGrow = false,
    showCount = false,
    maxLength,
    required,
    disabled,
    value,
    className,
    containerClassName,
    id,
    onChange,
    ...props
  },
  ref
) {
  const autoId = useId();
  const textareaId = id ?? autoId;
  const describedById = error || hint ? `${textareaId}-desc` : undefined;

  const innerRef = useRef<HTMLTextAreaElement>(null);
  React.useImperativeHandle(ref, () => innerRef.current as HTMLTextAreaElement);

  // Re-measure whenever the text changes, so the box tracks the content both ways.
  useEffect(() => {
    if (!autoGrow) return;
    const el = innerRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [autoGrow, value]);

  const length = typeof value === 'string' ? value.length : 0;
  const overLimit = maxLength !== undefined && length > maxLength;

  return (
    <FormField
      label={label}
      htmlFor={textareaId}
      required={required}
      hint={hint}
      error={error}
      describedById={describedById}
      aside={
        showCount ? (
          <span className={cn(overLimit && 'font-semibold text-rose-600')}>
            {length}
            {maxLength !== undefined && ` / ${maxLength}`}
          </span>
        ) : undefined
      }
      className={containerClassName}
    >
      <textarea
        ref={innerRef}
        id={textareaId}
        rows={rows}
        maxLength={maxLength}
        required={required}
        disabled={disabled}
        value={value}
        onChange={onChange}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedById}
        className={fieldControlClass({
          size,
          invalid: Boolean(error),
          disabled,
          autoHeight: true,
          className: cn(
            'block leading-relaxed',
            autoGrow ? 'resize-none overflow-hidden' : 'resize-y',
            className
          ),
        })}
        {...props}
      />
    </FormField>
  );
});
