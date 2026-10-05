'use client';

import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Download,
  FileSpreadsheet,
  Info,
  Loader2,
  Pencil,
  RotateCcw,
  Search,
  ShieldAlert,
  Upload,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import type { Individual, SupportingDocument } from '@/types';
import { IndividualFormFields, type IndividualFormValues } from '@/components/individual/form/IndividualFormFields';
import { cn } from '@/lib/utils';
import { buildXlsx, downloadBlob, readSpreadsheet, type SheetRows } from '@/lib/spreadsheet';
import { buildIndividualRecord } from '@/components/individual/form/buildIndividual';
import {
  BULK_COLUMNS,
  BULK_SECTIONS,
  COLUMN_BY_KEY,
  describeColumn,
  matchOption,
  MAX_FILE_MB,
  MAX_ROWS,
  buildValidationContext,
  mapRows,
  rowToFormValues,
  formValuesToRow,
  SECTION_STEP,
  sampleRows,
  SAMPLE_FILE,
  validateRows,
  type BulkColumnKey,
  type BulkRow,
  type RowIssue,
  type BulkSection,
  type RowData,
  type RowStatus,
} from '@/components/individual/bulk/bulkImport';

type Stage = 'upload' | 'review' | 'complete';
type Filter = 'all' | RowStatus | 'excluded';

type UploadedFile = { name: string; size: number };
type RunResult = { registered: Individual[]; skipped: BulkRow[]; fileName: string };

const CARD = 'rounded-[22px] bg-white ring-1 ring-slate-900/[0.06] shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-16px_rgba(15,23,42,0.14)]';

const STAGES: { key: Stage; label: string; hint: string }[] = [
  { key: 'upload', label: 'Upload file', hint: 'Excel or CSV' },
  { key: 'review', label: 'Review & fix', hint: 'Validate every row' },
  { key: 'complete', label: 'Register', hint: 'Create customers' },
];

/** Fields the insert form shows an error message under. */
const INLINE_ERROR_FIELDS: BulkColumnKey[] = ['surnameEN', 'givenNameEN', 'email', 'idNumber'];

const STATUS_META: Record<RowStatus, { label: string; pill: string; dot: string; icon: React.ElementType }> = {
  ready: { label: 'Ready', pill: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15', dot: 'bg-emerald-500', icon: CheckCircle2 },
  warning: { label: 'Warning', pill: 'bg-amber-50 text-amber-700 ring-amber-600/20', dot: 'bg-amber-500', icon: AlertTriangle },
  error: { label: 'Error', pill: 'bg-rose-50 text-rose-700 ring-rose-600/15', dot: 'bg-rose-500', icon: XCircle },
};

const formatSize = (bytes: number) =>
  bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

interface BulkRegistrationScreenProps {
  individuals: Individual[];
  onBack: () => void;
  onRegister: (records: Individual[]) => void;
  onViewDirectory: () => void;
}

export function BulkRegistrationScreen({ individuals, onBack, onRegister, onViewDirectory }: BulkRegistrationScreenProps) {
  const [stage, setStage] = useState<Stage>('upload');
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [rows, setRows] = useState<BulkRow[]>([]);
  const [unknownHeaders, setUnknownHeaders] = useState<string[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [fileError, setFileError] = useState<{ message: string; missingColumns?: string[] } | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<BulkRow | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [result, setResult] = useState<RunResult | null>(null);

  const ctx = useMemo(() => buildValidationContext(individuals), [individuals]);

  // ── Counts ──
  const active = rows.filter((r) => !r.excluded);
  const counts = {
    total: rows.length,
    ready: active.filter((r) => r.status === 'ready').length,
    warning: active.filter((r) => r.status === 'warning').length,
    error: active.filter((r) => r.status === 'error').length,
    excluded: rows.length - active.length,
  };
  const toRegister = active.filter((r) => r.status !== 'error');

  const visibleRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter === 'excluded' ? !r.excluded : filter !== 'all' && (r.excluded || r.status !== filter)) return false;
      if (!q) return true;
      const d = r.data;
      return [d.givenNameEN, d.surnameEN, d.idNumber, d.email, d.mobile, String(r.rowNumber)].some((v) => v.toLowerCase().includes(q));
    });
  }, [rows, filter, query]);

  // ── File handling ──
  const handleFile = async (picked: File) => {
    setFileError(null);
    const lower = picked.name.toLowerCase();
    if (!lower.endsWith('.xlsx') && !lower.endsWith('.csv')) {
      setFileError({ message: `"${picked.name}" is not supported. Upload an .xlsx or .csv file.` });
      return;
    }
    if (picked.size > MAX_FILE_MB * 1024 * 1024) {
      setFileError({ message: `"${picked.name}" is ${formatSize(picked.size)}. The limit is ${MAX_FILE_MB} MB.` });
      return;
    }

    await loadSheet({ name: picked.name, size: picked.size }, () => readSpreadsheet(picked));
  };

  /** Click on the upload area: load the built-in demo workbook through the same pipeline. */
  const handleSample = () => {
    setFileError(null);
    loadSheet(SAMPLE_FILE, () => new Promise((resolve) => setTimeout(() => resolve(sampleRows()), 700)));
  };

  const loadSheet = async (source: UploadedFile, read: () => Promise<SheetRows>) => {
    setIsParsing(true);
    setFile(source);
    try {
      const sheet = await read();
      const parsed = mapRows(sheet);
      if (!parsed.ok) {
        setFileError({ message: parsed.message, missingColumns: parsed.missingColumns });
        setFile(null);
        return;
      }
      setRows(validateRows(parsed.rows, ctx));
      setUnknownHeaders(parsed.unknownHeaders);
      setFilter('all');
      setQuery('');
      setStage('review');
    } catch (e) {
      setFileError({ message: e instanceof Error ? e.message : 'The file could not be read.' });
      setFile(null);
    } finally {
      setIsParsing(false);
    }
  };

  const resetToUpload = () => {
    setStage('upload');
    setFile(null);
    setRows([]);
    setUnknownHeaders([]);
    setFileError(null);
    setResult(null);
    setProgress(null);
  };

  // ── Row edits ──
  const updateRows = (next: BulkRow[]) => setRows(validateRows(next, ctx));
  const toggleExcluded = (rowNumber: number) =>
    updateRows(rows.map((r) => (r.rowNumber === rowNumber ? { ...r, excluded: !r.excluded } : r)));
  const saveRow = (rowNumber: number, update: Pick<BulkRow, 'data' | 'avatarUrl' | 'documents'>) => {
    updateRows(rows.map((r) => (r.rowNumber === rowNumber ? { ...r, ...update } : r)));
    setEditing(null);
  };

  // ── Register ──
  const register = () => {
    setConfirmOpen(false);
    const usedIds = new Set(individuals.map((i) => i.id));
    const usedCids = new Set(individuals.map((i) => i.customerId));
    const unique = (used: Set<string>, make: () => string) => {
      let id = make();
      while (used.has(id)) id = make();
      used.add(id);
      return id;
    };

    const records = toRegister.map((row) => {
      const record = buildIndividualRecord({ ...rowToFormValues(row.data), avatarUrl: row.avatarUrl ?? '' }, row.documents);
      return {
        ...record,
        id: unique(usedIds, () => `IND-${Math.floor(10000 + Math.random() * 90000)}`),
        customerId: unique(usedCids, () => `CID-0${Math.floor(100000 + Math.random() * 900000)}`),
        tags: [...record.tags, 'Bulk Registered'],
      };
    });
    const skipped = rows.filter((r) => r.excluded || r.status === 'error');

    // Simulated batch submission so staff see progress on large files
    setProgress(0);
    const steps = 20;
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setProgress(Math.round((i / steps) * 100));
      if (i >= steps) {
        clearInterval(timer);
        onRegister(records);
        setResult({ registered: records, skipped, fileName: file?.name ?? '' });
        setProgress(null);
        setStage('complete');
      }
    }, 60);
  };

  const downloadIssueReport = (list: BulkRow[], name: string) => {
    const header = ['Row', 'Status', ...BULK_COLUMNS.map((c) => c.header), 'Issues'];
    const body = list.map((r) => [
      String(r.rowNumber),
      r.excluded ? 'Excluded' : STATUS_META[r.status].label,
      ...BULK_COLUMNS.map((c) => r.data[c.key]),
      r.issues.map((i) => `[${i.level}] ${i.message}`).join('; '),
    ]);
    downloadBlob(buildXlsx('Issues', [header, ...body], [6, 10, ...BULK_COLUMNS.map((c) => Math.max(12, c.header.length + 2)), 60]), name);
  };

  const stageIdx = STAGES.findIndex((s) => s.key === stage);

  return (
    <div id="bulk-registration-screen" className="space-y-5 pb-12 animate-in fade-in duration-200">
      {/* ── Header + stepper ── */}
      <div className={CARD}>
        <div className="flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
          <div className="space-y-2">
            <button
              type="button"
              onClick={onBack}
              className="group -mx-2 -my-1 inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1 text-[12.5px] font-semibold text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
              <span>Back to Directory</span>
            </button>
            <div>
              <h1 className="text-[22px] font-semibold tracking-[-0.025em] text-slate-900 sm:text-2xl">Bulk Customer Registration</h1>
              <p className="mt-1 text-[13px] text-slate-500">
                Register many customers at once from an Excel file. Rows are checked before anything is created.
              </p>
            </div>
          </div>

          {/* Loaded file: lives in the header once a file is in review */}
          {stage === 'review' && file && (
            <div className="flex min-w-0 items-center gap-3 rounded-2xl bg-white p-2 pr-2.5 shadow-sm ring-1 ring-slate-200 sm:max-w-md">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-md shadow-emerald-500/25">
                <FileSpreadsheet className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-semibold text-slate-900">{file.name}</p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11.5px] text-slate-500">{formatSize(file.size)} ·</span>
                  <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10.5px] font-semibold text-emerald-700">
                    {counts.total.toLocaleString()} record{counts.total !== 1 && 's'}
                  </span>
                  {unknownHeaders.length > 0 && (
                    <span
                      title={`Ignored: ${unknownHeaders.join(', ')}`}
                      className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[10.5px] font-semibold text-amber-700"
                    >
                      {unknownHeaders.length} unrecognised column{unknownHeaders.length > 1 && 's'} ignored
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={resetToUpload}
                title="Replace file"
                aria-label="Replace file"
                className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-emerald-600"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <ol className="grid grid-cols-3 gap-2 border-t border-slate-100 p-2.5">
          {STAGES.map((s, idx) => {
            const done = idx < stageIdx || stage === 'complete';
            const current = idx === stageIdx && stage !== 'complete';
            return (
              <li
                key={s.key}
                aria-current={current ? 'step' : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors',
                  current ? 'bg-blue-50 ring-1 ring-blue-500/20' : done ? 'bg-slate-50/60' : ''
                )}
              >
                <span
                  className={cn(
                    'grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-semibold tabular-nums',
                    done ? 'bg-blue-500 text-white' : current ? 'bg-blue-500 text-white shadow-[0_0_0_4px_rgba(59,130,246,0.15)]' : 'bg-white text-slate-400 ring-1 ring-slate-200'
                  )}
                >
                  {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : idx + 1}
                </span>
                <span className="hidden min-w-0 sm:block">
                  <span className={cn('block truncate text-[12.5px] font-semibold', current || done ? 'text-slate-900' : 'text-slate-400')}>{s.label}</span>
                  <span className="block truncate text-[11px] text-slate-400">{s.hint}</span>
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      {stage === 'upload' && (
        <UploadStage isParsing={isParsing} file={file} fileError={fileError} onFile={handleFile} onPick={handleSample} />
      )}

      {stage === 'review' && (
        <>
          {/* Table */}
          <div className={cn(CARD, 'overflow-hidden')}>
            <div className="flex flex-col gap-3 border-b border-slate-100 p-3.5 sm:flex-row sm:items-center sm:justify-between">
              <div className="inline-flex max-w-full flex-wrap items-center gap-1 rounded-xl border border-slate-200/60 bg-slate-50 p-1">
                {([
                  ['all', 'All', counts.total],
                  ['ready', 'Ready', counts.ready],
                  ['warning', 'Warnings', counts.warning],
                  ['error', 'Errors', counts.error],
                  ['excluded', 'Excluded', counts.excluded],
                ] as [Filter, string, number][]).map(([key, label, n]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFilter(key)}
                    className={cn(
                      'inline-flex h-[30px] cursor-pointer items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition',
                      filter === key ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-900/5' : 'text-slate-500 hover:text-slate-800'
                    )}
                  >
                    {label}
                    <span className={cn('rounded-md px-1.5 text-[10.5px] tabular-nums', filter === key ? 'bg-blue-50 text-blue-700' : 'bg-slate-200/60 text-slate-500')}>{n}</span>
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <label className="relative block w-full sm:w-64">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search name, ID, email, row…"
                    className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-[13px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
                </label>

                {/* Primary action, in the same spot as Add New on the directory */}
                <button
                  type="button"
                  onClick={() => setConfirmOpen(true)}
                  disabled={toRegister.length === 0}
                  className="inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-xl bg-blue-500 px-3.5 text-xs font-semibold text-white shadow-md shadow-blue-500/30 transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                >
                  Register {toRegister.length.toLocaleString()} customer{toRegister.length !== 1 && 's'}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-left text-[12.5px]">
                <thead className="bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="w-14 px-4 py-2.5">Row</th>
                    <th className="w-28 px-3 py-2.5">Status</th>
                    <th className="px-3 py-2.5">Customer</th>
                    <th className="px-3 py-2.5">Identification</th>
                    <th className="px-3 py-2.5">Contact</th>
                    <th className="px-3 py-2.5">Type</th>
                    <th className="w-[30%] px-3 py-2.5">Issues</th>
                    <th className="w-24 px-4 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleRows.map((row) => (
                    <ReviewRow
                      key={row.rowNumber}
                      row={row}
                      onEdit={() => setEditing(row)}
                      onToggleExcluded={() => toggleExcluded(row.rowNumber)}
                    />
                  ))}
                  {visibleRows.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-14 text-center text-[13px] text-slate-500">
                        No rows match this view.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </>
      )}

      {stage === 'complete' && result && (
        <CompleteStage
          result={result}
          onDownloadSkipped={() => downloadIssueReport(result.skipped, 'bulk-registration-skipped.xlsx')}
          onUploadAnother={resetToUpload}
          onViewDirectory={onViewDirectory}
        />
      )}

      {editing && (
        <EditRowDialog
          row={rows.find((r) => r.rowNumber === editing.rowNumber) ?? editing}
          onClose={() => setEditing(null)}
          onSave={(update) => saveRow(editing.rowNumber, update)}
        />
      )}

      {confirmOpen && (
        <ConfirmDialog
          count={toRegister.length}
          warnings={counts.warning}
          skipped={counts.error + counts.excluded}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={register}
        />
      )}

      {progress !== null && <ProgressOverlay progress={progress} total={toRegister.length} />}
    </div>
  );
}

// ─── Upload stage ─────────────────────────────────────────────────────────────

function UploadStage({
  isParsing,
  file,
  fileError,
  onFile,
  onPick,
}: {
  isParsing: boolean;
  file: UploadedFile | null;
  fileError: { message: string; missingColumns?: string[] } | null;
  onFile: (file: File) => void;
  /** Click: load the demo workbook instead of opening the file picker. */
  onPick: () => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);

  return (
    <div>
      <div className={cn(CARD, 'p-4 sm:p-5')}>
        <div
          role="button"
          tabIndex={0}
          onClick={() => !isParsing && onPick()}
          onKeyDown={(e) => !isParsing && (e.key === 'Enter' || e.key === ' ') && onPick()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const dropped = e.dataTransfer.files?.[0];
            if (dropped) onFile(dropped);
          }}
          className={cn(
            'group flex min-h-[420px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-all outline-none focus-visible:ring-4 focus-visible:ring-blue-500/15',
            dragOver ? 'border-blue-500 bg-blue-50/70' : 'border-slate-200 bg-slate-50/40 hover:border-blue-400 hover:bg-blue-50/30'
          )}
        >
          {isParsing ? (
            <>
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-500 text-white shadow-lg shadow-blue-500/25">
                <Loader2 className="h-6 w-6 animate-spin" />
              </span>
              <p className="mt-4 text-[15px] font-semibold text-slate-900">Reading {file?.name}…</p>
              <p className="mt-1 text-[12.5px] text-slate-500">Mapping columns and validating every row</p>
            </>
          ) : (
            <>
              <span
                className={cn(
                  'grid h-14 w-14 place-items-center rounded-2xl bg-blue-500 text-white shadow-lg shadow-blue-500/25 ring-8 ring-blue-50 transition-transform',
                  dragOver ? 'scale-110' : 'group-hover:-translate-y-0.5'
                )}
              >
                <Upload className="h-6 w-6" />
              </span>
              <p className="mt-5 text-[15px] font-semibold text-slate-900">
                {dragOver ? 'Drop to upload' : <>Drag your Excel file here, or <span className="text-blue-600">browse</span></>}
              </p>
              <p className="mt-1 text-[12.5px] text-slate-500">
                .xlsx or .csv · up to {MAX_FILE_MB} MB · {MAX_ROWS.toLocaleString()} customers per file
              </p>
            </>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[12.5px] text-slate-500">
          <button type="button" onClick={() => setGuideOpen(true)} className="cursor-pointer font-semibold text-blue-600 hover:underline">
            View column guide
          </button>
        </div>

        {fileError && (
          <div role="alert" className="mt-4 flex items-start gap-3 rounded-xl bg-rose-50 p-3.5 ring-1 ring-rose-600/15">
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
            <div className="text-[12.5px]">
              <p className="font-semibold text-rose-900">{fileError.message}</p>
              {fileError.missingColumns && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {fileError.missingColumns.map((c) => (
                    <span key={c} className="rounded-md bg-white px-2 py-0.5 font-medium text-rose-700 ring-1 ring-rose-600/15">
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {guideOpen && <ColumnGuideDrawer onClose={() => setGuideOpen(false)} />}
    </div>
  );
}

function ColumnGuideDrawer({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-70 flex justify-end bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-200" onClick={onClose}>
      <div
        role="dialog"
        aria-label="Template columns"
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-xl flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-300"
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-6 py-5">
          <div>
            <h3 className="text-[18px] font-semibold tracking-tight text-slate-900">Template columns</h3>
            <p className="mt-0.5 text-[12.5px] text-slate-500">
              {BULK_COLUMNS.filter((c) => c.required).length} required · {BULK_COLUMNS.length} total. Column order doesn&apos;t matter — headers are matched by name.
            </p>
          </div>
          <button type="button" onClick={onClose} title="Close" className="cursor-pointer rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left text-[12.5px]">
            <thead className="sticky top-0 bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-2.5">Column</th>
                <th className="px-3 py-2.5">Accepted values</th>
                <th className="px-6 py-2.5">Example</th>
              </tr>
            </thead>
            {BULK_SECTIONS.map((section) => (
              <tbody key={section} className="divide-y divide-slate-100">
                <tr>
                  <th colSpan={3} className="bg-white px-6 pb-2 pt-5 text-left">
                    <span className="block border-l-[3px] border-blue-600 pl-2 text-xs font-semibold uppercase leading-4 tracking-wider text-slate-800">
                      {section}
                    </span>
                  </th>
                </tr>
                {BULK_COLUMNS.filter((c) => c.section === section).map((c) => (
                  <tr key={c.key} className="hover:bg-slate-50/60">
                    <td className="px-6 py-2.5 font-semibold text-slate-800">
                      {c.header}
                      {c.required && <span className="ml-1.5 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">Required</span>}
                    </td>
                    <td className="px-3 py-2.5 text-slate-600">{describeColumn(c)}</td>
                    <td className="px-6 py-2.5 font-mono text-[11.5px] text-slate-500">{c.example ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Review pieces ────────────────────────────────────────────────────────────

function ReviewRow({ row, onEdit, onToggleExcluded }: { row: BulkRow; onEdit: () => void; onToggleExcluded: () => void }) {
  const d = row.data;
  const meta = STATUS_META[row.status];
  const errCols = new Set(row.issues.filter((i) => i.level === 'error').map((i) => i.column));
  const cell = (key: BulkColumnKey, value: string) =>
    errCols.has(key) ? (
      <span className="rounded bg-rose-50 px-1 text-rose-700 underline decoration-rose-400 decoration-wavy underline-offset-2">{value || '—'}</span>
    ) : (
      value || <span className="text-slate-300">—</span>
    );
  const sorted = [...row.issues].sort((a, b) => Number(!!b.watchlist) - Number(!!a.watchlist) || (a.level === b.level ? 0 : a.level === 'error' ? -1 : 1));

  return (
    <tr className={cn('align-top transition-colors hover:bg-slate-50/60', row.excluded && 'bg-slate-50/50 opacity-55')}>
      <td className="px-4 py-3 font-mono text-[11.5px] text-slate-400">{row.rowNumber}</td>
      <td className="px-3 py-3">
        {row.excluded ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500 ring-1 ring-slate-300/50">
            Excluded
          </span>
        ) : (
          <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1', meta.pill)}>
            <span className={cn('h-1.5 w-1.5 rounded-full', meta.dot)} />
            {meta.label}
          </span>
        )}
      </td>
      <td className="px-3 py-3">
        <p className="font-semibold text-slate-900">
          {cell('givenNameEN', d.givenNameEN)} {cell('surnameEN', d.surnameEN)}
        </p>
        <p className="text-[11.5px] text-slate-500">
          {[d.givenNameKH, d.surnameKH].filter(Boolean).join(' ') || '—'} · {cell('gender', d.gender)} · {cell('dateOfBirth', d.dateOfBirth)}
        </p>
      </td>
      <td className="px-3 py-3">
        <p className="font-mono text-[12px] text-slate-800">{cell('idNumber', d.idNumber)}</p>
        <p className="text-[11.5px] text-slate-500">
          {cell('idType', d.idType)}
          {d.expiredDate && <> · exp {cell('expiredDate', d.expiredDate)}</>}
        </p>
      </td>
      <td className="px-3 py-3">
        <p className="max-w-[200px] truncate text-slate-800">{cell('email', d.email)}</p>
        <p className="text-[11.5px] text-slate-500">{cell('mobile', d.mobile)}</p>
      </td>
      <td className="px-3 py-3 text-slate-700">
        {cell('customerType', d.customerType || 'Retail')}
        <p className="text-[11.5px] text-slate-500">{d.city || 'Phnom Penh'}</p>
      </td>
      <td className="px-3 py-3">
        {sorted.length === 0 ? (
          <span className="inline-flex items-center gap-1.5 text-[12px] text-emerald-700">
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
            All checks passed
          </span>
        ) : (
          <ul className="space-y-1">
            {sorted.slice(0, 2).map((issue, i) => (
              <li
                key={i}
                className={cn(
                  'flex items-start gap-1.5 text-[12px] leading-snug',
                  issue.watchlist ? 'font-semibold text-rose-700' : issue.level === 'error' ? 'text-rose-700' : 'text-amber-700'
                )}
              >
                {issue.watchlist ? (
                  <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                ) : issue.level === 'error' ? (
                  <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                ) : (
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                )}
                {issue.message}
              </li>
            ))}
            {sorted.length > 2 && (
              <li>
                <button type="button" onClick={onEdit} className="cursor-pointer text-[11.5px] font-semibold text-blue-600 hover:underline">
                  +{sorted.length - 2} more
                </button>
              </li>
            )}
          </ul>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex justify-end gap-1">
          <button
            type="button"
            onClick={onEdit}
            title="Edit row"
            className="grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onToggleExcluded}
            title={row.excluded ? 'Include row' : 'Exclude row'}
            className="grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          >
            {row.excluded ? <RotateCcw className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </button>
        </div>
      </td>
    </tr>
  );
}

function EditRowDialog({
  row,
  onClose,
  onSave,
}: {
  row: BulkRow;
  onClose: () => void;
  onSave: (update: Pick<BulkRow, 'data' | 'avatarUrl' | 'documents'>) => void;
}) {
  // Same values and fields as the insert form; blank or unreadable cells start from the form's defaults
  const [values, setValues] = useState<IndividualFormValues>(() => ({
    ...rowToFormValues(row.data),
    avatarUrl: row.avatarUrl ?? '',
  }));
  const [documents, setDocuments] = useState<SupportingDocument[]>(row.documents ?? []);
  const setValue = <K extends keyof IndividualFormValues>(key: K, value: IndividualFormValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const errors: Record<string, string> = {};
  row.issues.forEach((i) => i.column && i.level === 'error' && !errors[i.column] && (errors[i.column] = i.message));
  const meta = STATUS_META[row.status];

  // Worst issue per section drives the tab dot; open on the first section with an error (else a warning)
  const sectionIssues = (section: BulkSection) => row.issues.filter((i) => i.column && COLUMN_BY_KEY[i.column].section === section);
  const sectionLevel = (section: BulkSection) => {
    const levels = sectionIssues(section).map((i) => i.level);
    return levels.includes('error') ? 'error' : levels.includes('warning') ? 'warning' : null;
  };
  const [activeSection, setActiveSection] = useState<BulkSection>(
    () =>
      BULK_SECTIONS.find((s) => sectionLevel(s) === 'error') ??
      BULK_SECTIONS.find((s) => sectionLevel(s) === 'warning') ??
      BULK_SECTIONS[0]
  );
  // The insert form prints these four errors under their own field, so the list skips them
  const shownInline = (i: RowIssue) => i.level === 'error' && !!i.column && INLINE_ERROR_FIELDS.includes(i.column) && errors[i.column] === i.message;
  const activeIssues = [...row.issues.filter((i) => !i.column), ...sectionIssues(activeSection)].filter((i) => !shownInline(i));

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center bg-slate-900/50 p-4 sm:p-8 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div
        role="dialog"
        aria-modal
        aria-label={`Edit row ${row.rowNumber}`}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[min(78vh,760px)] w-full max-w-6xl flex-col overflow-hidden rounded-[26px] bg-white shadow-[0_24px_60px_-20px_rgba(15,23,42,0.3)] ring-1 ring-slate-900/10 animate-in zoom-in-95 slide-in-from-bottom-2 duration-200"
      >
        <div className="flex items-start justify-between gap-3 px-6 pb-4 pt-5">
          <div>
            <p className="text-[11.5px] font-semibold uppercase tracking-wide text-slate-400">Row {row.rowNumber}</p>
            <h3 className="text-[18px] font-semibold tracking-tight text-slate-900">
              {[values.givenNameEN, values.surnameEN].filter(Boolean).join(' ') || 'Unnamed customer'}
            </h3>
            <span className={cn('mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1', meta.pill)}>
              <span className={cn('h-1.5 w-1.5 rounded-full', meta.dot)} />
              {row.issues.length ? `${row.issues.length} issue${row.issues.length > 1 ? 's' : ''}` : 'All checks passed'}
            </span>
          </div>
          <button type="button" onClick={onClose} title="Close" className="cursor-pointer rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Section tabs — the insert form's steps */}
        <div className="border-b border-slate-100 px-6 pb-3">
          <div role="tablist" className="inline-flex max-w-full flex-wrap items-center gap-1 rounded-xl border border-slate-200/60 bg-slate-50 p-1">
            {BULK_SECTIONS.map((section) => {
              const level = sectionLevel(section);
              const isOn = section === activeSection;
              return (
                <button
                  key={section}
                  type="button"
                  role="tab"
                  aria-selected={isOn}
                  onClick={() => setActiveSection(section)}
                  className={cn(
                    'inline-flex h-[30px] cursor-pointer items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition',
                    isOn ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-900/5' : 'text-slate-500 hover:text-slate-800'
                  )}
                >
                  {section}
                  {level && <span className={cn('h-1.5 w-1.5 rounded-full', level === 'error' ? 'bg-rose-500' : 'bg-amber-500')} />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {row.issues.some((i) => i.watchlist) && (
            <div className="flex items-start gap-2.5 rounded-xl bg-rose-50 p-3 text-[12.5px] text-rose-800 ring-1 ring-rose-600/15">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
              This person matches the sanction watchlist and cannot be registered here. Escalate to Compliance.
            </div>
          )}

          {/* What the file had wrong in this section */}
          {activeIssues.length > 0 && (
            <ul className="space-y-1.5 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200/70">
              {activeIssues.map((issue, idx) => (
                <li
                  key={idx}
                  className={cn('flex items-start gap-1.5 text-[12.5px] leading-snug', issue.level === 'error' ? 'text-rose-700' : 'text-amber-700')}
                >
                  {issue.level === 'error' ? <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> : <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />}
                  {issue.message}
                </li>
              ))}
            </ul>
          )}

          <IndividualFormFields
            step={SECTION_STEP[activeSection]}
            values={values}
            setValue={setValue}
            errors={errors}
            documents={documents}
            setDocuments={setDocuments}
            wide
          />
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-6 py-4">
          <button type="button" onClick={onClose} className="h-10 cursor-pointer rounded-xl bg-slate-100 px-4 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-200">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave({ data: formValuesToRow(values), avatarUrl: values.avatarUrl || undefined, documents })}
            className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-blue-500 px-4 text-[13px] font-semibold text-white shadow-md shadow-blue-500/30 transition hover:bg-blue-600"
          >
            <Check className="h-4 w-4" />
            Save & re-validate
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmDialog({
  count,
  warnings,
  skipped,
  onCancel,
  onConfirm,
}: {
  count: number;
  warnings: number;
  skipped: number;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div role="dialog" aria-modal className="relative w-full max-w-md overflow-hidden rounded-[26px] bg-white shadow-[0_24px_60px_-20px_rgba(15,23,42,0.3)] ring-1 ring-slate-900/10 animate-in zoom-in-95 slide-in-from-bottom-2 duration-200">
        <button type="button" onClick={onCancel} title="Close dialog" className="absolute right-4 top-4 z-10 cursor-pointer rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
          <X className="h-4 w-4" />
        </button>
        <div className="px-8 pb-7 pt-10">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/20 ring-8 ring-blue-50">
            <Users className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-center text-[22px] font-semibold leading-tight tracking-tight text-slate-900">
            Register {count.toLocaleString()} customer{count !== 1 && 's'}?
          </h3>
          <p className="mx-auto mt-2.5 max-w-[20rem] text-center text-[13px] leading-relaxed text-slate-500">
            They become active customers immediately. This can&apos;t be undone in bulk.
          </p>
          <dl className="mt-6 divide-y divide-slate-100 rounded-2xl bg-slate-50 px-4 ring-1 ring-slate-200/70">
            {[
              ['Will be registered', count, 'text-slate-900'],
              ['Including rows with warnings', warnings, 'text-amber-700'],
              ['Skipped (errors / excluded)', skipped, 'text-slate-500'],
            ].map(([label, n, tone]) => (
              <div key={label as string} className="flex items-center justify-between py-2.5 text-[13px]">
                <dt className="text-slate-600">{label}</dt>
                <dd className={cn('font-semibold tabular-nums', tone as string)}>{(n as number).toLocaleString()}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="flex gap-3 border-t border-slate-100 bg-slate-50/50 px-8 py-5">
          <button type="button" onClick={onCancel} className="h-11 flex-1 cursor-pointer rounded-xl bg-white text-[13px] font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className="h-11 flex-1 cursor-pointer rounded-xl bg-blue-600 text-[13px] font-semibold text-white shadow-md shadow-blue-600/25 transition hover:bg-blue-700">
            Register now
          </button>
        </div>
      </div>
    </div>
  );
}

function ProgressOverlay({ progress, total }: { progress: number; total: number }) {
  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-[26px] bg-white p-8 text-center shadow-2xl ring-1 ring-slate-900/10">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
        <p className="mt-4 text-[15px] font-semibold text-slate-900">Registering customers…</p>
        <p className="mt-1 text-[12.5px] tabular-nums text-slate-500">
          {Math.round((progress / 100) * total).toLocaleString()} of {total.toLocaleString()}
        </p>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-blue-500 transition-[width] duration-100" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-3 text-[11.5px] text-slate-400">Please keep this page open.</p>
      </div>
    </div>
  );
}

// ─── Complete stage ───────────────────────────────────────────────────────────

function CompleteStage({
  result,
  onDownloadSkipped,
  onUploadAnother,
  onViewDirectory,
}: {
  result: RunResult;
  onDownloadSkipped: () => void;
  onUploadAnother: () => void;
  onViewDirectory: () => void;
}) {
  const { registered, skipped } = result;
  const blocked = skipped.filter((r) => r.issues.some((i) => i.watchlist)).length;

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
      <div className={cn(CARD, 'p-8 text-center xl:col-span-1')}>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 ring-8 ring-emerald-50">
          <Check className="h-8 w-8" strokeWidth={3} />
        </div>
        <h2 className="mt-6 text-[22px] font-semibold tracking-tight text-slate-900">
          {registered.length.toLocaleString()} customer{registered.length !== 1 && 's'} registered
        </h2>
        <p className="mx-auto mt-2 max-w-xs text-[13px] text-slate-500">
          From <span className="font-medium text-slate-700">{result.fileName}</span>. All are active and visible in the directory now.
        </p>

        <dl className="mt-6 grid grid-cols-3 gap-2 text-left">
          {[
            ['Registered', registered.length, 'text-emerald-700'],
            ['Skipped', skipped.length, 'text-slate-700'],
            ['Watchlist', blocked, 'text-rose-700'],
          ].map(([label, n, tone]) => (
            <div key={label as string} className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200/70">
              <dt className="text-[11px] font-medium text-slate-500">{label}</dt>
              <dd className={cn('text-[20px] font-semibold tabular-nums', tone as string)}>{(n as number).toLocaleString()}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 space-y-2">
          <button
            type="button"
            onClick={onViewDirectory}
            className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-500 text-[13px] font-semibold text-white shadow-md shadow-blue-500/30 transition hover:bg-blue-600"
          >
            View in Directory
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onUploadAnother}
              className="inline-flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-slate-100 text-[12.5px] font-semibold text-slate-700 transition hover:bg-slate-200"
            >
              <Upload className="h-4 w-4" />
              Upload another
            </button>
            <button
              type="button"
              onClick={onDownloadSkipped}
              disabled={!skipped.length}
              className="inline-flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-slate-100 text-[12.5px] font-semibold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Download className="h-4 w-4" />
              Skipped rows
            </button>
          </div>
        </div>
      </div>

      <div className={cn(CARD, 'overflow-hidden xl:col-span-2')}>
        <div className="flex items-center justify-between px-5 pb-3 pt-4">
          <h3 className="text-[15px] font-semibold text-slate-900">Registered customers</h3>
          <span className="rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">Active</span>
        </div>
        <div className="max-h-[520px] overflow-auto border-t border-slate-100">
          {registered.length === 0 ? (
            <p className="flex items-center justify-center gap-2 px-5 py-14 text-[13px] text-slate-500">
              <Info className="h-4 w-4" />
              No customers were registered.
            </p>
          ) : (
            <table className="w-full text-left text-[12.5px]">
              <thead className="sticky top-0 bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-2.5">Customer</th>
                  <th className="px-3 py-2.5">Customer ID</th>
                  <th className="px-3 py-2.5">ID Number</th>
                  <th className="px-5 py-2.5">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {registered.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-2.5">
                      <p className="font-semibold text-slate-900">{r.fullNameEN}</p>
                      <p className="text-[11.5px] text-slate-500">{r.email}</p>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-[12px] text-blue-700">{r.customerId}</td>
                    <td className="px-3 py-2.5 font-mono text-[12px] text-slate-700">{r.idNumber}</td>
                    <td className="px-5 py-2.5 text-slate-700">{r.customerType}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

