'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  Individual, 
  SupportingDocument
} from '@/types';
import {
  X,
  Briefcase,
  LayoutDashboard,
  Users,
  IdCard,
  Landmark
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { IndividualOverviewSection } from '@/components/individual/IndividualOverviewSection';
import { DossierCard, Field } from '@/components/shared/DossierCard';
import { SupportingDocumentsSection } from '@/components/shared/SupportingDocumentsSection';

interface ViewIndividualDialogProps {
  individual: Individual | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToUpdate: (individual: Individual) => void;
  onNavigateToCustomer360: (individual: Individual) => void;
}

type DialogTab = 'overview' | 'identification' | 'employment' | 'family' | 'account';

export function ViewIndividualDialog({
  individual,
  isOpen,
  onClose,
  onNavigateToUpdate,
  onNavigateToCustomer360,
}: ViewIndividualDialogProps) {
  const [activeTab, setActiveTab] = useState<DialogTab>('overview');

  if (!isOpen || !individual) return null;

  const modalContainerClasses = () =>
    'bg-white/95 backdrop-blur-2xl border border-white/80 shadow-2xl shadow-blue-950/15 rounded-3xl';

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

  return (
    <div
      id="view-individual-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in"
    >
      <div
        id="view-individual-modal-container"
        className={cn(
          'w-full max-w-6xl xl:max-w-[1240px] max-h-[92vh] flex flex-col overflow-hidden text-slate-800 transition-all shadow-2xl',
          modalContainerClasses()
        )}
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
                  <span className="text-sm text-slate-500">{individual.fullNameKH}</span>
                )}
                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-xs font-semibold font-mono">
                  {individual.customerId || individual.id}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
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
          {/* TAB 1: OVERVIEW — status and contact first, full record below */}
          {activeTab === 'overview' && (
            <IndividualOverviewSection 
              individual={individual} 
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

                <Field label="Account Type" value={individual.banking?.savingAccount} />
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

                <Field label="Profile Status" value={individual.investorIdInfo?.customerStatus} />
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
        </div>
      </div>
    </div>
  );
}
