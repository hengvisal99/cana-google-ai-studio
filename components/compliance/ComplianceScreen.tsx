'use client';

import React, { useState, useMemo } from 'react';
import {
  ShieldCheck, AlertTriangle, Clock, Search,
  CheckCircle2, FileText, IdCard, RefreshCw, Eye,
  Users, BadgeAlert
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Individual } from '@/types';
import {
  getStaticDocumentExpiryAlerts, getInvestorIdExpiryAlerts, getKYCComplianceRows,
  type ExpiryAlert, type KYCComplianceRow,
} from '@/lib/compliance-service';

type ComplianceTab = 'document-expiry' | 'investor-id' | 'kyc-review';
type WindowFilter = '7' | '30' | '60' | '90';
interface ComplianceScreenProps { individuals: Individual[]; }

const SEVERITY_CONFIG = {
  critical: { label: 'Critical', cls: 'bg-rose-100 text-rose-700 border-rose-200', dot: 'bg-rose-500' },
  warning:  { label: 'Warning',  cls: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  upcoming: { label: 'Upcoming', cls: 'bg-blue-100 text-blue-700 border-blue-200',   dot: 'bg-blue-500' },
};
const KYC_STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  verified:     { label: 'Verified',     cls: 'bg-emerald-100 text-emerald-700' },
  pending:      { label: 'Pending',      cls: 'bg-amber-100 text-amber-700' },
  under_review: { label: 'Under Review', cls: 'bg-blue-100 text-blue-700' },
  rejected:     { label: 'Rejected',     cls: 'bg-rose-100 text-rose-700' },
};
const RISK_CONFIG: Record<string, { label: string; cls: string }> = {
  low:      { label: 'Low',      cls: 'bg-emerald-100 text-emerald-700' },
  moderate: { label: 'Moderate', cls: 'bg-amber-100 text-amber-700' },
  high:     { label: 'High',     cls: 'bg-rose-100 text-rose-700' },
};

function StatCard({ icon: Icon, label, value, sub, tone }: {
  icon: React.ElementType; label: string; value: number | string; sub?: string; tone: 'rose' | 'amber' | 'blue' | 'emerald';
}) {
  const colors = { rose: 'from-rose-500 to-rose-600 shadow-rose-200', amber: 'from-amber-500 to-amber-600 shadow-amber-200', blue: 'from-blue-500 to-indigo-600 shadow-blue-200', emerald: 'from-emerald-500 to-teal-600 shadow-emerald-200' };
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-sm flex items-center gap-4">
      <div className={cn('w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white shadow-md shrink-0', colors[tone])}><Icon className="w-5 h-5" /></div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 font-medium truncate">{label}</p>
        <p className="text-2xl font-bold text-slate-900 leading-tight">{value}</p>
        {sub && <p className="text-xs text-slate-400 truncate">{sub}</p>}
      </div>
    </div>
  );
}

function ExpiryTable({ alerts }: { alerts: ExpiryAlert[] }) {
  if (alerts.length === 0) return (
    <div className="text-center py-16"><CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" /><p className="text-slate-700 font-semibold">All clear</p><p className="text-slate-400 text-sm">No expiry alerts in the selected window.</p></div>
  );
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="border-b border-slate-100">
          {['Severity','Customer','Investor ID','Document','Expiry Date','Days Left'].map(h=><th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider pb-3 pr-4">{h}</th>)}
        </tr></thead>
        <tbody className="divide-y divide-slate-50">
          {alerts.map(alert => {
            const sev = SEVERITY_CONFIG[alert.severity];
            return (
              <tr key={`${alert.customerId}-${alert.field}`} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3.5 pr-4"><span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border', sev.cls)}><span className={cn('w-1.5 h-1.5 rounded-full shrink-0', sev.dot)} />{sev.label}</span></td>
                <td className="py-3.5 pr-4"><p className="font-semibold text-slate-800">{alert.customerName}</p><p className="text-xs text-slate-400">{alert.customerId}</p></td>
                <td className="py-3.5 pr-4 text-slate-600 font-mono text-xs">{alert.investorId}</td>
                <td className="py-3.5 pr-4 text-slate-600">{alert.label}</td>
                <td className="py-3.5 pr-4 text-slate-600">{alert.expiryDate}</td>
                <td className="py-3.5 pr-4"><span className={cn('font-bold tabular-nums', alert.daysRemaining<=0?'text-rose-600':alert.daysRemaining<=7?'text-rose-500':alert.daysRemaining<=30?'text-amber-500':'text-blue-500')}>{alert.daysRemaining<=0?'Expired':`${alert.daysRemaining}d`}</span></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function KYCReviewTable({ rows }: { rows: KYCComplianceRow[] }) {
  if (rows.length === 0) return <div className="text-center py-16"><CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" /><p className="text-slate-700 font-semibold">No results</p></div>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="border-b border-slate-100">{['Customer','Investor ID','KYC Status','Risk','PEP','Last Review','Next Due','Days Left'].map(h=><th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider pb-3 pr-4">{h}</th>)}</tr></thead>
        <tbody className="divide-y divide-slate-50">
          {rows.map(row => {
            const kyc = KYC_STATUS_CONFIG[row.kycStatus] ?? {label:row.kycStatus,cls:'bg-slate-100 text-slate-600'};
            const risk = RISK_CONFIG[row.riskRating] ?? {label:row.riskRating,cls:'bg-slate-100 text-slate-600'};
            return (
              <tr key={row.customerId} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3.5 pr-4"><p className="font-semibold text-slate-800">{row.customerName}</p><p className="text-xs text-slate-400">{row.customerId}</p></td>
                <td className="py-3.5 pr-4 text-slate-600 font-mono text-xs">{row.investorId}</td>
                <td className="py-3.5 pr-4"><span className={cn('inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold', kyc.cls)}>{kyc.label}</span></td>
                <td className="py-3.5 pr-4"><span className={cn('inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold capitalize', risk.cls)}>{risk.label}</span></td>
                <td className="py-3.5 pr-4">{row.isPEP ? <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-100 text-purple-700 text-xs font-semibold"><BadgeAlert className="w-3 h-3"/>PEP</span> : <span className="text-slate-300 text-xs">—</span>}</td>
                <td className="py-3.5 pr-4 text-slate-500 text-xs">{row.lastReviewDate}</td>
                <td className="py-3.5 pr-4 text-slate-500 text-xs">{row.nextReviewDue}</td>
                <td className="py-3.5 pr-4"><span className={cn('font-bold tabular-nums text-sm', row.daysUntilReview<=0?'text-rose-600':row.daysUntilReview<=30?'text-amber-500':row.daysUntilReview<=90?'text-blue-500':'text-slate-400')}>{row.daysUntilReview<=0?'Overdue':row.daysUntilReview<=90?`${row.daysUntilReview}d`:`${Math.round(row.daysUntilReview/30)}mo`}</span></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function ComplianceScreen({ individuals }: ComplianceScreenProps) {
  const [activeTab, setActiveTab] = useState<ComplianceTab>('document-expiry');
  const [searchQuery, setSearchQuery] = useState('');
  const [windowFilter, setWindowFilter] = useState<WindowFilter>('90');
  const windowDays = parseInt(windowFilter, 10);
  const docAlerts = useMemo(()=>getStaticDocumentExpiryAlerts(windowDays),[windowDays]);
  const idAlerts  = useMemo(()=>getInvestorIdExpiryAlerts(individuals,windowDays),[individuals,windowDays]);
  const kycRows   = useMemo(()=>getKYCComplianceRows(individuals),[individuals]);
  const criticalDoc = docAlerts.filter(a=>a.severity==='critical').length;
  const criticalId  = idAlerts.filter(a=>a.severity==='critical').length;
  const overdueDue  = kycRows.filter(r=>r.daysUntilReview<=0).length;
  const pepCount    = kycRows.filter(r=>r.isPEP).length;
  const pendingKYC  = kycRows.filter(r=>r.kycStatus==='pending'||r.kycStatus==='under_review').length;
  const q = searchQuery.toLowerCase().trim();
  const filteredDocAlerts = !q ? docAlerts : docAlerts.filter(a=>a.customerName.toLowerCase().includes(q)||a.customerId.toLowerCase().includes(q));
  const filteredIdAlerts  = !q ? idAlerts  : idAlerts.filter(a=>a.customerName.toLowerCase().includes(q)||a.customerId.toLowerCase().includes(q));
  const filteredKycRows   = !q ? kycRows   : kycRows.filter(r=>r.customerName.toLowerCase().includes(q)||r.customerId.toLowerCase().includes(q));
  const TABS = [
    {id:'document-expiry' as const, label:'Document Expiry',     icon:FileText,    count:docAlerts.length, urgent:criticalDoc},
    {id:'investor-id'     as const, label:'Investor ID Expiry',  icon:IdCard,      count:idAlerts.length,  urgent:criticalId},
    {id:'kyc-review'      as const, label:'KYC / Periodic Review',icon:ShieldCheck, count:kycRows.length,   urgent:overdueDue},
  ];
  return (
    <div className="space-y-6 py-2 pb-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center shadow-md shadow-rose-200"><ShieldCheck className="w-5 h-5 text-white" /></div>
            <h1 className="text-2xl font-bold text-slate-900">Compliance Tracker</h1>
          </div>
          <p className="text-sm text-slate-500 ml-12">Document expiry · SECC Investor ID renewals · KYC review schedules</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 pt-1"><RefreshCw className="w-3.5 h-3.5" /><span>Live · {new Date().toLocaleDateString('en-US',{day:'numeric',month:'short',year:'numeric'})}</span></div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={AlertTriangle} label="Critical Expiries" value={criticalDoc+criticalId} sub="Expire within 7 days" tone="rose" />
        <StatCard icon={Clock} label="KYC Reviews Overdue" value={overdueDue} sub="Past scheduled date" tone="amber" />
        <StatCard icon={BadgeAlert} label="PEP Customers" value={pepCount} sub="Enhanced due diligence" tone="blue" />
        <StatCard icon={Users} label="KYC Pending" value={pendingKYC} sub="Awaiting verification" tone="emerald" />
      </div>
      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
        <div className="px-6 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-1 mb-4 overflow-x-auto">
            {TABS.map(tab=>{const Icon=tab.icon;const active=activeTab===tab.id;return(
              <button key={tab.id} onClick={()=>setActiveTab(tab.id)} className={cn('flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap',active?'bg-slate-900 text-white shadow-md':'text-slate-600 hover:bg-slate-100')}>
                <Icon className="w-4 h-4"/>{tab.label}
                {tab.urgent>0&&<span className={cn('text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center',active?'bg-rose-500 text-white':'bg-rose-100 text-rose-600')}>{tab.urgent}</span>}
                {tab.urgent===0&&tab.count>0&&<span className={cn('text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center',active?'bg-white/20 text-white':'bg-slate-100 text-slate-500')}>{tab.count}</span>}
              </button>
            );})}
          </div>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400"/><input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Search customer name or ID…" className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"/></div>
            {activeTab!=='kyc-review'&&<div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">{(['7','30','60','90'] as WindowFilter[]).map(w=><button key={w} onClick={()=>setWindowFilter(w)} className={cn('px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',windowFilter===w?'bg-white text-slate-900 shadow-sm':'text-slate-500 hover:text-slate-800')}>{w}d</button>)}</div>}
          </div>
        </div>
        <div className="px-6 py-4">
          {activeTab==='document-expiry'&&<ExpiryTable alerts={filteredDocAlerts}/>}
          {activeTab==='investor-id'&&<ExpiryTable alerts={filteredIdAlerts}/>}
          {activeTab==='kyc-review'&&<KYCReviewTable rows={filteredKycRows}/>}
        </div>
      </div>
    </div>
  );
}