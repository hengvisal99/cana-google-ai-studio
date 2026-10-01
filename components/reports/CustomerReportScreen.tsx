'use client';
import React, { useState } from 'react';
import { Users, FileDown, Search, RefreshCw, MapPin, Phone, Mail, Briefcase, Building2, IdCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Individual } from '@/types';

interface CustomerReportScreenProps {
  individuals: Individual[];
}

type CustomerReportTab = 'general' | 'address' | 'phone' | 'email' | 'occupation' | 'sf';

interface Column {
  header: string;
  value: (ind: Individual) => string;
  /** Optional cell renderer; the CSV always uses `value`. */
  render?: (ind: Individual) => React.ReactNode;
  mono?: boolean;
}

const fullName = (i: Individual) => i.fullNameEN || `${i.givenNameEN} ${i.surnameEN}`;
const dash = (v: string | undefined | null) => (v && String(v).trim()) || '—';

const pill = (text: string, tone: string) => (
  <span className={cn('px-2 py-0.5 rounded-lg text-xs font-semibold capitalize', tone)}>{text}</span>
);

const ID_COLUMNS: Column[] = [
  { header: 'Customer ID', value: (i) => i.id, mono: true },
  { header: 'Full Name', value: fullName, render: (i) => <span className="font-semibold text-slate-800">{fullName(i)}</span> },
];

const TAB_COLUMNS: Record<CustomerReportTab, Column[]> = {
  general: [
    ...ID_COLUMNS,
    { header: 'Name (KH)', value: (i) => dash(i.fullNameKH || [i.surnameKH, i.givenNameKH].filter(Boolean).join(' ')) },
    { header: 'Gender', value: (i) => dash(i.gender) },
    { header: 'Date of Birth', value: (i) => dash(i.dateOfBirth) },
    { header: 'Nationality', value: (i) => dash(i.nationality) },
    { header: 'Type', value: (i) => dash(i.customerType) },
    {
      header: 'Account', value: (i) => i.accountStatus,
      render: (i) => pill(i.accountStatus, i.accountStatus === 'Active' ? 'bg-emerald-100 text-emerald-700' : i.accountStatus === 'Closed' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-500'),
    },
    {
      header: 'KYC', value: (i) => i.kycStatus,
      render: (i) => pill(i.kycStatus.replace('_', ' '), i.kycStatus === 'verified' ? 'bg-emerald-100 text-emerald-700' : i.kycStatus === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'),
    },
    {
      header: 'Risk', value: (i) => i.riskRating,
      render: (i) => pill(i.riskRating, i.riskRating === 'low' ? 'bg-emerald-100 text-emerald-700' : i.riskRating === 'high' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'),
    },
    { header: 'SR', value: (i) => dash(i.relationshipManager) },
    { header: 'Since', value: (i) => dash(i.createdAt?.slice(0, 10)) },
  ],
  address: [
    ...ID_COLUMNS,
    { header: 'Home No', value: (i) => dash(i.address?.homeNo) },
    { header: 'Street No', value: (i) => dash(i.address?.streetNo) },
    { header: 'Commune', value: (i) => dash(i.address?.commune) },
    { header: 'District / Khan', value: (i) => dash(i.address?.state) },
    { header: 'City / Province', value: (i) => dash(i.address?.city) },
    { header: 'Country', value: (i) => dash(i.address?.country) },
    { header: 'Postal Code', value: (i) => dash(i.address?.postalCode) },
  ],
  phone: [
    ...ID_COLUMNS,
    { header: 'Mobile', value: (i) => dash(i.mobile), mono: true },
    { header: 'Phone', value: (i) => dash(i.phone), mono: true },
    { header: 'Telephone', value: (i) => dash(i.telephone), mono: true },
    { header: 'Office Telephone', value: (i) => dash(i.employment?.officeTelephone), mono: true },
    { header: 'Trading Account Phone', value: (i) => dash(i.tradingAccountInfo?.phoneNumber), mono: true },
  ],
  email: [
    ...ID_COLUMNS,
    { header: 'Email', value: (i) => dash(i.email) },
    { header: 'Trading Account Email', value: (i) => dash(i.tradingAccountInfo?.email) },
    { header: 'Account', value: (i) => i.accountStatus },
    { header: 'SR', value: (i) => dash(i.relationshipManager) },
  ],
  occupation: [
    ...ID_COLUMNS,
    { header: 'Occupation', value: (i) => dash(i.employment?.occupation || i.occupation) },
    { header: 'Position', value: (i) => dash(i.employment?.position) },
    { header: 'Level', value: (i) => dash(i.employment?.levelOfPosition) },
    { header: 'Type of Business', value: (i) => dash(i.employment?.typeOfBusiness) },
    { header: 'Organization', value: (i) => dash(i.employment?.organizationName || i.employer) },
    { header: 'Length of Work', value: (i) => dash(i.employment?.lengthOfWork) },
    { header: 'Organization Address', value: (i) => dash(i.employment?.organizationAddress) },
  ],
  sf: [
    ...ID_COLUMNS,
    { header: 'Securities Firm', value: (i) => dash(i.investorIdInfo?.securitiesFirm) },
    { header: 'Investor ID', value: (i) => dash(i.investorIdInfo?.investorIdNumber), mono: true },
    { header: 'Investor Status', value: (i) => dash(i.investorIdInfo?.customerStatus) },
    { header: 'Application Date', value: (i) => dash(i.investorIdInfo?.applicationDate) },
    { header: 'Sent to SECC', value: (i) => dash(i.investorIdInfo?.dateSentToSECC) },
    { header: 'Received from SECC', value: (i) => dash(i.investorIdInfo?.dateReceivedFromSECC) },
    { header: 'Investor ID Expiry', value: (i) => dash(i.investorIdInfo?.investorIdExpiredDate) },
    { header: 'Received By', value: (i) => dash(i.investorIdInfo?.customerReceivedBy) },
  ],
};

const TABS = [
  { id: 'general' as const, label: 'General', icon: IdCard },
  { id: 'address' as const, label: 'Address', icon: MapPin },
  { id: 'phone' as const, label: 'Phone', icon: Phone },
  { id: 'email' as const, label: 'Email', icon: Mail },
  { id: 'occupation' as const, label: 'Occupation', icon: Briefcase },
  { id: 'sf' as const, label: 'Securities Firm', icon: Building2 },
];

function exportCSV(filename: string, headers: string[], rows: string[][]) {
  const lines = [headers.join(','), ...rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export function CustomerReportScreen({ individuals }: CustomerReportScreenProps) {
  const [activeTab, setActiveTab] = useState<CustomerReportTab>('general');
  const [searchQ, setSearchQ] = useState('');

  const q = searchQ.toLowerCase().trim();
  const filtered = !q ? individuals : individuals.filter((i) => fullName(i).toLowerCase().includes(q) || i.id.toLowerCase().includes(q) || i.customerType.toLowerCase().includes(q));
  const columns = TAB_COLUMNS[activeTab];

  const handleExport = () => {
    exportCSV(`customer-report-${activeTab}.csv`, columns.map((c) => c.header), filtered.map((i) => columns.map((c) => c.value(i))));
  };

  return (
    <div className="space-y-6 py-2 pb-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-md shadow-indigo-200"><Users className="w-5 h-5 text-white" /></div>
            <h1 className="text-2xl font-bold text-slate-900">Customer Report</h1>
          </div>
          <p className="text-sm text-slate-500 ml-12">Customer details by section · Export to CSV for SECC & management submissions</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 pt-1"><RefreshCw className="w-3.5 h-3.5" /><span>Live data · {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span></div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
        <div className="px-6 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-1 overflow-x-auto">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn('flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap', active ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100')}><Icon className="w-4 h-4" />{tab.label}</button>
                );
              })}
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors shadow-sm whitespace-nowrap shrink-0"
            ><FileDown className="w-4 h-4" />Export CSV</button>
          </div>
          <div className="relative max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" /><input value={searchQ} onChange={(e) => setSearchQ(e.target.value)} placeholder="Search customer…" className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition" /></div>
        </div>

        <div className="px-6 py-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-100">{columns.map((c) => <th key={c.header} className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider pb-3 pr-4 whitespace-nowrap">{c.header}</th>)}</tr></thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((ind) => (
                  <tr key={ind.id} className="hover:bg-slate-50/60 transition-colors">
                    {columns.map((c) => (
                      <td key={c.header} className={cn('py-3 pr-4 text-xs text-slate-600', c.mono && 'font-mono text-slate-500')}>
                        {c.render ? c.render(ind) : c.value(ind)}
                      </td>
                    ))}
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={columns.length} className="py-10 text-center text-sm text-slate-400">No customers match your search.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
