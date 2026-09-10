'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  Individual, 
  DesignTheme, 
  Customer360Profile,
  WorkflowStage
} from '@/types';
import { getCustomer360 } from '@/lib/data';
import { 
  X, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  Building, 
  Briefcase, 
  CreditCard, 
  FileText, 
  ExternalLink, 
  Edit3, 
  MapPin, 
  Mail, 
  Phone, 
  Calendar, 
  DollarSign, 
  Award,
  CheckCircle2,
  TrendingUp,
  UserCheck,
  Users,
  Lock,
  Download,
  AlertCircle,
  Check,
  RotateCcw,
  UserPlus
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ViewIndividualDialogProps {
  individual: Individual | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToUpdate: (individual: Individual) => void;
  onNavigateToCustomer360: (individual: Individual) => void;
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
  theme: DesignTheme;
}

type DialogTab = 'overview' | 'personal' | 'identification' | 'employment' | 'family' | 'account' | 'authorization';

export function ViewIndividualDialog({
  individual,
  isOpen,
  onClose,
  onNavigateToUpdate,
  onNavigateToCustomer360,
  onAuthorizeIndividual,
  onCloseAccountIndividual,
  theme,
}: ViewIndividualDialogProps) {
  const [activeTab, setActiveTab] = useState<DialogTab>('overview');

  // Dedicated Authorization Decision Dialog State
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authRole, setAuthRole] = useState<'CSO' | 'SR' | 'Manager'>('SR');
  const [authOfficer, setAuthOfficer] = useState('Dara Vong (SR)');
  const [authAction, setAuthAction] = useState<'authorize' | 'resubmit' | 'reject'>('authorize');
  const [authComment, setAuthComment] = useState('');
  const [authReason, setAuthReason] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  if (!isOpen || !individual) return null;

  const profile360: Customer360Profile = getCustomer360(individual);

  const renderRequestBadge = (item: Individual) => {
    const isClose = item.requestType === 'Close Account';
    const isApproved = item.requestStatus === 'Approved' || item.currentWorkflowStage === 'Approved';
    const isRejected = item.requestStatus === 'Rejected' || item.currentWorkflowStage === 'Rejected';
    const isResubmit = item.requestStatus === 'Resubmit' || item.currentWorkflowStage === 'Resubmit';
    const isPendingSR = item.currentWorkflowStage === 'SR' && item.requestStatus === 'Pending';
    const isPendingManager = item.currentWorkflowStage === 'Manager' && item.requestStatus === 'Pending';

    // Connector 1 (CSO -> SR)
    const connector1Color = 'bg-emerald-400';

    // SR status & visual state
    let srStatusText = 'Approved';
    let srStatusColor = 'text-emerald-600';
    let srState: 'approved' | 'pending' | 'resubmit' | 'rejected' = 'approved';

    if (isPendingSR) {
      srStatusText = 'Pending';
      srStatusColor = 'text-amber-600';
      srState = 'pending';
    } else if (isResubmit && item.currentWorkflowStage === 'Resubmit') {
      srStatusText = 'Resubmit';
      srStatusColor = 'text-amber-600';
      srState = 'resubmit';
    } else if (isRejected && item.currentWorkflowStage === 'SR') {
      srStatusText = 'Rejected';
      srStatusColor = 'text-rose-600';
      srState = 'rejected';
    }

    // Connector 2 (SR -> Manager)
    let connector2Color = 'bg-emerald-400';
    if (isPendingManager) {
      connector2Color = 'bg-amber-400';
    } else if (isPendingSR || srState === 'pending') {
      connector2Color = 'bg-slate-200';
    } else if (isRejected) {
      connector2Color = 'bg-rose-400';
    } else if (isResubmit) {
      connector2Color = 'bg-amber-400';
    }

    // Manager status & visual state
    let managerStatusText = 'Approved';
    let managerStatusColor = 'text-emerald-600';
    let managerState: 'approved' | 'pending' | 'resubmit' | 'rejected' | 'waiting' = 'approved';

    if (isApproved) {
      managerStatusText = 'Approved';
      managerStatusColor = 'text-emerald-600';
      managerState = 'approved';
    } else if (isPendingManager) {
      managerStatusText = 'Pending';
      managerStatusColor = 'text-amber-600';
      managerState = 'pending';
    } else if (isRejected) {
      managerStatusText = 'Rejected';
      managerStatusColor = 'text-rose-600';
      managerState = 'rejected';
    } else if (isResubmit) {
      managerStatusText = 'Resubmit';
      managerStatusColor = 'text-amber-600';
      managerState = 'resubmit';
    } else {
      managerStatusText = 'Waiting';
      managerStatusColor = 'text-slate-400';
      managerState = 'waiting';
    }

    return (
      <div className="inline-flex items-center gap-2.5 sm:gap-3 px-3 py-1.5 bg-white border border-slate-200/90 rounded-xl shadow-2xs select-none whitespace-nowrap">
        {/* Left Request Type Icon Box */}
        <div className="flex items-center gap-1.5 shrink-0">
          {isClose ? (
            <div 
              className="w-7 h-7 rounded-lg bg-rose-50/90 border border-rose-200/80 flex items-center justify-center text-rose-500 shrink-0"
              title="Close Account Request"
            >
              <Lock className="w-3.5 h-3.5" />
            </div>
          ) : (
            <div 
              className="w-7 h-7 rounded-lg bg-blue-50/90 border border-blue-200/80 flex items-center justify-center text-blue-600 shrink-0"
              title="Registration Request"
            >
              <UserPlus className="w-3.5 h-3.5" />
            </div>
          )}
          <span className="text-[11px] font-bold text-slate-800 hidden sm:inline">
            {item.requestType}
          </span>
        </div>

        {/* Stepper Pipeline: CSO -> SR -> Manager */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Step 1: CSO */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-4.5 h-4.5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-800 leading-tight">CSO</span>
              <span className="text-[9px] font-semibold text-emerald-600 leading-tight">Submitted</span>
            </div>
          </div>

          {/* Connector 1 */}
          <div className={cn("h-0.5 w-6 sm:w-10 rounded-full shrink-0", connector1Color)} />

          {/* Step 2: SR */}
          <div className="flex items-center gap-1.5 shrink-0">
            {srState === 'approved' && (
              <div className="w-4.5 h-4.5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
            )}
            {srState === 'pending' && (
              <div className="p-0.5 rounded-full bg-amber-100/80 shrink-0">
                <div className="w-4.5 h-4.5 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-2xs">
                  <Clock className="w-2.5 h-2.5 stroke-[2.5]" />
                </div>
              </div>
            )}
            {srState === 'resubmit' && (
              <div className="p-0.5 rounded-full bg-amber-100/80 shrink-0">
                <div className="w-4.5 h-4.5 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-2xs">
                  <AlertCircle className="w-2.5 h-2.5 stroke-[2.5]" />
                </div>
              </div>
            )}
            {srState === 'rejected' && (
              <div className="p-0.5 rounded-full bg-rose-100/80 shrink-0">
                <div className="w-4.5 h-4.5 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-2xs">
                  <AlertTriangle className="w-2.5 h-2.5 stroke-[2.5]" />
                </div>
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-800 leading-tight">SR</span>
              <span className={cn("text-[9px] font-semibold leading-tight", srStatusColor)}>{srStatusText}</span>
            </div>
          </div>

          {/* Connector 2 */}
          <div className={cn("h-0.5 w-6 sm:w-10 rounded-full shrink-0", connector2Color)} />

          {/* Step 3: Manager */}
          <div className="flex items-center gap-1.5 shrink-0">
            {managerState === 'approved' && (
              <div className="w-4.5 h-4.5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
            )}
            {managerState === 'pending' && (
              <div className="p-0.5 rounded-full bg-[#fef3c7] shrink-0">
                <div className="w-4.5 h-4.5 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-2xs">
                  <Clock className="w-2.5 h-2.5 stroke-[2.5]" />
                </div>
              </div>
            )}
            {managerState === 'resubmit' && (
              <div className="p-0.5 rounded-full bg-amber-100/80 shrink-0">
                <div className="w-4.5 h-4.5 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-2xs">
                  <AlertCircle className="w-2.5 h-2.5 stroke-[2.5]" />
                </div>
              </div>
            )}
            {managerState === 'rejected' && (
              <div className="p-0.5 rounded-full bg-rose-100/80 shrink-0">
                <div className="w-4.5 h-4.5 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-2xs">
                  <AlertTriangle className="w-2.5 h-2.5 stroke-[2.5]" />
                </div>
              </div>
            )}
            {managerState === 'waiting' && (
              <div className="w-4.5 h-4.5 rounded-full bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center shrink-0">
                <Clock className="w-2.5 h-2.5" />
              </div>
            )}
            <div className="flex flex-col">
              <span className={cn(
                "text-[10px] font-bold leading-tight",
                managerState === 'pending' ? 'text-[#78350f]' : managerState === 'waiting' ? 'text-slate-400' : 'text-slate-800'
              )}>
                Manager
              </span>
              <span className={cn("text-[9px] font-semibold leading-tight", managerStatusColor)}>{managerStatusText}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const modalContainerClasses = () => {
    switch (theme) {
      case 'glassmorphism':
        return 'bg-white/95 backdrop-blur-2xl border border-white/80 shadow-2xl shadow-blue-950/15 rounded-3xl';
      case 'aurora':
        return 'bg-white border-2 border-slate-100 shadow-2xl rounded-2xl overflow-hidden ring-1 ring-blue-500/10';
      case 'soft-fintech':
      default:
        return 'bg-white border border-slate-200 shadow-xl rounded-xl';
    }
  };

  const handleOpenAuthDialog = (action: 'authorize' | 'resubmit' | 'reject') => {
    setAuthAction(action);
    let defaultRole: 'CSO' | 'SR' | 'Manager' = 'SR';
    let defaultOfficer = 'Dara Vong (SR)';

    if (individual.currentWorkflowStage === 'CSO') {
      defaultRole = 'CSO';
      defaultOfficer = 'Sophea Keo (CSO)';
    } else if (individual.currentWorkflowStage === 'Manager') {
      defaultRole = 'Manager';
      defaultOfficer = 'Vannak Lim (Manager)';
    } else {
      defaultRole = 'SR';
      defaultOfficer = 'Dara Vong (SR)';
    }

    setAuthRole(defaultRole);
    setAuthOfficer(defaultOfficer);
    setAuthReason('');
    setAuthError(null);
    setAuthComment(
      action === 'authorize'
        ? `Authorized by ${defaultOfficer} (${defaultRole})`
        : ''
    );
    setShowAuthDialog(true);
  };

  const handleExecuteAuth = () => {
    if (!onAuthorizeIndividual) return;
    if (authAction !== 'authorize' && !authReason.trim()) {
      setAuthError(`Please provide a reason for ${authAction === 'reject' ? 'rejection' : 'resubmission'}.`);
      return;
    }

    onAuthorizeIndividual(
      individual.id,
      authAction,
      authRole,
      authOfficer,
      authComment || `Decision recorded by ${authOfficer} (${authRole})`,
      authReason
    );
    setShowAuthDialog(false);
    setAuthComment('');
    setAuthReason('');
    setAuthError(null);
  };

  return (
    <div
      id="view-individual-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="view-individual-modal-container"
        className={cn(
          'w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800 transition-all shadow-2xl',
          modalContainerClasses()
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3.5">
            <Image
              src={individual.avatarUrl}
              alt={individual.firstName}
              width={52}
              height={52}
              className="w-13 h-13 rounded-full object-cover border-2 border-white shadow-sm ring-1 ring-slate-200"
              referrerPolicy="no-referrer"
              unoptimized
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  {individual.fullNameEN || `${individual.firstName} ${individual.lastName}`}
                </h2>
                {individual.fullNameKH && (
                  <span className="text-xs text-blue-600 font-semibold px-2 py-0.5 rounded-md bg-blue-50 border border-blue-100">
                    {individual.fullNameKH}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 font-mono">
                <span className="font-bold text-slate-700">{individual.customerId || individual.id}</span>
                <span>•</span>
                <span>{individual.nationality}</span>
                <span>•</span>
                <span>{individual.residency || 'Resident'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Action: Edit Screen */}
            <button
              onClick={() => {
                onClose();
                onNavigateToUpdate(individual);
              }}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 transition shadow-xs"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-600" />
              <span>Edit</span>
            </button>

            {/* Action: Customer 360 */}
            <button
              onClick={() => {
                onClose();
                onNavigateToCustomer360(individual);
              }}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5 transition shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Customer 360</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Workflow & Status Strip */}
        <div className="px-5 py-2.5 bg-slate-100/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-[10px] font-bold uppercase">Profile Status:</span>
              <span className={cn(
                'px-2 py-0.5 rounded-full font-bold text-[11px] border',
                individual.profileStatus === 'Completed'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              )}>
                {individual.profileStatus || 'Incomplete'}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-[10px] font-bold uppercase">Account Status:</span>
              <span className={cn(
                'px-2 py-0.5 rounded-full font-bold text-[11px] border',
                individual.accountStatus === 'Active'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              )}>
                {individual.accountStatus || 'Not Opened'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto max-w-full">
            <span className="text-slate-400 text-[10px] font-bold uppercase shrink-0">Request:</span>
            {renderRequestBadge(individual)}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 border-b border-slate-200 flex items-center gap-2 overflow-x-auto bg-white shrink-0 text-xs font-semibold">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'personal', label: 'Personal Information' },
            { id: 'identification', label: 'Identification & Docs' },
            { id: 'employment', label: 'Employment & Banking' },
            { id: 'family', label: 'Family & Related' },
            { id: 'account', label: 'Account Info' },
            { id: 'authorization', label: `Workflow History (${individual.authorizationHistory?.length || 0})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as DialogTab)}
              className={cn(
                'py-3 px-3 border-b-2 font-bold transition whitespace-nowrap',
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dialog Tab Body (Scrollable) */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5 text-xs">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* If Close Account, show banner */}
              {individual.requestType === 'Close Account' && (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl space-y-1">
                  <div className="flex items-center gap-2 text-purple-900 font-bold">
                    <Lock className="w-4 h-4 text-purple-700" />
                    <span>Account Closure Pending Authorization</span>
                  </div>
                  <p className="text-purple-800 text-[11px]">
                    Close Date: <strong>{individual.closeAccountInfo?.closeDate || 'N/A'}</strong> • Target Account: <strong>{individual.closeAccountInfo?.account || 'Primary'}</strong>
                  </p>
                  <p className="text-purple-700 text-[11px]">
                    Closure Reason: {individual.closeAccountInfo?.reason || 'Customer request'}
                  </p>
                </div>
              )}

              {/* Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Trading Account</span>
                  <div className="text-sm font-bold text-slate-900 font-mono mt-1">
                    {individual.tradingAccountInfo?.tradingAccountNumber || 'TRD-PENDING'}
                  </div>
                  <span className="text-[10px] text-slate-400">Opened {individual.tradingAccountInfo?.accountDate || 'N/A'}</span>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Investor ID</span>
                  <div className="text-sm font-bold text-blue-600 font-mono mt-1">
                    {individual.investorIdInfo?.investorIdNumber || 'INV-PENDING'}
                  </div>
                  <span className="text-[10px] text-slate-400">SECC Firm: {individual.investorIdInfo?.securitiesFirm}</span>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Risk Category</span>
                  <div className="text-sm font-bold text-amber-700 mt-1 capitalize">
                    {individual.riskRating || individual.riskCategory || 'Moderate'}
                  </div>
                  <span className="text-[10px] text-slate-400">{individual.investmentExperience || '3-5 yrs experience'}</span>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Total Liquid Capital</span>
                  <div className="text-sm font-bold text-emerald-700 font-mono mt-1">
                    ${individual.totalDeposits.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-slate-400">FICO {individual.creditScore} Tier</span>
                </div>
              </div>

              {/* Summary Overview Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-blue-600" />
                    <span>Primary Demographics & Identity</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
                    <div>
                      <span className="text-slate-400 block">Khmer Name:</span>
                      <strong className="text-slate-800">{individual.fullNameKH || 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Date of Birth:</span>
                      <strong className="text-slate-800">{individual.dateOfBirth}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Gender / Marital:</span>
                      <strong className="text-slate-800">{individual.gender} • {individual.maritalStatus}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">ID ({individual.idType}):</span>
                      <strong className="text-slate-800 font-mono">{individual.idNumber}</strong>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                    <span>Employment & Organization</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
                    <div>
                      <span className="text-slate-400 block">Occupation:</span>
                      <strong className="text-slate-800">{individual.employment?.occupation || individual.occupation}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Position / Title:</span>
                      <strong className="text-slate-800">{individual.employment?.position || 'Lead Officer'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Employer:</span>
                      <strong className="text-slate-800">{individual.employment?.organizationName || individual.employer}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Settlement Bank:</span>
                      <strong className="text-slate-800">{individual.banking?.bankName}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PERSONAL INFORMATION */}
          {activeTab === 'personal' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Legal Names & Demographics
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Surname (EN)</span>
                    <strong className="text-slate-900">{individual.surnameEN || individual.lastName}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Given Name (EN)</span>
                    <strong className="text-slate-900">{individual.givenNameEN || individual.firstName}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Surname (KH)</span>
                    <strong className="text-slate-900">{individual.surnameKH || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Given Name (KH)</span>
                    <strong className="text-slate-900">{individual.givenNameKH || 'N/A'}</strong>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Date of Birth</span>
                    <strong className="text-slate-900 font-mono">{individual.dateOfBirth}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Gender</span>
                    <strong className="text-slate-900">{individual.gender}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Marital Status</span>
                    <strong className="text-slate-900">{individual.maritalStatus}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Nationality</span>
                    <strong className="text-slate-900">{individual.nationality}</strong>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Securities Appropriateness & Category
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Customer Type</span>
                    <strong className="text-slate-900">{individual.customerType || 'Retail'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Education Background</span>
                    <strong className="text-slate-900">{individual.educationBackground || "Bachelor's"}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Securities Knowledge</span>
                    <strong className="text-slate-900">{individual.securitiesKnowledge || 'Intermediate'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Risk Category</span>
                    <strong className="text-slate-900 capitalize">{individual.riskRating || individual.riskCategory || 'Moderate'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Investment Experience</span>
                    <strong className="text-slate-900">{individual.investmentExperience || '3-5 years'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Designated Branch</span>
                    <strong className="text-slate-900">{individual.branch}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: IDENTIFICATION & DOCUMENTS */}
          {activeTab === 'identification' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Identification Records
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Residency</span>
                    <strong className="text-slate-900">{individual.residency || 'Resident'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">ID Document Type</span>
                    <strong className="text-slate-900">{individual.idType}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">ID Number</span>
                    <strong className="text-slate-900 font-mono">{individual.idNumber}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Issued By</span>
                    <strong className="text-slate-900">{individual.issuedBy || 'General Dept of Identification'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Issued Date</span>
                    <strong className="text-slate-900 font-mono">{individual.issuedDate || '2022-01-10'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Expired Date</span>
                    <strong className="text-slate-900 font-mono">{individual.expiredDate || individual.idExpiryDate}</strong>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[10px] text-slate-400 block font-bold">Taxpayer Identification Number (TIN)</span>
                    <strong className="text-slate-900 font-mono">{individual.taxpayerIdNumber || 'N/A'}</strong>
                  </div>
                </div>
              </div>

              {/* Supporting Documents */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Supporting Documents ({individual.supportingDocuments?.length || 0})
                </span>
                {individual.supportingDocuments && individual.supportingDocuments.length > 0 ? (
                  <div className="space-y-2">
                    {individual.supportingDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{doc.fileName}</span>
                              <span className="text-[10px] font-semibold px-2 py-0.2 rounded bg-blue-50 text-blue-700">
                                {doc.type}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">{doc.fileSize}</span>
                            </div>
                            {doc.remark && <p className="text-[11px] text-slate-500 mt-0.5">{doc.remark}</p>}
                          </div>
                        </div>

                        <button
                          onClick={() => alert(`Downloading verified document: ${doc.fileName}`)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition"
                        >
                          <Download className="w-3 h-3" />
                          <span>Download</span>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No supporting documents attached.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: EMPLOYMENT & BANKING */}
          {activeTab === 'employment' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Employment Details
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Occupation</span>
                    <strong className="text-slate-900">{individual.employment?.occupation || individual.occupation}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Position / Title</span>
                    <strong className="text-slate-900">{individual.employment?.position || 'Executive'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Level of Position</span>
                    <strong className="text-slate-900">{individual.employment?.levelOfPosition || 'Senior'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Organization / Employer</span>
                    <strong className="text-slate-900">{individual.employment?.organizationName || individual.employer}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Type of Business</span>
                    <strong className="text-slate-900">{individual.employment?.typeOfBusiness || 'Services'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Length of Work</span>
                    <strong className="text-slate-900">{individual.employment?.lengthOfWork || '3+ years'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Office Telephone</span>
                    <strong className="text-slate-900">{individual.employment?.officeTelephone || 'N/A'}</strong>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[10px] text-slate-400 block font-bold">Organization Address</span>
                    <strong className="text-slate-900">{individual.employment?.organizationAddress || 'Phnom Penh'}</strong>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Designated Settlement Bank Account
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Bank Name</span>
                    <strong className="text-slate-900">{individual.banking?.bankName}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Account Owner</span>
                    <strong className="text-slate-900 uppercase">{individual.banking?.accountOwner}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Saving Account Type</span>
                    <strong className="text-slate-900">{individual.banking?.savingAccount}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Bank Account Number</span>
                    <strong className="text-slate-900 font-mono">{individual.banking?.accountNumber}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: FAMILY & RELATED PERSONS */}
          {activeTab === 'family' && (
            <div className="space-y-4">
              {/* Spouse */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Spouse Information
                </span>
                {individual.spouse ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">Full Name</span>
                      <strong className="text-slate-900">{individual.spouse.fullName}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">Latin Name</span>
                      <strong className="text-slate-900">{individual.spouse.latin}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">Email</span>
                      <strong className="text-slate-900">{individual.spouse.email}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">Occupation & Position</span>
                      <strong className="text-slate-900">{individual.spouse.occupation} • {individual.spouse.position}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">Business Sector</span>
                      <strong className="text-slate-900">{individual.spouse.typeOfBusiness}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">Mobile Phone</span>
                      <strong className="text-slate-900">{individual.spouse.mobile}</strong>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No spouse record on file.</p>
                )}
              </div>

              {/* Related Person */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Related Person / Emergency Contact
                </span>
                {individual.relatedPerson ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">Full Name</span>
                      <strong className="text-slate-900">{individual.relatedPerson.fullName}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">Relationship</span>
                      <strong className="text-slate-900">{individual.relatedPerson.relationship}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">Mobile Contact</span>
                      <strong className="text-slate-900">{individual.relatedPerson.mobile}</strong>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No related person record on file.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: ACCOUNT INFORMATION */}
          {activeTab === 'account' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Investor ID Information (Regulator SECC)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Investor ID Number</span>
                    <strong className="text-slate-900 font-mono">{individual.investorIdInfo?.investorIdNumber || 'Pending'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Securities Firm</span>
                    <strong className="text-slate-900">{individual.investorIdInfo?.securitiesFirm}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Customer Received By (CSO)</span>
                    <strong className="text-slate-900">{individual.investorIdInfo?.customerReceivedBy}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Application Date</span>
                    <strong className="text-slate-900 font-mono">{individual.investorIdInfo?.applicationDate}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Date Sent to SECC</span>
                    <strong className="text-slate-900 font-mono">{individual.investorIdInfo?.dateSentToSECC}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Date Received from SECC</span>
                    <strong className="text-slate-900 font-mono">{individual.investorIdInfo?.dateReceivedFromSECC}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Customer Status</span>
                    <strong className="text-slate-900">{individual.investorIdInfo?.customerStatus}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Investor ID Expired Date</span>
                    <strong className="text-slate-900 font-mono">{individual.investorIdInfo?.investorIdExpiredDate}</strong>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Trading Account Details
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Trading Account Number</span>
                    <strong className="text-slate-900 font-mono">{individual.tradingAccountInfo?.tradingAccountNumber}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Account Opening Date</span>
                    <strong className="text-slate-900 font-mono">{individual.tradingAccountInfo?.accountDate}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Account Checked By (SR)</span>
                    <strong className="text-slate-900">{individual.tradingAccountInfo?.accountCheckedBy}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Account Approved By (Manager)</span>
                    <strong className="text-slate-900">{individual.tradingAccountInfo?.accountApprovedBy}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Current Assigned SR</span>
                    <strong className="text-slate-900">{individual.tradingAccountInfo?.currentAssignedSR}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Phone Linked</span>
                    <strong className="text-slate-900">{individual.tradingAccountInfo?.phoneNumber}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: WORKFLOW & AUTHORIZATION HISTORY */}
          {activeTab === 'authorization' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-blue-900 block">
                    Workflow Pipeline: CSO → SR → Manager
                  </span>
                  <p className="text-blue-700 text-[11px] mt-0.5">
                    Current Workflow Stage: <strong>{individual.currentWorkflowStage}</strong> • Overall Status: <strong>{individual.requestStatus}</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenAuthDialog('authorize')}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs flex items-center gap-1 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Execute Next Step</span>
                </button>
              </div>

              {/* Timeline list */}
              <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
                {individual.authorizationHistory && individual.authorizationHistory.length > 0 ? (
                  individual.authorizationHistory.map((item, idx) => (
                    <div key={item.id || idx} className="relative flex items-start gap-3 pl-8">
                      <div className={cn(
                        'absolute left-2 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-xs',
                        item.status === 'Approved' ? 'bg-emerald-500' : item.status === 'Resubmit' ? 'bg-amber-500' : item.status === 'Rejected' ? 'bg-rose-500' : 'bg-blue-500'
                      )} />
                      <div className="flex-1 p-3.5 bg-white border border-slate-200 rounded-xl space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-xs">{item.stage}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{item.dateTime}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <span>Officer: <strong className="text-slate-700">{item.processedBy}</strong></span>
                          <span>•</span>
                          <span>Role: <strong className="text-slate-700">{item.role}</strong></span>
                          <span>•</span>
                          <span className={cn(
                            'font-bold px-1.5 py-0.2 rounded text-[10px]',
                            item.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' : item.status === 'Resubmit' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-700'
                          )}>
                            {item.status}
                          </span>
                        </div>
                        {item.comment && (
                          <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg mt-1 border border-slate-100">
                            {item.comment}
                          </p>
                        )}
                        {item.reason && (
                          <p className="text-[11px] text-rose-700 bg-rose-50 p-2 rounded-lg mt-1 border border-rose-200 font-medium">
                            Discrepancy / Reason: {item.reason}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic pl-8">No authorization events logged.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer with Authorization Buttons */}
        <div className="p-3.5 sm:p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
          {/* Authorization Buttons Group (Reject, Resubmit, Approve) */}
          <div className="flex items-center gap-2.5 justify-end flex-wrap">
            {/* Reject Button */}
            <button
              id="btn-view-dialog-reject"
              type="button"
              onClick={() => handleOpenAuthDialog('reject')}
              className="px-3.5 py-1.5 text-xs font-bold rounded-lg border border-rose-300 hover:border-rose-400 bg-white hover:bg-rose-50 text-rose-600 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Reject application"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>Reject</span>
            </button>

            {/* Resubmit Button */}
            <button
              id="btn-view-dialog-resubmit"
              type="button"
              onClick={() => handleOpenAuthDialog('resubmit')}
              className="px-3.5 py-1.5 text-xs font-bold rounded-lg border border-amber-300 hover:border-amber-400 bg-white hover:bg-amber-50 text-amber-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Request resubmission"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
              <span>Resubmit</span>
            </button>

            {/* Approve Button */}
            <button
              id="btn-view-dialog-approve"
              type="button"
              onClick={() => handleOpenAuthDialog('authorize')}
              className="px-4 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              title="Approve & advance workflow"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Approve</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dedicated Authorization Decision Dialog Modal */}
      {showAuthDialog && (
        <div
          id="auth-decision-dialog-backdrop"
          className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setShowAuthDialog(false)}
        >
          <div
            id="auth-decision-dialog-card"
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={cn(
              "px-5 py-4 border-b flex items-center justify-between",
              authAction === 'authorize' ? "bg-emerald-50/80 border-emerald-100" :
              authAction === 'resubmit' ? "bg-amber-50/80 border-amber-100" :
              "bg-rose-50/80 border-rose-100"
            )}>
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shadow-2xs shrink-0",
                  authAction === 'authorize' ? "bg-emerald-100 text-emerald-700 border border-emerald-200" :
                  authAction === 'resubmit' ? "bg-amber-100 text-amber-800 border border-amber-200" :
                  "bg-rose-100 text-rose-700 border border-rose-200"
                )}>
                  {authAction === 'authorize' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                  {authAction === 'resubmit' && <RotateCcw className="w-5 h-5 text-amber-600" />}
                  {authAction === 'reject' && <AlertTriangle className="w-5 h-5 text-rose-600" />}
                </div>
                <div>
                  <h3 className={cn(
                    "text-base font-bold leading-tight",
                    authAction === 'authorize' ? "text-emerald-950" :
                    authAction === 'resubmit' ? "text-amber-950" :
                    "text-rose-950"
                  )}>
                    {authAction === 'authorize' ? 'Approve Application' :
                     authAction === 'resubmit' ? 'Request Resubmission' :
                     'Reject Application'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {authAction === 'authorize' ? 'Advance workflow to the next approval stage' :
                     authAction === 'resubmit' ? 'Return application to prior stage for amendment' :
                     'Decline and terminate this onboarding request'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAuthDialog(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                title="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Dialog Body */}
            <div className="p-5 sm:p-6 space-y-4 text-xs text-slate-700">
              {/* Applicant Context Card */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Applicant</span>
                  <span className="font-bold text-slate-900 text-sm">{individual.fullNameEN || `${individual.firstName} ${individual.lastName}`}</span>
                  <span className="text-slate-500 text-xs ml-2 font-mono">({individual.customerId || individual.id})</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Current Stage</span>
                  <span className="font-bold text-blue-700 text-xs px-2.5 py-0.5 bg-blue-50 border border-blue-200 rounded-md inline-block">
                    {individual.currentWorkflowStage}
                  </span>
                </div>
              </div>

              {/* Workflow Transition Preview if Authorizing */}
              {authAction === 'authorize' && (
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Workflow Transition:</span>
                    <span className="text-emerald-800">
                      Approving will advance the request from <strong>{individual.currentWorkflowStage}</strong> to{' '}
                      <strong>{individual.currentWorkflowStage === 'CSO' ? 'SR (Review)' : individual.currentWorkflowStage === 'SR' ? 'Manager (Approval)' : 'Approved (Completed)'}</strong>.
                    </span>
                  </div>
                </div>
              )}

              {/* Authorizer Role & Officer Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Authorizer Role</label>
                  <select
                    value={authRole}
                    onChange={(e) => {
                      const r = e.target.value as 'CSO' | 'SR' | 'Manager';
                      setAuthRole(r);
                      if (r === 'CSO') setAuthOfficer('Sophea Keo (CSO)');
                      if (r === 'SR') setAuthOfficer('Dara Vong (SR)');
                      if (r === 'Manager') setAuthOfficer('Vannak Lim (Manager)');
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden"
                  >
                    <option value="CSO">CSO (Customer Service Officer)</option>
                    <option value="SR">SR (Securities Representative)</option>
                    <option value="Manager">Manager (Branch / Compliance Head)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Acting Officer</label>
                  <input
                    type="text"
                    value={authOfficer}
                    onChange={(e) => setAuthOfficer(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden"
                  />
                </div>
              </div>

              {/* Reason field (Required for Reject & Resubmit) */}
              {authAction !== 'authorize' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Reason for {authAction === 'reject' ? 'Rejection' : 'Resubmission'} <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    value={authReason}
                    onChange={(e) => {
                      setAuthReason(e.target.value);
                      if (authError) setAuthError(null);
                    }}
                    placeholder={authAction === 'reject' ? 'e.g. Sanctions compliance match or invalid legal identity' : 'e.g. Please re-upload legible government ID or valid utility bill'}
                    className={cn(
                      "w-full px-3 py-2 bg-white border rounded-lg text-slate-800 text-xs outline-hidden",
                      authError ? "border-rose-400 ring-2 ring-rose-200" : "border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    )}
                  />
                  {authError && (
                    <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {authError}
                    </p>
                  )}
                </div>
              )}

              {/* Comments / Audit Trail Note */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Audit Comment / Internal Note <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={authComment}
                  onChange={(e) => setAuthComment(e.target.value)}
                  placeholder="Add optional notes for compliance audit logs..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden resize-none"
                />
              </div>
            </div>

            {/* Dialog Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowAuthDialog(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                id="btn-confirm-auth-dialog"
                onClick={handleExecuteAuth}
                className={cn(
                  "px-4.5 py-2 text-white font-bold rounded-xl text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer",
                  authAction === 'authorize' ? "bg-emerald-600 hover:bg-emerald-700" :
                  authAction === 'resubmit' ? "bg-amber-600 hover:bg-amber-700" :
                  "bg-rose-600 hover:bg-rose-700"
                )}
              >
                {authAction === 'authorize' && <CheckCircle2 className="w-3.5 h-3.5" />}
                {authAction === 'resubmit' && <RotateCcw className="w-3.5 h-3.5" />}
                {authAction === 'reject' && <AlertTriangle className="w-3.5 h-3.5" />}
                <span>Confirm {authAction === 'authorize' ? 'Approval' : authAction === 'resubmit' ? 'Resubmission' : 'Rejection'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
