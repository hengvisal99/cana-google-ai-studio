'use client';

import React, { useState, useMemo } from 'react';
import {
  MessageSquare, Plus, Search, Filter, Clock, AlertTriangle,
  CheckCircle2, Circle, ChevronRight, X, User, Calendar,
  Tag, MoreHorizontal, AlertCircle, Inbox, ArrowLeft,
  MessageCircle, Activity, Send, ChevronDown, Building2,
  SlidersHorizontal, FileText, Shield, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CustomerCase, CasePriority, CaseStatus, CaseCategory, CaseActivity } from '@/types';
import { format, formatDistanceToNow, parseISO, differenceInHours } from 'date-fns';

interface CasesScreenProps {
  cases: CustomerCase[];
  onSaveCase: (c: CustomerCase) => void;
  onUpdateCase: (id: string, updates: Partial<CustomerCase>) => void;
}

const PRIORITY_CONFIG: Record<CasePriority, { cls: string; dot: string; label: string; icon: React.ElementType }> = {
  Critical: { cls: 'bg-rose-100 text-rose-700 border border-rose-200', dot: 'bg-rose-500', label: 'Critical', icon: Zap },
  High:     { cls: 'bg-orange-100 text-orange-700 border border-orange-200', dot: 'bg-orange-500', label: 'High', icon: AlertTriangle },
  Medium:   { cls: 'bg-amber-100 text-amber-700 border border-amber-200', dot: 'bg-amber-500', label: 'Medium', icon: Clock },
  Low:      { cls: 'bg-slate-100 text-slate-600 border border-slate-200', dot: 'bg-slate-400', label: 'Low', icon: Circle },
};

const STATUS_CONFIG: Record<CaseStatus, { cls: string; icon: React.ElementType; label: string }> = {
  'Open':        { cls: 'bg-slate-100 text-slate-600',     icon: Circle,       label: 'Open' },
  'Assigned':    { cls: 'bg-blue-100 text-blue-700',       icon: User,         label: 'Assigned' },
  'In Progress': { cls: 'bg-indigo-100 text-indigo-700',   icon: Activity,     label: 'In Progress' },
  'Pending':     { cls: 'bg-amber-100 text-amber-700',     icon: Clock,        label: 'Pending' },
  'Resolved':    { cls: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2, label: 'Resolved' },
  'Closed':      { cls: 'bg-slate-100 text-slate-500',     icon: CheckCircle2, label: 'Closed' },
};

const CATEGORY_CONFIG: Record<CaseCategory, { cls: string }> = {
  'Account Issue':        { cls: 'bg-blue-100 text-blue-700' },
  'KYC / Document':       { cls: 'bg-purple-100 text-purple-700' },
  'Transaction Dispute':  { cls: 'bg-red-100 text-red-700' },
  'IPO / Subscription':   { cls: 'bg-indigo-100 text-indigo-700' },
  'Technical Issue':      { cls: 'bg-slate-100 text-slate-700' },
  'Complaint':            { cls: 'bg-rose-100 text-rose-700' },
  'Information Request':  { cls: 'bg-teal-100 text-teal-700' },
  'Other':                { cls: 'bg-slate-100 text-slate-600' },
};

const ACTIVITY_TYPE_CONFIG: Record<CaseActivity['type'], { icon: React.ElementType; cls: string }> = {
  created:       { icon: Plus,          cls: 'bg-blue-100 text-blue-600' },
  assigned:      { icon: User,          cls: 'bg-indigo-100 text-indigo-600' },
  status_change: { icon: Activity,      cls: 'bg-amber-100 text-amber-600' },
  comment:       { icon: MessageCircle, cls: 'bg-slate-100 text-slate-600' },
  resolved:      { icon: CheckCircle2,  cls: 'bg-emerald-100 text-emerald-600' },
  closed:        { icon: CheckCircle2,  cls: 'bg-slate-100 text-slate-600' },
};

function SlaChip({ deadline, breached, status }: { deadline: string; breached?: boolean; status?: CaseStatus }) {
  if (status === 'Resolved' || status === 'Closed') return null;
  const hrs = differenceInHours(parseISO(deadline), new Date());
  if (breached || hrs < 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
        <AlertTriangle className="w-2.5 h-2.5" /> SLA Breached
      </span>
    );
  }
  if (hrs <= 4) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
        <Clock className="w-2.5 h-2.5" /> {hrs}h left
      </span>
    );
  }
  return null;
}

function CaseFormField({ label, id, required, error, children }: { label: string; id: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="text-xs font-semibold text-slate-500 block mb-1">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
    </div>
  );
}

// ─── New Case Modal ────────────────────────────────────────────────────────────
interface NewCaseModalProps {
  onSave: (c: CustomerCase) => void;
  onClose: () => void;
}
function NewCaseModal({ onSave, onClose }: NewCaseModalProps) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Account Issue' as CaseCategory,
    priority: 'Medium' as CasePriority,
    customerName: '',
    customerId: '',
    branch: 'Phnom Penh Main Branch',
    assignedTo: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.customerName.trim()) e.customerName = 'Customer name is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const now = new Date();
    const slaHours = form.priority === 'Critical' ? 4 : form.priority === 'High' ? 8 : form.priority === 'Medium' ? 48 : 120;
    const newCase: CustomerCase = {
      id: `CASE-${Date.now()}`,
      caseNumber: `CS-2026-${900 + Math.floor(Math.random() * 99)}`,
      title: form.title,
      description: form.description,
      category: form.category,
      priority: form.priority,
      status: form.assignedTo ? 'Assigned' : 'Open',
      customerId: form.customerId || `CUST-${Date.now()}`,
      customerName: form.customerName,
      assignedTo: form.assignedTo || undefined,
      branch: form.branch,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      slaDeadline: new Date(now.getTime() + slaHours * 3600000).toISOString(),
      slaBreached: false,
      activities: [
        {
          id: `ACT-${Date.now()}`,
          type: 'created',
          description: `Case created: ${form.title}`,
          performedBy: 'Marcus Aurelius',
          timestamp: now.toISOString(),
        },
        ...(form.assignedTo ? [{
          id: `ACT-${Date.now() + 1}`,
          type: 'assigned' as const,
          description: `Case assigned to ${form.assignedTo}.`,
          performedBy: 'Marcus Aurelius',
          timestamp: now.toISOString(),
          newStatus: 'Assigned' as CaseStatus,
        }] : []),
      ],
    };
    onSave(newCase);
    onClose();
  };

  const inputCls = (key: string) => cn(
    'w-full px-3 py-2 text-sm border rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-400/30 transition',
    errors[key] ? 'border-rose-300 focus:ring-rose-300/30' : 'border-slate-200'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white rounded-t-3xl border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Create New Case</h2>
            <p className="text-xs text-slate-400 mt-0.5">Log a customer service request or complaint</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <CaseFormField label="Case Title" id="title" required error={errors.title}>
            <input id="title" type="text" value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="Brief description of the issue"
              className={inputCls('title')} />
          </CaseFormField>

          <CaseFormField label="Description" id="description" required error={errors.description}>
            <textarea id="description" value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              rows={3} placeholder="Detailed description of the customer's issue..."
              className={cn(inputCls('description'), 'resize-none')} />
          </CaseFormField>

          <div className="grid grid-cols-2 gap-4">
            <CaseFormField label="Customer Name" id="customerName" required error={errors.customerName}>
              <input id="customerName" type="text" value={form.customerName}
                onChange={e => setForm(p => ({ ...p, customerName: e.target.value }))}
                placeholder="Full customer name"
                className={inputCls('customerName')} />
            </CaseFormField>
            <CaseFormField label="Customer ID" id="customerId" error={errors.customerId}>
              <input id="customerId" type="text" value={form.customerId}
                onChange={e => setForm(p => ({ ...p, customerId: e.target.value }))}
                placeholder="e.g. IND-9021"
                className={inputCls('customerId')} />
            </CaseFormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <CaseFormField label="Category" id="category" error={errors.category}>
              <select id="category" value={form.category}
                onChange={e => setForm(p => ({ ...p, category: e.target.value as CaseCategory }))}
                className={inputCls('category')}>
                {(['Account Issue', 'KYC / Document', 'Transaction Dispute', 'IPO / Subscription',
                  'Technical Issue', 'Complaint', 'Information Request', 'Other'] as CaseCategory[]).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </CaseFormField>
            <CaseFormField label="Priority" id="priority" error={errors.priority}>
              <select id="priority" value={form.priority}
                onChange={e => setForm(p => ({ ...p, priority: e.target.value as CasePriority }))}
                className={inputCls('priority')}>
                <option>Critical</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </CaseFormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <CaseFormField label="Branch" id="branch" error={errors.branch}>
              <select id="branch" value={form.branch}
                onChange={e => setForm(p => ({ ...p, branch: e.target.value }))}
                className={inputCls('branch')}>
                <option>Phnom Penh Main Branch</option>
                <option>Siem Reap Branch</option>
                <option>Kampong Cham Branch</option>
                <option>Sihanoukville Branch</option>
                <option>Battambang Branch</option>
              </select>
            </CaseFormField>
            <CaseFormField label="Assign To (optional)" id="assignedTo" error={errors.assignedTo}>
              <input id="assignedTo" type="text" value={form.assignedTo}
                onChange={e => setForm(p => ({ ...p, assignedTo: e.target.value }))}
                placeholder="Staff name"
                className={inputCls('assignedTo')} />
            </CaseFormField>
          </div>

          <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-xs text-blue-700">
            <strong>SLA:</strong>{' '}
            {form.priority === 'Critical' ? '4 hours' : form.priority === 'High' ? '8 hours' : form.priority === 'Medium' ? '48 hours' : '5 business days'}
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-slate-100 rounded-b-3xl px-6 py-4 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition">
            Cancel
          </button>
          <button onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition shadow-sm">
            Create Case
          </button>
        </div>
      </div>
    </div>
  );
}

function createActivityId() {
  return `ACT-${Date.now()}`;
}

// ─── Case Detail Panel ─────────────────────────────────────────────────────────
interface CaseDetailProps {
  case_: CustomerCase;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<CustomerCase>) => void;
}
function CaseDetailPanel({ case_: c, onClose, onUpdate }: CaseDetailProps) {
  const [comment, setComment] = useState('');
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const handleAddComment = () => {
    if (!comment.trim()) return;
    const activity: CaseActivity = {
      id: createActivityId(),
      type: 'comment',
      description: comment,
      performedBy: 'Marcus Aurelius',
      timestamp: new Date().toISOString(),
    };
    onUpdate(c.id, {
      activities: [...c.activities, activity],
      updatedAt: new Date().toISOString(),
    });
    setComment('');
  };

  const handleStatusChange = (newStatus: CaseStatus) => {
    const activity: CaseActivity = {
      id: createActivityId(),
      type: newStatus === 'Resolved' ? 'resolved' : newStatus === 'Closed' ? 'closed' : 'status_change',
      description: `Case status changed to ${newStatus}.`,
      performedBy: 'Marcus Aurelius',
      timestamp: new Date().toISOString(),
      newStatus,
    };
    onUpdate(c.id, {
      status: newStatus,
      activities: [...c.activities, activity],
      updatedAt: new Date().toISOString(),
      ...(newStatus === 'Resolved' ? { resolvedAt: new Date().toISOString() } : {}),
      ...(newStatus === 'Closed' ? { closedAt: new Date().toISOString() } : {}),
    });
    setShowStatusMenu(false);
  };

  const pCfg = PRIORITY_CONFIG[c.priority];
  const sCfg = STATUS_CONFIG[c.status];
  const catCfg = CATEGORY_CONFIG[c.category];
  const StatusIcon = sCfg.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-xs font-mono text-slate-400">{c.caseNumber}</span>
                <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold', pCfg.cls)}>
                  <span className={cn('w-1.5 h-1.5 rounded-full', pCfg.dot)} />{pCfg.label}
                </span>
                <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold', sCfg.cls)}>
                  <StatusIcon className="w-3 h-3" />{sCfg.label}
                </span>
                <SlaChip deadline={c.slaDeadline} breached={c.slaBreached} status={c.status} />
              </div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">{c.title}</h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition shrink-0">
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            {[
              { label: 'Customer', value: c.customerName },
              { label: 'Category', value: c.category },
              { label: 'Branch', value: c.branch },
              { label: 'Assigned To', value: c.assignedTo || '— Unassigned —' },
              { label: 'Created', value: format(parseISO(c.createdAt), 'MMM d, yyyy HH:mm') },
              { label: 'SLA Deadline', value: format(parseISO(c.slaDeadline), 'MMM d, yyyy HH:mm') },
            ].map(({ label, value }) => (
              <div key={label} className="bg-slate-50 rounded-xl p-3">
                <p className="text-slate-400 font-medium mb-0.5">{label}</p>
                <p className="text-slate-800 font-semibold">{value}</p>
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-slate-500 mb-2">Description</p>
            <p className="text-sm text-slate-700 leading-relaxed">{c.description}</p>
          </div>

          {c.resolutionNotes && (
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
              <p className="text-xs font-semibold text-emerald-700 mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Resolution Notes
              </p>
              <p className="text-sm text-emerald-800 leading-relaxed">{c.resolutionNotes}</p>
            </div>
          )}

          {/* Activity timeline */}
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-3">Activity Timeline</p>
            <div className="space-y-3">
              {[...c.activities].reverse().map(act => {
                const cfg = ACTIVITY_TYPE_CONFIG[act.type] ?? ACTIVITY_TYPE_CONFIG.comment;
                const Icon = cfg.icon;
                return (
                  <div key={act.id} className="flex gap-3">
                    <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5', cfg.cls)}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700">{act.description}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {act.performedBy} · {formatDistanceToNow(parseISO(act.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Actions footer */}
        {c.status !== 'Closed' && (
          <div className="shrink-0 border-t border-slate-100 px-6 py-4 space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={comment}
                onChange={e => setComment(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                placeholder="Add a comment or update..."
                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
              />
              <button onClick={handleAddComment}
                className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition shadow-sm">
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-2 flex-wrap">
              {(['In Progress', 'Pending', 'Resolved', 'Closed'] as CaseStatus[]).filter(s => s !== c.status).map(s => {
                const sCfgBtn = STATUS_CONFIG[s];
                const BtnIcon = sCfgBtn.icon;
                return (
                  <button key={s} onClick={() => handleStatusChange(s)}
                    className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition hover:opacity-80', sCfgBtn.cls, 'border-current/20')}>
                    <BtnIcon className="w-3 h-3" />
                    Set {s}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export function CasesScreen({ cases, onSaveCase, onUpdateCase }: CasesScreenProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | CaseStatus>('All');
  const [priorityFilter, setPriorityFilter] = useState<'All' | CasePriority>('All');
  const [categoryFilter, setCategoryFilter] = useState<'All' | CaseCategory>('All');
  const [showNewCase, setShowNewCase] = useState(false);
  const [selectedCase, setSelectedCase] = useState<CustomerCase | null>(null);

  const q = search.toLowerCase();
  const filtered = useMemo(() => cases.filter(c =>
    (statusFilter === 'All' || c.status === statusFilter) &&
    (priorityFilter === 'All' || c.priority === priorityFilter) &&
    (categoryFilter === 'All' || c.category === categoryFilter) &&
    (!q || c.title.toLowerCase().includes(q) || c.customerName.toLowerCase().includes(q) || c.caseNumber.toLowerCase().includes(q))
  ), [cases, statusFilter, priorityFilter, categoryFilter, q]);

  const stats = useMemo(() => ({
    open: cases.filter(c => c.status === 'Open').length,
    inProgress: cases.filter(c => c.status === 'In Progress').length,
    breached: cases.filter(c => c.slaBreached).length,
    resolved: cases.filter(c => c.status === 'Resolved' || c.status === 'Closed').length,
  }), [cases]);

  const activeFilters = [statusFilter !== 'All', priorityFilter !== 'All', categoryFilter !== 'All'].filter(Boolean).length;

  const handleUpdate = (id: string, updates: Partial<CustomerCase>) => {
    onUpdateCase(id, updates);
    // Keep detail panel in sync
    if (selectedCase?.id === id) {
      setSelectedCase(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  return (
    <div className="py-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customer Cases</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage service requests, complaints, and enquiries</p>
        </div>
        <button
          onClick={() => setShowNewCase(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          New Case
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Open', value: stats.open, icon: Inbox, tone: 'slate' },
          { label: 'In Progress', value: stats.inProgress, icon: Activity, tone: 'blue' },
          { label: 'SLA Breached', value: stats.breached, icon: AlertTriangle, tone: 'rose' },
          { label: 'Resolved / Closed', value: stats.resolved, icon: CheckCircle2, tone: 'emerald' },
        ].map(({ label, value, icon: Icon, tone }) => {
          const colors: Record<string, string> = {
            slate: 'from-slate-500 to-slate-600 shadow-slate-200',
            blue: 'from-blue-500 to-indigo-600 shadow-blue-200',
            rose: 'from-rose-500 to-rose-600 shadow-rose-200',
            emerald: 'from-emerald-500 to-teal-600 shadow-emerald-200',
          };
          return (
            <div key={label} className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-sm flex items-center gap-4">
              <div className={cn('w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white shadow-md shrink-0', colors[tone])}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">{label}</p>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by case number, customer name, or title..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-400/30">
              <option value="All">All Statuses</option>
              {(['Open', 'Assigned', 'In Progress', 'Pending', 'Resolved', 'Closed'] as CaseStatus[]).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value as typeof priorityFilter)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-400/30">
              <option value="All">All Priorities</option>
              <option>Critical</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value as typeof categoryFilter)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-400/30">
              <option value="All">All Categories</option>
              {(['Account Issue', 'KYC / Document', 'Transaction Dispute', 'IPO / Subscription',
                'Technical Issue', 'Complaint', 'Information Request', 'Other'] as CaseCategory[]).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {activeFilters > 0 && (
              <button
                onClick={() => { setStatusFilter('All'); setPriorityFilter('All'); setCategoryFilter('All'); }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition"
              >
                <X className="w-3 h-3" />
                Clear {activeFilters}
              </button>
            )}
          </div>
        </div>

        {/* Active filter chips */}
        {activeFilters > 0 && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 flex-wrap">
            <span className="text-xs text-slate-400 font-medium">Active filters:</span>
            {statusFilter !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-blue-100 text-blue-700">
                Status: {statusFilter}
                <button onClick={() => setStatusFilter('All')} className="ml-0.5 hover:text-blue-900"><X className="w-2.5 h-2.5" /></button>
              </span>
            )}
            {priorityFilter !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-100 text-amber-700">
                Priority: {priorityFilter}
                <button onClick={() => setPriorityFilter('All')} className="ml-0.5 hover:text-amber-900"><X className="w-2.5 h-2.5" /></button>
              </span>
            )}
            {categoryFilter !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-purple-100 text-purple-700">
                Category: {categoryFilter}
                <button onClick={() => setCategoryFilter('All')} className="ml-0.5 hover:text-purple-900"><X className="w-2.5 h-2.5" /></button>
              </span>
            )}
            <span className="ml-auto text-xs text-slate-400">{filtered.length} results</span>
          </div>
        )}
      </div>

      {/* Cases Table */}
      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-700 font-semibold">No cases found</p>
            <p className="text-slate-400 text-sm mt-1">
              {activeFilters > 0 || search ? 'Try adjusting your search or filters.' : 'Create a new case to get started.'}
            </p>
            {!activeFilters && !search && (
              <button onClick={() => setShowNewCase(true)}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition">
                <Plus className="w-4 h-4" /> Create Case
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Case #', 'Customer', 'Title', 'Category', 'Priority', 'Status', 'Assigned To', 'SLA', 'Updated'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider pb-3 pr-4 pt-4 px-4 first:pl-5 last:pr-5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(c => {
                  const pCfg = PRIORITY_CONFIG[c.priority];
                  const sCfg = STATUS_CONFIG[c.status];
                  const catCfg = CATEGORY_CONFIG[c.category];
                  const StatusIcon = sCfg.icon;
                  const PriorityIcon = pCfg.icon;
                  return (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedCase(c)}
                      className="hover:bg-slate-50/60 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 pr-4 pl-5 font-mono text-xs text-slate-500 whitespace-nowrap">{c.caseNumber}</td>
                      <td className="py-3.5 pr-4">
                        <p className="font-semibold text-slate-800 whitespace-nowrap">{c.customerName}</p>
                        <p className="text-xs text-slate-400">{c.customerId}</p>
                      </td>
                      <td className="py-3.5 pr-4 max-w-[200px]">
                        <p className="font-medium text-slate-800 line-clamp-1">{c.title}</p>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3" />{c.branch}
                        </p>
                      </td>
                      <td className="py-3.5 pr-4">
                        <span className={cn('inline-flex px-2 py-0.5 rounded-md text-xs font-semibold whitespace-nowrap', catCfg.cls)}>
                          {c.category}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4">
                        <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold whitespace-nowrap', pCfg.cls)}>
                          <PriorityIcon className="w-3 h-3" />{pCfg.label}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4">
                        <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold whitespace-nowrap', sCfg.cls)}>
                          <StatusIcon className="w-3 h-3" />{sCfg.label}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4 text-slate-600 text-xs whitespace-nowrap">
                        {c.assignedTo ?? <span className="text-slate-300">Unassigned</span>}
                      </td>
                      <td className="py-3.5 pr-4">
                        <SlaChip deadline={c.slaDeadline} breached={c.slaBreached} status={c.status} />
                      </td>
                      <td className="py-3.5 pr-5 text-slate-400 text-xs whitespace-nowrap">
                        {formatDistanceToNow(parseISO(c.updatedAt), { addSuffix: true })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {showNewCase && <NewCaseModal onSave={onSaveCase} onClose={() => setShowNewCase(false)} />}
      {selectedCase && (
        <CaseDetailPanel
          case_={selectedCase}
          onClose={() => setSelectedCase(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}
