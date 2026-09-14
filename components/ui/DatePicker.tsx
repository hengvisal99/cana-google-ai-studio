'use client';

import React, { useState, useRef, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { format, parseISO, isValid } from 'date-fns';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  id?: string;
  value?: string; // YYYY-MM-DD
  onChange: (dateStr: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function DatePicker({
  id,
  value,
  onChange,
  placeholder = 'Select date (YYYY-MM-DD)',
  className,
  disabled = false,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedDate = value && isValid(parseISO(value)) ? parseISO(value) : undefined;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      onChange(format(date, 'yyyy-MM-dd'));
      setIsOpen(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center justify-between text-left transition-all duration-150',
          className
        )}
      >
        <span className="flex items-center gap-2 truncate">
          <CalendarIcon className="w-4 h-4 text-blue-600 shrink-0" />
          <span className={selectedDate ? 'text-slate-900 font-medium' : 'text-slate-400 font-normal'}>
            {selectedDate ? format(selectedDate, 'MMM d, yyyy') : placeholder}
          </span>
        </span>
        {value && !disabled && (
          <span
            onClick={handleClear}
            className="p-1 rounded hover:bg-slate-200/60 text-slate-400 hover:text-slate-600 transition"
            title="Clear date"
          >
            <X className="w-3.5 h-3.5" />
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 left-0 p-3 bg-white rounded-xl shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Calendar Picker
            </span>
            {value && (
              <button
                type="button"
                onClick={() => handleSelect(new Date())}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium px-1.5 py-0.5 rounded hover:bg-blue-50"
              >
                Today
              </button>
            )}
          </div>
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            classNames={{
              root: 'p-1',
              chevron: 'w-4 h-4 fill-blue-500 text-blue-600',
              month_caption: 'flex justify-center items-center h-8 font-semibold text-sm text-slate-800',
              nav: 'flex items-center justify-between absolute top-1 left-1 right-1',
              button_previous: 'p-1 text-slate-500 hover:text-blue-600 rounded-md hover:bg-slate-100',
              button_next: 'p-1 text-slate-500 hover:text-blue-600 rounded-md hover:bg-slate-100',
              weeks: 'mt-2 border-collapse',
              weekday: 'w-8 h-8 text-xs font-medium text-slate-400 text-center',
              day: 'w-8 h-8 text-center text-xs p-0 m-0.5 rounded-lg transition-colors',
              day_button: 'w-full h-full rounded-lg hover:bg-blue-50 text-slate-700 hover:text-blue-600 font-medium',
              selected: 'bg-blue-500 text-white font-bold hover:bg-blue-600 hover:text-white',
              today: 'text-blue-600 font-bold underline',
              outside: 'text-slate-300 opacity-50',
            }}
          />
        </div>
      )}
    </div>
  );
}
