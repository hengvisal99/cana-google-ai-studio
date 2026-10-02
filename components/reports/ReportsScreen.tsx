'use client';
import React, { useState, useMemo } from 'react';
import { BarChart3, FileDown, Users, UserCheck, UserPlus, Calendar, Search, Filter, ChevronDown, Printer, RefreshCw, TrendingUp, Activity, Shield, Layers, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Individual, CustomerTypeRecord } from '@/types';

interface ReportsScreenProps {
  individuals: Individual[];
  customerTypeRecords: CustomerTypeRecord[];
}

type ReportTab = 'customer' | 'kyc' | 'product' | 'activity';

function exportCSV(filename: string, headers: string[], rows: (string|number)[][]) {
  const lines = [headers.join(','), ...rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(','))];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function StatBadge({ label, value, tone }: { label: string; value: string|number; tone: string }) {
  const tones: Record<string,string> = { blue: 'text-blue-700 border-blue-200', green: 'text-emerald-700 border-emerald-200', amber: 'text-amber-700 border-amber-200', rose: 'text-rose-700 border-rose-200', slate: 'text-slate-600 border-slate-200' };
  return <div className={cn('rounded-2xl border bg-white shadow-2xs px-4 py-3 flex flex-col gap-1',tones[tone]||tones.slate)}><span className="text-xs font-medium opacity-70">{label}</span><span className="text-xl font-bold">{value}</span></div>;
}

export function ReportsScreen({ individuals, customerTypeRecords }: ReportsScreenProps) {
  const [activeTab, setActiveTab] = useState<ReportTab>('customer');
  const [searchQ, setSearchQ] = useState('');

  const activeCount    = individuals.filter(i=>i.accountStatus==='Active').length;
  const inactiveCount  = individuals.filter(i=>i.accountStatus==='Not Opened').length;
  const closedCount    = individuals.filter(i=>i.accountStatus==='Closed').length;
  const verifiedCount  = individuals.filter(i=>i.kycStatus==='verified').length;
  const pendingKYC     = individuals.filter(i=>i.kycStatus==='pending'||i.kycStatus==='under_review').length;
  const highRiskCount  = individuals.filter(i=>i.riskRating==='high').length;

  const q = searchQ.toLowerCase().trim();
  const filteredInds = !q ? individuals : individuals.filter(i=>(i.fullNameEN||i.givenNameEN+' '+i.surnameEN).toLowerCase().includes(q)||i.id.toLowerCase().includes(q)||i.customerType.toLowerCase().includes(q));

  const TABS = [
    { id: 'customer' as const, label: 'Customer Report', icon: Users },
    { id: 'kyc'      as const, label: 'KYC / Risk',      icon: Shield },
    { id: 'product'  as const, label: 'Product Adoption',icon: Layers },
    { id: 'activity' as const, label: 'Activity Log',    icon: Activity },
  ];

  const handleExportCustomer = () => {
    const headers = ['Customer ID','Full Name','Customer Type','Account Status','KYC Status','Risk Rating','Branch','Relationship Manager','Created At'];
    const rows = filteredInds.map(i=>[i.id,i.fullNameEN||i.givenNameEN+' '+i.surnameEN,i.customerType,i.accountStatus,i.kycStatus,i.riskRating,i.branch||'—',i.relationshipManager||'—',i.createdAt?.slice(0,10)||'—']);
    exportCSV('customer-report.csv',headers,rows);
  };

  const handleExportKYC = () => {
    const headers = ['Customer ID','Full Name','KYC Status','Risk Rating','ID Type','ID Expiry','Investor ID','Investor ID Expiry'];
    const rows = individuals.map(i=>[i.id,i.fullNameEN||i.givenNameEN+' '+i.surnameEN,i.kycStatus,i.riskRating,i.idType||'—',i.expiredDate||'—',i.investorIdInfo?.investorIdNumber||'—',i.investorIdInfo?.investorIdExpiredDate||'—']);
    exportCSV('kyc-risk-report.csv',headers,rows);
  };

  const handleExportProduct = () => {
    const typeCount: Record<string,number> = {};
    customerTypeRecords.forEach(r=>{typeCount[r.typeId]=(typeCount[r.typeId]||0)+1;});
    const headers = ['Product Type','Records Count'];
    const rows = Object.entries(typeCount).map(([t,c])=>[t,c]);
    exportCSV('product-adoption.csv',headers,rows);
  };

  const productTypes = useMemo(()=>{
    const counts: Record<string,{name:string;count:number;active:number}> = {};
    customerTypeRecords.forEach(r=>{
      if(!counts[r.typeId]) counts[r.typeId]={name:r.typeId,count:0,active:0};
      counts[r.typeId].count++;
      if(r.values.status==='Active') counts[r.typeId].active++;
    });
    return Object.values(counts).sort((a,b)=>b.count-a.count);
  },[customerTypeRecords]);

  const TYPE_LABELS: Record<string,string> = { 'csx-screen':'CSX Screen','client-card':'Client Card','employee-trading':'Employee Trading','vip-customer':'VIP Customer','ipo-customer':'IPO Customer','personal-representative':'Personal Representative' };

  return (
    <div className="space-y-6 py-2 pb-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-md shadow-indigo-200"><BarChart3 className="w-5 h-5 text-white"/></div>
            <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
          </div>
          <p className="text-sm text-slate-500 ml-12">Operational reports · Export to CSV for SECC & management submissions</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 pt-1"><RefreshCw className="w-3.5 h-3.5"/><span>Live data · {new Date().toLocaleDateString('en-US',{day:'numeric',month:'short',year:'numeric'})}</span></div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        <StatBadge label="Total Customers" value={individuals.length} tone="blue"/>
        <StatBadge label="Active Accounts" value={activeCount} tone="green"/>
        <StatBadge label="Not Opened" value={inactiveCount} tone="amber"/>
        <StatBadge label="Closed" value={closedCount} tone="rose"/>
        <StatBadge label="KYC Verified" value={verifiedCount} tone="green"/>
        <StatBadge label="High Risk" value={highRiskCount} tone="rose"/>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
        <div className="px-6 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-1 overflow-x-auto">
              {TABS.map(tab=>{const Icon=tab.icon;const active=activeTab===tab.id;return(
                <button key={tab.id} onClick={()=>setActiveTab(tab.id)} className={cn('flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap',active?'bg-slate-900 text-white shadow-md':'text-slate-600 hover:bg-slate-100')}><Icon className="w-4 h-4"/>{tab.label}</button>
              );})}
            </div>
            <button
              onClick={()=>{if(activeTab==='customer')handleExportCustomer();else if(activeTab==='kyc')handleExportKYC();else if(activeTab==='product')handleExportProduct();}}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors shadow-sm whitespace-nowrap shrink-0"
            ><FileDown className="w-4 h-4"/>Export CSV</button>
          </div>
          <div className="relative max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400"/><input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Search customer…" className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"/></div>
        </div>

        <div className="px-6 py-4">
          {activeTab==='customer'&&(
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-100">{['Customer ID','Full Name','Type','Account','KYC','Risk','SR','Since'].map(h=><th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider pb-3 pr-4">{h}</th>)}</tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredInds.map(ind=>(
                    <tr key={ind.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 pr-4 font-mono text-xs text-slate-500">{ind.id}</td>
                      <td className="py-3 pr-4 font-semibold text-slate-800">{ind.fullNameEN||ind.givenNameEN+' '+ind.surnameEN}</td>
                      <td className="py-3 pr-4 text-slate-600 text-xs">{ind.customerType}</td>
                      <td className="py-3 pr-4"><span className={cn('px-2 py-0.5 rounded-lg text-xs font-semibold',ind.accountStatus==='Active'?'bg-emerald-100 text-emerald-700':ind.accountStatus==='Closed'?'bg-rose-100 text-rose-700':'bg-slate-100 text-slate-500')}>{ind.accountStatus}</span></td>
                      <td className="py-3 pr-4"><span className={cn('px-2 py-0.5 rounded-lg text-xs font-semibold capitalize',ind.kycStatus==='verified'?'bg-emerald-100 text-emerald-700':ind.kycStatus==='rejected'?'bg-rose-100 text-rose-700':'bg-amber-100 text-amber-700')}>{ind.kycStatus.replace('_',' ')}</span></td>
                      <td className="py-3 pr-4"><span className={cn('px-2 py-0.5 rounded-lg text-xs font-semibold capitalize',ind.riskRating==='low'?'bg-emerald-100 text-emerald-700':ind.riskRating==='high'?'bg-rose-100 text-rose-700':'bg-amber-100 text-amber-700')}>{ind.riskRating}</span></td>
                      <td className="py-3 pr-4 text-slate-500 text-xs truncate max-w-[120px]">{ind.relationshipManager||'—'}</td>
                      <td className="py-3 pr-4 text-slate-400 text-xs">{ind.createdAt?.slice(0,10)||'—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab==='kyc'&&(
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-100">{['Customer','KYC Status','Risk Rating','ID Type','ID Expiry','Investor ID','SECC ID Expiry'].map(h=><th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider pb-3 pr-4">{h}</th>)}</tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {individuals.map(ind=>(
                    <tr key={ind.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 pr-4"><p className="font-semibold text-slate-800 text-sm">{ind.fullNameEN||ind.givenNameEN+' '+ind.surnameEN}</p><p className="text-xs text-slate-400">{ind.id}</p></td>
                      <td className="py-3 pr-4"><span className={cn('px-2.5 py-1 rounded-lg text-xs font-semibold capitalize',ind.kycStatus==='verified'?'bg-emerald-100 text-emerald-700':ind.kycStatus==='rejected'?'bg-rose-100 text-rose-700':'bg-amber-100 text-amber-700')}>{ind.kycStatus.replace('_',' ')}</span></td>
                      <td className="py-3 pr-4"><span className={cn('px-2.5 py-1 rounded-lg text-xs font-semibold capitalize',ind.riskRating==='low'?'bg-emerald-100 text-emerald-700':ind.riskRating==='high'?'bg-rose-100 text-rose-700':'bg-amber-100 text-amber-700')}>{ind.riskRating}</span></td>
                      <td className="py-3 pr-4 text-slate-600 text-xs">{ind.idType||'—'}</td>
                      <td className="py-3 pr-4 text-slate-600 text-xs">{ind.expiredDate||'—'}</td>
                      <td className="py-3 pr-4 text-slate-600 font-mono text-xs">{ind.investorIdInfo?.investorIdNumber||'—'}</td>
                      <td className="py-3 pr-4 text-slate-600 text-xs">{ind.investorIdInfo?.investorIdExpiredDate||'—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab==='product'&&(
            <div className="space-y-3">
              {productTypes.map(pt=>(
                <div key={pt.name} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:bg-slate-50/60 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800">{TYPE_LABELS[pt.name]||pt.name}</p>
                    <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all" style={{width:`${Math.min(100,(pt.count/Math.max(...productTypes.map(p=>p.count)))*100)}%`}}/>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xl font-bold text-slate-900">{pt.count}</p>
                    <p className="text-xs text-emerald-600 font-semibold">{pt.active} Active</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab==='activity'&&(
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-100">{['Customer','Request Type','Status','Current Stage','Last Updated','SR'].map(h=><th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider pb-3 pr-4">{h}</th>)}</tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {individuals.filter(i=>i.authorizationHistory?.length>0).slice(0,50).map(ind=>(
                    <tr key={ind.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 pr-4"><p className="font-semibold text-slate-800">{ind.fullNameEN||ind.givenNameEN}</p><p className="text-xs text-slate-400">{ind.id}</p></td>
                      <td className="py-3 pr-4 text-slate-600 text-xs">{ind.requestType}</td>
                      <td className="py-3 pr-4"><span className={cn('px-2.5 py-1 rounded-lg text-xs font-semibold',ind.requestStatus==='Approved'?'bg-emerald-100 text-emerald-700':ind.requestStatus==='Rejected'?'bg-rose-100 text-rose-700':ind.requestStatus==='Resubmit'?'bg-orange-100 text-orange-700':'bg-amber-100 text-amber-700')}>{ind.requestStatus}</span></td>
                      <td className="py-3 pr-4 text-slate-600 text-xs">{ind.currentWorkflowStage}</td>
                      <td className="py-3 pr-4 text-slate-400 text-xs">{ind.authorizationHistory?.[ind.authorizationHistory.length-1]?.dateTime||'—'}</td>
                      <td className="py-3 pr-4 text-slate-500 text-xs">{ind.tradingAccountInfo?.currentAssignedSR||'—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}