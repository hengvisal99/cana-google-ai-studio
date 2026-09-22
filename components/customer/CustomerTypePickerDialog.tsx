'use client';

import React, { useCallback, useState } from 'react';
import {
  ArrowLeftRight,
  Check,
  ChevronRight,
  Layers,
  Search,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CUSTOMER_TYPES, getCustomerType } from '@/lib/customer-types';
import { BTN_PRIMARY, CustomerTypeForm, DialogShell, customerName } from './CustomerTypeForm';
import { CustomerAvatar, CustomerSelectDialog } from './CustomerSelectDialog';
import { useMultiTypeInsert, type MultiTypeInsert, type MultiTypeInsertOptions } from './useMultiTypeInsert';
import type { CustomerTypeId } from '@/types';

interface CustomerTypePickerDialogProps extends MultiTypeInsertOptions {
  onClose: () => void;
}

/**
 * Adds several customer types at once: the left rail holds the customer card and every
 * type (one click adds it, the remove icon takes it out); the right side shows the active type's form.
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
            {CUSTOMER_TYPES.map((type) => {
              const id = type.id;
              const Icon = type.icon;
              if (!ctx.selectedIds.includes(id)) {
                return <AddTypeCard key={id} ctx={ctx} typeId={id} disabled={!ctx.customerId} />;
              }
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
                      {/* "Added" until every required field is filled, then "Completed" */}
                      <span
                        className={cn(
                          'block truncate text-[10.5px] font-medium',
                          complete && !invalid ? 'text-emerald-600' : 'text-blue-600'
                        )}
                      >
                        {complete && !invalid ? 'Completed' : 'Added'}
                      </span>
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => ctx.removeType(id)}
                    aria-label={`Remove ${type.label}`}
                    title={`Remove ${type.label}`}
                    className="grid h-6 w-6 shrink-0 cursor-pointer place-items-center rounded-md text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </nav>

        <section className="flex min-w-0 flex-1 flex-col">
          {activeType && ctx.activeId ? (
            <>
              <FormTitle type={activeType} />
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

/** Repeats the selected card's icon so the form reads as that type */
function FormTitle({ type }: { type: ReturnType<typeof getCustomerType> }) {
  const Icon = type.icon;
  return (
    <h4 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
      <span aria-hidden className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-blue-50 text-blue-600">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <span className="truncate">{type.label}</span>
    </h4>
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
/* Add type card                                                              */
/* -------------------------------------------------------------------------- */

/** A type not added yet: clicking the card adds it; needs a customer first */
function AddTypeCard({ ctx, typeId, disabled }: { ctx: MultiTypeInsert; typeId: CustomerTypeId; disabled: boolean }) {
  const type = getCustomerType(typeId);
  const Icon = type.icon;
  return (
    <button
      id={`customer-type-option-${typeId}`}
      type="button"
      disabled={disabled}
      onClick={() => ctx.addType(typeId)}
      title={disabled ? 'Choose a customer first' : `Add ${type.label}`}
      className="group flex w-full cursor-pointer items-center gap-2.5 rounded-xl py-2 pl-2.5 pr-1.5 text-left transition hover:bg-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
    >
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white text-slate-500 ring-1 ring-inset ring-slate-200 transition group-enabled:group-hover:text-blue-600 group-enabled:group-hover:ring-blue-200">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1 truncate text-xs font-semibold text-slate-700">{type.label}</span>
    </button>
  );
}
