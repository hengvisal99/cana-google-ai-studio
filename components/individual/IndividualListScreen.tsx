'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { 
  Individual, 
  DesignTheme, 
  RequestStatus, 
  RequestType, 
  WorkflowStage, 
  Gender, 
  MaritalStatus,
  AccountStatus 
} from '@/types';
import { 
  Search, 
  Plus, 
  Eye, 
  Edit3, 
  Trash2, 
  RotateCw, 
  Filter, 
  Columns, 
  Download, 
  MoreVertical, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  X, 
  FileText, 
  User, 
  UserPlus, 
  Lock, 
  Check,
  UserCheck,
  ChevronRight,
  Sparkles,
  Sliders,
  Layers,
  Zap,
  SlidersHorizontal,
  LayoutGrid,
  Sun,
  Globe,
  Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface IndividualListScreenProps {
  individuals: Individual[];
  onViewIndividual: (individual: Individual) => void;
  onNavigateToInsert: () => void;
  onNavigateToUpdate: (individual: Individual) => void;
  onNavigateToCustomer360: (individual: Individual) => void;
  onDeleteIndividual: (id: string) => void;
  onAuthorizeIndividual?: (
    id: string,
    action: 'authorize' | 'resubmit' | 'reject',
    role: 'CSO' | 'SR' | 'Manager',
    processedBy: string,
    comment: string,
    reason?: string
  ) => void;
  onCloseAccountIndividual?: (
    id: string,
    closeDate: string,
    account: string,
    reason: string,
    processedBy: string
  ) => void;
  onReload?: () => void;
  theme: DesignTheme;
}

type SearchByField = 'all' | 'customerName' | 'accountNo' | 'roName' | 'roId';

const SEARCH_FIELD_OPTIONS: { id: SearchByField; label: string; placeholder: string }[] = [
  { id: 'all', label: 'ALL FIELDS', placeholder: 'RUN ID SEARCH' },
  { id: 'customerName', label: 'CUSTOMER NAME', placeholder: 'SEARCH CUSTOMER NAME' },
  { id: 'accountNo', label: 'ACCOUNT NO', placeholder: 'SEARCH ACCOUNT NO' },
  { id: 'roName', label: 'RO NAME', placeholder: 'SEARCH RO NAME' },
  { id: 'roId', label: 'RO ID', placeholder: 'SEARCH RO ID' },
];

interface ColumnConfig {
  id: string;
  label: string;
  isDefault: boolean;
  visible: boolean;
}

export function IndividualListScreen({
  individuals,
  onViewIndividual,
  onNavigateToInsert,
  onNavigateToUpdate,
  onNavigateToCustomer360,
  onDeleteIndividual,
  onAuthorizeIndividual,
  onCloseAccountIndividual,
  onReload,
  theme,
}: IndividualListScreenProps) {
  // Light Mode Theme State: 'reference' | 'neo-prism' | 'nordic-studio' | 'command-matrix'
  const [lightTheme, setLightTheme] = useState<'reference' | 'neo-prism' | 'nordic-studio' | 'command-matrix'>('reference');

  // Status Tab filter: Approved | Resubmit | Pending | Rejected | All
  const [statusTab, setStatusTab] = useState<'ALL' | RequestStatus>('ALL');

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState<SearchByField>('all');
  const [isSearchByOpen, setIsSearchByOpen] = useState(false);

  // Filter fields
  const [showFilterPanel, setShowFilterPanel] = useState(true);
  const [genderFilter, setGenderFilter] = useState<string>('ALL');
  const [maritalFilter, setMaritalFilter] = useState<string>('ALL');
  const [nationalityFilter, setNationalityFilter] = useState<string>('ALL');
  const [requestTypeFilter, setRequestTypeFilter] = useState<string>('ALL');

  const activeFilterCount = [
    genderFilter !== 'ALL',
    maritalFilter !== 'ALL',
    nationalityFilter !== 'ALL',
    requestTypeFilter !== 'ALL',
  ].filter(Boolean).length;
  const hasActiveFilters = activeFilterCount > 0;

  // Three-dot action menu tracking
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);

  // Customize Columns modal state
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [columnSearch, setColumnSearch] = useState('');
  const [columns, setColumns] = useState<ColumnConfig[]>([
    { id: 'gender', label: 'Gender', isDefault: false, visible: false },
    { id: 'maritalStatus', label: 'Marital Status', isDefault: false, visible: false },
    { id: 'nationality', label: 'Nationality', isDefault: false, visible: false },
    { id: 'dob', label: 'Date of Birth', isDefault: false, visible: false },
    { id: 'email', label: 'Email Address', isDefault: false, visible: false },
    { id: 'mobile', label: 'Mobile Number', isDefault: false, visible: false },
    { id: 'residency', label: 'Residency', isDefault: false, visible: false },
    { id: 'idNumber', label: 'ID Number', isDefault: false, visible: false },
    { id: 'taxpayerId', label: 'Taxpayer ID', isDefault: false, visible: false },
    { id: 'riskCategory', label: 'Risk Rating', isDefault: false, visible: false },
    { id: 'securitiesKnowledge', label: 'Securities Knowledge', isDefault: false, visible: false },
  ]);

  // Authorization Modal state
  const [authModalIndividual, setAuthModalIndividual] = useState<Individual | null>(null);
  const [authRole, setAuthRole] = useState<'CSO' | 'SR' | 'Manager'>('SR');
  const [authOfficer, setAuthOfficer] = useState('Dara Vong (SR)');
  const [authComment, setAuthComment] = useState('');
  const [authReason, setAuthReason] = useState('');
  const [authActionType, setAuthActionType] = useState<'authorize' | 'resubmit' | 'reject'>('authorize');

  // Close Account Modal state
  const [closeAccountIndividual, setCloseAccountModalIndividual] = useState<Individual | null>(null);
  const [closeDate, setCloseDate] = useState('2026-09-09');
  const [closeAccountName, setCloseAccountName] = useState('');
  const [closeReason, setCloseReason] = useState('');
  const [closeOfficer, setCloseOfficer] = useState('Sophea Keo (CSO)');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };


  // Delete Confirmation Modal state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Status Tab counts
  const countAll = individuals.length;
  const countApproved = individuals.filter((i) => i.requestStatus === 'Approved').length;
  const countResubmit = individuals.filter((i) => i.requestStatus === 'Resubmit').length;
  const countPending = individuals.filter((i) => i.requestStatus === 'Pending').length;
  const countRejected = individuals.filter((i) => i.requestStatus === 'Rejected').length;

  // Extract unique nationalities for filter dropdown
  const uniqueNationalities = useMemo(() => {
    const list = Array.from(new Set(individuals.map((i) => i.nationality).filter(Boolean)));
    return list.sort();
  }, [individuals]);

  // Filtered & Sorted individuals
  const filteredData = useMemo(() => {
    return individuals
      .filter((item) => {
        // Status tab filter
        if (statusTab !== 'ALL' && item.requestStatus !== statusTab) {
          return false;
        }

        // Search term matching
        if (searchTerm.trim() !== '') {
          const query = searchTerm.toLowerCase();

          if (searchBy === 'customerName') {
            const nameCombined = `${item.fullNameEN || ''} ${item.fullNameKH || ''} ${item.firstName || ''} ${item.lastName || ''} ${item.surnameEN || ''} ${item.givenNameEN || ''} ${item.surnameKH || ''} ${item.givenNameKH || ''}`.toLowerCase();
            if (!nameCombined.includes(query)) return false;
          } else if (searchBy === 'accountNo') {
            const accCombined = `${item.tradingAccountInfo?.tradingAccountNumber || ''} ${item.banking?.accountNumber || ''} ${item.banking?.savingAccount || ''} ${item.investorIdInfo?.investorIdNumber || ''}`.toLowerCase();
            if (!accCombined.includes(query)) return false;
          } else if (searchBy === 'roName') {
            const roCombined = `${item.tradingAccountInfo?.currentAssignedSR || ''} ${item.tradingAccountInfo?.accountCheckedBy || ''} ${item.tradingAccountInfo?.accountApprovedBy || ''}`.toLowerCase();
            if (!roCombined.includes(query)) return false;
          } else if (searchBy === 'roId') {
            const roIdCombined = `${item.tradingAccountInfo?.currentAssignedSR || ''} ${item.customerId || ''} ${item.id || ''} ${item.idNumber || ''}`.toLowerCase();
            if (!roIdCombined.includes(query)) return false;
          } else {
            // 'all': matches across ID, Customer Name, Account No, RO Name, RO ID, Email
            const allCombined = `${item.customerId || ''} ${item.id || ''} ${item.fullNameEN || ''} ${item.fullNameKH || ''} ${item.firstName || ''} ${item.lastName || ''} ${item.email || ''} ${item.tradingAccountInfo?.tradingAccountNumber || ''} ${item.tradingAccountInfo?.currentAssignedSR || ''} ${item.banking?.accountNumber || ''} ${item.idNumber || ''}`.toLowerCase();
            if (!allCombined.includes(query)) return false;
          }
        }

        // Field filters
        if (genderFilter !== 'ALL' && item.gender !== genderFilter) return false;
        if (maritalFilter !== 'ALL' && item.maritalStatus !== maritalFilter) return false;
        if (nationalityFilter !== 'ALL' && item.nationality !== nationalityFilter) return false;
        if (requestTypeFilter !== 'ALL' && item.requestType !== requestTypeFilter) return false;

        return true;
      });
  }, [
    individuals,
    statusTab,
    searchTerm,
    searchBy,
    genderFilter,
    maritalFilter,
    nationalityFilter,
    requestTypeFilter,
  ]);

  // Column toggle helper
  const isColVisible = (colId: string) => {
    const col = columns.find((c) => c.id === colId);
    return col ? col.visible : false;
  };

  const handleToggleColumn = (colId: string) => {
    setColumns((prev) =>
      prev.map((c) => (c.id === colId ? { ...c, visible: !c.visible } : c))
    );
  };

  // Export action
  const handleExport = (format: 'csv' | 'json') => {
    if (format === 'csv') {
      const headers = ['No', 'Customer ID', 'Full Name EN', 'Full Name KH', 'Gender', 'Nationality', 'Profile Status', 'Account Status', 'Request Type', 'Request Status', 'Workflow Stage'];
      const rows = filteredData.map((item, idx) => [
        idx + 1,
        item.customerId || item.id,
        `"${item.fullNameEN || `${item.firstName} ${item.lastName}`}"`,
        `"${item.fullNameKH || ''}"`,
        item.gender,
        item.nationality,
        item.profileStatus,
        item.accountStatus,
        item.requestType,
        item.requestStatus,
        item.currentWorkflowStage,
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `individual_directory_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      triggerToast(`Exported ${filteredData.length} records to CSV successfully.`);
    } else {
      const jsonStr = JSON.stringify(filteredData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `individual_directory_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      triggerToast(`Exported ${filteredData.length} records to JSON successfully.`);
    }
  };

  // Reload handler
  const handleReloadClick = () => {
    if (onReload) onReload();
    triggerToast('Directory refreshed with latest server records.');
  };

  // Reset filters
  const handleResetFilters = () => {
    setGenderFilter('ALL');
    setMaritalFilter('ALL');
    setNationalityFilter('ALL');
    setRequestTypeFilter('ALL');
    setSearchTerm('');
    setSearchBy('all');
    triggerToast('Directory filters have been reset.');
  };

  // Workflow Authorization submission
  const handleSubmitAuthorization = () => {
    if (!authModalIndividual || !onAuthorizeIndividual) return;
    if (authActionType !== 'authorize' && !authReason.trim()) {
      alert('Please provide a reason for ' + authActionType);
      return;
    }

    onAuthorizeIndividual(
      authModalIndividual.id,
      authActionType,
      authRole,
      authOfficer,
      authComment || `Decision recorded by ${authOfficer} (${authRole}).`,
      authReason
    );

    triggerToast(`Customer ${authModalIndividual.customerId || authModalIndividual.id} workflow updated: ${authActionType.toUpperCase()}`);
    setAuthModalIndividual(null);
    setAuthComment('');
    setAuthReason('');
  };

  // Close Account submission
  const handleSubmitCloseAccount = () => {
    if (!closeAccountIndividual || !onCloseAccountIndividual) return;
    if (!closeReason.trim()) {
      alert('Please state a reason for account closure.');
      return;
    }

    onCloseAccountIndividual(
      closeAccountIndividual.id,
      closeDate,
      closeAccountName || `Trading Account ${closeAccountIndividual.tradingAccountInfo?.tradingAccountNumber || 'TRD-DEFAULT'}`,
      closeReason,
      closeOfficer
    );

    triggerToast(`Account closure request submitted for ${closeAccountIndividual.customerId || closeAccountIndividual.id}.`);
    setCloseAccountModalIndividual(null);
    setCloseReason('');
  };

  // Simple status indicator for Profile Status
  const renderProfileStatusBadge = (status: 'Completed' | 'Incomplete') => {
    if (status === 'Completed') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 select-none">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span>Completed</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 select-none">
        <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
        <span>Incomplete</span>
      </span>
    );
  };

  const renderAccountStatusBadge = (status?: AccountStatus) => {
    if (status === 'Active') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Active
        </span>
      );
    }
    if (status === 'Closed') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
          Closed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        Not Opened
      </span>
    );
  };

  const renderRequestBadge = (item: Individual) => {
    const isApproved = item.requestStatus === 'Approved' || item.currentWorkflowStage === 'Approved';
    const isRejected = item.requestStatus === 'Rejected' || item.currentWorkflowStage === 'Rejected';
    const isResubmit = item.requestStatus === 'Resubmit' || item.currentWorkflowStage === 'Resubmit';
    const isPending = item.requestStatus === 'Pending' || (!isApproved && !isRejected && !isResubmit);

    const requestType = item.requestType || 'Registration';
    const stage = item.currentWorkflowStage || 'SR';

    if (isApproved) {
      return (
        <div className="flex items-start gap-2.5 select-none text-left py-0.5">
          <div className="mt-0.5 shrink-0 text-emerald-600">
            <Check className="w-4 h-4 text-emerald-600" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-bold text-slate-900 leading-tight">
              Approved
            </span>
            <span className="text-[11px] text-slate-500 font-normal leading-tight mt-0.5">
              {requestType}
            </span>
          </div>
        </div>
      );
    }

    if (isPending) {
      return (
        <div className="flex items-start gap-2.5 select-none text-left py-0.5">
          <div className="mt-0.5 shrink-0 text-amber-600">
            <Clock className="w-4 h-4 text-amber-600" strokeWidth={2.2} />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1 leading-tight">
              <span className="text-[13px] font-bold text-slate-900">
                Pending
              </span>
              <span className="text-slate-400 font-semibold text-xs">·</span>
              <span className="text-slate-600 font-semibold text-xs">{stage}</span>
            </div>
            <span className="text-[11px] text-slate-500 font-normal leading-tight mt-0.5">
              {requestType}
            </span>
          </div>
        </div>
      );
    }

    if (isRejected) {
      return (
        <div className="flex items-start gap-2.5 select-none text-left py-0.5">
          <div className="mt-0.5 shrink-0 text-rose-600">
            <X className="w-4 h-4 text-rose-600" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1 leading-tight">
              <span className="text-[13px] font-bold text-slate-900">
                Rejected
              </span>
              <span className="text-slate-400 font-semibold text-xs">·</span>
              <span className="text-slate-600 font-semibold text-xs">{stage}</span>
            </div>
            <span className="text-[11px] text-slate-500 font-normal leading-tight mt-0.5">
              {requestType}
            </span>
          </div>
        </div>
      );
    }

    // Resubmit state
    return (
      <div className="flex items-start gap-2.5 select-none text-left py-0.5">
        <div className="mt-0.5 shrink-0 text-amber-600">
          <Clock className="w-4 h-4 text-amber-600" strokeWidth={2.2} />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1 leading-tight">
            <span className="text-[13px] font-bold text-slate-900">
              Resubmit
            </span>
            <span className="text-slate-400 font-semibold text-xs">·</span>
            <span className="text-slate-600 font-semibold text-xs">{stage}</span>
          </div>
          <span className="text-[11px] text-slate-500 font-normal leading-tight mt-0.5">
            {requestType}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div id="individual-list-screen" className="space-y-5">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-xl text-xs font-medium border border-slate-700 transition-all animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* THEME 1: SOFT-FINTECH (Institutional Banking / Bloomberg Terminal Layout) */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* UNIFIED DIRECTORY HEADER & ACTION BAR                                      */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-sans">
                Individual Directory
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Manage individual client onboarding, document verification, authorization lifecycle, and trading profiles.
            </p>
          </div>

          {/* Grouped Enterprise Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center rounded-xl border border-slate-200 bg-white p-0.5 shadow-2xs divide-x divide-slate-100">
              {/* Reload */}
              <button
                id="btn-individual-reload"
                onClick={handleReloadClick}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition rounded-l-lg cursor-pointer"
                title="Reload data from server"
              >
                <RotateCw className="w-3.5 h-3.5 text-slate-500" />
                <span>Reload</span>
              </button>

              {/* Filter */}
              <button
                id="btn-individual-filter-toggle"
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition cursor-pointer',
                  showFilterPanel
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                )}
                title="Toggle Filters"
              >
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <span>Filter</span>
                {hasActiveFilters && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                )}
              </button>

              {/* Columns */}
              <button
                id="btn-individual-customize-columns"
                onClick={() => setShowCustomizeModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                title="Configure Table Columns"
              >
                <Columns className="w-3.5 h-3.5 text-slate-500" />
                <span>Columns</span>
                {columns.filter((c) => c.visible).length > 0 && (
                  <span className="px-1.5 py-0.2 text-[10px] font-mono font-bold rounded bg-blue-100 text-blue-700">
                    {columns.filter((c) => c.visible).length}
                  </span>
                )}
              </button>

              {/* Export */}
              <div className="relative group">
                <button
                  id="btn-individual-export"
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition rounded-r-lg cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Export</span>
                </button>
                <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-slate-200 rounded-xl shadow-lg hidden group-hover:block z-20 py-1 text-xs">
                  <button
                    onClick={() => handleExport('csv')}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 font-medium"
                  >
                    Export as CSV
                  </button>
                  <button
                    onClick={() => handleExport('json')}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 font-medium"
                  >
                    Export as JSON
                  </button>
                </div>
              </div>
            </div>

            {/* Primary Add New Button */}
            <button
              id="btn-individual-add-new"
              onClick={onNavigateToInsert}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Individual</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* LIGHT MODE THEME TOGGLE (OUTSIDE THE MAIN CARD)                           */}
      {/* ========================================================================= */}
      <div 
        id="light-mode-theme-toggle-bar"
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 bg-white border border-slate-200/90 rounded-2xl px-5 py-3.5 shadow-2xs"
      >
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-slate-700 shrink-0">
            <Sun className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Light Mode Themes:
            </span>
          </div>

          <div className="inline-flex items-center p-1 bg-slate-100/90 border border-slate-200/80 rounded-xl shadow-inner-xs flex-wrap gap-1">
            {/* 1. Reference (Current) */}
            <button
              type="button"
              id="btn-theme-reference"
              onClick={() => setLightTheme('reference')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none',
                lightTheme === 'reference'
                  ? 'bg-white text-blue-600 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>1. Reference (Default)</span>
            </button>

            {/* 2. Neo-Prism */}
            <button
              type="button"
              id="btn-theme-neo-prism"
              onClick={() => setLightTheme('neo-prism')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none',
                lightTheme === 'neo-prism'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              )}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>2. Neo-Prism</span>
            </button>

            {/* 3. Nordic Studio */}
            <button
              type="button"
              id="btn-theme-nordic-studio"
              onClick={() => setLightTheme('nordic-studio')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none',
                lightTheme === 'nordic-studio'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              )}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>3. Nordic Studio</span>
            </button>

            {/* 4. Command Matrix */}
            <button
              type="button"
              id="btn-theme-command-matrix"
              onClick={() => setLightTheme('command-matrix')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none',
                lightTheme === 'command-matrix'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              )}
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>4. Command Matrix</span>
            </button>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 font-medium hidden lg:flex items-center gap-1.5">
          {lightTheme === 'reference' && (
            <span className="text-slate-600 font-medium">1. Classic reference light layout with soft capsule rail</span>
          )}
          {lightTheme === 'neo-prism' && (
            <span className="text-blue-700 font-medium">2. Executive modern light with glowing status dots & obsidian search</span>
          )}
          {lightTheme === 'nordic-studio' && (
            <span className="text-blue-900 font-medium">3. High-definition royal blue studio styling with frosty capsule rails</span>
          )}
          {lightTheme === 'command-matrix' && (
            <span className="text-indigo-700 font-medium">4. Linear precision light layout with indigo accents & monospace counts</span>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* THEME 1: REFERENCE (CURRENT - MATCHING REFERENCE IMAGE)                   */}
      {/* ========================================================================= */}
      {lightTheme === 'reference' && (
        <div
          id="individual-filter-section-reference"
          className="bg-white border border-slate-200/90 rounded-[28px] p-5 sm:p-6 shadow-xs space-y-5"
        >
          {/* Row 1: Status Pills + Search Capsule Bar */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Status Tabs (Exact Image Design: All Requests, Approved, Resubmit, Pending, Rejected with Icons and Badges) */}
            <div className="inline-flex items-center gap-1.5 p-1.5 bg-[#f0f4f9] border border-slate-200/70 rounded-2xl shrink-0 overflow-x-auto max-w-full scrollbar-none">
              {[
                { 
                  id: 'ALL' as const, 
                  label: 'All Requests', 
                  count: countAll, 
                  icon: null,
                  iconColor: ''
                },
                { 
                  id: 'Approved' as const, 
                  label: 'Approved', 
                  count: countApproved, 
                  icon: CheckCircle2,
                  iconColor: 'text-emerald-500'
                },
                { 
                  id: 'Resubmit' as const, 
                  label: 'Resubmit', 
                  count: countResubmit, 
                  icon: AlertCircle,
                  iconColor: 'text-amber-500'
                },
                { 
                  id: 'Pending' as const, 
                  label: 'Pending', 
                  count: countPending, 
                  icon: Clock,
                  iconColor: 'text-blue-500'
                },
                { 
                  id: 'Rejected' as const, 
                  label: 'Rejected', 
                  count: countRejected, 
                  icon: AlertTriangle,
                  iconColor: 'text-rose-500'
                },
              ].map((tab) => {
                const isActive = statusTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    id={`tab-status-${tab.id.toLowerCase()}`}
                    onClick={() => setStatusTab(tab.id)}
                    className={cn(
                      'h-9 px-3.5 sm:px-4 inline-flex items-center gap-2 text-xs sm:text-[13px] transition-all cursor-pointer whitespace-nowrap select-none',
                      isActive
                        ? 'bg-white rounded-xl shadow-xs border border-slate-200/90 text-blue-600 font-bold'
                        : 'text-slate-700 hover:text-slate-900 font-medium rounded-xl hover:bg-white/50'
                    )}
                  >
                    {Icon && <Icon className={cn('w-4 h-4 shrink-0 stroke-[2.2]', tab.iconColor)} />}
                    <span>{tab.label}</span>
                    <span
                      className={cn(
                        'px-2 py-0.5 min-w-[20px] text-center rounded-md sm:rounded-full text-[11px] font-semibold leading-none transition-colors',
                        isActive
                          ? 'bg-blue-50 text-blue-600'
                          : 'bg-slate-200/70 text-slate-600'
                      )}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search & Field Selection Grouped Capsule (Field Group) */}
            <div className="relative flex items-center max-w-lg w-full">
              <div className="w-full flex items-center bg-white border border-slate-200/90 rounded-full p-1 shadow-2xs focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                {/* Field Selection Addon */}
                <div className="relative shrink-0">
                  <button
                    type="button"
                    id="btn-search-by-dropdown"
                    onClick={() => setIsSearchByOpen(!isSearchByOpen)}
                    className="h-8 flex items-center gap-1.5 px-3.5 bg-blue-50 hover:bg-blue-100/90 border border-blue-200/80 rounded-full text-xs font-bold text-blue-600 transition shrink-0 select-none cursor-pointer"
                  >
                    <span>{SEARCH_FIELD_OPTIONS.find((o) => o.id === searchBy)?.label || 'ALL FIELDS'}</span>
                    {isSearchByOpen ? (
                      <ChevronUp className="w-3.5 h-3.5 text-blue-600" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-blue-600" />
                    )}
                  </button>

                  {/* Field Dropdown Menu */}
                  {isSearchByOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsSearchByOpen(false)} />
                      <div className="absolute left-0 top-full mt-2 w-60 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95">
                        <div className="space-y-1">
                          {SEARCH_FIELD_OPTIONS.map((opt) => {
                            const isSelected = searchBy === opt.id;
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => {
                                  setSearchBy(opt.id);
                                  setIsSearchByOpen(false);
                                }}
                                className={cn(
                                  'w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition text-left cursor-pointer',
                                  isSelected
                                    ? 'text-blue-600 bg-blue-50'
                                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                                )}
                              >
                                <span>{opt.label}</span>
                                {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0 ml-2" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Search Input Box */}
                <div className="relative flex-1 flex items-center px-3">
                  <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2 pointer-events-none" />
                  <input
                    id="individual-search-input"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={SEARCH_FIELD_OPTIONS.find((o) => o.id === searchBy)?.placeholder || 'RUN ID SEARCH'}
                    className="w-full bg-transparent text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none uppercase tracking-wide"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded-full transition cursor-pointer"
                      title="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: 4-Dropdown Filter Console (Combined in the same card) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-2">
            {/* 1. Gender */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 tracking-wider uppercase mb-2">
                GENDER
              </label>
              <div className="relative">
                <select
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value)}
                  className="w-full h-10 px-4 text-xs bg-white border border-slate-200 rounded-full text-slate-700 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer appearance-none pr-10"
                >
                  <option value="ALL">All Genders</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* 2. Marital Status */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 tracking-wider uppercase mb-2">
                MARITAL STATUS
              </label>
              <div className="relative">
                <select
                  value={maritalFilter}
                  onChange={(e) => setMaritalFilter(e.target.value)}
                  className="w-full h-10 px-4 text-xs bg-white border border-slate-200 rounded-full text-slate-700 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer appearance-none pr-10"
                >
                  <option value="ALL">All Marital Statuses</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* 3. Nationality */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 tracking-wider uppercase mb-2">
                NATIONALITY
              </label>
              <div className="relative">
                <select
                  value={nationalityFilter}
                  onChange={(e) => setNationalityFilter(e.target.value)}
                  className="w-full h-10 px-4 text-xs bg-white border border-slate-200 rounded-full text-slate-700 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer appearance-none pr-10"
                >
                  <option value="ALL">All Nationalities</option>
                  {uniqueNationalities.map((nat) => (
                    <option key={nat} value={nat}>
                      {nat}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* 4. Request Type */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 tracking-wider uppercase mb-2">
                REQUEST TYPE
              </label>
              <div className="relative">
                <select
                  value={requestTypeFilter}
                  onChange={(e) => setRequestTypeFilter(e.target.value)}
                  className="w-full h-10 px-4 text-xs bg-white border border-slate-200 rounded-full text-slate-700 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer appearance-none pr-10"
                >
                  <option value="ALL">All Request Types</option>
                  <option value="Registration">Registration</option>
                  <option value="Close Account">Close Account</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Optional Reset filters indicator if filtered */}
          {(hasActiveFilters || searchTerm) && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-500">
                Filtered: <strong className="text-slate-800">{filteredData.length}</strong> of {individuals.length} records
              </span>
              <button
                onClick={handleResetFilters}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* THEME 2: NEO-PRISM (EXECUTIVE MODERN LIGHT - IDENTICAL LAYOUT)             */}
      {/* ========================================================================= */}
      {lightTheme === 'neo-prism' && (
        <div
          id="individual-filter-section-neo-prism"
          className="bg-white border border-slate-200/90 rounded-[28px] p-5 sm:p-6 shadow-xs space-y-5 relative overflow-hidden"
        >
          {/* Subtle top accent gradient */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500" />

          {/* Row 1: Status Pills + Search Capsule Bar */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Status Tabs Capsule rail */}
            <div className="inline-flex items-center gap-1.5 p-1.5 bg-slate-100/90 border border-slate-200/80 rounded-2xl shrink-0 overflow-x-auto max-w-full scrollbar-none shadow-inner-xs">
              {[
                { 
                  id: 'ALL' as const, 
                  label: 'All Requests', 
                  count: countAll, 
                  icon: null,
                  iconColor: '',
                  activeBadge: 'bg-slate-900 text-white'
                },
                { 
                  id: 'Approved' as const, 
                  label: 'Approved', 
                  count: countApproved, 
                  icon: CheckCircle2,
                  iconColor: 'text-emerald-500',
                  activeBadge: 'bg-emerald-600 text-white'
                },
                { 
                  id: 'Resubmit' as const, 
                  label: 'Resubmit', 
                  count: countResubmit, 
                  icon: AlertCircle,
                  iconColor: 'text-amber-500',
                  activeBadge: 'bg-amber-600 text-white'
                },
                { 
                  id: 'Pending' as const, 
                  label: 'Pending', 
                  count: countPending, 
                  icon: Clock,
                  iconColor: 'text-blue-500',
                  activeBadge: 'bg-blue-600 text-white'
                },
                { 
                  id: 'Rejected' as const, 
                  label: 'Rejected', 
                  count: countRejected, 
                  icon: AlertTriangle,
                  iconColor: 'text-rose-500',
                  activeBadge: 'bg-rose-600 text-white'
                },
              ].map((tab) => {
                const isActive = statusTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    id={`neo-tab-status-${tab.id.toLowerCase()}`}
                    onClick={() => setStatusTab(tab.id)}
                    className={cn(
                      'h-9 px-3.5 sm:px-4 inline-flex items-center gap-2 text-xs sm:text-[13px] transition-all cursor-pointer whitespace-nowrap select-none',
                      isActive
                        ? 'bg-white rounded-xl shadow-xs border border-slate-200 text-slate-900 font-bold'
                        : 'text-slate-600 hover:text-slate-900 font-medium rounded-xl hover:bg-white/60'
                    )}
                  >
                    {Icon && <Icon className={cn('w-4 h-4 shrink-0 stroke-[2.2]', tab.iconColor)} />}
                    <span>{tab.label}</span>
                    <span
                      className={cn(
                        'px-2 py-0.5 min-w-[20px] text-center rounded-md sm:rounded-full text-[11px] font-bold leading-none transition-colors',
                        isActive
                          ? tab.activeBadge
                          : 'bg-slate-200/80 text-slate-600'
                      )}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search & Field Selection Grouped Capsule (Field Group) */}
            <div className="relative flex items-center max-w-lg w-full">
              <div className="w-full flex items-center bg-white border border-slate-200/90 rounded-full p-1 shadow-2xs focus-within:border-slate-800 focus-within:ring-2 focus-within:ring-slate-200 transition-all">
                {/* Field Selection Addon */}
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsSearchByOpen(!isSearchByOpen)}
                    className="h-8 flex items-center gap-1.5 px-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full text-xs font-bold transition shrink-0 select-none cursor-pointer shadow-2xs"
                  >
                    <span>{SEARCH_FIELD_OPTIONS.find((o) => o.id === searchBy)?.label || 'ALL FIELDS'}</span>
                    {isSearchByOpen ? (
                      <ChevronUp className="w-3.5 h-3.5 text-slate-300" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-300" />
                    )}
                  </button>

                  {/* Field Dropdown Menu */}
                  {isSearchByOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsSearchByOpen(false)} />
                      <div className="absolute left-0 top-full mt-2 w-60 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95">
                        <div className="space-y-1">
                          {SEARCH_FIELD_OPTIONS.map((opt) => {
                            const isSelected = searchBy === opt.id;
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => {
                                  setSearchBy(opt.id);
                                  setIsSearchByOpen(false);
                                }}
                                className={cn(
                                  'w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition text-left cursor-pointer',
                                  isSelected
                                    ? 'text-slate-900 bg-slate-100 font-black'
                                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                                )}
                              >
                                <span>{opt.label}</span>
                                {isSelected && <Check className="w-4 h-4 text-slate-900 shrink-0 ml-2" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Search Input Box */}
                <div className="relative flex-1 flex items-center px-3">
                  <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={SEARCH_FIELD_OPTIONS.find((o) => o.id === searchBy)?.placeholder || 'RUN ID SEARCH'}
                    className="w-full bg-transparent text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none uppercase tracking-wide"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded-full transition cursor-pointer"
                      title="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: 4-Dropdown Filter Console */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-2">
            {/* 1. Gender */}
            <div>
              <label className="block text-[11px] font-bold text-slate-800 tracking-wider uppercase mb-2">
                GENDER
              </label>
              <div className="relative">
                <select
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value)}
                  className="w-full h-10 px-4 text-xs bg-slate-50/70 hover:bg-white border border-slate-200 hover:border-slate-300 rounded-full text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-slate-400 font-semibold cursor-pointer appearance-none pr-10 transition-all"
                >
                  <option value="ALL">All Genders</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* 2. Marital Status */}
            <div>
              <label className="block text-[11px] font-bold text-slate-800 tracking-wider uppercase mb-2">
                MARITAL STATUS
              </label>
              <div className="relative">
                <select
                  value={maritalFilter}
                  onChange={(e) => setMaritalFilter(e.target.value)}
                  className="w-full h-10 px-4 text-xs bg-slate-50/70 hover:bg-white border border-slate-200 hover:border-slate-300 rounded-full text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-slate-400 font-semibold cursor-pointer appearance-none pr-10 transition-all"
                >
                  <option value="ALL">All Marital Statuses</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* 3. Nationality */}
            <div>
              <label className="block text-[11px] font-bold text-slate-800 tracking-wider uppercase mb-2">
                NATIONALITY
              </label>
              <div className="relative">
                <select
                  value={nationalityFilter}
                  onChange={(e) => setNationalityFilter(e.target.value)}
                  className="w-full h-10 px-4 text-xs bg-slate-50/70 hover:bg-white border border-slate-200 hover:border-slate-300 rounded-full text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-slate-400 font-semibold cursor-pointer appearance-none pr-10 transition-all"
                >
                  <option value="ALL">All Nationalities</option>
                  {uniqueNationalities.map((nat) => (
                    <option key={nat} value={nat}>
                      {nat}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* 4. Request Type */}
            <div>
              <label className="block text-[11px] font-bold text-slate-800 tracking-wider uppercase mb-2">
                REQUEST TYPE
              </label>
              <div className="relative">
                <select
                  value={requestTypeFilter}
                  onChange={(e) => setRequestTypeFilter(e.target.value)}
                  className="w-full h-10 px-4 text-xs bg-slate-50/70 hover:bg-white border border-slate-200 hover:border-slate-300 rounded-full text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-slate-400 font-semibold cursor-pointer appearance-none pr-10 transition-all"
                >
                  <option value="ALL">All Request Types</option>
                  <option value="Registration">Registration</option>
                  <option value="Close Account">Close Account</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Active Filter summary indicator if filtered */}
          {(hasActiveFilters || searchTerm) && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-500">
                Filtered: <strong className="text-slate-800">{filteredData.length}</strong> of {individuals.length} records
              </span>
              <button
                onClick={handleResetFilters}
                className="text-xs font-bold text-slate-900 hover:text-blue-600 hover:underline cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* THEME 3: NORDIC STUDIO (HIGH-DEFINITION ROYAL BLUE - IDENTICAL LAYOUT)     */}
      {/* ========================================================================= */}
      {lightTheme === 'nordic-studio' && (
        <div
          id="individual-filter-section-nordic-studio"
          className="bg-[#fbfcfd] border border-blue-100/90 rounded-[28px] p-5 sm:p-6 shadow-[0_4px_20px_-4px_rgba(30,58,138,0.04)] space-y-5"
        >
          {/* Row 1: Status Pills + Search Capsule Bar */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Status Tabs in Frosty Capsule rail */}
            <div className="inline-flex items-center gap-1.5 p-1.5 bg-blue-50/70 border border-blue-100/90 rounded-2xl shrink-0 overflow-x-auto max-w-full scrollbar-none">
              {[
                { 
                  id: 'ALL' as const, 
                  label: 'All Requests', 
                  count: countAll, 
                  icon: null,
                  iconColor: ''
                },
                { 
                  id: 'Approved' as const, 
                  label: 'Approved', 
                  count: countApproved, 
                  icon: CheckCircle2,
                  iconColor: 'text-emerald-500'
                },
                { 
                  id: 'Resubmit' as const, 
                  label: 'Resubmit', 
                  count: countResubmit, 
                  icon: AlertCircle,
                  iconColor: 'text-amber-500'
                },
                { 
                  id: 'Pending' as const, 
                  label: 'Pending', 
                  count: countPending, 
                  icon: Clock,
                  iconColor: 'text-blue-500'
                },
                { 
                  id: 'Rejected' as const, 
                  label: 'Rejected', 
                  count: countRejected, 
                  icon: AlertTriangle,
                  iconColor: 'text-rose-500'
                },
              ].map((tab) => {
                const isActive = statusTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setStatusTab(tab.id)}
                    className={cn(
                      'h-9 px-3.5 sm:px-4 inline-flex items-center gap-2 text-xs sm:text-[13px] transition-all cursor-pointer whitespace-nowrap select-none rounded-xl font-bold',
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs border border-blue-600'
                        : 'text-slate-600 hover:text-blue-900 font-semibold hover:bg-white/80'
                    )}
                  >
                    {Icon && <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-white' : tab.iconColor)} />}
                    <span>{tab.label}</span>
                    <span
                      className={cn(
                        'px-2 py-0.5 min-w-[20px] text-center rounded-md sm:rounded-full text-[11px] font-mono font-bold leading-none transition-colors',
                        isActive
                          ? 'bg-white/25 text-white'
                          : 'bg-blue-100/70 text-blue-800'
                      )}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search & Field Selection Grouped Capsule (Field Group) */}
            <div className="relative flex items-center max-w-lg w-full">
              <div className="w-full flex items-center bg-white border border-blue-200/80 rounded-full p-1 shadow-2xs focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                {/* Field Selection Addon */}
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsSearchByOpen(!isSearchByOpen)}
                    className="h-8 flex items-center gap-1.5 px-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold transition shrink-0 select-none cursor-pointer shadow-xs"
                  >
                    <span>{SEARCH_FIELD_OPTIONS.find((o) => o.id === searchBy)?.label || 'ALL FIELDS'}</span>
                    {isSearchByOpen ? (
                      <ChevronUp className="w-3.5 h-3.5 text-blue-200" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-blue-200" />
                    )}
                  </button>

                  {/* Field Dropdown Menu */}
                  {isSearchByOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsSearchByOpen(false)} />
                      <div className="absolute left-0 top-full mt-2 w-60 bg-white border border-blue-100 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95">
                        <div className="space-y-1">
                          {SEARCH_FIELD_OPTIONS.map((opt) => {
                            const isSelected = searchBy === opt.id;
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => {
                                  setSearchBy(opt.id);
                                  setIsSearchByOpen(false);
                                }}
                                className={cn(
                                  'w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition text-left cursor-pointer',
                                  isSelected
                                    ? 'text-blue-600 bg-blue-50'
                                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                                )}
                              >
                                <span>{opt.label}</span>
                                {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0 ml-2" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Search Input Box */}
                <div className="relative flex-1 flex items-center px-3">
                  <Search className="w-4 h-4 text-blue-400 shrink-0 mr-2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={SEARCH_FIELD_OPTIONS.find((o) => o.id === searchBy)?.placeholder || 'RUN ID SEARCH'}
                    className="w-full bg-transparent text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none uppercase tracking-wide"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded-full transition cursor-pointer"
                      title="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: 4-Dropdown Filter Console */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-2">
            {/* 1. Gender */}
            <div>
              <label className="block text-[11px] font-bold text-blue-950 tracking-wider uppercase mb-2">
                GENDER
              </label>
              <div className="relative">
                <select
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value)}
                  className="w-full h-10 px-4 text-xs bg-white border border-blue-100 hover:border-blue-300 rounded-full text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer appearance-none pr-10 transition-all"
                >
                  <option value="ALL">All Genders</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <ChevronDown className="w-4 h-4 text-blue-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* 2. Marital Status */}
            <div>
              <label className="block text-[11px] font-bold text-blue-950 tracking-wider uppercase mb-2">
                MARITAL STATUS
              </label>
              <div className="relative">
                <select
                  value={maritalFilter}
                  onChange={(e) => setMaritalFilter(e.target.value)}
                  className="w-full h-10 px-4 text-xs bg-white border border-blue-100 hover:border-blue-300 rounded-full text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer appearance-none pr-10 transition-all"
                >
                  <option value="ALL">All Marital Statuses</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
                <ChevronDown className="w-4 h-4 text-blue-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* 3. Nationality */}
            <div>
              <label className="block text-[11px] font-bold text-blue-950 tracking-wider uppercase mb-2">
                NATIONALITY
              </label>
              <div className="relative">
                <select
                  value={nationalityFilter}
                  onChange={(e) => setNationalityFilter(e.target.value)}
                  className="w-full h-10 px-4 text-xs bg-white border border-blue-100 hover:border-blue-300 rounded-full text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer appearance-none pr-10 transition-all"
                >
                  <option value="ALL">All Nationalities</option>
                  {uniqueNationalities.map((nat) => (
                    <option key={nat} value={nat}>
                      {nat}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-blue-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* 4. Request Type */}
            <div>
              <label className="block text-[11px] font-bold text-blue-950 tracking-wider uppercase mb-2">
                REQUEST TYPE
              </label>
              <div className="relative">
                <select
                  value={requestTypeFilter}
                  onChange={(e) => setRequestTypeFilter(e.target.value)}
                  className="w-full h-10 px-4 text-xs bg-white border border-blue-100 hover:border-blue-300 rounded-full text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer appearance-none pr-10 transition-all"
                >
                  <option value="ALL">All Request Types</option>
                  <option value="Registration">Registration</option>
                  <option value="Close Account">Close Account</option>
                </select>
                <ChevronDown className="w-4 h-4 text-blue-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Active Filter summary indicator if filtered */}
          {(hasActiveFilters || searchTerm) && (
            <div className="flex items-center justify-between pt-2 border-t border-blue-100/80">
              <span className="text-xs text-slate-500">
                Filtered: <strong className="text-blue-900">{filteredData.length}</strong> of {individuals.length} records
              </span>
              <button
                onClick={handleResetFilters}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* THEME 4: COMMAND MATRIX (PRECISION INDIGO - IDENTICAL LAYOUT)              */}
      {/* ========================================================================= */}
      {lightTheme === 'command-matrix' && (
        <div
          id="individual-filter-section-command-matrix"
          className="bg-white border border-slate-200/90 rounded-[28px] p-5 sm:p-6 shadow-xs space-y-5"
        >
          {/* Row 1: Status Pills + Search Capsule Bar */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Status Tabs in Linear Precision Capsule rail */}
            <div className="inline-flex items-center gap-1.5 p-1.5 bg-slate-100 border border-slate-200/90 rounded-2xl shrink-0 overflow-x-auto max-w-full scrollbar-none">
              {[
                { 
                  id: 'ALL' as const, 
                  label: 'All Requests', 
                  count: countAll, 
                  icon: null,
                  iconColor: ''
                },
                { 
                  id: 'Approved' as const, 
                  label: 'Approved', 
                  count: countApproved, 
                  icon: CheckCircle2,
                  iconColor: 'text-emerald-500'
                },
                { 
                  id: 'Resubmit' as const, 
                  label: 'Resubmit', 
                  count: countResubmit, 
                  icon: AlertCircle,
                  iconColor: 'text-amber-500'
                },
                { 
                  id: 'Pending' as const, 
                  label: 'Pending', 
                  count: countPending, 
                  icon: Clock,
                  iconColor: 'text-sky-500'
                },
                { 
                  id: 'Rejected' as const, 
                  label: 'Rejected', 
                  count: countRejected, 
                  icon: AlertTriangle,
                  iconColor: 'text-rose-500'
                },
              ].map((tab) => {
                const isActive = statusTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setStatusTab(tab.id)}
                    className={cn(
                      'h-9 px-3.5 sm:px-4 inline-flex items-center gap-2 text-xs sm:text-[13px] transition-all cursor-pointer whitespace-nowrap select-none rounded-xl',
                      isActive
                        ? 'bg-indigo-600 text-white font-bold shadow-xs border border-indigo-600'
                        : 'text-slate-600 hover:text-slate-900 font-semibold hover:bg-slate-200/60'
                    )}
                  >
                    {Icon && <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-white' : tab.iconColor)} />}
                    <span>{tab.label}</span>
                    <span
                      className={cn(
                        'px-2 py-0.5 min-w-[20px] text-center rounded-md sm:rounded-full text-[11px] font-mono font-bold leading-none transition-colors',
                        isActive
                          ? 'bg-indigo-500 text-white'
                          : 'bg-slate-200 text-slate-700'
                      )}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search & Field Selection Grouped Capsule (Field Group) */}
            <div className="relative flex items-center max-w-lg w-full">
              <div className="w-full flex items-center bg-slate-50/80 hover:bg-white border border-slate-200 rounded-full p-1 shadow-2xs focus-within:bg-white focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                {/* Field Selection Addon */}
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsSearchByOpen(!isSearchByOpen)}
                    className="h-8 flex items-center gap-1.5 px-3.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-full text-xs font-bold transition shrink-0 select-none cursor-pointer"
                  >
                    <span>{SEARCH_FIELD_OPTIONS.find((o) => o.id === searchBy)?.label || 'ALL FIELDS'}</span>
                    {isSearchByOpen ? (
                      <ChevronUp className="w-3.5 h-3.5 text-indigo-600" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-indigo-600" />
                    )}
                  </button>

                  {/* Field Dropdown Menu */}
                  {isSearchByOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsSearchByOpen(false)} />
                      <div className="absolute left-0 top-full mt-2 w-60 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95">
                        <div className="space-y-1">
                          {SEARCH_FIELD_OPTIONS.map((opt) => {
                            const isSelected = searchBy === opt.id;
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => {
                                  setSearchBy(opt.id);
                                  setIsSearchByOpen(false);
                                }}
                                className={cn(
                                  'w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition text-left cursor-pointer',
                                  isSelected
                                    ? 'text-indigo-700 bg-indigo-50 font-bold'
                                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                                )}
                              >
                                <span>{opt.label}</span>
                                {isSelected && <Check className="w-4 h-4 text-indigo-600 shrink-0 ml-2" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Search Input Box */}
                <div className="relative flex-1 flex items-center px-3">
                  <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={SEARCH_FIELD_OPTIONS.find((o) => o.id === searchBy)?.placeholder || 'RUN ID SEARCH'}
                    className="w-full bg-transparent text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none uppercase tracking-wide"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded-full transition cursor-pointer"
                      title="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: 4-Dropdown Filter Console */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-2">
            {/* 1. Gender */}
            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-600 tracking-wider uppercase mb-2">
                GENDER
              </label>
              <div className="relative">
                <select
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value)}
                  className="w-full h-10 px-4 text-xs bg-slate-50/50 hover:bg-white border border-slate-200 hover:border-indigo-300 rounded-full text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium cursor-pointer appearance-none pr-10 transition-all"
                >
                  <option value="ALL">All Genders</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* 2. Marital Status */}
            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-600 tracking-wider uppercase mb-2">
                MARITAL STATUS
              </label>
              <div className="relative">
                <select
                  value={maritalFilter}
                  onChange={(e) => setMaritalFilter(e.target.value)}
                  className="w-full h-10 px-4 text-xs bg-slate-50/50 hover:bg-white border border-slate-200 hover:border-indigo-300 rounded-full text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium cursor-pointer appearance-none pr-10 transition-all"
                >
                  <option value="ALL">All Marital Statuses</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* 3. Nationality */}
            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-600 tracking-wider uppercase mb-2">
                NATIONALITY
              </label>
              <div className="relative">
                <select
                  value={nationalityFilter}
                  onChange={(e) => setNationalityFilter(e.target.value)}
                  className="w-full h-10 px-4 text-xs bg-slate-50/50 hover:bg-white border border-slate-200 hover:border-indigo-300 rounded-full text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium cursor-pointer appearance-none pr-10 transition-all"
                >
                  <option value="ALL">All Nationalities</option>
                  {uniqueNationalities.map((nat) => (
                    <option key={nat} value={nat}>
                      {nat}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* 4. Request Type */}
            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-600 tracking-wider uppercase mb-2">
                REQUEST TYPE
              </label>
              <div className="relative">
                <select
                  value={requestTypeFilter}
                  onChange={(e) => setRequestTypeFilter(e.target.value)}
                  className="w-full h-10 px-4 text-xs bg-slate-50/50 hover:bg-white border border-slate-200 hover:border-indigo-300 rounded-full text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium cursor-pointer appearance-none pr-10 transition-all"
                >
                  <option value="ALL">All Request Types</option>
                  <option value="Registration">Registration</option>
                  <option value="Close Account">Close Account</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Active Filter summary indicator if filtered */}
          {(hasActiveFilters || searchTerm) && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-500">
                Filtered: <strong className="text-indigo-900">{filteredData.length}</strong> of {individuals.length} records
              </span>
              <button
                onClick={handleResetFilters}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Table Container with MD default columns + customizable optional columns */}
      <div className={cn(
        'bg-white border border-slate-200 overflow-hidden',
        theme === 'glassmorphism' ? 'rounded-2xl bg-white/85 backdrop-blur-md border-white/80 shadow-md' : 'rounded-xl shadow-xs'
      )}>
        <div className="overflow-x-auto">
          <table id="individual-data-table" className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                {/* Default Column: No */}
                <th className="py-3 px-3 w-12 text-center">No</th>

                {/* Default Column: Customer ID */}
                <th className="py-3 px-4 font-bold text-slate-700 text-left">
                  Customer ID
                </th>

                {/* Default Column: Full Name */}
                <th className="py-3 px-4 font-bold text-slate-700 text-left">
                  Full Name (EN / KH)
                </th>

                {/* Optional Columns (if enabled) */}
                {isColVisible('gender') && <th className="py-3 px-3">Gender</th>}
                {isColVisible('maritalStatus') && <th className="py-3 px-3">Marital</th>}
                {isColVisible('nationality') && <th className="py-3 px-3">Nationality</th>}
                {isColVisible('dob') && <th className="py-3 px-3">Date of Birth</th>}
                {isColVisible('email') && <th className="py-3 px-3">Email</th>}
                {isColVisible('mobile') && <th className="py-3 px-3">Mobile</th>}
                {isColVisible('residency') && <th className="py-3 px-3">Residency</th>}
                {isColVisible('idNumber') && <th className="py-3 px-3">ID Number</th>}
                {isColVisible('taxpayerId') && <th className="py-3 px-3">Taxpayer ID</th>}
                {isColVisible('riskCategory') && <th className="py-3 px-3">Risk Rating</th>}
                {isColVisible('securitiesKnowledge') && <th className="py-3 px-3">Knowledge</th>}

                {/* Default Column: Profile Status */}
                <th className="py-3 px-4">Profile Status</th>

                {/* Default Column: Account Status */}
                <th className="py-3 px-4">Account Status</th>

                {/* Default Column: Request */}
                <th className="py-3 px-4 min-w-[160px] font-bold text-slate-700 text-left">
                  Request
                </th>

                {/* Default Column: Action */}
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileText className="w-8 h-8 text-slate-300" />
                      <p className="font-semibold text-slate-600">No individual records found</p>
                      <p className="text-xs text-slate-400">Try adjusting your status tab, search terms, or filter criteria.</p>
                      <button
                        onClick={handleResetFilters}
                        className="mt-2 text-xs font-bold text-blue-600 hover:underline"
                      >
                        Reset filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => (
                  <tr
                    key={item.id}
                    id={`individual-row-${item.id}`}
                    className="hover:bg-slate-50/75 transition-colors group"
                  >
                    {/* No */}
                    <td className="py-3.5 px-3 text-center text-slate-400 font-mono text-[11px]">
                      {index + 1}
                    </td>

                    {/* Customer ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                      <span
                        onClick={() => onViewIndividual(item)}
                        className="cursor-pointer hover:underline"
                      >
                        {item.customerId || item.id}
                      </span>
                    </td>

                    {/* Full Name (EN & KH + Avatar) */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <Image
                          src={item.avatarUrl}
                          alt={item.firstName}
                          width={36}
                          height={36}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                          referrerPolicy="no-referrer"
                          unoptimized
                        />
                        <div>
                          <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            <span>{item.fullNameEN || `${item.firstName} ${item.lastName}`}</span>
                          </div>
                          <div className="text-[11px] text-blue-600/80 font-medium font-khmer">
                            {item.fullNameKH || 'ឈ្មោះខ្មែរ'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Optional Columns */}
                    {isColVisible('gender') && <td className="py-3.5 px-3 text-slate-600">{item.gender}</td>}
                    {isColVisible('maritalStatus') && <td className="py-3.5 px-3 text-slate-600">{item.maritalStatus}</td>}
                    {isColVisible('nationality') && <td className="py-3.5 px-3 text-slate-600">{item.nationality}</td>}
                    {isColVisible('dob') && <td className="py-3.5 px-3 text-slate-600 font-mono">{item.dateOfBirth}</td>}
                    {isColVisible('email') && <td className="py-3.5 px-3 text-slate-600">{item.email}</td>}
                    {isColVisible('mobile') && <td className="py-3.5 px-3 text-slate-600 font-mono">{item.mobile || item.phone}</td>}
                    {isColVisible('residency') && <td className="py-3.5 px-3 text-slate-600">{item.residency}</td>}
                    {isColVisible('idNumber') && <td className="py-3.5 px-3 text-slate-600 font-mono">{item.idNumber}</td>}
                    {isColVisible('taxpayerId') && <td className="py-3.5 px-3 text-slate-600 font-mono">{item.taxpayerIdNumber}</td>}
                    {isColVisible('riskCategory') && <td className="py-3.5 px-3 text-slate-600">{item.riskCategory}</td>}
                    {isColVisible('securitiesKnowledge') && <td className="py-3.5 px-3 text-slate-600">{item.securitiesKnowledge}</td>}

                    {/* Profile Status */}
                    <td className="py-3.5 px-4">
                      {renderProfileStatusBadge(item.profileStatus)}
                    </td>

                    {/* Account Status */}
                    <td className="py-3.5 px-4">
                      {renderAccountStatusBadge(item.accountStatus)}
                    </td>

                    {/* Request */}
                    <td className="py-3.5 px-4">
                      {renderRequestBadge(item)}
                    </td>

                    {/* Action: Three-dot menu */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="relative inline-block text-left">
                        <button
                          id={`btn-action-menu-${item.id}`}
                          onClick={() => setOpenActionMenuId(openActionMenuId === item.id ? null : item.id)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition"
                          title="Actions"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Three-dot dropdown */}
                        {openActionMenuId === item.id && (
                          <div
                            className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-30 py-1.5 text-xs text-slate-700 animate-in fade-in zoom-in-95"
                            onMouseLeave={() => setOpenActionMenuId(null)}
                          >
                            {/* View (Dialog) */}
                            <button
                              id={`action-view-${item.id}`}
                              onClick={() => {
                                setOpenActionMenuId(null);
                                onViewIndividual(item);
                              }}
                              className="w-full flex items-center gap-2 px-3.5 py-2 hover:bg-slate-50 text-slate-800 font-medium"
                            >
                              <Eye className="w-3.5 h-3.5 text-blue-600" />
                              <span>View (Dialog)</span>
                            </button>

                            {/* Edit (Screen) */}
                            <button
                              id={`action-edit-${item.id}`}
                              onClick={() => {
                                setOpenActionMenuId(null);
                                onNavigateToUpdate(item);
                              }}
                              className="w-full flex items-center gap-2 px-3.5 py-2 hover:bg-slate-50 text-slate-800 font-medium"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                              <span>Edit (Screen)</span>
                            </button>

                            {/* Close Account (Only if Active) */}
                            {item.accountStatus === 'Active' && (
                              <button
                                id={`action-close-account-${item.id}`}
                                onClick={() => {
                                  setOpenActionMenuId(null);
                                  setCloseAccountModalIndividual(item);
                                  setCloseAccountName(item.tradingAccountInfo?.tradingAccountNumber || 'Primary Account');
                                  setCloseReason('');
                                }}
                                className="w-full flex items-center gap-2 px-3.5 py-2 hover:bg-slate-50 text-purple-700 font-medium"
                              >
                                <Lock className="w-3.5 h-3.5 text-purple-600" />
                                <span>Close Account</span>
                              </button>
                            )}

                            <div className="border-t border-slate-100 my-1" />

                            {/* Delete */}
                            <button
                              id={`action-delete-${item.id}`}
                              onClick={() => {
                                setOpenActionMenuId(null);
                                setDeletingId(item.id);
                              }}
                              className="w-full flex items-center gap-2 px-3.5 py-2 hover:bg-rose-50 text-rose-600 font-medium"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                              <span>Delete Record</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customize Columns Modal - Tailored uniquely for each design theme */}
      {showCustomizeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          {/* THEME 1: GLASSMORPHISM - Crisp Luminous Island Studio */}
          {theme === 'glassmorphism' && (
            <div className="bg-white/95 backdrop-blur-2xl rounded-3xl max-w-xl w-full p-6 border border-slate-200/90 shadow-2xl shadow-slate-900/15 space-y-4 animate-in fade-in zoom-in-95">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 shadow-xs">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Customize Columns</h3>
                    <p className="text-[11px] font-medium text-slate-500">Select fields to display in table view</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-[11px] font-bold text-blue-700">
                    {columns.filter((c) => c.visible).length} of {columns.length} Visible
                  </span>
                  <button
                    onClick={() => {
                      setShowCustomizeModal(false);
                      setColumnSearch('');
                    }}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Integrated Control & Search Bar */}
              <div className="flex items-center justify-between gap-3 p-1.5 rounded-2xl bg-slate-100/80 border border-slate-200/80">
                <div className="relative flex-1 flex items-center min-w-0">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                  <input
                    type="text"
                    value={columnSearch}
                    onChange={(e) => setColumnSearch(e.target.value)}
                    placeholder="Search attributes..."
                    className="w-full h-8 pl-8 pr-7 bg-transparent text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none"
                  />
                  {columnSearch && (
                    <button
                      type="button"
                      onClick={() => setColumnSearch('')}
                      className="absolute right-2 p-0.5 text-slate-400 hover:text-slate-600 rounded-full transition cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Refined Segmented Pill Control */}
                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200/80 shadow-2xs shrink-0">
                  <button
                    type="button"
                    onClick={() => setColumns((prev) => prev.map((col) => ({ ...col, visible: true })))}
                    className="px-3 py-1 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                  >
                    Select All
                  </button>
                  <div className="w-px h-3.5 bg-slate-200" />
                  <button
                    type="button"
                    onClick={() => setColumns((prev) => prev.map((col) => ({ ...col, visible: false })))}
                    className="px-3 py-1 rounded-lg text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Dynamic Column Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto p-1 text-xs">
                {columns
                  .filter((c) => c.label.toLowerCase().includes(columnSearch.toLowerCase()))
                  .map((col) => (
                    <div
                      key={col.id}
                      onClick={() => handleToggleColumn(col.id)}
                      className={cn(
                        'p-3 rounded-2xl border transition-all cursor-pointer select-none flex items-center justify-between gap-2 shadow-2xs',
                        col.visible
                          ? 'bg-blue-50/80 border-2 border-blue-500 text-blue-950 font-bold shadow-xs'
                          : 'bg-white/80 border-slate-200/90 text-slate-700 font-medium hover:bg-slate-50 hover:border-slate-300'
                      )}
                    >
                      <span className="text-xs truncate">{col.label}</span>
                      <div className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center transition-all shrink-0",
                        col.visible ? "bg-blue-600 text-white shadow-xs" : "border-2 border-slate-300 bg-white"
                      )}>
                        {col.visible && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  ))}
              </div>

              {columns.filter((c) => c.label.toLowerCase().includes(columnSearch.toLowerCase())).length === 0 && (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
                  <p className="text-xs font-medium text-slate-500">No columns match &quot;{columnSearch}&quot;</p>
                  <button
                    type="button"
                    onClick={() => setColumnSearch('')}
                    className="mt-2 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    Clear Search
                  </button>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <button
                  onClick={() => setColumns((prev) => prev.map((c) => ({ ...c, visible: false })))}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                >
                  Reset Defaults
                </button>
                <button
                  onClick={() => {
                    setShowCustomizeModal(false);
                    setColumnSearch('');
                    triggerToast('Column preferences saved.');
                  }}
                  className="px-6 py-2.5 rounded-full bg-blue-600 text-white text-xs font-bold shadow-lg shadow-blue-500/25 hover:bg-blue-700 transition cursor-pointer"
                >
                  Apply Columns
                </button>
              </div>
            </div>
          )}

          {/* THEME 2: AURORA - Radiant cosmic console in pristine light mode with spectral accents */}
          {theme === 'aurora' && (
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 border border-indigo-200 shadow-2xl shadow-indigo-500/10 space-y-4 text-slate-900 relative overflow-hidden animate-in fade-in zoom-in-95">
              {/* Radiant Ambient Soft Glow Orbs */}
              <div className="absolute -top-24 -right-24 w-52 h-52 bg-indigo-50 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-52 h-52 bg-cyan-50 rounded-full blur-3xl pointer-events-none" />

              {/* Aurora Header */}
              <div className="flex items-center justify-between border-b border-indigo-100 pb-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                      Customize Columns
                    </h3>
                    <p className="text-[11px] font-medium text-slate-500">Configure visible telemetry fields</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-mono font-bold text-indigo-700 shadow-2xs">
                    {columns.filter((c) => c.visible).length} / {columns.length} ON
                  </span>
                  <button
                    onClick={() => {
                      setShowCustomizeModal(false);
                      setColumnSearch('');
                    }}
                    className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Aurora Telemetry Search & Batch Control Console */}
              <div className="flex items-center justify-between gap-3 p-1.5 rounded-2xl bg-indigo-50/60 border border-indigo-100 relative z-10 focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all">
                <div className="relative flex-1 flex items-center min-w-0">
                  <Search className="w-3.5 h-3.5 text-indigo-400 absolute left-3 pointer-events-none" />
                  <input
                    type="text"
                    value={columnSearch}
                    onChange={(e) => setColumnSearch(e.target.value)}
                    placeholder="Filter attributes..."
                    className="w-full h-8 pl-8 pr-7 bg-transparent text-xs font-mono font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none"
                  />
                  {columnSearch && (
                    <button
                      type="button"
                      onClick={() => setColumnSearch('')}
                      className="absolute right-2 p-0.5 text-slate-400 hover:text-slate-600 rounded-full transition cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Sleek Dual Toggle Capsule */}
                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-indigo-100 shadow-2xs shrink-0">
                  <button
                    type="button"
                    onClick={() => setColumns((prev) => prev.map((col) => ({ ...col, visible: true })))}
                    className="px-3 py-1 rounded-lg text-xs font-bold text-indigo-700 hover:bg-indigo-50 transition cursor-pointer"
                  >
                    Enable All
                  </button>
                  <div className="w-px h-3.5 bg-indigo-100" />
                  <button
                    type="button"
                    onClick={() => setColumns((prev) => prev.map((col) => ({ ...col, visible: false })))}
                    className="px-3 py-1 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition cursor-pointer"
                  >
                    Disable All
                  </button>
                </div>
              </div>

              {/* Aurora Cards Grid */}
              <div className="grid grid-cols-2 gap-2.5 max-h-72 overflow-y-auto p-1 text-xs relative z-10">
                {columns
                  .filter((c) => c.label.toLowerCase().includes(columnSearch.toLowerCase()))
                  .map((col) => (
                    <div
                      key={col.id}
                      onClick={() => handleToggleColumn(col.id)}
                      className={cn(
                        'p-3 rounded-2xl border transition-all cursor-pointer select-none flex items-center justify-between gap-2.5 relative overflow-hidden',
                        col.visible
                          ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-500 text-indigo-950 font-bold shadow-xs'
                          : 'bg-slate-50/80 border-slate-200 text-slate-700 font-semibold hover:border-indigo-200 hover:bg-indigo-50/30'
                      )}
                    >
                      <span className="text-xs font-bold truncate">{col.label}</span>

                      {/* Radiant Neon Switch */}
                      <div className={cn(
                        "w-8 h-4.5 rounded-full transition-all flex items-center px-0.5 shrink-0",
                        col.visible ? "bg-gradient-to-r from-indigo-600 to-cyan-500 justify-end shadow-xs shadow-indigo-400/50" : "bg-slate-300 justify-start"
                      )}>
                        <div className="w-3.5 h-3.5 rounded-full bg-white shadow-xs" />
                      </div>
                    </div>
                  ))}
              </div>

              {columns.filter((c) => c.label.toLowerCase().includes(columnSearch.toLowerCase())).length === 0 && (
                <div className="p-8 text-center bg-indigo-50/40 rounded-2xl border border-indigo-100 relative z-10">
                  <p className="text-xs font-mono text-slate-500">No telemetry fields match &quot;{columnSearch}&quot;</p>
                  <button
                    type="button"
                    onClick={() => setColumnSearch('')}
                    className="mt-2 text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                  >
                    Reset Filter
                  </button>
                </div>
              )}

              {/* Aurora Footer */}
              <div className="flex items-center justify-between border-t border-indigo-100 pt-4 relative z-10">
                <button
                  onClick={() => setColumns((prev) => prev.map((c) => ({ ...c, visible: false })))}
                  className="text-xs font-semibold text-slate-500 hover:text-indigo-600 transition cursor-pointer"
                >
                  Reset Defaults
                </button>
                <button
                  onClick={() => {
                    setShowCustomizeModal(false);
                    setColumnSearch('');
                    triggerToast('Column preferences saved.');
                  }}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 hover:opacity-95 shadow-lg shadow-indigo-500/20 transition cursor-pointer"
                >
                  Save Layout
                </button>
              </div>
            </div>
          )}

          {/* THEME 3: SOFT-FINTECH - Structured corporate data settings with crisp toggle switches */}
          {theme !== 'glassmorphism' && theme !== 'aurora' && (
            <div className="bg-white rounded-2xl max-w-xl w-full p-6 border border-slate-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
              {/* Corporate Fintech Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 shrink-0">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Customize Columns</h3>
                    <p className="text-[11px] text-slate-500">Configure visible table fields</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowCustomizeModal(false);
                    setColumnSearch('');
                  }}
                  className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Corporate Action Bar with Search */}
              <div className="flex items-center justify-between gap-3 p-2 bg-slate-50 rounded-lg border border-slate-200">
                <div className="relative flex-1 flex items-center min-w-0">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
                  <input
                    type="text"
                    value={columnSearch}
                    onChange={(e) => setColumnSearch(e.target.value)}
                    placeholder="Search columns..."
                    className="w-full h-7 pl-7 pr-6 bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none"
                  />
                  {columnSearch && (
                    <button
                      type="button"
                      onClick={() => setColumnSearch('')}
                      className="absolute right-1.5 p-0.5 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      id="checkbox-customize-columns-select-all"
                      checked={columns.length > 0 && columns.every((c) => c.visible)}
                      ref={(el) => {
                        if (el) {
                          el.indeterminate = columns.some((c) => c.visible) && !columns.every((c) => c.visible);
                        }
                      }}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setColumns((prev) => prev.map((col) => ({ ...col, visible: checked })));
                      }}
                      className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-800">
                      Select All
                    </span>
                  </label>
                  <span className="text-[11px] font-mono text-slate-500">
                    {columns.filter((c) => c.visible).length}/{columns.length}
                  </span>
                </div>
              </div>

              {/* Structured 2-column list with sleek switches */}
              <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto p-1 text-xs">
                {columns
                  .filter((c) => c.label.toLowerCase().includes(columnSearch.toLowerCase()))
                  .map((col) => (
                    <div
                      key={col.id}
                      onClick={() => handleToggleColumn(col.id)}
                      className={cn(
                        'flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition select-none',
                        col.visible
                          ? 'bg-blue-50/80 border-2 border-blue-500 text-blue-950 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      )}
                    >
                      <span className="truncate">{col.label}</span>

                      {/* Clean Switch Toggle */}
                      <div className={cn(
                        "w-7.5 h-4 rounded-full transition-colors flex items-center px-0.5 shrink-0",
                        col.visible ? "bg-blue-600 justify-end" : "bg-slate-300 justify-start"
                      )}>
                        <div className="w-3 h-3 rounded-full bg-white shadow-2xs" />
                      </div>
                    </div>
                  ))}
              </div>

              {columns.filter((c) => c.label.toLowerCase().includes(columnSearch.toLowerCase())).length === 0 && (
                <div className="p-6 text-center bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-xs text-slate-500">No columns match &quot;{columnSearch}&quot;</p>
                  <button
                    type="button"
                    onClick={() => setColumnSearch('')}
                    className="mt-1 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    Clear Search
                  </button>
                </div>
              )}

              {/* Corporate Footer */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <button
                  onClick={() => setColumns((prev) => prev.map((c) => ({ ...c, visible: false })))}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  Reset to Default
                </button>
                <button
                  onClick={() => {
                    setShowCustomizeModal(false);
                    setColumnSearch('');
                    triggerToast('Column preferences saved.');
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow-xs transition cursor-pointer"
                >
                  Apply Changes
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Authorize Workflow Modal (CSO -> SR -> Manager) */}
      {authModalIndividual && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 border border-slate-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Workflow Authorization & Sign-off
                  </h3>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {authModalIndividual.customerId || authModalIndividual.id} • {authModalIndividual.fullNameEN || authModalIndividual.firstName}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setAuthModalIndividual(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Workflow Progress visualization */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Workflow Pipeline: CSO → SR → Manager
              </span>
              <div className="flex items-center justify-between text-xs">
                <div className={cn(
                  'flex items-center gap-1 font-bold',
                  authModalIndividual.currentWorkflowStage === 'CSO' ? 'text-blue-600' : 'text-slate-700'
                )}>
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">1</span>
                  <span>CSO Entry</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300" />
                <div className={cn(
                  'flex items-center gap-1 font-bold',
                  authModalIndividual.currentWorkflowStage === 'SR' ? 'text-blue-600' : 'text-slate-700'
                )}>
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">2</span>
                  <span>SR Review</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300" />
                <div className={cn(
                  'flex items-center gap-1 font-bold',
                  authModalIndividual.currentWorkflowStage === 'Manager' ? 'text-blue-600' : 'text-slate-700'
                )}>
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">3</span>
                  <span>Manager Final</span>
                </div>
              </div>
              <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200 flex items-center justify-between">
                <span>Current Stage: <strong className="text-slate-800">{authModalIndividual.currentWorkflowStage}</strong></span>
                <span>Request Type: <strong className="text-slate-800">{authModalIndividual.requestType}</strong></span>
              </div>
            </div>

            {/* Role & Officer Acting */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Authorizer Role</label>
                <select
                  value={authRole}
                  onChange={(e) => {
                    const r = e.target.value as 'CSO' | 'SR' | 'Manager';
                    setAuthRole(r);
                    if (r === 'CSO') setAuthOfficer('Sophea Keo (CSO)');
                    if (r === 'SR') setAuthOfficer('Dara Vong (SR)');
                    if (r === 'Manager') setAuthOfficer('Vannak Lim (Manager)');
                  }}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="CSO">CSO (Customer Service Officer)</option>
                  <option value="SR">SR (Senior Representative)</option>
                  <option value="Manager">Department Manager</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Officer Name</label>
                <input
                  type="text"
                  value={authOfficer}
                  onChange={(e) => setAuthOfficer(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Action Type: Authorize / Resubmit / Reject */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1.5">Decision</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setAuthActionType('authorize')}
                  className={cn(
                    'py-2 px-3 rounded-lg font-bold text-xs border transition flex items-center justify-center gap-1.5',
                    authActionType === 'authorize'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  )}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Authorize</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAuthActionType('resubmit')}
                  className={cn(
                    'py-2 px-3 rounded-lg font-bold text-xs border transition flex items-center justify-center gap-1.5',
                    authActionType === 'resubmit'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  )}
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Resubmit</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAuthActionType('reject')}
                  className={cn(
                    'py-2 px-3 rounded-lg font-bold text-xs border transition flex items-center justify-center gap-1.5',
                    authActionType === 'reject'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  )}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </button>
              </div>
            </div>

            {/* Reason field (Mandatory for Resubmit or Reject) */}
            {authActionType !== 'authorize' && (
              <div>
                <label className="block text-[11px] font-bold text-rose-700 mb-1">
                  Reason for {authActionType === 'resubmit' ? 'Resubmission' : 'Rejection'} *
                </label>
                <textarea
                  rows={2}
                  value={authReason}
                  onChange={(e) => setAuthReason(e.target.value)}
                  placeholder="State the exact discrepancy or missing paperwork for the audit trail..."
                  className="w-full px-3 py-2 text-xs bg-rose-50/50 border border-rose-200 rounded-lg text-slate-800 placeholder-rose-300 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>
            )}

            {/* General Comment */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Internal Remarks & Compliance Comments
              </label>
              <textarea
                rows={2}
                value={authComment}
                onChange={(e) => setAuthComment(e.target.value)}
                placeholder="Optional notes to accompany this stage transition..."
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setAuthModalIndividual(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitAuthorization}
                className={cn(
                  'px-4 py-2 text-xs font-bold text-white rounded-lg transition shadow-xs',
                  authActionType === 'authorize' ? 'bg-emerald-600 hover:bg-emerald-700' : authActionType === 'resubmit' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-rose-600 hover:bg-rose-700'
                )}
              >
                Confirm {authActionType.toUpperCase()}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Close Account Modal (For Active Accounts) */}
      {closeAccountIndividual && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 border border-slate-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-purple-600" />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Close Trading Account</h3>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {closeAccountIndividual.customerId || closeAccountIndividual.id} • {closeAccountIndividual.fullNameEN || closeAccountIndividual.firstName}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setCloseAccountModalIndividual(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-900">
              Initiating account closure transitions this profile to <strong>Close Account</strong> request status and routes through SR and Manager authorizations.
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Close Date</label>
                <input
                  type="date"
                  value={closeDate}
                  onChange={(e) => setCloseDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Account to Close</label>
                <input
                  type="text"
                  value={closeAccountName}
                  onChange={(e) => setCloseAccountName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Processed By (Officer)</label>
                <input
                  type="text"
                  value={closeOfficer}
                  onChange={(e) => setCloseOfficer(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Reason for Closure *</label>
                <textarea
                  rows={2}
                  value={closeReason}
                  onChange={(e) => setCloseReason(e.target.value)}
                  placeholder="E.g., Customer relocated assets to corporate headquarters..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setCloseAccountModalIndividual(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitCloseAccount}
                className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition shadow-xs"
              >
                Submit Close Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 border border-slate-200 shadow-2xl space-y-3">
            <div className="flex items-center gap-2.5 text-rose-600 font-bold text-sm">
              <AlertTriangle className="w-5 h-5" />
              <span>Confirm Deletion</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently remove this customer record? This action will remove all local KYC, trading accounts, and history data.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteIndividual(deletingId);
                  setDeletingId(null);
                  triggerToast('Record deleted from directory.');
                }}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
