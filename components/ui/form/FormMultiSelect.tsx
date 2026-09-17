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

export interface FormMultiSelectProps {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  size?: FieldSize;
  options: FieldOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  /** Filter box at the top of the panel (default: true). */
  searchable?: boolean;
  /** Chips rendered before the "+N" overflow badge. */
  maxVisibleChips?: number;
  /** Cap on how many options may be picked; the rest go disabled once it is reached. */
  maxSelected?: number;
  emptyMessage?: string;
  /** Mirrors each value into a hidden input so plain <form> submits still carry them. */
  name?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  className?: string;
  containerClassName?: string;
}

/** Multi-choice combobox: chips in the trigger, a filterable checklist in a portalled panel. */
export function FormMultiSelect({
  label,
  hint,
  error,
  size = 'md',
  options,
  value,
  onChange,
  placeholder = 'Select…',
  searchable = true,
  maxVisibleChips = 3,
  maxSelected,
  emptyMessage = 'No matching options',
  name,
  required,
  disabled,
  id,
  className,
  containerClassName,
}: FormMultiSelectProps) {
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
  const selected = useMemo(
    () => value.map((v) => allOptions.find((option) => option.value === v) ?? { value: v, label: v }),
    [allOptions, value]
  );
  const atLimit = maxSelected !== undefined && value.length >= maxSelected;

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allOptions;
    return allOptions.filter(
      (option) =>
        option.label.toLowerCase().includes(q) || (option.description ?? '').toLowerCase().includes(q)
    );
  }, [allOptions, query]);

  /** Opening or closing always starts the panel from a clean filter and highlight. */
  const setOpen = (next: boolean) => {
    setOpenState(next);
    setQuery('');
    setHighlight(0);
  };

  const placement = usePanelPlacement(open, triggerRef);
  useDismissOnOutside(open, () => setOpen(false), triggerRef, panelRef);
  useScrollHighlightIntoView(open, open ? optionId(highlight) : undefined);

  const isBlocked = (option: { value: string; disabled?: boolean }) =>
    Boolean(option.disabled) || (atLimit && !value.includes(option.value));

  const toggle = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else if (!atLimit) {
      onChange([...value, optionValue]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (e.key === 'Escape' && open) {
      e.stopPropagation();
      setOpen(false);
      triggerRef.current?.focus();
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
        // Skip over blocked options rather than parking the highlight on one.
        for (let i = 1; i <= matches.length; i += 1) {
          const next = (prev + step * i + matches.length * i) % matches.length;
          if (!isBlocked(matches[next])) return next;
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
      if (option && !isBlocked(option)) toggle(option.value);
      return;
    }

    if (e.key === 'Tab' && open) setOpen(false);
  };

  const visibleChips = selected.slice(0, maxVisibleChips);
  const overflow = selected.length - visibleChips.length;

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
            autoHeight: true,
            className: cn('flex items-center gap-1.5 pr-8 text-left', className),
          })}
        >
          {selected.length === 0 ? (
            <span className="text-slate-400">{placeholder}</span>
          ) : (
            <span className="flex flex-wrap items-center gap-1">
              {visibleChips.map((option) => (
                <span
                  key={option.value}
                  // Neutral on purpose: a chip is a value, not an action. Blue stays
                  // for selection state inside the panel and for the focus ring.
                  // Disabled inverts to white, since the disabled field is itself slate-100.
                  className={cn(
                    'inline-flex max-w-[12rem] items-center gap-1 rounded-md px-1.5 py-0.5 font-medium ring-1 ring-slate-200',
                    disabled ? 'bg-white text-slate-400' : 'bg-slate-100 text-slate-700'
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  {!disabled && (
                    <span
                      role="button"
                      tabIndex={-1}
                      aria-label={'Remove ' + option.label}
                      onClick={(e) => {
                        e.stopPropagation();
                        onChange(value.filter((v) => v !== option.value));
                      }}
                      className="grid h-3.5 w-3.5 shrink-0 place-items-center rounded text-slate-400 transition hover:bg-slate-200 hover:text-slate-600"
                    >
                      <X className="h-2.5 w-2.5" />
                    </span>
                  )}
                </span>
              ))}
              {overflow > 0 && (
                <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-semibold text-slate-500">
                  +{overflow}
                </span>
              )}
            </span>
          )}
        </button>

        <ChevronDown
          className={cn(
            'pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 transition-transform',
            open && 'rotate-180',
            disabled && 'text-slate-300'
          )}
        />

        {name && value.map((v) => <input key={v} type="hidden" name={name} value={v} />)}

        {open &&
          placement &&
          createPortal(
            <FieldPanel
              panelRef={panelRef}
              placement={placement}
              listId={listId}
              multiple
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
                    selected={value.includes(option.value)}
                    highlighted={index === highlight}
                    disabled={isBlocked(option)}
                    multiple
                    onSelect={() => toggle(option.value)}
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
