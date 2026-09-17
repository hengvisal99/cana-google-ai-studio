'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  Individual, 
  DesignTheme, 
  AuthorizationTimelineItem,
  SupportingDocument
} from '@/types';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Briefcase,
  CheckCircle2,
  LayoutDashboard,
  Users,
  Lock,
  RotateCcw,
  IdCard,
  Landmark,
  Send,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { IndividualOverviewSection } from '@/components/individual/IndividualOverviewSection';
import { DossierCard, Field } from '@/components/shared/DossierCard';
import { SupportingDocumentsSection } from '@/components/shared/SupportingDocumentsSection';
import { ApproveDialogAuroraGlass } from '@/components/shared/ApproveDialogVariants';
import { DecisionDialogMatchedMark } from '@/components/shared/DecisionDialogVariants';

/** One node in a workflow timeline (registration or account close). */
function WorkflowTimelineRow({
  item,
  isLast,
}: {
  item: AuthorizationTimelineItem;
  isLast: boolean;
}) {
  const isDone = item.status === 'Submitted' || item.status === 'Approved';
  const isRejected = item.status === 'Rejected';
  const isPending = item.status === 'Pending' || item.status === 'Resubmit';
  // Queued stages carry a placeholder instead of a real date — don't echo the status twice.
  const hasTimestamp = Boolean(
    item.dateTime && item.dateTime.trim().toLowerCase() !== item.status.toLowerCase()
  );

  return (
    <li className="relative flex items-start gap-3.5 pb-5 last:pb-0">
      {/* Vertical connector — the track runs the whole way; colour marks progress */}
      {!isLast && (
        <div
          className={cn(
            'absolute left-4 top-9 bottom-0 w-0.5',
            isDone ? 'bg-emerald-500' : isRejected ? 'bg-rose-300' : 'bg-slate-200'
          )}
          aria-hidden="true"
        />
      )}

      {/* Stage node */}
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center shrink-0 border z-10',
          isDone
            ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
            : isRejected
            ? 'bg-rose-50 border-rose-200 text-rose-600'
            : isPending
            ? 'bg-amber-50 border-amber-200 text-amber-600'
            : 'bg-slate-50 border-slate-200 text-slate-400'
        )}
      >
        {isDone ? (
          <Send className="w-4 h-4" />
        ) : isRejected ? (
          <X className="w-4 h-4 stroke-[2.5]" />
        ) : (
          <Clock className="w-4 h-4" />
        )}
      </div>

      {/* Stage detail */}
      <div className="min-w-0 flex-1 pt-1 space-y-1">
        <h5 className="text-sm font-medium text-slate-900">
          {item.processedBy} <span className="font-normal text-slate-500">· {item.role}</span>
        </h5>

        {hasTimestamp && <div className="text-xs text-slate-400">{item.dateTime}</div>}

        {/* Every stage gets the same badge treatment so the column reads consistently */}
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide',
            isDone
              ? 'bg-emerald-50 text-emerald-700'
              : isRejected
              ? 'bg-rose-50 text-rose-700'
              : isPending
              ? 'bg-amber-50 text-amber-700'
              : 'bg-slate-100 text-slate-500'
          )}
        >
          <span
            className={cn(
              'w-1.5 h-1.5 rounded-full',
              isDone
                ? 'bg-emerald-600'
                : isRejected
                ? 'bg-rose-600'
                : isPending
                ? 'bg-amber-500'
                : 'bg-slate-400'
            )}
          />
          {item.status}
        </span>

        {item.reason && (
          <p className="text-sm text-slate-600 pt-0.5">
            <span className="font-medium text-slate-700">Reason:</span> {item.reason}
          </p>
        )}
      </div>
    </li>
  );
}

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

type DialogTab = 'overview' | 'identification' | 'employment' | 'family' | 'account' | 'authorization';

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

  if (!isOpen || !individual) return null;

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
    setAuthComment(
      action === 'authorize'
        ? `Authorized by ${defaultOfficer} (${defaultRole})`
        : ''
    );
    setShowAuthDialog(true);
  };

  // The reject / resubmit dialog owns its field, so it hands the reason back here.
  const handleExecuteAuth = (reason = '') => {
    if (!onAuthorizeIndividual) return;

    onAuthorizeIndividual(
      individual.id,
      authAction,
      authRole,
      authOfficer,
      authAction === 'authorize' ? (authComment || `Approved by ${authOfficer} (${authRole})`) : reason,
      reason
    );
    setShowAuthDialog(false);
    setAuthComment('');
  };

  // Where an approval sends the application next.
  const nextWorkflowStage =
    individual.currentWorkflowStage === 'CSO'
      ? 'Senior Review'
      : individual.currentWorkflowStage === 'SR'
      ? 'Manager Review'
      : 'Final Approval';

  // Supporting documents: open in a new tab when a file URL exists, otherwise stub out.
  const handleViewDocument = (doc: SupportingDocument) => {
    if (doc.fileUrl) {
      window.open(doc.fileUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    alert(`Preview is not available for ${doc.fileName}.`);
  };

  const handleDownloadDocument = (doc: SupportingDocument) => {
    if (doc.fileUrl) {
      const link = document.createElement('a');
      link.href = doc.fileUrl;
      link.download = doc.fileName;
      link.click();
      return;
    }
    alert(`Downloading verified document: ${doc.fileName}`);
  };

  // Categorize workflow authorization history into Registration vs Account Close
  const isCloseItem = (item: { requestType?: string; stage?: string; comment?: string }) => {
    if (item.requestType === 'Close Account') return true;
    if (item.requestType === 'Registration') return false;
    const stageLower = (item.stage || '').toLowerCase();
    const commentLower = (item.comment || '').toLowerCase();
    return (
      stageLower.includes('close') ||
      stageLower.includes('closure') ||
      commentLower.includes('close account') ||
      commentLower.includes('closure')
    );
  };

  const registrationHistory = (individual.authorizationHistory || []).filter((item) => !isCloseItem(item));
  const accountCloseHistory = (individual.authorizationHistory || []).filter((item) => isCloseItem(item));
  const hasCloseRequest = Boolean(
    individual.closeAccountInfo ||
    individual.requestType === 'Close Account' ||
    individual.accountStatus === 'Closed' ||
    accountCloseHistory.length > 0
  );

  return (
    <div
      id="view-individual-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="view-individual-modal-container"
        className={cn(
          'w-full max-w-6xl xl:max-w-[1240px] max-h-[92vh] flex flex-col overflow-hidden text-slate-800 transition-all shadow-2xl',
          modalContainerClasses()
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-6 py-5 flex items-start justify-between gap-4 bg-white shrink-0">
          <div className="flex items-center gap-4 min-w-0">
            <Image
              src={individual.avatarUrl}
              alt={individual.firstName}
              width={56}
              height={56}
              className="w-14 h-14 rounded-full object-cover shrink-0"
              referrerPolicy="no-referrer"
              unoptimized
            />
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-slate-900 tracking-tight truncate">
                {individual.fullNameEN || `${individual.firstName} ${individual.lastName}`}
              </h2>
              <div className="flex items-center gap-2.5 mt-1 flex-wrap">
                {individual.fullNameKH && (
                  <span className="text-sm text-slate-500 font-khmer">{individual.fullNameKH}</span>
                )}
                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-xs font-semibold font-mono">
                  {individual.customerId || individual.id}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {/* Request status */}
            <span className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold uppercase tracking-wide',
              individual.requestStatus === 'Approved'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : individual.requestStatus === 'Rejected'
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            )}>
              <Clock className="w-3 h-3" />
              {individual.requestStatus || 'Pending'}
            </span>

            {/* Account status */}
            <span className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold uppercase tracking-wide',
              individual.accountStatus === 'Active'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-50 text-slate-600 border-slate-200'
            )}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {individual.accountStatus || 'Not Opened'}
            </span>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition ml-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-slate-200 flex items-center gap-4 lg:gap-5 xl:gap-6 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden bg-white shrink-0 text-sm">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'identification', label: 'Identification', icon: IdCard },
            { id: 'employment', label: 'Employment & Banking', icon: Briefcase },
            { id: 'family', label: 'Family & Related Persons', icon: Users },
            { id: 'account', label: 'Account Information', icon: Landmark },
            { id: 'authorization', label: 'Workflow History', icon: ShieldCheck },
          ].map((tab) => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as DialogTab)}
                className={cn(
                  'py-3 border-b-2 font-medium transition whitespace-nowrap flex items-center gap-2 cursor-pointer',
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                )}
              >
                <TabIcon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Dialog Tab Body (Scrollable) */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs bg-slate-50/70">
          {/* If Close Account, show banner across all tabs */}
          {individual.requestType === 'Close Account' && (
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl space-y-1">
              <div className="flex items-center gap-2 text-purple-900 font-semibold">
                <Lock className="w-4 h-4 text-purple-700" />
                <span>Account Closure Pending Authorization</span>
              </div>
              <p className="text-purple-800 text-[11px]">
                Close Date: <strong className="font-semibold">{individual.closeAccountInfo?.closeDate || 'N/A'}</strong> • Target Account: <strong className="font-semibold">{individual.closeAccountInfo?.account || 'Primary'}</strong>
              </p>
              <p className="text-purple-700 text-[11px]">
                Closure Reason: {individual.closeAccountInfo?.reason || 'Customer request'}
              </p>
            </div>
          )}

          {/* TAB 1: OVERVIEW — status and contact first, full record below */}
          {activeTab === 'overview' && (
            <IndividualOverviewSection 
              individual={individual} 
              theme={theme} 
            />
          )}

          {/* TAB 3: IDENTIFICATION & DOCUMENTS */}
          {activeTab === 'identification' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
              <DossierCard title="Identification Records">
                <Field label="Residency" value={individual.residency} />
                <Field label="ID Document Type" value={individual.idType} />

                <Field label="ID Number" value={individual.idNumber} valueClassName="font-mono" />
                <Field label="Issued By" value={individual.issuedBy} />

                <Field label="Issued Date" value={individual.issuedDate} valueClassName="font-mono" />
                <Field
                  label="Expired Date"
                  value={individual.expiredDate || individual.idExpiryDate}
                  valueClassName="font-mono"
                />

                <Field
                  label="Taxpayer Identification Number (TIN)"
                  value={individual.taxpayerIdNumber}
                  valueClassName="font-mono"
                  className="sm:col-span-2"
                />
              </DossierCard>

              <SupportingDocumentsSection
                documents={individual.supportingDocuments}
                onView={handleViewDocument}
                onDownload={handleDownloadDocument}
              />
            </div>
          )}

          {/* TAB 4: EMPLOYMENT & BANKING */}
          {activeTab === 'employment' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
              <DossierCard title="Employment Details">
                <Field
                  label="Occupation"
                  value={individual.employment?.occupation || individual.occupation}
                />
                <Field label="Position / Title" value={individual.employment?.position} />

                <Field label="Level of Position" value={individual.employment?.levelOfPosition} />
                <Field
                  label="Organization / Employer"
                  value={individual.employment?.organizationName || individual.employer}
                />

                <Field label="Type of Business" value={individual.employment?.typeOfBusiness} />
                <Field label="Length of Work" value={individual.employment?.lengthOfWork} />

                <Field label="Office Telephone" value={individual.employment?.officeTelephone} />
                <Field label="Branch" value={individual.branch} />

                <Field
                  label="Organization Address"
                  value={individual.employment?.organizationAddress}
                  valueClassName="line-clamp-3"
                />
              </DossierCard>

              <DossierCard title="Designated Settlement Bank Account">
                <Field label="Bank Name" value={individual.banking?.bankName} />
                <Field
                  label="Account Owner"
                  value={individual.banking?.accountOwner}
                  valueClassName="uppercase"
                />

                <Field label="Saving Account Type" value={individual.banking?.savingAccount} />
                <Field
                  label="Bank Account Number"
                  value={individual.banking?.accountNumber}
                  valueClassName="font-mono"
                />
              </DossierCard>
            </div>
          )}

          {/* TAB 5: FAMILY & RELATED PERSONS */}
          {activeTab === 'family' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
              {individual.spouse ? (
                <DossierCard title="Spouse Information">
                  <Field label="Full Name" value={individual.spouse.fullName} />
                  <Field label="Latin Name" value={individual.spouse.latin} />

                  <Field label="Relationship" value={individual.spouse.relationship} />
                  <Field label="Email" value={individual.spouse.email} />

                  <Field label="Occupation" value={individual.spouse.occupation} />
                  <Field label="Position" value={individual.spouse.position} />

                  <Field label="Business Sector" value={individual.spouse.typeOfBusiness} />
                  <Field label="Year of Employment" value={individual.spouse.yearOfEmployment} />

                  <Field label="Mobile Phone" value={individual.spouse.mobile} />
                  <Field label="Office Telephone" value={individual.spouse.officeTelephone} />

                  <Field
                    label="Address"
                    value={individual.spouse.address}
                    valueClassName="line-clamp-3"
                  />
                </DossierCard>
              ) : (
                <DossierCard title="Spouse Information" plain>
                  <p className="text-sm text-slate-500">No spouse record on file.</p>
                </DossierCard>
              )}

              {individual.relatedPerson ? (
                <DossierCard title="Related Person / Emergency Contact">
                  <Field label="Full Name" value={individual.relatedPerson.fullName} />
                  <Field label="Latin Name" value={individual.relatedPerson.latin} />

                  <Field label="Relationship" value={individual.relatedPerson.relationship} />
                  <Field label="Gender" value={individual.relatedPerson.gender} />

                  <Field label="Mobile Contact" value={individual.relatedPerson.mobile} />
                  <Field label="Email" value={individual.relatedPerson.email} />

                  <Field
                    label="Address"
                    value={individual.relatedPerson.address}
                    valueClassName="line-clamp-3"
                  />
                </DossierCard>
              ) : (
                <DossierCard title="Related Person / Emergency Contact" plain>
                  <p className="text-sm text-slate-500">No related person record on file.</p>
                </DossierCard>
              )}
            </div>
          )}

          {/* TAB 6: ACCOUNT INFORMATION */}
          {activeTab === 'account' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
              <DossierCard title="Investor ID Information (Regulator SECC)">
                <Field
                  label="Investor ID Number"
                  value={individual.investorIdInfo?.investorIdNumber}
                  valueClassName="font-mono"
                />
                <Field label="Securities Firm" value={individual.investorIdInfo?.securitiesFirm} />

                <Field
                  label="Customer Received By (CSO)"
                  value={individual.investorIdInfo?.customerReceivedBy}
                />
                <Field
                  label="Application Date"
                  value={individual.investorIdInfo?.applicationDate}
                  valueClassName="font-mono"
                />

                <Field
                  label="Date Sent to SECC"
                  value={individual.investorIdInfo?.dateSentToSECC}
                  valueClassName="font-mono"
                />
                <Field
                  label="Date Received from SECC"
                  value={individual.investorIdInfo?.dateReceivedFromSECC}
                  valueClassName="font-mono"
                />

                <Field label="Customer Status" value={individual.investorIdInfo?.customerStatus} />
                <Field
                  label="Investor ID Expired Date"
                  value={individual.investorIdInfo?.investorIdExpiredDate}
                  valueClassName="font-mono"
                />
              </DossierCard>

              <DossierCard title="Trading Account Details">
                <Field
                  label="Trading Account Number"
                  value={individual.tradingAccountInfo?.tradingAccountNumber}
                  valueClassName="font-mono"
                />
                <Field
                  label="Account Opening Date"
                  value={individual.tradingAccountInfo?.accountDate}
                  valueClassName="font-mono"
                />

                <Field
                  label="Account Checked By (SR)"
                  value={individual.tradingAccountInfo?.accountCheckedBy}
                />
                <Field
                  label="Account Approved By (Manager)"
                  value={individual.tradingAccountInfo?.accountApprovedBy}
                />

                <Field
                  label="Current Assigned SR"
                  value={individual.tradingAccountInfo?.currentAssignedSR}
                />
                <Field label="Phone Linked" value={individual.tradingAccountInfo?.phoneNumber} />

                <Field
                  label="Risk Category"
                  value={individual.riskRating || individual.riskCategory}
                  valueClassName="capitalize"
                />
                <Field
                  label="Total Liquid Capital"
                  value={`$${individual.totalDeposits.toLocaleString()}`}
                  valueClassName="font-mono"
                />
              </DossierCard>
            </div>
          )}

          {/* TAB 7: WORKFLOW & AUTHORIZATION HISTORY */}
          {activeTab === 'authorization' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
              {/* CARD 1: REGISTRATION TIMELINE */}
              <DossierCard title="Registration" plain>
                  {registrationHistory.length > 0 ? (
                    <ol>
                      {registrationHistory.map((item, idx) => (
                        <WorkflowTimelineRow
                          key={item.id || idx}
                          item={item}
                          isLast={idx === registrationHistory.length - 1}
                        />
                      ))}
                    </ol>
                  ) : (
                    <div className="py-10 flex flex-col items-center justify-center text-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                        <CheckCircle2 className="w-7 h-7" />
                      </div>
                      <p className="text-sm text-slate-500">No registration workflow records yet.</p>
                    </div>
                  )}
              </DossierCard>

              {/* CARD 2: ACCOUNT CLOSE TIMELINE */}
              <DossierCard title="Account Close" plain>
                  {hasCloseRequest ? (
                    <div className="space-y-5">
                      {/* Closure parameters */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                        <div>
                          <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">Close Date</span>
                          <div className="mt-1 text-sm text-slate-900 font-mono">
                            {individual.closeAccountInfo?.closeDate || <span className="text-slate-400">-</span>}
                          </div>
                        </div>
                        <div>
                          <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">Target Account</span>
                          <div className="mt-1 text-sm text-slate-900 font-mono">
                            {individual.closeAccountInfo?.account || individual.tradingAccountInfo?.tradingAccountNumber || <span className="text-slate-400">-</span>}
                          </div>
                        </div>
                        <div className="sm:col-span-2">
                          <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">Closure Reason</span>
                          <div className="mt-1 text-sm text-slate-900 break-words">
                            {individual.closeAccountInfo?.reason || <span className="text-slate-400">-</span>}
                          </div>
                        </div>
                      </div>

                      {/* Closure timeline */}
                      {accountCloseHistory.length > 0 && (
                        <ol className="pt-4 border-t border-slate-100">
                          {accountCloseHistory.map((item, idx) => (
                            <WorkflowTimelineRow
                              key={item.id || idx}
                              item={item}
                              isLast={idx === accountCloseHistory.length - 1}
                            />
                          ))}
                        </ol>
                      )}
                    </div>
                  ) : (
                    <div className="py-10 flex flex-col items-center justify-center text-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                        <User className="w-7 h-7" />
                      </div>
                      <p className="text-sm text-slate-500">This customer&apos;s account has not been closed.</p>
                    </div>
                  )}
              </DossierCard>
            </div>
          )}
        </div>

        {/* Footer with Authorization Buttons */}
        <div className="p-3.5 sm:p-4 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
          {/* Authorization Buttons Group (Reject, Resubmit, Approve) */}
          <div className="flex items-center gap-2.5 justify-end flex-wrap">
            {/* Reject Button */}
            <button
              id="btn-view-dialog-reject"
              type="button"
              onClick={() => handleOpenAuthDialog('reject')}
              className="h-[35px] px-3.5 text-xs font-semibold rounded-lg border border-rose-300 hover:border-rose-400 bg-white hover:bg-rose-50 text-rose-600 transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
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
              className="h-[35px] px-3.5 text-xs font-semibold rounded-lg border border-amber-300 hover:border-amber-400 bg-white hover:bg-amber-50 text-amber-700 transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
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
              className="h-[35px] px-4 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all inline-flex items-center gap-1.5 cursor-pointer"
              title="Approve & advance workflow"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Approve</span>
            </button>
          </div>
        </div>
      </div>

      {/* Authorization decision dialogs */}
      {showAuthDialog &&
        (authAction === 'authorize' ? (
          <ApproveDialogAuroraGlass
            customerName={individual.fullNameEN || `${individual.firstName} ${individual.lastName}`}
            customerId={individual.customerId || individual.id}
            nextStage={nextWorkflowStage}
            onCancel={() => setShowAuthDialog(false)}
            onConfirm={() => handleExecuteAuth()}
          />
        ) : (
          <DecisionDialogMatchedMark
            action={authAction}
            onCancel={() => setShowAuthDialog(false)}
            onConfirm={(reason) => handleExecuteAuth(reason)}
          />
        ))}

    </div>
  );
}
