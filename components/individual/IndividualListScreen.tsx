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
  Layers
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

  // Request Column Layout State: 'stepper' (connected nodes) | 'bar' (segmented progress bar)
  const [requestColumnLayout, setRequestColumnLayout] = useState<'stepper' | 'bar'>('bar');

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
    const isClose = item.requestType === 'Close Account';
    const isApproved = item.requestStatus === 'Approved' || item.currentWorkflowStage === 'Approved';
    const isRejected = item.requestStatus === 'Rejected' || item.currentWorkflowStage === 'Rejected';
    const isResubmit = item.requestStatus === 'Resubmit' || item.currentWorkflowStage === 'Resubmit';
    const isPendingSR = item.currentWorkflowStage === 'SR' && item.requestStatus === 'Pending';
    const isPendingManager = item.currentWorkflowStage === 'Manager' && item.requestStatus === 'Pending';

    // Extract authorization history if available
    const history = item.authorizationHistory || [];
    const csoItem = history.find(h => h.role === 'CSO' || h.stage?.includes('Submit')) || history[0];
    const srItem = history.find(h => h.role === 'SR') || history[1];
    const managerItem = history.find(h => h.role === 'Manager') || history[2];

    // CSO Details
    const csoOfficer = csoItem?.processedBy || 'Sophea Keo';
    const csoDate = csoItem?.dateTime || 'Mar 15, 2026 · 09:30 AM';
    const csoStatusText = 'Submitted';
    const csoStatusColor = 'text-emerald-600';
    const csoBarColor = 'bg-emerald-500';

    // SR Details & State
    let srStatusText = 'Approved';
    let srStatusColor = 'text-emerald-600';
    let srBarColor = 'bg-emerald-500';
    let srOfficer = srItem?.processedBy || item.tradingAccountInfo?.currentAssignedSR || 'Dara Vong';
    let srDate = srItem?.dateTime || 'Mar 17, 2026 · 02:45 PM';

    if (isPendingSR) {
      srStatusText = 'Pending';
      srStatusColor = 'text-amber-600 font-bold';
      srBarColor = 'bg-amber-500';
    } else if (isResubmit && item.currentWorkflowStage === 'SR') {
      srStatusText = 'Resubmit';
      srStatusColor = 'text-amber-600 font-bold';
      srBarColor = 'bg-amber-500';
    } else if (isRejected && item.currentWorkflowStage === 'SR') {
      srStatusText = 'Rejected';
      srStatusColor = 'text-rose-600 font-bold';
      srBarColor = 'bg-rose-500';
    }

    // Manager Details & State
    let managerStatusText = 'Approved';
    let managerStatusColor = 'text-emerald-600';
    let managerBarColor = 'bg-emerald-500';
    let managerOfficer = managerItem?.processedBy || item.tradingAccountInfo?.accountApprovedBy || 'Vannak Lim';
    let managerDate = managerItem?.dateTime || 'Mar 18, 2026 · 04:20 PM';

    if (isApproved) {
      managerStatusText = 'Approved';
      managerStatusColor = 'text-emerald-600 font-bold';
      managerBarColor = 'bg-emerald-500';
    } else if (isPendingManager) {
      managerStatusText = 'Pending';
      managerStatusColor = 'text-amber-600 font-bold';
      managerBarColor = 'bg-amber-500';
    } else if (isRejected) {
      managerStatusText = 'Rejected';
      managerStatusColor = 'text-rose-600 font-bold';
      managerBarColor = 'bg-rose-500';
    } else if (isResubmit) {
      managerStatusText = 'Resubmit';
      managerStatusColor = 'text-amber-600 font-bold';
      managerBarColor = 'bg-amber-500';
    } else if (isPendingSR) {
      managerStatusText = 'Waiting';
      managerStatusColor = 'text-slate-400';
      managerBarColor = 'bg-slate-200';
      managerOfficer = '—';
      managerDate = 'Pending SR';
    }

    // Reason extraction
    const rejectionReason = history.find(h => h.reason)?.reason || (isRejected ? 'Customer address does not match the supporting document.' : undefined);
    const resubmitReason = isResubmit ? (history.find(h => h.status === 'Resubmit')?.comment || 'Additional supporting documents required for review.') : undefined;

    // -------------------------------------------------------------
    // VERSION 1: CONNECTED NODE STEPPER UI (Previous Version)
    // -------------------------------------------------------------
    if (requestColumnLayout === 'stepper') {
      return (
        <div className="bg-slate-50/70 hover:bg-slate-50 border border-slate-200/90 rounded-2xl p-3 shadow-2xs transition-all flex items-start gap-3 min-w-[380px] max-w-[460px] select-none text-left">
          {/* Left Request Type Icon Box */}
          {isClose ? (
            <div 
              className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200/80 flex items-center justify-center text-rose-600 shrink-0 shadow-2xs mt-0.5"
              title="Close Account Request"
            >
              <Lock className="w-5 h-5" />
            </div>
          ) : (
            <div 
              className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 shrink-0 shadow-2xs mt-0.5"
              title="Registration Request"
            >
              <UserPlus className="w-5 h-5" />
            </div>
          )}

          {/* Stepper Pipeline */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Step Nodes & Connectors */}
            <div className="flex items-center justify-between gap-1">
              {/* CSO Node */}
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-300">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-bold text-slate-800 leading-tight">CSO</div>
                  <div className="text-[10px] font-semibold text-emerald-600 leading-tight">Submitted</div>
                  <div className="text-[9px] text-slate-500 truncate" title={csoOfficer}>{csoOfficer}</div>
                </div>
              </div>

              {/* Connector 1 */}
              <div className="w-6 h-0.5 bg-emerald-300 shrink-0 -mt-3" />

              {/* SR Node */}
              <div className="flex items-center gap-1.5 min-w-0 flex-1 pl-1">
                {isPendingSR ? (
                  <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 border border-amber-300">
                    <Clock className="w-3 h-3" />
                  </div>
                ) : isRejected && item.currentWorkflowStage === 'SR' ? (
                  <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 border border-rose-300">
                    <X className="w-3 h-3 stroke-[3]" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-300">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-bold text-slate-800 leading-tight">SR</div>
                  <div className={cn("text-[10px] font-semibold leading-tight", srStatusColor)}>{srStatusText}</div>
                  <div className="text-[9px] text-slate-500 truncate" title={srOfficer}>{srOfficer}</div>
                </div>
              </div>

              {/* Connector 2 */}
              <div className={cn("w-6 h-0.5 shrink-0 -mt-3", isPendingSR ? "bg-slate-200" : isRejected && item.currentWorkflowStage === 'SR' ? "bg-rose-200" : "bg-emerald-300")} />

              {/* Manager Node */}
              <div className="flex items-center gap-1.5 min-w-0 flex-1 pl-1">
                {isApproved ? (
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-300">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                ) : isPendingManager ? (
                  <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 border border-amber-300">
                    <Clock className="w-3 h-3" />
                  </div>
                ) : isRejected ? (
                  <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 border border-rose-300">
                    <X className="w-3 h-3 stroke-[3]" />
                  </div>
                ) : isResubmit ? (
                  <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 border border-amber-300">
                    <AlertCircle className="w-3 h-3" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center shrink-0 border border-slate-300">
                    <Clock className="w-3 h-3" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-bold text-slate-800 leading-tight">Manager</div>
                  <div className={cn("text-[10px] font-semibold leading-tight", managerStatusColor)}>{managerStatusText}</div>
                  <div className="text-[9px] text-slate-500 truncate" title={managerOfficer}>{managerOfficer}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // -------------------------------------------------------------
    // VERSION 2: SEGMENTED PROGRESS BAR UI (New Version)
    // -------------------------------------------------------------
    return (
      <div className="bg-slate-50/70 hover:bg-slate-50 border border-slate-200/90 rounded-2xl p-3 shadow-2xs transition-all flex items-start gap-3 min-w-[380px] max-w-[460px] select-none text-left">
        {/* Left Request Type Icon Box */}
        {isClose ? (
          <div 
            className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200/80 flex items-center justify-center text-rose-600 shrink-0 shadow-2xs mt-0.5"
            title="Close Account Request"
          >
            <Lock className="w-5 h-5" />
          </div>
        ) : (
          <div 
            className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 shrink-0 shadow-2xs mt-0.5"
            title="Registration Request"
          >
            <UserPlus className="w-5 h-5" />
          </div>
        )}

        {/* Right Content: Segmented Progress Bars & 3-Column Stages */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Top: 3 Segmented Horizontal Progress Bars */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full">
            <div className={cn("h-1.5 rounded-full shadow-2xs transition-all", csoBarColor)} />
            <div className={cn("h-1.5 rounded-full shadow-2xs transition-all", srBarColor)} />
            <div className={cn("h-1.5 rounded-full shadow-2xs transition-all", managerBarColor)} />
          </div>

          {/* Bottom: 3 Aligned Stage Details */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full">
            {/* Stage 1: CSO */}
            <div className="min-w-0">
              <div className="font-bold text-slate-900 text-xs leading-tight">CSO</div>
              <div className={cn("text-[10px] font-bold leading-tight", csoStatusColor)}>{csoStatusText}</div>
              <div className="text-[10px] text-slate-600 font-medium truncate mt-0.5" title={csoOfficer}>
                {csoOfficer}
              </div>
            </div>

            {/* Stage 2: SR */}
            <div className="min-w-0">
              <div className="font-bold text-slate-900 text-xs leading-tight">SR</div>
              <div className={cn("text-[10px] font-bold leading-tight", srStatusColor)}>{srStatusText}</div>
              <div className="text-[10px] text-slate-600 font-medium truncate mt-0.5" title={srOfficer}>
                {srOfficer}
              </div>
            </div>

            {/* Stage 3: Manager */}
            <div className="min-w-0">
              <div className="font-bold text-slate-900 text-xs leading-tight">Manager</div>
              <div className={cn("text-[10px] font-bold leading-tight", managerStatusColor)}>{managerStatusText}</div>
              <div className="text-[10px] text-slate-600 font-medium truncate mt-0.5" title={managerOfficer}>
                {managerOfficer}
              </div>
            </div>
          </div>
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
      {theme !== 'glassmorphism' && theme !== 'aurora' && (
        <div className="space-y-4">
          {/* Institutional Top Header */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
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
                <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs divide-x divide-slate-100">
                  {/* Reload */}
                  <button
                    id="btn-individual-reload"
                    onClick={handleReloadClick}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition"
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
                      'flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition',
                      showFilterPanel
                        ? 'bg-blue-50 text-blue-700 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    )}
                  >
                    <Filter className="w-3.5 h-3.5" />
                    <span>Filter</span>
                    {hasActiveFilters && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    )}
                  </button>

                  {/* Columns */}
                  <button
                    id="btn-individual-customize-columns"
                    onClick={() => setShowCustomizeModal(true)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
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
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
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
                </div>

                {/* Request Column View Switcher */}
                <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-500 font-semibold border-r border-slate-100">
                    <Sliders className="w-3.5 h-3.5 text-blue-600" />
                    <span className="hidden sm:inline">Request View:</span>
                  </div>
                  <div className="flex items-center gap-0.5 p-0.5">
                    <button
                      id="btn-toggle-request-bar"
                      type="button"
                      onClick={() => {
                        setRequestColumnLayout('bar');
                        triggerToast('Switched to Progress Bar Request view');
                      }}
                      className={cn(
                        'px-2.5 py-1 rounded-md text-xs font-bold transition cursor-pointer',
                        requestColumnLayout === 'bar'
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      )}
                      title="Progress Bar Request Layout"
                    >
                      Progress Bar
                    </button>
                    <button
                      id="btn-toggle-request-stepper"
                      type="button"
                      onClick={() => {
                        setRequestColumnLayout('stepper');
                        triggerToast('Switched to Stepper Nodes Request view');
                      }}
                      className={cn(
                        'px-2.5 py-1 rounded-md text-xs font-bold transition cursor-pointer',
                        requestColumnLayout === 'stepper'
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      )}
                      title="Connected Node Stepper Request Layout"
                    >
                      Stepper Nodes
                    </button>
                  </div>
                </div>

                {/* Primary Add New Button */}
                <button
                  id="btn-individual-add-new"
                  onClick={onNavigateToInsert}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Individual</span>
                </button>
              </div>
            </div>
          </div>

          {/* Institutional Status Tabs & Search Split */}
          <div
            id="individual-tabs-search-row"
            className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-2xs flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3"
          >
            {/* Terminal Segmented Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none p-1 bg-slate-100 rounded-lg border border-slate-200/80 shrink-0">
              <button
                onClick={() => setStatusTab('ALL')}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition shrink-0 cursor-pointer',
                  statusTab === 'ALL'
                    ? 'bg-white text-blue-700 shadow-2xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                )}
              >
                <span>All Requests</span>
                <span className={cn(
                  'px-1.5 py-0.2 rounded text-[10px] font-mono',
                  statusTab === 'ALL' ? 'bg-blue-50 text-blue-700 font-bold' : 'bg-slate-200 text-slate-600'
                )}>
                  {countAll}
                </span>
              </button>

              <button
                onClick={() => setStatusTab('Approved')}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition shrink-0 cursor-pointer',
                  statusTab === 'Approved'
                    ? 'bg-white text-emerald-700 shadow-2xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                )}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Approved</span>
                <span className={cn(
                  'px-1.5 py-0.2 rounded text-[10px] font-mono',
                  statusTab === 'Approved' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'bg-slate-200 text-slate-600'
                )}>
                  {countApproved}
                </span>
              </button>

              <button
                onClick={() => setStatusTab('Resubmit')}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition shrink-0 cursor-pointer',
                  statusTab === 'Resubmit'
                    ? 'bg-white text-amber-700 shadow-2xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                )}
              >
                <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                <span>Resubmit</span>
                <span className={cn(
                  'px-1.5 py-0.2 rounded text-[10px] font-mono',
                  statusTab === 'Resubmit' ? 'bg-amber-50 text-amber-700 font-bold' : 'bg-slate-200 text-slate-600'
                )}>
                  {countResubmit}
                </span>
              </button>

              <button
                onClick={() => setStatusTab('Pending')}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition shrink-0 cursor-pointer',
                  statusTab === 'Pending'
                    ? 'bg-white text-blue-700 shadow-2xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                )}
              >
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                <span>Pending</span>
                <span className={cn(
                  'px-1.5 py-0.2 rounded text-[10px] font-mono',
                  statusTab === 'Pending' ? 'bg-blue-50 text-blue-700 font-bold' : 'bg-slate-200 text-slate-600'
                )}>
                  {countPending}
                </span>
              </button>

              <button
                onClick={() => setStatusTab('Rejected')}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition shrink-0 cursor-pointer',
                  statusTab === 'Rejected'
                    ? 'bg-white text-rose-700 shadow-2xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                )}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                <span>Rejected</span>
                <span className={cn(
                  'px-1.5 py-0.2 rounded text-[10px] font-mono',
                  statusTab === 'Rejected' ? 'bg-rose-50 text-rose-700 font-bold' : 'bg-slate-200 text-slate-600'
                )}>
                  {countRejected}
                </span>
              </button>
            </div>

            {/* Terminal Search Box */}
            <div className="relative flex-1 max-w-md w-full">
              <div className="flex items-stretch rounded-lg border border-slate-300 hover:border-slate-400 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 bg-white shadow-2xs transition-all h-9.5">
                <button
                  type="button"
                  id="btn-search-by-dropdown"
                  onClick={() => setIsSearchByOpen(!isSearchByOpen)}
                  className="flex items-center gap-1.5 px-3 bg-slate-50 hover:bg-slate-100 border-r border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider rounded-l-lg transition shrink-0 select-none cursor-pointer"
                >
                  <span>{SEARCH_FIELD_OPTIONS.find(o => o.id === searchBy)?.label || 'ALL FIELDS'}</span>
                  {isSearchByOpen ? (
                    <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                  )}
                </button>

                <div className="relative flex-1 flex items-center min-w-0 bg-transparent">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none shrink-0" />
                  <input
                    id="individual-search-input"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={SEARCH_FIELD_OPTIONS.find(o => o.id === searchBy)?.placeholder || 'RUN ID SEARCH'}
                    className="w-full h-full pl-9 pr-8 bg-transparent text-xs font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-mono uppercase tracking-wider focus:outline-none"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2.5 p-0.5 text-slate-400 hover:text-slate-600 rounded transition cursor-pointer"
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
                  <div className="absolute right-0 top-full mt-1.5 w-60 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95">
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
                              "w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition text-left cursor-pointer",
                              isSelected
                                ? "text-blue-600 bg-blue-50"
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
          </div>

          {/* Collapsible Corporate Filter Console */}
          {showFilterPanel && (
            <div
              id="individual-filter-section"
              className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3"
            >
              {(hasActiveFilters || searchTerm) && (
                <div className="flex items-center justify-end border-b border-slate-100 pb-2.5">
                  <button
                    onClick={handleResetFilters}
                    className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    Reset Query Filters
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-600 uppercase mb-1">Gender</label>
                  <select
                    value={genderFilter}
                    onChange={(e) => setGenderFilter(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 font-medium"
                  >
                    <option value="ALL">All Genders</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-600 uppercase mb-1">Marital Status</label>
                  <select
                    value={maritalFilter}
                    onChange={(e) => setMaritalFilter(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 font-medium"
                  >
                    <option value="ALL">All Marital Statuses</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-600 uppercase mb-1">Nationality</label>
                  <select
                    value={nationalityFilter}
                    onChange={(e) => setNationalityFilter(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 font-medium"
                  >
                    <option value="ALL">All Nationalities</option>
                    {uniqueNationalities.map((nat) => (
                      <option key={nat} value={nat}>{nat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-600 uppercase mb-1">Request Type</label>
                  <select
                    value={requestTypeFilter}
                    onChange={(e) => setRequestTypeFilter(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 font-medium"
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
      )}

      {/* ========================================================================= */}
      {/* THEME 2: GLASSMORPHISM (Floating Island / Hero Search / Bubble Pills)     */}
      {/* ========================================================================= */}
      {theme === 'glassmorphism' && (
        <div className="space-y-4">
          {/* Floating Frosted Island Card Header */}
          <div className="bg-white/75 backdrop-blur-xl rounded-3xl p-6 border border-white/90 shadow-xl shadow-blue-500/5">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-100 to-blue-100 border border-white flex items-center justify-center text-blue-600 shadow-xs shrink-0">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                      Individual Directory
                    </h1>
                  </div>
                  <p className="text-xs font-medium text-slate-500 mt-1">
                    Manage individual client onboarding, document verification, authorization lifecycle, and trading profiles.
                  </p>
                </div>
              </div>

              {/* Floating Pill Action Buttons */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  id="btn-individual-reload"
                  onClick={handleReloadClick}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white/90 border border-slate-200/80 rounded-full hover:bg-white hover:shadow-xs transition"
                  title="Reload data from server"
                >
                  <RotateCw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Reload</span>
                </button>

                <button
                  id="btn-individual-filter-toggle"
                  onClick={() => setShowFilterPanel(!showFilterPanel)}
                  className={cn(
                    'flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full border transition shadow-2xs',
                    showFilterPanel
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'bg-white/90 border-slate-200/80 text-slate-700 hover:bg-white'
                  )}
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>Filter</span>
                  {hasActiveFilters && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  )}
                </button>

                <button
                  id="btn-individual-customize-columns"
                  onClick={() => setShowCustomizeModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white/90 border border-slate-200/80 rounded-full hover:bg-white hover:shadow-xs transition"
                  title="Configure Table Columns"
                >
                  <Columns className="w-3.5 h-3.5 text-slate-500" />
                  <span>Columns</span>
                  {columns.filter((c) => c.visible).length > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-100 text-blue-700">
                      {columns.filter((c) => c.visible).length}
                    </span>
                  )}
                </button>

                <div className="relative group">
                  <button
                    id="btn-individual-export"
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white/90 border border-slate-200/80 rounded-full hover:bg-white hover:shadow-xs transition"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>Export</span>
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-36 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-xl hidden group-hover:block z-20 py-1.5 text-xs">
                    <button
                      onClick={() => handleExport('csv')}
                      className="w-full text-left px-3.5 py-2 hover:bg-blue-50 text-slate-700 font-medium rounded-xl mx-1"
                    >
                      Export as CSV
                    </button>
                    <button
                      onClick={() => handleExport('json')}
                      className="w-full text-left px-3.5 py-2 hover:bg-blue-50 text-slate-700 font-medium rounded-xl mx-1"
                    >
                      Export as JSON
                    </button>
                  </div>
                </div>

                <button
                  id="btn-individual-add-new"
                  onClick={onNavigateToInsert}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg shadow-blue-500/25 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Client</span>
                </button>
              </div>
            </div>
          </div>

          {/* Combined Same Row: Status Bubble Pills + Glass Search Capsule */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Status Bubble Pills */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 shrink-0">
              <button
                onClick={() => setStatusTab('ALL')}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer',
                  statusTab === 'ALL'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'bg-white/80 border border-slate-200/80 text-slate-700 hover:bg-white'
                )}
              >
                <span>All Requests</span>
                <span className={cn(
                  'px-2 py-0.5 rounded-full text-[10px]',
                  statusTab === 'ALL' ? 'bg-white/20 text-white font-black' : 'bg-slate-100 text-slate-600'
                )}>
                  {countAll}
                </span>
              </button>

              <button
                onClick={() => setStatusTab('Approved')}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer',
                  statusTab === 'Approved'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/25'
                    : 'bg-white/80 border border-slate-200/80 text-slate-700 hover:bg-white'
                )}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Approved</span>
                <span className={cn(
                  'px-2 py-0.5 rounded-full text-[10px]',
                  statusTab === 'Approved' ? 'bg-white/20 text-white font-black' : 'bg-emerald-50 text-emerald-700'
                )}>
                  {countApproved}
                </span>
              </button>

              <button
                onClick={() => setStatusTab('Resubmit')}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer',
                  statusTab === 'Resubmit'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-500/25'
                    : 'bg-white/80 border border-slate-200/80 text-slate-700 hover:bg-white'
                )}
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Resubmit</span>
                <span className={cn(
                  'px-2 py-0.5 rounded-full text-[10px]',
                  statusTab === 'Resubmit' ? 'bg-white/20 text-white font-black' : 'bg-amber-50 text-amber-700'
                )}>
                  {countResubmit}
                </span>
              </button>

              <button
                onClick={() => setStatusTab('Pending')}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer',
                  statusTab === 'Pending'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'bg-white/80 border border-slate-200/80 text-slate-700 hover:bg-white'
                )}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Pending</span>
                <span className={cn(
                  'px-2 py-0.5 rounded-full text-[10px]',
                  statusTab === 'Pending' ? 'bg-white/20 text-white font-black' : 'bg-blue-50 text-blue-700'
                )}>
                  {countPending}
                </span>
              </button>

              <button
                onClick={() => setStatusTab('Rejected')}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer',
                  statusTab === 'Rejected'
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-500/25'
                    : 'bg-white/80 border border-slate-200/80 text-slate-700 hover:bg-white'
                )}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Rejected</span>
                <span className={cn(
                  'px-2 py-0.5 rounded-full text-[10px]',
                  statusTab === 'Rejected' ? 'bg-white/20 text-white font-black' : 'bg-rose-50 text-rose-700'
                )}>
                  {countRejected}
                </span>
              </button>
            </div>

            {/* Glass Search Capsule (Same Row) */}
            <div className="relative flex-1 lg:max-w-md w-full">
              <div className="bg-white/80 backdrop-blur-xl rounded-full p-1.5 border border-white/90 shadow-md shadow-slate-900/5 flex items-center justify-between gap-2">
                <div className="flex-1 flex items-center gap-2 min-w-0">
                  <button
                    type="button"
                    id="btn-search-by-dropdown"
                    onClick={() => setIsSearchByOpen(!isSearchByOpen)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200/60 rounded-full text-xs font-bold text-blue-700 transition shrink-0 select-none cursor-pointer"
                  >
                    <span>{SEARCH_FIELD_OPTIONS.find(o => o.id === searchBy)?.label || 'ALL FIELDS'}</span>
                    {isSearchByOpen ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <div className="relative flex-1 flex items-center min-w-0">
                    <Search className="w-4 h-4 text-slate-400 absolute left-2.5 pointer-events-none" />
                    <input
                      id="individual-search-input"
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder={SEARCH_FIELD_OPTIONS.find(o => o.id === searchBy)?.placeholder || 'RUN ID SEARCH'}
                      className="w-full h-8 pl-8 pr-7 bg-transparent text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none"
                    />
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => setSearchTerm('')}
                        className="absolute right-2 p-1 text-slate-400 hover:text-slate-600 rounded-full transition cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Dropdown Popup Menu */}
              {isSearchByOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsSearchByOpen(false)} />
                  <div className="absolute left-0 top-full mt-2 w-64 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
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
                              "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-left cursor-pointer",
                              isSelected
                                ? "text-blue-700 bg-blue-50"
                                : "text-slate-700 hover:bg-slate-50"
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
          </div>

          {/* Frosted Floating Filter Drawer */}
          {showFilterPanel && (
            <div
              id="individual-filter-section"
              className="bg-white/80 backdrop-blur-xl rounded-3xl p-5 border border-white/90 shadow-xl shadow-blue-500/5 space-y-4"
            >
              {(hasActiveFilters || searchTerm) && (
                <div className="flex items-center justify-end pb-1">
                  <button
                    onClick={handleResetFilters}
                    className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">Gender</label>
                  <select
                    value={genderFilter}
                    onChange={(e) => setGenderFilter(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-white rounded-2xl border border-slate-200 text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium"
                  >
                    <option value="ALL">All Genders</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">Marital Status</label>
                  <select
                    value={maritalFilter}
                    onChange={(e) => setMaritalFilter(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-white rounded-2xl border border-slate-200 text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium"
                  >
                    <option value="ALL">All Marital Statuses</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">Nationality</label>
                  <select
                    value={nationalityFilter}
                    onChange={(e) => setNationalityFilter(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-white rounded-2xl border border-slate-200 text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium"
                  >
                    <option value="ALL">All Nationalities</option>
                    {uniqueNationalities.map((nat) => (
                      <option key={nat} value={nat}>{nat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">Request Type</label>
                  <select
                    value={requestTypeFilter}
                    onChange={(e) => setRequestTypeFilter(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-white rounded-2xl border border-slate-200 text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium"
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
      )}

      {/* ========================================================================= */}
      {/* THEME 3: AURORA (Spectral Command Console / Dual-Deck Dock / Capsules)    */}
      {/* ========================================================================= */}
      {theme === 'aurora' && (
        <div className="space-y-4">
          {/* Spectral Command Center Header */}
          <div className="bg-white rounded-3xl p-6 border border-indigo-200/90 shadow-xl shadow-indigo-500/5 relative overflow-hidden">
            {/* Ambient soft glow accents */}
            <div className="absolute -top-12 -right-12 w-44 h-44 bg-indigo-100/70 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-44 h-44 bg-cyan-100/60 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-black bg-gradient-to-r from-indigo-700 via-purple-700 to-cyan-700 bg-clip-text text-transparent tracking-tight">
                      Individual Directory
                    </h1>
                  </div>
                  <p className="text-xs font-medium text-slate-500 mt-1">
                    Manage individual client onboarding, document verification, authorization lifecycle, and trading profiles.
                  </p>
                </div>
              </div>

              {/* Spectral Command Actions */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  id="btn-individual-reload"
                  onClick={handleReloadClick}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-indigo-200 rounded-xl hover:border-indigo-400 hover:bg-indigo-50/40 transition shadow-2xs"
                  title="Reload data from server"
                >
                  <RotateCw className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Reload</span>
                </button>

                <button
                  id="btn-individual-filter-toggle"
                  onClick={() => setShowFilterPanel(!showFilterPanel)}
                  className={cn(
                    'flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border transition shadow-2xs',
                    showFilterPanel
                      ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-400 text-indigo-900'
                      : 'bg-white border-indigo-200 text-slate-700 hover:border-indigo-300'
                  )}
                >
                  <Filter className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Filter</span>
                  {hasActiveFilters && (
                    <span className="w-2 h-2 rounded-full bg-cyan-500" />
                  )}
                </button>

                <button
                  id="btn-individual-customize-columns"
                  onClick={() => setShowCustomizeModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-indigo-200 rounded-xl hover:border-indigo-400 hover:bg-indigo-50/40 transition shadow-2xs"
                  title="Configure Table Columns"
                >
                  <Columns className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Columns</span>
                  {columns.filter((c) => c.visible).length > 0 && (
                    <span className="px-2 py-0.2 text-[10px] font-bold rounded-full bg-indigo-100 text-indigo-700">
                      {columns.filter((c) => c.visible).length}
                    </span>
                  )}
                </button>

                <div className="relative group">
                  <button
                    id="btn-individual-export"
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-indigo-200 rounded-xl hover:border-indigo-400 hover:bg-indigo-50/40 transition shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Export</span>
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-36 bg-white border border-indigo-100 rounded-2xl shadow-xl hidden group-hover:block z-20 py-1.5 text-xs">
                    <button
                      onClick={() => handleExport('csv')}
                      className="w-full text-left px-3.5 py-2 hover:bg-indigo-50 text-slate-700 font-bold rounded-xl mx-1"
                    >
                      Export as CSV
                    </button>
                    <button
                      onClick={() => handleExport('json')}
                      className="w-full text-left px-3.5 py-2 hover:bg-indigo-50 text-slate-700 font-bold rounded-xl mx-1"
                    >
                      Export as JSON
                    </button>
                  </div>
                </div>

                {/* Aurora Request Column View Switcher */}
                <div className="inline-flex items-center rounded-xl border border-indigo-200 bg-white p-0.5 shadow-2xs">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-indigo-700 font-semibold border-r border-indigo-100">
                    <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="hidden sm:inline">Request View:</span>
                  </div>
                  <div className="flex items-center gap-0.5 p-0.5">
                    <button
                      id="btn-toggle-request-bar-aurora"
                      type="button"
                      onClick={() => {
                        setRequestColumnLayout('bar');
                        triggerToast('Switched to Progress Bar Request view');
                      }}
                      className={cn(
                        'px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer',
                        requestColumnLayout === 'bar'
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-indigo-900 hover:bg-indigo-50/50'
                      )}
                      title="Progress Bar Request Layout"
                    >
                      Progress Bar
                    </button>
                    <button
                      id="btn-toggle-request-stepper-aurora"
                      type="button"
                      onClick={() => {
                        setRequestColumnLayout('stepper');
                        triggerToast('Switched to Stepper Nodes Request view');
                      }}
                      className={cn(
                        'px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer',
                        requestColumnLayout === 'stepper'
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-indigo-900 hover:bg-indigo-50/50'
                      )}
                      title="Connected Node Stepper Request Layout"
                    >
                      Stepper Nodes
                    </button>
                  </div>
                </div>

                <button
                  id="btn-individual-add-new"
                  onClick={onNavigateToInsert}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 hover:opacity-95 rounded-xl shadow-lg shadow-indigo-500/20 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Account</span>
                </button>
              </div>
            </div>
          </div>

          {/* Dual-Deck Modular Dock Layout (Status Telemetry Deck + Command Search Deck) */}
          <div
            id="individual-tabs-search-row"
            className="grid grid-cols-1 xl:grid-cols-12 gap-3"
          >
            {/* Left Module: Status Telemetry Pipeline Dock */}
            <div className="xl:col-span-7 bg-white rounded-2xl p-2 border border-indigo-100 shadow-2xs flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setStatusTab('ALL')}
                className={cn(
                  'flex-1 min-w-[110px] flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer select-none',
                  statusTab === 'ALL'
                    ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-500 text-indigo-950 shadow-xs'
                    : 'bg-slate-50/70 border border-slate-200/70 text-slate-600 hover:bg-indigo-50/30'
                )}
              >
                <span>All</span>
                <span className={cn(
                  'px-2 py-0.5 rounded-full text-[10px] font-mono font-bold',
                  statusTab === 'ALL' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                )}>
                  {countAll}
                </span>
              </button>

              <button
                onClick={() => setStatusTab('Approved')}
                className={cn(
                  'flex-1 min-w-[110px] flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer select-none',
                  statusTab === 'Approved'
                    ? 'bg-emerald-50 border-2 border-emerald-500 text-emerald-950 shadow-xs'
                    : 'bg-slate-50/70 border border-slate-200/70 text-slate-600 hover:bg-emerald-50/30'
                )}
              >
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <span>Approved</span>
                </div>
                <span className={cn(
                  'px-2 py-0.5 rounded-full text-[10px] font-mono font-bold',
                  statusTab === 'Approved' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                )}>
                  {countApproved}
                </span>
              </button>

              <button
                onClick={() => setStatusTab('Resubmit')}
                className={cn(
                  'flex-1 min-w-[110px] flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer select-none',
                  statusTab === 'Resubmit'
                    ? 'bg-amber-50 border-2 border-amber-500 text-amber-950 shadow-xs'
                    : 'bg-slate-50/70 border border-slate-200/70 text-slate-600 hover:bg-amber-50/30'
                )}
              >
                <div className="flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-amber-500" />
                  <span>Resubmit</span>
                </div>
                <span className={cn(
                  'px-2 py-0.5 rounded-full text-[10px] font-mono font-bold',
                  statusTab === 'Resubmit' ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-600'
                )}>
                  {countResubmit}
                </span>
              </button>

              <button
                onClick={() => setStatusTab('Pending')}
                className={cn(
                  'flex-1 min-w-[110px] flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer select-none',
                  statusTab === 'Pending'
                    ? 'bg-indigo-50 border-2 border-indigo-500 text-indigo-950 shadow-xs'
                    : 'bg-slate-50/70 border border-slate-200/70 text-slate-600 hover:bg-indigo-50/30'
                )}
              >
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-indigo-500" />
                  <span>Pending</span>
                </div>
                <span className={cn(
                  'px-2 py-0.5 rounded-full text-[10px] font-mono font-bold',
                  statusTab === 'Pending' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                )}>
                  {countPending}
                </span>
              </button>

              <button
                onClick={() => setStatusTab('Rejected')}
                className={cn(
                  'flex-1 min-w-[110px] flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer select-none',
                  statusTab === 'Rejected'
                    ? 'bg-rose-50 border-2 border-rose-500 text-rose-950 shadow-xs'
                    : 'bg-slate-50/70 border border-slate-200/70 text-slate-600 hover:bg-rose-50/30'
                )}
              >
                <div className="flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-rose-500" />
                  <span>Rejected</span>
                </div>
                <span className={cn(
                  'px-2 py-0.5 rounded-full text-[10px] font-mono font-bold',
                  statusTab === 'Rejected' ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-600'
                )}>
                  {countRejected}
                </span>
              </button>
            </div>

            {/* Right Module: Command Search Dock */}
            <div className="xl:col-span-5 relative">
              <div className="flex items-stretch rounded-2xl border border-indigo-200 hover:border-indigo-300 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 bg-white shadow-2xs transition-all h-full min-h-[46px]">
                <button
                  type="button"
                  id="btn-search-by-dropdown"
                  onClick={() => setIsSearchByOpen(!isSearchByOpen)}
                  className="flex items-center gap-1.5 px-3.5 bg-indigo-50/70 hover:bg-indigo-100/70 border-r border-indigo-100 text-[11px] font-bold text-indigo-950 uppercase tracking-wider rounded-l-2xl transition shrink-0 select-none cursor-pointer"
                >
                  <span>{SEARCH_FIELD_OPTIONS.find(o => o.id === searchBy)?.label || 'ALL FIELDS'}</span>
                  {isSearchByOpen ? (
                    <ChevronUp className="w-3.5 h-3.5 text-indigo-600" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-indigo-600" />
                  )}
                </button>

                <div className="relative flex-1 flex items-center min-w-0 bg-transparent">
                  <Search className="w-4 h-4 text-indigo-400 absolute left-3.5 pointer-events-none shrink-0" />
                  <input
                    id="individual-search-input"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={SEARCH_FIELD_OPTIONS.find(o => o.id === searchBy)?.placeholder || 'RUN ID SEARCH'}
                    className="w-full h-full pl-10 pr-8 bg-transparent text-xs font-bold text-slate-900 placeholder:text-indigo-300 uppercase tracking-wider focus:outline-none"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 rounded transition cursor-pointer"
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
                  <div className="fixed inset-0 z-40" onClick={() => setIsSearchByOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-indigo-100 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
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
                              "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition text-left cursor-pointer",
                              isSelected
                                ? "text-indigo-900 bg-indigo-50 font-extrabold"
                                : "text-slate-700 hover:bg-indigo-50/50 hover:text-slate-900"
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
          </div>

          {/* Spectral Filter Matrix Drawer */}
          {showFilterPanel && (
            <div
              id="individual-filter-section"
              className="bg-gradient-to-br from-white via-indigo-50/20 to-cyan-50/20 rounded-2xl p-4 border border-indigo-200/90 shadow-2xs space-y-3"
            >
              {(hasActiveFilters || searchTerm) && (
                <div className="flex items-center justify-end border-b border-indigo-100/80 pb-2.5">
                  <button
                    onClick={handleResetFilters}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition cursor-pointer"
                  >
                    Reset Matrix
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-indigo-950 mb-1">Gender</label>
                  <select
                    value={genderFilter}
                    onChange={(e) => setGenderFilter(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white rounded-xl border border-indigo-200 text-slate-800 shadow-2xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 font-semibold"
                  >
                    <option value="ALL">All Genders</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-indigo-950 mb-1">Marital Status</label>
                  <select
                    value={maritalFilter}
                    onChange={(e) => setMaritalFilter(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white rounded-xl border border-indigo-200 text-slate-800 shadow-2xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 font-semibold"
                  >
                    <option value="ALL">All Marital Statuses</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-indigo-950 mb-1">Nationality</label>
                  <select
                    value={nationalityFilter}
                    onChange={(e) => setNationalityFilter(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white rounded-xl border border-indigo-200 text-slate-800 shadow-2xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 font-semibold"
                  >
                    <option value="ALL">All Nationalities</option>
                    {uniqueNationalities.map((nat) => (
                      <option key={nat} value={nat}>{nat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-indigo-950 mb-1">Request Type</label>
                  <select
                    value={requestTypeFilter}
                    onChange={(e) => setRequestTypeFilter(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white rounded-xl border border-indigo-200 text-slate-800 shadow-2xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 font-semibold"
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

                {/* Default Column: Request with UI version toggle */}
                <th className="py-3 px-4 min-w-[390px]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold">Request</span>
                    <div className="inline-flex items-center bg-slate-200/70 p-0.5 rounded-lg border border-slate-300/60 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => {
                          setRequestColumnLayout('bar');
                          triggerToast('Switched to Progress Bar Request view');
                        }}
                        className={cn(
                          'px-2 py-0.5 text-[10px] font-bold rounded-md transition cursor-pointer',
                          requestColumnLayout === 'bar'
                            ? 'bg-white text-blue-600 shadow-2xs border border-slate-200/80'
                            : 'text-slate-500 hover:text-slate-800'
                        )}
                        title="Switch to Progress Bar View"
                      >
                        Bar View
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRequestColumnLayout('stepper');
                          triggerToast('Switched to Stepper Nodes Request view');
                        }}
                        className={cn(
                          'px-2 py-0.5 text-[10px] font-bold rounded-md transition cursor-pointer',
                          requestColumnLayout === 'stepper'
                            ? 'bg-white text-blue-600 shadow-2xs border border-slate-200/80'
                            : 'text-slate-500 hover:text-slate-800'
                        )}
                        title="Switch to Stepper Nodes View"
                      >
                        Stepper View
                      </button>
                    </div>
                  </div>
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
