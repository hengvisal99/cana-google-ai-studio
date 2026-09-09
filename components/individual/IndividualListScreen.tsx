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
  Lock, 
  Check,
  UserCheck,
  ChevronRight
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

  // Badge renderers
  const renderProfileStatusBadge = (status: 'Completed' | 'Incomplete') => {
    if (status === 'Completed') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          Completed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <Clock className="w-3 h-3 text-amber-600" />
        Incomplete
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
    const isClose = item.requestType === 'Close Account';
    let statusBg = 'bg-blue-50 text-blue-700 border-blue-200';

    if (item.requestStatus === 'Approved') {
      statusBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    } else if (item.requestStatus === 'Resubmit') {
      statusBg = 'bg-amber-50 text-amber-700 border-amber-200';
    } else if (item.requestStatus === 'Rejected') {
      statusBg = 'bg-rose-50 text-rose-700 border-rose-200';
    }

    return (
      <div className="flex flex-col gap-1 items-start">
        <span className={cn(
          'text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded',
          isClose ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
        )}>
          {item.requestType}
        </span>
        <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border', statusBg)}>
          {item.requestStatus === 'Approved' && <Check className="w-3 h-3 text-emerald-600" />}
          {item.requestStatus === 'Resubmit' && <AlertCircle className="w-3 h-3 text-amber-600" />}
          {item.requestStatus === 'Rejected' && <AlertTriangle className="w-3 h-3 text-rose-600" />}
          {item.requestStatus === 'Pending' && <Clock className="w-3 h-3 text-blue-600" />}
          <span>{item.requestStatus} • {item.currentWorkflowStage}</span>
        </span>
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

      {/* Top Header & MD Action Buttons: Reload, Filter, Customize Columns, Export, Add New */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Individual Directory
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage individual client onboarding, document verification, authorization lifecycle, and trading profiles.
          </p>
        </div>

        {/* Action Button Group (Per MD: Reload, Filter, Customize Columns, Export, Add New) */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Reload */}
          <button
            id="btn-individual-reload"
            onClick={handleReloadClick}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all shadow-xs"
            title="Reload data from server"
          >
            <RotateCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reload</span>
          </button>

          {/* Filter Toggle */}
          <button
            id="btn-individual-filter-toggle"
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-all shadow-xs',
              showFilterPanel
                ? 'bg-blue-50 text-blue-700 border-blue-300'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            )}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filter</span>
            {(genderFilter !== 'ALL' || maritalFilter !== 'ALL' || nationalityFilter !== 'ALL' || requestTypeFilter !== 'ALL') && (
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            )}
          </button>

          {/* Customize Columns */}
          <button
            id="btn-individual-customize-columns"
            onClick={() => setShowCustomizeModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all shadow-xs"
          >
            <Columns className="w-3.5 h-3.5 text-slate-500" />
            <span>Customize Columns</span>
          </button>

          {/* Export */}
          <div className="relative group">
            <button
              id="btn-individual-export"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export</span>
            </button>
            <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-slate-200 rounded-lg shadow-lg hidden group-hover:block z-20 py-1 text-xs">
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

          {/* Add New (Directly routes to dedicated Insert screen) */}
          <button
            id="btn-individual-add-new"
            onClick={onNavigateToInsert}
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-xs font-bold text-white transition-all shadow-xs shrink-0',
              theme === 'glassmorphism'
                ? 'rounded-full bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20'
                : theme === 'aurora'
                ? 'rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/25'
                : 'rounded-lg bg-blue-600 hover:bg-blue-700'
            )}
          >
            <Plus className="w-4 h-4" />
            <span>Add New</span>
          </button>
        </div>
      </div>

      {/* Status Tabs Bar (Approved, Resubmit, Pending, Rejected, All) */}
      <div className={cn(
        'bg-white border border-slate-200 p-1.5 flex items-center gap-1.5 overflow-x-auto',
        theme === 'glassmorphism' ? 'rounded-2xl bg-white/80 backdrop-blur-md border-white/80 shadow-xs' : 'rounded-xl shadow-xs'
      )}>
        <button
          onClick={() => setStatusTab('ALL')}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all shrink-0',
            statusTab === 'ALL'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          )}
        >
          <span>All Requests</span>
          <span className={cn(
            'px-1.5 py-0.2 rounded-full text-[10px]',
            statusTab === 'ALL' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
          )}>
            {countAll}
          </span>
        </button>

        <button
          onClick={() => setStatusTab('Approved')}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all shrink-0',
            statusTab === 'Approved'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          )}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>Approved</span>
          <span className={cn(
            'px-1.5 py-0.2 rounded-full text-[10px]',
            statusTab === 'Approved' ? 'bg-emerald-700 text-white' : 'bg-emerald-50 text-emerald-700'
          )}>
            {countApproved}
          </span>
        </button>

        <button
          onClick={() => setStatusTab('Resubmit')}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all shrink-0',
            statusTab === 'Resubmit'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          )}
        >
          <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
          <span>Resubmit</span>
          <span className={cn(
            'px-1.5 py-0.2 rounded-full text-[10px]',
            statusTab === 'Resubmit' ? 'bg-amber-700 text-white' : 'bg-amber-50 text-amber-700'
          )}>
            {countResubmit}
          </span>
        </button>

        <button
          onClick={() => setStatusTab('Pending')}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all shrink-0',
            statusTab === 'Pending'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          )}
        >
          <Clock className="w-3.5 h-3.5 text-blue-500" />
          <span>Pending</span>
          <span className={cn(
            'px-1.5 py-0.2 rounded-full text-[10px]',
            statusTab === 'Pending' ? 'bg-blue-700 text-white' : 'bg-blue-50 text-blue-700'
          )}>
            {countPending}
          </span>
        </button>

        <button
          onClick={() => setStatusTab('Rejected')}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all shrink-0',
            statusTab === 'Rejected'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          )}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
          <span>Rejected</span>
          <span className={cn(
            'px-1.5 py-0.2 rounded-full text-[10px]',
            statusTab === 'Rejected' ? 'bg-rose-700 text-white' : 'bg-rose-50 text-rose-700'
          )}>
            {countRejected}
          </span>
        </button>
      </div>

      {/* Filter Section (Incorporating Search Group and Filters) */}
      <div
        id="individual-filter-section"
        className={cn(
          'bg-white border border-slate-200 p-4 transition-all space-y-3.5',
          theme === 'glassmorphism' ? 'rounded-2xl bg-white/85 backdrop-blur-md border-white/80 shadow-xs' : 'rounded-xl shadow-xs'
        )}
      >
        {/* Top bar inside Filter Section: Unified Search Input Group + Records count & Reset */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Unified Input Group Container */}
          <div className="relative flex-1 max-w-xl">
            <div className="flex items-stretch rounded-xl border border-blue-200/90 hover:border-blue-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 bg-white shadow-2xs transition-all h-10">
              {/* Input Group Prefix: Dropdown Toggle Button */}
              <button
                type="button"
                id="btn-search-by-dropdown"
                onClick={() => setIsSearchByOpen(!isSearchByOpen)}
                className="flex items-center gap-2 px-4 bg-transparent hover:bg-slate-50/70 border-r border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider rounded-l-xl transition shrink-0 select-none cursor-pointer"
              >
                <span>{SEARCH_FIELD_OPTIONS.find(o => o.id === searchBy)?.label || 'ALL FIELDS'}</span>
                {isSearchByOpen ? (
                  <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                )}
              </button>

              {/* Input Group Center: Search Input */}
              <div className="relative flex-1 flex items-center min-w-0 bg-transparent">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none shrink-0" />
                <input
                  id="individual-search-input"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={SEARCH_FIELD_OPTIONS.find(o => o.id === searchBy)?.placeholder || 'RUN ID SEARCH'}
                  className="w-full h-full pl-10 pr-8 bg-transparent text-xs font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-semibold placeholder:uppercase placeholder:tracking-wider uppercase tracking-wider focus:outline-none"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 p-0.5 text-slate-400 hover:text-slate-600 rounded transition cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Dropdown Popup Menu */}
            {isSearchByOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsSearchByOpen(false)} 
                />
                <div className="absolute left-0 top-full mt-1.5 w-60 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="space-y-0.5">
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
                            "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition text-left cursor-pointer",
                            isSelected
                              ? "text-blue-600 bg-blue-50/70"
                              : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
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

          {/* Quick info / clear */}
          <div className="flex items-center gap-2 justify-end text-xs text-slate-500">
            <span>Showing <strong>{filteredData.length}</strong> of {individuals.length}</span>
            {(hasActiveFilters || searchTerm) && (
              <button
                onClick={handleResetFilters}
                className="text-blue-600 hover:underline font-semibold text-xs ml-2 cursor-pointer"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Filter fields row inside Filter Section */}
        {showFilterPanel && (
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Filter Criteria
              </span>
              <button
                onClick={handleResetFilters}
                className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
              >
                Reset All Fields
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              {/* Gender Filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Gender</label>
                <select
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50/80 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="ALL">All Genders</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Marital Status Filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Marital Status</label>
                <select
                  value={maritalFilter}
                  onChange={(e) => setMaritalFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50/80 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="ALL">All Marital Statuses</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>

              {/* Nationality Filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Nationality</label>
                <select
                  value={nationalityFilter}
                  onChange={(e) => setNationalityFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50/80 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="ALL">All Nationalities</option>
                  {uniqueNationalities.map((nat) => (
                    <option key={nat} value={nat}>{nat}</option>
                  ))}
                </select>
              </div>

              {/* Request Type Filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Request Type</label>
                <select
                  value={requestTypeFilter}
                  onChange={(e) => setRequestTypeFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50/80 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="ALL">All Request Types</option>
                  <option value="Registration">Registration</option>
                  <option value="Close Account">Close Account</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

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
                <th className="py-3 px-4">Request</th>

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
                          <div className="text-[11px] text-blue-600/80 font-medium">
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

      {/* Customize Columns Modal */}
      {showCustomizeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 border border-slate-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Columns className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">Customize Table Columns</h3>
              </div>
              <button
                onClick={() => setShowCustomizeModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Select which additional attributes you wish to display in the main Individual directory table:
            </p>

            {/* Select All Checkbox */}
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100/60 transition">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
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
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-800">
                  Select All Columns
                </span>
              </label>
              <span className="text-[11px] font-medium text-slate-500">
                {columns.filter((c) => c.visible).length} of {columns.length} selected
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 max-h-72 overflow-y-auto p-1 text-xs">
              {columns.map((col) => (
                <label
                  key={col.id}
                  className={cn(
                    'flex items-center gap-2.5 p-2 rounded-lg border cursor-pointer transition select-none',
                    col.visible
                      ? 'bg-blue-50/70 border-blue-200 text-blue-900 font-semibold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={col.visible}
                    onChange={() => handleToggleColumn(col.id)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>{col.label}</span>
                </label>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <button
                onClick={() => {
                  setColumns((prev) => prev.map((c) => ({ ...c, visible: false })));
                }}
                className="text-xs font-semibold text-slate-500 hover:text-slate-700"
              >
                Reset to Default
              </button>

              <button
                onClick={() => {
                  setShowCustomizeModal(false);
                  triggerToast('Column preferences saved.');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Authorize Workflow Modal (CSO -> SR -> Manager) */}
      {authModalIndividual && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
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
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
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
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
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
