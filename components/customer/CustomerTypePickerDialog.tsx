'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowLeftRight,
  Check,
  ChevronDown,
  ChevronRight,
  Layers,
  Plus,
  Search,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CUSTOMER_TYPES, getCustomerType } from '@/lib/customer-types';
import { BTN_PRIMARY, CustomerTypeForm, DialogShell, customerName } from './CustomerTypeForm';
import { CustomerAvatar, CustomerSelectDialog } from './CustomerSelectDialog';
import { useMultiTypeInsert, type MultiTypeInsert, type MultiTypeInsertOptions } from './useMultiTypeInsert';

interface CustomerTypePickerDialogProps extends MultiTypeInsertOptions {
  onClose: () => void;
}

/**
 * Adds several customer types at once: the left rail holds the customer card and the
 * added types (with an add menu for the rest); the right side shows the active type's form.
 */
export function CustomerTypePickerDialog({ onClose, ...options }: CustomerTypePickerDialogProps) {
  const ctx = useMultiTypeInsert(options);
  const count = ctx.selectedIds.length;
  const activeType = ctx.activeId ? getCustomerType(ctx.activeId) : null;

  return (
    <DialogShell
      title="Add Customer Types"
      onClose={onClose}
      footer={
        <button
          type="button"
          onClick={ctx.save}
          disabled={count === 0}
          className={cn(BTN_PRIMARY, 'disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none')}
        >
          Add
        </button>
      }
    >
      <div className="flex min-h-[320px] flex-col md:min-h-[420px] gap-4 md:flex-row md:gap-5">
        <nav
          aria-label="Customer types"
          className="flex shrink-0 flex-col gap-4 rounded-2xl bg-slate-50 p-2.5 ring-1 ring-inset ring-slate-100 md:sticky md:top-0 md:w-60 md:self-start"
        >
          <RailCustomerCard ctx={ctx} />

          <div className="flex flex-col gap-1">
            {ctx.selectedIds.map((id) => {
              const type = getCustomerType(id);
              const Icon = type.icon;
              const active = id === ctx.activeId;
              const invalid = ctx.hasErrors(id);
              const complete = ctx.isComplete(id);
              return (
                <div
                  key={id}
                  className={cn(
                    'group relative flex items-center gap-1 rounded-xl pr-1.5 transition',
                    active ? 'bg-white shadow-sm ring-1 ring-blue-200' : 'hover:bg-white/80'
                  )}
                >
                  {active && <span className="absolute inset-y-2.5 left-0 w-[3px] rounded-full bg-blue-500" />}
                  <button
                    type="button"
                    aria-current={active ? 'true' : undefined}
                    onClick={() => ctx.setActiveId(id)}
                    className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 py-2 pl-2.5 text-left focus-visible:outline-none"
                  >
                    <span
                      className={cn(
                        'relative grid h-8 w-8 shrink-0 place-items-center rounded-lg transition',
                        active
                          ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30'
                          : invalid
                            ? 'bg-rose-50 text-rose-600 ring-1 ring-inset ring-rose-100'
                            : complete
                              ? 'bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-100'
                              : 'bg-white text-slate-500 ring-1 ring-inset ring-slate-200'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {(complete || invalid) && (
                        <span
                          className={cn(
                            'absolute -bottom-1 -right-1 grid h-3.5 w-3.5 place-items-center rounded-full ring-2 ring-white',
                            invalid ? 'bg-rose-500' : 'bg-emerald-500'
                          )}
                        >
                          {invalid ? (
                            <span className="text-[9px] font-bold leading-none text-white">!</span>
                          ) : (
                            <Check className="h-2.5 w-2.5 text-white" strokeWidth={3.5} />
                          )}
                        </span>
                      )}
                    </span>
                    <span className="min-w-0">
                      <span
                        className={cn(
                          'block truncate text-xs font-semibold',
                          active ? 'text-slate-900' : 'text-slate-700'
                        )}
                      >
                        {type.label}
                      </span>
                      {(invalid || complete) && (
                        <span
                          className={cn(
                            'block truncate text-[10.5px] font-medium',
                            invalid ? 'text-rose-600' : 'text-emerald-600'
                          )}
                        >
                          {invalid ? 'Missing fields' : 'Ready'}
                        </span>
                      )}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => ctx.removeType(id)}
                    aria-label={`Remove ${type.label}`}
                    title={`Remove ${type.label}`}
                    className={cn(
                      'grid h-6 w-6 shrink-0 cursor-pointer place-items-center rounded-md text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 focus-visible:opacity-100 group-hover:opacity-100',
                      active ? 'opacity-100' : 'opacity-0'
                    )}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}

            <div className={cn(count > 0 && 'mt-1')}>
              <AddTypeMenu ctx={ctx} disabled={!ctx.customerId} />
            </div>
          </div>
        </nav>

        <section className="flex min-w-0 flex-1 flex-col">
          {(ctx.invalidTypes.length > 0 || ctx.customerError) && (
            <div className="mb-3 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
              {[
                ctx.customerError && 'Choose a customer.',
                ctx.invalidTypes.length > 0 &&
                  `Complete the required fields in ${ctx.invalidTypes.map((id) => getCustomerType(id).label).join(', ')}.`,
              ]
                .filter(Boolean)
                .join(' ')}
            </div>
          )}

          {activeType && ctx.activeId ? (
            <>
              <h4 className="mb-3 truncate text-sm font-semibold text-slate-900">{activeType.label}</h4>
              <CustomerTypeForm
                key={ctx.activeId}
                type={activeType}
                values={ctx.valuesByType[ctx.activeId] ?? {}}
                errors={ctx.errorsByType[ctx.activeId] ?? {}}
                customers={ctx.customerList}
                hideCustomer
                columns={2}
                onChange={(key, value) => ctx.activeId && ctx.setValue(ctx.activeId, key, value)}
              />
            </>
          ) : (
            <div className="grid min-h-[240px] flex-1 place-items-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-6 text-center">
              <div>
                <span className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-white text-blue-500 shadow-sm ring-1 ring-slate-200">
                  <Layers className="h-5 w-5" />
                </span>
                <p className="mt-3 text-sm font-semibold text-slate-800">
                  {ctx.customerId ? 'Choose a customer type' : 'Choose a customer first'}
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </DialogShell>
  );
}

/* -------------------------------------------------------------------------- */
/* Customer                                                                   */
/* -------------------------------------------------------------------------- */

/** The customer for every type: a "Select customer" button until one is chosen, then their card */
function RailCustomerCard({ ctx }: { ctx: MultiTypeInsert }) {
  const [selecting, setSelecting] = useState(false);
  const closeSelect = useCallback(() => setSelecting(false), []);
  const customer = ctx.customer;

  return (
    <div>
      {!customer ? (
        <div>
          <button
            type="button"
            onClick={() => setSelecting(true)}
            className={cn(
              'flex h-10 w-full cursor-pointer items-center gap-2 rounded-xl border bg-white px-3 text-left text-xs font-medium shadow-sm transition focus-visible:outline-none focus-visible:ring-2',
              ctx.customerError
                ? 'border-rose-300 text-rose-600 focus-visible:ring-rose-100'
                : 'border-slate-200 text-slate-400 hover:border-blue-400 hover:text-blue-600 focus-visible:ring-blue-100'
            )}
          >
            <Search className="h-4 w-4 shrink-0 text-blue-500" />
            <span className="flex-1 truncate">Select customer</span>
            <ChevronRight className="h-4 w-4 shrink-0" />
          </button>
          {ctx.customerError && <p className="mt-1.5 px-1 text-[11px] font-medium text-rose-600">Customer is required</p>}
        </div>
      ) : (
        <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200/70">
          <div className="flex items-center gap-2.5 p-2.5">
            <CustomerAvatar customer={customer} size={40} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-slate-900">{customerName(customer)}</p>
              <span className="mt-0.5 inline-block rounded-md bg-blue-50 px-1.5 py-0.5 font-mono text-[10.5px] font-semibold text-blue-700">
                {customer.customerId}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelecting(true)}
              title="Change customer"
              aria-label="Change customer"
              className="grid h-7 w-7 shrink-0 cursor-pointer place-items-center rounded-lg text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
            >
              <ArrowLeftRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
      {selecting && (
        <CustomerSelectDialog
          customers={ctx.customerList}
          selectedId={ctx.customerId}
          onSelect={(id) => {
            ctx.setCustomer(id);
            closeSelect();
          }}
          onClose={closeSelect}
        />
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Add type menu                                                              */
/* -------------------------------------------------------------------------- */

/** "+ Add customer type" menu listing the types not added yet; stays open to add several */
function AddTypeMenu({ ctx, disabled }: { ctx: MultiTypeInsert; disabled: boolean }) {
  // Starts open, since the dialog opens with nothing added yet
  const [open, setOpen] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);
  const available = CUSTOMER_TYPES.filter((type) => !ctx.selectedIds.includes(type.id));
  const shown = open && !disabled;

  useEffect(() => {
    if (!shown) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    // Capture phase + stopPropagation, so Escape closes the menu without closing the dialog
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      setOpen(false);
    };
    document.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [shown]);

  if (available.length === 0) return null;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={shown}
        aria-haspopup="menu"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'flex w-full items-center gap-2 rounded-lg border border-dashed px-2.5 py-2 text-xs font-semibold transition',
          disabled
            ? 'cursor-not-allowed border-slate-200 bg-white/50 text-slate-300'
            : shown
              ? 'cursor-pointer border-blue-400 bg-blue-50 text-blue-700'
              : 'cursor-pointer border-slate-300 bg-white/70 text-slate-500 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700'
        )}
      >
        <Plus className="h-3.5 w-3.5" />
        Add customer type
        <ChevronDown className={cn('ml-auto h-3.5 w-3.5 transition', shown && 'rotate-180')} />
      </button>

      {shown && (
        <div
          role="menu"
          className="absolute left-0 right-0 top-full z-20 mt-1.5 rounded-xl border border-slate-200 bg-white p-1 shadow-xl shadow-slate-900/10 animate-in fade-in zoom-in-95"
        >
          {available.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                id={`customer-type-option-${type.id}`}
                type="button"
                role="menuitem"
                onClick={() => {
                  ctx.addType(type.id);
                  if (available.length === 1) setOpen(false);
                }}
                className="group flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 text-left transition hover:bg-blue-50"
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-slate-100 text-slate-500 transition group-hover:bg-blue-500 group-hover:text-white">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="min-w-0 flex-1 truncate text-xs font-semibold text-slate-800">{type.label}</span>
                <Plus className="h-3.5 w-3.5 shrink-0 text-slate-300 transition group-hover:text-blue-600" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
