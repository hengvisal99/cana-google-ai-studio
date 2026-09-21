'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { Individual, DesignTheme } from '@/types';
import { getCustomer360Details } from '@/lib/customer360Service';
import { 
  Search, 
  TrendingUp, 
  Calendar, 
  Layers, 
  Clock, 
  ShieldCheck, 
  AlertCircle, 
  Check, 
  ChevronRight, 
  ChevronDown,
  DollarSign, 
  X, 
  Filter, 
  History, 
  Copy, 
  Sparkles,
  ArrowUpRight,
  CreditCard,
  Building2,
  FileCheck,
  UserPlus,
  SlidersHorizontal,
  RotateCcw,
  Tag,
  PanelLeftClose,
  PanelLeftOpen,
  Monitor,
  Briefcase,
  Crown,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FormSelect } from '@/components/ui/form';
import { Customer360SummarySection } from './Customer360SummarySection';
import { Customer360ProfileHeader } from './Customer360ProfileHeader';

// Customer 360 scope: an account is "opened" only when it is Active or Closed.
const isActiveAccount = (ind: Individual) =>
  ind.accountStatus === 'Active' || (!ind.accountStatus && ind.requestStatus === 'Approved');

const isClosedAccount = (ind: Individual) =>
  ind.accountStatus === 'Closed' || ind.requestType === 'Close Account';

// Remaining-days tone: green when comfortably valid, neutral in the normal
// range, amber when renewal is due, rose when it is about to lapse.
const remainingTone = (expiryDays: string) => {
  const days = parseInt(expiryDays, 10);
  if (Number.isNaN(days)) return 'text-slate-800';
  if (days <= 7) return 'text-rose-600';
  if (days <= 30) return 'text-amber-600';
  if (days >= 90) return 'text-emerald-600';
  return 'text-slate-800';
};

// Product icon by name; the status pill already carries the state colour.
const PRODUCT_ICONS: Record<string, React.ElementType> = {
  'CSX Screen': Monitor,
  'Client Card': CreditCard,
  'Employee Trading': Briefcase,
  'VIP Customer': Crown,
};

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
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Temporary A/B toggle: compare the current typography against the
  // recommended hierarchy (3 weights, semibold reserved for emphasis).
  const [refined, setRefined] = useState(false);
  const sectionTitle = cn('text-sm font-semibold', refined ? 'text-slate-600' : 'text-slate-900');

  // Temporary A/B toggle: where "show customer list" sits once the sidebar is hidden.
  const [togglePlacement, setTogglePlacement] = useState<'current' | 'cardEdge' | 'besidePrint' | 'rail'>('current');
  const sidebarClosedOn = (p: typeof togglePlacement) => !sidebarOpen && togglePlacement === p;
  const iconToggle = (
    <button
      type="button"
      onClick={() => setSidebarOpen(true)}
      aria-expanded={false}
      aria-controls="customer-360-left-sidebar"
      title="Show customer list"
      aria-label="Show customer list"
      className="hidden lg:grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 transition cursor-pointer hover:border-blue-300 hover:text-blue-600 print:hidden"
    >
      <PanelLeftOpen className="w-4 h-4" />
    </button>
  );

  // Transaction History Filters (Dropdown layout)
  const [selectedIpoFilter, setSelectedIpoFilter] = useState<string>('ALL');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('ALL');
  const [isTxFilterDropdownOpen, setIsTxFilterDropdownOpen] = useState<boolean>(false);

  // Copy-to-clipboard state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const handleCopy = (text: string, key: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1800);
    }
  };

  // Customer 360 only covers opened accounts: Active or Closed ("Not Opened" is excluded)
  const customer360Individuals = useMemo(() => {
    return individuals.filter((ind) => isActiveAccount(ind) || isClosedAccount(ind));
  }, [individuals]);

  // Active customer resolution (restricted to Active / Closed customers)
  const activeIndividual = useMemo(() => {
    return (
      customer360Individuals.find((ind) => ind.id === selectedCustomerId || ind.customerId === selectedCustomerId) ||
      customer360Individuals[0] ||
      null
    );
  }, [customer360Individuals, selectedCustomerId]);

  // Complete Customer 360 data package
  const customer360Data = useMemo(() => {
    if (!activeIndividual) return null;
    return getCustomer360Details(activeIndividual);
  }, [activeIndividual]);

  // Tab counts for the sidebar (Active + Closed only)
  const countAll = customer360Individuals.length;
  const countActive = useMemo(() => {
    return customer360Individuals.filter(isActiveAccount).length;
  }, [customer360Individuals]);
  const countClosed = useMemo(() => {
    return customer360Individuals.filter(isClosedAccount).length;
  }, [customer360Individuals]);

  // Filtered sidebar customer list
  const filteredCustomers = useMemo(() => {
    return customer360Individuals.filter((ind) => {
      // Tab filter
      if (customerTab === 'ACTIVE') {
        if (!isActiveAccount(ind)) return false;
      } else if (customerTab === 'CLOSED') {
        if (!isClosedAccount(ind)) return false;
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
  }, [customer360Individuals, customerTab, sidebarSearch]);

  // Unique IPO list for filter dropdown
  // Securities are stored as 'TICKER - Full Institution Name'. Only the ticker
  // is displayed; the stored value stays intact so filtering still matches.
  const ipoTicker = (ipoName: string) => ipoName.split(' - ')[0];

  const ipoOptions = useMemo(() => {
    if (!customer360Data) return [];
    const set = new Set(customer360Data.transactions.map(t => t.ipoName));
    return Array.from(set);
  }, [customer360Data]);

  // Transaction counts per IPO
  const ipoCounts = useMemo(() => {
    if (!customer360Data) return {} as Record<string, number>;
    const map: Record<string, number> = {};
    customer360Data.transactions.forEach(t => {
      map[t.ipoName] = (map[t.ipoName] || 0) + 1;
    });
    return map;
  }, [customer360Data]);

  // Active filter count
  const activeTxFilterCount = useMemo(() => {
    let count = 0;
    if (selectedIpoFilter !== 'ALL') count++;
    if (selectedDateRange !== 'ALL') count++;
    return count;
  }, [selectedIpoFilter, selectedDateRange]);

  const handleResetTxFilters = () => {
    setSelectedIpoFilter('ALL');
    setSelectedDateRange('ALL');
  };

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

  // Totals for filtered transactions
  const transactionTotals = useMemo(() => {
    return filteredTransactions.reduce(
      (acc, tx) => {
        acc.quantity += tx.quantity || 0;
        acc.tradingValue += tx.tradingValue || 0;
        return acc;
      },
      { quantity: 0, tradingValue: 0 }
    );
  }, [filteredTransactions]);

  // Shared column widths for the transaction body and its pinned totals table.
  const txColGroup = (
    <colgroup>
      <col className="w-[30%]" />
      <col className="w-[18%]" />
      <col className="w-[16%]" />
      <col className="w-[14%]" />
      <col className="w-[22%]" />
    </colgroup>
  );

  // Print Dossier Action
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  if (!activeIndividual || !customer360Data) {
    return (
      <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
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
    <div id="customer-360-screen" className="relative space-y-5 lg:flex lg:h-full lg:min-h-0 lg:flex-col print:block print:h-auto print:p-0 print:space-y-3">
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

      {/* Temporary sidebar-toggle placement comparison - remove once one is chosen. */}
      <div className="fixed bottom-17 right-5 z-40 flex items-center gap-1 rounded-full border border-slate-200 bg-white/95 p-1 shadow-lg backdrop-blur print:hidden">
        <span className="px-2 text-[11px] font-medium text-slate-500">List toggle</span>
        {([['Current', 'current'], ['Card edge', 'cardEdge'], ['Beside Print', 'besidePrint'], ['Rail', 'rail']] as const).map(([label, value]) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setTogglePlacement(value);
              setSidebarOpen(false);
            }}
            aria-pressed={togglePlacement === value}
            className={cn(
              'rounded-full px-3 py-1.5 text-xs font-semibold transition cursor-pointer',
              togglePlacement === value ? 'bg-blue-500 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Temporary typography comparison toggle - remove once a style is chosen. */}
      <div className="fixed bottom-5 right-5 z-40 flex items-center gap-1 rounded-full border border-slate-200 bg-white/95 p-1 shadow-lg backdrop-blur print:hidden">
        <span className="px-2 text-[11px] font-medium text-slate-500">Typography</span>
        {([['Current', false], ['Recommended', true]] as const).map(([label, value]) => (
          <button
            key={label}
            type="button"
            onClick={() => setRefined(value)}
            aria-pressed={refined === value}
            className={cn(
              'rounded-full px-3 py-1.5 text-xs font-semibold transition cursor-pointer',
              refined === value ? 'bg-blue-500 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Main 2-Column Layout */}
      <div className={cn(
        'grid grid-cols-1 gap-5 items-start lg:items-stretch lg:flex-1 lg:min-h-0 lg:overflow-hidden print:block print:overflow-visible',
        sidebarOpen && 'lg:grid-cols-12',
        sidebarClosedOn('rail') && 'lg:grid-cols-[56px_minmax(0,1fr)]'
      )}>
        {/* Option: slim rail in place of the hidden sidebar - toggle on top, customers below */}
        {sidebarClosedOn('rail') && (
          <nav
            aria-label="Customers"
            className="hidden lg:flex lg:h-full lg:min-h-0 flex-col items-center gap-2.5 rounded-xl border border-slate-200 bg-white py-3 shadow-xs print:hidden"
          >
            {iconToggle}
            <span className="h-px w-6 shrink-0 bg-slate-100" />
            <div className="flex min-h-0 flex-1 flex-col items-center gap-2.5 overflow-y-auto px-2 py-0.5">
              {filteredCustomers.map((ind) => {
                const isSelected = ind.id === activeIndividual.id;
                return (
                  <button
                    key={ind.id}
                    type="button"
                    onClick={() => onSelectCustomer(ind.id)}
                    title={ind.fullNameEN || `${ind.firstName} ${ind.lastName}`}
                    className="shrink-0 cursor-pointer rounded-xl"
                  >
                    <Image
                      src={ind.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={ind.firstName}
                      width={36}
                      height={36}
                      className={cn(
                        'h-9 w-9 rounded-xl border object-cover transition',
                        isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-slate-200 opacity-80 hover:opacity-100'
                      )}
                      referrerPolicy="no-referrer"
                      unoptimized
                    />
                  </button>
                );
              })}
            </div>
          </nav>
        )}

        {/* =========================================================================
            1. LEFT SIDEBAR: CUSTOMER LIST
           ========================================================================= */}
        <aside
          id="customer-360-left-sidebar"
          aria-label="Customer 360 Customer List"
          className={cn(
            'lg:col-span-4 xl:col-span-3 bg-white border border-slate-200 overflow-hidden flex flex-col lg:min-h-0 lg:h-full print:hidden',
            !sidebarOpen && 'lg:hidden',
            theme === 'glassmorphism'
              ? 'rounded-2xl bg-white/85 backdrop-blur-xl border-white/80 shadow-md'
              : theme === 'aurora'
              ? 'rounded-2xl border-slate-200 shadow-md ring-1 ring-blue-500/10'
              : 'rounded-xl shadow-xs'
          )}
        >
          {/* Sidebar Header & Search Group */}
          <div className="p-3.5 bg-slate-50/70 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Users className="w-4 h-4 text-blue-600" />
                <span>Customer 360</span>
              </h3>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                aria-expanded={true}
                aria-controls="customer-360-left-sidebar"
                className="hidden lg:flex p-1.5 -mr-1 rounded-lg text-slate-600 hover:bg-white hover:text-blue-600 transition cursor-pointer"
                title="Hide customer list"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
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
                  'flex-1 py-1.5 px-2 text-center text-xs rounded-md transition-all flex items-center justify-center gap-1.5',
                  refined && customerTab !== 'ALL' ? 'font-medium' : 'font-semibold',
                  customerTab === 'ALL'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                <span>All</span>
                <span className={cn(
                  'text-[10px] px-1.5 py-0.2 rounded-full', refined ? 'font-medium' : 'font-semibold',
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
                  'flex-1 py-1.5 px-2 text-center text-xs rounded-md transition-all flex items-center justify-center gap-1.5',
                  refined && customerTab !== 'ACTIVE' ? 'font-medium' : 'font-semibold',
                  customerTab === 'ACTIVE'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                <span>Active</span>
                <span className={cn(
                  'text-[10px] px-1.5 py-0.2 rounded-full', refined ? 'font-medium' : 'font-semibold',
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
                  'flex-1 py-1.5 px-2 text-center text-xs rounded-md transition-all flex items-center justify-center gap-1.5',
                  refined && customerTab !== 'CLOSED' ? 'font-medium' : 'font-semibold',
                  customerTab === 'CLOSED'
                    ? 'bg-white text-rose-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                <span>Closed</span>
                <span className={cn(
                  'text-[10px] px-1.5 py-0.2 rounded-full', refined ? 'font-medium' : 'font-semibold',
                  customerTab === 'CLOSED' ? 'bg-rose-100 text-rose-800' : 'bg-slate-300/60 text-slate-600'
                )}>
                  {countClosed}
                </span>
              </button>
            </div>
          </div>

          {/* Customer List Items: Bento UI */}
          {filteredCustomers.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No matching customer found.
            </div>
          ) : (
            <div className="p-2.5 space-y-2.5 bg-slate-50/50 max-h-[calc(100vh-290px)] min-h-[460px] lg:max-h-none lg:min-h-0 lg:flex-1 overflow-y-auto">
              {filteredCustomers.map((ind) => {
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
                      'w-full text-left p-3 rounded-xl transition-all relative group cursor-pointer border',
                      isSelected
                        ? 'bg-gradient-to-br from-blue-50/90 via-indigo-50/30 to-white border-blue-500 ring-2 ring-blue-500/10 shadow-xs'
                        : 'bg-white hover:bg-slate-50/90 border-slate-200 hover:border-blue-200 shadow-2xs'
                    )}
                  >
                    <div className="flex items-start gap-2.5">
                      {/* Squircle Avatar */}
                      <div className="relative shrink-0">
                        <Image
                          src={ind.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                          alt={ind.firstName}
                          width={40}
                          height={40}
                          className={cn(
                            'w-9 h-9 rounded-xl object-cover border',
                            isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-slate-200'
                          )}
                          referrerPolicy="no-referrer"
                          unoptimized
                        />
                        <span className={cn(
                          'absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white',
                          status === 'Active' ? 'bg-emerald-500' : status === 'Closed' ? 'bg-rose-500' : 'bg-amber-500'
                        )} />
                      </div>

                      {/* Primary Details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className={cn(
                            'text-sm font-semibold truncate',
                            isSelected ? 'text-blue-800' : 'text-slate-900 group-hover:text-blue-600'
                          )}>
                            {ind.fullNameEN || `${ind.firstName} ${ind.lastName}`}
                          </span>
                          <span className={cn(
                            'text-[11px] px-2 py-0.5 rounded-md shrink-0', refined ? 'font-medium' : 'font-semibold',
                            status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : status === 'Closed'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          )}>
                            {status}
                          </span>
                        </div>

                        <p lang="km" className="text-[12px] leading-relaxed text-slate-600 truncate mt-0.5 font-khmer">
                          {ind.fullNameKH || `${ind.surnameKH || ''} ${ind.givenNameKH || ''}`}
                        </p>
                      </div>
                    </div>

                    {/* Bento Card Footer Micro-Bar */}
                    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100 text-[11px]">
                      <span className={cn('font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200', refined ? 'font-normal' : 'font-medium')}>
                        {ind.customerId || ind.id}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className={cn('text-slate-500 text-[11px]', refined ? 'font-normal' : 'font-medium')}>Total IPO:</span>
                        <span className={cn('font-mono text-xs text-slate-800', refined ? 'font-medium' : 'font-semibold')}>
                          ${portVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        {/* =========================================================================
            RIGHT CONTENT AREA: CUSTOMER 360 DETAILS
           ========================================================================= */}
        <main className={cn(
          'space-y-5 print-full-width lg:flex lg:flex-col lg:h-full lg:min-h-0 lg:space-y-0 lg:gap-5 print:block print:h-auto',
          sidebarOpen && 'lg:col-span-8 xl:col-span-9'
        )}>
          {/* =======================================================================
              2. CUSTOMER 360 HEADER
             ======================================================================= */}
          {/* Back button: the way back to the hidden customer list, above the profile. */}
          {sidebarClosedOn('current') && (
            <div className="hidden lg:flex lg:shrink-0 items-center -mb-2 print:hidden">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                aria-expanded={false}
                aria-controls="customer-360-left-sidebar"
                className="group flex items-center gap-2 rounded-lg border border-slate-200 bg-white py-1.5 pl-2 pr-2.5 text-xs font-semibold text-slate-700 shadow-2xs transition cursor-pointer hover:border-blue-300 hover:text-blue-600 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2"
              >
                <PanelLeftOpen className="w-3.5 h-3.5 text-slate-500 transition group-hover:text-blue-600" />
                <span>Customer list</span>
              </button>
            </div>
          )}

          <div className="lg:shrink-0">
            <Customer360ProfileHeader
              avatarUrl={activeIndividual.avatarUrl}
              nameKH={displayNameKH}
              nameEN={displayNameEN}
              cid={displayCID}
              risk={activeIndividual.riskCategory || 'Moderate'}
              customerType={activeIndividual.customerType || 'High Net Worth'}
              accountStatus={activeIndividual.accountStatus || (isActiveAccount(activeIndividual) ? 'Active' : 'Not Opened')}
              occupation={displayOccupation}
              phone={displayPhone}
              email={displayEmail}
              address={displayAddress}
              theme={theme}
              onPrint={handlePrint}
              onCopy={handleCopy}
              copiedKey={copiedKey}
              refined={refined}
              leading={sidebarClosedOn('cardEdge') ? (
                <>
                  {iconToggle}
                  <span className="hidden lg:block h-10 w-px shrink-0 bg-slate-200 print:hidden" />
                </>
              ) : undefined}
              actions={sidebarClosedOn('besidePrint') ? (
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  aria-expanded={false}
                  aria-controls="customer-360-left-sidebar"
                  className="group hidden lg:flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition cursor-pointer hover:border-blue-300 hover:text-blue-600 print:hidden"
                >
                  <PanelLeftOpen className="w-4 h-4 text-slate-500 transition group-hover:text-blue-600" />
                  <span>Customer list</span>
                </button>
              ) : undefined}
            />
          </div>

          {/* Scrolling body: the profile above stays pinned, so only the
              sections below move. min-h-0 lets this flex child shrink
              below its content height and actually own the overflow. */}
          <div className="space-y-8 lg:flex-1 lg:min-h-0 lg:overflow-y-auto lg:pr-1.5 [scrollbar-gutter:stable] print:overflow-visible print:pr-0">

            {/* =======================================================================
                3. SUMMARY: 3-VERSION KPI CARDS WITH IN-CARD TOGGLE
               ======================================================================= */}
            <Customer360SummarySection 
              kpis={customer360Data.kpis} 
              theme={theme} 
              customerName={displayNameEN}
              refined={refined} 
            />

            {/* =======================================================================
                4. PRODUCT
               ======================================================================= */}
            {/* No card of its own: the product rows are already cards, and nesting
                them inside another one just adds a frame around a frame. */}
            <section id="c360-product-section" className="space-y-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <h3 className={sectionTitle}>Product Portfolio</h3>
              </div>

              {/* One Row One Card Layout */}
              <div className="space-y-3">
                {customer360Data.products.map((prod) => (
                  <div
                    key={prod.id}
                    className={cn(
                      'relative overflow-hidden p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50/70 hover:border-blue-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs'
                    )}
                  >
                    {/* Left: Product Icon, Name & ID */}
                    <div className="min-w-[240px] flex items-center gap-3">
                      {(() => {
                        const ProductIcon = PRODUCT_ICONS[prod.productName] || Layers;
                        return (
                          <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200/60 text-blue-600 flex items-center justify-center shrink-0">
                            <ProductIcon className="w-4 h-4" />
                          </div>
                        );
                      })()}
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900">
                          {prod.productName}
                        </div>
                        <div className={cn('font-mono text-xs text-slate-500 mt-0.5', refined ? 'font-normal' : 'font-medium')}>
                          {prod.productId}
                        </div>
                      </div>
                    </div>

                    {/* Right: Valid From, Valid To, Expiry, Status */}
                    <div className={cn('flex items-center flex-wrap md:flex-nowrap justify-between md:justify-end text-xs', refined ? 'gap-6 sm:gap-10' : 'gap-5 sm:gap-7')}>
                      <div>
                        <span className={cn('text-[11px] uppercase text-slate-500 tracking-wider block', refined ? 'font-normal' : 'font-medium')}>
                          Valid From
                        </span>
                        <span className={cn('text-slate-700 block whitespace-nowrap', refined ? 'mt-1 font-medium' : 'mt-0.5 font-semibold')}>
                          {prod.validFrom}
                        </span>
                      </div>

                      <div>
                        <span className={cn('text-[11px] uppercase text-slate-500 tracking-wider block', refined ? 'font-normal' : 'font-medium')}>
                          Valid To
                        </span>
                        <span className={cn('text-slate-700 block whitespace-nowrap', refined ? 'mt-1 font-medium' : 'mt-0.5 font-semibold')}>
                          {prod.validTo}
                        </span>
                      </div>

                      <div className="min-w-[65px] text-left md:text-right">
                        <span className={cn('text-[11px] uppercase text-slate-500 tracking-wider block', refined ? 'font-normal' : 'font-medium')}>
                          Remaining
                        </span>
                        <span className={cn('block whitespace-nowrap', refined ? cn('mt-1 font-medium', remainingTone(prod.expiryDays)) : 'mt-0.5 font-semibold text-slate-800')}>
                          {prod.expiryDays}
                        </span>
                      </div>

                      <div className="shrink-0">
                        <span className={cn(
                          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border shadow-2xs',
                          prod.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : prod.status === 'Expiring Soon'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        )}>
                          <span className={cn(
                            'w-1.5 h-1.5 rounded-full',
                            prod.status === 'Active' ? 'bg-emerald-600' : prod.status === 'Expiring Soon' ? 'bg-amber-600' : 'bg-rose-600'
                          )} />
                          {prod.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* =======================================================================
                5. TRANSACTION HISTORY & 6. ACTIVITY TIMELINE (SAME ROW)
               ======================================================================= */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start xl:items-stretch">
              {/* 5. TRANSACTION HISTORY */}
              {/* Same as the portfolio above: the table already carries its own frame. */}
              {/* At xl the row stretches both columns to the taller one, so their
                  bottoms line up while each body grows to fit its content -
                  neither shows an inner scrollbar; the panel above scrolls. */}
              <section id="c360-transaction-history-section" className="xl:col-span-7 flex flex-col xl:min-h-[520px]">
                <div className="flex flex-1 min-h-0 flex-col space-y-3">
                  {/* xl:h-8 matches the timeline header opposite, so both bodies
                      start at the same y even though only this one has a button. */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 xl:h-8 xl:shrink-0">
                    <div className="flex items-center gap-2">
                      <History className="w-4 h-4 text-blue-600" />
                      <h3 className={sectionTitle}>Transaction History</h3>
                    </div>

                    {/* Filter Trigger & Dropdown Popover */}
                    <div className="relative self-start sm:self-auto">
                      {/* Reset lives inside the popover, next to the controls it
                          clears - a second one out here only duplicates it and
                          shifts the Filter button as filters come and go. */}
                      <button
                        type="button"
                        id="btn-tx-filter-toggle"
                        onClick={() => setIsTxFilterDropdownOpen(!isTxFilterDropdownOpen)}
                        className={cn(
                          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border shadow-2xs cursor-pointer',
                          isTxFilterDropdownOpen || activeTxFilterCount > 0
                            ? 'bg-blue-50 text-blue-700 border-blue-300 ring-2 ring-blue-500/10'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        )}
                      >
                        {/* Icon follows the same condition as the rest of the
                            button, so blue consistently means "filters are on". */}
                        <Filter className={cn(
                          'w-3.5 h-3.5 transition-colors',
                          isTxFilterDropdownOpen || activeTxFilterCount > 0
                            ? 'text-blue-600'
                            : 'text-slate-500'
                        )} />
                        <span>Filter</span>
                        {activeTxFilterCount > 0 && (
                          <span className="w-4 h-4 rounded-full bg-blue-500 text-white text-[10px] font-semibold flex items-center justify-center">
                            {activeTxFilterCount}
                          </span>
                        )}
                        <ChevronDown className={cn('w-3.5 h-3.5 text-slate-400 transition-transform duration-150', isTxFilterDropdownOpen && 'rotate-180')} />
                      </button>

                      {/* Popover Dropdown Panel */}
                      {isTxFilterDropdownOpen && (
                        <>
                          {/* Backdrop to close on click outside */}
                          <div
                            className="fixed inset-0 z-20"
                            onClick={() => setIsTxFilterDropdownOpen(false)}
                          />

                          <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-3.5 z-30 space-y-3">
                            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                              <div className="flex items-center gap-1.5">
                                <Filter className="w-3.5 h-3.5 text-blue-600" />
                                <span className="text-xs font-semibold text-slate-900">Filter Transactions</span>
                              </div>
                              {activeTxFilterCount > 0 && (
                                <button
                                  type="button"
                                  onClick={handleResetTxFilters}
                                  className="text-[11px] font-semibold text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  Reset
                                </button>
                              )}
                            </div>

                            <FormSelect
                              id="filter-ipo-name"
                              label="IPO Name"
                              size="sm"
                              searchable={false}
                              value={selectedIpoFilter}
                              onChange={setSelectedIpoFilter}
                              options={[
                                { value: 'ALL', label: `All IPOs (${customer360Data.transactions.length})` },
                                ...ipoOptions.map((ipo) => ({ value: ipo, label: `${ipoTicker(ipo)} (${ipoCounts[ipo] || 0})` })),
                              ]}
                            />

                            <FormSelect
                              id="filter-date-range"
                              label="Date Period"
                              size="sm"
                              searchable={false}
                              value={selectedDateRange}
                              onChange={setSelectedDateRange}
                              options={[
                                { value: 'ALL', label: 'All Dates' },
                                { value: 'JAN_2026', label: 'Jan 2026' },
                                { value: '2026', label: 'Year 2026' },
                                { value: '2025', label: 'Year 2025' },
                              ]}
                            />

                            {/* Footer with Done button */}
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                              <button
                                type="button"
                                onClick={() => setIsTxFilterDropdownOpen(false)}
                                className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-semibold shadow-2xs transition cursor-pointer"
                              >
                                Done
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Transaction Table (Transaction Type column removed).
                      At xl the card stretches to match the timeline opposite.
                      Rows keep their natural height inside a scrolling body and
                      the totals live in a separate table pinned to the card's
                      bottom edge; both tables share one fixed colgroup so the
                      columns line up. */}
                  <div className="flex flex-col overflow-x-auto xl:flex-1 xl:min-h-0 border border-slate-200 rounded-xl bg-white">
                    <div className="flex flex-1 min-h-0 min-w-[520px] flex-col">
                      <div className="flex-1 min-h-0 overflow-y-auto [scrollbar-gutter:stable]">
                        <table className="w-full table-fixed text-left text-xs border-collapse">
                          {txColGroup}
                          <thead>
                            <tr className={cn('bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider', refined ? '[&>th]:font-medium text-slate-600' : '[&>th]:font-semibold text-slate-600')}>
                              <th className="py-2.5 px-3">Date & Time</th>
                              <th className="py-2.5 px-3">IPO Name</th>
                              <th className="py-2.5 px-3 text-right">Quantity</th>
                              <th className="py-2.5 px-3 text-right">Price</th>
                              <th className="py-2.5 px-3 text-right">Amount</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {filteredTransactions.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="py-8 text-center text-slate-500 text-xs">
                                  <div className="flex flex-col items-center justify-center gap-1.5">
                                    <AlertCircle className="w-5 h-5 text-slate-300" />
                                    <span>No record found</span>
                                  </div>
                                </td>
                              </tr>
                            ) : (
                              filteredTransactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                                  <td className={cn('py-2.5 px-3 whitespace-nowrap', refined ? 'font-normal text-xs text-slate-600' : 'font-medium text-[11px] text-slate-700')}>
                                    {tx.dateTime}
                                  </td>
                                  <td className={cn('py-2.5 px-3 truncate', refined ? 'font-normal text-slate-800' : 'font-medium text-slate-900')}>
                                    {ipoTicker(tx.ipoName)}
                                  </td>
                                  <td className={cn('py-2.5 px-3 text-right font-mono', refined ? 'font-normal text-slate-700' : 'font-semibold text-slate-800')}>
                                    {tx.quantity.toLocaleString()}
                                  </td>
                                  <td className={cn('py-2.5 px-3 text-right font-mono', refined ? 'text-slate-500' : 'text-slate-600')}>
                                    ${tx.price.toFixed(2)}
                                  </td>
                                  <td className={cn('py-2.5 px-3 text-right font-mono text-slate-900', refined ? 'font-medium' : 'font-semibold')}>
                                    ${tx.tradingValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                      {filteredTransactions.length > 0 && (
                        <div className="overflow-y-hidden [scrollbar-gutter:stable] bg-slate-50/90 border-t-2 border-slate-200">
                          <table className="w-full table-fixed text-left text-xs border-collapse">
                            {txColGroup}
                            <tbody>
                              <tr>
                                <td colSpan={2} className="py-3 px-3">
                                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-700">
                                    Total
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-right font-mono font-semibold text-slate-900 text-xs">
                                  {transactionTotals.quantity.toLocaleString()}
                                </td>
                                <td className="py-3 px-3 text-right text-slate-400 font-normal">
                                  —
                                </td>
                                <td className="py-3 px-3 text-right font-mono font-semibold text-blue-700 text-sm">
                                  ${transactionTotals.tradingValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* 6. ACTIVITY TIMELINE */}
              <section
                id="c360-activity-timeline-section"
                className="xl:col-span-5 flex flex-col space-y-3 xl:min-h-[520px]"
              >
                <div className="flex items-center justify-between gap-3 xl:h-8 xl:shrink-0">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <h3 className={sectionTitle}>Activity Timeline</h3>
                  </div>
                </div>

                {/* VERTICAL TIMELINE WITH BLUE DOTS & CARD UI */}
                {/* Scroll container owns the height and overflow ONLY. The rail
                    must not live here: an absolutely positioned pseudo-element in
                    a scroll container resolves top/bottom against the visible
                    padding box, so it would span one viewport and scroll away
                    from the dots instead of connecting them. */}
                <div className="border border-slate-200 rounded-xl bg-slate-50/50 p-3 max-h-[440px] xl:max-h-none xl:flex-1 xl:min-h-0 overflow-y-auto">
                  {/* Rail lives on the content wrapper, so it is sized by the full
                      list height. left-[6px] centres it on the dots: the dots start
                      at x=0 (pl-6 offset, then -left-6) and are 14px wide, so both
                      centre on x=7. */}
                  <div className="relative pl-6 pt-1 space-y-3.5 before:absolute before:left-[6px] before:top-3 before:bottom-3 before:w-[2px] before:bg-blue-100">
                    {customer360Data.activities.map((act) => (
                      <div key={act.id} className="relative group">
                        {/* Blue Node Dot */}
                        <div className="absolute -left-6 top-3 w-3.5 h-3.5 rounded-full border-2 border-white bg-blue-500 shadow-2xs ring-2 ring-blue-100 transition-transform group-hover:scale-110" />

                        {/* Right Side Card UI */}
                        <div className="bg-white hover:bg-slate-50 border border-slate-200/80 rounded-xl p-3 transition-all shadow-2xs hover:shadow-xs hover:border-blue-200">
                          <span className={cn('block', refined ? 'text-xs font-normal text-slate-500' : 'text-[11px] font-medium text-slate-500')}>
                            {act.dateTime}
                          </span>

                          {/* Activity, then its qualifier inline: the reference id
                              for product registrations, or the approver's role for
                              the onboarding steps, which carry no reference. */}
                          <h4 className={cn('mt-0.5', refined ? 'text-[13px] font-medium text-slate-900' : 'text-xs font-semibold text-slate-900')}>
                            {act.activity}
                            {(act.referenceId || act.role) && (
                              <span className="font-normal text-slate-500">
                                {' · '}
                                {act.referenceId || act.role}
                              </span>
                            )}
                          </h4>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
