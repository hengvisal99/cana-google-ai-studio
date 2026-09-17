'use client';

import React, { useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  FormField,
  fieldControlClass,
  normalizeOption,
  type FieldOption,
  type FieldSize,
} from './FormField';
import {
  FieldOptionRow,
  FieldPanel,
  FieldPanelEmpty,
  useDismissOnOutside,
  usePanelPlacement,
  useScrollHighlightIntoView,
} from './fieldPopover';

export interface FormSelectProps {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  size?: FieldSize;
  options: FieldOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Filter box at the top of the panel (default: true). */
  searchable?: boolean;
  /** Offer an inline clear button once a value is picked. */
  clearable?: boolean;
  emptyMessage?: string;
  /** Mirrors the value into a hidden input so plain <form> submits still carry it. */
  name?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  className?: string;
  containerClassName?: string;
}

/**
 * Single-choice combobox. It replaces the native <select> so the list can be
 * styled, searched and keyboard-driven the same way FormMultiSelect's is.
 */
export function FormSelect({
  label,
  hint,
  error,
  size = 'md',
  options,
  value,
  onChange,
  placeholder = 'Select…',
  searchable = true,
  clearable = false,
  emptyMessage = 'No matching options',
  name,
  required,
  disabled,
  id,
  className,
  containerClassName,
}: FormSelectProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const listId = `${fieldId}-listbox`;
  const describedById = error || hint ? `${fieldId}-desc` : undefined;
  const optionId = (index: number) => `${fieldId}-opt-${index}`;

  const [open, setOpenState] = useState(false);
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const allOptions = useMemo(() => options.map(normalizeOption), [options]);
  const selected = allOptions.find((option) => option.value === value);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allOptions;
    return allOptions.filter(
      (option) =>
        option.label.toLowerCase().includes(q) || (option.description ?? '').toLowerCase().includes(q)
    );
  }, [allOptions, query]);

  /** Opening starts the list on the current value; closing resets the filter. */
  const setOpen = (next: boolean) => {
    setOpenState(next);
    setQuery('');
    setHighlight(next ? Math.max(0, allOptions.findIndex((option) => option.value === value)) : 0);
  };

  const placement = usePanelPlacement(open, triggerRef);
  useDismissOnOutside(open, () => setOpen(false), triggerRef, panelRef);
  useScrollHighlightIntoView(open, open ? optionId(highlight) : undefined);

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  const pick = (optionValue: string) => {
    onChange(optionValue);
    close();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (e.key === 'Escape' && open) {
      e.stopPropagation();
      close();
      return;
    }

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      if (matches.length === 0) return;
      setHighlight((prev) => {
        const step = e.key === 'ArrowDown' ? 1 : -1;
        // Skip over disabled options rather than parking the highlight on one.
        for (let i = 1; i <= matches.length; i += 1) {
          const next = (prev + step * i + matches.length * i) % matches.length;
          if (!matches[next].disabled) return next;
        }
        return prev;
      });
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      const option = matches[highlight];
      if (option && !option.disabled) pick(option.value);
      return;
    }

    if (e.key === 'Tab' && open) close();
  };

  return (
    <FormField
      label={label}
      htmlFor={fieldId}
      required={required}
      hint={hint}
      error={error}
      describedById={describedById}
      className={containerClassName}
    >
      <div className="relative">
        <button
          ref={triggerRef}
          id={fieldId}
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls={open ? listId : undefined}
          aria-activedescendant={open && matches[highlight] ? optionId(highlight) : undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedById}
          aria-required={required}
          disabled={disabled}
          onClick={() => !disabled && setOpen(!open)}
          onKeyDown={handleKeyDown}
          className={fieldControlClass({
            size,
            invalid: Boolean(error),
            disabled,
            className: cn('flex items-center gap-2 text-left', clearable && value ? 'pr-12' : 'pr-8', className),
          })}
        >
          <span className={cn('min-w-0 flex-1 truncate', selected ? 'text-slate-800' : 'text-slate-400')}>
            {selected?.label ?? placeholder}
          </span>
        </button>

        {clearable && value && !disabled && (
          <span
            role="button"
            tabIndex={-1}
            aria-label="Clear selection"
            title="Clear"
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
            }}
            className="absolute right-7 top-1/2 grid h-5 w-5 -translate-y-1/2 cursor-pointer place-items-center rounded text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-3 w-3" />
          </span>
        )}

        <ChevronDown
          className={cn(
            'pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 transition-transform',
            open && 'rotate-180',
            disabled && 'text-slate-300'
          )}
        />

        {name && <input type="hidden" name={name} value={value} />}

        {open &&
          placement &&
          createPortal(
            <FieldPanel
              panelRef={panelRef}
              placement={placement}
              listId={listId}
              searchable={searchable}
              query={query}
              onQueryChange={(next) => {
                setQuery(next);
                setHighlight(0);
              }}
              onKeyDown={handleKeyDown}
            >
              {matches.length === 0 ? (
                <FieldPanelEmpty message={emptyMessage} />
              ) : (
                matches.map((option, index) => (
                  <FieldOptionRow
                    key={option.value}
                    id={optionId(index)}
                    label={option.label}
                    description={option.description}
                    selected={option.value === value}
                    highlighted={index === highlight}
                    disabled={option.disabled}
                    onSelect={() => pick(option.value)}
                    onHover={() => setHighlight(index)}
                  />
                ))
              )}
            </FieldPanel>,
            document.body
          )}
      </div>
    </FormField>
  );
}
