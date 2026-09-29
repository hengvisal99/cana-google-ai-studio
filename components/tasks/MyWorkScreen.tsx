'use client';

import React, { useMemo } from 'react';
import {
  CheckSquare, AlertTriangle, Clock, Calendar, FileText,
  ShieldCheck, MessageSquare, User, ArrowRight, CheckCircle2,
  Circle, Activity, Zap, Sparkles, Bell, TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Task, CustomerCase, Individual, NavigationPage, AppNotification } from '@/types';
import { differenceInDays, parseISO, isValid, format, isToday, isBefore } from 'date-fns';

interface MyWorkScreenProps {
  tasks: Task[];
  cases: CustomerCase[];
  individuals: Individual[];
  notifications: AppNotification[];
  onNavigate: (page: NavigationPage) => void;
  onSelectCustomer?: (id: string) => void;
  currentUserName?: string;
}

function SectionHeader({ title, count, icon: Icon, tone }: {
  title: string; count: number; icon: React.ElementType; tone: 'rose' | 'amber' | 'blue' | 'emerald' | 'slate';
}) {
  const tones: Record<string, string> = {
    rose: 'bg-rose-100 text-rose-600',
    amber: 'bg-amber-100 text-amber-600',
    blue: 'bg-blue-100 text-blue-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    slate: 'bg-slate-100 text-slate-600',
  };
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center shrink-0', tones[tone])}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <h2 className="text-sm font-bold text-slate-900">{title}</h2>
      {count > 0 && (
        <span className="text-xs font-bold text-white bg-slate-400 rounded-full px-2 py-0.5 leading-none">{count}</span>
      )}
    </div>
  );
}

export function MyWorkScreen({
  tasks,
  cases,
  individuals,
  notifications,
  onNavigate,
  onSelectCustomer,
  currentUserName = 'Marcus Aurelius',
}: MyWorkScreenProps) {
  const today = new Date();

  const todayTasks = useMemo(() =>
    tasks.filter(t => {
      if (t.status === 'Done') return false;
      const due = parseISO(t.dueDate);
      return isValid(due) && isToday(due);
    }), [tasks]);

  const overdueTasks = useMemo(() =>
    tasks.filter(t => {
      if (t.status === 'Done') return false;
      const due = parseISO(t.dueDate);
      return isValid(due) && isBefore(due, today) && !isToday(due);
    }), [tasks, today]);

  const upcomingTasks = useMemo(() =>
    tasks.filter(t => {
      if (t.status === 'Done') return false;
      const due = parseISO(t.dueDate);
      if (!isValid(due)) return false;
      const days = differenceInDays(due, today);
      return days > 0 && days <= 7;
    }).sort((a, b) => a.dueDate.localeCompare(b.dueDate)), [tasks, today]);

  const openCases = useMemo(() =>
    cases.filter(c => c.status !== 'Closed' && c.status !== 'Resolved'), [cases]);

  const breachedCases = useMemo(() =>
    cases.filter(c => c.slaBreached && c.status !== 'Closed' && c.status !== 'Resolved'), [cases]);

  const pendingApprovals = useMemo(() =>
    individuals.filter(ind =>
      ind.requestStatus === 'Pending' &&
      (ind.currentWorkflowStage === 'Manager' || ind.currentWorkflowStage === 'SR')
    ), [individuals]);

  const kycPending = useMemo(() =>
    individuals.filter(ind => ind.kycStatus === 'pending' || ind.kycStatus === 'under_review'), [individuals]);

  const expiringDocs = useMemo(() => {
    return individuals.filter(ind => {
      const days = differenceInDays(parseISO(ind.expiredDate || ''), today);
      return days >= 0 && days <= 30;
    });
  }, [individuals, today]);

  const unreadNotifications = useMemo(() =>
    notifications.filter(n => !n.isRead), [notifications]);

  const hour = today.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="py-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-blue-200 text-sm font-medium">{greeting}</p>
            <h1 className="text-2xl font-bold mt-0.5">{currentUserName}</h1>
            <p className="text-blue-100 text-sm mt-1.5">
              {format(today, 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          <Sparkles className="w-8 h-8 text-blue-300 opacity-70" />
        </div>
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Tasks Today', value: todayTasks.length, alert: todayTasks.length > 0 },
            { label: 'Overdue Tasks', value: overdueTasks.length, alert: overdueTasks.length > 0 },
            { label: 'Open Cases', value: openCases.length, alert: breachedCases.length > 0 },
            { label: 'Pending Approvals', value: pendingApprovals.length, alert: pendingApprovals.length > 3 },
          ].map(({ label, value, alert }) => (
            <div key={label} className={cn('rounded-2xl px-4 py-3', alert && value > 0 ? 'bg-white/20' : 'bg-white/10')}>
              <p className="text-blue-100 text-xs font-medium">{label}</p>
              <p className={cn('text-2xl font-bold mt-0.5', alert && value > 0 ? 'text-white' : 'text-blue-200')}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overdue Tasks */}
        <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-5">
          <SectionHeader title="Overdue Tasks" count={overdueTasks.length} icon={AlertTriangle} tone="rose" />
          {overdueTasks.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No overdue tasks. Great job!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {overdueTasks.slice(0, 5).map(t => {
                const days = differenceInDays(today, parseISO(t.dueDate));
                return (
                  <button key={t.id} onClick={() => onNavigate('tasks')}
                    className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-rose-50 transition text-left group">
                    <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{t.title}</p>
                      <p className="text-xs text-rose-600 font-semibold">{days}d overdue · {t.category}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 shrink-0 mt-1 transition" />
                  </button>
                );
              })}
              {overdueTasks.length > 5 && (
                <button onClick={() => onNavigate('tasks')}
                  className="text-xs text-blue-600 font-semibold w-full text-center py-2 hover:bg-blue-50 rounded-xl transition">
                  + {overdueTasks.length - 5} more overdue tasks →
                </button>
              )}
            </div>
          )}
        </div>

        {/* Today's Tasks */}
        <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-5">
          <SectionHeader title="Due Today" count={todayTasks.length} icon={Calendar} tone="amber" />
          {todayTasks.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-10 h-10 text-slate-200 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No tasks due today.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todayTasks.map(t => (
                <button key={t.id} onClick={() => onNavigate('tasks')}
                  className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-amber-50 transition text-left group">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{t.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={cn('text-xs font-semibold px-1.5 py-0.5 rounded',
                        t.priority === 'High' ? 'bg-rose-100 text-rose-700' :
                        t.priority === 'Medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-600'
                      )}>{t.priority}</span>
                      <span className="text-xs text-slate-400">{t.category}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 shrink-0 mt-1 transition" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* SLA Breached Cases */}
        {breachedCases.length > 0 && (
          <div className="bg-white rounded-2xl border border-rose-200 shadow-sm p-5">
            <SectionHeader title="SLA Breached Cases" count={breachedCases.length} icon={Zap} tone="rose" />
            <div className="space-y-2">
              {breachedCases.slice(0, 4).map(c => (
                <button key={c.id} onClick={() => onNavigate('cases')}
                  className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-rose-50 transition text-left group border border-rose-100">
                  <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{c.caseNumber}: {c.title}</p>
                    <p className="text-xs text-rose-600 font-semibold">{c.customerName} · {c.priority} Priority</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 shrink-0 mt-1 transition" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Open Cases */}
        <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-5">
          <SectionHeader title="Open Cases" count={openCases.length} icon={MessageSquare} tone="blue" />
          {openCases.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No open cases.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {openCases.slice(0, 5).map(c => {
                const PRIORITY_DOT: Record<string, string> = {
                  Critical: 'bg-rose-500', High: 'bg-orange-500', Medium: 'bg-amber-500', Low: 'bg-slate-400'
                };
                return (
                  <button key={c.id} onClick={() => onNavigate('cases')}
                    className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-blue-50 transition text-left group">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                      <MessageSquare className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={cn('w-2 h-2 rounded-full shrink-0', PRIORITY_DOT[c.priority])} />
                        <p className="text-sm font-semibold text-slate-800 truncate">{c.title}</p>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{c.customerName} · {c.status}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 shrink-0 mt-1 transition" />
                  </button>
                );
              })}
              {openCases.length > 5 && (
                <button onClick={() => onNavigate('cases')}
                  className="text-xs text-blue-600 font-semibold w-full text-center py-2 hover:bg-blue-50 rounded-xl transition">
                  + {openCases.length - 5} more open cases →
                </button>
              )}
            </div>
          )}
        </div>

        {/* Pending Approvals */}
        <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-5">
          <SectionHeader title="Pending Approvals" count={pendingApprovals.length} icon={ShieldCheck} tone="amber" />
          {pendingApprovals.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No pending approvals.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingApprovals.slice(0, 5).map(ind => {
                const name = ind.fullNameEN || `${ind.givenNameEN} ${ind.surnameEN}`;
                return (
                  <button key={ind.id} onClick={() => {
                    onSelectCustomer?.(ind.id);
                    onNavigate('individual-list');
                  }}
                    className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-amber-50 transition text-left group">
                    <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{name}</p>
                      <p className="text-xs text-amber-600 font-medium">{ind.requestType} · {ind.currentWorkflowStage} stage</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 shrink-0 mt-1 transition" />
                  </button>
                );
              })}
              {pendingApprovals.length > 5 && (
                <button onClick={() => onNavigate('individual-list')}
                  className="text-xs text-blue-600 font-semibold w-full text-center py-2 hover:bg-blue-50 rounded-xl transition">
                  + {pendingApprovals.length - 5} more approvals →
                </button>
              )}
            </div>
          )}
        </div>

        {/* KYC Pending */}
        <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-5">
          <SectionHeader title="KYC Review Queue" count={kycPending.length} icon={ShieldCheck} tone="blue" />
          {kycPending.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No pending KYC reviews.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {kycPending.slice(0, 5).map(ind => {
                const name = ind.fullNameEN || `${ind.givenNameEN} ${ind.surnameEN}`;
                const KYC_STATUS_CLS: Record<string, string> = {
                  pending: 'bg-amber-100 text-amber-700',
                  under_review: 'bg-blue-100 text-blue-700',
                };
                return (
                  <button key={ind.id} onClick={() => onNavigate('compliance')}
                    className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-blue-50 transition text-left group">
                    <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{name}</p>
                      <p className="text-xs text-slate-400">{ind.customerId} · Risk: {ind.riskRating}</p>
                    </div>
                    <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-md', KYC_STATUS_CLS[ind.kycStatus] || 'bg-slate-100 text-slate-600')}>
                      {ind.kycStatus === 'under_review' ? 'Under Review' : 'Pending'}
                    </span>
                  </button>
                );
              })}
              {kycPending.length > 5 && (
                <button onClick={() => onNavigate('compliance')}
                  className="text-xs text-blue-600 font-semibold w-full text-center py-2 hover:bg-blue-50 rounded-xl transition">
                  + {kycPending.length - 5} more in KYC queue →
                </button>
              )}
            </div>
          )}
        </div>

        {/* Expiring Documents */}
        {expiringDocs.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-5">
            <SectionHeader title="Documents Expiring Soon (30 days)" count={expiringDocs.length} icon={FileText} tone="amber" />
            <div className="space-y-2">
              {expiringDocs.slice(0, 5).map(ind => {
                const name = ind.fullNameEN || `${ind.givenNameEN} ${ind.surnameEN}`;
                const days = differenceInDays(parseISO(ind.expiredDate), today);
                return (
                  <button key={ind.id} onClick={() => onNavigate('compliance')}
                    className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-amber-50 transition text-left group">
                    <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{name}</p>
                      <p className="text-xs text-slate-400">{ind.idType} · Expires {format(parseISO(ind.expiredDate), 'MMM d, yyyy')}</p>
                    </div>
                    <span className={cn('text-xs font-bold', days <= 7 ? 'text-rose-600' : 'text-amber-600')}>
                      {days === 0 ? 'Today' : `${days}d`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Upcoming tasks (next 7 days) */}
        {upcomingTasks.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-5">
            <SectionHeader title="Upcoming Tasks (Next 7 Days)" count={upcomingTasks.length} icon={TrendingUp} tone="slate" />
            <div className="space-y-2">
              {upcomingTasks.slice(0, 5).map(t => {
                const days = differenceInDays(parseISO(t.dueDate), today);
                return (
                  <button key={t.id} onClick={() => onNavigate('tasks')}
                    className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition text-left group">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckSquare className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{t.title}</p>
                      <p className="text-xs text-slate-400">{t.category}</p>
                    </div>
                    <span className="text-xs text-slate-500 font-medium shrink-0">in {days}d</span>
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
