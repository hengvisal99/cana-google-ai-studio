'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { Individual, DesignTheme } from '@/types';
import { getCustomer360Details } from '@/lib/customer360Service';
import { 
  Search, 
  Printer, 
  Briefcase, 
  Phone, 
  Mail, 
  MapPin, 
  TrendingUp, 
  Calendar, 
  Layers, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Check, 
  ChevronRight, 
  DollarSign, 
  X, 
  Filter, 
  History, 
  Eye, 
  Edit3, 
  Sparkles,
  ArrowUpRight,
  CreditCard,
  Building2,
  FileCheck,
  UserCheck,
  UserPlus,
  LayoutList,
  GitCommit,
  Split
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Customer360ScreenProps {
  individuals: Individual[];
  selectedCustomerId: string;
  onSelectCustomer: (id: string) => void;
  onViewIndividual: (individual: Individual) => void;
  onNavigateToUpdate: (individual: Individual) => void;
  theme: DesignTheme;
}

export function Customer360Screen({
  individuals,
  selectedCustomerId,
  onSelectCustomer,
  onViewIndividual,
  onNavigateToUpdate,
  theme,
}: Customer360ScreenProps) {
  // Left Sidebar State
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [customerTab, setCustomerTab] = useState<'ALL' | 'ACTIVE' | 'CLOSED'>('ALL');

  // Transaction History Filters
  const [selectedIpoFilter, setSelectedIpoFilter] = useState<string>('ALL');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('ALL');

  // Product View Mode Toggle
  const [productViewMode, setProductViewMode] = useState<'table' | 'cards'>('table');
  const [timelineLayout, setTimelineLayout] = useState<'vertical' | 'stepper' | 'bar'>('vertical');

  // Active customer resolution
  const activeIndividual = useMemo(() => {
    return individuals.find((ind) => ind.id === selectedCustomerId || ind.customerId === selectedCustomerId) || individuals[0] || null;
  }, [individuals, selectedCustomerId]);

  // Complete Customer 360 data package
  const customer360Data = useMemo(() => {
    if (!activeIndividual) return null;
    return getCustomer360Details(activeIndividual);
  }, [activeIndividual]);

  // Tab counts for the sidebar
  const countAll = individuals.length;
  const countActive = useMemo(() => {
    return individuals.filter(i => i.accountStatus === 'Active' || (!i.accountStatus && i.requestStatus === 'Approved')).length;
  }, [individuals]);
  const countClosed = useMemo(() => {
    return individuals.filter(i => i.accountStatus === 'Closed' || i.requestType === 'Close Account').length;
  }, [individuals]);

  // Filtered sidebar customer list
  const filteredCustomers = useMemo(() => {
    return individuals.filter((ind) => {
      // Tab filter
      if (customerTab === 'ACTIVE') {
        const isActive = ind.accountStatus === 'Active' || (!ind.accountStatus && ind.requestStatus === 'Approved');
        if (!isActive) return false;
      } else if (customerTab === 'CLOSED') {
        const isClosed = ind.accountStatus === 'Closed' || ind.requestType === 'Close Account';
        if (!isClosed) return false;
      }

      // Search filter: Customer ID (CID) or Full Name
      if (sidebarSearch.trim() !== '') {
        const query = sidebarSearch.toLowerCase();
        const cid = (ind.customerId || ind.id).toLowerCase();
        const fullNameEn = (ind.fullNameEN || `${ind.firstName} ${ind.lastName}`).toLowerCase();
        const fullNameKh = (ind.fullNameKH || `${ind.surnameKH || ''} ${ind.givenNameKH || ''}`).toLowerCase();
        
        const matchesCid = cid.includes(query);
        const matchesName = fullNameEn.includes(query) || fullNameKh.includes(query);

        if (!matchesCid && !matchesName) return false;
      }

      return true;
    });
  }, [individuals, customerTab, sidebarSearch]);

  // Unique IPO list for filter dropdown
  const ipoOptions = useMemo(() => {
    if (!customer360Data) return [];
    const set = new Set(customer360Data.transactions.map(t => t.ipoName));
    return Array.from(set);
  }, [customer360Data]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    if (!customer360Data) return [];
    return customer360Data.transactions.filter((tx) => {
      // IPO Name filter
      if (selectedIpoFilter !== 'ALL' && tx.ipoName !== selectedIpoFilter) {
        return false;
      }

      // Date Range filter
      if (selectedDateRange === '2026' && !tx.dateTime.includes('2026')) {
        return false;
      }
      if (selectedDateRange === '2025' && !tx.dateTime.includes('2025')) {
        return false;
      }
      if (selectedDateRange === 'JAN_2026' && !tx.dateTime.includes('Jan 2026')) {
        return false;
      }

      return true;
    });
  }, [customer360Data, selectedIpoFilter, selectedDateRange]);

  // Print Dossier Action
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  if (!activeIndividual || !customer360Data) {
    return (
      <div className="p-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
        No customer profile available.
      </div>
    );
  }

  // Derived display values
  const displayNameKH = activeIndividual.fullNameKH || `${activeIndividual.surnameKH || 'គឹម'} ${activeIndividual.givenNameKH || 'សុផល'}`;
  const displayNameEN = activeIndividual.fullNameEN || `${activeIndividual.firstName} ${activeIndividual.lastName}`;
  const displayCID = activeIndividual.customerId || activeIndividual.id;
  const displayOccupation = activeIndividual.employment?.occupation || activeIndividual.occupation || 'Senior Securities Investor';
  const displayPhone = activeIndividual.mobile || activeIndividual.phone || activeIndividual.tradingAccountInfo?.phoneNumber || '+855 12 892 340';
  const displayEmail = activeIndividual.email || activeIndividual.tradingAccountInfo?.email || 'customer@nexus-securities.com.kh';
  const displayAddress = activeIndividual.employment?.organizationAddress || activeIndividual.residency || 'Street 214, Sangkat Boeung Raing, Phnom Penh';

  return (
    <div id="customer-360-screen" className="space-y-5 print:p-0 print:space-y-3">
      {/* Print styles for clean presentation */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          #customer-360-left-sidebar,
          nav,
          header,
          #theme-switcher-button,
          button:not(#c360-print-btn) {
            display: none !important;
          }
          #customer-360-screen {
            display: block !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .print-full-width {
            width: 100% !important;
            grid-column: span 12 !important;
          }
        }
      `}</style>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* =========================================================================
            1. LEFT SIDEBAR: CUSTOMER LIST
           ========================================================================= */}
        <aside
          id="customer-360-left-sidebar"
          aria-label="Customer 360 Customer List"
          className={cn(
            'lg:col-span-4 xl:col-span-3 bg-white border border-slate-200 overflow-hidden flex flex-col',
            theme === 'glassmorphism'
              ? 'rounded-2xl bg-white/85 backdrop-blur-xl border-white/80 shadow-md'
              : theme === 'aurora'
              ? 'rounded-2xl border-slate-200 shadow-md ring-1 ring-blue-500/10'
              : 'rounded-xl shadow-xs'
          )}
        >
          {/* Sidebar Header & Search Group */}
          <div className="p-3.5 border-b border-slate-200 bg-slate-50/70 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider block">
                  Customer Directory
                </span>
                <h3 className="text-sm font-bold text-slate-900">Customer 360</h3>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-blue-100 text-blue-800">
                {filteredCustomers.length} Listed
              </span>
            </div>

            {/* Search: Customer ID (CID) & Full Name */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="sidebar-customer-search-input"
                type="text"
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
                placeholder="Search CID or Full Name..."
                className="w-full pl-9 pr-7 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
              {sidebarSearch && (
                <button
                  type="button"
                  onClick={() => setSidebarSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Customer Tabs: All | Active | Closed */}
            <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-lg">
              <button
                type="button"
                id="tab-customers-all"
                onClick={() => setCustomerTab('ALL')}
                className={cn(
                  'flex-1 py-1.5 px-2 text-center text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5',
                  customerTab === 'ALL'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                <span>All</span>
                <span className={cn(
                  'text-[10px] px-1.5 py-0.2 rounded-full font-bold',
                  customerTab === 'ALL' ? 'bg-slate-100 text-slate-700' : 'bg-slate-300/60 text-slate-600'
                )}>
                  {countAll}
                </span>
              </button>

              <button
                type="button"
                id="tab-customers-active"
                onClick={() => setCustomerTab('ACTIVE')}
                className={cn(
                  'flex-1 py-1.5 px-2 text-center text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5',
                  customerTab === 'ACTIVE'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                <span>Active</span>
                <span className={cn(
                  'text-[10px] px-1.5 py-0.2 rounded-full font-bold',
                  customerTab === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-300/60 text-slate-600'
                )}>
                  {countActive}
                </span>
              </button>

              <button
                type="button"
                id="tab-customers-closed"
                onClick={() => setCustomerTab('CLOSED')}
                className={cn(
                  'flex-1 py-1.5 px-2 text-center text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5',
                  customerTab === 'CLOSED'
                    ? 'bg-white text-rose-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                <span>Closed</span>
                <span className={cn(
                  'text-[10px] px-1.5 py-0.2 rounded-full font-bold',
                  customerTab === 'CLOSED' ? 'bg-rose-100 text-rose-800' : 'bg-slate-300/60 text-slate-600'
                )}>
                  {countClosed}
                </span>
              </button>
            </div>
          </div>

          {/* Customer List Items */}
          <div className="divide-y divide-slate-100 max-h-[calc(100vh-250px)] min-h-[460px] overflow-y-auto">
            {filteredCustomers.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No matching customer found.
              </div>
            ) : (
              filteredCustomers.map((ind) => {
                const isSelected = ind.id === activeIndividual.id;
                const status = ind.accountStatus || (ind.requestStatus === 'Approved' ? 'Active' : 'Not Opened');
                const portVal = ind.totalDeposits > 0 ? ind.totalDeposits : 125000;
                
                return (
                  <button
                    key={ind.id}
                    id={`sidebar-customer-item-${ind.id}`}
                    type="button"
                    onClick={() => onSelectCustomer(ind.id)}
                    className={cn(
                      'w-full text-left p-3.5 transition-all flex items-start gap-3 relative group cursor-pointer',
                      isSelected
                        ? 'bg-blue-50/90 text-blue-950 font-medium'
                        : 'hover:bg-slate-50/80 text-slate-700'
                    )}
                  >
                    {/* Active accent bar */}
                    {isSelected && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r" />
                    )}

                    {/* Profile Photo */}
                    <div className="relative shrink-0 mt-0.5">
                      <Image
                        src={ind.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                        alt={ind.firstName}
                        width={40}
                        height={40}
                        className={cn(
                          'w-10 h-10 rounded-full object-cover border',
                          isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-slate-200'
                        )}
                        referrerPolicy="no-referrer"
                        unoptimized
                      />
                      <span className={cn(
                        'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white',
                        status === 'Active' ? 'bg-emerald-500' : status === 'Closed' ? 'bg-rose-500' : 'bg-amber-500'
                      )} />
                    </div>

                    {/* Customer Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className={cn(
                          'text-xs font-bold truncate',
                          isSelected ? 'text-blue-700' : 'text-slate-900 group-hover:text-blue-600'
                        )}>
                          {ind.fullNameEN || `${ind.firstName} ${ind.lastName}`}
                        </span>
                        <span className={cn(
                          'text-[10px] font-bold px-1.5 py-0.2 rounded shrink-0',
                          status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : status === 'Closed'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        )}>
                          {status}
                        </span>
                      </div>

                      {/* Khmer name and CID */}
                      <div className="flex items-center justify-between mt-0.5 text-[11px] text-slate-500">
                        <span className="truncate">{ind.fullNameKH || `${ind.surnameKH || ''} ${ind.givenNameKH || ''}`}</span>
                        <span className="font-mono text-[10px] text-slate-400 font-semibold ml-1 shrink-0">
                          {ind.customerId || ind.id}
                        </span>
                      </div>

                      {/* Portfolio Value */}
                      <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-slate-100 text-[11px]">
                        <span className="text-slate-400 text-[10px] uppercase font-semibold">Portfolio</span>
                        <span className="font-mono font-bold text-slate-800">
                          ${portVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* =========================================================================
            RIGHT CONTENT AREA: CUSTOMER 360 DETAILS
           ========================================================================= */}
        <main className="lg:col-span-8 xl:col-span-9 space-y-5 print-full-width">
          {/* =======================================================================
              2. CUSTOMER 360 HEADER
             ======================================================================= */}
          <section
            id="c360-profile-header-section"
            className={cn(
              'p-6 bg-white border border-slate-200 relative overflow-hidden',
              theme === 'glassmorphism'
                ? 'rounded-2xl bg-white/85 backdrop-blur-xl border-white/80 shadow-md'
                : theme === 'aurora'
                ? 'rounded-2xl border-slate-200 shadow-md'
                : 'rounded-xl shadow-xs'
            )}
          >
            {theme === 'aurora' && (
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500" />
            )}

            {/* Profile Row: Photo, Names, CID, Badges, Print Button */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-5 border-b border-slate-100">
              <div className="flex items-start gap-4">
                {/* Profile Photo */}
                <div className="relative shrink-0">
                  <Image
                    src={activeIndividual.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={displayNameEN}
                    width={72}
                    height={72}
                    className="w-18 h-18 rounded-2xl object-cover border-2 border-white shadow-md ring-2 ring-blue-100"
                    referrerPolicy="no-referrer"
                    unoptimized
                  />
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white bg-emerald-500" />
                </div>

                {/* Names & Metadata */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                      {displayNameKH}
                    </h1>
                    <span className="text-slate-300">•</span>
                    <h2 className="text-lg font-semibold text-slate-800">
                      {displayNameEN}
                    </h2>
                    <span className="px-2.5 py-0.5 font-mono text-xs font-bold rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                      {displayCID}
                    </span>
                  </div>

                  {/* Badges: Risk Category & Customer Type */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      <ShieldCheck className="w-3 h-3 text-blue-600" />
                      Risk: {activeIndividual.riskCategory || 'Moderate'}
                    </span>

                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                      <UserCheck className="w-3 h-3 text-purple-600" />
                      Type: {activeIndividual.customerType || 'Retail'}
                    </span>

                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Status: {activeIndividual.accountStatus || 'Active'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Print Button & Quick Actions */}
              <div className="flex items-center gap-2 flex-wrap shrink-0">
                <button
                  type="button"
                  id="c360-view-dialog-btn"
                  onClick={() => onViewIndividual(activeIndividual)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                  title="View complete form dialog"
                >
                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                  <span>View Form</span>
                </button>

                <button
                  type="button"
                  id="c360-edit-screen-btn"
                  onClick={() => onNavigateToUpdate(activeIndividual)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition"
                  title="Edit Customer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Edit</span>
                </button>

                {/* Explicit Print Button requested in spec */}
                <button
                  type="button"
                  id="c360-print-btn"
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-xs transition"
                  title="Print Customer 360 Dossier"
                >
                  <Printer className="w-4 h-4 text-white" />
                  <span>Print</span>
                </button>
              </div>
            </div>

            {/* Contact Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Occupation
                  </span>
                  <span className="text-xs font-bold text-slate-800 truncate block mt-0.5" title={displayOccupation}>
                    {displayOccupation}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Phone Number
                  </span>
                  <span className="text-xs font-bold text-slate-800 truncate block mt-0.5">
                    {displayPhone}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Email
                  </span>
                  <span className="text-xs font-bold text-slate-800 truncate block mt-0.5" title={displayEmail}>
                    {displayEmail}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-600 shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Address
                  </span>
                  <span className="text-xs font-bold text-slate-800 truncate block mt-0.5" title={displayAddress}>
                    {displayAddress}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* =======================================================================
              3. SUMMARY: FOUR KPI CARDS
             ======================================================================= */}
          <section id="c360-summary-kpi-section" aria-label="Summary KPIs">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {/* Card 1: Portfolio Value */}
              <div className={cn(
                'p-4 bg-white border border-slate-200 transition-all hover:shadow-sm',
                theme === 'glassmorphism'
                  ? 'rounded-2xl bg-white/85 backdrop-blur-md'
                  : 'rounded-xl shadow-2xs'
              )}>
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Portfolio Value
                  </span>
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <TrendingUp className="w-3 h-3 text-emerald-600" />
                    {customer360Data.kpis.portfolioValue.growthPercentage}
                  </span>
                </div>
                <div className="text-xl font-extrabold text-blue-700 tracking-tight mt-1">
                  {customer360Data.kpis.portfolioValue.formatted}
                </div>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                  <span>Currency: <strong>{customer360Data.kpis.portfolioValue.currency}</strong></span>
                  <span className="text-emerald-600 font-semibold">Performing Well</span>
                </div>
              </div>

              {/* Card 2: Trading Value */}
              <div className={cn(
                'p-4 bg-white border border-slate-200 transition-all hover:shadow-sm',
                theme === 'glassmorphism'
                  ? 'rounded-2xl bg-white/85 backdrop-blur-md'
                  : 'rounded-xl shadow-2xs'
              )}>
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Trading Value
                  </span>
                  <DollarSign className="w-4 h-4 text-slate-400" />
                </div>
                <div className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">
                  {customer360Data.kpis.tradingValue.formatted}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{customer360Data.kpis.tradingValue.dateRange}</span>
                </div>
              </div>

              {/* Card 3: Total Trading */}
              <div className={cn(
                'p-4 bg-white border border-slate-200 transition-all hover:shadow-sm',
                theme === 'glassmorphism'
                  ? 'rounded-2xl bg-white/85 backdrop-blur-md'
                  : 'rounded-xl shadow-2xs'
              )}>
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Total Trading
                  </span>
                  <History className="w-4 h-4 text-slate-400" />
                </div>
                <div className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">
                  {customer360Data.kpis.totalTrading.formatted}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{customer360Data.kpis.totalTrading.dateRange}</span>
                </div>
              </div>

              {/* Card 4: IPOs Held */}
              <div className={cn(
                'p-4 bg-white border border-slate-200 transition-all hover:shadow-sm',
                theme === 'glassmorphism'
                  ? 'rounded-2xl bg-white/85 backdrop-blur-md'
                  : 'rounded-xl shadow-2xs'
              )}>
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    IPOs Held
                  </span>
                  <Layers className="w-4 h-4 text-slate-400" />
                </div>
                <div className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">
                  {customer360Data.kpis.iposHeld.formatted}
                </div>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                  <span className="text-blue-600 font-bold">{customer360Data.kpis.iposHeld.subscriptionFormatted}</span>
                  <span className="text-[10px] text-slate-400">Total Allotted</span>
                </div>
              </div>
            </div>
          </section>

          {/* =======================================================================
              4. PRODUCT PORTFOLIO
             ======================================================================= */}
          <section
            id="c360-product-portfolio-section"
            className={cn(
              'p-5 bg-white border border-slate-200',
              theme === 'glassmorphism'
                ? 'rounded-2xl bg-white/85 backdrop-blur-md shadow-xs'
                : 'rounded-xl shadow-xs'
            )}
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Product Portfolio</h3>
                  <p className="text-[11px] text-slate-400">All registered products & securities subscriptions</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
                  <button
                    type="button"
                    onClick={() => setProductViewMode('table')}
                    className={cn(
                      'px-2.5 py-1 font-semibold rounded-md transition',
                      productViewMode === 'table' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    )}
                  >
                    Table
                  </button>
                  <button
                    type="button"
                    onClick={() => setProductViewMode('cards')}
                    className={cn(
                      'px-2.5 py-1 font-semibold rounded-md transition',
                      productViewMode === 'cards' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    )}
                  >
                    Cards
                  </button>
                </div>
              </div>
            </div>

            {/* Product Table View */}
            {productViewMode === 'table' ? (
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      <th className="py-3 px-4">Product</th>
                      <th className="py-3 px-4">ID</th>
                      <th className="py-3 px-4">Valid From</th>
                      <th className="py-3 px-4">Valid To</th>
                      <th className="py-3 px-4 text-right">Expiry</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {customer360Data.products.map((prod) => (
                      <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                          <span>{prod.productName}</span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-semibold text-slate-600">
                          {prod.productId}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {prod.validFrom}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {prod.validTo}
                        </td>
                        <td className="py-3.5 px-4 text-right font-medium text-slate-700">
                          {prod.expiryDays}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={cn(
                            'inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold',
                            prod.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : prod.status === 'Expiring Soon'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          )}>
                            {prod.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Product Cards View */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {customer360Data.products.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900 block">{prod.productName}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                        {prod.status}
                      </span>
                    </div>

                    <div className="font-mono text-[11px] font-semibold text-blue-600">
                      {prod.productId}
                    </div>

                    <div className="text-[11px] text-slate-500 space-y-0.5 pt-1 border-t border-slate-200/80">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Valid From:</span>
                        <span>{prod.validFrom}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Valid To:</span>
                        <span>{prod.validTo}</span>
                      </div>
                      <div className="flex justify-between font-medium text-slate-700 pt-0.5">
                        <span className="text-slate-400">Remaining:</span>
                        <span>{prod.expiryDays}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* =======================================================================
              5. TRANSACTION HISTORY
             ======================================================================= */}
          <section
            id="c360-transaction-history-section"
            className={cn(
              'p-5 bg-white border border-slate-200',
              theme === 'glassmorphism'
                ? 'rounded-2xl bg-white/85 backdrop-blur-md shadow-xs'
                : 'rounded-xl shadow-xs'
            )}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Transaction History</h3>
                  <p className="text-[11px] text-slate-400">Trading execution and IPO subscription ledger</p>
                </div>
              </div>

              {/* Filters: IPO Name & Date Range */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* IPO Name Filter */}
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs">
                  <Filter className="w-3 h-3 text-slate-400" />
                  <span className="text-slate-400 font-semibold text-[11px]">IPO:</span>
                  <select
                    id="filter-ipo-name"
                    value={selectedIpoFilter}
                    onChange={(e) => setSelectedIpoFilter(e.target.value)}
                    className="bg-transparent text-xs font-semibold text-slate-700 outline-none cursor-pointer"
                  >
                    <option value="ALL">All IPOs</option>
                    {ipoOptions.map((ipo) => (
                      <option key={ipo} value={ipo}>{ipo}</option>
                    ))}
                  </select>
                </div>

                {/* Date Range Filter */}
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span className="text-slate-400 font-semibold text-[11px]">Date:</span>
                  <select
                    id="filter-date-range"
                    value={selectedDateRange}
                    onChange={(e) => setSelectedDateRange(e.target.value)}
                    className="bg-transparent text-xs font-semibold text-slate-700 outline-none cursor-pointer"
                  >
                    <option value="ALL">All Dates</option>
                    <option value="JAN_2026">Jan 2026</option>
                    <option value="2026">Year 2026</option>
                    <option value="2025">Year 2025</option>
                  </select>
                </div>

                {(selectedIpoFilter !== 'ALL' || selectedDateRange !== 'ALL') && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedIpoFilter('ALL');
                      setSelectedDateRange('ALL');
                    }}
                    className="text-xs text-blue-600 hover:underline font-semibold"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Transaction Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-4">Transaction Date time</th>
                    <th className="py-3 px-4">IPO Name</th>
                    <th className="py-3 px-4">Transaction Type</th>
                    <th className="py-3 px-4 text-right">Quantity</th>
                    <th className="py-3 px-4 text-right">Price</th>
                    <th className="py-3 px-4 text-right">Trading Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                        No transactions found matching your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 text-slate-700 whitespace-nowrap font-medium">
                          {tx.dateTime}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {tx.ipoName}
                        </td>
                        <td className="py-3 px-4">
                          <span className={cn(
                            'inline-block px-2 py-0.5 rounded-full text-[10px] font-bold',
                            tx.transactionType === 'IPO Subscription'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : tx.transactionType === 'Buy'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : tx.transactionType === 'Sell'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          )}>
                            {tx.transactionType}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-semibold text-slate-800">
                          {tx.quantity.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-600">
                          ${tx.price.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                          ${tx.tradingValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2.5 px-1">
              <span>Showing {filteredTransactions.length} of {customer360Data.transactions.length} records</span>
              <span>All monetary values settled in USD</span>
            </div>
          </section>

          {/* =======================================================================
              6. ACTIVITY TIMELINE
             ======================================================================= */}
          <section
            id="c360-activity-timeline-section"
            className={cn(
              'p-5 bg-white border border-slate-200 space-y-4',
              theme === 'glassmorphism'
                ? 'rounded-2xl bg-white/85 backdrop-blur-md shadow-xs'
                : 'rounded-xl shadow-xs'
            )}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Activity Timeline</h3>
                  <p className="text-[11px] text-slate-400">Complete audit trail & authorization history</p>
                </div>
              </div>

              {/* Layout Toggle Buttons */}
              <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200 text-xs font-semibold self-start sm:self-auto shadow-2xs">
                <button
                  type="button"
                  onClick={() => setTimelineLayout('vertical')}
                  title="Version 1: Detailed Vertical Cards"
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all',
                    timelineLayout === 'vertical'
                      ? 'bg-white text-blue-700 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  <LayoutList className="w-3.5 h-3.5" />
                  <span className="text-xs">Vertical</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTimelineLayout('stepper')}
                  title="Version 2: Connected Node Stepper (Image 1)"
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all',
                    timelineLayout === 'stepper'
                      ? 'bg-white text-blue-700 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  <GitCommit className="w-3.5 h-3.5" />
                  <span className="text-xs">Step Nodes</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTimelineLayout('bar')}
                  title="Version 3: Segmented Progress Bar (Image 2)"
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all',
                    timelineLayout === 'bar'
                      ? 'bg-white text-blue-700 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  <Split className="w-3.5 h-3.5" />
                  <span className="text-xs">Progress Bar</span>
                </button>
              </div>
            </div>

            {/* =======================================================================
                LAYOUT 1: VERTICAL TIMELINE
               ======================================================================= */}
            {timelineLayout === 'vertical' && (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 pt-2">
                {customer360Data.activities.map((act) => {
                  const isRejected = act.activity.toLowerCase().includes('rejected');
                  const isApproved = !isRejected && (act.activity.toLowerCase().includes('approved') || act.activity.toLowerCase().includes('registered'));
                  const isChecked = !isRejected && act.activity.toLowerCase().includes('checked');
                  const isSubmitted = !isRejected && act.activity.toLowerCase().includes('submitted');

                  return (
                    <div key={act.id} className="relative group">
                      {/* Node Dot */}
                      <div className={cn(
                        'absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white ring-2 ring-slate-100 transition',
                        isRejected
                          ? 'bg-rose-500 ring-rose-100'
                          : isApproved
                          ? 'bg-blue-600 ring-blue-100'
                          : isChecked
                          ? 'bg-emerald-500 ring-emerald-100'
                          : isSubmitted
                          ? 'bg-purple-500 ring-purple-100'
                          : 'bg-slate-400 ring-slate-100'
                      )} />

                      {/* Timeline Item Content Box */}
                      <div className="bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 transition-all">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                          <span className="text-[11px] font-semibold text-slate-400">
                            {act.dateTime}
                          </span>
                          {act.referenceId && (
                            <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-white text-blue-700 border border-slate-200 self-start sm:self-auto">
                              {act.referenceId}
                            </span>
                          )}
                        </div>

                        <h4 className="text-xs font-bold text-slate-900 mt-0.5">
                          {act.activity}
                        </h4>

                        {/* Processed By & Role info */}
                        {(act.processedBy || act.role) && (
                          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200/60 text-[11px]">
                            {act.processedBy && (
                              <span className="text-slate-600">
                                By: <strong>{act.processedBy}</strong>
                              </span>
                            )}
                            {act.role && (
                              <span className={cn(
                                'px-2 py-0.2 rounded-full font-bold text-[10px]',
                                act.role === 'Manager'
                                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                  : act.role === 'Senior' || act.role === 'SR'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              )}>
                                {act.role}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* =======================================================================
                LAYOUT 2: CONNECTED NODE STEPPER (Image 1 Style)
               ======================================================================= */}
            {timelineLayout === 'stepper' && (
              <div className="space-y-4">
                <div className="text-[11px] font-bold tracking-wider text-slate-500 uppercase px-1">
                  REQUEST
                </div>

                <div className="bg-slate-50/60 border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col md:flex-row items-center gap-4 sm:gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0 shadow-2xs">
                    <UserPlus className="w-6 h-6 text-blue-600" />
                  </div>

                  <div className="flex-1 w-full flex items-center justify-between gap-1 sm:gap-2">
                    {/* Step 1: CSO */}
                    <div className="flex items-center gap-2.5 shrink-0">
                      <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-slate-900 text-xs sm:text-sm">CSO</div>
                        <div className="text-[11px] font-semibold text-emerald-600">Submitted</div>
                        <div className="text-[10px] text-slate-400 font-medium hidden sm:block">Mar 15, 2026 · 09:30 AM</div>
                      </div>
                    </div>

                    {/* Connecting Line 1 */}
                    <div className="flex-1 h-1 bg-emerald-500 rounded-full mx-2 sm:mx-4 min-w-[24px]" />

                    {/* Step 2: SR */}
                    <div className="flex items-center gap-2.5 shrink-0">
                      <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-slate-900 text-xs sm:text-sm">SR</div>
                        <div className="text-[11px] font-semibold text-emerald-600">Approved</div>
                        <div className="text-[10px] text-slate-400 font-medium hidden sm:block">Mar 17, 2026 · 02:45 PM</div>
                      </div>
                    </div>

                    {/* Connecting Line 2 */}
                    <div className={cn(
                      "flex-1 h-1 rounded-full mx-2 sm:mx-4 min-w-[24px]",
                      activeIndividual?.requestStatus === 'Rejected' ? "bg-rose-400" : "bg-emerald-500"
                    )} />

                    {/* Step 3: Manager */}
                    <div className="flex items-center gap-2.5 shrink-0">
                      <div className={cn(
                        "w-7 h-7 rounded-full text-white flex items-center justify-center shadow-xs",
                        activeIndividual?.requestStatus === 'Rejected' ? "bg-rose-500" : "bg-emerald-500"
                      )}>
                        {activeIndividual?.requestStatus === 'Rejected' ? (
                          <X className="w-4 h-4 stroke-[3]" />
                        ) : (
                          <Check className="w-4 h-4 stroke-[3]" />
                        )}
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-slate-900 text-xs sm:text-sm">Manager</div>
                        <div className={cn(
                          "text-[11px] font-semibold",
                          activeIndividual?.requestStatus === 'Rejected' ? "text-rose-600 font-bold" : "text-emerald-600"
                        )}>
                          {activeIndividual?.requestStatus === 'Rejected' ? "Rejected" : "Approved"}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium hidden sm:block">Mar 18, 2026 · 04:20 PM</div>
                      </div>
                    </div>
                  </div>
                </div>

                {activeIndividual?.requestStatus === 'Rejected' && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-start gap-2 shadow-2xs">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-rose-950">Reason: </span>
                      <span className="text-rose-800 font-medium">Customer address does not match the supporting document.</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* =======================================================================
                LAYOUT 3: SEGMENTED PROGRESS BAR (Image 2 Style)
               ======================================================================= */}
            {timelineLayout === 'bar' && (
              <div className="space-y-4">
                <div className="text-[11px] font-bold tracking-wider text-slate-500 uppercase px-1">
                  REGISTRATION PROGRESS BAR
                </div>

                <div className="bg-slate-50/60 border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-xs flex items-start gap-4 sm:gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0 shadow-2xs mt-0.5">
                    <UserPlus className="w-6 h-6 text-blue-600" />
                  </div>

                  <div className="flex-1 w-full space-y-3.5">
                    <div className="grid grid-cols-3 gap-2.5 sm:gap-4 w-full">
                      <div className="h-2 rounded-full bg-emerald-500 shadow-2xs" />
                      <div className="h-2 rounded-full bg-emerald-500 shadow-2xs" />
                      <div className={cn(
                        "h-2 rounded-full shadow-2xs",
                        activeIndividual?.requestStatus === 'Rejected' ? "bg-rose-500" : "bg-emerald-500"
                      )} />
                    </div>

                    <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
                      <div>
                        <div className="font-bold text-slate-900 text-xs sm:text-sm">CSO</div>
                        <div className="text-[11px] font-bold text-emerald-600">Submitted</div>
                        <div className="text-[10px] text-slate-600 font-medium mt-1">Sophea Keo</div>
                        <div className="text-[10px] text-slate-400 hidden sm:block">Mar 15, 2026 · 09:30 AM</div>
                      </div>

                      <div>
                        <div className="font-bold text-slate-900 text-xs sm:text-sm">SR</div>
                        <div className="text-[11px] font-bold text-emerald-600">Approved</div>
                        <div className="text-[10px] text-slate-600 font-medium mt-1">Dara Vong</div>
                        <div className="text-[10px] text-slate-400 hidden sm:block">Mar 17, 2026 · 02:45 PM</div>
                      </div>

                      <div>
                        <div className="font-bold text-slate-900 text-xs sm:text-sm">Manager</div>
                        <div className={cn(
                          "text-[11px] font-bold",
                          activeIndividual?.requestStatus === 'Rejected' ? "text-rose-600" : "text-emerald-600"
                        )}>
                          {activeIndividual?.requestStatus === 'Rejected' ? "Rejected" : "Approved"}
                        </div>
                        <div className="text-[10px] text-slate-600 font-medium mt-1">Vannak Lim</div>
                        <div className="text-[10px] text-slate-400 hidden sm:block">Mar 18, 2026 · 04:20 PM</div>
                      </div>
                    </div>
                  </div>
                </div>

                {activeIndividual?.requestStatus === 'Rejected' && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-start gap-2 shadow-2xs">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-rose-950">Reason: </span>
                      <span className="text-rose-800 font-medium">Customer address does not match the supporting document.</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
