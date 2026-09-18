'use client';

import React, { useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { DayPicker, type Matcher } from 'react-day-picker';
import { addYears, format, isValid, parseISO, startOfMonth } from 'date-fns';
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FormField, fieldControlClass, type FieldSize } from './FormField';
import { useDismissOnOutside, usePanelPlacement } from './fieldPopover';

const VALUE_FORMAT = 'yyyy-MM-dd';

/** Reads a stored YYYY-MM-DD string; anything unparseable counts as empty. */
function parseValue(value: string | undefined): Date | undefined {
  if (!value) return undefined;
  const date = parseISO(value);
  return isValid(date) ? date : undefined;
}

export interface FormDatePickerProps {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  size?: FieldSize;
  /** Stored as YYYY-MM-DD; an empty string means no date. */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** date-fns pattern for the trigger text (default: "dd MMM yyyy"). */
  displayFormat?: string;
  /** Earliest pickable day, YYYY-MM-DD. */
  min?: string;
  /** Latest pickable day, YYYY-MM-DD. */
  max?: string;
  /** Month and year dropdowns in the caption — for dates far from today, like a birth date. */
  dropdowns?: boolean;
  /** Offer an inline clear button once a date is picked. */
  clearable?: boolean;
  /** Mirrors the value into a hidden input so plain <form> submits still carry it. */
  name?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  className?: string;
  containerClassName?: string;
}

/** Single-date field: a trigger styled like the other controls, opening a react-day-picker calendar. */
export function FormDatePicker({
  label,
  hint,
  error,
  size = 'md',
  value,
  onChange,
  placeholder = 'Select a date…',
  displayFormat = 'dd MMM yyyy',
  min,
  max,
  dropdowns = false,
  clearable = false,
  name,
  required,
  disabled,
  id,
  className,
  containerClassName,
}: FormDatePickerProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const panelId = `${fieldId}-calendar`;
  const describedById = error || hint ? `${fieldId}-desc` : undefined;

  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const selected = parseValue(value);
  const minDate = parseValue(min);
  const maxDate = parseValue(max);
  const today = new Date();

  const disabledDays: Matcher[] = [];
  if (minDate) disabledDays.push({ before: minDate });
  if (maxDate) disabledDays.push({ after: maxDate });

  // The dropdowns need a bounded range; fall back to a century back and a decade ahead.
  const startMonth = startOfMonth(minDate ?? addYears(today, -100));
  const endMonth = startOfMonth(maxDate ?? addYears(today, 10));

  const placement = usePanelPlacement(open, triggerRef, 400);
  useDismissOnOutside(open, () => setOpen(false), triggerRef, panelRef);

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  const pick = (date: Date | undefined) => {
    if (!date) return;
    onChange(format(date, VALUE_FORMAT));
    close();
  };

  const todayDisabled = (minDate && today < minDate) || (maxDate && today > maxDate);
  const iconSize = size === 'lg' ? 'h-4 w-4' : 'h-3.5 w-3.5';

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
        <CalendarDays
          className={cn(
            'pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400',
            iconSize,
            disabled && 'text-slate-300'
          )}
        />
        <button
          ref={triggerRef}
          id={fieldId}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={open ? panelId : undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedById}
          aria-required={required}
          disabled={disabled}
          onClick={() => !disabled && setOpen(!open)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown' && !open) {
              e.preventDefault();
              setOpen(true);
            }
          }}
          className={fieldControlClass({
            size,
            invalid: Boolean(error),
            disabled,
            className: cn('flex items-center pl-8 text-left', clearable && value ? 'pr-12' : 'pr-8', className),
          })}
        >
          <span className={cn('min-w-0 flex-1 truncate', selected ? 'text-slate-800' : 'text-slate-400')}>
            {selected ? format(selected, displayFormat) : placeholder}
          </span>
        </button>

        {clearable && value && !disabled && (
          <span
            role="button"
            tabIndex={-1}
            aria-label="Clear date"
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
            <div
              ref={panelRef}
              id={panelId}
              role="dialog"
              aria-label="Choose a date"
              // The calendar has its own width; the trigger's would squash it on narrow fields.
              style={{ ...placement.style, width: 'auto' }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.stopPropagation();
                  close();
                }
              }}
              className={cn(
                'fixed z-[60] overflow-y-auto overscroll-contain rounded-xl border border-slate-200 bg-white p-3 shadow-[0_16px_40px_-12px_rgba(15,23,42,0.25)]',
                'animate-in fade-in zoom-in-95 duration-100',
                placement.side === 'top' ? 'origin-bottom' : 'origin-top'
              )}
            >
              <DayPicker
                mode="single"
                autoFocus
                selected={selected}
                onSelect={pick}
                defaultMonth={selected ?? (maxDate && today > maxDate ? maxDate : today)}
                startMonth={startMonth}
                endMonth={endMonth}
                disabled={disabledDays}
                captionLayout={dropdowns ? 'dropdown' : 'label'}
                showOutsideDays
                components={{
                  Chevron: ({ orientation, className: chevronClass }) =>
                    orientation === 'left' ? (
                      <ChevronLeft className={cn('h-4 w-4', chevronClass)} />
                    ) : orientation === 'right' ? (
                      <ChevronRight className={cn('h-4 w-4', chevronClass)} />
                    ) : (
                      <ChevronDown className={cn('h-3 w-3', chevronClass)} />
                    ),
                }}
                classNames={{
                  root: 'relative',
                  months: 'flex flex-col',
                  month: 'flex flex-col gap-2',
                  month_caption: 'flex h-8 items-center pl-1 pr-16',
                  caption_label: 'inline-flex items-center gap-1 text-xs font-semibold text-slate-800',
                  dropdowns: 'flex items-center gap-1',
                  dropdown_root:
                    'relative inline-flex items-center rounded-md px-1.5 py-1 transition hover:bg-slate-100 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-blue-100',
                  // The native <select> sits invisibly over the label, so the label is what shows.
                  dropdown: 'absolute inset-0 z-10 w-full cursor-pointer appearance-none opacity-0',
                  nav: 'absolute right-0 top-0 flex h-8 items-center gap-0.5',
                  button_previous:
                    'grid h-7 w-7 place-items-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:pointer-events-none disabled:opacity-30',
                  button_next:
                    'grid h-7 w-7 place-items-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:pointer-events-none disabled:opacity-30',
                  month_grid: 'border-collapse',
                  weekdays: '',
                  weekday: 'h-8 w-8 text-center text-[10px] font-semibold uppercase text-slate-400',
                  week: '',
                  day: 'group h-8 w-8 p-0 text-center text-xs',
                  day_button:
                    'h-8 w-8 rounded-lg font-medium text-slate-700 outline-none transition hover:bg-blue-50 hover:text-blue-600 focus-visible:ring-2 focus-visible:ring-blue-200 group-[.rdp-selected]:bg-blue-500 group-[.rdp-selected]:text-white group-[.rdp-selected]:hover:bg-blue-600 group-[.rdp-today:not(.rdp-selected)]:font-bold group-[.rdp-today:not(.rdp-selected)]:text-blue-600 group-[.rdp-today:not(.rdp-selected)]:ring-1 group-[.rdp-today:not(.rdp-selected)]:ring-inset group-[.rdp-today:not(.rdp-selected)]:ring-blue-200 group-[.rdp-outside]:text-slate-300 group-[.rdp-disabled]:cursor-not-allowed group-[.rdp-disabled]:text-slate-300 group-[.rdp-disabled]:line-through group-[.rdp-disabled]:hover:bg-transparent',
                  // Modifier classes are kept only as hooks for the group-[…] variants above.
                  today: 'rdp-today',
                  selected: 'rdp-selected',
                  outside: 'rdp-outside',
                  disabled: 'rdp-disabled',
                  hidden: 'invisible',
                }}
              />

              <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
                <button
                  type="button"
                  disabled={Boolean(todayDisabled)}
                  onClick={() => pick(today)}
                  className="rounded-md px-2 py-1 text-[11px] font-semibold text-blue-600 transition hover:bg-blue-50 disabled:pointer-events-none disabled:opacity-40"
                >
                  Today
                </button>
                {value && !required && (
                  <button
                    type="button"
                    onClick={() => {
                      onChange('');
                      close();
                    }}
                    className="rounded-md px-2 py-1 text-[11px] font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>,
            document.body
          )}
      </div>
    </FormField>
  );
}
