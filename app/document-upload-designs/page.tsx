'use client';

import React, { useState } from 'react';
import {
  Check,
  Download,
  Eye,
  FileCheck,
  FileText,
  FolderOpen,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  UploadCloud,
  X,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type SlotId = 'specimen' | 'id' | 'other';
type Filled = Record<SlotId, boolean>;

type Slot = {
  id: SlotId;
  label: string;
  hint: string;
  icon: LucideIcon;
  required: boolean;
  file: { name: string; ext: string; size: string; pages: number };
};

const SLOTS: Slot[] = [
  {
    id: 'specimen',
    label: 'Account Specimen',
    hint: 'Signed specimen signature card',
    icon: FileCheck,
    required: true,
    file: { name: 'Account_Specimen_Signed.pdf', ext: 'PDF', size: '412 KB', pages: 1 },
  },
  {
    id: 'id',
    label: 'ID / Passport',
    hint: 'Front side, all four corners visible',
    icon: ShieldCheck,
    required: true,
    file: { name: 'Identification_Card_Copy.pdf', ext: 'PDF', size: '1.2 MB', pages: 2 },
  },
  {
    id: 'other',
    label: 'Other Supporting Docs',
    hint: 'Proof of address, bank letters',
    icon: FileText,
    required: false,
    file: { name: 'Proof_of_Address.pdf', ext: 'PDF', size: '860 KB', pages: 3 },
  },
];

const UPLOADED_ON = 'Sep 15, 2026';
const FORMATS = 'PDF, JPG, PNG · Max 10MB';

type VersionProps = {
  filled: Filled;
  onUpload: (id: SlotId) => void;
  onRemove: (id: SlotId) => void;
};

/* ------------------------------------------------------------------ */
/* Shared pieces                                                       */
/* ------------------------------------------------------------------ */

/** A stand-in page of a document, used as the preview */
function PaperMock({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md bg-white p-3 shadow-[0_14px_36px_-14px_rgba(15,23,42,0.35)] ring-1 ring-slate-200/70',
        className
      )}
    >
      <div className="flex items-center gap-1.5">
        <div className="h-3 w-3 rounded-sm bg-blue-600" />
        <div className="h-1.5 w-2/5 rounded-full bg-slate-300" />
      </div>
      <div className="mt-3 space-y-1.5">
        {[100, 90, 96, 64].map((w, i) => (
          <div key={i} className="h-1 rounded-full bg-slate-200" style={{ width: `${w}%` }} />
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        <div className="h-7 rounded bg-blue-50 ring-1 ring-blue-100" />
        <div className="h-7 rounded bg-slate-50 ring-1 ring-slate-100" />
      </div>
      <div className="mt-3 space-y-1.5">
        {[86, 94, 58, 80, 70].map((w, i) => (
          <div key={i} className="h-1 rounded-full bg-slate-200" style={{ width: `${w}%` }} />
        ))}
      </div>
    </div>
  );
}

/** A stand-in identity card, used as the ID / Passport preview */
function IdCardMock({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative aspect-[1.586] overflow-hidden rounded-xl bg-linear-to-br from-blue-700 via-blue-600 to-sky-400 p-3 text-white shadow-[0_18px_40px_-16px_rgba(37,99,235,0.65)]',
        className
      )}
    >
      <div className="absolute -right-10 -top-12 h-32 w-32 rounded-full bg-white/10" />
      <div className="absolute -bottom-16 -left-6 h-32 w-32 rounded-full bg-white/5" />
      <div className="relative flex items-center justify-between">
        <span className="text-[7px] font-bold uppercase tracking-[0.2em] text-white/80">National ID</span>
        <div className="h-3 w-4 rounded-[3px] bg-amber-200/90" />
      </div>
      <div className="relative mt-2.5 flex gap-2.5">
        <div className="grid h-12 w-10 place-items-center rounded-md bg-white/20 ring-1 ring-white/30">
          <div className="h-4 w-4 rounded-full bg-white/70" />
        </div>
        <div className="flex-1 space-y-1.5 pt-1">
          <div className="h-1.5 w-3/4 rounded-full bg-white/85" />
          <div className="h-1 w-1/2 rounded-full bg-white/50" />
          <div className="h-1 w-2/3 rounded-full bg-white/50" />
          <div className="h-1 w-1/3 rounded-full bg-white/50" />
        </div>
      </div>
      <div className="absolute inset-x-3 bottom-2.5 space-y-1">
        <div className="h-[3px] rounded-full bg-white/35" />
        <div className="h-[3px] w-4/5 rounded-full bg-white/35" />
      </div>
    </div>
  );
}

/** Small landscape preview of the uploaded file, used in the row thumbnail */
function Thumb({ slot, small }: { slot: Slot; small?: boolean }) {
  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden bg-linear-to-b from-slate-100 to-slate-50 ring-1 ring-slate-200/70',
        small ? 'h-14 w-[76px] rounded-lg' : 'h-20 w-28 rounded-xl'
      )}
    >
      {slot.id === 'id' ? (
        <div className={cn('absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2', small ? 'scale-[0.36]' : 'scale-50')}>
          <IdCardMock className="w-48" />
        </div>
      ) : (
        <div className={cn('absolute left-1/2 origin-top -translate-x-1/2', small ? 'top-1.5 scale-[0.36]' : 'top-2.5 scale-50')}>
          <PaperMock className="h-48 w-36" />
        </div>
      )}
    </div>
  );
}

function IconButton({
  label,
  icon: Icon,
  onClick,
  danger,
  round,
}: {
  label: string;
  icon: LucideIcon;
  onClick?: () => void;
  danger?: boolean;
  round?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        'grid cursor-pointer place-items-center text-slate-400 transition',
        round ? 'h-9 w-9 rounded-full bg-slate-50 ring-1 ring-slate-200/80' : 'h-8 w-8 rounded-lg',
        danger ? 'hover:bg-rose-50 hover:text-rose-600' : 'hover:bg-slate-100 hover:text-slate-900'
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Version 1 — Preview Rows                                            */
/* ------------------------------------------------------------------ */

function VersionPreview({ filled, onUpload, onRemove }: VersionProps) {
  return (
    <div className="space-y-3">
      {SLOTS.map((slot) => {
        const Icon = slot.icon;

        if (!filled[slot.id]) {
          return (
            <button
              key={slot.id}
              type="button"
              onClick={() => onUpload(slot.id)}
              className="group flex w-full cursor-pointer flex-wrap items-center gap-4 rounded-2xl border border-dashed border-blue-200 bg-linear-to-r from-blue-50/80 via-white to-white p-3 pr-4 text-left transition hover:border-blue-400 hover:shadow-[0_14px_36px_-26px_rgba(37,99,235,0.6)]"
            >
              <span className="grid h-20 w-28 shrink-0 place-items-center rounded-xl bg-white shadow-[0_8px_20px_-12px_rgba(37,99,235,0.45)] ring-1 ring-blue-100">
                <Icon className="h-6 w-6 text-blue-600 transition group-hover:-translate-y-0.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-bold text-slate-900">{slot.label}</span>
                <span className="mt-0.5 block text-[11.5px] text-slate-500">
                  Drag & drop or <span className="font-semibold text-blue-600">browse</span> · {slot.hint}
                </span>
                <span className="mt-2 inline-block rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-400 ring-1 ring-slate-200/80">
                  {FORMATS}
                </span>
              </span>
              <span className="inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-4 text-[12px] font-bold text-blue-600 shadow-sm ring-1 ring-blue-100 transition group-hover:bg-blue-600 group-hover:text-white group-hover:ring-blue-600">
                <UploadCloud className="h-4 w-4" />
                Browse
              </span>
            </button>
          );
        }

        return (
          <div
            key={slot.id}
            className="flex flex-wrap items-center gap-4 rounded-2xl bg-white p-3 pr-4 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_14px_36px_-26px_rgba(15,23,42,0.4)] ring-1 ring-slate-200/80"
          >
            <button type="button" aria-label={`View ${slot.label}`} className="group/thumb relative cursor-pointer rounded-xl">
              <Thumb slot={slot} />
              <span className="absolute inset-0 grid place-items-center rounded-xl bg-slate-900/35 text-white opacity-0 backdrop-blur-[2px] transition group-hover/thumb:opacity-100">
                <Eye className="h-5 w-5" />
              </span>
            </button>
            <div className="min-w-0 flex-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600">
                <Check className="h-3 w-3" strokeWidth={3} />
                {slot.label}
              </span>
              <p className="mt-1.5 truncate text-[13px] font-bold text-slate-900" title={slot.file.name}>
                {slot.file.name}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500">
                {slot.file.size} · {slot.file.pages} {slot.file.pages === 1 ? 'page' : 'pages'} · {UPLOADED_ON}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onUpload(slot.id)}
                className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-blue-600 px-4 text-[12px] font-bold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.98]"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Replace
              </button>
              <button
                type="button"
                onClick={() => onRemove(slot.id)}
                aria-label={`Remove ${slot.label}`}
                title="Remove"
                className="grid h-9 w-9 cursor-pointer place-items-center rounded-full text-slate-400 ring-1 ring-slate-200 transition hover:bg-rose-50 hover:text-rose-600 hover:ring-rose-100"
              >
                <X className="h-4 w-4" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Version 2 — List Rows                                               */
/* ------------------------------------------------------------------ */

function VersionRows({ filled, onUpload, onRemove }: VersionProps) {
  const count = SLOTS.filter((slot) => filled[slot.id]).length;

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex flex-1 gap-1.5">
          {SLOTS.map((slot) => (
            <span
              key={slot.id}
              className={cn('h-1.5 flex-1 rounded-full transition', filled[slot.id] ? 'bg-blue-600' : 'bg-slate-200')}
            />
          ))}
        </div>
        <span className="text-[11px] font-semibold text-slate-500">
          {Math.round((count / SLOTS.length) * 100)}% complete
        </span>
      </div>

      <div className="space-y-2.5">
        {SLOTS.map((slot) => {
          if (!filled[slot.id]) {
            return (
              <div
                key={slot.id}
                className="group flex flex-wrap items-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-3.5 transition hover:border-blue-300 hover:bg-blue-50/30"
              >
                <span className="grid w-9 shrink-0 place-items-center text-slate-400 transition group-hover:text-blue-600">
                  <FileText className="h-6 w-6" strokeWidth={1.75} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold text-slate-900">{slot.label}</p>
                  <p className="mt-0.5 text-[11px] text-slate-500">{FORMATS}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onUpload(slot.id)}
                  className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-linear-to-r from-blue-600 to-sky-500 px-4 text-[12px] font-bold text-white shadow-lg shadow-blue-600/25 transition hover:brightness-110 active:scale-[0.98]"
                >
                  <UploadCloud className="h-4 w-4" />
                  Upload
                </button>
              </div>
            );
          }

          return (
            <div
              key={slot.id}
              className="flex flex-wrap items-center gap-4 rounded-2xl bg-white px-4 py-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_28px_-22px_rgba(15,23,42,0.4)] ring-1 ring-slate-200/80"
            >
              <span className="grid w-9 shrink-0 place-items-center text-blue-600">
                <FileText className="h-6 w-6" strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold text-slate-900">{slot.label}</p>
                <div className="mt-0.5 flex min-w-0 items-center gap-x-2 text-[12px] text-slate-500">
                  <span className="truncate" title={slot.file.name}>
                    {slot.file.name}
                  </span>
                  <span className="h-1 w-1 shrink-0 rounded-full bg-slate-300" />
                  <span className="shrink-0">{slot.file.size}</span>
                </div>
              </div>
              <div className="flex items-center gap-0.5 rounded-xl bg-slate-50 p-0.5 ring-1 ring-slate-100">
                <IconButton label="View" icon={Eye} />
                <IconButton label="Download" icon={Download} />
                <IconButton label="Replace" icon={RefreshCw} onClick={() => onUpload(slot.id)} />
                <IconButton label="Remove" icon={Trash2} danger onClick={() => onRemove(slot.id)} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Version 3 — Form Field                                              */
/* ------------------------------------------------------------------ */

type RowProps = {
  slot: Slot;
  isFilled: boolean;
  onUpload: () => void;
  onRemove: () => void;
};

/** Drag-over highlight for a drop target; on this demo page any dropped file fills the slot */
function useDropTarget(onDrop: () => void) {
  const [isOver, setIsOver] = useState(false);

  return {
    isOver,
    dropProps: {
      onDragOver: (e: React.DragEvent) => {
        e.preventDefault();
        setIsOver(true);
      },
      onDragLeave: (e: React.DragEvent) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsOver(false);
      },
      onDrop: (e: React.DragEvent) => {
        e.preventDefault();
        setIsOver(false);
        onDrop();
      },
    },
  };
}

function FormFieldRow({ slot, isFilled, onUpload, onRemove }: RowProps) {
  const { isOver, dropProps } = useDropTarget(onUpload);

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <p className="text-[12px] font-semibold text-slate-700">
          {slot.label}
          {slot.required && <span className="ml-0.5 text-blue-600">*</span>}
        </p>
        {!slot.required && <span className="text-[11px] text-slate-400">Optional</span>}
      </div>

      {isFilled ? (
        <div
          {...dropProps}
          className={cn(
            'flex h-12 items-center gap-3 rounded-xl border bg-white px-1.5 transition',
            isOver ? 'border-blue-500 ring-4 ring-blue-500/10' : 'border-slate-200'
          )}
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-blue-50 text-[9px] font-bold text-blue-600">
            {slot.file.ext}
          </span>
          <p className="min-w-0 flex-1 truncate text-[12.5px] font-semibold text-slate-900" title={slot.file.name}>
            {isOver ? 'Release to replace' : slot.file.name}
          </p>
          <span className="hidden shrink-0 text-[11px] text-slate-400 sm:block">{slot.file.size}</span>
          <button
            type="button"
            className="hidden h-9 cursor-pointer items-center rounded-lg px-3 text-[12px] font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 sm:inline-flex"
          >
            View
          </button>
          <button
            type="button"
            onClick={onUpload}
            className="inline-flex h-9 cursor-pointer items-center rounded-lg px-3 text-[12px] font-semibold text-blue-600 transition hover:bg-blue-50"
          >
            Change
          </button>
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${slot.label}`}
            title="Remove"
            className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
          >
            <X className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onUpload}
          {...dropProps}
          className={cn(
            'flex h-12 w-full cursor-pointer items-center gap-3 rounded-xl border border-dashed pl-3.5 pr-1.5 text-left transition',
            isOver ? 'border-blue-500 bg-blue-50/70 ring-4 ring-blue-500/10' : 'border-slate-300 bg-white hover:border-blue-400'
          )}
        >
          <UploadCloud className={cn('h-4 w-4 shrink-0', isOver ? 'text-blue-600' : 'text-slate-400')} />
          <span className={cn('min-w-0 flex-1 truncate text-[12.5px]', isOver ? 'font-semibold text-blue-600' : 'text-slate-400')}>
            {isOver ? 'Release to upload' : 'Drag a file here or browse'}
          </span>
          <span className="inline-flex h-9 shrink-0 items-center rounded-lg bg-blue-600 px-4 text-[12px] font-bold text-white shadow-sm shadow-blue-600/20">
            Browse
          </span>
        </button>
      )}

      <p className={cn('mt-1.5 flex items-center gap-1 text-[11px]', isFilled ? 'font-medium text-blue-600' : 'text-slate-400')}>
        {isFilled ? (
          <>
            <Check className="h-3 w-3" strokeWidth={3} />
            Uploaded {UPLOADED_ON}
          </>
        ) : (
          `${slot.hint} · ${FORMATS}`
        )}
      </p>
    </div>
  );
}

function VersionFormField({ filled, onUpload, onRemove }: VersionProps) {
  return (
    <div className="space-y-5">
      {SLOTS.map((slot) => (
        <FormFieldRow
          key={slot.id}
          slot={slot}
          isFilled={filled[slot.id]}
          onUpload={() => onUpload(slot.id)}
          onRemove={() => onRemove(slot.id)}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Version 4 — Grouped Rows                                            */
/* ------------------------------------------------------------------ */

function VersionGrouped({ filled, onUpload, onRemove }: VersionProps) {
  const count = SLOTS.filter((slot) => filled[slot.id]).length;

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_14px_36px_-28px_rgba(15,23,42,0.4)] ring-1 ring-slate-200/80">
      <div className="divide-y divide-slate-100">
        {SLOTS.map((slot) => {
          const Icon = slot.icon;
          const isFilled = filled[slot.id];

          return (
            <div key={slot.id} className="flex flex-wrap items-center gap-4 px-4 py-4 transition hover:bg-slate-50/60 sm:px-5">
              <span
                className={cn(
                  'grid h-11 w-11 shrink-0 place-items-center rounded-[14px] transition',
                  isFilled ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25' : 'bg-slate-50 text-slate-400 ring-1 ring-slate-200'
                )}
              >
                <Icon className="h-5 w-5" />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-[13px] font-bold text-slate-900">{slot.label}</p>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 text-[10.5px] font-semibold',
                      isFilled ? 'text-blue-600' : 'text-slate-400'
                    )}
                  >
                    <span className={cn('h-1.5 w-1.5 rounded-full', isFilled ? 'bg-blue-600' : 'bg-slate-300')} />
                    {isFilled ? 'Uploaded' : 'Pending'}
                  </span>
                </div>
                {isFilled ? (
                  <p className="mt-0.5 flex min-w-0 items-center gap-1.5 text-[11.5px] text-slate-500">
                    <FileText className="h-3.5 w-3.5 shrink-0 text-blue-600" />
                    <span className="truncate font-medium text-slate-700" title={slot.file.name}>
                      {slot.file.name}
                    </span>
                    <span className="shrink-0">· {slot.file.size}</span>
                  </p>
                ) : (
                  <p className="mt-0.5 truncate text-[11.5px] text-slate-500">
                    {slot.hint} · {FORMATS}
                  </p>
                )}
              </div>

              {isFilled ? (
                <div className="flex items-center gap-0.5 rounded-full bg-slate-100/80 p-1">
                  <button
                    type="button"
                    className="inline-flex h-7 cursor-pointer items-center gap-1 rounded-full px-3 text-[11px] font-bold text-slate-700 transition hover:bg-white hover:shadow-2xs"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpload(slot.id)}
                    aria-label="Replace"
                    title="Replace"
                    className="grid h-7 w-7 cursor-pointer place-items-center rounded-full text-slate-500 transition hover:bg-white hover:text-slate-900 hover:shadow-2xs"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemove(slot.id)}
                    aria-label="Remove"
                    title="Remove"
                    className="grid h-7 w-7 cursor-pointer place-items-center rounded-full text-slate-500 transition hover:bg-white hover:text-rose-600 hover:shadow-2xs"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onUpload(slot.id)}
                  className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-blue-50 px-4 text-[12px] font-bold text-blue-600 transition hover:bg-blue-100"
                >
                  <Plus className="h-4 w-4" strokeWidth={2.5} />
                  Add file
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2 border-t border-slate-100 bg-slate-50/70 px-4 py-2.5 text-[11px] text-slate-500 sm:px-5">
        <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-blue-600" />
        Files are encrypted and only visible to reviewers
        <span className="ml-auto font-semibold tabular-nums text-slate-700">
          {count}/{SLOTS.length}
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Version 5 — Label + Dropzone                                        */
/* ------------------------------------------------------------------ */

function DropzoneRow({ slot, isFilled, onUpload, onRemove }: RowProps) {
  const { isOver, dropProps } = useDropTarget(onUpload);

  return (
    <div className="grid gap-3 py-5 first:pt-0 last:pb-0 sm:grid-cols-[190px_minmax(0,1fr)] sm:gap-6">
      <div className="sm:pt-1">
        <p className="text-[13px] font-bold text-slate-900">{slot.label}</p>
        <p className="mt-0.5 text-[11.5px] text-slate-500">{slot.hint}</p>
        <span
          className={cn(
            'mt-2 inline-block rounded-md px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide',
            slot.required ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'
          )}
        >
          {slot.required ? 'Required' : 'Optional'}
        </span>
      </div>

      {isFilled ? (
        <div
          {...dropProps}
          className={cn(
            'flex min-w-0 items-center gap-3 rounded-2xl bg-white p-2.5 pr-2 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_28px_-22px_rgba(15,23,42,0.4)] transition',
            isOver ? 'ring-2 ring-blue-500' : 'ring-1 ring-slate-200/80'
          )}
        >
          <Thumb slot={slot} small />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12.5px] font-bold text-slate-900" title={slot.file.name}>
              {slot.file.name}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-500">
              {slot.file.size} · {slot.file.pages} {slot.file.pages === 1 ? 'page' : 'pages'}
            </p>
            <p className="mt-1 flex items-center gap-1 text-[10.5px] font-semibold text-blue-600">
              <Check className="h-3 w-3" strokeWidth={3} />
              {isOver ? 'Release to replace' : `Uploaded ${UPLOADED_ON}`}
            </p>
          </div>
          <div className="flex shrink-0 items-center">
            <IconButton label="View" icon={Eye} />
            <IconButton label="Download" icon={Download} />
            <IconButton label="Replace" icon={RefreshCw} onClick={onUpload} />
            <IconButton label="Remove" icon={Trash2} danger onClick={onRemove} />
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={onUpload}
          {...dropProps}
          className={cn(
            'group flex w-full cursor-pointer items-center gap-3.5 rounded-2xl border-2 border-dashed px-4 py-3.5 text-left transition',
            isOver ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-slate-50/60 hover:border-blue-300 hover:bg-blue-50/40'
          )}
        >
          <span
            className={cn(
              'grid h-11 w-11 shrink-0 place-items-center rounded-full shadow-2xs ring-1 transition',
              isOver ? 'bg-blue-600 text-white ring-blue-600' : 'bg-white text-blue-600 ring-slate-200 group-hover:ring-blue-200'
            )}
          >
            <UploadCloud className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[12.5px] text-slate-600">
              {isOver ? (
                <span className="font-bold text-blue-600">Release to upload</span>
              ) : (
                <>
                  <span className="font-bold text-blue-600">Click to upload</span> or drag and drop
                </>
              )}
            </span>
            <span className="mt-0.5 block text-[11px] text-slate-400">{FORMATS}</span>
          </span>
        </button>
      )}
    </div>
  );
}

function VersionDropzone({ filled, onUpload, onRemove }: VersionProps) {
  return (
    <div className="divide-y divide-slate-100">
      {SLOTS.map((slot) => (
        <DropzoneRow
          key={slot.id}
          slot={slot}
          isFilled={filled[slot.id]}
          onUpload={() => onUpload(slot.id)}
          onRemove={() => onRemove(slot.id)}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Version 6 — Pill Rows                                               */
/* ------------------------------------------------------------------ */

/** Progress ring that closes when the slot has a file */
function Ring({ done, icon: Icon }: { done: boolean; icon: LucideIcon }) {
  const r = 17;
  const c = 2 * Math.PI * r;

  return (
    <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white">
      <svg viewBox="0 0 40 40" className="absolute inset-0 h-full w-full -rotate-90">
        <circle cx="20" cy="20" r={r} fill="none" strokeWidth="3" className="stroke-slate-200" />
        <circle
          cx="20"
          cy="20"
          r={r}
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={done ? 0 : c}
          className={cn('stroke-blue-600 transition-all duration-500', done ? 'opacity-100' : 'opacity-0')}
        />
      </svg>
      {done ? (
        <Check className="h-4 w-4 text-blue-600" strokeWidth={3} />
      ) : (
        <Icon className="h-4 w-4 text-slate-400" />
      )}
    </span>
  );
}

function VersionPill({ filled, onUpload, onRemove }: VersionProps) {
  return (
    <div className="space-y-2.5">
      {SLOTS.map((slot) => {
        const isFilled = filled[slot.id];

        return (
          <div
            key={slot.id}
            className={cn(
              'flex flex-wrap items-center gap-3 rounded-[26px] p-2 pr-2.5 transition sm:flex-nowrap sm:rounded-full',
              isFilled
                ? 'bg-white shadow-[0_12px_30px_-22px_rgba(37,99,235,0.6)] ring-1 ring-blue-100'
                : 'bg-slate-50 ring-1 ring-slate-200/70 hover:bg-white hover:ring-blue-200'
            )}
          >
            <Ring done={isFilled} icon={slot.icon} />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold text-slate-900">{slot.label}</p>
              <p className="truncate text-[11px] text-slate-500">
                {isFilled ? `Uploaded ${UPLOADED_ON}` : `${slot.required ? 'Required' : 'Optional'} · ${FORMATS}`}
              </p>
            </div>

            {isFilled ? (
              <>
                <span className="hidden min-w-0 max-w-[240px] items-center gap-1.5 rounded-full bg-blue-50 py-1 pl-1 pr-3 text-[11px] font-semibold text-blue-700 md:inline-flex">
                  <span className="shrink-0 rounded-full bg-blue-600 px-1.5 text-[9px] font-bold leading-4 text-white">
                    {slot.file.ext}
                  </span>
                  <span className="truncate" title={slot.file.name}>
                    {slot.file.name}
                  </span>
                  <span className="shrink-0 text-blue-400">{slot.file.size}</span>
                </span>
                <div className="flex items-center gap-1">
                  <IconButton label="View" icon={Eye} round />
                  <IconButton label="Replace" icon={RefreshCw} round onClick={() => onUpload(slot.id)} />
                  <IconButton label="Remove" icon={Trash2} round danger onClick={() => onRemove(slot.id)} />
                </div>
              </>
            ) : (
              <button
                type="button"
                onClick={() => onUpload(slot.id)}
                className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full bg-linear-to-r from-blue-600 to-sky-500 pl-4 pr-1.5 text-[12px] font-bold text-white shadow-lg shadow-blue-600/25 transition hover:brightness-110 active:scale-[0.98]"
              >
                Upload
                <span className="grid h-7 w-7 place-items-center rounded-full bg-white/20">
                  <UploadCloud className="h-3.5 w-3.5" />
                </span>
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

type VersionId = 'preview' | 'rows' | 'field' | 'grouped' | 'dropzone' | 'pill';

const VERSIONS: { id: VersionId; name: string; hint: string; component: React.ComponentType<VersionProps> }[] = [
  { id: 'preview', name: '1 · Preview Rows', hint: 'Rows with a live thumbnail of each document and a soft blue empty state', component: VersionPreview },
  { id: 'rows', name: '2 · List Rows', hint: 'Stacked rows with status, metadata and quick actions', component: VersionRows },
  { id: 'field', name: '3 · Form Field', hint: 'Input-style attachment field with label, helper text, Change and Remove', component: VersionFormField },
  { id: 'grouped', name: '4 · Grouped Rows', hint: 'One settings-style card with dividers and pill actions', component: VersionGrouped },
  { id: 'dropzone', name: '5 · Label + Dropzone', hint: 'Label on the left; a click-or-drop zone that becomes a thumbnail file card', component: VersionDropzone },
  { id: 'pill', name: '6 · Pill Rows', hint: 'Fully rounded rows with a progress ring and a file chip', component: VersionPill },
];

const ALL_EMPTY: Filled = { specimen: false, id: false, other: false };
const ALL_FILLED: Filled = { specimen: true, id: true, other: true };

/** Scratch page: five row-based takes on the supporting-documents dialog, each in upload and display state. */
export default function DocumentUploadDesignsPage() {
  const [versionId, setVersionId] = useState<VersionId>('preview');
  const [filled, setFilled] = useState<Filled>(ALL_EMPTY);

  const version = VERSIONS.find((item) => item.id === versionId) ?? VERSIONS[0];
  const Version = version.component;
  const count = SLOTS.filter((slot) => filled[slot.id]).length;
  const mode = count === SLOTS.length ? 'display' : count === 0 ? 'upload' : null;

  const modes = [
    { id: 'upload', label: 'File upload', icon: UploadCloud, onClick: () => setFilled(ALL_EMPTY) },
    { id: 'display', label: 'File display', icon: FileCheck, onClick: () => setFilled(ALL_FILLED) },
  ] as const;

  return (
    <main className="min-h-screen bg-[#eef2f7] px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-[15px] font-black tracking-tight text-slate-900">Supporting documents · dialog designs</h1>
        <p className="mt-1.5 text-[11.5px] text-slate-500">
          Pick a version, then toggle between the upload and display state. Upload or remove single slots to see a mixed state, or drag any file onto versions 3 and 5.
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex flex-wrap gap-1 rounded-2xl bg-white p-1 shadow-sm ring-1 ring-slate-200">
            {VERSIONS.map((item) => {
              const isOn = item.id === versionId;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={isOn}
                  onClick={() => setVersionId(item.id)}
                  className={cn(
                    'cursor-pointer rounded-xl px-4 py-2 text-[12px] font-bold transition',
                    isOn ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-slate-500 hover:text-slate-900'
                  )}
                >
                  {item.name}
                </button>
              );
            })}
          </div>

          <div className="inline-flex items-center gap-1 rounded-full bg-white p-1 shadow-sm ring-1 ring-slate-200">
            {modes.map((item) => {
              const Icon = item.icon;
              const isOn = item.id === mode;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={isOn}
                  onClick={item.onClick}
                  className={cn(
                    'inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full px-4 text-[12px] font-bold transition',
                    isOn ? 'bg-slate-900 text-white shadow-md shadow-slate-900/15' : 'text-slate-500 hover:text-slate-900'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
        <p className="mt-2.5 text-[11.5px] text-slate-500">{version.hint}</p>

        {/* The dialog */}
        <div className="mt-5 overflow-hidden rounded-[24px] bg-white shadow-[0_24px_60px_-32px_rgba(15,23,42,0.35)] ring-1 ring-slate-200/70">
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
              <FolderOpen className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-[14px] font-bold text-slate-900">Supporting Documents</h2>
              <p className="text-[11.5px] text-slate-500">Attach the files required to open this account</p>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold tabular-nums text-slate-600">
              {count} of {SLOTS.length} uploaded
            </span>
          </div>

          <div className="p-5 sm:p-6">
            <Version
              filled={filled}
              onUpload={(id) => setFilled((prev) => ({ ...prev, [id]: true }))}
              onRemove={(id) => setFilled((prev) => ({ ...prev, [id]: false }))}
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-3.5 sm:px-6">
            <button
              type="button"
              className="inline-flex h-10 cursor-pointer items-center rounded-full border border-slate-200 bg-white px-5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full bg-blue-600 px-6 text-xs font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 active:scale-[0.98]"
            >
              <Check className="h-4 w-4" strokeWidth={2.5} />
              Save Documents
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
