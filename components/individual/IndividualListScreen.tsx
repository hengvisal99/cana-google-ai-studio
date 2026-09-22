'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { 
  Individual, 
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
  Layers,
  SlidersHorizontal,
  Globe,
  Heart,
  LayoutList,
  RotateCcw,
  Tags,
  Mail
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { CheckBadge, FilterSelect, LIFTED_ACTIVE, MENU_SURFACE, Popover } from './DirectoryControls';
import { CustomerTypePickerDialog } from '@/components/customer/CustomerTypePickerDialog';
import { ResendEmailDialog } from '@/components/shared/ApproveDialogVariants';
import type { CustomerTypeRecord } from '@/types';
import { FormDatePicker } from '@/components/ui/form';
import { RowActionMenu, useRowActionMenu, type RowAction } from '@/components/shared/RowActionMenu';
import { SortableHeader, sortRows, useTableSort, type SortValue } from '@/components/shared/SortableHeader';
import { BulkApproveBar, BulkApproveDialog, ROW_CHECKBOX } from '@/components/shared/BulkApprove';

interface IndividualListScreenProps {
  individuals: Individual[];
  onViewIndividual: (individual: Individual) => void;
  onNavigateToInsert: () => void;
  onNavigateToUpdate: (individual: Individual) => void;
  onNavigateToCustomer360: (individual: Individual) => void;
  onSaveCustomerTypeRecord?: (record: CustomerTypeRecord) => void;
  /** Ids already in use, so a new customer type record gets the next free one */
  customerTypeRecordIds?: string[];
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
}

type SearchByField = 'all' | 'customerName' | 'accountNo' | 'roName' | 'roId';

const SEARCH_FIELD_OPTIONS: { id: SearchByField; label: string; placeholder: string }[] = [
  { id: 'all', label: 'ALL FIELDS', placeholder: 'RUN ID SEARCH' },
  { id: 'customerName', label: 'CUSTOMER NAME', placeholder: 'SEARCH CUSTOMER NAME' },
  { id: 'accountNo', label: 'ACCOUNT NO', placeholder: 'SEARCH ACCOUNT NO' },
  { id: 'roName', label: 'RO NAME', placeholder: 'SEARCH RO NAME' },
  { id: 'roId', label: 'RO ID', placeholder: 'SEARCH RO ID' },
];

/** Request-status tabs in lifecycle order (open → closed); the icon carries the status colour. */
export const STATUS_TABS: { id: 'ALL' | RequestStatus; label: string; icon: React.ElementType; iconColor: string }[] = [
  { id: 'ALL', label: 'All', icon: LayoutList, iconColor: 'text-blue-600' },
  { id: 'Pending', label: 'Pending', icon: Clock, iconColor: 'text-yellow-500' },
  { id: 'Resubmit', label: 'Resubmit', icon: AlertCircle, iconColor: 'text-orange-600' },
  { id: 'Approved', label: 'Approved', icon: CheckCircle2, iconColor: 'text-emerald-500' },
  { id: 'Rejected', label: 'Rejected', icon: AlertTriangle, iconColor: 'text-rose-500' },
];

/** Status icon shared by the tabs' definitions and the Request column, so both always match. */
function StatusIcon({ status, className }: { status: RequestStatus; className?: string }) {
  const tab = STATUS_TABS.find((t) => t.id === status) ?? STATUS_TABS[0];
  const Icon = tab.icon;
  return <Icon className={cn('h-4 w-4 shrink-0 stroke-[2.2]', tab.iconColor, className)} />;
}

const GENDER_OPTIONS = ['Male', 'Female', 'Other'];
const MARITAL_OPTIONS = ['Single', 'Married', 'Divorced', 'Widowed'];
const REQUEST_TYPE_OPTIONS = ['Registration', 'Close Account'];

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
  onSaveCustomerTypeRecord,
  customerTypeRecordIds,
  onDeleteIndividual,
  onAuthorizeIndividual,
  onCloseAccountIndividual,
  onReload,
}: IndividualListScreenProps) {
  // Status Tab filter: Approved | Resubmit | Pending | Rejected | All
  const [statusTab, setStatusTab] = useState<'ALL' | RequestStatus>('ALL');

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState<SearchByField>('all');

  // Filter fields
  const [showFilterPanel, setShowFilterPanel] = useState(true);  const [genderFilter, setGenderFilter] = useState<string>('ALL');
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
  const [closeOfficer] = useState('Sophea Keo (CSO)');
  const [closeDelinkCsx, setCloseDelinkCsx] = useState(false);
  const [closeDelinkBankAc, setCloseDelinkBankAc] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };


  // Delete Confirmation Modal state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Customer Type dialog: the customer whose row opened it
  const [customerTypeIndividualId, setCustomerTypeIndividualId] = useState<string | null>(null);
  const customerTypeIndividual = individuals.find((item) => item.id === customerTypeIndividualId);

  // Resend Email confirmation: the customer whose row opened it
  const [resendEmailId, setResendEmailId] = useState<string | null>(null);
  const resendEmailIndividual = individuals.find((item) => item.id === resendEmailId);

  // Status Tab counts
  const countAll = individuals.length;
  const countApproved = individuals.filter((i) => i.requestStatus === 'Approved').length;
  const countResubmit = individuals.filter((i) => i.requestStatus === 'Resubmit').length;
  const countPending = individuals.filter((i) => i.requestStatus === 'Pending').length;
  const countRejected = individuals.filter((i) => i.requestStatus === 'Rejected').length;
  const statusCounts: Record<'ALL' | RequestStatus, number> = {
    ALL: countAll,
    Approved: countApproved,
    Resubmit: countResubmit,
    Pending: countPending,
    Rejected: countRejected,
  };

  const activeSearchField = SEARCH_FIELD_OPTIONS.find((o) => o.id === searchBy) ?? SEARCH_FIELD_OPTIONS[0];
  const searchInputRef = React.useRef<HTMLInputElement>(null);

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

  const { sort, toggle: toggleSort } = useTableSort();
  // Table and export follow the sorted column; unsorted keeps the source order
  const sortedData = useMemo(() => {
    // Hiding the sorted column drops its sort too
    const hidden = sort && columns.some((col) => col.id === sort.key && !col.visible);
    return sortRows(filteredData, hidden ? null : sort, sortValue);
  }, [filteredData, sort, columns]);

  // Bulk approve: only pending requests at a review stage can be ticked
  const canBulkApprove = Boolean(onAuthorizeIndividual);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkApproving, setBulkApproving] = useState(false);
  const approvableRows = useMemo(() => sortedData.filter(isApprovable), [sortedData]);
  // Rows filtered out or already moved on drop out of the selection
  const selectedRows = approvableRows.filter((item) => selectedIds.has(item.id));
  const allSelected = approvableRows.length > 0 && selectedRows.length === approvableRows.length;

  const toggleSelected = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleSelectAll = () =>
    setSelectedIds(allSelected ? new Set() : new Set(approvableRows.map((item) => item.id)));

  const handleBulkApprove = () => {
    if (!onAuthorizeIndividual) return;
    selectedRows.forEach((item) => {
      const role = item.currentWorkflowStage as ReviewStage;
      const officer = STAGE_OFFICER[role];
      onAuthorizeIndividual(item.id, 'authorize', role, officer, `Bulk approved by ${officer}`, '');
    });
    triggerToast(`${selectedRows.length} ${selectedRows.length === 1 ? 'application' : 'applications'} approved.`);
    setSelectedIds(new Set());
    setBulkApproving(false);
  };

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
      const headers = ['Customer ID', 'Full Name EN', 'Full Name KH', 'Gender', 'Nationality', 'Profile Status', 'Account Status', 'Request Type', 'Request Status', 'Workflow Stage'];
      const rows = sortedData.map((item) => [
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
      const jsonStr = JSON.stringify(sortedData, null, 2);
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
    // Reviewer after the dot (SR or Manager only): the current stage while in review, otherwise
    // whoever last acted on it, since reject/resubmit overwrite the stage with the status word
    const isReviewer = (role?: string): role is 'SR' | 'Manager' => role === 'SR' || role === 'Manager';
    const reviewer = isReviewer(item.currentWorkflowStage)
      ? item.currentWorkflowStage
      : [...(item.authorizationHistory ?? [])].reverse().find((h) => isReviewer(h.role))?.role;

    if (isApproved) {
      return (
        <div className="flex items-start gap-2.5 select-none text-left py-0.5">
          <StatusIcon status="Approved" className="mt-0.5" />
          <div className="flex flex-col">
            <span className="text-[13px] font-semibold text-slate-900 leading-tight">
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
          <StatusIcon status="Pending" className="mt-0.5" />
          <div className="flex flex-col">
            <div className="flex items-center gap-1 leading-tight">
              <span className="text-[13px] font-semibold text-slate-900">
                Pending
              </span>
              {reviewer && (
                <>
                  <span className="text-slate-400 font-semibold text-xs">·</span>
                  <span className="text-slate-600 font-semibold text-xs">{reviewer}</span>
                </>
              )}
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
          <StatusIcon status="Rejected" className="mt-0.5" />
          <div className="flex flex-col">
            <div className="flex items-center gap-1 leading-tight">
              <span className="text-[13px] font-semibold text-slate-900">
                Rejected
              </span>
              {reviewer && (
                <>
                  <span className="text-slate-400 font-semibold text-xs">·</span>
                  <span className="text-slate-600 font-semibold text-xs">{reviewer}</span>
                </>
              )}
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
        <StatusIcon status="Resubmit" className="mt-0.5" />
        <div className="flex flex-col">
          <div className="flex items-center gap-1 leading-tight">
            <span className="text-[13px] font-semibold text-slate-900">
              Resubmit
            </span>
            {reviewer && (
              <>
                <span className="text-slate-400 font-semibold text-xs">·</span>
                <span className="text-slate-600 font-semibold text-xs">{reviewer}</span>
              </>
            )}
          </div>
          <span className="text-[11px] text-slate-500 font-normal leading-tight mt-0.5">
            {requestType}
          </span>
        </div>
      </div>
    );
  };

  const rowMenu = useRowActionMenu();
  const menuItem = rowMenu.menu ? filteredData.find((item) => item.id === rowMenu.menu!.rowId) : undefined;

  const rowActions = (item: Individual): RowAction[] => [
    { id: 'view', label: 'View', icon: Eye, iconClassName: 'text-slate-500', shortcut: 'V', group: 0, onSelect: () => onViewIndividual(item) },
    { id: 'edit', label: 'Edit', icon: Edit3, iconClassName: 'text-slate-500', shortcut: 'E', group: 0, onSelect: () => onNavigateToUpdate(item) },
    { id: 'customer-type', label: 'Customer Type', icon: Tags, iconClassName: 'text-slate-500', shortcut: 'T', group: 1, onSelect: () => setCustomerTypeIndividualId(item.id) },
    {
      // No mail backend yet, so the result is a toast
      id: 'resend-email',
      label: 'Resend Email',
      icon: Mail,
      iconClassName: 'text-slate-500',
      shortcut: 'M',
      group: 1,
      onSelect: () => (item.email ? setResendEmailId(item.id) : triggerToast('No email address on file.')),
    },
    ...(item.accountStatus === 'Active'
      ? [
          {
            id: 'close-account',
            label: 'Close Account',
            icon: Lock,
            iconClassName: 'text-slate-500',
            shortcut: 'C',
            group: 1,
            onSelect: () => {
              setCloseAccountModalIndividual(item);
              setCloseAccountName(item.tradingAccountInfo?.tradingAccountNumber || 'Primary Account');
              setCloseReason('');
              setCloseDelinkCsx(false);
              setCloseDelinkBankAc(false);
            },
          },
        ]
      : []),
    { id: 'delete', label: 'Delete', icon: Trash2, iconClassName: 'text-rose-500', shortcut: 'D', danger: true, group: 2, onSelect: () => setDeletingId(item.id) },
  ];

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
      {/* DIRECTORY CARD — identity, action bar, tabs, search and filters in one box */}
      {/* ========================================================================= */}
      <div
        id="individual-filter-section-reference"
        className="relative z-30 space-y-5 rounded-[20px] border border-slate-200/60 bg-white p-5 shadow-[0_10px_40px_-28px_rgba(15,23,42,0.35)] sm:p-6"
      >
        {/* Row 1: identity + toolbar dock + primary action */}
        <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h1 className="text-[26px] font-semibold tracking-tight text-slate-900">Individual Directory</h1>
            <p className="mt-1 text-xs text-slate-500">
              Manage individual client onboarding, document verification, authorization lifecycle, and trading profiles.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Toolbar dock */}
            <div className="inline-flex h-10 items-center gap-1 rounded-xl border border-slate-200/70 bg-slate-50 p-1">
              <button
                id="btn-individual-reload"
                type="button"
                onClick={handleReloadClick}
                className="inline-flex h-[30px] cursor-pointer items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-slate-600 transition hover:bg-white hover:text-slate-900"
                title="Reload data from server"
              >
                <RotateCw className="h-4 w-4 shrink-0" />
                <span>Reload</span>
              </button>

              {/* Filter: raised while the panel is open; outlined when closed with filters applied */}
              <button
                id="btn-individual-filter-toggle"
                type="button"
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                aria-expanded={showFilterPanel}
                className={cn(
                  'inline-flex h-[30px] cursor-pointer items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-all',
                  showFilterPanel
                    ? cn(LIFTED_ACTIVE, 'text-blue-600')
                    : hasActiveFilters
                      ? 'bg-white text-blue-700 ring-1 ring-inset ring-blue-200 hover:ring-blue-300'
                      : 'text-slate-600 hover:bg-white hover:text-slate-900'
                )}
                title="Toggle Filters"
              >
                <Filter className="h-4 w-4 shrink-0" />
                <span>Filter</span>
                {hasActiveFilters && (
                  <span
                    aria-label={`${activeFilterCount} active filter${activeFilterCount === 1 ? '' : 's'}`}
                    className="grid h-[18px] min-w-[18px] place-items-center rounded-full bg-blue-100 px-1 text-[10px] font-semibold leading-none tabular-nums text-blue-700"
                  >
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <button
                id="btn-individual-customize-columns"
                type="button"
                onClick={() => setShowCustomizeModal(true)}
                className="inline-flex h-[30px] cursor-pointer items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-slate-600 transition hover:bg-white hover:text-slate-900"
                title="Configure Table Columns"
              >
                <Columns className="h-4 w-4 shrink-0" />
                <span>Columns</span>
              </button>

              {/* Export: hover menu (pt-2 bridges the gap so it stays open while moving down) */}
              <div className="group relative">
                <button
                  id="btn-individual-export"
                  type="button"
                  className="inline-flex h-[30px] cursor-pointer items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-slate-600 transition hover:bg-white hover:text-slate-900"
                >
                  <Download className="h-4 w-4 shrink-0" />
                  <span>Export</span>
                </button>
                <div className="absolute right-0 top-full z-30 hidden pt-2 group-hover:block">
                  <div className={cn('w-40', MENU_SURFACE)}>
                    <button
                      type="button"
                      onClick={() => handleExport('csv')}
                      className="flex w-full cursor-pointer rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Export as CSV
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExport('json')}
                      className="flex w-full cursor-pointer rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Export as JSON
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Primary action: the only solid blue control */}
            <button
              id="btn-individual-add-new"
              type="button"
              onClick={onNavigateToInsert}
              className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-xl bg-blue-500 px-3.5 text-xs font-semibold text-white shadow-md shadow-blue-500/30 transition hover:bg-blue-600"
            >
              <Plus className="h-5 w-5" />
              <span>Add New</span>
            </button>
          </div>
        </div>

        {/* Row 2: status tabs + search, on the same grid as the filter row so the
            search box lands exactly above the last filter select at every width */}
        <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4">
          {/* 34px tabs + 4px padding + 1px border = 44px, matching the search box and filter selects */}
          <div className="inline-flex max-w-full flex-wrap items-center justify-self-start gap-1 rounded-xl border border-slate-200/60 bg-slate-50 p-1 sm:col-span-2 lg:col-span-3">
            {STATUS_TABS.map((tab) => {
              const isActive = statusTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  id={`tab-status-${tab.id.toLowerCase()}`}
                  onClick={() => setStatusTab(tab.id)}
                  className={cn(
                    'group relative inline-flex h-[30px] cursor-pointer select-none items-center gap-2 whitespace-nowrap rounded-lg px-3.5 text-[13px] transition-colors',
                    isActive ? 'font-semibold text-blue-600' : 'font-medium text-slate-600 hover:text-slate-900'
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="individual-status-tab"
                      className={cn('absolute inset-0 rounded-lg', LIFTED_ACTIVE)}
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                    />
                  )}
                  <Icon
                    className={cn(
                      'relative h-4 w-4 shrink-0 stroke-[2.2] transition-colors',
                      // Status icons always carry their colour; the neutral "All" icon only turns blue when active
                      isActive || tab.id !== 'ALL' ? tab.iconColor : 'text-slate-400 group-hover:text-slate-600'
                    )}
                  />
                  <span className="relative">{tab.label}</span>
                  <span
                    className={cn(
                      'relative min-w-[22px] rounded-full px-1.5 py-[3px] text-center text-[11px] font-semibold tabular-nums leading-none transition-colors',
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'bg-slate-200/60 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700'
                    )}
                  >
                    {statusCounts[tab.id]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search with field picker; results filter as you type. Sits in the last
              grid column, so it is exactly as wide as the select beneath it. */}
          <div className="w-full sm:col-start-2 lg:col-start-4">
            <div className="flex h-11 w-full items-center gap-1.5 rounded-xl border border-slate-200 bg-white pl-2 pr-1.5 transition focus-within:border-slate-400">
              <Popover
                className="shrink-0"
                trigger={({ open, toggle }) => (
                  <button
                    id="btn-search-by-dropdown"
                    type="button"
                    onClick={toggle}
                    aria-expanded={open}
                    className="inline-flex h-8 cursor-pointer select-none items-center gap-1 rounded-lg px-2.5 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                  >
                    {activeSearchField.label}
                    <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')} />
                  </button>
                )}
              >
                {(close) => (
                  <div className={cn('absolute left-0 top-full z-50 mt-3 w-60', MENU_SURFACE)}>
                    {SEARCH_FIELD_OPTIONS.map((opt) => {
                      const isSelected = searchBy === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setSearchBy(opt.id);
                            close();
                            searchInputRef.current?.focus();
                          }}
                          className={cn(
                            'flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider transition',
                            isSelected ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
                          )}
                        >
                          {opt.label}
                          {isSelected && <CheckBadge />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </Popover>
              <span className="h-5 w-px shrink-0 bg-slate-200" />
              <input
                id="individual-search-input"
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={activeSearchField.placeholder}
                enterKeyHint="search"
                className="min-w-0 flex-1 bg-transparent px-1.5 text-xs font-semibold uppercase tracking-wide text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => searchInputRef.current?.focus()}
                aria-label="Search"
                title="Search"
                className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-lg bg-slate-100 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600 active:scale-95"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Row 3: four filter selects (toggled by the Filter button), Reset closing the row */}
        {showFilterPanel && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
              <FilterSelect
                id="filter-gender"
                label="Gender"
                value={genderFilter}
                options={GENDER_OPTIONS}
                onChange={setGenderFilter}
              />
              <FilterSelect
                id="filter-marital-status"
                label="Marital Status"
                value={maritalFilter}
                options={MARITAL_OPTIONS}
                onChange={setMaritalFilter}
              />
              <FilterSelect
                id="filter-nationality"
                label="Nationality"
                value={nationalityFilter}
                options={uniqueNationalities}
                onChange={setNationalityFilter}
              />
              <FilterSelect
                id="filter-request-type"
                label="Request Type"
                value={requestTypeFilter}
                options={REQUEST_TYPE_OPTIONS}
                onChange={setRequestTypeFilter}
              />
            </div>

            {/* Borderless, and only once a select actually holds a value */}
            {hasActiveFilters && (
              <div className="flex justify-end">
                <button
                  id="btn-individual-reset-filters"
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 hover:text-rose-700"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Table Container with MD default columns + customizable optional columns */}
      <div className="relative z-10 overflow-hidden rounded-[20px] border border-slate-200/60 bg-white shadow-[0_10px_40px_-28px_rgba(15,23,42,0.35)]">
        <div className="overflow-x-auto">
          <table id="individual-data-table" className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                {canBulkApprove && (
                  <th className="w-10 py-3 pl-4 pr-1">
                    <input
                      id="checkbox-individual-select-all"
                      type="checkbox"
                      checked={allSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = selectedRows.length > 0 && !allSelected;
                      }}
                      onChange={toggleSelectAll}
                      disabled={approvableRows.length === 0}
                      aria-label="Select all pending requests"
                      title="Select all pending requests"
                      className={ROW_CHECKBOX}
                    />
                  </th>
                )}

                <SortableHeader label="Customer ID" sortKey="customerId" sort={sort} onSort={toggleSort} className="py-3 px-4 font-semibold text-slate-700 text-left" />
                <SortableHeader label="Full Name (EN / KH)" sortKey="name" sort={sort} onSort={toggleSort} className="py-3 px-4 font-semibold text-slate-700 text-left" />

                {/* Optional Columns (if enabled) */}
                {OPTIONAL_SORT_COLUMNS.filter((col) => isColVisible(col.id)).map((col) => (
                  <SortableHeader key={col.id} label={col.label} sortKey={col.id} sort={sort} onSort={toggleSort} className="py-3 px-3" />
                ))}

                <SortableHeader label="Profile Status" sortKey="profileStatus" sort={sort} onSort={toggleSort} className="py-3 px-4" />
                <SortableHeader label="Account Status" sortKey="accountStatus" sort={sort} onSort={toggleSort} className="py-3 px-4" />
                <SortableHeader label="Request" sortKey="request" sort={sort} onSort={toggleSort} className="py-3 px-4 min-w-[160px] font-semibold text-slate-700 text-left" />

                {/* Default Column: Action */}
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedData.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileText className="w-8 h-8 text-slate-300" />
                      <p className="font-semibold text-slate-600">No record found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedData.map((item) => (
                  <tr
                    key={item.id}
                    id={`individual-row-${item.id}`}
                    onContextMenu={(e) => rowMenu.openFromContextMenu(item.id, e)}
                    className={cn('hover:bg-slate-50/75 transition-[background-color] group', (rowMenu.menu?.rowId === item.id || selectedIds.has(item.id)) && 'bg-slate-50/75')}
                  >
                    {canBulkApprove && (
                      <td className="py-3.5 pl-4 pr-1">
                        <input
                          id={`checkbox-individual-${item.id}`}
                          type="checkbox"
                          checked={selectedIds.has(item.id)}
                          onChange={() => toggleSelected(item.id)}
                          disabled={!isApprovable(item)}
                          aria-label={`Select ${item.customerId || item.id}`}
                          title={isApprovable(item) ? undefined : 'Only pending requests can be approved'}
                          className={ROW_CHECKBOX}
                        />
                      </td>
                    )}

                    {/* Customer ID */}
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                      {item.customerId || item.id}
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
                          <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                            <span>{item.fullNameEN || `${item.firstName} ${item.lastName}`}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium">
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

                    {/* Action: three-dot menu; right-clicking the row opens the same menu */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        id={`btn-action-menu-${item.id}`}
                        type="button"
                        {...rowMenu.triggerProps(item.id)}
                        className={cn(
                          'p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition',
                          rowMenu.menu?.rowId === item.id && 'bg-slate-100 text-slate-900'
                        )}
                        title="Actions (or right-click the row)"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {rowMenu.menu && menuItem && (
        <RowActionMenu anchor={rowMenu.menu.anchor} actions={rowActions(menuItem)} onClose={rowMenu.close} />
      )}

      {selectedRows.length > 0 && !bulkApproving && (
        <BulkApproveBar
          idPrefix="individual"
          count={selectedRows.length}
          onClear={() => setSelectedIds(new Set())}
          onApprove={() => setBulkApproving(true)}
        />
      )}

      {bulkApproving && selectedRows.length > 0 && (
        <BulkApproveDialog
          idPrefix="individual"
          count={selectedRows.length}
          noun={['application', 'applications']}
          onCancel={() => setBulkApproving(false)}
          onConfirm={handleBulkApprove}
        />
      )}

      {/* Customize Columns Modal */}
      {showCustomizeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20 animate-in fade-in zoom-in-95">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 px-6 pt-6">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-500 text-white shadow-md shadow-blue-500/25">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">Customize Columns</h3>
                    <p className="text-xs text-slate-500">Choose which fields appear in the table</p>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => {
                    setShowCustomizeModal(false);
                    setColumnSearch('');
                  }}
                  className="grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Search + bulk actions */}
              <div className="flex items-center gap-3 px-6 pt-5">
                <div className="relative min-w-0 flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={columnSearch}
                    onChange={(e) => setColumnSearch(e.target.value)}
                    placeholder="Search attributes..."
                    className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-8 text-xs font-medium text-slate-800 transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                  />
                  {columnSearch && (
                    <button
                      type="button"
                      aria-label="Clear search"
                      onClick={() => setColumnSearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer rounded-full p-0.5 text-slate-400 transition hover:text-slate-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setColumns((prev) => prev.map((col) => ({ ...col, visible: true })))}
                    className="cursor-pointer rounded-md px-2 py-1.5 text-blue-600 transition hover:bg-blue-50"
                  >
                    Select All
                  </button>
                  <span className="h-3.5 w-px bg-slate-200" />
                  <button
                    type="button"
                    onClick={() => setColumns((prev) => prev.map((col) => ({ ...col, visible: false })))}
                    className="cursor-pointer rounded-md px-2 py-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Column options */}
              <div className="grid max-h-80 grid-cols-1 gap-2 overflow-y-auto px-6 py-5 sm:grid-cols-2">
                {columns
                  .filter((c) => c.label.toLowerCase().includes(columnSearch.toLowerCase()))
                  .map((col) => (
                    <button
                      key={col.id}
                      type="button"
                      role="switch"
                      aria-checked={col.visible}
                      title={col.label}
                      onClick={() => handleToggleColumn(col.id)}
                      className={cn(
                        'flex cursor-pointer select-none items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-left text-xs transition',
                        col.visible
                          ? 'border-blue-200 bg-blue-50/50 font-semibold text-slate-900'
                          : 'border-slate-200 bg-white font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900'
                      )}
                    >
                      <span className="truncate">{col.label}</span>
                      <span
                        className={cn(
                          'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors',
                          col.visible ? 'bg-blue-500' : 'bg-slate-200'
                        )}
                      >
                        <span
                          className={cn(
                            'h-4 w-4 rounded-full bg-white shadow-sm transition-transform',
                            col.visible ? 'translate-x-[18px]' : 'translate-x-0.5'
                          )}
                        />
                      </span>
                    </button>
                  ))}

                {columns.filter((c) => c.label.toLowerCase().includes(columnSearch.toLowerCase())).length === 0 && (
                  <div className="col-span-full rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                    <p className="text-xs font-medium text-slate-500">No columns match &quot;{columnSearch}&quot;</p>
                    <button
                      type="button"
                      onClick={() => setColumnSearch('')}
                      className="mt-2 cursor-pointer text-xs font-semibold text-blue-600 hover:underline"
                    >
                      Clear Search
                    </button>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end border-t border-slate-100 bg-slate-50/70 px-6 py-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomizeModal(false);
                    setColumnSearch('');
                    triggerToast('Column preferences saved.');
                  }}
                  className="h-9 cursor-pointer rounded-lg bg-blue-500 px-5 text-xs font-semibold text-white shadow-sm shadow-blue-500/30 transition hover:bg-blue-600"
                >
                  Apply Columns
                </button>
              </div>
            </div>
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
                  <h3 className="font-semibold text-slate-900 text-sm">
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
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Workflow Pipeline: CSO → SR → Manager
              </span>
              <div className="flex items-center justify-between text-xs">
                <div className={cn(
                  'flex items-center gap-1 font-semibold',
                  authModalIndividual.currentWorkflowStage === 'CSO' ? 'text-blue-600' : 'text-slate-700'
                )}>
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">1</span>
                  <span>CSO Entry</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300" />
                <div className={cn(
                  'flex items-center gap-1 font-semibold',
                  authModalIndividual.currentWorkflowStage === 'SR' ? 'text-blue-600' : 'text-slate-700'
                )}>
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">2</span>
                  <span>SR Review</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300" />
                <div className={cn(
                  'flex items-center gap-1 font-semibold',
                  authModalIndividual.currentWorkflowStage === 'Manager' ? 'text-blue-600' : 'text-slate-700'
                )}>
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">3</span>
                  <span>Manager Final</span>
                </div>
              </div>
              <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200 flex items-center justify-between">
                <span>Current Stage: <strong className="font-semibold text-slate-800">{authModalIndividual.currentWorkflowStage}</strong></span>
                <span>Request Type: <strong className="font-semibold text-slate-800">{authModalIndividual.requestType}</strong></span>
              </div>
            </div>

            {/* Role & Officer Acting */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Authorizer Role</label>
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
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Officer Name</label>
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
              <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">Decision</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setAuthActionType('authorize')}
                  className={cn(
                    'py-2 px-3 rounded-lg font-semibold text-xs border transition flex items-center justify-center gap-1.5',
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
                    'py-2 px-3 rounded-lg font-semibold text-xs border transition flex items-center justify-center gap-1.5',
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
                    'py-2 px-3 rounded-lg font-semibold text-xs border transition flex items-center justify-center gap-1.5',
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
                <label className="block text-[11px] font-semibold text-rose-700 mb-1">
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
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
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
                  'px-4 py-2 text-xs font-semibold text-white rounded-lg transition shadow-xs',
                  authActionType === 'authorize' ? 'bg-emerald-600 hover:bg-emerald-700' : authActionType === 'resubmit' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-rose-600 hover:bg-rose-700'
                )}
              >
                {authActionType === 'authorize' ? 'Approve' : authActionType === 'resubmit' ? 'Resubmit' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Close Account Modal (For Active Accounts) */}
      {closeAccountIndividual && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 border border-slate-200 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-purple-600" />
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">Close Trading Account</h3>
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

            <div className="space-y-4 text-xs">
              <div>
                <label htmlFor="close-account-date" className="block text-[11px] font-semibold text-slate-600 mb-1">Close Date</label>
                <FormDatePicker id="close-account-date" value={closeDate} onChange={setCloseDate} />
              </div>

              <div className="space-y-2">
                <span className="block text-[11px] font-semibold text-slate-600">Delink Accounts</span>
                <label className="flex items-center gap-2 text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={closeDelinkCsx}
                    onChange={(e) => setCloseDelinkCsx(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-300 accent-purple-600"
                  />
                  ACC_Delink CSX
                </label>
                <label className="flex items-center gap-2 text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={closeDelinkBankAc}
                    onChange={(e) => setCloseDelinkBankAc(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-300 accent-purple-600"
                  />
                  ACC_Delink BankAC
                </label>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Reason *</label>
                <textarea
                  rows={2}
                  value={closeReason}
                  onChange={(e) => setCloseReason(e.target.value)}
                  placeholder="E.g., Customer relocated assets to corporate headquarters..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
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
                className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition shadow-xs"
              >
                Close Account
              </button>
            </div>
          </div>
        </div>
      )}

      {resendEmailIndividual && (
        <ResendEmailDialog
          customerName={resendEmailIndividual.fullNameEN || `${resendEmailIndividual.firstName} ${resendEmailIndividual.lastName}`}
          email={resendEmailIndividual.email}
          onCancel={() => setResendEmailId(null)}
          onConfirm={() => {
            triggerToast(`Email resent to ${resendEmailIndividual.email}.`);
            setResendEmailId(null);
          }}
        />
      )}

      {/* Customer Type: pick one or more types, then add a record for each with its dynamic form */}
      {customerTypeIndividual && (
        <CustomerTypePickerDialog
          individual={customerTypeIndividual}
          customers={individuals}
          existingIds={customerTypeRecordIds}
          onClose={() => setCustomerTypeIndividualId(null)}
          onSaveRecords={(records) => {
            records.forEach((record) => onSaveCustomerTypeRecord?.(record));
            setCustomerTypeIndividualId(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 border border-slate-200 shadow-2xl space-y-3">
            <div className="flex items-center gap-2.5 text-rose-600 font-semibold text-sm">
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
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
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

/** Header order matches the optional body cells */
const OPTIONAL_SORT_COLUMNS = [
  { id: 'gender', label: 'Gender' },
  { id: 'maritalStatus', label: 'Marital' },
  { id: 'nationality', label: 'Nationality' },
  { id: 'dob', label: 'Date of Birth' },
  { id: 'email', label: 'Email' },
  { id: 'mobile', label: 'Mobile' },
  { id: 'residency', label: 'Residency' },
  { id: 'idNumber', label: 'ID Number' },
  { id: 'taxpayerId', label: 'Taxpayer ID' },
  { id: 'riskCategory', label: 'Risk Rating' },
  { id: 'securitiesKnowledge', label: 'Knowledge' },
];

function sortValue(item: Individual, key: string): SortValue {
  switch (key) {
    case 'customerId': return item.customerId || item.id;
    case 'name': return item.fullNameEN || `${item.firstName} ${item.lastName}`;
    case 'gender': return item.gender;
    case 'maritalStatus': return item.maritalStatus;
    case 'nationality': return item.nationality;
    case 'dob': return item.dateOfBirth;
    case 'email': return item.email;
    case 'mobile': return item.mobile || item.phone;
    case 'residency': return item.residency;
    case 'idNumber': return item.idNumber;
    case 'taxpayerId': return item.taxpayerIdNumber;
    case 'riskCategory': return item.riskCategory;
    case 'securitiesKnowledge': return item.securitiesKnowledge;
    case 'profileStatus': return item.profileStatus;
    case 'accountStatus': return item.accountStatus || 'Not Opened';
    case 'request': return item.requestStatus;
    default: return null;
  }
}


type ReviewStage = 'CSO' | 'SR' | 'Manager';

/** Same reviewer the view dialog signs an approval with at each stage */
const STAGE_OFFICER: Record<ReviewStage, string> = {
  CSO: 'Sophea Keo (CSO)',
  SR: 'Dara Vong (SR)',
  Manager: 'Vannak Lim (Manager)',
};

function isApprovable(item: Individual) {
  return item.requestStatus === 'Pending' && ['CSO', 'SR', 'Manager'].includes(item.currentWorkflowStage);
}
