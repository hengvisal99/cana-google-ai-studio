'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, User, MessageSquare, CheckSquare, TrendingUp, ArrowRight, Clock, Slash } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Individual, Lead, CustomerCase, Task, GlobalSearchResult, NavigationPage } from '@/types';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  individuals: Individual[];
  leads: Lead[];
  cases: CustomerCase[];
  tasks: Task[];
  onNavigate: (page: NavigationPage) => void;
  onSelectCustomer?: (id: string) => void;
}

const TYPE_CONFIG: Record<GlobalSearchResult['type'], { icon: React.ElementType; cls: string; label: string }> = {
  customer: { icon: User,           cls: 'bg-blue-100 text-blue-600',    label: 'Customer' },
  lead:     { icon: TrendingUp,     cls: 'bg-emerald-100 text-emerald-600', label: 'Lead' },
  case:     { icon: MessageSquare,  cls: 'bg-purple-100 text-purple-600', label: 'Case' },
  task:     { icon: CheckSquare,    cls: 'bg-amber-100 text-amber-600',   label: 'Task' },
};

const RECENT_SEARCHES = ['Eleanor Vance', 'CS-2026-0891', 'KYC review', 'PPSP IPO'];

export function GlobalSearch({
  isOpen,
  onClose,
  individuals,
  leads,
  cases,
  tasks,
  onNavigate,
  onSelectCustomer,
}: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const inputRef = useRef<HTMLInputElement>(null);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setQuery('');
      setActiveIdx(0);
    }
  }

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const results = useMemo<GlobalSearchResult[]>(() => {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    const out: GlobalSearchResult[] = [];

    // Customers
    individuals.forEach(ind => {
      const name = ind.fullNameEN || `${ind.givenNameEN} ${ind.surnameEN}`;
      if (
        name.toLowerCase().includes(q) ||
        ind.customerId.toLowerCase().includes(q) ||
        ind.email.toLowerCase().includes(q) ||
        ind.phone.toLowerCase().includes(q) ||
        ind.mobile.toLowerCase().includes(q) ||
        ind.investorIdInfo?.investorIdNumber?.toLowerCase().includes(q)
      ) {
        out.push({
          id: `cust-${ind.id}`,
          type: 'customer',
          title: name,
          subtitle: `${ind.customerId} · ${ind.email}`,
          badge: ind.kycStatus === 'verified' ? 'KYC Verified' : ind.kycStatus === 'pending' ? 'KYC Pending' : ind.kycStatus === 'under_review' ? 'Under Review' : 'KYC Rejected',
          navigateTo: 'customer-360',
          entityId: ind.id,
        });
      }
    });

    // Leads
    leads.forEach(lead => {
      if (
        lead.name.toLowerCase().includes(q) ||
        lead.phone.includes(q) ||
        (lead.email || '').toLowerCase().includes(q) ||
        lead.assignedSR.toLowerCase().includes(q)
      ) {
        out.push({
          id: `lead-${lead.id}`,
          type: 'lead',
          title: lead.name,
          subtitle: `${lead.phone} · ${lead.stage} · SR: ${lead.assignedSR}`,
          badge: lead.stage,
          navigateTo: 'pipeline',
          entityId: lead.id,
        });
      }
    });

    // Cases
    cases.forEach(c => {
      if (
        c.caseNumber.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.customerName.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
      ) {
        out.push({
          id: `case-${c.id}`,
          type: 'case',
          title: `${c.caseNumber}: ${c.title}`,
          subtitle: `${c.customerName} · ${c.category} · ${c.status}`,
          badge: c.status,
          navigateTo: 'cases',
          entityId: c.id,
        });
      }
    });

    // Tasks
    tasks.forEach(t => {
      if (
        t.title.toLowerCase().includes(q) ||
        (t.relatedCustomerName || '').toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      ) {
        out.push({
          id: `task-${t.id}`,
          type: 'task',
          title: t.title,
          subtitle: `${t.category} · Due: ${t.dueDate} · ${t.assignedTo}`,
          badge: t.status,
          navigateTo: 'tasks',
          entityId: t.id,
        });
      }
    });

    return out.slice(0, 12);
  }, [query, individuals, leads, cases, tasks]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, results.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
    if (e.key === 'Enter' && results[activeIdx]) handleSelect(results[activeIdx]);
  };

  const handleSelect = (r: GlobalSearchResult) => {
    if (r.type === 'customer' && onSelectCustomer && r.entityId) {
      onSelectCustomer(r.entityId);
    }
    onNavigate(r.navigateTo);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4" onClick={onClose}>
      <div
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl shadow-slate-400/30 border border-slate-200 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setActiveIdx(0); }}
            onKeyDown={handleKeyDown}
            placeholder="Search customers, leads, cases, tasks..."
            className="flex-1 text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
            autoComplete="off"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 rounded-lg hover:bg-slate-100 transition">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          )}
          <button onClick={onClose} className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition">
            <span className="text-xs text-slate-500 font-semibold">Esc</span>
          </button>
        </div>

        {/* Results / Empty state */}
        <div className="max-h-[60vh] overflow-y-auto">
          {!query && (
            <div className="px-4 py-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Recent Searches</p>
              <div className="space-y-1">
                {RECENT_SEARCHES.map(s => (
                  <button
                    key={s}
                    onClick={() => setQuery(s)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 transition text-left"
                  >
                    <Clock className="w-4 h-4 text-slate-300 shrink-0" />
                    <span className="text-sm text-slate-600">{s}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {query && results.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-700 font-semibold text-sm">No results for &ldquo;{query}&rdquo;</p>
              <p className="text-slate-400 text-xs mt-1">Try different keywords or check spelling.</p>
            </div>
          )}

          {query && results.length > 0 && (
            <div className="py-2">
              {/* Group by type */}
              {(['customer', 'lead', 'case', 'task'] as GlobalSearchResult['type'][]).map(type => {
                const group = results.filter(r => r.type === type);
                if (group.length === 0) return null;
                const cfg = TYPE_CONFIG[type];
                const TypeIcon = cfg.icon;
                return (
                  <div key={type} className="mb-2">
                    <div className="px-4 py-1.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{cfg.label}s</p>
                    </div>
                    {group.map((r, idx) => {
                      const globalIdx = results.indexOf(r);
                      return (
                        <button
                          key={r.id}
                          onClick={() => handleSelect(r)}
                          onMouseEnter={() => setActiveIdx(globalIdx)}
                          className={cn(
                            'w-full flex items-center gap-3 px-4 py-3 transition text-left',
                            activeIdx === globalIdx ? 'bg-blue-50' : 'hover:bg-slate-50'
                          )}
                        >
                          <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center shrink-0', cfg.cls)}>
                            <TypeIcon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">{r.title}</p>
                            <p className="text-xs text-slate-400 truncate">{r.subtitle}</p>
                          </div>
                          {r.badge && (
                            <span className="text-[10px] font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md shrink-0">
                              {r.badge}
                            </span>
                          )}
                          <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-4 py-2.5 flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[10px]">↑↓</kbd> navigate</span>
          <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[10px]">↵</kbd> select</span>
          <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[10px]">Esc</kbd> close</span>
          <span className="ml-auto">{query && results.length > 0 ? `${results.length} result${results.length !== 1 ? 's' : ''}` : ''}</span>
        </div>
      </div>
    </div>
  );
}
