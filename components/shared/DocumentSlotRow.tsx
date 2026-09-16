'use client';

import React from 'react';
import { Download, Eye, FileText, RefreshCw, Trash2, UploadCloud, type LucideIcon } from 'lucide-react';
import { SupportingDocument } from '@/types';
import { cn } from '@/lib/utils';

/** One icon action on an attached document row. */
function DocRowAction({
  label,
  icon: Icon,
  onClick,
  href,
  download,
  danger,
}: {
  label: string;
  icon: LucideIcon;
  onClick?: () => void;
  href?: string;
  download?: string;
  danger?: boolean;
}) {
  const className = cn(
    'grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-slate-400 transition',
    danger ? 'hover:bg-rose-50 hover:text-rose-600' : 'hover:bg-slate-100 hover:text-slate-900'
  );

  // View and download open the local file, so they are links rather than buttons
  if (href) {
    return (
      <a
        href={href}
        download={download}
        target={download ? undefined : '_blank'}
        rel="noopener noreferrer"
        aria-label={label}
        title={label}
        className={className}
      >
        <Icon className="w-4 h-4" />
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} aria-label={label} title={label} className={className}>
      <Icon className="w-4 h-4" />
    </button>
  );
}

/**
 * One supporting document slot as a row: a dashed upload row until a file is
 * attached, then a white row with the file name, size and actions. Both states
 * take a dropped file.
 */
export function DocumentSlotRow({
  label,
  doc,
  isDragging = false,
  onDragStateChange,
  onBrowse,
  onDropFiles,
  onRemove,
}: {
  label: string;
  doc?: SupportingDocument;
  isDragging?: boolean;
  onDragStateChange?: (isDragging: boolean) => void;
  onBrowse?: () => void;
  onDropFiles?: (files: FileList) => void;
  onRemove: () => void;
}) {
  const dropHandlers = {
    onDragOver: (e: React.DragEvent) => {
      if (!onDropFiles) return;
      e.preventDefault();
      onDragStateChange?.(true);
    },
    onDragLeave: (e: React.DragEvent) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node)) onDragStateChange?.(false);
    },
    onDrop: (e: React.DragEvent) => {
      if (!onDropFiles) return;
      e.preventDefault();
      onDragStateChange?.(false);
      if (e.dataTransfer.files) onDropFiles(e.dataTransfer.files);
    },
  };

  if (!doc) {
    return (
      <div
        {...dropHandlers}
        onClick={onBrowse}
        className={cn(
          'group flex flex-wrap items-center gap-4 rounded-2xl border border-dashed px-4 py-3.5 cursor-pointer transition',
          isDragging
            ? 'border-blue-500 bg-blue-50/70'
            : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/30'
        )}
      >
        <span
          className={cn(
            'grid w-9 shrink-0 place-items-center transition',
            isDragging ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-600'
          )}
        >
          <FileText className="w-6 h-6" strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold text-slate-900">{label}</p>
          <p className="mt-0.5 text-[11px] text-slate-500">
            {isDragging ? 'Release to upload' : 'PDF, JPG, PNG · Max 10MB'}
          </p>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onBrowse?.();
          }}
          className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-linear-to-r from-blue-600 to-sky-500 px-4 text-[12px] font-bold text-white shadow-lg shadow-blue-600/25 transition hover:brightness-110 active:scale-[0.98]"
        >
          <UploadCloud className="w-4 h-4" />
          Upload
        </button>
      </div>
    );
  }

  return (
    <div
      {...dropHandlers}
      className={cn(
        'flex flex-wrap items-center gap-4 rounded-2xl bg-white px-4 py-3.5 transition',
        isDragging ? 'ring-2 ring-blue-500' : 'ring-1 ring-slate-200/80'
      )}
    >
      <span className="grid w-9 shrink-0 place-items-center text-blue-600">
        <FileText className="w-6 h-6" strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-semibold text-slate-900">{label}</p>
        <div className="mt-0.5 flex min-w-0 items-center gap-x-2 text-[12px] text-slate-500">
          <span className="truncate" title={doc.fileName}>
            {doc.fileName}
          </span>
          {doc.fileSize && (
            <>
              <span className="h-1 w-1 shrink-0 rounded-full bg-slate-300" />
              <span className="shrink-0">{doc.fileSize}</span>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-0.5 rounded-xl bg-slate-50 p-0.5 ring-1 ring-slate-100">
        {doc.fileUrl && (
          <>
            <DocRowAction label="View" icon={Eye} href={doc.fileUrl} />
            <DocRowAction label="Download" icon={Download} href={doc.fileUrl} download={doc.fileName} />
          </>
        )}
        {onBrowse && <DocRowAction label="Replace" icon={RefreshCw} onClick={onBrowse} />}
        <DocRowAction label="Remove" icon={Trash2} danger onClick={onRemove} />
      </div>
    </div>
  );
}
